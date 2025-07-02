import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient } from '@/lib/api';
import { useAuth } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { toast } from 'sonner';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 1000
  } = options;

  const { isAuthenticated } = useAuth();
  const { updateSecurityMetrics, updateSystemMetrics } = useDashboardStore();
  
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsClient = useRef<WebSocketClient | null>(null);
  const reconnectAttemptCount = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle incoming messages
  const handleMessage = useCallback((data: any) => {
    const message: WebSocketMessage = {
      type: data.type || 'unknown',
      data: data.data || data,
      timestamp: data.timestamp || new Date().toISOString()
    };

    setLastMessage(message);

    // Handle different message types
    switch (message.type) {
      case 'security_metrics_update':
        updateSecurityMetrics(message.data);
        break;
        
      case 'system_metrics_update':
        updateSystemMetrics(message.data);
        break;
        
      case 'threat_detected':
        toast.error(`New threat detected: ${message.data.threat_type}`, {
          description: `Severity: ${message.data.severity}`,
          action: {
            label: 'View Details',
            onClick: () => window.location.href = '/dashboard/threats/active'
          }
        });
        break;
        
      case 'model_upload_complete':
        toast.success(`Model upload completed: ${message.data.model_name}`, {
          description: 'Model is now available for security scanning'
        });
        break;
        
      case 'scan_complete':
        toast.info(`Security scan completed for ${message.data.model_name}`, {
          description: `Found ${message.data.vulnerabilities_count} potential issues`
        });
        break;
        
      case 'user_activity':
        // Handle user activity updates (for admin users)
        break;
        
      case 'system_alert':
        if (message.data.severity === 'high' || message.data.severity === 'critical') {
          toast.error(message.data.title, {
            description: message.data.description
          });
        } else {
          toast.info(message.data.title, {
            description: message.data.description
          });
        }
        break;
        
      default:
        console.log('Unhandled WebSocket message:', message);
    }
  }, [updateSecurityMetrics, updateSystemMetrics]);

  // Connection event handlers
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionStatus('connected');
    reconnectAttemptCount.current = 0;
    
    toast.success('Real-time updates connected', {
      description: 'You will now receive live security updates'
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    
    // Attempt to reconnect if authenticated
    if (isAuthenticated && reconnectAttemptCount.current < reconnectAttempts) {
      setConnectionStatus('connecting');
      reconnectAttemptCount.current++;
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, reconnectInterval * reconnectAttemptCount.current);
    }
  }, [isAuthenticated, reconnectAttempts, reconnectInterval]);

  const handleError = useCallback((error: any) => {
    setConnectionStatus('error');
    console.error('WebSocket error:', error);
    
    if (reconnectAttemptCount.current === 0) {
      toast.error('Real-time connection failed', {
        description: 'Some features may not update automatically'
      });
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!isAuthenticated || wsClient.current) return;

    try {
      setConnectionStatus('connecting');
      wsClient.current = new WebSocketClient();
      
      // Set up event listeners
      wsClient.current.on('connected', handleConnect);
      wsClient.current.on('disconnected', handleDisconnect);
      wsClient.current.on('error', handleError);
      wsClient.current.on('message', handleMessage);
      
      // Connect
      wsClient.current.connect();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('error');
    }
  }, [isAuthenticated, handleConnect, handleDisconnect, handleError, handleMessage]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsClient.current) {
      wsClient.current.disconnect();
      wsClient.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((type: string, data: any) => {
    if (wsClient.current && isConnected) {
      wsClient.current.send({ type, data, timestamp: new Date().toISOString() });
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, [isConnected]);

  // Subscribe to specific event types
  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (wsClient.current) {
      wsClient.current.on(eventType, callback);
    }
  }, []);

  // Unsubscribe from event types
  const unsubscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    if (wsClient.current) {
      wsClient.current.off(eventType, callback);
    }
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (autoConnect && isAuthenticated) {
      connect();
    } else if (!isAuthenticated) {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    
    // Connection state helpers
    isConnecting: connectionStatus === 'connecting',
    hasError: connectionStatus === 'error',
    
    // Statistics
    reconnectAttempts: reconnectAttemptCount.current,
  };
}