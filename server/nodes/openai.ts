/**
 * OpenAI Node - Integração com GPT-4, embeddings e fine-tuning
 */

import OpenAI from "openai";

export const openaiNodeConfig = {
  id: "openai",
  name: "OpenAI",
  description: "Integração com OpenAI para GPT-4, embeddings e análise de texto",
  category: "ai",
  icon: "brain",
  inputs: {
    apiKey: { type: "string", required: true, sensitive: true },
    mode: { type: "string", required: true, enum: ["chat", "embedding", "moderation"] },
    prompt: { type: "string", required: false },
    messages: { type: "array", required: false },
    model: { type: "string", required: false, default: "gpt-4" },
    temperature: { type: "number", required: false, default: 0.7, min: 0, max: 2 },
    maxTokens: { type: "number", required: false, default: 1000 },
    topP: { type: "number", required: false, default: 1, min: 0, max: 1 },
    frequencyPenalty: { type: "number", required: false, default: 0, min: -2, max: 2 },
    presencePenalty: { type: "number", required: false, default: 0, min: -2, max: 2 },
    systemPrompt: { type: "string", required: false },
    text: { type: "string", required: false },
  },
  outputs: {
    success: { type: "boolean" },
    result: { type: "string" },
    embedding: { type: "array" },
    tokens: { type: "number" },
    error: { type: "string" },
  },
};

export const openaiExecutor = {
  async execute(config: any, input: any) {
    try {
      const apiKey = config.apiKey || input.apiKey;
      if (!apiKey) {
        throw new Error("OpenAI API key is required");
      }

      const client = new OpenAI({ apiKey });
      const mode = config.mode || input.mode || "chat";

      // Chat Completion Mode
      if (mode === "chat") {
        return await executeChatCompletion(client, config, input);
      }

      // Embedding Mode
      if (mode === "embedding") {
        return await executeEmbedding(client, config, input);
      }

      // Moderation Mode
      if (mode === "moderation") {
        return await executeModeration(client, config, input);
      }

      throw new Error(`Unknown mode: ${mode}`);
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        result: null,
      };
    }
  },
};

/**
 * Execute chat completion with GPT-4
 */
async function executeChatCompletion(client: OpenAI, config: any, input: any) {
  const model = config.model || input.model || "gpt-4";
  const temperature = config.temperature ?? input.temperature ?? 0.7;
  const maxTokens = config.maxTokens || input.maxTokens || 1000;
  const topP = config.topP ?? input.topP ?? 1;
  const frequencyPenalty = config.frequencyPenalty ?? input.frequencyPenalty ?? 0;
  const presencePenalty = config.presencePenalty ?? input.presencePenalty ?? 0;

  // Build messages array
  let messages: any[] = [];

  // Add system prompt if provided
  if (config.systemPrompt || input.systemPrompt) {
    messages.push({
      role: "system",
      content: config.systemPrompt || input.systemPrompt,
    });
  }

  // Add messages from input
  if (input.messages && Array.isArray(input.messages)) {
    messages = messages.concat(input.messages);
  } else if (config.prompt || input.prompt) {
    // Or use simple prompt
    messages.push({
      role: "user",
      content: config.prompt || input.prompt,
    });
  } else {
    throw new Error("Either 'prompt' or 'messages' is required for chat mode");
  }

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
    top_p: topP,
    frequency_penalty: frequencyPenalty,
    presence_penalty: presencePenalty,
  });

  const content = response.choices[0]?.message?.content || "";
  const tokens = response.usage?.total_tokens || 0;

  return {
    success: true,
    result: content,
    tokens,
    model,
    finishReason: response.choices[0]?.finish_reason,
  };
}

/**
 * Execute embedding generation
 */
async function executeEmbedding(client: OpenAI, config: any, input: any) {
  const text = config.text || input.text;
  if (!text) {
    throw new Error("'text' is required for embedding mode");
  }

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  const embedding = response.data[0]?.embedding || [];
  const tokens = response.usage?.total_tokens || 0;

  return {
    success: true,
    embedding,
    tokens,
    dimension: embedding.length,
  };
}

/**
 * Execute moderation check
 */
async function executeModeration(client: OpenAI, config: any, input: any) {
  const text = config.text || input.text;
  if (!text) {
    throw new Error("'text' is required for moderation mode");
  }

  const response = await client.moderations.create({
    input: text,
  });

  const result = response.results[0];

  return {
    success: true,
    flagged: result?.flagged || false,
    categories: result?.categories || {},
    scores: result?.category_scores || {},
  };
}

/**
 * Helper to format messages for display
 */
export function formatOpenAIResponse(response: any): string {
  if (response.error) {
    return `❌ Error: ${response.error}`;
  }

  if (response.result) {
    return response.result;
  }

  if (response.embedding) {
    return `Embedding generated: ${response.dimension} dimensions`;
  }

  if (response.flagged !== undefined) {
    return `Moderation: ${response.flagged ? "⚠️ Flagged" : "✅ OK"}`;
  }

  return JSON.stringify(response, null, 2);
}
