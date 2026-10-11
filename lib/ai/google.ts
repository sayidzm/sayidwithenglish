import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AiErrorCode =
  | "unavailable"
  | "invalid_key"
  | "forbidden"
  | "model_not_found"
  | "rate_limit"
  | "service_unavailable"
  | "network"
  | "invalid_response";
export class AiError extends Error {
  constructor(public readonly code: AiErrorCode) { super(code); }
}

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
};

type ProviderFailure = { status: number; reason?: string; message?: string };

function configuration() {
  const provider = process.env.AI_PROVIDER;
  const model = process.env.AI_MODEL;
  const key = process.env.AI_API_KEY;
  if (provider !== "google" || !model || !key) throw new AiError("unavailable");
  return { model, key };
}

// Development-only diagnostic. Never logs the key, headers, or secret env
// values: only HTTP status, provider code/message, model, and stage.
function diagnose(stage: string, model: string, failure?: ProviderFailure) {
  if (process.env.NODE_ENV === "production") return;
  console.error(
    "[ai][gemini]",
    stage,
    JSON.stringify({
      model,
      status: failure?.status ?? null,
      reason: failure?.reason ?? null,
      message: (failure?.message ?? "").slice(0, 300),
    }),
  );
}

function parseFailure(status: number, raw: string): ProviderFailure {
  try {
    const body = JSON.parse(raw) as {
      error?: { message?: string; details?: { reason?: string }[] };
    };
    const details = body.error?.details;
    const reason = Array.isArray(details)
      ? details.map((detail) => detail?.reason).find((item): item is string => typeof item === "string")
      : undefined;
    return { status, reason, message: body.error?.message };
  } catch {
    return { status };
  }
}

function toAiError(model: string, failure: ProviderFailure): AiError {
  diagnose("provider-error", model, failure);
  if (failure.status === 429) return new AiError("rate_limit");
  if (failure.status >= 500) return new AiError("service_unavailable");
  // Google reports an invalid key as 400 + API_KEY_INVALID (not 401).
  if (failure.reason === "API_KEY_INVALID" || failure.status === 401)
    return new AiError("invalid_key");
  if (failure.status === 403) return new AiError("forbidden");
  if (failure.status === 404) return new AiError("model_not_found");
  return new AiError("unavailable");
}

// Gemini's responseJsonSchema supports a subset of JSON Schema: type unions
// such as ["string", "null"] are rejected, the equivalent is nullable: true.
// This only adapts the wire format; runtime validation stays strict.
function toGeminiSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toGeminiSchema);
  if (typeof value !== "object" || value === null) return value;
  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (key === "type" && Array.isArray(entry)) {
      const options = entry.map(String);
      output.type = options.find((option) => option !== "null") ?? "string";
      if (options.includes("null")) output.nullable = true;
      continue;
    }
    output[key] = toGeminiSchema(entry);
  }
  return output;
}

export async function generateJson(
  userId: string, requestType: "vocabulary" | "tutor",
  system: string, prompt: string, schema: object,
): Promise<unknown> {
  const { model, key } = configuration();
  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: toGeminiSchema(schema),
            temperature: 0.2,
            maxOutputTokens: requestType === "vocabulary" ? 4096 : 800,
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(45_000),
      },
    );
  } catch {
    diagnose("network-error", model);
    throw new AiError("network");
  }
  if (!response.ok) {
    const raw = await response.text().catch(() => "");
    throw toAiError(model, parseFailure(response.status, raw));
  }
  let body: GeminiResponse;
  try { body = await response.json() as GeminiResponse; }
  catch { throw new AiError("invalid_response"); }
  const result = body.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
  if (!result) throw new AiError("invalid_response");
  const usage = body.usageMetadata;
  if (usage) {
    const client = await createClient();
    // Usage only: no prompt, response, key, or personal content is persisted.
    await client.from("ai_usage").insert({
      user_id: userId, model, request_type: requestType,
      input_tokens: usage.promptTokenCount ?? null,
      output_tokens: usage.candidatesTokenCount ?? null,
    });
  }
  try { return JSON.parse(result) as unknown; }
  catch { throw new AiError("invalid_response"); }
}
