/**
 * Join/Merge Node Executor
 * Combines data from multiple parallel execution paths
 */

export interface JoinMergeConfig {
  mode: "merge" | "join" | "concat" | "aggregate";
  joinKey?: string;
  aggregation?: "first" | "last" | "all" | "count";
  timeout?: number;
}

/**
 * Merge multiple data sources
 */
export function mergeData(inputs: any[], config: JoinMergeConfig) {
  try {
    const { mode = "merge", joinKey, aggregation = "all" } = config;

    if (mode === "merge") {
      // Simple merge - combine all objects
      return {
        success: true,
        mode: "merge",
        data: inputs.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        sourceCount: inputs.length,
      };
    } else if (mode === "join") {
      // Join by key
      if (!joinKey) {
        throw new Error("Join key is required for join mode");
      }

      const joined: Record<string, any> = {};
      inputs.forEach((input) => {
        if (Array.isArray(input)) {
          input.forEach((item) => {
            const key = item[joinKey];
            if (key) {
              joined[key] = { ...joined[key], ...item };
            }
          });
        } else if (typeof input === "object") {
          const key = input[joinKey];
          if (key) {
            joined[key] = { ...joined[key], ...input };
          }
        }
      });

      return {
        success: true,
        mode: "join",
        joinKey,
        data: Object.values(joined),
        recordCount: Object.keys(joined).length,
      };
    } else if (mode === "concat") {
      // Concatenate arrays
      const concatenated = inputs.reduce((acc: any[], curr) => {
        if (Array.isArray(curr)) {
          return [...acc, ...curr];
        } else {
          return [...acc, curr];
        }
      }, []);

      return {
        success: true,
        mode: "concat",
        data: concatenated,
        itemCount: concatenated.length,
      };
    } else if (mode === "aggregate") {
      // Aggregate data
      const aggregated: Record<string, any> = {};

      inputs.forEach((input, index) => {
        if (typeof input === "object") {
          Object.entries(input).forEach(([key, value]) => {
            if (!aggregated[key]) {
              aggregated[key] = [];
            }
            aggregated[key].push(value);
          });
        }
      });

      // Apply aggregation function
      const result: Record<string, any> = {};
      Object.entries(aggregated).forEach(([key, values]) => {
        if (aggregation === "first") {
          result[key] = values[0];
        } else if (aggregation === "last") {
          result[key] = values[values.length - 1];
        } else if (aggregation === "count") {
          result[key] = values.length;
        } else {
          result[key] = values;
        }
      });

      return {
        success: true,
        mode: "aggregate",
        aggregation,
        data: result,
        sourceCount: inputs.length,
      };
    } else {
      throw new Error(`Unknown mode: ${mode}`);
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Wait for multiple parallel inputs
 */
export async function waitForInputs(inputs: any[], config: JoinMergeConfig) {
  try {
    const { timeout = 30000 } = config;

    // Simulate waiting for all inputs
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        resolve({
          success: true,
          inputsReceived: inputs.length,
          data: inputs,
        });
      }, Math.min(timeout, 1000));

      // If all inputs are available, resolve immediately
      if (inputs.length > 0) {
        clearTimeout(timer);
        resolve({
          success: true,
          inputsReceived: inputs.length,
          data: inputs,
        });
      }
    });
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Execute Join/Merge node
 */
export async function executeJoinMergeNode(input: any, config: any) {
  try {
    const { mode = "merge", joinKey, aggregation, timeout } = config;

    // Handle input - can be array of inputs or single input
    const inputs = Array.isArray(input) ? input : [input];

    // Wait for inputs if timeout is specified
    if (timeout) {
      await waitForInputs(inputs, { mode, joinKey, aggregation, timeout });
    }

    // Merge/join the data
    return mergeData(inputs, { mode, joinKey, aggregation, timeout });
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

export const joinMergeExecutor = {
  execute: executeJoinMergeNode,
};
