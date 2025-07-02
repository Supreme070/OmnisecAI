/**
 * Power management for OmnisecAI Desktop
 * Handles power events, battery status, and performance optimization
 */
import { powerMonitor, powerSaveBlocker, BrowserWindow } from 'electron';
import log from 'electron-log';

export interface PowerStatus {
  onBattery: boolean;
  batteryLevel?: number;
  charging?: boolean;
  powerSaveMode: boolean;
  idleTime: number;
}

export class PowerManager {
  private powerSaveBlockerId: number | null = null;
  private isMonitoring = false;
  private powerStatus: PowerStatus;
  private statusUpdateInterval: NodeJS.Timeout | null = null;
  private readonly UPDATE_INTERVAL = 30000; // 30 seconds

  constructor() {
    this.powerStatus = {
      onBattery: false,
      powerSaveMode: false,
      idleTime: 0,
    };

    this.initializePowerMonitoring();
  }

  /**
   * Initialize power monitoring
   */
  private initializePowerMonitoring(): void {
    if (!powerMonitor.isSupported()) {
      log.warn('Power monitoring is not supported on this platform');
      return;
    }

    this.isMonitoring = true;
    this.updatePowerStatus();
    this.setupEventListeners();
    this.startStatusUpdates();

    log.info('Power monitoring initialized');
  }

  /**
   * Set up power event listeners
   */
  private setupEventListeners(): void {
    // System suspend/resume events
    powerMonitor.on('suspend', () => {
      log.info('System is suspending');
      this.handleSystemSuspend();
    });

    powerMonitor.on('resume', () => {
      log.info('System has resumed');
      this.handleSystemResume();
    });

    // Power source changes
    powerMonitor.on('on-ac', () => {
      log.info('System connected to AC power');
      this.powerStatus.onBattery = false;
      this.handlePowerSourceChange('ac');
    });

    powerMonitor.on('on-battery', () => {
      log.info('System switched to battery power');
      this.powerStatus.onBattery = true;
      this.handlePowerSourceChange('battery');
    });

    // Shutdown events
    powerMonitor.on('shutdown', () => {
      log.info('System is shutting down');
      this.handleSystemShutdown();
    });

    // Lock screen events (if supported)
    if (process.platform === 'darwin' || process.platform === 'win32') {
      powerMonitor.on('lock-screen', () => {
        log.info('Screen locked');
        this.handleScreenLock();
      });

      powerMonitor.on('unlock-screen', () => {
        log.info('Screen unlocked');
        this.handleScreenUnlock();
      });
    }
  }

  /**
   * Start periodic status updates
   */
  private startStatusUpdates(): void {
    this.statusUpdateInterval = setInterval(() => {
      this.updatePowerStatus();
      this.optimizePerformance();
    }, this.UPDATE_INTERVAL);
  }

  /**
   * Update current power status
   */
  private updatePowerStatus(): void {
    try {
      // Update idle time
      this.powerStatus.idleTime = powerMonitor.getSystemIdleTime();

      // Update battery status (if available)
      if (process.platform === 'darwin' || process.platform === 'win32') {
        // Note: Electron doesn't provide direct battery level access
        // This would typically require additional native modules
        this.powerStatus.onBattery = !powerMonitor.isOnBatteryPower?.() ?? false;
      }

      // Determine if power save mode should be enabled
      const shouldEnablePowerSave = this.shouldEnablePowerSaveMode();
      if (shouldEnablePowerSave !== this.powerStatus.powerSaveMode) {
        this.powerStatus.powerSaveMode = shouldEnablePowerSave;
        this.togglePowerSaveMode(shouldEnablePowerSave);
      }

      // Notify renderer of power status changes
      this.broadcastPowerStatus();
    } catch (error) {
      log.error('Error updating power status:', error);
    }
  }

  /**
   * Determine if power save mode should be enabled
   */
  private shouldEnablePowerSaveMode(): boolean {
    // Enable power save mode if:
    // 1. On battery power
    // 2. System idle for more than 5 minutes
    // 3. Battery level is low (if available)
    
    const idleThreshold = 5 * 60; // 5 minutes in seconds
    
    return this.powerStatus.onBattery || 
           this.powerStatus.idleTime > idleThreshold ||
           (this.powerStatus.batteryLevel !== undefined && this.powerStatus.batteryLevel < 20);
  }

  /**
   * Handle system suspend event
   */
  private handleSystemSuspend(): void {
    // Save application state, pause non-critical operations
    this.broadcastEvent('system-suspend', {
      timestamp: Date.now(),
      powerStatus: this.powerStatus,
    });

    // Stop resource-intensive operations
    this.enablePowerSaveMode();
  }

  /**
   * Handle system resume event
   */
  private handleSystemResume(): void {
    // Resume normal operations, refresh data
    this.updatePowerStatus();
    
    this.broadcastEvent('system-resume', {
      timestamp: Date.now(),
      powerStatus: this.powerStatus,
    });

    // Resume normal operations if not in power save mode
    if (!this.shouldEnablePowerSaveMode()) {
      this.disablePowerSaveMode();
    }
  }

  /**
   * Handle power source changes
   */
  private handlePowerSourceChange(source: 'ac' | 'battery'): void {
    this.updatePowerStatus();
    
    this.broadcastEvent('power-source-change', {
      source,
      timestamp: Date.now(),
      powerStatus: this.powerStatus,
    });

    // Adjust performance based on power source
    this.optimizePerformance();
  }

  /**
   * Handle screen lock
   */
  private handleScreenLock(): void {
    this.broadcastEvent('screen-lock', {
      timestamp: Date.now(),
    });

    // Reduce background activity when screen is locked
    this.enablePowerSaveMode();
  }

  /**
   * Handle screen unlock
   */
  private handleScreenUnlock(): void {
    this.updatePowerStatus();
    
    this.broadcastEvent('screen-unlock', {
      timestamp: Date.now(),
      powerStatus: this.powerStatus,
    });

    // Resume normal activity if appropriate
    if (!this.shouldEnablePowerSaveMode()) {
      this.disablePowerSaveMode();
    }
  }

  /**
   * Handle system shutdown
   */
  private handleSystemShutdown(): void {
    this.cleanup();
    
    this.broadcastEvent('system-shutdown', {
      timestamp: Date.now(),
    });
  }

  /**
   * Toggle power save mode
   */
  private togglePowerSaveMode(enable: boolean): void {
    if (enable) {
      this.enablePowerSaveMode();
    } else {
      this.disablePowerSaveMode();
    }
  }

  /**
   * Enable power save mode
   */
  private enablePowerSaveMode(): void {
    if (this.powerSaveBlockerId !== null) {
      return; // Already in power save mode
    }

    try {
      // Block system sleep to maintain minimal functionality
      this.powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension');
      
      log.info('Power save mode enabled');
      
      this.broadcastEvent('power-save-enabled', {
        timestamp: Date.now(),
        blockerId: this.powerSaveBlockerId,
      });
    } catch (error) {
      log.error('Error enabling power save mode:', error);
    }
  }

  /**
   * Disable power save mode
   */
  private disablePowerSaveMode(): void {
    if (this.powerSaveBlockerId === null) {
      return; // Not in power save mode
    }

    try {
      powerSaveBlocker.stop(this.powerSaveBlockerId);
      this.powerSaveBlockerId = null;
      
      log.info('Power save mode disabled');
      
      this.broadcastEvent('power-save-disabled', {
        timestamp: Date.now(),
      });
    } catch (error) {
      log.error('Error disabling power save mode:', error);
    }
  }

  /**
   * Optimize performance based on current power status
   */
  private optimizePerformance(): void {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (!mainWindow) return;

    try {
      if (this.powerStatus.powerSaveMode) {
        // Reduce frame rate and disable animations in power save mode
        mainWindow.webContents.send('power-optimize', {
          mode: 'power-save',
          frameRate: 30,
          enableAnimations: false,
          backgroundSync: false,
        });
      } else {
        // Normal performance mode
        mainWindow.webContents.send('power-optimize', {
          mode: 'normal',
          frameRate: 60,
          enableAnimations: true,
          backgroundSync: true,
        });
      }
    } catch (error) {
      log.error('Error optimizing performance:', error);
    }
  }

  /**
   * Broadcast power-related events to renderer
   */
  private broadcastEvent(eventType: string, data: any): void {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send('power-event', {
        type: eventType,
        data,
      });
    }
  }

  /**
   * Broadcast current power status to renderer
   */
  private broadcastPowerStatus(): void {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send('power-status', this.powerStatus);
    }
  }

  /**
   * Get current power status
   */
  public getPowerStatus(): PowerStatus {
    return { ...this.powerStatus };
  }

  /**
   * Force enable/disable power save mode
   */
  public setPowerSaveMode(enable: boolean): void {
    this.togglePowerSaveMode(enable);
    this.powerStatus.powerSaveMode = enable;
  }

  /**
   * Check if system is idle
   */
  public isSystemIdle(thresholdSeconds: number = 300): boolean {
    return this.powerStatus.idleTime > thresholdSeconds; // 5 minutes default
  }

  /**
   * Cleanup power manager resources
   */
  public cleanup(): void {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }

    if (this.powerSaveBlockerId !== null) {
      try {
        powerSaveBlocker.stop(this.powerSaveBlockerId);
      } catch (error) {
        log.error('Error stopping power save blocker:', error);
      }
      this.powerSaveBlockerId = null;
    }

    this.isMonitoring = false;
    log.info('Power manager cleaned up');
  }
}