const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'omnisecai_security',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'omnisecai_secure_2024',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

async function connectToDatabase() {
  try {
    pool = new Pool(dbConfig);
    
    // Test the connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info('PostgreSQL database connected successfully', {
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      timestamp: result.rows[0].now
    });
    
    return pool;
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL database', {
      error: error.message,
      stack: error.stack,
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user
      }
    });
    throw error;
  }
}

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
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
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

async function getClient() {
  return pool.connect();
}

async function closeConnection() {
  if (pool) {
    await pool.end();
    logger.info('PostgreSQL connection pool closed');
  }
}

// Handle graceful shutdown
process.on('SIGINT', closeConnection);
process.on('SIGTERM', closeConnection);

module.exports = {
  connectToDatabase,
  query,
  getClient,
  closeConnection,
  pool: () => pool
};