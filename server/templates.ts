/**
 * Workflow Templates
 * Pre-built workflow templates for common use cases
 */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: any[];
  edges: any[];
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "report-generation",
    name: "Report Generation",
    description: "Generate PDF reports and send via email",
    category: "Caso 1",
    difficulty: "beginner",
    tags: ["pdf", "email", "reports"],
    nodes: [
      {
        id: "trigger-1",
        type: "webhook",
        position: { x: 0, y: 0 },
        data: { label: "Webhook", nodeType: "Trigger" },
      },
      {
        id: "openai-1",
        type: "openai",
        position: { x: 200, y: 0 },
        data: { label: "OpenAI", nodeType: "Integration" },
        config: {
          model: "gpt-4",
          prompt: "Generate a professional report based on the input data",
        },
      },
      {
        id: "pdf-1",
        type: "pdfGenerator",
        position: { x: 400, y: 0 },
        data: { label: "PDF Generator", nodeType: "Action" },
        config: {
          format: "A4",
        },
      },
      {
        id: "email-1",
        type: "sendEmail",
        position: { x: 600, y: 0 },
        data: { label: "Send Email", nodeType: "Action" },
        config: {
          subject: "Your Generated Report",
        },
      },
    ],
    edges: [
      { source: "trigger-1", target: "openai-1" },
      { source: "openai-1", target: "pdf-1" },
      { source: "pdf-1", target: "email-1" },
    ],
  },

  {
    id: "log-analysis",
    name: "Log Analysis Pipeline",
    description: "Parse, analyze, and visualize logs from multiple sources",
    category: "Caso 2",
    difficulty: "intermediate",
    tags: ["logs", "elasticsearch", "analysis"],
    nodes: [
      {
        id: "trigger-2",
        type: "schedule",
        position: { x: 0, y: 0 },
        data: { label: "Schedule", nodeType: "Trigger" },
        config: {
          interval: "5m",
        },
      },
      {
        id: "logparser-1",
        type: "logParser",
        position: { x: 200, y: 0 },
        data: { label: "Log Parser", nodeType: "Integration" },
        config: {
          format: "json",
          aggregation: "count",
        },
      },
      {
        id: "elasticsearch-1",
        type: "elasticsearch",
        position: { x: 400, y: 0 },
        data: { label: "Elasticsearch", nodeType: "Integration" },
        config: {
          operation: "index",
        },
      },
      {
        id: "influxdb-1",
        type: "influxdb",
        position: { x: 600, y: 0 },
        data: { label: "InfluxDB", nodeType: "Integration" },
        config: {
          operation: "write",
        },
      },
    ],
    edges: [
      { source: "trigger-2", target: "logparser-1" },
      { source: "logparser-1", target: "elasticsearch-1" },
      { source: "logparser-1", target: "influxdb-1" },
    ],
  },

  {
    id: "system-monitoring",
    name: "System Monitoring & Alerts",
    description: "Monitor system metrics and send alerts via Slack",
    category: "Caso 3",
    difficulty: "intermediate",
    tags: ["monitoring", "prometheus", "alerts"],
    nodes: [
      {
        id: "trigger-3",
        type: "schedule",
        position: { x: 0, y: 0 },
        data: { label: "Schedule", nodeType: "Trigger" },
        config: {
          interval: "1m",
        },
      },
      {
        id: "prometheus-1",
        type: "prometheus",
        position: { x: 200, y: 0 },
        data: { label: "Prometheus", nodeType: "Integration" },
        config: {
          operation: "query",
        },
      },
      {
        id: "systemmetrics-1",
        type: "systemmetrics",
        position: { x: 200, y: 100 },
        data: { label: "System Metrics", nodeType: "Integration" },
        config: {
          metrics: ["cpu", "memory", "disk"],
        },
      },
      {
        id: "conditional-1",
        type: "conditional",
        position: { x: 400, y: 50 },
        data: { label: "Conditional", nodeType: "Logic" },
      },
      {
        id: "slack-1",
        type: "slackalerts",
        position: { x: 600, y: 50 },
        data: { label: "Slack Alerts", nodeType: "Action" },
        config: {
          severity: "warning",
        },
      },
    ],
    edges: [
      { source: "trigger-3", target: "prometheus-1" },
      { source: "trigger-3", target: "systemmetrics-1" },
      { source: "prometheus-1", target: "conditional-1" },
      { source: "systemmetrics-1", target: "conditional-1" },
      { source: "conditional-1", target: "slack-1" },
    ],
  },

  {
    id: "multi-ai-analysis",
    name: "Multi-AI Financial Analysis",
    description: "Analyze financial data with multiple AI instances and send results",
    category: "Caso 4",
    difficulty: "advanced",
    tags: ["ai", "finance", "analysis"],
    nodes: [
      {
        id: "trigger-4",
        type: "webhook",
        position: { x: 0, y: 0 },
        data: { label: "Webhook", nodeType: "Trigger" },
      },
      {
        id: "financialapis-1",
        type: "financialapis",
        position: { x: 200, y: 0 },
        data: { label: "Financial APIs", nodeType: "Integration" },
        config: {
          provider: "binance",
        },
      },
      {
        id: "openai-1",
        type: "openai",
        position: { x: 400, y: -50 },
        data: { label: "OpenAI", nodeType: "Integration" },
        config: {
          model: "gpt-4",
          prompt: "Analyze this financial data and provide insights",
        },
      },
      {
        id: "openai-2",
        type: "openai",
        position: { x: 400, y: 50 },
        data: { label: "OpenAI", nodeType: "Integration" },
        config: {
          model: "gpt-4",
          prompt: "Generate investment recommendations based on the analysis",
        },
      },
      {
        id: "joinmerge-1",
        type: "joinmerge",
        position: { x: 600, y: 0 },
        data: { label: "Join/Merge", nodeType: "Logic" },
        config: {
          mode: "merge",
        },
      },
      {
        id: "googlesheets-1",
        type: "googlesheets",
        position: { x: 800, y: 0 },
        data: { label: "Google Sheets", nodeType: "Integration" },
        config: {
          operation: "append",
        },
      },
      {
        id: "telegram-1",
        type: "telegrambot",
        position: { x: 800, y: 100 },
        data: { label: "Telegram Bot", nodeType: "Integration" },
        config: {
          operation: "message",
        },
      },
    ],
    edges: [
      { source: "trigger-4", target: "financialapis-1" },
      { source: "financialapis-1", target: "openai-1" },
      { source: "financialapis-1", target: "openai-2" },
      { source: "openai-1", target: "joinmerge-1" },
      { source: "openai-2", target: "joinmerge-1" },
      { source: "joinmerge-1", target: "googlesheets-1" },
      { source: "joinmerge-1", target: "telegram-1" },
    ],
  },

  {
    id: "webhook-to-database",
    name: "Webhook to Database",
    description: "Receive webhook data and store in database",
    category: "Basic",
    difficulty: "beginner",
    tags: ["webhook", "database", "integration"],
    nodes: [
      {
        id: "trigger-5",
        type: "webhook",
        position: { x: 0, y: 0 },
        data: { label: "Webhook", nodeType: "Trigger" },
      },
      {
        id: "transform-1",
        type: "transform",
        position: { x: 200, y: 0 },
        data: { label: "Transform", nodeType: "Data" },
      },
      {
        id: "log-1",
        type: "log",
        position: { x: 400, y: 0 },
        data: { label: "Log", nodeType: "Action" },
      },
    ],
    edges: [
      { source: "trigger-5", target: "transform-1" },
      { source: "transform-1", target: "log-1" },
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplate(id: string): WorkflowTemplate | undefined {
  return workflowTemplates.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return workflowTemplates.filter((t) => t.category === category);
}

/**
 * Get templates by difficulty
 */
export function getTemplatesByDifficulty(difficulty: string): WorkflowTemplate[] {
  return workflowTemplates.filter((t) => t.difficulty === difficulty);
}

/**
 * Search templates by tags
 */
export function searchTemplatesByTags(tags: string[]): WorkflowTemplate[] {
  return workflowTemplates.filter((t) => tags.some((tag) => t.tags.includes(tag)));
}

/**
 * Get all templates
 */
export function getAllTemplates(): WorkflowTemplate[] {
  return workflowTemplates;
}
