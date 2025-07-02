import asyncpg
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import redis.asyncio as redis
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Database connections
pg_pool: Optional[asyncpg.Pool] = None
mongo_client: Optional[AsyncIOMotorClient] = None
mongo_db = None
redis_client: Optional[redis.Redis] = None

async def get_db_connection():
    """Get PostgreSQL connection pool"""
    global pg_pool
    
    if pg_pool is None:
        try:
            pg_pool = await asyncpg.create_pool(
                host=os.getenv('DB_HOST', 'localhost'),
                port=int(os.getenv('DB_PORT', 5432)),
                database=os.getenv('DB_NAME', 'omnisecai_security'),
                user=os.getenv('DB_USER', 'admin'),
                password=os.getenv('DB_PASSWORD', 'omnisecai_secure_2024'),
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            logger.info("PostgreSQL connection pool created")
        except Exception as e:
            logger.error(f"Failed to create PostgreSQL pool: {e}")
            raise
    
    return pg_pool

async def get_mongo_connection():
    """Get MongoDB connection"""
    global mongo_client, mongo_db
    
    if mongo_client is None:
        try:
            mongo_url = os.getenv('MONGO_URL', 'mongodb://admin:omnisecai_mongo_2024@localhost:27017/omnisecai_logs?authSource=admin')
            mongo_client = AsyncIOMotorClient(mongo_url)
            mongo_db = mongo_client['omnisecai_logs']
            
            # Test connection
            await mongo_client.admin.command('ping')
            logger.info("MongoDB connection established")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    return mongo_db

async def get_redis_connection():
    """Get Redis/Valkey connection"""
    global redis_client
    
    if redis_client is None:
        try:
            redis_url = os.getenv('VALKEY_URL', 'redis://localhost:6379')
            redis_client = redis.from_url(redis_url, decode_responses=True)
            
            # Test connection
            await redis_client.ping()
            logger.info("Redis/Valkey connection established")
        except Exception as e:
            logger.error(f"Failed to connect to Redis/Valkey: {e}")
            raise
    
    return redis_client

async def close_connections():
    """Close all database connections"""
    global pg_pool, mongo_client, redis_client
    
    if pg_pool:
        await pg_pool.close()
        logger.info("PostgreSQL pool closed")
    
    if mongo_client:
        mongo_client.close()
        logger.info("MongoDB connection closed")
    
    if redis_client:
        await redis_client.close()
        logger.info("Redis/Valkey connection closed")