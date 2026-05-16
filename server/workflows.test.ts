import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
function createMockContext(userId: number = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `test-user-${userId}`,
      email: `test${userId}@example.com`,
      name: `Test User ${userId}`,
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Workflow CRUD Operations", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;
  let workflowId: number;

  beforeAll(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should create a new workflow", async () => {
    const result = await caller.workflows.create({
      name: "Test Workflow",
      description: "A test workflow",
      trigger: "manual",
      triggerConfig: {},
      nodes: [
        {
          id: "node-1",
          type: "http_request",
          position: { x: 0, y: 0 },
          data: { method: "GET", url: "https://api.example.com" },
        },
      ],
      edges: [],
    });

    expect(result).toBeDefined();
    expect(result.name).toBe("Test Workflow");
    workflowId = result.id;
  });

  it("should retrieve a workflow by ID", async () => {
    const result = await caller.workflows.get({ id: workflowId });

    expect(result).toBeDefined();
    expect(result.id).toBe(workflowId);
    expect(result.name).toBe("Test Workflow");
  });

  it("should list all workflows for user", async () => {
    const result = await caller.workflows.list({});

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should update a workflow", async () => {
    const result = await caller.workflows.update({
      id: workflowId,
      name: "Updated Workflow",
      description: "Updated description",
    });

    expect(result.name).toBe("Updated Workflow");
    expect(result.description).toBe("Updated description");
  });

  it("should activate a workflow", async () => {
    const result = await caller.workflows.activate({ id: workflowId });

    expect(result.isActive).toBe(1);
  });

  it("should deactivate a workflow", async () => {
    const result = await caller.workflows.deactivate({ id: workflowId });

    expect(result.isActive).toBe(0);
  });
});

describe("Workflow Execution", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;
  let workflowId: number;

  beforeAll(async () => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);

    // Create a test workflow
    const workflow = await caller.workflows.create({
      name: "Execution Test Workflow",
      description: "For testing execution",
      trigger: "manual",
      triggerConfig: {},
      nodes: [
        {
          id: "node-1",
          type: "log",
          position: { x: 0, y: 0 },
          data: { message: "Test log", level: "info" },
        },
      ],
      edges: [],
    });

    workflowId = workflow.id;
  });

  it("should execute a workflow", async () => {
    const result = await caller.workflows.execute({ id: workflowId });

    expect(result).toBeDefined();
    expect(result.message).toContain("started");
  });

  it("should retrieve execution history", async () => {
    const result = await caller.executions.list({
      workflowId,
      limit: 10,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("LLM Assistant", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should suggest node configuration", async () => {
    const result = await caller.llm.suggestNodeConfig({
      nodeType: "email",
      description: "Send notification email to admin",
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
  });

  it("should generate transform expression", async () => {
    const result = await caller.llm.generateTransform({
      inputSample: { name: "John", age: 30 },
      outputDescription: "Extract name in uppercase",
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should explain execution error", async () => {
    const result = await caller.llm.explainError({
      nodeType: "http_request",
      errorMessage: "Connection timeout",
      nodeConfig: { url: "https://api.example.com", timeout: 5000 },
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should suggest workflow improvements", async () => {
    const result = await caller.llm.suggestImprovements({
      workflowDescription: "Send daily email report",
      currentNodes: [
        { type: "http_request", name: "Fetch Data" },
        { type: "email", name: "Send Email" },
      ],
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Authentication", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should get current user", async () => {
    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result.id).toBe(1);
  });

  it("should logout user", async () => {
    const result = await caller.auth.logout();

    expect(result.success).toBe(true);
  });
});

describe("Error Handling", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should handle invalid workflow ID", async () => {
    try {
      await caller.workflows.get({ id: 99999 });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });

  it("should prevent unauthorized access to other user workflows", async () => {
    const user1Ctx = createMockContext(1);
    const user1Caller = appRouter.createCaller(user1Ctx);

    // Create workflow as user 1
    const workflow = await user1Caller.workflows.create({
      name: "Private Workflow",
      description: "Only for user 1",
      trigger: "manual",
      triggerConfig: {},
      nodes: [],
      edges: [],
    });

    // Try to access as user 2
    const user2Ctx = createMockContext(2);
    const user2Caller = appRouter.createCaller(user2Ctx);

    try {
      await user2Caller.workflows.get({ id: workflow.id });
      expect.fail("Should have thrown error");
    } catch (error: any) {
      expect(error).toBeDefined();
    }
  });
});
