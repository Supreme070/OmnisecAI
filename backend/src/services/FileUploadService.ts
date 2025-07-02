import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { ModelScanModel } from '@/models/ModelScan';
import { setCache, getCache } from '@/config/redis';
import logger from '@/utils/logger';
import { ModelScan } from '@/types';

export class FileUploadService {
  private static readonly UPLOAD_DIR = process.env['UPLOAD_DIR'] || './uploads';
  private static readonly MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  private static readonly ALLOWED_EXTENSIONS = [
    '.pkl', '.pth', '.pt', '.h5', '.hdf5', '.pb', '.onnx', '.tflite',
    '.joblib', '.model', '.bin', '.safetensors', '.ckpt', '.zip', '.tar.gz'
  ];
  private static readonly QUARANTINE_DIR = path.join(process.env['UPLOAD_DIR'] || './uploads', 'quarantine');
  private static readonly PROCESSED_DIR = path.join(process.env['UPLOAD_DIR'] || './uploads', 'processed');
  private static readonly CACHE_TTL = 60 * 60; // 1 hour

  /**
   * Initialize upload directories
   */
  static async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
      await fs.mkdir(this.QUARANTINE_DIR, { recursive: true });
      await fs.mkdir(this.PROCESSED_DIR, { recursive: true });
      
      logger.info('File upload service initialized', {
        uploadDir: this.UPLOAD_DIR,
        maxFileSize: this.MAX_FILE_SIZE,
        allowedExtensions: this.ALLOWED_EXTENSIONS.length
      });
    } catch (error) {
      logger.error('Failed to initialize upload directories', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('UPLOAD_INIT_FAILED');
    }
  }

  /**
   * Configure multer for file uploads
   */
  static getMulterConfig(): multer.Multer {
    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, this.UPLOAD_DIR);
      },
      filename: (_req, file, cb) => {
        // Generate secure filename with timestamp and random string
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filename = `${timestamp}_${randomString}_${sanitizedOriginalName}`;
        cb(null, filename);
      }
    });

    const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (this.ALLOWED_EXTENSIONS.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${ext} not allowed. Allowed types: ${this.ALLOWED_EXTENSIONS.join(', ')}`));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.MAX_FILE_SIZE,
        files: 1 // One file at a time
      }
    });
  }

  /**
   * Process uploaded file and create scan record
   */
  static async processUpload(
    file: Express.Multer.File,
    userId: string,
    metadata?: {
      description?: string;
      modelType?: string;
      framework?: string;
      tags?: string[];
    }
  ): Promise<ModelScan> {
    try {
      // Calculate file hash
      const fileHash = await this.calculateFileHash(file.path);

      // Check for duplicate files
      const existingScan = await ModelScanModel.findByFileHash(fileHash);
      if (existingScan && existingScan.user_id === userId) {
        // Remove uploaded file since we have a duplicate
        await fs.unlink(file.path).catch(() => {});
        
        logger.info('Duplicate file upload detected', {
          userId,
          filename: file.originalname,
          existingScanId: existingScan.id
        });

        return existingScan;
      }

      // Create scan record
      const scanData = await ModelScanModel.create({
        user_id: userId,
        filename: file.originalname,
        file_size: file.size,
        file_hash: fileHash,
        file_path: file.path,
        scan_status: 'queued',
        metadata: {
          description: metadata?.description,
          model_type: metadata?.modelType,
          framework: metadata?.framework,
          tags: metadata?.tags || [],
          upload_timestamp: new Date().toISOString(),
          mime_type: file.mimetype,
          file_extension: path.extname(file.originalname).toLowerCase()
        }
      });

      // Cache scan data for quick access
      await this.cacheScanData(scanData.id as string, scanData);

      // Queue for scanning (in a real implementation, this would trigger background processing)
      await this.queueForScanning(scanData);

      logger.info('File upload processed successfully', {
        userId,
        scanId: scanData.id,
        filename: file.originalname,
        fileSize: file.size,
        fileHash: fileHash.substring(0, 16) + '...'
      });

      return scanData;
    } catch (error) {
      // Clean up uploaded file on error
      try {
        await fs.unlink(file.path);
      } catch {}

      logger.error('Failed to process file upload', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        filename: file.originalname
      });

      throw error;
    }
  }

  /**
   * Get scan status and results
   */
  static async getScanResults(scanId: string, userId?: string): Promise<ModelScan | null> {
    try {
      // Try cache first
      let scan = await this.getCachedScanData(scanId);
      
      if (!scan) {
        // Fallback to database
        scan = await ModelScanModel.findById(scanId);
        if (scan) {
          await this.cacheScanData(scanId, scan);
        }
      }

      // Check ownership if userId provided
      if (scan && userId && scan.user_id !== userId) {
        return null;
      }

      return scan;
    } catch (error) {
      logger.error('Failed to get scan results', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId,
        userId
      });
      throw error;
    }
  }

  /**
   * List user's scans with pagination
   */
  static async listUserScans(
    userId: string,
    options: {
      status?: string;
      limit?: number;
      offset?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    scans: ModelScan[];
    total: number;
  }> {
    try {
      return await ModelScanModel.listByUser(userId, options);
    } catch (error) {
      logger.error('Failed to list user scans', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      throw error;
    }
  }

  /**
   * Delete scan and associated file
   */
  static async deleteScan(scanId: string, userId?: string): Promise<void> {
    try {
      const scan = await ModelScanModel.findById(scanId);
      if (!scan) {
        throw new Error('SCAN_NOT_FOUND');
      }

      // Check ownership if userId provided
      if (userId && scan.user_id !== userId) {
        throw new Error('UNAUTHORIZED');
      }

      // Delete file if it exists
      if (scan['file_path']) {
        try {
          await fs.unlink(scan['file_path'] as string);
        } catch (error) {
          logger.warn('Failed to delete scan file', {
            error: error instanceof Error ? error.message : 'Unknown error',
            filePath: scan['file_path'],
            scanId
          });
        }
      }

      // Delete scan record
      await ModelScanModel.delete(scanId);

      // Remove from cache
      await this.removeCachedScanData(scanId);

      logger.info('Scan deleted successfully', {
        scanId,
        userId: scan.user_id,
        filename: scan.filename
      });
    } catch (error) {
      logger.error('Failed to delete scan', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId,
        userId
      });
      throw error;
    }
  }

  /**
   * Move file to quarantine
   */
  static async quarantineFile(scanId: string, reason: string): Promise<void> {
    try {
      const scan = await ModelScanModel.findById(scanId);
      if (!scan || !scan['file_path']) {
        throw new Error('SCAN_OR_FILE_NOT_FOUND');
      }

      const originalPath = scan['file_path'] as string;
      const filename = path.basename(originalPath);
      const quarantinePath = path.join(this.QUARANTINE_DIR, `quarantine_${filename}`);

      // Move file to quarantine
      await fs.rename(originalPath, quarantinePath);

      // Update scan record
      await ModelScanModel.update(scanId, {
        file_path: quarantinePath,
        scan_status: 'quarantined',
        scan_results: {
          quarantine_reason: reason,
          quarantined_at: new Date().toISOString()
        }
      });

      // Update cache
      await this.removeCachedScanData(scanId);

      logger.warn('File quarantined', {
        scanId,
        reason,
        originalPath,
        quarantinePath
      });
    } catch (error) {
      logger.error('Failed to quarantine file', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId,
        reason
      });
      throw error;
    }
  }

  /**
   * Get file download URL (for safe files only)
   */
  static async getDownloadUrl(scanId: string, userId?: string): Promise<{
    downloadUrl: string;
    filename: string;
    expiresAt: Date;
  }> {
    try {
      const scan = await this.getScanResults(scanId, userId);
      if (!scan) {
        throw new Error('SCAN_NOT_FOUND');
      }

      // Only allow downloads for completed, safe scans
      if (scan['scan_status'] === 'quarantined') {
        throw new Error('FILE_QUARANTINED');
      }

      if (scan.scan_status !== 'completed') {
        throw new Error('SCAN_NOT_COMPLETED');
      }

      // Check if any high-severity threats were found
      const threats = scan.threat_detections as any[] || [];
      const hasHighThreat = threats.some(threat => 
        threat.severity === 'high' || threat.severity === 'critical'
      );

      if (hasHighThreat) {
        throw new Error('HIGH_THREAT_DETECTED');
      }

      // Generate temporary download token
      const downloadToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + (15 * 60 * 1000)); // 15 minutes

      // Cache download permission
      await setCache(`download:${downloadToken}`, {
        scanId,
        userId: scan.user_id,
        expiresAt: expiresAt.toISOString()
      }, 15 * 60); // 15 minutes

      const downloadUrl = `/api/models/download/${downloadToken}`;

      logger.info('Download URL generated', {
        scanId,
        userId: scan.user_id,
        expiresAt
      });

      return {
        downloadUrl,
        filename: scan.filename as string,
        expiresAt
      };
    } catch (error) {
      logger.error('Failed to generate download URL', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId,
        userId
      });
      throw error;
    }
  }

  /**
   * Cleanup old files and scans
   */
  static async cleanupOldFiles(olderThanDays: number = 30): Promise<{
    deletedFiles: number;
    deletedScans: number;
  }> {
    try {
      const cutoffDate = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));
      
      // Get old scans
      const oldScans = await ModelScanModel.findOlderThan(cutoffDate);
      
      let deletedFiles = 0;
      let deletedScans = 0;

      for (const scan of oldScans) {
        try {
          // Delete file if it exists
          if (scan['file_path']) {
            await fs.unlink(scan['file_path'] as string);
            deletedFiles++;
          }

          // Delete scan record
          await ModelScanModel.delete(scan.id as string);
          deletedScans++;

          // Remove from cache
          await this.removeCachedScanData(scan.id as string);
        } catch (error) {
          logger.warn('Failed to cleanup scan', {
            error: error instanceof Error ? error.message : 'Unknown error',
            scanId: scan.id
          });
        }
      }

      logger.info('Cleanup completed', {
        deletedFiles,
        deletedScans,
        olderThanDays
      });

      return { deletedFiles, deletedScans };
    } catch (error) {
      logger.error('Cleanup failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        olderThanDays
      });
      throw error;
    }
  }

  /**
   * Calculate file hash
   */
  private static async calculateFileHash(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    } catch (error) {
      logger.error('Failed to calculate file hash', {
        error: error instanceof Error ? error.message : 'Unknown error',
        filePath
      });
      throw new Error('HASH_CALCULATION_FAILED');
    }
  }

  /**
   * Queue scan for processing
   */
  private static async queueForScanning(scan: ModelScan): Promise<void> {
    try {
      // In a real implementation, this would add to a job queue (Redis, Bull, etc.)
      // For now, we'll just cache it as a queued scan
      await setCache(`scan_queue:${scan.id}`, {
        scanId: scan.id,
        userId: scan.user_id,
        queuedAt: new Date().toISOString()
      }, 24 * 60 * 60); // 24 hours

      logger.debug('Scan queued for processing', {
        scanId: scan.id,
        userId: scan.user_id
      });
    } catch (error) {
      logger.error('Failed to queue scan', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId: scan.id
      });
    }
  }

  /**
   * Cache scan data
   */
  private static async cacheScanData(scanId: string, scan: ModelScan): Promise<void> {
    try {
      await setCache(`scan:${scanId}`, scan, this.CACHE_TTL);
    } catch (error) {
      logger.warn('Failed to cache scan data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId
      });
    }
  }

  /**
   * Get cached scan data
   */
  private static async getCachedScanData(scanId: string): Promise<ModelScan | null> {
    try {
      return await getCache(`scan:${scanId}`) as ModelScan | null;
    } catch {
      return null;
    }
  }

  /**
   * Remove cached scan data
   */
  private static async removeCachedScanData(scanId: string): Promise<void> {
    try {
      const { deleteCache } = await import('@/config/redis');
      await deleteCache(`scan:${scanId}`);
    } catch (error) {
      logger.warn('Failed to remove cached scan data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        scanId
      });
    }
  }
}