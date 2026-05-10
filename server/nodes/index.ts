/**
 * Node System - Base node definitions and registry
 */

export interface NodeConfig {
  id: string;
  type: string;
  label: string;
  category: "trigger" | "action" | "logic" | "data" | "integration";
  description: string;
  icon?: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  config: Record<string, NodeConfigField>;
}

export interface NodeInput {
  id: string;
  label: string;
  type: "string" | "number" | "boolean" | "object" | "array" | "any";
  required?: boolean;
}

export interface NodeOutput {
  id: string;
  label: string;
  type: "string" | "number" | "boolean" | "object" | "array" | "any";
}

export interface NodeConfigField {
  type: "text" | "number" | "boolean" | "select" | "textarea" | "password";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  default?: unknown;
  help?: string;
}

export interface NodeExecutor {
  execute(config: Record<string, unknown>, inputs: Record<string, unknown>): Promise<unknown>;
}

// Node Registry
const nodeRegistry = new Map<string, NodeConfig>();
const executorRegistry = new Map<string, NodeExecutor>();

export function registerNode(config: NodeConfig, executor: NodeExecutor) {
  nodeRegistry.set(config.type, config);
  executorRegistry.set(config.type, executor);
}

export function getNodeConfig(type: string): NodeConfig | undefined {
  return nodeRegistry.get(type);
}

export function getNodeExecutor(type: string): NodeExecutor | undefined {
  return executorRegistry.get(type);
}

export function getAllNodes(): NodeConfig[] {
  return Array.from(nodeRegistry.values());
}

export function getNodesByCategory(category: string): NodeConfig[] {
  return Array.from(nodeRegistry.values()).filter(n => n.category === category);
}

// Built-in Nodes

// Trigger: Manual
registerNode(
  {
    id: "trigger-manual",
    type: "trigger-manual",
    label: "Manual Trigger",
    category: "trigger",
    description: "Start workflow manually",
    inputs: [],
    outputs: [{ id: "output", label: "Output", type: "object" }],
    config: {},
  },
  {
    async execute() {
      return { timestamp: new Date().toISOString() };
    },
  }
);

// Trigger: Webhook
registerNode(
  {
    id: "trigger-webhook",
    type: "trigger-webhook",
    label: "Webhook Trigger",
    category: "trigger",
    description: "Trigger workflow via HTTP webhook",
    inputs: [],
    outputs: [{ id: "output", label: "Payload", type: "object" }],
    config: {
      method: { type: "select", label: "Method", options: [{ label: "POST", value: "POST" }], default: "POST" },
    },
  },
  {
    async execute(config, inputs) {
      return inputs;
    },
  }
);

// Trigger: Cron/Schedule
registerNode(
  {
    id: "trigger-cron",
    type: "trigger-cron",
    label: "Schedule Trigger",
    category: "trigger",
    description: "Trigger workflow on schedule (cron expression)",
    inputs: [],
    outputs: [{ id: "output", label: "Output", type: "object" }],
    config: {
      cronExpression: {
        type: "text",
        label: "Cron Expression",
        placeholder: "0 0 * * * (every day at midnight)",
        required: true,
        help: "Use standard cron syntax",
      },
    },
  },
  {
    async execute() {
      return { timestamp: new Date().toISOString() };
    },
  }
);

// Action: HTTP Request
registerNode(
  {
    id: "action-http",
    type: "action-http",
    label: "HTTP Request",
    category: "action",
    description: "Make HTTP requests to external APIs",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Response", type: "object" }],
    config: {
      url: { type: "text", label: "URL", required: true, placeholder: "https://api.example.com/endpoint" },
      method: {
        type: "select",
        label: "Method",
        options: [
          { label: "GET", value: "GET" },
          { label: "POST", value: "POST" },
          { label: "PUT", value: "PUT" },
          { label: "DELETE", value: "DELETE" },
          { label: "PATCH", value: "PATCH" },
        ],
        default: "GET",
      },
      headers: { type: "textarea", label: "Headers (JSON)", placeholder: '{"Content-Type": "application/json"}' },
      body: { type: "textarea", label: "Body (JSON)" },
      timeout: { type: "number", label: "Timeout (ms)", default: 30000 },
    },
  },
  {
    async execute(config) {
      const url = String(config.url);
      const method = String(config.method || "GET");
      const timeout = Number(config.timeout || 30000);

      try {
        const headers = config.headers ? JSON.parse(String(config.headers)) : {};
        const body = config.body ? JSON.parse(String(config.body)) : undefined;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        return { status: response.status, data };
      } catch (error) {
        throw new Error(`HTTP request failed: ${String(error)}`);
      }
    },
  }
);

// Action: Email
registerNode(
  {
    id: "action-email",
    type: "action-email",
    label: "Send Email",
    category: "action",
    description: "Send email notifications",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Result", type: "object" }],
    config: {
      to: { type: "text", label: "To", required: true, placeholder: "recipient@example.com" },
      subject: { type: "text", label: "Subject", required: true },
      body: { type: "textarea", label: "Body (HTML)", required: true },
      credentialId: { type: "text", label: "Credential ID (SMTP)" },
    },
  },
  {
    async execute(config) {
      // Placeholder - actual SMTP implementation in production
      return { success: true, message: "Email queued for sending" };
    },
  }
);

// Logic: Conditional
registerNode(
  {
    id: "logic-conditional",
    type: "logic-conditional",
    label: "Conditional (If/Else)",
    category: "logic",
    description: "Branch workflow based on condition",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [
      { id: "true", label: "True", type: "object" },
      { id: "false", label: "False", type: "object" },
    ],
    config: {
      condition: {
        type: "textarea",
        label: "Condition (JavaScript)",
        required: true,
        placeholder: "input.status === 'success'",
        help: "Return boolean value",
      },
    },
  },
  {
    async execute(config, inputs) {
      // Condition evaluation happens in executor
      return inputs;
    },
  }
);

// Data: Transform
registerNode(
  {
    id: "data-transform",
    type: "data-transform",
    label: "Transform Data",
    category: "data",
    description: "Transform data using JavaScript or JSON mapping",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Output", type: "object" }],
    config: {
      transformation: {
        type: "textarea",
        label: "Transformation (JavaScript)",
        required: true,
        placeholder: "({ name, email }) => ({ user: name, contact: email })",
        help: "Function that receives input and returns transformed data",
      },
    },
  },
  {
    async execute(config, inputs) {
      const transformation = String(config.transformation);
      try {
        const func = new Function("input", `return (${transformation})(input)`);
        return func(inputs);
      } catch (error) {
        throw new Error(`Transformation failed: ${String(error)}`);
      }
    },
  }
);

// Data: Log
registerNode(
  {
    id: "data-log",
    type: "data-log",
    label: "Log",
    category: "data",
    description: "Log data to execution history",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Output", type: "object" }],
    config: {
      message: { type: "text", label: "Message", placeholder: "Log message" },
      level: {
        type: "select",
        label: "Level",
        options: [
          { label: "Info", value: "info" },
          { label: "Warning", value: "warning" },
          { label: "Error", value: "error" },
        ],
        default: "info",
      },
    },
  },
  {
    async execute(config, inputs) {
      console.log(`[${String(config.level).toUpperCase()}] ${String(config.message)}`, inputs);
      return inputs;
    },
  }
);
