/**
 * Workflow Runner - Executes workflows and records execution history
 */

import * as db from "./db";
import { topologicalSort, getNodeInputs, interpolateVariables, evaluateCondition, mergeNodeResults } from "./executor";
import { getNodeExecutor, getNodeConfig } from "./nodes";
import { WorkflowNode, WorkflowEdge } from "./executor";

export interface RunnerOptions {
  workflowId: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  triggerData?: Record<string, unknown>;
  triggerSource?: "manual" | "webhook" | "cron" | "api";
}

export async function runWorkflow(options: RunnerOptions) {
  const { workflowId, nodes, edges, triggerData = {}, triggerSource = "manual" } = options;

  const startTime = new Date();
  let execution: any = null;

  try {
    // Create execution record
    execution = await db.createExecution({
      workflowId,
      workspaceId: 1, // TODO: Get from context
      status: "running",
      startedAt: startTime,
      input: JSON.stringify(triggerData),
    });

    const executionId = (execution as any)[0]?.id || 1;

    // Sort nodes topologically
    const sortedNodes = topologicalSort(nodes, edges);

    // Initialize execution context
    const variables: Record<string, unknown> = {
      trigger: triggerData,
      timestamp: startTime.toISOString(),
    };

    // Execute each node
    for (const node of sortedNodes) {
      const nodeConfig = getNodeConfig(node.type);
      const nodeExecutor = getNodeExecutor(node.type);

      if (!nodeConfig || !nodeExecutor) {
        throw new Error(`Unknown node type: ${node.type}`);
      }

      const stepStartTime = new Date();

      try {
        // Get input data from previous nodes
        const inputEdges = getNodeInputs(node.id, edges);
        const nodeInput: Record<string, unknown> = {};

        for (const edge of inputEdges) {
          const sourceNodeId = edge.source;
          nodeInput[edge.targetHandle || "input"] = variables[sourceNodeId];
        }

        // Interpolate variables in node config
        const interpolatedConfig = interpolateVariables(node.data, variables) as Record<string, unknown>;

        // Execute node
        let result: unknown;
        if (node.type === "logic-conditional") {
          // Special handling for conditional nodes
          const condition = interpolatedConfig.condition as string;
          result = evaluateCondition(condition, variables);
        } else {
          result = await nodeExecutor.execute(interpolatedConfig, nodeInput);
        }

        // Record step
        const stepEndTime = new Date();
        await db.createExecutionStep({
          executionId,
          nodeId: node.id,
          nodeType: node.type,
          status: "success",
          input: JSON.stringify(nodeInput),
          output: JSON.stringify(result),
          startedAt: stepStartTime,
          completedAt: stepEndTime,
          duration: stepEndTime.getTime() - stepStartTime.getTime(),
        });

        // Merge result into variables
        variables[node.id] = result;
      } catch (error) {
        // Record failed step
        const stepEndTime = new Date();
        await db.createExecutionStep({
          executionId,
          nodeId: node.id,
          nodeType: node.type,
          status: "failed",
          error: String(error),
          startedAt: stepStartTime,
          completedAt: stepEndTime,
          duration: stepEndTime.getTime() - stepStartTime.getTime(),
        });

        throw error;
      }
    }

    // Mark execution as successful
    const endTime = new Date();
    await db.updateExecution(executionId, {
      status: "success",
      completedAt: endTime,
      duration: endTime.getTime() - startTime.getTime(),
    });

    return { success: true, executionId, duration: endTime.getTime() - startTime.getTime() };
  } catch (error) {
    // Mark execution as failed
    const endTime = new Date();
    const errorMessage = String(error);

    if (execution) {
      const executionId = (execution as any)[0]?.id || 1;
      await db.updateExecution(executionId, {
        status: "failed",
        error: errorMessage,
        completedAt: endTime,
        duration: endTime.getTime() - startTime.getTime(),
      });
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Execute workflow with retry logic
 */
export async function runWorkflowWithRetry(
  options: RunnerOptions,
  maxRetries = 3,
  retryDelayMs = 1000
) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await runWorkflow(options);
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelayMs * Math.pow(2, attempt)));
      }
    }
  }

  return { success: false, error: lastError?.message || "Max retries exceeded" };
}
