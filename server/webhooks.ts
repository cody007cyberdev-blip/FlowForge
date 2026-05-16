/**
 * Webhook Handler - Receives HTTP POST requests and triggers workflows
 */

import { Router, Request, Response } from "express";
import * as db from "./db";
import { runWorkflowWithRetry } from "./runner";

const router = Router();

/**
 * Generate a unique webhook URL for a workflow
 */
export function generateWebhookUrl(workflowId: number, token: string): string {
  return `/api/webhooks/${workflowId}/${token}`;
}

/**
 * Handle incoming webhook requests
 */
router.post("/:workflowId/:token", async (req: Request, res: Response) => {
  try {
    const { workflowId, token } = req.params;
    const workflowIdNum = parseInt(workflowId);

    // Validate workflow exists
    const workflow = await db.getWorkflowById(workflowIdNum);
    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" });
    }

    // Validate webhook URL (token is part of URL)
    const webhookUrl = `/api/webhooks/${workflowId}/${token}`;
    const webhooks = await db.getWebhooksByWorkflowId(workflowIdNum);
    const webhook = webhooks.find((w: any) => w.webhookUrl === webhookUrl);
    if (!webhook) {
      return res.status(401).json({ error: "Invalid webhook URL" });
    }

    // Check if webhook is active
    if (!webhook.isActive) {
      return res.status(403).json({ error: "Webhook is disabled" });
    }

    // Extract trigger data from request
    const triggerData = {
      body: req.body,
      query: req.query,
      headers: req.headers,
      timestamp: new Date().toISOString(),
    };

    // Trigger workflow execution asynchronously
    runWorkflowWithRetry({
      workflowId: workflowIdNum,
      nodes: JSON.parse(workflow.nodes),
      edges: JSON.parse(workflow.edges),
      triggerData,
      triggerSource: "webhook",
    }).catch(error => {
      console.error(`Webhook workflow execution failed: ${error}`);
    });

    // Return success immediately
    res.status(202).json({
      success: true,
      message: "Workflow execution started",
      workflowId: workflowIdNum,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get webhook details
 */
router.get("/:workflowId/:token", async (req: Request, res: Response) => {
  try {
    const { workflowId, token } = req.params;
    const workflowIdNum = parseInt(workflowId);

    const webhookUrl = `/api/webhooks/${workflowId}/${token}`;
    const webhooks = await db.getWebhooksByWorkflowId(workflowIdNum);
    const webhook = webhooks.find((w: any) => w.webhookUrl === webhookUrl);
    if (!webhook) {
      return res.status(401).json({ error: "Invalid webhook URL" });
    }

    res.json({
      id: webhook.id,
      workflowId: webhook.workflowId,
      isActive: webhook.isActive,
      createdAt: webhook.createdAt,
      url: generateWebhookUrl(workflowIdNum, token),
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
