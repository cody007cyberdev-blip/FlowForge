/**
 * Workflow Executor Engine
 * Handles topological sorting, node execution, and data flow
 */

import { Workflow, Execution, ExecutionStep } from "../drizzle/schema";

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position?: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface ExecutionContext {
  workflowId: number;
  executionId: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, unknown>;
  nodeResults: Record<string, unknown>;
  nodeErrors: Record<string, string>;
}

/**
 * Topological sort using Kahn's algorithm
 * Returns nodes in execution order
 */
export function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  // Initialize
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjList.set(node.id, []);
  });

  // Build adjacency list and calculate in-degrees
  edges.forEach(edge => {
    const current = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, current + 1);
    
    const adj = adjList.get(edge.source) || [];
    adj.push(edge.target);
    adjList.set(edge.source, adj);
  });

  // Find all nodes with in-degree 0
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  const sorted: WorkflowNode[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);
    if (node) {
      sorted.push(node);
    }

    // Process neighbors
    const neighbors = adjList.get(nodeId) || [];
    neighbors.forEach(neighbor => {
      const degree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, degree);
      if (degree === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Check for cycles
  if (sorted.length !== nodes.length) {
    throw new Error("Workflow contains cycles");
  }

  return sorted;
}

/**
 * Get input nodes for a given node
 */
export function getNodeInputs(nodeId: string, edges: WorkflowEdge[]): WorkflowEdge[] {
  return edges.filter(edge => edge.target === nodeId);
}

/**
 * Get output nodes for a given node
 */
export function getNodeOutputs(nodeId: string, edges: WorkflowEdge[]): WorkflowEdge[] {
  return edges.filter(edge => edge.source === nodeId);
}

/**
 * Interpolate variables in a string or object
 */
export function interpolateVariables(
  value: unknown,
  variables: Record<string, unknown>
): unknown {
  if (typeof value === "string") {
    return value.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const keys = key.split(".");
      let result: unknown = variables;
      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = (result as Record<string, unknown>)[k];
        } else {
          return match;
        }
      }
      return String(result);
    });
  }

  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return value.map(v => interpolateVariables(v, variables));
    }
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = interpolateVariables(val, variables);
    }
    return result;
  }

  return value;
}

/**
 * Execute a JavaScript expression with context
 */
export function executeExpression(
  expression: string,
  context: Record<string, unknown>
): unknown {
  try {
    // Create a safe function with context variables
    const keys = Object.keys(context);
    const values = Object.values(context);
    const func = new Function(...keys, `return ${expression}`);
    return func(...values);
  } catch (error) {
    throw new Error(`Expression execution failed: ${String(error)}`);
  }
}

/**
 * Merge node results into variables
 */
export function mergeNodeResults(
  variables: Record<string, unknown>,
  nodeId: string,
  result: unknown
): Record<string, unknown> {
  return {
    ...variables,
    [nodeId]: result,
  };
}

/**
 * Check if a conditional node should proceed
 */
export function evaluateCondition(
  condition: unknown,
  context: Record<string, unknown>
): boolean {
  if (typeof condition === "string") {
    try {
      return executeExpression(condition, context) as boolean;
    } catch {
      return false;
    }
  }
  return Boolean(condition);
}
