export async function askAI(systemPrompt: string, userMessage: string, knowledgeBase: string = "") {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nicht konfiguriert");

  const system = knowledgeBase
    ? `${systemPrompt}\n\n<expertenwissen>\n${knowledgeBase}\n</expertenwissen>`
    : systemPrompt;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system,
      messages: [{ role: "user", content: userMessage }],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API-Fehler: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.content
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");
}

export async function askAIChat(systemPrompt: string, messages: { role: string; content: string }[], knowledgeBase: string = "") {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nicht konfiguriert");

  const system = knowledgeBase
    ? `${systemPrompt}\n\n<expertenwissen>\n${knowledgeBase}\n</expertenwissen>`
    : systemPrompt;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API-Fehler: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.content
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");
}
