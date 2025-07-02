#!/usr/bin/env ts-node

import fs from 'fs-extra';
import path from 'path';
import { connectToDatabase, closeConnection, query } from '../src/config/database';
import logger from '../src/utils/logger';

async function runSeeds(): Promise<void> {
  try {
    logger.info('Starting database seeding...');
    
    // Connect to database
    await connectToDatabase();
    logger.info('Connected to database');

    // Check if data already exists
    const existingOrgs = await query<{ count: string }>('SELECT COUNT(*) as count FROM organizations');
    const orgCount = parseInt(existingOrgs.rows[0]?.['count'] ?? '0', 10);
    
    if (orgCount > 0) {
      logger.warn(`Found ${orgCount} existing organizations. Use --force to override.`);
      const args = process.argv.slice(2);
      if (!args.includes('--force')) {
        logger.info('Skipping seeding. Use --force to seed anyway.');
        return;
      }
      logger.info('Force flag detected, proceeding with seeding...');
    }

    // Read and execute seeds
    const seedsPath = path.join(__dirname, '../src/database/seeds_simple.sql');
    if (!await fs.pathExists(seedsPath)) {
      throw new Error(`Seeds file not found: ${seedsPath}`);
    }

    const seedsSQL = await fs.readFile(seedsPath, 'utf8');
    logger.info('Executing database seeds...');
    
    // Execute the entire seeds file as one transaction
    try {
      await query(seedsSQL);
      logger.info('Seeds executed successfully');
    } catch (error) {
      logger.error('Error executing seeds:', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }

    // Log seeding summary
    const counts = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*) as count FROM organizations'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM users'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM models'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM threat_detections'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM compliance_frameworks')
    ]);

    logger.info('Database seeding completed successfully', {
      organizations: counts[0].rows[0]?.['count'],
      users: counts[1].rows[0]?.['count'],
      models: counts[2].rows[0]?.['count'],
      threats: counts[3].rows[0]?.['count'],
      frameworks: counts[4].rows[0]?.['count']
    });
    
  } catch (error) {
    logger.error('Seeding failed:', {
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
Usage: npm run db:seed [options]

Options:
  --help, -h     Show this help message
  --force        Force seeding even if data exists
  
Examples:
  npm run db:seed
  npm run db:seed -- --force
    `);
    return;
  }

  await runSeeds();
}

if (require.main === module) {
  void main();
}

export { runSeeds };