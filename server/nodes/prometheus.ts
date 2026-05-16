/**
 * Prometheus Node Executor
 * Queries metrics from Prometheus for system monitoring
 */

import axios from "axios";

export interface PrometheusConfig {
  url: string;
  query: string;
  timeout?: number;
  step?: string;
  start?: string;
  end?: string;
}

/**
 * Query Prometheus for instant metrics
 */
export async function queryPrometheus(config: PrometheusConfig) {
  try {
    const { url, query, timeout = 30000 } = config;

    if (!url || !query) {
      throw new Error("URL and query are required");
    }

    const response = await axios.get(`${url}/api/v1/query`, {
      params: {
        query,
      },
      timeout,
    });

    if (response.data.status !== "success") {
      throw new Error(`Prometheus query failed: ${response.data.error}`);
    }

    return {
      success: true,
      data: response.data.data,
      resultType: response.data.data.resultType,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Query Prometheus for range metrics (time series)
 */
export async function queryPrometheusRange(config: PrometheusConfig & { start: string; end: string; step: string }) {
  try {
    const { url, query, start, end, step, timeout = 30000 } = config;

    if (!url || !query || !start || !end || !step) {
      throw new Error("URL, query, start, end, and step are required");
    }

    const response = await axios.get(`${url}/api/v1/query_range`, {
      params: {
        query,
        start,
        end,
        step,
      },
      timeout,
    });

    if (response.data.status !== "success") {
      throw new Error(`Prometheus range query failed: ${response.data.error}`);
    }

    return {
      success: true,
      data: response.data.data,
      resultType: response.data.data.resultType,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Get Prometheus targets status
 */
export async function getPrometheusTargets(config: { url: string; timeout?: number }) {
  try {
    const { url, timeout = 30000 } = config;

    if (!url) {
      throw new Error("URL is required");
    }

    const response = await axios.get(`${url}/api/v1/targets`, {
      timeout,
    });

    if (response.data.status !== "success") {
      throw new Error(`Failed to get targets: ${response.data.error}`);
    }

    return {
      success: true,
      activeTargets: response.data.data.activeTargets.length,
      droppedTargets: response.data.data.droppedTargets.length,
      targets: response.data.data.activeTargets,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Execute Prometheus node
 */
export async function executePrometheusNode(input: any, config: any) {
  try {
    const { operation = "query", url, query, start, end, step } = config;

    if (operation === "query") {
      return await queryPrometheus({ url, query });
    } else if (operation === "range") {
      return await queryPrometheusRange({ url, query, start, end, step });
    } else if (operation === "targets") {
      return await getPrometheusTargets({ url });
    } else {
      throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

export const prometheusExecutor = {
  execute: executePrometheusNode,
};
