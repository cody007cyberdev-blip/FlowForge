import { describe, it, expect } from "vitest";
import {
  getAllTemplates,
  getTemplate,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
  searchTemplatesByTags,
} from "./templates";

describe("Workflow Templates", () => {
  it("should have all templates defined", () => {
    const templates = getAllTemplates();
    expect(templates).toBeDefined();
    expect(templates.length).toBeGreaterThan(0);
  });

  it("should have templates for all use cases", () => {
    const templates = getAllTemplates();
    const categories = templates.map((t) => t.category);

    expect(categories).toContain("Caso 1");
    expect(categories).toContain("Caso 2");
    expect(categories).toContain("Caso 3");
    expect(categories).toContain("Caso 4");
  });

  it("should get template by ID", () => {
    const template = getTemplate("report-generation");
    expect(template).toBeDefined();
    expect(template?.name).toBe("Report Generation");
    expect(template?.category).toBe("Caso 1");
  });

  it("should return undefined for non-existent template", () => {
    const template = getTemplate("non-existent");
    expect(template).toBeUndefined();
  });

  it("should get templates by category", () => {
    const templates = getTemplatesByCategory("Caso 1");
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every((t) => t.category === "Caso 1")).toBe(true);
  });

  it("should get templates by difficulty", () => {
    const beginnerTemplates = getTemplatesByDifficulty("beginner");
    expect(beginnerTemplates.length).toBeGreaterThan(0);
    expect(beginnerTemplates.every((t) => t.difficulty === "beginner")).toBe(true);
  });

  it("should search templates by tags", () => {
    const templates = searchTemplatesByTags(["pdf", "email"]);
    expect(templates.length).toBeGreaterThan(0);
  });

  it("should have Report Generation template with correct structure", () => {
    const template = getTemplate("report-generation");
    expect(template?.nodes).toBeDefined();
    expect(template?.edges).toBeDefined();
    expect(template?.nodes.length).toBeGreaterThan(0);
    expect(template?.edges.length).toBeGreaterThan(0);
  });

  it("should have Log Analysis template with correct structure", () => {
    const template = getTemplate("log-analysis");
    expect(template?.nodes).toBeDefined();
    expect(template?.edges).toBeDefined();
    expect(template?.category).toBe("Caso 2");
  });

  it("should have System Monitoring template with correct structure", () => {
    const template = getTemplate("system-monitoring");
    expect(template?.nodes).toBeDefined();
    expect(template?.edges).toBeDefined();
    expect(template?.category).toBe("Caso 3");
  });

  it("should have Multi-AI Financial Analysis template with correct structure", () => {
    const template = getTemplate("multi-ai-analysis");
    expect(template?.nodes).toBeDefined();
    expect(template?.edges).toBeDefined();
    expect(template?.category).toBe("Caso 4");
  });

  it("should have templates with valid node types", () => {
    const templates = getAllTemplates();
    const validNodeTypes = [
      "webhook",
      "schedule",
      "httpRequest",
      "sendEmail",
      "pdfGenerator",
      "slackalerts",
      "conditional",
      "transform",
      "openai",
      "influxdb",
      "elasticsearch",
      "logParser",
      "prometheus",
      "systemmetrics",
      "mqttsubscribe",
      "googlesheets",
      "telegrambot",
      "financialapis",
      "joinmerge",
      "log",
    ];

    templates.forEach((template) => {
      template.nodes.forEach((node: any) => {
        expect(validNodeTypes).toContain(node.type);
      });
    });
  });

  it("should have templates with valid edges", () => {
    const templates = getAllTemplates();

    templates.forEach((template) => {
      template.edges.forEach((edge: any) => {
        expect(edge.source).toBeDefined();
        expect(edge.target).toBeDefined();
        const nodeIds = template.nodes.map((n: any) => n.id);
        expect(nodeIds).toContain(edge.source);
        expect(nodeIds).toContain(edge.target);
      });
    });
  });

  it("should have templates with all required fields", () => {
    const templates = getAllTemplates();

    templates.forEach((template) => {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.category).toBeDefined();
      expect(template.difficulty).toBeDefined();
      expect(template.tags).toBeDefined();
      expect(Array.isArray(template.tags)).toBe(true);
    });
  });

  it("should have at least one template for each difficulty level", () => {
    const templates = getAllTemplates();
    const difficulties = templates.map((t) => t.difficulty);

    expect(difficulties).toContain("beginner");
    expect(difficulties).toContain("intermediate");
    expect(difficulties).toContain("advanced");
  });

  it("should have Report Generation with PDF and Email nodes", () => {
    const template = getTemplate("report-generation");
    const nodeTypes = template?.nodes.map((n: any) => n.type) || [];

    expect(nodeTypes).toContain("pdfGenerator");
    expect(nodeTypes).toContain("sendEmail");
  });

  it("should have Log Analysis with Elasticsearch and InfluxDB nodes", () => {
    const template = getTemplate("log-analysis");
    const nodeTypes = template?.nodes.map((n: any) => n.type) || [];

    expect(nodeTypes).toContain("elasticsearch");
    expect(nodeTypes).toContain("influxdb");
    expect(nodeTypes).toContain("logParser");
  });

  it("should have System Monitoring with Prometheus and Slack nodes", () => {
    const template = getTemplate("system-monitoring");
    const nodeTypes = template?.nodes.map((n: any) => n.type) || [];

    expect(nodeTypes).toContain("prometheus");
    expect(nodeTypes).toContain("slackalerts");
  });

  it("should have Multi-AI Analysis with Google Sheets and Telegram nodes", () => {
    const template = getTemplate("multi-ai-analysis");
    const nodeTypes = template?.nodes.map((n: any) => n.type) || [];

    expect(nodeTypes).toContain("googlesheets");
    expect(nodeTypes).toContain("telegrambot");
    expect(nodeTypes).toContain("financialapis");
  });
});
