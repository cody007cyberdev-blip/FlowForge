import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

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
      const workflows = await db.getWorkflowsByUserId(ctx.user.id);
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
          isActive: 0,
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
        // Trigger execution (async job)
        return { success: true, message: "Workflow execution started", workflowId: input.id };
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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
