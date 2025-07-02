import { Pool, PoolClient, QueryResult } from 'pg';
import logger from '@/utils/logger';
import config from '@/config';

let pool: Pool | null = null;

export async function connectToDatabase(): Promise<Pool> {
  try {
    pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.username,
      password: config.database.password,
      max: config.database.max_connections,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: config.database.ssl
    });
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info('PostgreSQL database connected successfully', {
      database: config.database.database,
      host: config.database.host,
      port: config.database.port,
      timestamp: result.rows[0]?.now
    });
    
    return pool;
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL database', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      config: {
        host: config.database.host,
        port: config.database.port,
        database: config.database.database,
        user: config.database.username
      }
    });
    throw error;
  }
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectToDatabase first.');
  }

  const start = Date.now();
  try {
    const result = await pool.query(text, params) as QueryResult<T>;
    const duration = Date.now() - start;
    
    logger.debug('Database query executed', {
      query: text,
      duration: `${duration}ms`,
      rows: result.rowCount
    });
    
    return result;
  } catch (error) {
    logger.error('Database query failed', {
      query: text,
      params,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function getClient(): Promise<PoolClient> {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectToDatabase first.');
  }
  return pool.connect();
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('PostgreSQL connection pool closed');
  }
}

export function getPool(): Pool | null {
  return pool;
}

process.on('SIGINT', () => {
  void closeConnection();
});

process.on('SIGTERM', () => {
  void closeConnection();
});