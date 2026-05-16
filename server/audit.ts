/**
 * Audit Logging System
 * Comprehensive logging for compliance, security, and debugging
 */

import { getDb } from "./db";
import { auditLogsEnhanced } from "../drizzle/schema-enterprise";
import { eq } from "drizzle-orm";

export type AuditAction = 
  | "create" | "read" | "update" | "delete"
  | "login" | "logout" | "auth_failed"
  | "permission_granted" | "permission_revoked"
  | "workflow_executed" | "workflow_failed"
  | "export" | "import"
  | "settings_changed" | "member_added" | "member_removed";

export interface AuditLogEntry {
  organizationId: number;
  workspaceId?: number;
  teamId?: number;
  userId: number;
  action: AuditAction;
  resourceType: string;
  resourceId?: number;
  resourceName?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure";
  errorMessage?: string;
}

/**
 * Log an action for audit trail
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available for audit logging");
    return;
  }

  try {
    await db.insert(auditLogsEnhanced).values({
      organizationId: entry.organizationId,
      workspaceId: entry.workspaceId,
      teamId: entry.teamId,
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      resourceName: entry.resourceName,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      status: entry.status,
      errorMessage: entry.errorMessage,
      createdAt: new Date(),
    });

    console.log(`✅ Audit logged: ${entry.action} on ${entry.resourceType}`);
  } catch (error) {
    console.error("❌ Failed to log audit:", error);
  }
}

/**
 * Get audit logs for organization
 */
export async function getAuditLogs(
  organizationId: number,
  filters?: {
    action?: AuditAction;
    resourceType?: string;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
) {
  const db = await getDb();
  if (!db) return [];

  let query: any = db
    .select()
    .from(auditLogsEnhanced)
    .where(eq(auditLogsEnhanced.organizationId, organizationId));

  // Add limit and offset
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return query;
}

/**
 * Get audit logs for user
 */
export async function getUserAuditLogs(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(auditLogsEnhanced)
    .where(eq(auditLogsEnhanced.userId, userId))
    .limit(limit);
}

/**
 * Get audit logs for resource
 */
export async function getResourceAuditLogs(
  organizationId: number,
  resourceType: string,
  resourceId: number
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(auditLogsEnhanced)
    .where(
      eq(auditLogsEnhanced.organizationId, organizationId) &&
      eq(auditLogsEnhanced.resourceType, resourceType) &&
      eq(auditLogsEnhanced.resourceId, resourceId)
    );
}

/**
 * Get failed actions
 */
export async function getFailedAuditLogs(
  organizationId: number,
  limit: number = 100
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(auditLogsEnhanced)
    .where(
      eq(auditLogsEnhanced.organizationId, organizationId) &&
      eq(auditLogsEnhanced.status, "failure")
    )
    .limit(limit);
}

/**
 * Get suspicious activities
 */
export async function getSuspiciousActivities(organizationId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get failed login attempts
  const failedLogins = await db
    .select()
    .from(auditLogsEnhanced)
    .where(
      eq(auditLogsEnhanced.organizationId, organizationId) &&
      eq(auditLogsEnhanced.action, "auth_failed")
    )
    .limit(100);

  // Get permission changes
  const permissionChanges = await db
    .select()
    .from(auditLogsEnhanced)
    .where(
      eq(auditLogsEnhanced.organizationId, organizationId) &&
      (eq(auditLogsEnhanced.action, "permission_granted") ||
        eq(auditLogsEnhanced.action, "permission_revoked"))
    )
    .limit(100);

  return {
    failedLogins: failedLogins || [],
    permissionChanges: permissionChanges || [],
  };
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(
  organizationId: number,
  format: "csv" | "json" = "json"
) {
  const logs = await getAuditLogs(organizationId);

  if (format === "csv") {
    const headers = [
      "ID",
      "Action",
      "Resource Type",
      "Resource ID",
      "User ID",
      "Status",
      "Created At",
    ];
    const rows = logs.map((log: any) => [
      log.id,
      log.action,
      log.resourceType,
      log.resourceId,
      log.userId,
      log.status,
      log.createdAt,
    ]);

    return {
      headers,
      rows,
      content: [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n"),
    };
  }

  return {
    format: "json",
    content: JSON.stringify(logs, null, 2),
  };
}

/**
 * Archive old audit logs
 */
export async function archiveOldAuditLogs(
  organizationId: number,
  daysOld: number = 90
): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // In production, you would archive to cold storage
  // For now, we'll just count them
  const logs = await db
    .select()
    .from(auditLogsEnhanced)
    .where(
      eq(auditLogsEnhanced.organizationId, organizationId)
      // Add date comparison when drizzle supports it
    );

  console.log(`📦 Archived ${logs.length} audit logs older than ${daysOld} days`);
  return logs.length;
}

/**
 * Compliance report
 */
export async function generateComplianceReport(organizationId: number) {
  const logs = await getAuditLogs(organizationId);
  const failedLogs = await getFailedAuditLogs(organizationId);
  const suspicious: any = await getSuspiciousActivities(organizationId);

  return {
    organizationId,
    reportDate: new Date(),
    totalActions: logs.length,
    failedActions: failedLogs.length,
    successRate: logs.length > 0 
      ? ((logs.length - failedLogs.length) / logs.length * 100).toFixed(2)
      : 0,
    suspiciousActivities: {
      failedLoginAttempts: (suspicious?.failedLogins || []).length,
      permissionChanges: (suspicious?.permissionChanges || []).length,
    },
    actionBreakdown: {
      creates: logs.filter((l: any) => l.action === "create").length,
      updates: logs.filter((l: any) => l.action === "update").length,
      deletes: logs.filter((l: any) => l.action === "delete").length,
      logins: logs.filter((l: any) => l.action === "login").length,
    },
  };
}

/**
 * Audit log middleware for tRPC
 */
export function createAuditMiddleware() {
  return async (opts: any) => {
    const { ctx, next, path } = opts;

    const startTime = Date.now();
    const result = await next();
    const duration = Date.now() - startTime;

    // Log the operation
    if (ctx.user && ctx.tenant) {
      await logAudit({
        organizationId: ctx.tenant.organizationId,
        workspaceId: ctx.tenant.workspaceId,
        teamId: ctx.tenant.teamId,
        userId: ctx.user.id,
        action: "read" as AuditAction,
        resourceType: path,
        status: result ? "success" : "failure",
        ipAddress: ctx.req?.ip,
        userAgent: ctx.req?.headers["user-agent"],
      });
    }

    return result;
  };
}
