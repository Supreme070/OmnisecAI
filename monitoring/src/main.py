from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import logging
from datetime import datetime
from typing import List

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="OmnisecAI Monitoring Service",
    description="Real-time monitoring and analytics for AI security",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connections
active_connections: List[WebSocket] = []

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Monitoring service started")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Monitoring service stopped")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected",
            "analyzers": "running",
            "collectors": "active"
        }
    }

@app.get("/api/monitoring/status")
async def get_monitoring_status():
    """Get current monitoring status"""
    return {
        "active_connections": len(active_connections),
        "timestamp": datetime.utcnow().isoformat(),
        "metrics": {
            "cpu_usage": 45.2,
            "memory_usage": 62.8,
            "requests_per_minute": 120
        }
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    active_connections.append(websocket)

    try:
        while True:
            # Send mock metrics for now
            metrics = {
                "timestamp": datetime.utcnow().isoformat(),
                "cpu": 45.2,
                "memory": 62.8,
                "active_models": 5,
                "threats_detected": 0
            }
            await websocket.send_json(metrics)
            await asyncio.sleep(5)  # Update every 5 seconds

    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logger.info("WebSocket client disconnected")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=9000,
        reload=True,
        log_level="info"
    )