from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from datetime import datetime
import os
from typing import List, Dict, Any, Optional

from .config.database import get_db_connection, get_mongo_connection
from .analyzers.threat_analyzer import ThreatAnalyzer
from .collectors.metrics_collector import MetricsCollector
from .processors.data_processor import DataProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="OmnisecAI Monitoring Service",
    description="AI Security Monitoring and Analytics Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
threat_analyzer = ThreatAnalyzer()
metrics_collector = MetricsCollector()
data_processor = DataProcessor()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        logger.info("Starting OmnisecAI Monitoring Service...")
        
        # Test database connections
        await get_db_connection()
        await get_mongo_connection()
        
        # Initialize analyzers
        await threat_analyzer.initialize()
        await metrics_collector.initialize()
        
        logger.info("All services initialized successfully")
    except Exception as e:
        logger.error(f"Startup failed: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down OmnisecAI Monitoring Service...")
    await threat_analyzer.cleanup()
    await metrics_collector.cleanup()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "service": "monitoring"
    }

@app.get("/api/v1/analytics/threats")
async def get_threat_analytics(
    organization_id: str,
    days: int = 7,
    severity: Optional[str] = None
):
    """Get threat analytics for organization"""
    try:
        analytics = await threat_analyzer.analyze_threats(
            organization_id=organization_id,
            days=days,
            severity=severity
        )
        return {
            "success": True,
            "data": analytics,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Threat analytics failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get threat analytics")

@app.get("/api/v1/analytics/models")
async def get_model_analytics(
    organization_id: str,
    model_id: Optional[str] = None
):
    """Get model security analytics"""
    try:
        analytics = await threat_analyzer.analyze_model_security(
            organization_id=organization_id,
            model_id=model_id
        )
        return {
            "success": True,
            "data": analytics,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Model analytics failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get model analytics")

@app.get("/api/v1/metrics/system")
async def get_system_metrics():
    """Get system performance metrics"""
    try:
        metrics = await metrics_collector.collect_system_metrics()
        return {
            "success": True,
            "data": metrics,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"System metrics failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get system metrics")

@app.get("/api/v1/metrics/security")
async def get_security_metrics(organization_id: str):
    """Get security metrics for organization"""
    try:
        metrics = await metrics_collector.collect_security_metrics(organization_id)
        return {
            "success": True,
            "data": metrics,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Security metrics failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get security metrics")

@app.post("/api/v1/analyze/model")
async def analyze_model(
    organization_id: str,
    model_id: str,
    analysis_type: str = "full"
):
    """Trigger model security analysis"""
    try:
        result = await threat_analyzer.analyze_model(
            organization_id=organization_id,
            model_id=model_id,
            analysis_type=analysis_type
        )
        return {
            "success": True,
            "data": result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Model analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze model")

@app.get("/api/v1/reports/security")
async def generate_security_report(
    organization_id: str,
    report_type: str = "summary",
    days: int = 30
):
    """Generate security report"""
    try:
        report = await data_processor.generate_security_report(
            organization_id=organization_id,
            report_type=report_type,
            days=days
        )
        return {
            "success": True,
            "data": report,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Security report failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate security report")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "OmnisecAI Monitoring Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "analytics": "/api/v1/analytics/",
            "metrics": "/api/v1/metrics/",
            "reports": "/api/v1/reports/"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=9000,
        reload=True,
        log_level="info"
    )