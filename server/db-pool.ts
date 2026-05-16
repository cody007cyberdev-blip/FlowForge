/**
 * Database Connection Pooling & Optimization
 * Implements connection pooling, query caching, and performance optimization
 */

import mysql from "mysql2/promise";
import { createPool, Pool } from "mysql2/promise";

interface PoolConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
  enableKeepAlive: boolean;
  keepAliveInitialDelayMs: number;
}

let connectionPool: Pool | null = null;

/**
 * Initialize database connection pool
 */
export async function initializePool(): Promise<Pool> {
  if (connectionPool) {
    return connectionPool;
  }

  const config: PoolConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "flowforge",
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_SIZE || "20", 10),
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || "0", 10),
    enableKeepAlive: true,
    keepAliveInitialDelayMs: 0,
  };

  try {
    connectionPool = createPool(config);
    console.log("✅ Database connection pool initialized");
    return connectionPool;
  } catch (error) {
    console.error("❌ Failed to initialize connection pool:", error);
    throw error;
  }
}

/**
 * Get connection from pool
 */
export async function getConnection() {
  if (!connectionPool) {
    await initializePool();
  }
  return connectionPool!.getConnection();
}

/**
 * Execute query with connection from pool
 */
export async function executeQuery(query: string, values?: any[]) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(query, values);
    return results;
  } finally {
    connection.release();
  }
}

/**
 * Get pool statistics
 */
export function getPoolStats() {
  if (!connectionPool) {
    return null;
  }

  return {
    connectionLimit: (connectionPool as any).config.connectionLimit,
    queueLimit: (connectionPool as any).config.queueLimit,
    activeConnections: (connectionPool as any)._allConnections?.length || 0,
    idleConnections: (connectionPool as any)._freeConnections?.length || 0,
    waitingQueue: (connectionPool as any)._waitingCallbacks?.length || 0,
  };
}

/**
 * Close connection pool
 */
export async function closePool() {
  if (connectionPool) {
    await connectionPool.end();
    connectionPool = null;
    console.log("✅ Database connection pool closed");
  }
}

/**
 * Health check for database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database health check failed:", error);
    return false;
  }
}
