import { ModelScanningService } from '@/services/ModelScanningService';
import { ModelScanModel } from '@/models/ModelScan';
import logger from '@/utils/logger';

export class ScanWorkerService {
  private static isRunning = false;
  private static intervalId: NodeJS.Timeout | null = null;
  private static readonly POLL_INTERVAL = 30000; // 30 seconds
  private static readonly MAX_CONCURRENT_SCANS = 3;
  private static readonly ERROR_BACKOFF_TIME = 60000; // 1 minute
  private static consecutiveErrors = 0;
  private static lastErrorTime = 0;

  /**
   * Start the scan worker service
   */
  static start(): void {
    if (this.isRunning) {
      logger.warn('Scan worker service already running');
      return;
    }

    this.isRunning = true;
    this.consecutiveErrors = 0;
    
    logger.info('Starting scan worker service', {
      pollInterval: this.POLL_INTERVAL,
      maxConcurrentScans: this.MAX_CONCURRENT_SCANS
    });

    // Start immediate processing
    void this.processQueue();

    // Schedule regular processing
    this.intervalId = setInterval(() => {
      void this.processQueue();
    }, this.POLL_INTERVAL);
  }

  /**
   * Stop the scan worker service
   */
  static stop(): void {
    if (!this.isRunning) {
      logger.warn('Scan worker service not running');
      return;
    }

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    logger.info('Scan worker service stopped');
  }

  /**
   * Process the scan queue
   */
  private static async processQueue(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    // Implement error backoff
    if (this.consecutiveErrors > 3) {
      const timeSinceLastError = Date.now() - this.lastErrorTime;
      if (timeSinceLastError < this.ERROR_BACKOFF_TIME) {
        logger.debug('Backing off due to consecutive errors', {
          consecutiveErrors: this.consecutiveErrors,
          backoffRemaining: this.ERROR_BACKOFF_TIME - timeSinceLastError
        });
        return;
      }
    }

    try {
      // Check current scanning load
      const scanningCount = await this.getCurrentScanningCount();
      if (scanningCount >= this.MAX_CONCURRENT_SCANS) {
        logger.debug('Maximum concurrent scans reached', {
          current: scanningCount,
          maximum: this.MAX_CONCURRENT_SCANS
        });
        return;
      }

      // Get queued scans
      const availableSlots = this.MAX_CONCURRENT_SCANS - scanningCount;
      const queuedScans = await ModelScanModel.findByStatus('queued', availableSlots);

      if (queuedScans.length === 0) {
        logger.debug('No queued scans to process');
        return;
      }

      logger.info('Processing queued scans', {
        queuedCount: queuedScans.length,
        currentlyScanning: scanningCount,
        availableSlots
      });

      // Process scans concurrently
      const scanPromises = queuedScans.map(scan => 
        this.processScanSafely(scan)
      );

      await Promise.allSettled(scanPromises);

      // Reset error counter on successful processing
      this.consecutiveErrors = 0;

    } catch (error) {
      this.consecutiveErrors++;
      this.lastErrorTime = Date.now();

      logger.error('Error processing scan queue', {
        error: error instanceof Error ? error.message : 'Unknown error',
        consecutiveErrors: this.consecutiveErrors
      });
    }
  }

  /**
   * Process a single scan with error handling
   */
  private static async processScanSafely(scan: any): Promise<void> {
    try {
      await ModelScanningService.processScan(scan);
    } catch (error) {
      logger.error('Failed to process individual scan', {
        scanId: scan.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get current number of scanning jobs
   */
  private static async getCurrentScanningCount(): Promise<number> {
    try {
      const scanningScans = await ModelScanModel.findByStatus('scanning', 100);
      return scanningScans.length;
    } catch (error) {
      logger.error('Failed to get current scanning count', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  /**
   * Get worker service status
   */
  static getStatus(): {
    isRunning: boolean;
    consecutiveErrors: number;
    lastErrorTime: number;
    pollInterval: number;
    maxConcurrentScans: number;
  } {
    return {
      isRunning: this.isRunning,
      consecutiveErrors: this.consecutiveErrors,
      lastErrorTime: this.lastErrorTime,
      pollInterval: this.POLL_INTERVAL,
      maxConcurrentScans: this.MAX_CONCURRENT_SCANS
    };
  }

  /**
   * Manually trigger queue processing
   */
  static async triggerProcessing(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Scan worker service is not running');
    }

    logger.info('Manually triggering scan queue processing');
    await this.processQueue();
  }

  /**
   * Reset error state
   */
  static resetErrorState(): void {
    this.consecutiveErrors = 0;
    this.lastErrorTime = 0;
    logger.info('Scan worker error state reset');
  }
}