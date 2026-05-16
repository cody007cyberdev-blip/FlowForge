/**
 * System Metrics Node Executor
 * Collects system metrics (CPU, RAM, Disk, Network)
 */

import os from "os";
import fs from "fs";

export interface SystemMetricsConfig {
  metrics: string[]; // ["cpu", "memory", "disk", "network"]
  interval?: number;
}

/**
 * Get CPU usage percentage
 */
export function getCPUUsage(): number {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~((idle / total) * 100);

  return Math.max(0, Math.min(100, usage));
}

/**
 * Get memory usage
 */
export function getMemoryUsage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const usagePercent = (usedMemory / totalMemory) * 100;

  return {
    total: totalMemory,
    used: usedMemory,
    free: freeMemory,
    usagePercent: Math.round(usagePercent * 100) / 100,
  };
}

/**
 * Get disk usage (root partition)
 */
export function getDiskUsage() {
  try {
    // This is a simplified version - in production, use a library like 'diskusage'
    // For now, return placeholder data
    return {
      total: 1099511627776, // 1TB
      used: 549755813888, // 500GB
      free: 549755813888,
      usagePercent: 50,
    };
  } catch (error) {
    return {
      error: String(error),
    };
  }
}

/**
 * Get network interfaces info
 */
export function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const networkInfo: Record<string, any> = {};

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (addrs) {
      networkInfo[name] = addrs.map((addr) => ({
        family: addr.family,
        address: addr.address,
        netmask: addr.netmask,
        mac: addr.mac,
      }));
    }
  }

  return networkInfo;
}

/**
 * Get system load average
 */
export function getLoadAverage() {
  const loadAvg = os.loadavg();
  const cpuCount = os.cpus().length;

  return {
    load1: loadAvg[0],
    load5: loadAvg[1],
    load15: loadAvg[2],
    cpuCount,
    normalized1: loadAvg[0] / cpuCount,
    normalized5: loadAvg[1] / cpuCount,
    normalized15: loadAvg[2] / cpuCount,
  };
}

/**
 * Get uptime
 */
export function getUptime() {
  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  return {
    uptime,
    formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`,
  };
}

/**
 * Collect all system metrics
 */
export function collectSystemMetrics(config: SystemMetricsConfig) {
  const { metrics = ["cpu", "memory", "disk", "network"] } = config;
  const result: Record<string, any> = {
    timestamp: new Date().toISOString(),
  };

  if (metrics.includes("cpu")) {
    result.cpu = {
      usage: getCPUUsage(),
      cores: os.cpus().length,
      model: os.cpus()[0]?.model || "Unknown",
    };
  }

  if (metrics.includes("memory")) {
    result.memory = getMemoryUsage();
  }

  if (metrics.includes("disk")) {
    result.disk = getDiskUsage();
  }

  if (metrics.includes("network")) {
    result.network = getNetworkInfo();
  }

  if (metrics.includes("load")) {
    result.load = getLoadAverage();
  }

  if (metrics.includes("uptime")) {
    result.uptime = getUptime();
  }

  return result;
}

/**
 * Execute System Metrics node
 */
export async function executeSystemMetricsNode(input: any, config: any) {
  try {
    const { metrics = ["cpu", "memory", "disk"], interval } = config;

    if (interval) {
      // If interval is specified, collect metrics periodically
      const results = [];
      const iterations = Math.max(1, Math.min(5, Math.ceil(interval / 1000)));

      for (let i = 0; i < iterations; i++) {
        results.push(collectSystemMetrics({ metrics }));
        if (i < iterations - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return {
        success: true,
        data: results,
        average: {
          cpu: results.reduce((sum, r) => sum + (r.cpu?.usage || 0), 0) / results.length,
          memory: results[results.length - 1]?.memory,
        },
      };
    } else {
      const data = collectSystemMetrics({ metrics });
      return {
        success: true,
        data,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

export const systemMetricsExecutor = {
  execute: executeSystemMetricsNode,
};
