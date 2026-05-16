import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { eq, and, inArray } from "drizzle-orm";


export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  workflows: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      // For now, get all workflows for the user (workspace filtering will be added)
      const workflows = await db.getWorkflowsByUserId(ctx.user.id);
      return workflows.map(w => ({
        ...w,
        nodes: JSON.parse(w.nodes),
        edges: JSON.parse(w.edges),
        triggerConfig: w.triggerConfig ? JSON.parse(w.triggerConfig) : null,
      }));
    }),

    search: protectedProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ ctx, input }) => {
        const workflows = await db.searchWorkflowsByName(ctx.user.id, input.query);
        return workflows.map(w => ({
          ...w,
          nodes: JSON.parse(w.nodes),
          edges: JSON.parse(w.edges),
          triggerConfig: w.triggerConfig ? JSON.parse(w.triggerConfig) : null,
        }));
      }),

    filter: protectedProcedure
      .input(z.object({ 
        query: z.string().optional(),
        isActive: z.boolean().optional()
      }))
      .query(async ({ ctx, input }) => {
        let workflows;
        if (input.query && input.isActive !== undefined) {
          workflows = await db.filterWorkflowsByNameAndStatus(ctx.user.id, input.query, input.isActive);
        } else if (input.isActive !== undefined) {
          workflows = await db.filterWorkflowsByStatus(ctx.user.id, input.isActive);
        } else if (input.query) {
          workflows = await db.searchWorkflowsByName(ctx.user.id, input.query);
        } else {
          workflows = await db.getWorkflowsByUserId(ctx.user.id);
        }
        return workflows.map(w => ({
          ...w,
          nodes: JSON.parse(w.nodes),
          edges: JSON.parse(w.edges),
          triggerConfig: w.triggerConfig ? JSON.parse(w.triggerConfig) : null,
        }));
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const workflow = await db.getWorkflowById(input.id);
        if (!workflow || workflow.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return {
          ...workflow,
          nodes: JSON.parse(workflow.nodes),
          edges: JSON.parse(workflow.edges),
          triggerConfig: workflow.triggerConfig ? JSON.parse(workflow.triggerConfig) : null,
        };
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        nodes: z.array(z.any()),
        edges: z.array(z.any()),
        trigger: z.enum(["manual", "webhook", "cron"]),
        triggerConfig: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createWorkflow({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          nodes: JSON.stringify(input.nodes),
          edges: JSON.stringify(input.edges),
          trigger: input.trigger,
          triggerConfig: input.triggerConfig ? JSON.stringify(input.triggerConfig) : null,
          isActive: false,
        });
        return { success: true, message: "Workflow created successfully" };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        nodes: z.array(z.any()).optional(),
        edges: z.array(z.any()).optional(),
        trigger: z.enum(["manual", "webhook", "cron"]).optional(),
        triggerConfig: z.record(z.string(), z.any()).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const workflow = await db.getWorkflowById(input.id);
        if (!workflow || workflow.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const updateData: Record<string, unknown> = {};
        if (input.name) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.nodes) updateData.nodes = JSON.stringify(input.nodes);
        if (input.edges) updateData.edges = JSON.stringify(input.edges);
        if (input.trigger) updateData.trigger = input.trigger;
        if (input.triggerConfig) updateData.triggerConfig = JSON.stringify(input.triggerConfig);
        if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;

        await db.updateWorkflow(input.id, updateData as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const workflow = await db.getWorkflowById(input.id);
        if (!workflow || workflow.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        await db.deleteWorkflow(input.id);
        return { success: true };
      }),

    execute: protectedProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()).optional() }))
      .mutation(async ({ ctx, input }) => {
        const workflow = await db.getWorkflowById(input.id);
        if (!workflow || workflow.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Import runner here to avoid circular dependencies
        const { runWorkflowWithRetry } = await import("./runner");

        // Execute workflow asynchronously
        runWorkflowWithRetry({
          workflowId: input.id,
          nodes: JSON.parse(workflow.nodes),
          edges: JSON.parse(workflow.edges),
          triggerData: input.data,
          triggerSource: "manual",
        }).catch(error => {
          console.error(`Workflow execution failed: ${error}`);
        });

        return { success: true, message: "Workflow execution started", workflowId: input.id };
      }),
  }),

  llm: router({
    suggestNodeConfig: protectedProcedure
      .input(z.object({ nodeType: z.string(), description: z.string() }))
      .mutation(async ({ input }) => {
        const { suggestNodeConfig } = await import("./llmAssistant");
        return await suggestNodeConfig(input.nodeType, input.description);
      }),

    generateTransform: protectedProcedure
      .input(z.object({ inputSample: z.any(), outputDescription: z.string() }))
      .mutation(async ({ input }) => {
        const { generateTransformExpression } = await import("./llmAssistant");
        return await generateTransformExpression(input.inputSample, input.outputDescription);
      }),

    explainError: protectedProcedure
      .input(z.object({ nodeType: z.string(), errorMessage: z.string(), nodeConfig: z.any() }))
      .mutation(async ({ input }) => {
        const { explainExecutionError } = await import("./llmAssistant");
        return await explainExecutionError(input.nodeType, input.errorMessage, input.nodeConfig);
      }),

    suggestImprovements: protectedProcedure
      .input(z.object({ workflowDescription: z.string(), currentNodes: z.any() }))
      .mutation(async ({ input }) => {
        const { suggestWorkflowImprovements } = await import("./llmAssistant");
        return await suggestWorkflowImprovements(input.workflowDescription, input.currentNodes);
      }),
  }),

  executions: router({
    list: protectedProcedure
      .input(z.object({ workflowId: z.number(), limit: z.number().default(50) }).strict())
      .query(async ({ ctx, input }) => {
        const workflow = await db.getWorkflowById(input.workflowId);
        if (!workflow || workflow.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return db.getExecutionsByWorkflowId(input.workflowId, input.limit);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const execution = await db.getExecutionById(input.id);
        if (!execution) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        const workflow = await db.getWorkflowById(execution.workflowId);
        if (!workflow || workflow.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const steps = await db.getExecutionStepsByExecutionId(input.id);
        return {
          ...execution,
          steps: steps.map(s => ({
            ...s,
            input: s.input ? JSON.parse(s.input) : null,
            output: s.output ? JSON.parse(s.output) : null,
          })),
        };
      }),
  }),

  // ============ WORKSPACES ============
  workspaces: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserWorkspaces } = await import("./workspaceService");
      return getUserWorkspaces(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { createWorkspace } = await import("./workspaceService");
        const workspaceId = await createWorkspace(ctx.user.id, input.name, input.description);
        return { id: workspaceId, success: true };
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const { getWorkspaceWithMembers, checkWorkspacePermission } = await import("./workspaceService");
        const hasAccess = await checkWorkspacePermission(input.id, ctx.user.id, "viewer");
        if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });
        return getWorkspaceWithMembers(input.id);
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { checkWorkspacePermission, updateWorkspace } = await import("./workspaceService");
        const hasAccess = await checkWorkspacePermission(input.id, ctx.user.id, "admin");
        if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });
        await updateWorkspace(input.id, { name: input.name, description: input.description });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { checkWorkspacePermission, deleteWorkspace } = await import("./workspaceService");
        const hasAccess = await checkWorkspacePermission(input.id, ctx.user.id, "owner");
        if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });
        await deleteWorkspace(input.id);
        return { success: true };
      }),

    addMember: protectedProcedure
      .input(z.object({ workspaceId: z.number(), userId: z.number(), role: z.enum(["owner", "admin", "editor", "viewer"]) }))
      .mutation(async ({ input, ctx }) => {
        const { checkWorkspacePermission, addWorkspaceMember } = await import("./workspaceService");
        const hasAccess = await checkWorkspacePermission(input.workspaceId, ctx.user.id, "admin");
        if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });
        await addWorkspaceMember(input.workspaceId, input.userId, input.role);
        return { success: true };
      }),

    removeMember: protectedProcedure
      .input(z.object({ workspaceId: z.number(), userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const { checkWorkspacePermission, removeWorkspaceMember } = await import("./workspaceService");
        const hasAccess = await checkWorkspacePermission(input.workspaceId, ctx.user.id, "admin");
        if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });
        await removeWorkspaceMember(input.workspaceId, input.userId);
        return { success: true };
      }),

    updateMemberRole: protectedProcedure
      .input(z.object({ workspaceId: z.number(), userId: z.number(), role: z.enum(["owner", "admin", "editor", "viewer"]) }))
      .mutation(async ({ input, ctx }) => {
        const { checkWorkspacePermission, updateWorkspaceMemberRole } = await import("./workspaceService");
        const hasAccess = await checkWorkspacePermission(input.workspaceId, ctx.user.id, "admin");
        if (!hasAccess) throw new TRPCError({ code: "FORBIDDEN" });
        await updateWorkspaceMemberRole(input.workspaceId, input.userId, input.role);
        return { success: true };
      }),
   }),

  templates: router({
    list: publicProcedure.query(async () => {
      const { getAllTemplates } = await import("./templates");
      return getAllTemplates();
    }),

    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const { getTemplate } = await import("./templates");
        const template = getTemplate(input.id);
        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return template;
      }),

    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        const { getTemplatesByCategory } = await import("./templates");
        return getTemplatesByCategory(input.category);
      }),

    byDifficulty: publicProcedure
      .input(z.object({ difficulty: z.enum(["beginner", "intermediate", "advanced"]) }))
      .query(async ({ input }) => {
        const { getTemplatesByDifficulty } = await import("./templates");
        return getTemplatesByDifficulty(input.difficulty);
      }),

    search: publicProcedure
      .input(z.object({ tags: z.array(z.string()) }))
      .query(async ({ input }) => {
        const { searchTemplatesByTags } = await import("./templates");
        return searchTemplatesByTags(input.tags);
      }),

    createFromTemplate: protectedProcedure
      .input(z.object({ templateId: z.string(), name: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { getTemplate } = await import("./templates");
        const template = getTemplate(input.templateId);
        if (!template) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const workflow = await db.createWorkflow({
          userId: ctx.user.id,
          name: input.name,
          description: template.description,
          nodes: JSON.stringify(template.nodes),
          edges: JSON.stringify(template.edges),
          trigger: "manual",
          triggerConfig: JSON.stringify({}),
          isActive: false,
        });

        return {
          success: true,
          message: "Workflow created from template",
          templateId: input.templateId,
        };
      }),
  }),
});
export type AppRouter = typeof appRouter;
