import { AiCompletionRequest, AiProvider, wrapUntrustedSource } from "./provider";

/**
 * Each concrete provider only implements transport (how to call the
 * vendor API). Prompt construction and validation stay shared, in
 * lib/ai/tasks.ts, so behavior is consistent across providers.
 */

abstract class BaseHttpProvider implements AiProvider {
  abstract readonly id: string;
  protected abstract apiKey: string | undefined;
  get isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  abstract complete(request: AiCompletionRequest): Promise<string>;

  protected buildUserContent(request: AiCompletionRequest): string {
    return request.untrustedSourceText
      ? `${request.userPrompt}\n\n${wrapUntrustedSource(request.untrustedSourceText)}`
      : request.userPrompt;
  }

  // The task-specific helpers all funnel through complete(); see
  // lib/ai/tasks.ts for the shared prompt templates that call them.
  async analyzeSource(sourceText: string, sourceUrl: string): Promise<unknown> {
    throw new Error("Use lib/ai/tasks.ts helpers, not the provider directly.");
  }
  async extractClaims(): Promise<unknown> {
    throw new Error("Use lib/ai/tasks.ts helpers, not the provider directly.");
  }
  async classifyOccupation(): Promise<unknown> {
    throw new Error("Use lib/ai/tasks.ts helpers, not the provider directly.");
  }
  async analyzeTask(): Promise<unknown> {
    throw new Error("Use lib/ai/tasks.ts helpers, not the provider directly.");
  }
  async summarizeEvidence(): Promise<unknown> {
    throw new Error("Use lib/ai/tasks.ts helpers, not the provider directly.");
  }
  async generateCareerInsights(): Promise<unknown> {
    throw new Error("Use lib/ai/tasks.ts helpers, not the provider directly.");
  }
  async generateRecommendations(): Promise<unknown> {
    throw new Error("Use lib/ai/tasks.ts helpers, not the provider directly.");
  }
}

export class AnthropicProvider extends BaseHttpProvider {
  readonly id = "anthropic";
  protected apiKey = process.env.ANTHROPIC_API_KEY;

  async complete(request: AiCompletionRequest): Promise<string> {
    if (!this.apiKey) throw new Error("Anthropic provider not configured");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: request.maxTokens ?? 1024,
        system: request.systemPrompt,
        messages: [{ role: "user", content: this.buildUserContent(request) }]
      })
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
    const data = await res.json();
    const textBlock = (data.content ?? []).find((b: { type: string }) => b.type === "text");
    return textBlock?.text ?? "";
  }
}

export class OpenAiCompatibleProvider extends BaseHttpProvider {
  readonly id: string;
  protected apiKey: string | undefined;
  private baseUrl: string;
  private model: string;

  constructor(id: string, apiKeyEnv: string, baseUrl: string, model: string) {
    super();
    this.id = id;
    this.apiKey = process.env[apiKeyEnv];
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async complete(request: AiCompletionRequest): Promise<string> {
    if (!this.apiKey) throw new Error(`${this.id} provider not configured`);
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: request.maxTokens ?? 1024,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: this.buildUserContent(request) }
        ]
      })
    });
    if (!res.ok) throw new Error(`${this.id} API error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}

export function buildProviderRegistry(): AiProvider[] {
  return [
    new AnthropicProvider(),
    new OpenAiCompatibleProvider("openai", "OPENAI_API_KEY", "https://api.openai.com/v1", "gpt-4.1-mini"),
    new OpenAiCompatibleProvider(
      "google",
      "GOOGLE_AI_API_KEY",
      "https://generativelanguage.googleapis.com/v1beta/openai",
      "gemini-2.0-flash"
    ),
    new OpenAiCompatibleProvider("openrouter", "OPENROUTER_API_KEY", "https://openrouter.ai/api/v1", "meta-llama/llama-3.3-70b-instruct:free"),
    new OpenAiCompatibleProvider("groq", "GROQ_API_KEY", "https://api.groq.com/openai/v1", "llama-3.3-70b-versatile")
  ];
}

/** Returns the first configured provider in AI_PROVIDER_PRIORITY order,
 *  or null if nothing is configured — callers must handle null by
 *  disabling the AI-assisted feature, never by fabricating output. */
export function getActiveProvider(): AiProvider | null {
  const priority = (process.env.AI_PROVIDER_PRIORITY ?? "anthropic,openai,google,openrouter,groq")
    .split(",")
    .map((s) => s.trim());
  const registry = buildProviderRegistry();
  for (const id of priority) {
    const provider = registry.find((p) => p.id === id);
    if (provider?.isConfigured) return provider;
  }
  return null;
}
