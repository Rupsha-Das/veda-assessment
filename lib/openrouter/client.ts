const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const OPENROUTER_MODEL = "google/gemini-2.5-flash-lite";

export const OPENROUTER_PLUGINS = [
  { id: "response-healing" },
  {
    id: "file-parser",
    pdf: { engine: "cloudflare-ai" },
  },
] as const;

type ChatMessage = {
  role: "system" | "user";
  content: string | Array<Record<string, unknown>>;
};

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

export async function openrouterJson<T>({
  instructions,
  input,
  schema,
}: {
  instructions: string;
  input: string | Array<Record<string, unknown>>;
  schema: Record<string, unknown>;
}): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OpenRouter API key is not configured.");

  const messages: ChatMessage[] = [
    { role: "system", content: instructions },
    { role: "user", content: input },
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Veda Assessment",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      plugins: OPENROUTER_PLUGINS,
      response_format: {
        type: "json_schema",
        json_schema: { name: "veda_extraction", strict: true, schema },
      },
      temperature: 0,
    }),
  });

  const body = (await response.json()) as OpenRouterResponse;
  if (!response.ok) {
    throw new Error(body.error?.message ?? `OpenRouter request failed (${response.status}).`);
  }

  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty structured output.");

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error("OpenRouter returned invalid structured output.");
  }
}
