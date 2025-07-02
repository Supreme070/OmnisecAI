import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { AuthService } from '@/services/AuthService';
import { setCache, getCache, deleteCache } from '@/config/redis';
import logger from '@/utils/logger';
import { User } from '@/types';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: User;
}

export interface NotificationData {
  id: string;
  type: 'scan_complete' | 'scan_failed' | 'threat_detected' | 'system_alert' | 'security_event';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  requiresAction?: boolean;
}

export interface RoomData {
  userId: string;
  joinedAt: Date;
  lastSeen: Date;
}

export class WebSocketService {
  private static io: SocketIOServer;
  private static connectedUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>
  private static socketUsers = new Map<string, string>(); // socketId -> userId
  private static rooms = new Map<string, RoomData>(); // roomName -> RoomData
  private static readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private static readonly CONNECTION_TIMEOUT = 60000; // 60 seconds
  private static heartbeatTimer: NodeJS.Timeout;

  /**
   * Initialize WebSocket server
   */
  static initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: this.CONNECTION_TIMEOUT,
      pingInterval: this.HEARTBEAT_INTERVAL
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startHeartbeat();

    logger.info('WebSocket server initialized', {
      cors: process.env['FRONTEND_URL'] || 'http://localhost:3000',
      transports: ['websocket', 'polling']
    });
  }

  /**
   * Setup authentication middleware
   */
  private static setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth?.['token'] || socket.handshake.query?.['token'];
        
        if (!token) {
          logger.warn('WebSocket connection attempted without token', {
            socketId: socket.id,
            ip: socket.handshake.address
          });
          return next(new Error('Authentication required'));
        }

        // Get user session
        const { user } = await AuthService.validateSession(token as string);
        
        socket.userId = user.id as string;
        socket.user = user;

        logger.debug('WebSocket authentication successful', {
          socketId: socket.id,
          userId: user.id,
          ip: socket.handshake.address
        });

        next();
      } catch (error) {
        logger.warn('WebSocket authentication failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          socketId: socket.id,
          ip: socket.handshake.address
        });
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup WebSocket event handlers
   */
  private static setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
      
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });

      socket.on('join_room', (roomName: string) => {
        this.handleJoinRoom(socket, roomName);
      });

      socket.on('leave_room', (roomName: string) => {
        this.handleLeaveRoom(socket, roomName);
      });

      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });

      socket.on('mark_notification_read', (notificationId: string) => {
        this.handleMarkNotificationRead(socket, notificationId);
      });

      socket.on('get_notifications', () => {
        this.handleGetNotifications(socket);
      });
    });
  }

  /**
   * Handle new WebSocket connection
   */
  private static handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId!;
    
    // Track user connections
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socket.id);
    this.socketUsers.set(socket.id, userId);

    // Join user-specific room
    socket.join(`user:${userId}`);

    // Cache connection status
    void this.cacheUserConnection(userId, true);

    logger.info('WebSocket client connected', {
      socketId: socket.id,
      userId,
      totalConnections: this.io.sockets.sockets.size,
      userConnections: this.connectedUsers.get(userId)?.size || 0,
      ip: socket.handshake.address
    });

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to OmnisecAI real-time service',
      timestamp: new Date().toISOString(),
      userId
    });

    // Send pending notifications
    void this.sendPendingNotifications(userId);
  }

  /**
   * Handle WebSocket disconnection
   */
  private static handleDisconnection(socket: AuthenticatedSocket, reason: string): void {
    const userId = socket.userId;
    if (!userId) return;

    // Remove from tracking
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId);
        void this.cacheUserConnection(userId, false);
      }
    }
    this.socketUsers.delete(socket.id);

    // Clean up rooms
    for (const [roomName, roomData] of this.rooms.entries()) {
      if (roomData.userId === userId) {
        this.rooms.delete(roomName);
      }
    }

    logger.info('WebSocket client disconnected', {
      socketId: socket.id,
      userId,
      reason,
      totalConnections: this.io.sockets.sockets.size,
      userConnections: this.connectedUsers.get(userId)?.size || 0
    });
  }

  /**
   * Handle joining a room
   */
  private static handleJoinRoom(socket: AuthenticatedSocket, roomName: string): void {
    const userId = socket.userId!;
    
    // Validate room name format
    if (!this.isValidRoomName(roomName)) {
      socket.emit('error', { message: 'Invalid room name' });
      return;
    }

    socket.join(roomName);
    this.rooms.set(`${roomName}:${socket.id}`, {
      userId,
      joinedAt: new Date(),
      lastSeen: new Date()
    });

    logger.debug('User joined room', {
      socketId: socket.id,
      userId,
      roomName
    });

    socket.emit('room_joined', { roomName, timestamp: new Date().toISOString() });
  }

  /**
   * Handle leaving a room
   */
  private static handleLeaveRoom(socket: AuthenticatedSocket, roomName: string): void {
    const userId = socket.userId!;
    
    socket.leave(roomName);
    this.rooms.delete(`${roomName}:${socket.id}`);

    logger.debug('User left room', {
      socketId: socket.id,
      userId,
      roomName
    });

    socket.emit('room_left', { roomName, timestamp: new Date().toISOString() });
  }

  /**
   * Handle marking notification as read
   */
  private static async handleMarkNotificationRead(socket: AuthenticatedSocket, notificationId: string): Promise<void> {
    const userId = socket.userId!;
    
    try {
      // Mark notification as read in cache
      await setCache(`notification_read:${userId}:${notificationId}`, true, 30 * 24 * 60 * 60); // 30 days
      
      logger.debug('Notification marked as read', {
        socketId: socket.id,
        userId,
        notificationId
      });

      socket.emit('notification_read', { notificationId, timestamp: new Date().toISOString() });
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        notificationId
      });
    }
  }

  /**
   * Handle getting user notifications
   */
  private static async handleGetNotifications(socket: AuthenticatedSocket): Promise<void> {
    const userId = socket.userId!;
    
    try {
      const notifications = await this.getUserNotifications(userId);
      socket.emit('notifications', { notifications, timestamp: new Date().toISOString() });
    } catch (error) {
      logger.error('Failed to get user notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      socket.emit('error', { message: 'Failed to get notifications' });
    }
  }

  /**
   * Send notification to specific user
   */
  static async sendNotificationToUser(userId: string, notification: NotificationData): Promise<void> {
    try {
      // Store notification in cache for offline users
      await this.storeNotification(userId, notification);

      // Send to connected users
      const userSockets = this.connectedUsers.get(userId);
      if (userSockets && userSockets.size > 0) {
        this.io.to(`user:${userId}`).emit('notification', notification);
        
        logger.debug('Notification sent to user', {
          userId,
          notificationId: notification.id,
          type: notification.type,
          connectedSockets: userSockets.size
        });
      } else {
        logger.debug('User not connected, notification stored for later', {
          userId,
          notificationId: notification.id,
          type: notification.type
        });
      }
    } catch (error) {
      logger.error('Failed to send notification to user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        notificationId: notification.id
      });
    }
  }

  /**
   * Send notification to room
   */
  static async sendNotificationToRoom(roomName: string, notification: NotificationData): Promise<void> {
    try {
      this.io.to(roomName).emit('notification', notification);
      
      logger.debug('Notification sent to room', {
        roomName,
        notificationId: notification.id,
        type: notification.type
      });
    } catch (error) {
      logger.error('Failed to send notification to room', {
        error: error instanceof Error ? error.message : 'Unknown error',
        roomName,
        notificationId: notification.id
      });
    }
  }

  /**
   * Broadcast system-wide notification
   */
  static async broadcastSystemNotification(notification: NotificationData): Promise<void> {
    try {
      this.io.emit('system_notification', notification);
      
      logger.info('System notification broadcasted', {
        notificationId: notification.id,
        type: notification.type,
        severity: notification.severity,
        connectedClients: this.io.sockets.sockets.size
      });
    } catch (error) {
      logger.error('Failed to broadcast system notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        notificationId: notification.id
      });
    }
  }

  /**
   * Get connected users count
   */
  static getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get total connections count
   */
  static getTotalConnectionsCount(): number {
    return this.io.sockets.sockets.size;
  }

  /**
   * Check if user is connected
   */
  static async isUserConnected(userId: string): Promise<boolean> {
    // Check in-memory first
    if (this.connectedUsers.has(userId)) {
      return true;
    }

    // Check cache
    try {
      const cachedStatus = await getCache(`user_connected:${userId}`) as boolean;
      return cachedStatus === true;
    } catch {
      return false;
    }
  }

  /**
   * Get user connection info
   */
  static getUserConnectionInfo(userId: string): { connected: boolean; socketCount: number } {
    const userSockets = this.connectedUsers.get(userId);
    return {
      connected: Boolean(userSockets && userSockets.size > 0),
      socketCount: userSockets?.size || 0
    };
  }

  /**
   * Disconnect user sessions
   */
  static async disconnectUser(userId: string, reason = 'Session terminated'): Promise<void> {
    try {
      const userSockets = this.connectedUsers.get(userId);
      if (userSockets) {
        for (const socketId of userSockets) {
          const socket = this.io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('force_disconnect', { reason });
            socket.disconnect(true);
          }
        }
      }

      logger.info('User disconnected by system', {
        userId,
        reason,
        disconnectedSockets: userSockets?.size || 0
      });
    } catch (error) {
      logger.error('Failed to disconnect user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
    }
  }

  /**
   * Start heartbeat for connection monitoring
   */
  private static startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.io.emit('heartbeat', { timestamp: new Date().toISOString() });
      
      logger.debug('Heartbeat sent', {
        connectedClients: this.io.sockets.sockets.size,
        connectedUsers: this.connectedUsers.size
      });
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Stop WebSocket service
   */
  static async shutdown(): Promise<void> {
    try {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
      }

      if (this.io) {
        this.io.close();
      }

      this.connectedUsers.clear();
      this.socketUsers.clear();
      this.rooms.clear();

      logger.info('WebSocket service shutdown completed');
    } catch (error) {
      logger.error('Error during WebSocket shutdown', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cache user connection status
   */
  private static async cacheUserConnection(userId: string, connected: boolean): Promise<void> {
    try {
      if (connected) {
        await setCache(`user_connected:${userId}`, true, 60 * 60); // 1 hour
      } else {
        await deleteCache(`user_connected:${userId}`);
      }
    } catch (error) {
      logger.warn('Failed to cache user connection status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        connected
      });
    }
  }

  /**
   * Store notification for offline users
   */
  private static async storeNotification(userId: string, notification: NotificationData): Promise<void> {
    try {
      const key = `user_notifications:${userId}`;
      const notifications = await getCache(key) as NotificationData[] || [];
      
      // Keep only last 50 notifications
      notifications.unshift(notification);
      if (notifications.length > 50) {
        notifications.splice(50);
      }

      await setCache(key, notifications, 7 * 24 * 60 * 60); // 7 days
    } catch (error) {
      logger.error('Failed to store notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        notificationId: notification.id
      });
    }
  }

  /**
   * Get user notifications
   */
  private static async getUserNotifications(userId: string): Promise<NotificationData[]> {
    try {
      const key = `user_notifications:${userId}`;
      return await getCache(key) as NotificationData[] || [];
    } catch (error) {
      logger.error('Failed to get user notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      return [];
    }
  }

  /**
   * Send pending notifications to user
   */
  private static async sendPendingNotifications(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId);
      if (notifications.length > 0) {
        this.io.to(`user:${userId}`).emit('pending_notifications', { notifications });
      }
    } catch (error) {
      logger.error('Failed to send pending notifications', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
    }
  }

  /**
   * Validate room name format
   */
  private static isValidRoomName(roomName: string): boolean {
    // Allow alphanumeric, hyphens, underscores, and colons
    const validRoomPattern = /^[a-zA-Z0-9_:-]+$/;
    return validRoomPattern.test(roomName) && roomName.length <= 100;
  }
}