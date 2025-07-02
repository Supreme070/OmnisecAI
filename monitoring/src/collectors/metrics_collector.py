import logging
import psutil
import asyncio
from datetime import datetime
from typing import Dict, Any

from ..config.database import get_db_connection, get_mongo_connection, get_redis_connection

logger = logging.getLogger(__name__)

class MetricsCollector:
    """System and security metrics collection"""
    
    def __init__(self):
        self.pg_pool = None
        self.mongo_db = None
        self.redis_client = None
    
    async def initialize(self):
        """Initialize the metrics collector"""
        try:
            self.pg_pool = await get_db_connection()
            self.mongo_db = await get_mongo_connection()
            self.redis_client = await get_redis_connection()
            logger.info("Metrics collector initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize metrics collector: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup resources"""
        logger.info("Metrics collector cleanup completed")
    
    async def collect_system_metrics(self) -> Dict[str, Any]:
        """Collect system performance metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            
            # Network metrics
            network = psutil.net_io_counters()
            
            metrics = {
                'timestamp': datetime.utcnow().isoformat(),
                'cpu': {
                    'usage_percent': cpu_percent,
                    'count': cpu_count,
                    'load_average': list(psutil.getloadavg()) if hasattr(psutil, 'getloadavg') else None
                },
                'memory': {
                    'total_gb': round(memory.total / (1024**3), 2),
                    'available_gb': round(memory.available / (1024**3), 2),
                    'used_percent': memory.percent,
                    'free_gb': round(memory.free / (1024**3), 2)
                },
                'disk': {
                    'total_gb': round(disk.total / (1024**3), 2),
                    'used_gb': round(disk.used / (1024**3), 2),
                    'free_gb': round(disk.free / (1024**3), 2),
                    'used_percent': round((disk.used / disk.total) * 100, 2)
                },
                'network': {
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv,
                    'packets_sent': network.packets_sent,
                    'packets_recv': network.packets_recv
                }
            }
            
            # Store metrics in MongoDB
            await self._store_performance_metric('system', metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"System metrics collection failed: {e}")
            raise
    
    async def collect_security_metrics(self, organization_id: str) -> Dict[str, Any]:
        """Collect security-specific metrics"""
        try:
            # Get database metrics
            async with self.pg_pool.acquire() as conn:
                # Active threats
                threats = await conn.fetchrow(
                    "SELECT COUNT(*) as total, COUNT(CASE WHEN NOT is_resolved THEN 1 END) as active FROM security_threats WHERE organization_id = $1",
                    organization_id
                )
                
                # Models count
                models = await conn.fetchrow(
                    "SELECT COUNT(*) as total, COUNT(CASE WHEN is_active THEN 1 END) as active FROM ai_models WHERE organization_id = $1",
                    organization_id
                )
                
                # Recent activity
                recent_activity = await conn.fetchrow(
                    "SELECT COUNT(*) as count FROM audit_logs WHERE organization_id = $1 AND created_at > NOW() - INTERVAL '24 hours'",
                    organization_id
                )
            
            # Get MongoDB metrics
            security_events_24h = await self.mongo_db.security_events.count_documents({
                'organization_id': organization_id,
                'timestamp': {'$gte': datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}
            })
            
            threat_detections_24h = await self.mongo_db.threat_detection_logs.count_documents({
                'organization_id': organization_id,
                'timestamp': {'$gte': datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}
            })
            
            metrics = {
                'timestamp': datetime.utcnow().isoformat(),
                'threats': {
                    'total': threats['total'],
                    'active': threats['active'],
                    'detections_24h': threat_detections_24h
                },
                'models': {
                    'total': models['total'],
                    'active': models['active']
                },
                'activity': {
                    'security_events_24h': security_events_24h,
                    'audit_logs_24h': recent_activity['count']
                },
                'organization_id': organization_id
            }
            
            # Store metrics
            await self._store_performance_metric('security', metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Security metrics collection failed: {e}")
            raise
    
    async def _store_performance_metric(self, metric_type: str, data: Dict[str, Any]):
        """Store performance metric in MongoDB"""
        try:
            await self.mongo_db.performance_metrics.insert_one({
                'timestamp': datetime.utcnow(),
                'metric_type': metric_type,
                'data': data,
                'service': 'monitoring'
            })
        except Exception as e:
            logger.error(f"Failed to store performance metric: {e}")
            # Don't raise - this is not critical