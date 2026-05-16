/**
 * Slack Alerts Node Executor
 * Sends alerts to Slack channels
 */

import axios from "axios";

export interface SlackAlertConfig {
  webhookUrl: string;
  channel?: string;
  message: string;
  severity?: "info" | "warning" | "error" | "critical";
  title?: string;
  fields?: Record<string, string>;
}

/**
 * Get color based on severity
 */
function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical":
      return "#FF0000"; // Red
    case "error":
      return "#FF6600"; // Orange
    case "warning":
      return "#FFFF00"; // Yellow
    case "info":
    default:
      return "#0099FF"; // Blue
  }
}

/**
 * Send alert to Slack webhook
 */
export async function sendSlackAlert(config: SlackAlertConfig) {
  try {
    const { webhookUrl, channel, message, severity = "info", title, fields } = config;

    if (!webhookUrl) {
      throw new Error("Webhook URL is required");
    }

    const payload: any = {
      text: title || message,
      attachments: [
        {
          color: getSeverityColor(severity),
          title: title,
          text: message,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    // Add channel if specified
    if (channel) {
      payload.channel = channel;
    }

    // Add fields if provided
    if (fields && Object.keys(fields).length > 0) {
      payload.attachments[0].fields = Object.entries(fields).map(([key, value]) => ({
        title: key,
        value: String(value),
        short: true,
      }));
    }

    const response = await axios.post(webhookUrl, payload, {
      timeout: 10000,
    });

    if (response.status !== 200) {
      throw new Error(`Slack API returned status ${response.status}`);
    }

    return {
      success: true,
      message: "Alert sent to Slack",
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Send alert with threshold checking
 */
export async function sendThresholdAlert(config: SlackAlertConfig & { value: number; threshold: number; unit?: string }) {
  try {
    const { value, threshold, unit = "", severity: baseSeverity = "info" } = config;

    // Determine severity based on threshold
    let severity = baseSeverity;
    if (value > threshold * 1.5) {
      severity = "critical";
    } else if (value > threshold) {
      severity = "error";
    } else if (value > threshold * 0.8) {
      severity = "warning";
    }

    const alertConfig = {
      ...config,
      severity: severity as any,
      message: `${config.message}\nCurrent: ${value}${unit} | Threshold: ${threshold}${unit}`,
      fields: {
        ...config.fields,
        Current: `${value}${unit}`,
        Threshold: `${threshold}${unit}`,
        Status: severity.toUpperCase(),
      },
    };

    return await sendSlackAlert(alertConfig);
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Execute Slack Alerts node
 */
export async function executeSlackAlertsNode(input: any, config: any) {
  try {
    const { webhookUrl, channel, message, severity = "info", title, fields, threshold, value, unit } = config;

    if (threshold !== undefined && value !== undefined) {
      // Use threshold-based alerting
      return await sendThresholdAlert({
        webhookUrl,
        channel,
        message,
        severity,
        title,
        fields,
        threshold,
        value,
        unit,
      });
    } else {
      // Send simple alert
      return await sendSlackAlert({
        webhookUrl,
        channel,
        message,
        severity,
        title,
        fields,
      });
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

export const slackAlertsExecutor = {
  execute: executeSlackAlertsNode,
};
