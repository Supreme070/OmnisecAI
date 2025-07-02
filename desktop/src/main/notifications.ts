/**
 * Notification manager for OmnisecAI Desktop
 * Handles system notifications and notification management
 */
import { Notification, BrowserWindow } from 'electron';
import log from 'electron-log';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  urgency?: 'normal' | 'critical' | 'low';
  silent?: boolean;
  actions?: Array<{
    type: string;
    text: string;
  }>;
}

export class NotificationManager {
  private activeNotifications: Map<string, Notification> = new Map();
  private notificationQueue: NotificationOptions[] = [];
  private isProcessingQueue = false;
  private maxConcurrentNotifications = 3;

  constructor() {
    this.checkNotificationSupport();
  }

  /**
   * Check if notifications are supported on this platform
   */
  private checkNotificationSupport(): void {
    if (!Notification.isSupported()) {
      log.warn('System notifications are not supported on this platform');
    } else {
      log.info('System notifications are supported');
    }
  }

  /**
   * Show a system notification
   */
  public showNotification(options: NotificationOptions): void {
    if (!Notification.isSupported()) {
      log.warn('Cannot show notification - not supported');
      return;
    }

    // Add to queue if we have too many active notifications
    if (this.activeNotifications.size >= this.maxConcurrentNotifications) {
      this.notificationQueue.push(options);
      return;
    }

    this.createNotification(options);
  }

  /**
   * Create and display a notification
   */
  private createNotification(options: NotificationOptions): void {
    try {
      const notification = new Notification({
        title: options.title,
        body: options.body,
        icon: options.icon,
        tag: options.tag,
        urgency: options.urgency,
        silent: options.silent,
        actions: options.actions,
      });

      const notificationId = options.tag || `notification-${Date.now()}`;

      // Handle notification events
      notification.on('show', () => {
        log.info(`Notification shown: ${options.title}`);
        this.activeNotifications.set(notificationId, notification);
      });

      notification.on('click', () => {
        log.info(`Notification clicked: ${options.title}`);
        this.handleNotificationClick(notificationId, options);
        this.removeNotification(notificationId);
      });

      notification.on('close', () => {
        log.info(`Notification closed: ${options.title}`);
        this.removeNotification(notificationId);
      });

      notification.on('action', (event, index) => {
        log.info(`Notification action clicked: ${options.title}, action: ${index}`);
        this.handleNotificationAction(notificationId, options, index);
        this.removeNotification(notificationId);
      });

      notification.on('failed', (event, error) => {
        log.error(`Notification failed: ${options.title}`, error);
        this.removeNotification(notificationId);
      });

      // Show the notification
      notification.show();
    } catch (error) {
      log.error('Error creating notification:', error);
    }
  }

  /**
   * Handle notification click events
   */
  private handleNotificationClick(notificationId: string, options: NotificationOptions): void {
    // Focus the main window when notification is clicked
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
      mainWindow.show();

      // Send notification click event to renderer
      mainWindow.webContents.send('notification-clicked', {
        id: notificationId,
        options: options,
      });
    }
  }

  /**
   * Handle notification action button clicks
   */
  private handleNotificationAction(
    notificationId: string, 
    options: NotificationOptions, 
    actionIndex: number
  ): void {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow && options.actions && options.actions[actionIndex]) {
      const action = options.actions[actionIndex];
      
      mainWindow.webContents.send('notification-action', {
        id: notificationId,
        action: action,
        actionIndex: actionIndex,
        options: options,
      });
    }
  }

  /**
   * Remove a notification from active list and process queue
   */
  private removeNotification(notificationId: string): void {
    this.activeNotifications.delete(notificationId);
    this.processNotificationQueue();
  }

  /**
   * Process queued notifications
   */
  private processNotificationQueue(): void {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    if (this.activeNotifications.size < this.maxConcurrentNotifications) {
      this.isProcessingQueue = true;
      const nextNotification = this.notificationQueue.shift();
      
      if (nextNotification) {
        this.createNotification(nextNotification);
      }
      
      this.isProcessingQueue = false;
      
      // Process next in queue if there's space
      if (this.notificationQueue.length > 0 && 
          this.activeNotifications.size < this.maxConcurrentNotifications) {
        setTimeout(() => this.processNotificationQueue(), 100);
      }
    }
  }

  /**
   * Show a security alert notification
   */
  public showSecurityAlert(title: string, message: string): void {
    this.showNotification({
      title: `🔒 ${title}`,
      body: message,
      urgency: 'critical',
      tag: 'security-alert',
      actions: [
        { type: 'view', text: 'View Details' },
        { type: 'dismiss', text: 'Dismiss' },
      ],
    });
  }

  /**
   * Show a threat detection notification
   */
  public showThreatDetection(threatType: string, details: string): void {
    this.showNotification({
      title: `⚠️ Threat Detected: ${threatType}`,
      body: details,
      urgency: 'critical',
      tag: 'threat-detection',
      actions: [
        { type: 'investigate', text: 'Investigate' },
        { type: 'block', text: 'Block Threat' },
      ],
    });
  }

  /**
   * Show a system status notification
   */
  public showSystemStatus(status: string, message: string): void {
    const urgency = status === 'error' ? 'critical' : 
                   status === 'warning' ? 'normal' : 'low';
    
    const icon = status === 'error' ? '❌' : 
                 status === 'warning' ? '⚠️' : 
                 status === 'success' ? '✅' : 'ℹ️';

    this.showNotification({
      title: `${icon} System ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      body: message,
      urgency: urgency,
      tag: `system-${status}`,
    });
  }

  /**
   * Show an update notification
   */
  public showUpdateNotification(version: string): void {
    this.showNotification({
      title: '🔄 Update Available',
      body: `OmnisecAI ${version} is ready to install`,
      tag: 'app-update',
      actions: [
        { type: 'install', text: 'Install Now' },
        { type: 'later', text: 'Install Later' },
      ],
    });
  }

  /**
   * Clear all active notifications
   */
  public clearAllNotifications(): void {
    for (const [id, notification] of this.activeNotifications) {
      try {
        notification.close();
      } catch (error) {
        log.error(`Error closing notification ${id}:`, error);
      }
    }
    
    this.activeNotifications.clear();
    this.notificationQueue.length = 0;
    log.info('All notifications cleared');
  }

  /**
   * Clear notifications by tag
   */
  public clearNotificationsByTag(tag: string): void {
    const toRemove: string[] = [];
    
    for (const [id, notification] of this.activeNotifications) {
      // Note: Electron doesn't provide access to notification tag after creation
      // This is a limitation we need to work around by tracking tags separately
      try {
        notification.close();
        toRemove.push(id);
      } catch (error) {
        log.error(`Error closing notification ${id}:`, error);
      }
    }
    
    toRemove.forEach(id => this.activeNotifications.delete(id));
    
    // Remove from queue as well
    this.notificationQueue = this.notificationQueue.filter(notif => notif.tag !== tag);
    
    log.info(`Cleared notifications with tag: ${tag}`);
  }

  /**
   * Get the number of active notifications
   */
  public getActiveNotificationCount(): number {
    return this.activeNotifications.size;
  }

  /**
   * Get the number of queued notifications
   */
  public getQueuedNotificationCount(): number {
    return this.notificationQueue.length;
  }
}