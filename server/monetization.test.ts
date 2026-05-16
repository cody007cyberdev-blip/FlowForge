/**
 * Tests for Billing, Analytics, and Marketplace systems
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import * as billing from "./billing";
import * as analytics from "./analytics";
import * as marketplace from "./marketplace";

describe("Billing System", () => {
  describe("Plans", () => {
    it("should get free plan", () => {
      const plan = billing.getPlan("free");
      expect(plan.type).toBe("free");
      expect(plan.price).toBe(0);
      expect(plan.limits.maxWorkflows).toBe(5);
    });

    it("should get pro plan", () => {
      const plan = billing.getPlan("pro");
      expect(plan.type).toBe("pro");
      expect(plan.price).toBe(29);
      expect(plan.limits.maxWorkflows).toBe(50);
    });

    it("should get business plan", () => {
      const plan = billing.getPlan("business");
      expect(plan.type).toBe("business");
      expect(plan.price).toBe(99);
      expect(plan.limits.maxWorkflows).toBe(500);
    });

    it("should get enterprise plan", () => {
      const plan = billing.getPlan("enterprise");
      expect(plan.type).toBe("enterprise");
      expect(plan.limits.maxWorkflows).toBe(10000);
    });

    it("should get all plans", () => {
      const plans = billing.getAllPlans();
      expect(plans.length).toBe(4);
      expect(plans.map((p) => p.type)).toEqual(["free", "pro", "business", "enterprise"]);
    });
  });

  describe("Pricing", () => {
    it("should calculate monthly price", () => {
      const price = billing.calculatePrice("pro", "monthly");
      expect(price).toBe(29);
    });

    it("should calculate yearly price with discount", () => {
      const price = billing.calculatePrice("pro", "yearly");
      expect(price).toBe(29 * 12 * 0.8); // 20% discount
    });

    it("should handle free plan pricing", () => {
      const price = billing.calculatePrice("free", "monthly");
      expect(price).toBe(0);
    });
  });

  describe("Subscriptions", () => {
    it("should create subscription", async () => {
      const subscription = await billing.createSubscription(1, "pro");
      expect(subscription.organizationId).toBe(1);
      expect(subscription.planType).toBe("pro");
      expect(subscription.status).toBe("active");
    });

    it("should start trial", async () => {
      const subscription = await billing.startTrial(1, 14);
      expect(subscription.organizationId).toBe(1);
      expect(subscription.planType).toBe("pro");
    });
  });

  describe("Usage Tracking", () => {
    it("should track usage", async () => {
      await billing.trackUsage(1, "workflow");
      expect(true).toBe(true); // Just verify it doesn't throw
    });

    it("should get usage", async () => {
      const usage = await billing.getUsage(1);
      expect(usage.organizationId).toBe(1);
      expect(usage.workflows).toBe(0);
      expect(usage.executions).toBe(0);
    });
  });
});

describe("Analytics System", () => {
  describe("Event Tracking", () => {
    it("should track workflow execution", async () => {
      await analytics.trackWorkflowExecution(1, 1, 1, "success", 1000, 1024);
      expect(true).toBe(true); // Verify no errors
    });

    it("should track API call", async () => {
      await analytics.trackAPICall(1, 1, "/api/workflows", "GET", 200, 50);
      expect(true).toBe(true);
    });

    it("should track user action", async () => {
      await analytics.trackUserAction(1, 1, "workflow_created", "workflow", 1);
      expect(true).toBe(true);
    });

    it("should track custom metric", async () => {
      await analytics.trackCustomMetric(1, "custom_metric", 42, { tag: "value" });
      expect(true).toBe(true);
    });
  });

  describe("Metrics Retrieval", () => {
    it("should get real-time metrics", async () => {
      const metrics = await analytics.getRealTimeMetrics(1);
      expect(metrics.activeUsers).toBeGreaterThanOrEqual(0);
      expect(metrics.runningWorkflows).toBeGreaterThanOrEqual(0);
      expect(metrics.requestsPerSecond).toBeGreaterThanOrEqual(0);
    });

    it("should get cost breakdown", async () => {
      const costs = await analytics.getCostBreakdown(1);
      expect(costs.currency).toBe("USD");
      expect(costs.totalCost).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Reports", () => {
    it("should generate analytics report", async () => {
      const startDate = new Date();
      const endDate = new Date();
      const report = await analytics.generateAnalyticsReport(1, startDate, endDate);
      expect(report.period.start).toEqual(startDate);
      expect(report.period.end).toEqual(endDate);
    });

    it("should export analytics data", async () => {
      const exportData = await analytics.exportAnalyticsData(1, "csv");
      expect(exportData.format).toBe("csv");
      expect(exportData.url).toContain("s3://");
      expect(exportData.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe("Alerts", () => {
    it("should set up alert", async () => {
      const alert = await analytics.setUpAlert(
        1,
        "High CPU Usage",
        "cpu_usage > 80",
        80,
        ["email", "slack"]
      );
      expect(alert.name).toBe("High CPU Usage");
      expect(alert.threshold).toBe(80);
      expect(alert.notificationChannels).toContain("email");
    });
  });
});

describe("Marketplace System", () => {
  describe("Categories", () => {
    it("should get marketplace categories", async () => {
      const categories = await marketplace.getCategories();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0].name).toBeDefined();
      expect(categories[0].itemCount).toBeGreaterThanOrEqual(0);
    });

    it("should have expected categories", async () => {
      const categories = await marketplace.getCategories();
      const categoryNames = categories.map((c) => c.name);
      expect(categoryNames).toContain("Automation");
      expect(categoryNames).toContain("Integrations");
    });
  });

  describe("Item Management", () => {
    it("should publish marketplace item", async () => {
      const item = await marketplace.publishItem(
        {
          name: "Test Template",
          description: "A test template",
          type: "template",
          category: "automation",
          author: { id: 1, name: "Test Author" },
          version: "1.0.0",
          rating: 0,
          downloads: 0,
          featured: false,
          verified: false,
          tags: ["test"],
          price: 0,
          currency: "USD",
          license: "MIT",
        },
        1
      );

      expect(item.id).toBeDefined();
      expect(item.name).toBe("Test Template");
      expect(item.createdAt).toBeInstanceOf(Date);
    });

    it("should get featured items", async () => {
      const items = await marketplace.getFeaturedItems(5);
      expect(Array.isArray(items)).toBe(true);
    });

    it("should get trending items", async () => {
      const items = await marketplace.getTrendingItems(5);
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("Reviews", () => {
    it("should add review", async () => {
      const review = await marketplace.addReview(
        "item_1",
        1,
        5,
        "Great template!",
        "This template is very useful"
      );

      expect(review.id).toBeDefined();
      expect(review.itemId).toBe("item_1");
      expect(review.rating).toBe(5);
      expect(review.createdAt).toBeInstanceOf(Date);
    });

    it("should mark review as helpful", async () => {
      const helpful = await marketplace.markReviewHelpful("review_1");
      expect(helpful).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Installation", () => {
    it("should install marketplace item", async () => {
      const result = await marketplace.installMarketplaceItem("item_1", 1);
      expect(result.success).toBe(false); // Item doesn't exist
      expect(result.message).toBeDefined();
    });
  });

  describe("Statistics", () => {
    it("should get marketplace statistics", async () => {
      const stats = await marketplace.getMarketplaceStats();
      expect(stats.totalItems).toBeGreaterThanOrEqual(0);
      expect(stats.totalDownloads).toBeGreaterThanOrEqual(0);
      expect(stats.averageRating).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Recommendations", () => {
    it("should get marketplace recommendations", async () => {
      const recommendations = await marketplace.getRecommendations(1, 5);
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
});

describe("Integration Tests", () => {
  it("should track usage and generate report", async () => {
    // Track some usage
    await billing.trackUsage(1, "workflow");
    await billing.trackUsage(1, "execution", 5);

    // Get usage
    const usage = await billing.getUsage(1);
    expect(usage.organizationId).toBe(1);

    // Generate analytics report
    const report = await analytics.generateAnalyticsReport(1, new Date(), new Date());
    expect(report.period).toBeDefined();
    expect(report.topWorkflows).toEqual([]);
  });

  it("should handle subscription and analytics together", async () => {
    // Create subscription
    const subscription = await billing.createSubscription(1, "pro");
    expect(subscription.planType).toBe("pro");

    // Track analytics
    await analytics.trackUserAction(1, 1, "subscription_created", "subscription");

    // Get metrics
    const metrics = await analytics.getRealTimeMetrics(1);
    expect(metrics).toBeDefined();
  });

  it("should publish and search marketplace items", async () => {
    // Publish item
    const item = await marketplace.publishItem(
      {
        name: "Integration Test Item",
        description: "For testing",
        type: "template",
        category: "automation",
        author: { id: 1, name: "Test" },
        version: "1.0.0",
        rating: 0,
        downloads: 0,
        featured: false,
        verified: false,
        tags: ["test"],
        price: 0,
        currency: "USD",
        license: "MIT",
      },
      1
    );

    expect(item.id).toBeDefined();
    expect(item.name).toBe("Integration Test Item");

    // Get categories
    const categories = await marketplace.getCategories();
    expect(categories.length).toBeGreaterThan(0);
  });
});
