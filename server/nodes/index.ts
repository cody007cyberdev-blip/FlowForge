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


// Integration: OpenAI
registerNode(
  {
    id: "integration-openai",
    type: "integration-openai",
    label: "OpenAI",
    category: "integration",
    description: "Integração com OpenAI para GPT-4, embeddings e análise de texto",
    icon: "brain",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Output", type: "object" }],
    config: {
      apiKey: { type: "password", label: "API Key", required: true, help: "OpenAI API key" },
      mode: {
        type: "select",
        label: "Mode",
        required: true,
        options: [
          { label: "Chat Completion (GPT-4)", value: "chat" },
          { label: "Embeddings", value: "embedding" },
          { label: "Moderation", value: "moderation" },
        ],
        default: "chat",
      },
      model: {
        type: "select",
        label: "Model",
        options: [
          { label: "GPT-4", value: "gpt-4" },
          { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
          { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
        ],
        default: "gpt-4",
      },
      prompt: { type: "textarea", label: "Prompt", placeholder: "Enter your prompt here..." },
      systemPrompt: { type: "textarea", label: "System Prompt", placeholder: "You are a helpful assistant..." },
      temperature: { type: "number", label: "Temperature (0-2)", default: 0.7 },
      maxTokens: { type: "number", label: "Max Tokens", default: 1000 },
      topP: { type: "number", label: "Top P (0-1)", default: 1 },
    },
  },
  {
    async execute(config, inputs) {
      const { openaiExecutor } = await import("./openai");
      return openaiExecutor.execute(config, inputs);
    },
  }
);


// Action: PDF Generator
registerNode(
  {
    id: "action-pdf",
    type: "action-pdf",
    label: "PDF Generator",
    category: "action",
    description: "Convert HTML to PDF using Puppeteer",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "PDF Buffer", type: "object" }],
    config: {
      html: { type: "textarea", label: "HTML Content", required: true, placeholder: "<h1>Report</h1>" },
      format: {
        type: "select",
        label: "Page Format",
        options: [
          { label: "A4", value: "A4" },
          { label: "Letter", value: "Letter" },
          { label: "A3", value: "A3" },
        ],
        default: "A4",
      },
      landscape: { type: "boolean", label: "Landscape", default: false },
      marginTop: { type: "text", label: "Top Margin", default: "1cm" },
      marginRight: { type: "text", label: "Right Margin", default: "1cm" },
      marginBottom: { type: "text", label: "Bottom Margin", default: "1cm" },
      marginLeft: { type: "text", label: "Left Margin", default: "1cm" },
    },
  },
  {
    async execute(config) {
      const { executePDFNode } = await import("./pdf");
      return executePDFNode({}, config);
    },
  }
);

// Integration: InfluxDB
registerNode(
  {
    id: "integration-influxdb",
    type: "integration-influxdb",
    label: "InfluxDB",
    category: "integration",
    description: "Query or write time-series data to InfluxDB",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Result", type: "object" }],
    config: {
      url: { type: "text", label: "InfluxDB URL", default: "http://localhost:8086", required: true },
      token: { type: "password", label: "API Token", required: true },
      org: { type: "text", label: "Organization", required: true },
      bucket: { type: "text", label: "Bucket", required: true },
      operation: {
        type: "select",
        label: "Operation",
        options: [
          { label: "Query", value: "query" },
          { label: "Write", value: "write" },
        ],
        default: "query",
      },
      query: { type: "textarea", label: "Flux Query or Data", required: true },
    },
  },
  {
    async execute(config, inputs) {
      const { executeInfluxDBNode } = await import("./influxdb");
      return executeInfluxDBNode(inputs, config);
    },
  }
);

// Integration: Elasticsearch
registerNode(
  {
    id: "integration-elasticsearch",
    type: "integration-elasticsearch",
    label: "Elasticsearch",
    category: "integration",
    description: "Search and index documents in Elasticsearch",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Result", type: "object" }],
    config: {
      node: { type: "text", label: "Elasticsearch Node", default: "http://localhost:9200", required: true },
      username: { type: "text", label: "Username" },
      password: { type: "password", label: "Password" },
      index: { type: "text", label: "Index Name", required: true },
      operation: {
        type: "select",
        label: "Operation",
        options: [
          { label: "Search", value: "search" },
          { label: "Index", value: "index" },
          { label: "Delete", value: "delete" },
        ],
        default: "search",
      },
      query: { type: "textarea", label: "Query (JSON)", default: "{}" },
    },
  },
  {
    async execute(config, inputs) {
      const { executeElasticsearchNode } = await import("./elasticsearch");
      return executeElasticsearchNode(inputs, config);
    },
  }
);

// Integration: Log Parser
registerNode(
  {
    id: "integration-logparser",
    type: "integration-logparser",
    label: "Log Parser",
    category: "integration",
    description: "Parse and aggregate log data",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Parsed Logs", type: "object" }],
    config: {
      format: {
        type: "select",
        label: "Log Format",
        options: [
          { label: "JSON", value: "json" },
          { label: "Regex", value: "regex" },
          { label: "CSV", value: "csv" },
          { label: "Space-delimited", value: "space" },
          { label: "Apache Access", value: "apache" },
          { label: "Nginx Access", value: "nginx" },
          { label: "Syslog", value: "syslog" },
        ],
        default: "json",
      },
      pattern: { type: "textarea", label: "Regex Pattern (if regex format)" },
      aggregation: {
        type: "select",
        label: "Aggregation",
        options: [
          { label: "None", value: "none" },
          { label: "Count", value: "count" },
          { label: "Sum", value: "sum" },
          { label: "Average", value: "avg" },
          { label: "Min", value: "min" },
          { label: "Max", value: "max" },
        ],
        default: "none",
      },
      fields: { type: "textarea", label: "Fields to Extract (JSON array)", default: "[]" },
    },
  },
  {
    async execute(config, inputs) {
      const { executeLogParserNode } = await import("./logParser");
      return executeLogParserNode(inputs, config);
    },
  }
);


// Integration: Prometheus
registerNode(
  {
    id: "integration-prometheus",
    type: "integration-prometheus",
    label: "Prometheus",
    category: "integration",
    description: "Query metrics from Prometheus for monitoring",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Result", type: "object" }],
    config: {
      url: { type: "text", label: "Prometheus URL", default: "http://localhost:9090", required: true },
      operation: {
        type: "select",
        label: "Operation",
        options: [
          { label: "Query", value: "query" },
          { label: "Range", value: "range" },
          { label: "Targets", value: "targets" },
        ],
        default: "query",
      },
      query: { type: "textarea", label: "PromQL Query", required: true },
      start: { type: "text", label: "Start Time (for range)" },
      end: { type: "text", label: "End Time (for range)" },
      step: { type: "text", label: "Step (for range)" },
    },
  },
  {
    async execute(config, inputs) {
      const { executePrometheusNode } = await import("./prometheus");
      return executePrometheusNode(inputs, config);
    },
  }
);

// Integration: System Metrics
registerNode(
  {
    id: "integration-systemmetrics",
    type: "integration-systemmetrics",
    label: "System Metrics",
    category: "integration",
    description: "Collect system metrics (CPU, RAM, Disk, Network)",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Metrics", type: "object" }],
    config: {
      metrics: {
        type: "textarea",
        label: "Metrics to Collect (JSON array)",
        default: '["cpu", "memory", "disk"]',
        help: "Options: cpu, memory, disk, network, load, uptime",
      },
      interval: { type: "number", label: "Collection Interval (ms)" },
    },
  },
  {
    async execute(config, inputs) {
      const { executeSystemMetricsNode } = await import("./systemMetrics");
      return executeSystemMetricsNode(inputs, config);
    },
  }
);

// Action: Slack Alerts
registerNode(
  {
    id: "action-slackalerts",
    type: "action-slackalerts",
    label: "Slack Alerts",
    category: "action",
    description: "Send alerts to Slack channels",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Result", type: "object" }],
    config: {
      webhookUrl: { type: "password", label: "Webhook URL", required: true },
      channel: { type: "text", label: "Channel (optional)", placeholder: "#alerts" },
      title: { type: "text", label: "Alert Title" },
      message: { type: "textarea", label: "Alert Message", required: true },
      severity: {
        type: "select",
        label: "Severity",
        options: [
          { label: "Info", value: "info" },
          { label: "Warning", value: "warning" },
          { label: "Error", value: "error" },
          { label: "Critical", value: "critical" },
        ],
        default: "info",
      },
      threshold: { type: "number", label: "Threshold (for threshold-based alerts)" },
      value: { type: "number", label: "Current Value" },
      unit: { type: "text", label: "Unit (e.g., %)" },
    },
  },
  {
    async execute(config, inputs) {
      const { executeSlackAlertsNode } = await import("./slackAlerts");
      return executeSlackAlertsNode(inputs, config);
    },
  }
);

// IoT: MQTT Subscribe
registerNode(
  {
    id: "iot-mqttsubscribe",
    type: "iot-mqttsubscribe",
    label: "MQTT Subscribe",
    category: "integration",
    description: "Subscribe to MQTT topics for IoT device data",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Messages", type: "object" }],
    config: {
      brokerUrl: { type: "text", label: "Broker URL", default: "mqtt://localhost:1883", required: true },
      topic: { type: "text", label: "Topic", required: true, placeholder: "sensor/+/data" },
      qos: {
        type: "select",
        label: "QoS",
        options: [
          { label: "0 - At most once", value: "0" },
          { label: "1 - At least once", value: "1" },
          { label: "2 - Exactly once", value: "2" },
        ],
        default: "1",
      },
      username: { type: "text", label: "Username (optional)" },
      password: { type: "password", label: "Password (optional)" },
      timeout: { type: "number", label: "Timeout (ms)", default: 5000 },
      payloadFormat: {
        type: "select",
        label: "Payload Format",
        options: [
          { label: "JSON", value: "json" },
          { label: "Text", value: "text" },
          { label: "Hex", value: "hex" },
        ],
        default: "json",
      },
    },
  },
  {
    async execute(config, inputs) {
      const { executeMQTTSubscribeNode } = await import("./mqttSubscribe");
      return executeMQTTSubscribeNode(inputs, config);
    },
  }
);


// Integration: Google Sheets
registerNode(
  {
    id: "integration-googlesheets",
    type: "integration-googlesheets",
    label: "Google Sheets",
    category: "integration",
    description: "Read and write data to Google Sheets",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Data", type: "object" }],
    config: {
      spreadsheetId: { type: "text", label: "Spreadsheet ID", required: true },
      sheetName: { type: "text", label: "Sheet Name", required: true },
      operation: {
        type: "select",
        label: "Operation",
        options: [
          { label: "Read", value: "read" },
          { label: "Write", value: "write" },
          { label: "Append", value: "append" },
        ],
        default: "read",
      },
      range: { type: "text", label: "Range (e.g., A1:D10)" },
    },
  },
  {
    async execute(config, inputs) {
      const { executeGoogleSheetsNode } = await import("./googleSheets");
      return executeGoogleSheetsNode(inputs, config);
    },
  }
);

// Integration: Telegram Bot
registerNode(
  {
    id: "integration-telegrambot",
    type: "integration-telegrambot",
    label: "Telegram Bot",
    category: "integration",
    description: "Send messages to Telegram channels",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Result", type: "object" }],
    config: {
      botToken: { type: "password", label: "Bot Token", required: true },
      chatId: { type: "text", label: "Chat ID", required: true },
      operation: {
        type: "select",
        label: "Operation",
        options: [
          { label: "Message", value: "message" },
          { label: "Document", value: "document" },
          { label: "Keyboard", value: "keyboard" },
        ],
        default: "message",
      },
      message: { type: "textarea", label: "Message", required: true },
      parseMode: {
        type: "select",
        label: "Parse Mode",
        options: [
          { label: "Markdown", value: "Markdown" },
          { label: "HTML", value: "HTML" },
          { label: "MarkdownV2", value: "MarkdownV2" },
        ],
        default: "Markdown",
      },
    },
  },
  {
    async execute(config, inputs) {
      const { executeTelegramBotNode } = await import("./telegramBot");
      return executeTelegramBotNode(inputs, config);
    },
  }
);

// Integration: Financial APIs
registerNode(
  {
    id: "integration-financialapis",
    type: "integration-financialapis",
    label: "Financial APIs",
    category: "integration",
    description: "Get financial data from stock, crypto, and forex providers",
    inputs: [{ id: "input", label: "Input", type: "object" }],
    outputs: [{ id: "output", label: "Data", type: "object" }],
    config: {
      provider: {
        type: "select",
        label: "Provider",
        options: [
          { label: "Alpha Vantage (Stocks)", value: "alpha-vantage" },
          { label: "Binance (Crypto)", value: "binance" },
          { label: "CoinMarketCap (Crypto)", value: "coinmarketcap" },
        ],
        required: true,
      },
      apiKey: { type: "password", label: "API Key" },
      symbol: { type: "text", label: "Symbol (e.g., AAPL, BTCUSDT)", required: true },
      interval: {
        type: "select",
        label: "Interval",
        options: [
          { label: "Daily", value: "daily" },
          { label: "Intraday", value: "intraday" },
          { label: "1h", value: "1h" },
          { label: "4h", value: "4h" },
        ],
        default: "daily",
      },
    },
  },
  {
    async execute(config, inputs) {
      const { executeFinancialApisNode } = await import("./financialApis");
      return executeFinancialApisNode(inputs, config);
    },
  }
);

// Logic: Join/Merge
registerNode(
  {
    id: "logic-joinmerge",
    type: "logic-joinmerge",
    label: "Join/Merge",
    category: "logic",
    description: "Combine data from multiple parallel execution paths",
    inputs: [
      { id: "input1", label: "Input 1", type: "object" },
      { id: "input2", label: "Input 2", type: "object" },
    ],
    outputs: [{ id: "output", label: "Merged Data", type: "object" }],
    config: {
      mode: {
        type: "select",
        label: "Mode",
        options: [
          { label: "Merge", value: "merge" },
          { label: "Join", value: "join" },
          { label: "Concat", value: "concat" },
          { label: "Aggregate", value: "aggregate" },
        ],
        default: "merge",
      },
      joinKey: { type: "text", label: "Join Key (for join mode)" },
      aggregation: {
        type: "select",
        label: "Aggregation",
        options: [
          { label: "First", value: "first" },
          { label: "Last", value: "last" },
          { label: "All", value: "all" },
          { label: "Count", value: "count" },
        ],
        default: "all",
      },
      timeout: { type: "number", label: "Timeout (ms)", default: 30000 },
    },
  },
  {
    async execute(config, inputs) {
      const { executeJoinMergeNode } = await import("./joinMerge");
      return executeJoinMergeNode(inputs, config);
    },
  }
);
