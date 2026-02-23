import { getSession } from "@/lib/auth";
import { askAIStream } from "@/lib/ai";
import { getDb } from "@/lib/db";

export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Nicht angemeldet" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { systemPrompt, userMessage, useKnowledge, model, useWebSearch } = await req.json();
    if (!systemPrompt || !userMessage) {
      return new Response(JSON.stringify({ error: "systemPrompt und userMessage erforderlich" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let knowledgeBase = "";
    if (useKnowledge !== false) {
      const db = await getDb();
      const result = db.exec(
        "SELECT title, content FROM knowledge_entries WHERE user_id = ?",
        [session.userId]
      );
      if (result.length && result[0].values.length) {
        knowledgeBase = result[0].values
          .map((row: unknown[]) => `[${row[0]}]\n${row[1]}`)
          .join("\n\n---\n\n");
      }
    }

    // Hole Streaming-Response von Anthropic
    const anthropicResponse = await askAIStream(
      systemPrompt,
      userMessage,
      knowledgeBase,
      model || undefined,
      useWebSearch !== undefined ? useWebSearch : false
    );

    // Transformiere den Anthropic SSE-Stream in unseren eigenen Stream
    // der nur die Text-Deltas weitergibt
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = anthropicResponse.body?.getReader();
        if (!reader) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Kein Stream verfügbar" })}\n\n`));
          controller.close();
          return;
        }

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;

              try {
                const event = JSON.parse(data);

                // Text-Delta extrahieren
                if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                  );
                }
              } catch {
                // Ungültiges JSON ignorieren
              }
            }
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Stream-Fehler";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "KI-Fehler";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
