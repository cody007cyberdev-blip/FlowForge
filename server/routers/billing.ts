/**
 * Billing & Subscription tRPC Router
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import * as billingService from "../billing";
import * as analyticsService from "../analytics";

export const billingRouter = router({
  /**
   * Get current subscription
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    // TODO: Get organization from user context
    const organizationId = 1; // Placeholder
    const subscription = await billingService.getSubscription(organizationId);
    return subscription;
  }),

  /**
   * Get plan details
   */
  getPlan: publicProcedure
    .input(z.enum(["free", "pro", "business", "enterprise"]))
    .query(({ input }) => {
      return billingService.getPlan(input);
    }),

  /**
   * Get all plans
   */
  getAllPlans: publicProcedure.query(() => {
    return billingService.getAllPlans();
  }),

  /**
   * Get usage
   */
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    // TODO: Get organization from user context
    const organizationId = 1; // Placeholder
    const usage = await billingService.getUsage(organizationId);
    return usage;
  }),

  /**
   * Get usage percentage
   */
  getUsagePercentage: protectedProcedure
    .input(z.enum(["workflows", "executions", "storage", "teamMembers"]))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      // TODO: Get organization from user context
      const organizationId = 1; // Placeholder
      const percentage = await billingService.getUsagePercentage(
        organizationId,
        input
      );
      return { metric: input, percentage };
    }),

  /**
   * Upgrade plan
   */
  upgradePlan: protectedProcedure
    .input(
      z.object({
        planType: z.enum(["free", "pro", "business", "enterprise"]),
        billingCycle: z.enum(["monthly", "yearly"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      // TODO: Get organization from user context
      const organizationId = 1; // Placeholder
      // TODO: Implement Stripe integration
      const subscription = await billingService.createSubscription(
        organizationId,
        input.planType
      );

      // Track analytics
      await analyticsService.trackUserAction(
        organizationId,
        ctx.user.id,
        "plan_upgraded",
        "subscription",
        subscription.organizationId
      );

      return subscription;
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        immediate: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      // TODO: Get organization from user context
      const organizationId = 1; // Placeholder
      const subscription = await billingService.cancelSubscription(
        organizationId,
        input.immediate
      );

      // Track analytics
      await analyticsService.trackUserAction(
        organizationId,
        ctx.user.id,
        "subscription_canceled",
        "subscription"
      );

      return subscription;
    }),

  /**
   * Get billing history
   */
  getBillingHistory: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    // TODO: Get organization from user context
    const organizationId = 1; // Placeholder
    const history = await billingService.getBillingHistory(organizationId);
    return history;
  }),

  /**
   * Get invoice
   */
  getInvoice: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return billingService.getInvoice(input);
    }),

  /**
   * Calculate price
   */
  calculatePrice: publicProcedure
    .input(
      z.object({
        planType: z.enum(["free", "pro", "business", "enterprise"]),
        billingCycle: z.enum(["monthly", "yearly"]),
      })
    )
    .query(({ input }) => {
      const price = billingService.calculatePrice(input.planType, input.billingCycle);
      return {
        planType: input.planType,
        billingCycle: input.billingCycle,
        price,
        currency: "USD",
      };
    }),

  /**
   * Check if trial is active
   */
  isTrialActive: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    // TODO: Get organization from user context
    const organizationId = 1; // Placeholder
    const isActive = await billingService.isTrialActive(organizationId);
    return { isActive };
  }),

  /**
   * Start trial
   */
  startTrial: protectedProcedure
    .input(
      z.object({
        trialDays: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error("Not authenticated");
      }

      // TODO: Get organization from user context
      const organizationId = 1; // Placeholder
      const subscription = await billingService.startTrial(
        organizationId,
        input.trialDays
      );

      // Track analytics
      await analyticsService.trackUserAction(
        organizationId,
        ctx.user.id,
        "trial_started",
        "subscription"
      );

      return subscription;
    }),

  /**
   * Send usage warning
   */
  sendUsageWarning: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("Not authenticated");
    }

    // TODO: Get organization from user context
    const organizationId = 1; // Placeholder
    await billingService.sendUsageWarning(organizationId);
    return { success: true };
  }),
});
