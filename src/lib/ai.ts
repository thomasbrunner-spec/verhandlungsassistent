export const AVAILABLE_MODELS = [
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", desc: "Schnell & günstig (kurze Ausgaben)" },
  { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5", desc: "Leistungsstark, lange Ausgaben möglich" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", desc: "Neuestes Modell, sehr leistungsstark (empfohlen)" },
];

export const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";

// Maximale Output-Tokens pro Modell
function getMaxTokens(model: string): number {
  if (model.includes("haiku")) return 8192;
  // Sonnet 4.5 und 4.6 unterstützen bis 16384 Output-Tokens
  return 16384;
}

const MAX_RETRIES = 3;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    // 4 Minuten Timeout pro Versuch (Sonnet + Web-Suche + lange Ausgaben brauchen Zeit)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 240000);
    let response: Response;
    try {
      response = await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 429) {
      // Rate limited - check retry-after header or use exponential backoff
      const retryAfter = response.headers.get("retry-after");
      const waitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : Math.min(1000 * Math.pow(2, attempt), 30000); // 1s, 2s, 4s... max 30s

      if (attempt < retries) {
        console.log(`Rate limited (429). Warte ${waitMs / 1000}s vor Versuch ${attempt + 2}/${retries + 1}...`);
        await sleep(waitMs);
        continue;
      }
    }

    if (response.status === 529) {
      // API overloaded
      const waitMs = Math.min(2000 * Math.pow(2, attempt), 30000);
      if (attempt < retries) {
        console.log(`API überlastet (529). Warte ${waitMs / 1000}s vor Versuch ${attempt + 2}/${retries + 1}...`);
        await sleep(waitMs);
        continue;
      }
    }

    return response;
  }

  throw new Error("Maximale Anzahl an Wiederholungsversuchen erreicht.");
}

export async function askAI(systemPrompt: string, userMessage: string, knowledgeBase: string = "", model: string = DEFAULT_MODEL) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nicht konfiguriert");

  const system = knowledgeBase
    ? `${systemPrompt}\n\n<expertenwissen>\n${knowledgeBase}\n</expertenwissen>`
    : systemPrompt;

  const maxTokens = getMaxTokens(model);

  const response = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userMessage }],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) {
      throw new Error("Rate-Limit erreicht. Bitte warten Sie einen Moment und versuchen Sie es erneut.");
    }
    throw new Error(`API-Fehler: ${response.status} - ${err}`);
  }

  const data = await response.json();

  // Prüfe ob Output abgeschnitten wurde
  if (data.stop_reason === "max_tokens") {
    console.warn(`Output wurde bei ${maxTokens} Tokens abgeschnitten (Modell: ${model}). Ein stärkeres Modell verwenden.`);
  }

  return data.content
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");
}

export async function askAIChat(systemPrompt: string, messages: { role: string; content: string }[], knowledgeBase: string = "", model: string = DEFAULT_MODEL) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY nicht konfiguriert");

  const system = knowledgeBase
    ? `${systemPrompt}\n\n<expertenwissen>\n${knowledgeBase}\n</expertenwissen>`
    : systemPrompt;

  const maxTokens = getMaxTokens(model);

  const response = await fetchWithRetry("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) {
      throw new Error("Rate-Limit erreicht. Bitte warten Sie einen Moment und versuchen Sie es erneut.");
    }
    throw new Error(`API-Fehler: ${response.status} - ${err}`);
  }

  const data = await response.json();

  if (data.stop_reason === "max_tokens") {
    console.warn(`Output wurde bei ${maxTokens} Tokens abgeschnitten (Modell: ${model}). Ein stärkeres Modell verwenden.`);
  }

  return data.content
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n");
}
