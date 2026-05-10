import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Workflows table - stores workflow definitions
 */
export const workflows = mysqlTable("workflows", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: int("isActive").default(0).notNull(), // 0 = false, 1 = true (MySQL compatibility)
  nodes: text("nodes").notNull(), // JSON array of nodes
  edges: text("edges").notNull(), // JSON array of edges
  trigger: varchar("trigger", { length: 50 }).notNull(), // 'manual', 'webhook', 'cron'
  triggerConfig: text("triggerConfig"), // JSON config for trigger
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

/**
 * Executions table - stores workflow execution history
 */
export const executions = mysqlTable("executions", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull(), // 'running', 'success', 'failed', 'cancelled'
  startTime: timestamp("startTime").defaultNow().notNull(),
  endTime: timestamp("endTime"),
  duration: int("duration"), // milliseconds
  error: text("error"),
  triggerSource: varchar("triggerSource", { length: 50 }), // 'manual', 'webhook', 'cron', 'api'
  triggerData: text("triggerData"), // JSON data that triggered execution
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Execution = typeof executions.$inferSelect;
export type InsertExecution = typeof executions.$inferInsert;

/**
 * ExecutionSteps table - stores detailed logs for each node execution
 */
export const executionSteps = mysqlTable("executionSteps", {
  id: int("id").autoincrement().primaryKey(),
  executionId: int("executionId").notNull().references(() => executions.id, { onDelete: "cascade" }),
  nodeId: varchar("nodeId", { length: 255 }).notNull(),
  nodeName: varchar("nodeName", { length: 255 }),
  nodeType: varchar("nodeType", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'pending', 'running', 'success', 'failed', 'skipped'
  input: text("input"), // JSON input data
  output: text("output"), // JSON output data
  error: text("error"),
  startTime: timestamp("startTime").defaultNow().notNull(),
  endTime: timestamp("endTime"),
  duration: int("duration"), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExecutionStep = typeof executionSteps.$inferSelect;
export type InsertExecutionStep = typeof executionSteps.$inferInsert;

/**
 * Credentials table - stores encrypted API credentials and secrets
 */
export const credentials = mysqlTable("credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // 'api_key', 'oauth', 'basic_auth', 'custom'
  encryptedData: text("encryptedData").notNull(), // AES-256 encrypted JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Credential = typeof credentials.$inferSelect;
export type InsertCredential = typeof credentials.$inferInsert;

/**
 * Webhooks table - stores webhook URLs and metadata
 */
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  workflowId: int("workflowId").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  webhookUrl: varchar("webhookUrl", { length: 500 }).notNull().unique(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

/**
 * Files table - stores file metadata for uploads/downloads in workflows
 */
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  executionId: int("executionId").references(() => executions.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key
  fileUrl: varchar("fileUrl", { length: 500 }), // S3 URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;