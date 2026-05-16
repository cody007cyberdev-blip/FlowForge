/**
 * LLM Assistant - AI-powered workflow suggestions and assistance
 */

import { invokeLLM } from "./_core/llm";

/**
 * Suggest node configuration based on user description
 */
export async function suggestNodeConfig(nodeType: string, description: string): Promise<any> {
  try {
    const prompt = `You are a workflow automation expert. The user wants to configure a ${nodeType} node with this description: "${description}".

Suggest a configuration object for this node. Return ONLY a valid JSON object with appropriate fields for a ${nodeType} node.

Common node types and their fields:
- http_request: { method, url, headers, body, timeout }
- email: { to, subject, body, attachments }
- conditional: { condition, trueOutput, falseOutput }
- transform: { expression, outputFormat }
- log: { message, level }

Return only the JSON object, no other text.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a JSON generator for workflow automation. Always return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message.content;
    const contentStr = typeof content === "string" ? content : "{}";
    return JSON.parse(contentStr);
  } catch (error) {
    console.error("LLM suggestion error:", error);
    return {};
  }
}

/**
 * Generate data transformation expression
 */
export async function generateTransformExpression(
  inputSample: any,
  outputDescription: string
): Promise<string> {
  try {
    const prompt = `You are a data transformation expert. Given this input data:
${JSON.stringify(inputSample, null, 2)}

Generate a JavaScript expression that transforms this data according to this requirement: "${outputDescription}"

Return ONLY the JavaScript expression, no explanation or code blocks. The expression should work with the input data.
Example: if input is {name: "John", age: 30} and requirement is "uppercase name", return: input.name.toUpperCase()`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a JavaScript expression generator. Return only valid expressions.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message.content;
    return typeof content === "string" ? content : "input";
  } catch (error) {
    console.error("Transform expression generation error:", error);
    return "input";
  }
}

/**
 * Explain workflow execution error
 */
export async function explainExecutionError(
  nodeType: string,
  errorMessage: string,
  nodeConfig: any
): Promise<string> {
  try {
    const prompt = `A workflow node failed with this error:

Node Type: ${nodeType}
Error: ${errorMessage}
Configuration: ${JSON.stringify(nodeConfig, null, 2)}

Provide a brief, helpful explanation of what went wrong and how to fix it. Be concise and actionable.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful workflow automation debugging assistant. Provide clear, concise explanations.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message.content;
    return typeof content === "string" ? content : "Unable to explain the error.";
  } catch (error) {
    console.error("Error explanation error:", error);
    return "Unable to explain the error.";
  }
}

/**
 * Suggest workflow improvements
 */
export async function suggestWorkflowImprovements(
  workflowDescription: string,
  currentNodes: any[]
): Promise<string[]> {
  try {
    const prompt = `You are a workflow optimization expert. Review this workflow:

Description: ${workflowDescription}
Current Nodes: ${JSON.stringify(currentNodes, null, 2)}

Suggest 3-5 specific improvements or optimizations. Return as a JSON array of strings.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a workflow optimization expert. Return a JSON array of improvement suggestions.",
        },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0]?.message.content;
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : parsed.suggestions || [];
      } catch {
        return [];
      }
    }
    return [];
  } catch (error) {
    console.error("Workflow improvement suggestion error:", error);
    return [];
  }
}
