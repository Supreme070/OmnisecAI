/**
 * Real-time notifications hook
 * Manages system-wide notifications and user-specific alerts
 */
import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAuth } from '@/stores/authStore';
import { toast } from 'sonner';

export interface RealTimeNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'security';
  title: string;
  message: string;
  userId?: string;
  data?: Record<string, any>;
  read: boolean;
  requiresAction: boolean;
  actionUrl?: string;
  actionLabel?: string;
  timestamp: string;
  expiresAt?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { user } = useAuth();
  const { isConnected, subscribe, unsubscribe, sendMessage } = useWebSocket({
    autoConnect: true
  });

  // Play notification sound
  const playNotificationSound = useCallback((priority: string) => {
    if (!soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different tones for different priorities
      switch (priority) {
        case 'critical':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          break;
        case 'high':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          break;
        default:
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silently fail if audio context not available
    }
  }, [soundEnabled]);

  // Handle incoming notifications
  const handleNotification = useCallback((data: any) => {
    const notification: RealTimeNotification = {
      id: data.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: data.type || 'info',
      title: data.title || 'Notification',
      message: data.message || data.description || '',
      userId: data.userId,
      data: data.data || data.metadata,
      read: false,
      requiresAction: data.requiresAction || false,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel || 'View',
      timestamp: data.timestamp || new Date().toISOString(),
      expiresAt: data.expiresAt,
      priority: data.priority || 'medium'
    };

    // Only show if it's for this user or it's a broadcast
    if (!notification.userId || notification.userId === user?.id) {
      setNotifications(prev => [notification, ...prev.slice(0, 99)]); // Keep latest 100
      setUnreadCount(prev => prev + 1);

      // Play sound for high priority notifications
      if (notification.priority === 'high' || notification.priority === 'critical') {
        playNotificationSound(notification.priority);
      }

      // Show toast notification
      const toastOptions: any = {
        description: notification.message,
        duration: notification.priority === 'critical' ? 0 : 
                  notification.priority === 'high' ? 10000 : 5000
      };

      if (notification.requiresAction && notification.actionUrl) {
        toastOptions.action = {
          label: notification.actionLabel,
          onClick: () => window.location.href = notification.actionUrl!
        };
      }

      switch (notification.type) {
        case 'error':
        case 'security':
          toast.error(notification.title, toastOptions);
          break;
        case 'warning':
          toast.warning(notification.title, toastOptions);
          break;
        case 'success':
          toast.success(notification.title, toastOptions);
          break;
        default:
          toast.info(notification.title, toastOptions);
      }
    }
  }, [user?.id, playNotificationSound]);

  // Handle system alerts
  const handleSystemAlert = useCallback((data: any) => {
    const alert: RealTimeNotification = {
      id: `alert_${Date.now()}`,
      type: 'security',
      title: data.title || 'System Alert',
      message: data.message || data.description || '',
      read: false,
      requiresAction: true,
      actionUrl: data.actionUrl || '/dashboard',
      timestamp: new Date().toISOString(),
      priority: 'critical'
    };

    setNotifications(prev => [alert, ...prev.slice(0, 99)]);
    setUnreadCount(prev => prev + 1);

    playNotificationSound('critical');

    toast.error(alert.title, {
      description: alert.message,
      duration: 0, // Persistent
      action: {
        label: 'View Dashboard',
        onClick: () => window.location.href = '/dashboard'
      }
    });
  }, [playNotificationSound]);

  // Handle user activity notifications (for admins)
  const handleUserActivity = useCallback((data: any) => {
    if (user?.role !== 'admin') return;

    const activity: RealTimeNotification = {
      id: `activity_${Date.now()}`,
      type: 'info',
      title: 'User Activity',
      message: data.message || `${data.action} by ${data.username}`,
      read: false,
      requiresAction: false,
      timestamp: new Date().toISOString(),
      priority: 'low',
      data: data
    };

    setNotifications(prev => [activity, ...prev.slice(0, 99)]);
    setUnreadCount(prev => prev + 1);
  }, [user?.role]);

  // Subscribe to notification events
  useEffect(() => {
    if (isConnected) {
      subscribe('notification', handleNotification);
      subscribe('system_alert', handleSystemAlert);
      subscribe('user_activity', handleUserActivity);

      // Request to join notifications room
      sendMessage('subscribe', { channel: 'notifications' });

      return () => {
        unsubscribe('notification', handleNotification);
        unsubscribe('system_alert', handleSystemAlert);
        unsubscribe('user_activity', handleUserActivity);
      };
    }
  }, [isConnected, subscribe, unsubscribe, sendMessage,
      handleNotification, handleSystemAlert, handleUserActivity]);

  // Load initial notifications (from localStorage)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('omnisecai_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed.notifications || []);
        setUnreadCount(parsed.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load stored notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist notifications to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        const data = {
          notifications: notifications.slice(0, 50), // Store only latest 50
          unreadCount,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('omnisecai_notifications', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to persist notifications:', error);
      }
    }
  }, [notifications, unreadCount, isLoading]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId && !n.read
          ? { ...n, read: true }
          : n
      )
    );

    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Get notification statistics
  const getStats = useCallback((): NotificationStats => {
    const stats: NotificationStats = {
      total: notifications.length,
      unread: unreadCount,
      byType: {},
      byPriority: {}
    };

    notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
    });

    return stats;
  }, [notifications, unreadCount]);

  // Filter notifications
  const getFilteredNotifications = useCallback((filters: {
    type?: string;
    priority?: string;
    unreadOnly?: boolean;
    limit?: number;
  } = {}) => {
    let filtered = notifications;

    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.priority) {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }, [notifications]);

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    soundEnabled,

    // Actions
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    setSoundEnabled,

    // Helper functions
    getStats,
    getFilteredNotifications,
    getUnreadNotifications: () => getFilteredNotifications({ unreadOnly: true }),
    getCriticalNotifications: () => getFilteredNotifications({ priority: 'critical' }),
    getSecurityNotifications: () => getFilteredNotifications({ type: 'security' }),

    // Statistics
    stats: getStats()
  };
}