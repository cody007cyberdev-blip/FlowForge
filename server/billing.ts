/**
 * Billing & Subscription Management
 * Handles plans, subscriptions, usage tracking, and billing
 */

import { getDb } from "./db";

export type PlanType = "free" | "pro" | "business" | "enterprise";

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: {
    workflows: number;
    executions: number;
    storage: number; // GB
    team_members: number;
    api_calls: number;
    support: "community" | "email" | "priority" | "24/7";
    customDomain: boolean;
    advancedAnalytics: boolean;
    sso: boolean;
    audit_logs: boolean;
  };
  limits: {
    maxWorkflows: number;
    maxExecutionsPerDay: number;
    maxStorageGB: number;
    maxTeamMembers: number;
    maxAPICallsPerMonth: number;
  };
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: "plan_free",
    name: "Free",
    type: "free",
    price: 0,
    currency: "USD",
    billingCycle: "monthly",
    features: {
      workflows: 5,
      executions: 100,
      storage: 1,
      team_members: 1,
      api_calls: 1000,
      support: "community",
      customDomain: false,
      advancedAnalytics: false,
      sso: false,
      audit_logs: false,
    },
    limits: {
      maxWorkflows: 5,
      maxExecutionsPerDay: 100,
      maxStorageGB: 1,
      maxTeamMembers: 1,
      maxAPICallsPerMonth: 1000,
    },
  },
  pro: {
    id: "plan_pro",
    name: "Pro",
    type: "pro",
    price: 29,
    currency: "USD",
    billingCycle: "monthly",
    features: {
      workflows: 50,
      executions: 10000,
      storage: 50,
      team_members: 5,
      api_calls: 100000,
      support: "email",
      customDomain: true,
      advancedAnalytics: true,
      sso: false,
      audit_logs: false,
    },
    limits: {
      maxWorkflows: 50,
      maxExecutionsPerDay: 10000,
      maxStorageGB: 50,
      maxTeamMembers: 5,
      maxAPICallsPerMonth: 100000,
    },
  },
  business: {
    id: "plan_business",
    name: "Business",
    type: "business",
    price: 99,
    currency: "USD",
    billingCycle: "monthly",
    features: {
      workflows: 500,
      executions: 100000,
      storage: 500,
      team_members: 25,
      api_calls: 1000000,
      support: "priority",
      customDomain: true,
      advancedAnalytics: true,
      sso: true,
      audit_logs: true,
    },
    limits: {
      maxWorkflows: 500,
      maxExecutionsPerDay: 100000,
      maxStorageGB: 500,
      maxTeamMembers: 25,
      maxAPICallsPerMonth: 1000000,
    },
  },
  enterprise: {
    id: "plan_enterprise",
    name: "Enterprise",
    type: "enterprise",
    price: 0, // Custom pricing
    currency: "USD",
    billingCycle: "yearly",
    features: {
      workflows: 10000,
      executions: 10000000,
      storage: 10000,
      team_members: 1000,
      api_calls: 100000000,
      support: "24/7",
      customDomain: true,
      advancedAnalytics: true,
      sso: true,
      audit_logs: true,
    },
    limits: {
      maxWorkflows: 10000,
      maxExecutionsPerDay: 10000000,
      maxStorageGB: 10000,
      maxTeamMembers: 1000,
      maxAPICallsPerMonth: 100000000,
    },
  },
};

export interface Subscription {
  id: string;
  organizationId: number;
  planType: PlanType;
  status: "active" | "canceled" | "past_due" | "trialing";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface Usage {
  organizationId: number;
  period: Date;
  workflows: number;
  executions: number;
  storage: number;
  apiCalls: number;
  teamMembers: number;
}

/**
 * Get plan details
 */
export function getPlan(planType: PlanType): Plan {
  return PLANS[planType];
}

/**
 * Get all plans
 */
export function getAllPlans(): Plan[] {
  return Object.values(PLANS);
}

/**
 * Check if organization can perform action
 */
export async function canPerformAction(
  organizationId: number,
  action: "create_workflow" | "execute_workflow" | "add_member" | "api_call"
): Promise<boolean> {
  // Get subscription
  const subscription = await getSubscription(organizationId);
  if (!subscription) return false;

  const plan = getPlan(subscription.planType);
  const usage = await getUsage(organizationId);

  switch (action) {
    case "create_workflow":
      return usage.workflows < plan.limits.maxWorkflows;
    case "execute_workflow":
      return usage.executions < plan.limits.maxExecutionsPerDay;
    case "add_member":
      return usage.teamMembers < plan.limits.maxTeamMembers;
    case "api_call":
      return usage.apiCalls < plan.limits.maxAPICallsPerMonth;
    default:
      return false;
  }
}

/**
 * Get subscription for organization
 */
export async function getSubscription(
  organizationId: number
): Promise<Subscription | null> {
  // TODO: Implement database query
  return null;
}

/**
 * Create subscription
 */
export async function createSubscription(
  organizationId: number,
  planType: PlanType,
  stripeSubscriptionId?: string,
  stripeCustomerId?: string
): Promise<Subscription> {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 1);

  const subscription: Subscription = {
    id: `sub_${organizationId}_${Date.now()}`,
    organizationId,
    planType,
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: endDate,
    cancelAtPeriodEnd: false,
    stripeSubscriptionId,
    stripeCustomerId,
  };

  // TODO: Save to database
  return subscription;
}

/**
 * Update subscription
 */
export async function updateSubscription(
  organizationId: number,
  updates: Partial<Subscription>
): Promise<Subscription | null> {
  // TODO: Implement database update
  return null;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  organizationId: number,
  immediate: boolean = false
): Promise<Subscription | null> {
  const subscription = await getSubscription(organizationId);
  if (!subscription) return null;

  return updateSubscription(organizationId, {
    status: immediate ? "canceled" : subscription.status,
    cancelAtPeriodEnd: !immediate,
  });
}

/**
 * Get usage for organization
 */
export async function getUsage(organizationId: number): Promise<Usage> {
  // TODO: Query from database
  return {
    organizationId,
    period: new Date(),
    workflows: 0,
    executions: 0,
    storage: 0,
    apiCalls: 0,
    teamMembers: 0,
  };
}

/**
 * Track usage
 */
export async function trackUsage(
  organizationId: number,
  type: "workflow" | "execution" | "storage" | "api_call" | "team_member",
  amount: number = 1
): Promise<void> {
  // TODO: Implement usage tracking
  console.log(`📊 Tracked ${type}: +${amount} for org ${organizationId}`);
}

/**
 * Get billing history
 */
export async function getBillingHistory(organizationId: number) {
  // TODO: Query from database
  return [];
}

/**
 * Get invoice
 */
export async function getInvoice(invoiceId: string) {
  // TODO: Query from database
  return null;
}

/**
 * Generate invoice
 */
export async function generateInvoice(
  organizationId: number,
  amount: number,
  description: string
) {
  const now = new Date();
  return {
    id: `inv_${organizationId}_${Date.now()}`,
    organizationId,
    amount,
    currency: "USD",
    description,
    status: "draft",
    issuedAt: now,
    dueAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
  };
}

/**
 * Calculate price for plan
 */
export function calculatePrice(
  planType: PlanType,
  billingCycle: "monthly" | "yearly"
): number {
  const plan = getPlan(planType);
  if (billingCycle === "yearly") {
    return plan.price * 12 * 0.8; // 20% discount for yearly
  }
  return plan.price;
}

/**
 * Check if trial period is active
 */
export async function isTrialActive(organizationId: number): Promise<boolean> {
  const subscription = await getSubscription(organizationId);
  if (!subscription) return false;
  return subscription.status === "trialing";
}

/**
 * Start trial
 */
export async function startTrial(
  organizationId: number,
  trialDays: number = 14
): Promise<Subscription> {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + trialDays);

  return createSubscription(organizationId, "pro");
}

/**
 * Get usage percentage
 */
export async function getUsagePercentage(
  organizationId: number,
  metric: "workflows" | "executions" | "storage" | "teamMembers"
): Promise<number> {
  const subscription = await getSubscription(organizationId);
  if (!subscription) return 0;

  const plan = getPlan(subscription.planType);
  const usage = await getUsage(organizationId);

  let limit = 0;
  let current = 0;

  switch (metric) {
    case "workflows":
      limit = plan.limits.maxWorkflows;
      current = usage.workflows;
      break;
    case "executions":
      limit = plan.limits.maxExecutionsPerDay;
      current = usage.executions;
      break;
    case "storage":
      limit = plan.limits.maxStorageGB;
      current = usage.storage;
      break;
    case "teamMembers":
      limit = plan.limits.maxTeamMembers;
      current = usage.teamMembers;
      break;
  }

  return (current / limit) * 100;
}

/**
 * Send usage warning
 */
export async function sendUsageWarning(organizationId: number): Promise<void> {
  const workflowUsage = await getUsagePercentage(organizationId, "workflows");
  const executionUsage = await getUsagePercentage(organizationId, "executions");

  if (workflowUsage > 80 || executionUsage > 80) {
    console.log(`⚠️  Usage warning for org ${organizationId}`);
    // TODO: Send email notification
  }
}
