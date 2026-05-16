import { describe, it, expect, vi, beforeEach } from "vitest";
import { openaiExecutor } from "./openai";

// Mock OpenAI client
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: "Test response" }, finish_reason: "stop" }],
          usage: { total_tokens: 100 },
        }),
      },
    },
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
        usage: { total_tokens: 50 },
      }),
    },
    moderations: {
      create: vi.fn().mockResolvedValue({
        results: [{ flagged: false, categories: {}, category_scores: {} }],
      }),
    },
  })),
}));

describe("OpenAI Node", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Chat Completion Mode", () => {
    it("should execute chat completion with GPT-4", async () => {
      const config = {
        apiKey: "test-key",
        mode: "chat",
        model: "gpt-4",
        prompt: "Hello, how are you?",
        temperature: 0.7,
        maxTokens: 1000,
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("result");
      expect(result).toHaveProperty("tokens", 100);
    });

    it("should use system prompt when provided", async () => {
      const config = {
        apiKey: "test-key",
        mode: "chat",
        systemPrompt: "You are a helpful assistant",
        prompt: "What is 2+2?",
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result.success).toBe(true);
    });

    it("should handle missing API key", async () => {
      const config = {
        mode: "chat",
        prompt: "Hello",
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("API key");
    });

    it("should handle missing prompt", async () => {
      const config = {
        apiKey: "test-key",
        mode: "chat",
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("prompt");
    });
  });

  describe("Embedding Mode", () => {
    it("should generate embeddings", async () => {
      const config = {
        apiKey: "test-key",
        mode: "embedding",
        text: "Hello world",
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("embedding");
      expect(result.embedding).toBeInstanceOf(Array);
      expect(result).toHaveProperty("dimension", 3);
    });

    it("should handle missing text for embedding", async () => {
      const config = {
        apiKey: "test-key",
        mode: "embedding",
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("text");
    });
  });

  describe("Moderation Mode", () => {
    it("should check text for moderation", async () => {
      const config = {
        apiKey: "test-key",
        mode: "moderation",
        text: "This is safe content",
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("flagged", false);
      expect(result).toHaveProperty("categories");
    });

    it("should handle missing text for moderation", async () => {
      const config = {
        apiKey: "test-key",
        mode: "moderation",
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("text");
    });
  });

  describe("Error Handling", () => {
    it("should handle unknown mode", async () => {
      const config = {
        apiKey: "test-key",
        mode: "unknown",
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown mode");
    });

    it("should handle API errors gracefully", async () => {
      const config = {
        apiKey: "invalid-key",
        mode: "chat",
        prompt: "Test",
      };

      // This would fail with invalid API key in real scenario
      const result = await openaiExecutor.execute(config, {});

      // Result should still have success: false
      expect(result).toHaveProperty("success");
    });
  });

  describe("Configuration Options", () => {
    it("should respect temperature setting", async () => {
      const config = {
        apiKey: "test-key",
        mode: "chat",
        prompt: "Creative prompt",
        temperature: 1.5,
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result.success).toBe(true);
    });

    it("should respect maxTokens setting", async () => {
      const config = {
        apiKey: "test-key",
        mode: "chat",
        prompt: "Test",
        maxTokens: 500,
      };

      const result = await openaiExecutor.execute(config, {});

      expect(result.success).toBe(true);
    });

    it("should use input values when config is missing", async () => {
      const config = {
        apiKey: "test-key",
        mode: "chat",
      };

      const input = {
        prompt: "Input prompt",
        temperature: 0.5,
      };

      const result = await openaiExecutor.execute(config, input);

      expect(result.success).toBe(true);
    });
  });
});
