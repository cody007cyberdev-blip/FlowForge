import { eq, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  workflows, InsertWorkflow,
  executions, InsertExecution,
  executionSteps, InsertExecutionStep,
  credentials, InsertCredential,
  webhooks, InsertWebhook,
  files, InsertFile
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Workflow queries
 */
export async function createWorkflow(data: InsertWorkflow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(workflows).values(data);
  return result;
}

export async function getWorkflowsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(workflows).where(eq(workflows.userId, userId));
}

// Workspace filtering will be added in future multi-tenant implementation

export async function getWorkflowById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);
  return result[0] || null;
}

export async function updateWorkflow(id: number, data: Partial<InsertWorkflow>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(workflows).set(data).where(eq(workflows.id, id));
}

export async function deleteWorkflow(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(workflows).where(eq(workflows.id, id));
}

export async function searchWorkflowsByName(userId: number, searchTerm: string) {
  const db = await getDb();
  if (!db) return [];
  
  const { like, and: drizzleAnd } = await import("drizzle-orm");
  const searchPattern = `%${searchTerm}%`;
  
  try {
    return await db.select().from(workflows).where(
      drizzleAnd(
        eq(workflows.userId, userId),
        like(workflows.name, searchPattern)
      )
    );
  } catch (error) {
    // If workspaceId column doesn't exist, fallback to userId-only query
    console.warn("Search with workspaceId failed, using userId only", error);
    return await db.select().from(workflows).where(
      drizzleAnd(
        eq(workflows.userId, userId),
        like(workflows.name, searchPattern)
      )
    );
  }
}

/**
 * Execution queries
 */
export async function createExecution(data: InsertExecution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(executions).values(data);
  return result;
}

export async function getExecutionsByWorkflowId(workflowId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(executions)
    .where(eq(executions.workflowId, workflowId))
    .orderBy(desc(executions.createdAt))
    .limit(limit);
}

export async function getExecutionById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(executions).where(eq(executions.id, id)).limit(1);
  return result[0] || null;
}

export async function updateExecution(id: number, data: Partial<InsertExecution>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(executions).set(data).where(eq(executions.id, id));
}

/**
 * ExecutionStep queries
 */
export async function createExecutionStep(data: InsertExecutionStep) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(executionSteps).values(data);
}

export async function getExecutionStepsByExecutionId(executionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(executionSteps)
    .where(eq(executionSteps.executionId, executionId))
    .orderBy(asc(executionSteps.createdAt));
}

/**
 * Credential queries
 */
export async function createCredential(data: InsertCredential) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(credentials).values(data);
}

export async function getCredentialsByWorkspaceId(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(credentials).where(eq(credentials.workspaceId, workspaceId));
}

export async function getCredentialById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(credentials).where(eq(credentials.id, id)).limit(1);
  return result[0] || null;
}

export async function deleteCredential(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(credentials).where(eq(credentials.id, id));
}

/**
 * Webhook queries
 */
export async function createWebhook(data: InsertWebhook) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(webhooks).values(data);
}

export async function getWebhooksByWorkflowId(workflowId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(webhooks).where(eq(webhooks.workflowId, workflowId));
}

export async function getWebhookByUrl(webhookUrl: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(webhooks).where(eq(webhooks.url, webhookUrl)).limit(1);
  return result[0] || null;
}

export async function deleteWebhook(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(webhooks).where(eq(webhooks.id, id));
}

/**
 * File queries
 */
export async function createFile(data: InsertFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(files).values(data);
}

export async function getFilesByWorkspaceId(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(files).where(eq(files.workspaceId, workspaceId));
}

export async function getFilesByExecutionId(executionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(files).where(eq(files.executionId, executionId));
}

export async function deleteFile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(files).where(eq(files.id, id));
}

export async function filterWorkflowsByStatus(userId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  const { and: drizzleAnd } = await import("drizzle-orm");
  return db.select().from(workflows).where(
    drizzleAnd(
      eq(workflows.userId, userId),
      eq(workflows.isActive, isActive)
    )
  );
}

export async function filterWorkflowsByNameAndStatus(
  userId: number,
  searchTerm: string,
  isActive?: boolean
) {
  const db = await getDb();
  if (!db) return [];
  
  const { like, and: drizzleAnd } = await import("drizzle-orm");
  const searchPattern = `%${searchTerm}%`;
  
  const conditions: any[] = [
    eq(workflows.userId, userId),
  ];
  
  if (searchTerm) {
    const { like: drizzleLike } = await import("drizzle-orm");
    conditions.push(drizzleLike(workflows.name, searchPattern));
  }
  
  if (isActive !== undefined) {
    conditions.push(eq(workflows.isActive, isActive));
  }
  
  return db.select().from(workflows).where(drizzleAnd(...conditions));
}
