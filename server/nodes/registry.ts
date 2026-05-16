/**
 * Comprehensive Node Registry for FlowForge
 * Defines all available nodes with metadata, categories, and configuration
 */

import { Webhook, Zap, GitBranch, RefreshCw, MessageSquare, Mail, Database, Send, Code, Clock, Square, Cpu, Smartphone, Lightbulb, FileText, BarChart3, Search, Logs } from "lucide-react";

export type NodeCategory = "triggers" | "actions" | "logic" | "data" | "integrations" | "iot" | "advanced";

export interface NodeMetadata {
  id: string;
  label: string;
  description: string;
  category: NodeCategory;
  icon: any;
  color: string;
  inputs: { name: string; type: string }[];
  outputs: { name: string; type: string }[];
  config: Record<string, any>;
}

export const nodeRegistry: Record<string, NodeMetadata> = {
  // ============ TRIGGERS ============
  webhook: {
    id: "webhook",
    label: "Webhook",
    description: "Trigger workflow via HTTP webhook",
    category: "triggers",
    icon: Zap,
    color: "bg-green-100 border-green-300",
    inputs: [],
    outputs: [{ name: "data", type: "object" }],
    config: {
      method: "POST",
      path: "/webhook",
    },
  },

  schedule: {
    id: "schedule",
    label: "Schedule",
    description: "Trigger workflow on a schedule (cron)",
    category: "triggers",
    icon: Clock,
    color: "bg-green-100 border-green-300",
    inputs: [],
    outputs: [{ name: "timestamp", type: "number" }],
    config: {
      cronExpression: "0 0 * * *",
      timezone: "UTC",
    },
  },

  // ============ ACTIONS ============
  httpRequest: {
    id: "httpRequest",
    label: "HTTP Request",
    description: "Make HTTP requests to external APIs",
    category: "actions",
    icon: Zap,
    color: "bg-blue-100 border-blue-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "response", type: "object" }],
    config: {
      url: "",
      method: "GET",
      headers: {},
      body: null,
    },
  },

  sendEmail: {
    id: "sendEmail",
    label: "Send Email",
    description: "Send emails via SMTP",
    category: "actions",
    icon: Mail,
    color: "bg-blue-100 border-blue-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "result", type: "object" }],
    config: {
      to: "",
      subject: "",
      body: "",
      from: "noreply@flowforge.app",
    },
  },

  pdfGenerator: {
    id: "pdfGenerator",
    label: "PDF Generator",
    description: "Convert HTML to PDF using Puppeteer",
    category: "actions",
    icon: FileText,
    color: "bg-red-100 border-red-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "result", type: "object" }],
    config: {
      html: "",
      format: "A4",
      landscape: false,
      margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
    },
  },

  sendTelegram: {
    id: "sendTelegram",
    label: "Send Telegram",
    description: "Send messages via Telegram Bot",
    category: "actions",
    icon: Send,
    color: "bg-blue-100 border-blue-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "result", type: "object" }],
    config: {
      botToken: "",
      chatId: "",
      message: "",
    },
  },

  log: {
    id: "log",
    label: "Log",
    description: "Log data to execution history",
    category: "actions",
    icon: Square,
    color: "bg-blue-100 border-blue-300",
    inputs: [{ name: "input", type: "any" }],
    outputs: [{ name: "input", type: "any" }],
    config: {
      level: "info",
      message: "",
    },
  },

  // ============ LOGIC ============
  conditional: {
    id: "conditional",
    label: "Conditional (If/Else)",
    description: "Branch workflow based on conditions",
    category: "logic",
    icon: GitBranch,
    color: "bg-purple-100 border-purple-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [
      { name: "true", type: "object" },
      { name: "false", type: "object" },
    ],
    config: {
      condition: "input.status === 'success'",
    },
  },

  switch: {
    id: "switch",
    label: "Switch",
    description: "Route based on multiple conditions",
    category: "logic",
    icon: GitBranch,
    color: "bg-purple-100 border-purple-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [
      { name: "case1", type: "object" },
      { name: "case2", type: "object" },
      { name: "default", type: "object" },
    ],
    config: {
      cases: [
        { condition: "input.type === 'A'", output: "case1" },
        { condition: "input.type === 'B'", output: "case2" },
      ],
    },
  },

  // ============ DATA ============
  transform: {
    id: "transform",
    label: "Transform",
    description: "Transform data using JavaScript/JSON",
    category: "data",
    icon: RefreshCw,
    color: "bg-orange-100 border-orange-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "output", type: "object" }],
    config: {
      expression: "return { ...input, processed: true };",
    },
  },

  merge: {
    id: "merge",
    label: "Merge",
    description: "Merge multiple inputs into one",
    category: "data",
    icon: RefreshCw,
    color: "bg-orange-100 border-orange-300",
    inputs: [
      { name: "input1", type: "object" },
      { name: "input2", type: "object" },
    ],
    outputs: [{ name: "merged", type: "object" }],
    config: {
      strategy: "deep",
    },
  },

  split: {
    id: "split",
    label: "Split",
    description: "Split array into individual items",
    category: "data",
    icon: RefreshCw,
    color: "bg-orange-100 border-orange-300",
    inputs: [{ name: "input", type: "array" }],
    outputs: [{ name: "item", type: "object" }],
    config: {
      path: "items",
    },
  },

  // ============ INTEGRATIONS ============
  openai: {
    id: "openai",
    label: "OpenAI",
    description: "Integrate with OpenAI GPT models",
    category: "integrations",
    icon: Lightbulb,
    color: "bg-purple-100 border-purple-400",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "result", type: "object" }],
    config: {
      apiKey: "",
      mode: "chat",
      model: "gpt-4",
      prompt: "",
      temperature: 0.7,
    },
  },

  database: {
    id: "database",
    label: "Database",
    description: "Query or update database",
    category: "integrations",
    icon: Database,
    color: "bg-indigo-100 border-indigo-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "result", type: "object" }],
    config: {
      operation: "query",
      query: "SELECT * FROM users",
      connectionString: "",
    },
  },

  googleSheets: {
    id: "googleSheets",
    label: "Google Sheets",
    description: "Read/write to Google Sheets",
    category: "integrations",
    icon: Database,
    color: "bg-indigo-100 border-indigo-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "result", type: "object" }],
    config: {
      spreadsheetId: "",
      sheetName: "Sheet1",
      operation: "read",
    },
  },

  slack: {
    id: "slack",
    label: "Slack",
    description: "Send messages to Slack",
    category: "integrations",
    icon: MessageSquare,
    color: "bg-indigo-100 border-indigo-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "result", type: "object" }],
    config: {
      webhookUrl: "",
      channel: "#general",
      message: "",
    },
  },

  influxdb: {
    id: "influxdb",
    label: "InfluxDB",
    description: "Query or write time-series data to InfluxDB",
    category: "integrations",
    icon: BarChart3,
    color: "bg-teal-100 border-teal-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "result", type: "object" }],
    config: {
      url: "http://localhost:8086",
      token: "",
      org: "",
      bucket: "",
      operation: "query",
      query: "",
    },
  },

  elasticsearch: {
    id: "elasticsearch",
    label: "Elasticsearch",
    description: "Search and index documents in Elasticsearch",
    category: "integrations",
    icon: Search,
    color: "bg-yellow-100 border-yellow-400",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "result", type: "object" }],
    config: {
      node: "http://localhost:9200",
      username: "",
      password: "",
      index: "",
      operation: "search",
      query: {},
    },
  },

  logParser: {
    id: "logParser",
    label: "Log Parser",
    description: "Parse and aggregate log data",
    category: "integrations",
    icon: Logs,
    color: "bg-gray-100 border-gray-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "result", type: "object" }],
    config: {
      format: "json",
      pattern: "",
      aggregation: "none",
      fields: [],
    },
  },

  // ============ IOT ============
  mqtt: {
    id: "mqtt",
    label: "MQTT",
    description: "Publish/Subscribe to MQTT topics",
    category: "iot",
    icon: Smartphone,
    color: "bg-cyan-100 border-cyan-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "message", type: "object" }],
    config: {
      brokerUrl: "mqtt://localhost:1883",
      topic: "flowforge/+/status",
      operation: "subscribe",
    },
  },

  httpDevice: {
    id: "httpDevice",
    label: "HTTP Device",
    description: "Control HTTP-based IoT devices",
    category: "iot",
    icon: Smartphone,
    color: "bg-cyan-100 border-cyan-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "response", type: "object" }],
    config: {
      deviceUrl: "",
      method: "POST",
      payload: {},
    },
  },

  // ============ ADVANCED ============
  pythonScript: {
    id: "pythonScript",
    label: "Python Script",
    description: "Execute Python code in sandbox",
    category: "advanced",
    icon: Code,
    color: "bg-yellow-100 border-yellow-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "output", type: "object" }],
    config: {
      code: "return input",
      timeout: 30000,
    },
  },

  javascript: {
    id: "javascript",
    label: "JavaScript",
    description: "Execute JavaScript code",
    category: "advanced",
    icon: Code,
    color: "bg-yellow-100 border-yellow-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "output", type: "object" }],
    config: {
      code: "return input;",
      timeout: 5000,
    },
  },

  delay: {
    id: "delay",
    label: "Delay",
    description: "Add delay before continuing",
    category: "advanced",
    icon: Clock,
    color: "bg-yellow-100 border-yellow-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "output", type: "object" }],
    config: {
      delayMs: 1000,
    },
  },

  retry: {
    id: "retry",
    label: "Retry",
    description: "Retry failed operations",
    category: "advanced",
    icon: RefreshCw,
    color: "bg-yellow-100 border-yellow-300",
    inputs: [{ name: "input", type: "object" }],
    outputs: [{ name: "output", type: "object" }],
    config: {
      maxRetries: 3,
      backoffMs: 1000,
    },
  },
};

export function getNodesByCategory(category: NodeCategory): NodeMetadata[] {
  return Object.values(nodeRegistry).filter(node => node.category === category);
}

export function getAllCategories(): NodeCategory[] {
  const categories = new Set<NodeCategory>();
  Object.values(nodeRegistry).forEach(node => categories.add(node.category));
  return Array.from(categories) as NodeCategory[];
}

export function getNodeMetadata(nodeId: string): NodeMetadata | undefined {
  return nodeRegistry[nodeId];
}

export const categoryLabels: Record<NodeCategory, string> = {
  triggers: "Triggers",
  actions: "Actions",
  logic: "Logic",
  data: "Data",
  integrations: "Integrations",
  iot: "IoT",
  advanced: "Advanced",
};
