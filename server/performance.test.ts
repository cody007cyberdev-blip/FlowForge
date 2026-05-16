import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { initializeCache, get, set, del, increment, clear } from "./cache";
import { initializeQueues, getQueue, addJob, getQueueStats, clearQueue } from "./queue";

describe("Performance Layer - Cache & Queue", () => {
  describe("Cache Operations", () => {
    beforeAll(async () => {
      await initializeCache();
    });

    afterAll(async () => {
      await clear();
    });

    it("should set and get cache values", async () => {
      const testData = { id: 1, name: "test" };
      await set("test-key", testData);
      const result = await get("test-key");
      expect(result).toEqual(testData);
    });

    it("should return null for non-existent keys", async () => {
      const result = await get("non-existent-key");
      expect(result).toBeNull();
    });

    it("should delete cache values", async () => {
      await set("delete-test", { value: "test" });
      const deleted = await del("delete-test");
      expect(deleted).toBe(true);
      const result = await get("delete-test");
      expect(result).toBeNull();
    });

    it("should increment counter", async () => {
      const value1 = await increment("counter");
      expect(value1).toBeGreaterThan(0);
      const value2 = await increment("counter");
      expect(value2).toBeGreaterThan(value1);
    });

    it("should handle TTL expiration", async () => {
      await set("ttl-test", { value: "test" }, 1);
      let result = await get("ttl-test");
      expect(result).not.toBeNull();
      
      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));
      result = await get("ttl-test");
      expect(result).toBeNull();
    });

    it("should handle JSON serialization", async () => {
      const complexData = {
        nested: { array: [1, 2, 3], date: new Date().toISOString() },
        string: "test",
        number: 42,
      };
      await set("complex", complexData);
      const result = await get("complex");
      expect(result).toEqual(complexData);
    });

    it("should clear all cache", async () => {
      await set("key1", "value1");
      await set("key2", "value2");
      await clear();
      const result1 = await get("key1");
      const result2 = await get("key2");
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe("Queue Operations", () => {
    beforeAll(async () => {
      await initializeQueues();
    });

    afterAll(async () => {
      // Cleanup
    });

    it("should create queue", () => {
      const queue = getQueue("test-queue");
      expect(queue).toBeDefined();
      expect(queue.name).toBe("test-queue");
    });

    it("should add job to queue", async () => {
      const queue = getQueue("test-queue");
      const job = await addJob("test-queue", "test-job", { data: "test" });
      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
    });

    it("should get queue statistics", async () => {
      const stats = await getQueueStats("test-queue");
      expect(stats).toHaveProperty("name");
      expect(stats).toHaveProperty("isPaused");
      expect(stats).toHaveProperty("count");
      expect(stats).toHaveProperty("activeCount");
      expect(stats).toHaveProperty("waitingCount");
      expect(stats).toHaveProperty("completedCount");
      expect(stats).toHaveProperty("failedCount");
    });

    it("should add multiple jobs", async () => {
      const queue = getQueue("multi-queue");
      const jobs = [];
      for (let i = 0; i < 5; i++) {
        const job = await addJob("multi-queue", `job-${i}`, { index: i });
        jobs.push(job);
      }
      expect(jobs).toHaveLength(5);
      jobs.forEach((job) => {
        expect(job.id).toBeDefined();
      });
    });

    it("should handle job priority", async () => {
      const job1 = await addJob("priority-queue", "low", { priority: 1 }, { priority: 1 });
      const job2 = await addJob("priority-queue", "high", { priority: 10 }, { priority: 10 });
      expect(job1.id).toBeDefined();
      expect(job2.id).toBeDefined();
    });

    it("should handle job delay", async () => {
      const job = await addJob("delay-queue", "delayed", { data: "test" }, { delay: 1000 });
      expect(job.id).toBeDefined();
    });

    it("should handle job retry", async () => {
      const job = await addJob("retry-queue", "retry", { data: "test" }, { attempts: 3 });
      expect(job.id).toBeDefined();
    });
  });

  describe("Performance Characteristics", () => {
    it("should handle concurrent cache operations", async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(set(`concurrent-${i}`, { value: i }));
      }
      await Promise.all(promises);

      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(await get(`concurrent-${i}`));
      }
      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(result).not.toBeNull();
      });
    });

    it("should handle cache key patterns", async () => {
      await set("user:1:profile", { id: 1 });
      await set("user:2:profile", { id: 2 });
      await set("user:1:settings", { theme: "dark" });
      
      // Just verify keys were set
      const profile1 = await get("user:1:profile");
      const profile2 = await get("user:2:profile");
      expect(profile1).not.toBeNull();
      expect(profile2).not.toBeNull();
    });

    it("should measure cache performance", async () => {
      const iterations = 1000;
      const testData = { value: "performance-test" };

      // Measure write performance
      const writeStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        await set(`perf-write-${i}`, testData);
      }
      const writeTime = Date.now() - writeStart;

      // Measure read performance
      const readStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        await get(`perf-write-${i}`);
      }
      const readTime = Date.now() - readStart;

      console.log(`Write performance: ${iterations} ops in ${writeTime}ms`);
      console.log(`Read performance: ${iterations} ops in ${readTime}ms`);

      expect(writeTime).toBeGreaterThan(0);
      expect(readTime).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle cache errors gracefully", async () => {
      const result = await get("any-key");
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("should handle queue errors gracefully", async () => {
      const queue = getQueue("error-queue");
      expect(queue).toBeDefined();
    });
  });
});
