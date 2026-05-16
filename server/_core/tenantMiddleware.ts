/**
 * Tenant Context Middleware for tRPC
 * Extracts and validates tenant context from request headers
 * Enforces multi-tenant isolation at the procedure level
 */

import { TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import type { TrpcContext } from "./context";
import { getTenantContext, isOrganizationAdmin, isOrganizationOwner } from "../rls";

const t = initTRPC.context<TrpcContext>().create();

export interface TenantContextData {
  userId: number;
  organizationId: number;
  workspaceId?: number;
  teamId?: number;
  role: "owner" | "admin" | "member" | "editor" | "viewer";
  permissions: string[];
}

/**
 * Extract tenant context from request
 * Expected headers:
 * - x-organization-id: Organization ID
 * - x-workspace-id: (optional) Workspace ID
 * - x-team-id: (optional) Team ID
 */
export async function extractTenantContext(
  userId: number,
  headers: Record<string, string | string[] | undefined>
): Promise<TenantContextData | null> {
  const orgIdHeader = headers["x-organization-id"];
  const workspaceIdHeader = headers["x-workspace-id"];
  const teamIdHeader = headers["x-team-id"];

  // Organization ID is required
  if (!orgIdHeader) {
    return null;
  }

  const organizationId = parseInt(
    Array.isArray(orgIdHeader) ? orgIdHeader[0] : orgIdHeader,
    10
  );

  if (isNaN(organizationId)) {
    return null;
  }

  // Get tenant context from database
  const context = await getTenantContext(userId, organizationId);
  if (!context) {
    return null;
  }

  // Parse optional workspace and team IDs
  let workspaceId: number | undefined;
  let teamId: number | undefined;

  if (workspaceIdHeader) {
    workspaceId = parseInt(
      Array.isArray(workspaceIdHeader) ? workspaceIdHeader[0] : workspaceIdHeader,
      10
    );
    if (isNaN(workspaceId)) {
      workspaceId = undefined;
    }
  }

  if (teamIdHeader) {
    teamId = parseInt(
      Array.isArray(teamIdHeader) ? teamIdHeader[0] : teamIdHeader,
      10
    );
    if (isNaN(teamId)) {
      teamId = undefined;
    }
  }

  return {
    ...context,
    workspaceId,
    teamId,
  };
}

/**
 * Middleware to enforce tenant context
 */
export const tenantMiddleware = t.middleware(async (opts: any) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  // Extract tenant context from headers
  const headers = ctx.req?.headers || {};
  const tenantContext = await extractTenantContext(ctx.user.id, headers as Record<string, string>);

  if (!tenantContext) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Invalid or missing tenant context",
    });
  }

  return next({
    ctx: {
      ...ctx,
      tenant: tenantContext,
    },
  });
});

/**
 * Middleware to enforce admin-only access
 */
export const adminMiddleware = t.middleware(async (opts: any) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  // Extract tenant context
  const headers = ctx.req?.headers || {};
  const tenantContext = await extractTenantContext(ctx.user.id, headers as Record<string, string>);

  if (!tenantContext) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Invalid or missing tenant context",
    });
  }

  // Check admin status
  const isAdmin = await isOrganizationAdmin(ctx.user.id, tenantContext.organizationId);
  if (!isAdmin) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      tenant: tenantContext,
    },
  });
});

/**
 * Middleware to enforce owner-only access
 */
export const ownerMiddleware = t.middleware(async (opts: any) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  // Extract tenant context
  const headers = ctx.req?.headers || {};
  const tenantContext = await extractTenantContext(ctx.user.id, headers as Record<string, string>);

  if (!tenantContext) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Invalid or missing tenant context",
    });
  }

  // Check owner status
  const isOwner = await isOrganizationOwner(ctx.user.id, tenantContext.organizationId);
  if (!isOwner) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Owner access required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      tenant: tenantContext,
    },
  });
});

/**
 * Middleware to enforce permission-based access
 */
export function permissionMiddleware(requiredPermission: string) {
  return t.middleware(async (opts: any) => {
    const { ctx, next } = opts;

    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    // Extract tenant context
    const headers = ctx.req?.headers || {};
    const tenantContext = await extractTenantContext(ctx.user.id, headers as Record<string, string>);

    if (!tenantContext) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invalid or missing tenant context",
      });
    }

    // Check permission
    if (!tenantContext.permissions.includes(requiredPermission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Permission required: ${requiredPermission}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        tenant: tenantContext,
      },
    });
  });
}

/**
 * Create protected procedures with tenant context
 */
export const tenantProcedure = t.procedure.use(tenantMiddleware);
export const adminProcedure = t.procedure.use(adminMiddleware);
export const ownerProcedure = t.procedure.use(ownerMiddleware);
