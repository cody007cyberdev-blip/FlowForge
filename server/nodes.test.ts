import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getNodeConfig, getNodeExecutor } from "./nodes/index";

describe("Node Registry - New Nodes", () => {
  describe("PDF Generator Node", () => {
    it("should have PDF node registered", () => {
      const config = getNodeConfig("action-pdf");
      expect(config).toBeDefined();
      expect(config?.label).toBe("PDF Generator");
      expect(config?.category).toBe("action");
    });

    it("should have PDF executor", () => {
      const executor = getNodeExecutor("action-pdf");
      expect(executor).toBeDefined();
      expect(executor?.execute).toBeDefined();
    });

    it("should have correct PDF config fields", () => {
      const config = getNodeConfig("action-pdf");
      expect(config?.config.html).toBeDefined();
      expect(config?.config.format).toBeDefined();
      expect(config?.config.landscape).toBeDefined();
      expect(config?.config.marginTop).toBeDefined();
    });

    it("should execute PDF generation", async () => {
      const executor = getNodeExecutor("action-pdf");
      const result = await executor?.execute(
        {
          html: "<h1>Test Report</h1><p>This is a test PDF</p>",
          format: "A4",
          landscape: false,
          marginTop: "1cm",
          marginRight: "1cm",
          marginBottom: "1cm",
          marginLeft: "1cm",
        },
        {}
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty("success");
    });
  });

  describe("InfluxDB Node", () => {
    it("should have InfluxDB node registered", () => {
      const config = getNodeConfig("integration-influxdb");
      expect(config).toBeDefined();
      expect(config?.label).toBe("InfluxDB");
      expect(config?.category).toBe("integration");
    });

    it("should have InfluxDB executor", () => {
      const executor = getNodeExecutor("integration-influxdb");
      expect(executor).toBeDefined();
      expect(executor?.execute).toBeDefined();
    });

    it("should have correct InfluxDB config fields", () => {
      const config = getNodeConfig("integration-influxdb");
      expect(config?.config.url).toBeDefined();
      expect(config?.config.token).toBeDefined();
      expect(config?.config.org).toBeDefined();
      expect(config?.config.bucket).toBeDefined();
      expect(config?.config.operation).toBeDefined();
      expect(config?.config.query).toBeDefined();
    });

    it("should have query and write operations", () => {
      const config = getNodeConfig("integration-influxdb");
      const operationField = config?.config.operation;
      expect(operationField?.options).toContainEqual({ label: "Query", value: "query" });
      expect(operationField?.options).toContainEqual({ label: "Write", value: "write" });
    });
  });

  describe("Elasticsearch Node", () => {
    it("should have Elasticsearch node registered", () => {
      const config = getNodeConfig("integration-elasticsearch");
      expect(config).toBeDefined();
      expect(config?.label).toBe("Elasticsearch");
      expect(config?.category).toBe("integration");
    });

    it("should have Elasticsearch executor", () => {
      const executor = getNodeExecutor("integration-elasticsearch");
      expect(executor).toBeDefined();
      expect(executor?.execute).toBeDefined();
    });

    it("should have correct Elasticsearch config fields", () => {
      const config = getNodeConfig("integration-elasticsearch");
      expect(config?.config.node).toBeDefined();
      expect(config?.config.username).toBeDefined();
      expect(config?.config.password).toBeDefined();
      expect(config?.config.index).toBeDefined();
      expect(config?.config.operation).toBeDefined();
      expect(config?.config.query).toBeDefined();
    });

    it("should have search, index, and delete operations", () => {
      const config = getNodeConfig("integration-elasticsearch");
      const operationField = config?.config.operation;
      expect(operationField?.options).toContainEqual({ label: "Search", value: "search" });
      expect(operationField?.options).toContainEqual({ label: "Index", value: "index" });
      expect(operationField?.options).toContainEqual({ label: "Delete", value: "delete" });
    });
  });

  describe("Log Parser Node", () => {
    it("should have Log Parser node registered", () => {
      const config = getNodeConfig("integration-logparser");
      expect(config).toBeDefined();
      expect(config?.label).toBe("Log Parser");
      expect(config?.category).toBe("integration");
    });

    it("should have Log Parser executor", () => {
      const executor = getNodeExecutor("integration-logparser");
      expect(executor).toBeDefined();
      expect(executor?.execute).toBeDefined();
    });

    it("should have correct Log Parser config fields", () => {
      const config = getNodeConfig("integration-logparser");
      expect(config?.config.format).toBeDefined();
      expect(config?.config.pattern).toBeDefined();
      expect(config?.config.aggregation).toBeDefined();
      expect(config?.config.fields).toBeDefined();
    });

    it("should support multiple log formats", () => {
      const config = getNodeConfig("integration-logparser");
      const formatField = config?.config.format;
      expect(formatField?.options).toContainEqual({ label: "JSON", value: "json" });
      expect(formatField?.options).toContainEqual({ label: "Regex", value: "regex" });
      expect(formatField?.options).toContainEqual({ label: "CSV", value: "csv" });
      expect(formatField?.options).toContainEqual({ label: "Apache Access", value: "apache" });
      expect(formatField?.options).toContainEqual({ label: "Nginx Access", value: "nginx" });
      expect(formatField?.options).toContainEqual({ label: "Syslog", value: "syslog" });
    });

    it("should support multiple aggregation types", () => {
      const config = getNodeConfig("integration-logparser");
      const aggregationField = config?.config.aggregation;
      expect(aggregationField?.options).toContainEqual({ label: "None", value: "none" });
      expect(aggregationField?.options).toContainEqual({ label: "Count", value: "count" });
      expect(aggregationField?.options).toContainEqual({ label: "Sum", value: "sum" });
      expect(aggregationField?.options).toContainEqual({ label: "Average", value: "avg" });
      expect(aggregationField?.options).toContainEqual({ label: "Min", value: "min" });
      expect(aggregationField?.options).toContainEqual({ label: "Max", value: "max" });
    });
  });

  describe("Email Sender Node", () => {
    it("should have Email node registered", () => {
      const config = getNodeConfig("action-email");
      expect(config).toBeDefined();
      expect(config?.label).toBe("Send Email");
      expect(config?.category).toBe("action");
    });

    it("should have Email executor", () => {
      const executor = getNodeExecutor("action-email");
      expect(executor).toBeDefined();
      expect(executor?.execute).toBeDefined();
    });

    it("should have correct Email config fields", () => {
      const config = getNodeConfig("action-email");
      expect(config?.config.to).toBeDefined();
      expect(config?.config.subject).toBeDefined();
      expect(config?.config.body).toBeDefined();
      expect(config?.config.credentialId).toBeDefined();
    });
  });

  describe("Node Executor Integration", () => {
    it("should execute PDF node with valid config", async () => {
      const executor = getNodeExecutor("action-pdf");
      const config = {
        html: "<h1>Test</h1>",
        format: "A4",
        landscape: false,
        marginTop: "1cm",
        marginRight: "1cm",
        marginBottom: "1cm",
        marginLeft: "1cm",
      };

      const result = await executor?.execute(config, {});
      expect(result).toBeDefined();
    });

    it("should handle node execution errors gracefully", async () => {
      const executor = getNodeExecutor("action-pdf");
      const invalidConfig = {
        html: null,
        format: "invalid",
      };

      try {
        await executor?.execute(invalidConfig, {});
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Node Metadata", () => {
    it("should have all new nodes with proper metadata", () => {
      const nodeIds = ["action-pdf", "integration-influxdb", "integration-elasticsearch", "integration-logparser"];

      for (const nodeId of nodeIds) {
        const config = getNodeConfig(nodeId);
        expect(config).toBeDefined();
        expect(config?.id).toBe(nodeId);
        expect(config?.label).toBeDefined();
        expect(config?.category).toBeDefined();
        expect(config?.description).toBeDefined();
        expect(config?.inputs).toBeDefined();
        expect(config?.outputs).toBeDefined();
        expect(config?.config).toBeDefined();
      }
    });

    it("should have proper input/output definitions", () => {
      const config = getNodeConfig("action-pdf");
      expect(config?.inputs.length).toBeGreaterThan(0);
      expect(config?.outputs.length).toBeGreaterThan(0);
      expect(config?.inputs[0]).toHaveProperty("id");
      expect(config?.inputs[0]).toHaveProperty("label");
      expect(config?.inputs[0]).toHaveProperty("type");
    });
  });
});

describe("Use Case Workflows", () => {
  describe("Caso 1: IA para Relatórios", () => {
    it("should have PDF and Email nodes for report generation", () => {
      const pdfNode = getNodeConfig("action-pdf");
      const emailNode = getNodeConfig("action-email");

      expect(pdfNode).toBeDefined();
      expect(emailNode).toBeDefined();
      expect(pdfNode?.category).toBe("action");
      expect(emailNode?.category).toBe("action");
    });
  });

  describe("Caso 2: Análise de Logs", () => {
    it("should have InfluxDB, Elasticsearch, and Log Parser nodes", () => {
      const influxNode = getNodeConfig("integration-influxdb");
      const esNode = getNodeConfig("integration-elasticsearch");
      const parserNode = getNodeConfig("integration-logparser");

      expect(influxNode).toBeDefined();
      expect(esNode).toBeDefined();
      expect(parserNode).toBeDefined();
    });

    it("should support log parsing with multiple formats", () => {
      const config = getNodeConfig("integration-logparser");
      const formats = config?.config.format?.options?.map((opt: any) => opt.value) || [];

      expect(formats).toContain("json");
      expect(formats).toContain("regex");
      expect(formats).toContain("csv");
      expect(formats).toContain("apache");
      expect(formats).toContain("nginx");
      expect(formats).toContain("syslog");
    });
  });
});


describe("Caso 3: Monitoring & Alerts", () => {
  it("should have Prometheus node registered", () => {
    const config = getNodeConfig("integration-prometheus");
    expect(config).toBeDefined();
    expect(config?.label).toBe("Prometheus");
    expect(config?.category).toBe("integration");
  });

  it("should have System Metrics node registered", () => {
    const config = getNodeConfig("integration-systemmetrics");
    expect(config).toBeDefined();
    expect(config?.label).toBe("System Metrics");
  });

  it("should have Slack Alerts node registered", () => {
    const config = getNodeConfig("action-slackalerts");
    expect(config).toBeDefined();
    expect(config?.label).toBe("Slack Alerts");
  });

  it("should have MQTT Subscribe node registered", () => {
    const config = getNodeConfig("iot-mqttsubscribe");
    expect(config).toBeDefined();
    expect(config?.label).toBe("MQTT Subscribe");
  });

  it("should have Prometheus with query operations", () => {
    const config = getNodeConfig("integration-prometheus");
    const operations = config?.config.operation?.options?.map((opt: any) => opt.value) || [];
    expect(operations).toContain("query");
    expect(operations).toContain("range");
    expect(operations).toContain("targets");
  });

  it("should have Slack Alerts with severity levels", () => {
    const config = getNodeConfig("action-slackalerts");
    const severities = config?.config.severity?.options?.map((opt: any) => opt.value) || [];
    expect(severities).toContain("info");
    expect(severities).toContain("warning");
    expect(severities).toContain("error");
    expect(severities).toContain("critical");
  });

  it("should have MQTT Subscribe with QoS levels", () => {
    const config = getNodeConfig("iot-mqttsubscribe");
    const qosLevels = config?.config.qos?.options?.map((opt: any) => opt.value) || [];
    expect(qosLevels).toContain("0");
    expect(qosLevels).toContain("1");
    expect(qosLevels).toContain("2");
  });

  it("should execute Prometheus node", async () => {
    const executor = getNodeExecutor("integration-prometheus");
    const result = await executor?.execute(
      {
        url: "http://localhost:9090",
        operation: "query",
        query: "up",
      },
      {}
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("success");
  });

  it("should execute System Metrics node", async () => {
    const executor = getNodeExecutor("integration-systemmetrics");
    const result = await executor?.execute(
      {
        metrics: ["cpu", "memory"],
      },
      {}
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("success");
  });

  it("should have Slack Alerts executor", () => {
    const executor = getNodeExecutor("action-slackalerts");
    expect(executor).toBeDefined();
    expect(executor?.execute).toBeDefined();
  });

  it("should have MQTT Subscribe executor", () => {
    const executor = getNodeExecutor("iot-mqttsubscribe");
    expect(executor).toBeDefined();
    expect(executor?.execute).toBeDefined();
  });
});


describe("Caso 4: Multi-IA + Financial Analysis", () => {
  it("should have Google Sheets node registered", () => {
    const config = getNodeConfig("integration-googlesheets");
    expect(config).toBeDefined();
    expect(config?.label).toBe("Google Sheets");
  });

  it("should have Telegram Bot node registered", () => {
    const config = getNodeConfig("integration-telegrambot");
    expect(config).toBeDefined();
    expect(config?.label).toBe("Telegram Bot");
  });

  it("should have Financial APIs node registered", () => {
    const config = getNodeConfig("integration-financialapis");
    expect(config).toBeDefined();
    expect(config?.label).toBe("Financial APIs");
  });

  it("should have Join/Merge node registered", () => {
    const config = getNodeConfig("logic-joinmerge");
    expect(config).toBeDefined();
    expect(config?.label).toBe("Join/Merge");
  });

  it("should have Google Sheets with read/write/append operations", () => {
    const config = getNodeConfig("integration-googlesheets");
    const operations = config?.config.operation?.options?.map((opt: any) => opt.value) || [];
    expect(operations).toContain("read");
    expect(operations).toContain("write");
    expect(operations).toContain("append");
  });

  it("should have Telegram Bot with message/document/keyboard operations", () => {
    const config = getNodeConfig("integration-telegrambot");
    const operations = config?.config.operation?.options?.map((opt: any) => opt.value) || [];
    expect(operations).toContain("message");
    expect(operations).toContain("document");
    expect(operations).toContain("keyboard");
  });

  it("should have Financial APIs with multiple providers", () => {
    const config = getNodeConfig("integration-financialapis");
    const providers = config?.config.provider?.options?.map((opt: any) => opt.value) || [];
    expect(providers).toContain("alpha-vantage");
    expect(providers).toContain("binance");
    expect(providers).toContain("coinmarketcap");
  });

  it("should have Join/Merge with merge/join/concat/aggregate modes", () => {
    const config = getNodeConfig("logic-joinmerge");
    const modes = config?.config.mode?.options?.map((opt: any) => opt.value) || [];
    expect(modes).toContain("merge");
    expect(modes).toContain("join");
    expect(modes).toContain("concat");
    expect(modes).toContain("aggregate");
  });

  it("should have Google Sheets executor", () => {
    const executor = getNodeExecutor("integration-googlesheets");
    expect(executor).toBeDefined();
    expect(executor?.execute).toBeDefined();
  });

  it("should have Telegram Bot executor", () => {
    const executor = getNodeExecutor("integration-telegrambot");
    expect(executor).toBeDefined();
    expect(executor?.execute).toBeDefined();
  });

  it("should have Financial APIs executor", () => {
    const executor = getNodeExecutor("integration-financialapis");
    expect(executor).toBeDefined();
    expect(executor?.execute).toBeDefined();
  });

  it("should have Join/Merge executor", () => {
    const executor = getNodeExecutor("logic-joinmerge");
    expect(executor).toBeDefined();
    expect(executor?.execute).toBeDefined();
  });

  it("should execute Google Sheets node", async () => {
    const executor = getNodeExecutor("integration-googlesheets");
    const result = await executor?.execute(
      {
        spreadsheetId: "abc123",
        sheetName: "Sheet1",
        operation: "read",
      },
      {}
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("success");
  }, 10000);

  it("should execute Financial APIs node", async () => {
    const executor = getNodeExecutor("integration-financialapis");
    const result = await executor?.execute(
      {
        provider: "binance",
        symbol: "BTCUSDT",
        interval: "1d",
      },
      {}
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("success");
  }, 10000);

  it("should execute Join/Merge node", async () => {
    const executor = getNodeExecutor("logic-joinmerge");
    const result = await executor?.execute(
      [{ name: "John", age: 30 }, { name: "Jane", age: 25 }],
      {
        mode: "merge",
      }
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("success");
  }, 10000);
});
