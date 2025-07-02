#!/usr/bin/env ts-node

import fs from 'fs-extra';
import path from 'path';
import { connectToDatabase, closeConnection, query } from '../src/config/database';
import logger from '../src/utils/logger';

async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');
    
    // Connect to database
    await connectToDatabase();
    logger.info('Connected to database');

    // Read and execute schema
    const schemaPath = path.join(__dirname, '../src/database/schema.sql');
    if (!await fs.pathExists(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schemaSQL = await fs.readFile(schemaPath, 'utf8');
    logger.info('Executing database schema...');
    
    // Execute the entire schema as one transaction
    try {
      await query(schemaSQL);
      logger.info('Schema executed successfully');
    } catch (error) {
      logger.error('Error executing schema:', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }

    logger.info('Database schema migration completed successfully');
    
  } catch (error) {
    logger.error('Migration failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run db:migrate [options]

Options:
  --help, -h     Show this help message
  --force        Force migration even if tables exist
  
Examples:
  npm run db:migrate
  npm run db:migrate -- --force
    `);
    return;
  }

  await runMigrations();
}

if (require.main === module) {
  void main();
}

export { runMigrations };