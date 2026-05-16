/**
 * Cron Scheduler - Executes workflows on schedule
 */

import * as db from "./db";
import { runWorkflowWithRetry } from "./runner";
import { CronJob } from "cron";

const activeJobs = new Map<number, CronJob>();

/**
 * Parse cron config and create a CronJob
 */
function createCronJob(workflowId: number, cronExpression: string, callback: () => void): CronJob {
  return new CronJob(cronExpression, callback, null, true, "UTC");
}

/**
 * Start scheduler for a workflow
 */
export async function startWorkflowScheduler(workflowId: number) {
  try {
    const workflow = await db.getWorkflowById(workflowId);
    if (!workflow || !workflow.isActive) {
      return;
    }

    if (workflow.trigger !== "cron") {
      return;
    }

    // Parse cron config
    const triggerConfig = JSON.parse(workflow.triggerConfig || "{}");
    const cronExpression = triggerConfig.cronExpression;

    if (!cronExpression) {
      console.warn(`Workflow ${workflowId} has no cron expression`);
      return;
    }

    // Stop existing job if any
    stopWorkflowScheduler(workflowId);

    // Create and start new job
    const job = createCronJob(workflowId, cronExpression, async () => {
      try {
        await runWorkflowWithRetry({
          workflowId,
          nodes: JSON.parse(workflow.nodes),
          edges: JSON.parse(workflow.edges),
          triggerData: { scheduledAt: new Date().toISOString() },
          triggerSource: "cron",
        });
      } catch (error) {
        console.error(`Scheduled workflow ${workflowId} execution failed:`, error);
      }
    });

    activeJobs.set(workflowId, job);
    console.log(`Scheduler started for workflow ${workflowId}: ${cronExpression}`);
  } catch (error) {
    console.error(`Failed to start scheduler for workflow ${workflowId}:`, error);
  }
}

/**
 * Stop scheduler for a workflow
 */
export function stopWorkflowScheduler(workflowId: number) {
  const job = activeJobs.get(workflowId);
  if (job) {
    job.stop();
    activeJobs.delete(workflowId);
    console.log(`Scheduler stopped for workflow ${workflowId}`);
  }
}

/**
 * Initialize all active schedulers
 */
export async function initializeSchedulers() {
  try {
    // Get all workflows with cron trigger
    // Note: This is a simplified approach; in production, query only active cron workflows
    console.log("Scheduler initialization - querying workflows...");
    const cronWorkflows: any[] = []; // TODO: Query active cron workflows from database

    console.log(`Initializing ${cronWorkflows.length} cron schedulers...`);

    for (const workflow of cronWorkflows) {
      await startWorkflowScheduler(workflow.id);
    }

    console.log("Schedulers initialized successfully");
  } catch (error) {
    console.error("Failed to initialize schedulers:", error);
  }
}

/**
 * Cleanup all schedulers
 */
export function cleanupSchedulers() {
  activeJobs.forEach((job) => {
    job.stop();
  });
  activeJobs.clear();
  console.log("All schedulers cleaned up");
}

/**
 * Handle workflow updates
 */
export async function handleWorkflowUpdate(workflowId: number, isActive: boolean, trigger: string) {
  if (trigger === "cron" && isActive) {
    await startWorkflowScheduler(workflowId);
  } else {
    stopWorkflowScheduler(workflowId);
  }
}
