import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { ModelScanModel } from '@/models/ModelScan';
import { NotificationUtils } from '@/utils/notifications';
import { ThreatDetectionService } from '@/services/ThreatDetectionService';
import { setCache, getCache } from '@/config/redis';
import logger from '@/utils/logger';
import { ModelScan, ThreatDetection } from '@/types';

export interface ScanResult {
  scanId: string;
  status: 'completed' | 'failed' | 'quarantined';
  threatDetections: ThreatDetection[];
  scanResults: Record<string, unknown>;
  processingTime: number;
}

export interface VulnerabilityPattern {
  id: string;
  name: string;
  description: string;
  pattern: RegExp | string;
  threatType: 'malware' | 'backdoor' | 'data_leak' | 'adversarial' | 'privacy_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidenceModifier: number;
}

export class ModelScanningService {
  private static readonly MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  private static readonly QUARANTINE_THRESHOLD = 0.8; // 80% confidence
  private static readonly CACHE_TTL = 60 * 60; // 1 hour
  
  // Vulnerability patterns for AI model scanning
  private static readonly VULNERABILITY_PATTERNS: VulnerabilityPattern[] = [
    {
      id: 'suspicious_imports',
      name: 'Suspicious Import Statements',
      description: 'Detects suspicious import statements that could indicate malicious code',
      pattern: /import\s+(subprocess|os|sys|socket|urllib|requests|pickle|eval|exec)/gi,
      threatType: 'malware',
      severity: 'high',
      confidenceModifier: 0.8
    },
    {
      id: 'network_calls',
      name: 'Network Communication',
      description: 'Detects network communication patterns that could exfiltrate data',
      pattern: /(http[s]?:\/\/|ftp:\/\/|tcp:\/\/|socket\.connect|urllib\.request|requests\.get|requests\.post)/gi,
      threatType: 'data_leak',
      severity: 'medium',
      confidenceModifier: 0.6
    },
    {
      id: 'file_operations',
      name: 'Suspicious File Operations',
      description: 'Detects file operations that could modify system files',
      pattern: /(open\s*\(.*['"]\/|\.write\(|\.read\(|os\.remove|os\.unlink|shutil\.rmtree)/gi,
      threatType: 'malware',
      severity: 'medium',
      confidenceModifier: 0.5
    },
    {
      id: 'code_execution',
      name: 'Dynamic Code Execution',
      description: 'Detects dynamic code execution patterns',
      pattern: /(eval\s*\(|exec\s*\(|compile\s*\(|__import__\s*\()/gi,
      threatType: 'backdoor',
      severity: 'critical',
      confidenceModifier: 0.9
    },
    {
      id: 'obfuscation',
      name: 'Code Obfuscation',
      description: 'Detects code obfuscation techniques',
      pattern: /(base64\.decode|binascii\.unhexlify|codecs\.decode|zlib\.decompress)/gi,
      threatType: 'malware',
      severity: 'high',
      confidenceModifier: 0.7
    },
    {
      id: 'credential_theft',
      name: 'Credential Harvesting',
      description: 'Detects patterns that could harvest credentials or sensitive data',
      pattern: /(password|token|api_key|secret|credential|auth|login)/gi,
      threatType: 'privacy_violation',
      severity: 'medium',
      confidenceModifier: 0.4
    },
    {
      id: 'adversarial_patterns',
      name: 'Adversarial Attack Patterns',
      description: 'Detects potential adversarial attack implementations',
      pattern: /(fgsm|pgd|c&w|deepfool|adversarial|perturbation|gradient.*attack)/gi,
      threatType: 'adversarial',
      severity: 'medium',
      confidenceModifier: 0.6
    }
  ];

  /**
   * Process scan queue and scan models
   */
  static async processScanQueue(): Promise<void> {
    try {
      const queuedScans = await ModelScanModel.findByStatus('queued', 10);
      
      if (queuedScans.length === 0) {
        logger.debug('No queued scans to process');
        return;
      }

      logger.info('Processing scan queue', { 
        queuedCount: queuedScans.length 
      });

      // Process scans in parallel with limited concurrency
      const promises = queuedScans.map(scan => this.processScan(scan));
      await Promise.allSettled(promises);

    } catch (error) {
      logger.error('Failed to process scan queue', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process individual scan
   */
  static async processScan(scan: ModelScan): Promise<ScanResult> {
    const startTime = Date.now();
    const scanId = scan.id as string;

    try {
      logger.info('Starting model scan', {
        scanId,
        userId: scan.user_id,
        filename: scan.filename,
        fileSize: scan.file_size
      });

      // Update scan status to scanning
      await ModelScanModel.update(scanId, { scan_status: 'scanning' });

      // Validate file exists and is accessible
      if (!scan['file_path']) {
        throw new Error('File path not found');
      }

      const filePath = scan['file_path'] as string;
      await this.validateFile(filePath);

      // Perform the actual scan
      const scanResults = await this.scanModel(filePath, scan);
      const processingTime = Date.now() - startTime;

      // Determine if file should be quarantined
      const shouldQuarantine = this.shouldQuarantineFile(scanResults.threatDetections);
      const finalStatus = shouldQuarantine ? 'quarantined' : 'completed';

      // Update scan record with results
      await ModelScanModel.update(scanId, {
        scan_status: finalStatus,
        scan_results: scanResults.scanResults,
        threat_detections: scanResults.threatDetections
      });

      // Handle quarantine if necessary
      if (shouldQuarantine) {
        await this.quarantineFile(scan, scanResults.threatDetections);
      }

      // Process threats through threat detection service
      if (scanResults.threatDetections.length > 0) {
        await ThreatDetectionService.processThreatFromScan(scan, scanResults.threatDetections);
      }

      // Send notifications
      await this.sendScanNotifications(scan, scanResults, finalStatus);

      // Cache results
      await this.cacheScanResults(scanId, scanResults);

      const result: ScanResult = {
        scanId,
        status: finalStatus,
        threatDetections: scanResults.threatDetections,
        scanResults: scanResults.scanResults,
        processingTime
      };

      logger.info('Scan completed successfully', {
        scanId,
        status: finalStatus,
        threatCount: scanResults.threatDetections.length,
        processingTime
      });

      return result;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error('Scan failed', {
        scanId,
        error: errorMessage,
        processingTime
      });

      // Update scan status to failed
      await ModelScanModel.update(scanId, {
        scan_status: 'failed',
        scan_results: {
          error: errorMessage,
          failedAt: new Date().toISOString()
        }
      });

      // Send failure notification
      await NotificationUtils.sendScanFailureNotification(scan, errorMessage);

      return {
        scanId,
        status: 'failed',
        threatDetections: [],
        scanResults: { error: errorMessage },
        processingTime
      };
    }
  }

  /**
   * Scan AI model for vulnerabilities
   */
  private static async scanModel(filePath: string, scan: ModelScan): Promise<{
    threatDetections: ThreatDetection[];
    scanResults: Record<string, unknown>;
  }> {
    const threatDetections: ThreatDetection[] = [];
    const scanResults: Record<string, unknown> = {
      scannedAt: new Date().toISOString(),
      fileExtension: path.extname(filePath).toLowerCase(),
      scanVersion: '1.0.0',
      scanType: 'basic_vulnerability_scan'
    };

    try {
      // Read file content for text-based analysis
      const fileContent = await this.readFileContent(filePath);
      scanResults['fileContentLength'] = fileContent.length;

      // Perform signature-based scanning
      const signatureThreats = await this.performSignatureScan(fileContent, scan);
      threatDetections.push(...signatureThreats);

      // Perform behavioral analysis
      const behavioralThreats = await this.performBehavioralAnalysis(fileContent, scan);
      threatDetections.push(...behavioralThreats);

      // Perform entropy analysis
      const entropyResults = await this.performEntropyAnalysis(fileContent);
      scanResults['entropyAnalysis'] = entropyResults;

      // Check for suspicious metadata
      const metadataThreats = await this.analyzeMetadata(scan);
      threatDetections.push(...metadataThreats);

      // Perform format-specific checks
      const formatThreats = await this.performFormatSpecificChecks(filePath, fileContent);
      threatDetections.push(...formatThreats);

      scanResults['totalThreatsDetected'] = threatDetections.length;
      scanResults['highestThreatConfidence'] = threatDetections.length > 0 
        ? Math.max(...threatDetections.map(t => t.confidence_score))
        : 0;

      logger.debug('Model scan analysis completed', {
        scanId: scan.id,
        threatsFound: threatDetections.length,
        highestConfidence: scanResults['highestThreatConfidence']
      });

      return { threatDetections, scanResults };

    } catch (error) {
      logger.error('Failed to scan model', {
        scanId: scan.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        filePath
      });
      throw error;
    }
  }

  /**
   * Perform signature-based scanning
   */
  private static async performSignatureScan(
    content: string, 
    scan: ModelScan
  ): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];

    for (const pattern of this.VULNERABILITY_PATTERNS) {
      try {
        const regex = typeof pattern.pattern === 'string' 
          ? new RegExp(pattern.pattern, 'gi') 
          : pattern.pattern;

        const matches = content.match(regex);
        if (matches && matches.length > 0) {
          const confidence = Math.min(
            pattern.confidenceModifier * (matches.length / 10 + 0.5),
            1.0
          );

          const threat: ThreatDetection = {
            id: crypto.randomUUID(),
            model_id: scan.id as string,
            threat_type: pattern.threatType,
            confidence_score: confidence,
            status: 'detected',
            description: `${pattern.name}: ${pattern.description}`,
            metadata: {
              patternId: pattern.id,
              patternName: pattern.name,
              matchCount: matches.length,
              severity: pattern.severity,
              matches: matches.slice(0, 5) // Store first 5 matches
            },
            created_at: new Date(),
            updated_at: new Date()
          };

          threats.push(threat);

          logger.debug('Threat detected via signature scan', {
            scanId: scan.id,
            threatId: threat.id,
            patternId: pattern.id,
            confidence: confidence,
            matchCount: matches.length
          });
        }
      } catch (error) {
        logger.warn('Error processing vulnerability pattern', {
          patternId: pattern.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return threats;
  }

  /**
   * Perform behavioral analysis
   */
  private static async performBehavioralAnalysis(
    content: string,
    scan: ModelScan
  ): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];

    try {
      // Check for unusual patterns in AI models
      const suspiciousPatterns = [
        {
          name: 'Excessive String Obfuscation',
          pattern: /['"][A-Za-z0-9+/]{20,}['"]|\\x[0-9a-fA-F]{2}/g,
          threatType: 'malware' as const,
          description: 'Detected potential string obfuscation or encoded data'
        },
        {
          name: 'Hidden Layer Manipulation',
          pattern: /hidden.*layer.*\d+|dense.*\d+.*activation/gi,
          threatType: 'backdoor' as const,
          description: 'Detected potential hidden layer manipulation'
        },
        {
          name: 'Data Exfiltration Patterns',
          pattern: /send|transmit|upload|post.*data|export.*model/gi,
          threatType: 'data_leak' as const,
          description: 'Detected potential data exfiltration patterns'
        }
      ];

      for (const behaviorPattern of suspiciousPatterns) {
        const matches = content.match(behaviorPattern.pattern);
        if (matches && matches.length > 2) { // Threshold for behavioral patterns
          const confidence = Math.min(matches.length / 20 + 0.3, 0.8);

          const threat: ThreatDetection = {
            id: crypto.randomUUID(),
            model_id: scan.id as string,
            threat_type: behaviorPattern.threatType,
            confidence_score: confidence,
            status: 'detected',
            description: behaviorPattern.description,
            metadata: {
              analysisType: 'behavioral',
              patternName: behaviorPattern.name,
              matchCount: matches.length,
              context: matches.slice(0, 3)
            },
            created_at: new Date(),
            updated_at: new Date()
          };

          threats.push(threat);
        }
      }

    } catch (error) {
      logger.warn('Error in behavioral analysis', {
        scanId: scan.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return threats;
  }

  /**
   * Perform entropy analysis to detect obfuscation
   */
  private static async performEntropyAnalysis(content: string): Promise<Record<string, unknown>> {
    try {
      const chunks = this.splitIntoChunks(content, 1024);
      const entropies = chunks.map(chunk => this.calculateEntropy(chunk));
      
      const avgEntropy = entropies.reduce((a, b) => a + b, 0) / entropies.length;
      const maxEntropy = Math.max(...entropies);
      const highEntropyChunks = entropies.filter(e => e > 7).length;

      return {
        averageEntropy: avgEntropy,
        maximumEntropy: maxEntropy,
        highEntropyChunks,
        totalChunks: chunks.length,
        entropyThreshold: 7.0,
        suspiciousEntropy: avgEntropy > 6.5 || highEntropyChunks > chunks.length * 0.1
      };
    } catch (error) {
      logger.warn('Error in entropy analysis', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { error: 'Entropy analysis failed' };
    }
  }

  /**
   * Analyze metadata for suspicious indicators
   */
  private static async analyzeMetadata(scan: ModelScan): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];

    try {
      const metadata = scan['metadata'] as Record<string, unknown> || {};
      
      // Check for suspicious file extensions with mismatched content
      const extension = metadata['file_extension'] as string;
      const suspiciousExtensions = ['.exe', '.bat', '.sh', '.cmd', '.scr'];
      
      if (suspiciousExtensions.some(ext => scan.filename.toLowerCase().includes(ext))) {
        const threat: ThreatDetection = {
          id: crypto.randomUUID(),
          model_id: scan.id as string,
          threat_type: 'malware',
          confidence_score: 0.9,
          status: 'detected',
          description: 'Suspicious file extension detected in model filename',
          metadata: {
            analysisType: 'metadata',
            suspiciousExtension: extension,
            filename: scan.filename
          },
          created_at: new Date(),
          updated_at: new Date()
        };
        threats.push(threat);
      }

      // Check for unusually large files
      if (scan.file_size > 100 * 1024 * 1024) { // 100MB threshold
        const threat: ThreatDetection = {
          id: crypto.randomUUID(),
          model_id: scan.id as string,
          threat_type: 'privacy_violation',
          confidence_score: 0.4,
          status: 'detected',
          description: 'Unusually large model file detected',
          metadata: {
            analysisType: 'metadata',
            fileSize: scan.file_size,
            threshold: 100 * 1024 * 1024
          },
          created_at: new Date(),
          updated_at: new Date()
        };
        threats.push(threat);
      }

    } catch (error) {
      logger.warn('Error in metadata analysis', {
        scanId: scan.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return threats;
  }

  /**
   * Perform format-specific security checks
   */
  private static async performFormatSpecificChecks(
    filePath: string,
    content: string
  ): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];
    const extension = path.extname(filePath).toLowerCase();

    try {
      switch (extension) {
        case '.pkl':
        case '.pickle':
          threats.push(...await this.checkPickleFile(content, filePath));
          break;
        case '.pth':
        case '.pt':
          threats.push(...await this.checkPyTorchFile(content, filePath));
          break;
        case '.h5':
        case '.hdf5':
          threats.push(...await this.checkH5File(content, filePath));
          break;
        case '.onnx':
          threats.push(...await this.checkOnnxFile(content, filePath));
          break;
        default:
          logger.debug('No format-specific checks for extension', { extension });
      }
    } catch (error) {
      logger.warn('Error in format-specific checks', {
        extension,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return threats;
  }

  /**
   * Check pickle files for dangerous operations
   */
  private static async checkPickleFile(_content: string, _filePath: string): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];

    // Pickle files are inherently dangerous as they can execute arbitrary code
    const threat: ThreatDetection = {
      id: crypto.randomUUID(),
      model_id: '', // Will be set by caller
      threat_type: 'malware',
      confidence_score: 0.7,
      status: 'detected',
      description: 'Pickle file detected - inherent code execution risk',
      metadata: {
        formatType: 'pickle',
        risk: 'Code execution during unpickling',
        recommendation: 'Use safer formats like ONNX or SafeTensors'
      },
      created_at: new Date(),
      updated_at: new Date()
    };

    threats.push(threat);
    return threats;
  }

  /**
   * Check PyTorch files
   */
  private static async checkPyTorchFile(content: string, _filePath: string): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];

    // Check for suspicious PyTorch patterns
    if (content.includes('torch.load') && content.includes('map_location=')) {
      const threat: ThreatDetection = {
        id: crypto.randomUUID(),
        model_id: '',
        threat_type: 'backdoor',
        confidence_score: 0.5,
        status: 'detected',
        description: 'PyTorch model with custom loading parameters detected',
        metadata: {
          formatType: 'pytorch',
          suspiciousPattern: 'Custom map_location in torch.load'
        },
        created_at: new Date(),
        updated_at: new Date()
      };
      threats.push(threat);
    }

    return threats;
  }

  /**
   * Check HDF5 files
   */
  private static async checkH5File(content: string, _filePath: string): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];

    // HDF5 files are generally safer but check for suspicious metadata
    if (content.includes('__reduce__') || content.includes('lambda')) {
      const threat: ThreatDetection = {
        id: crypto.randomUUID(),
        model_id: '',
        threat_type: 'backdoor',
        confidence_score: 0.6,
        status: 'detected',
        description: 'HDF5 file with suspicious function references',
        metadata: {
          formatType: 'hdf5',
          suspiciousPattern: 'Function references in HDF5 metadata'
        },
        created_at: new Date(),
        updated_at: new Date()
      };
      threats.push(threat);
    }

    return threats;
  }

  /**
   * Check ONNX files
   */
  private static async checkOnnxFile(content: string, _filePath: string): Promise<ThreatDetection[]> {
    const threats: ThreatDetection[] = [];

    // ONNX files are generally safe but check for unusual node types
    const suspiciousNodes = ['PythonOp', 'Script', 'Exec'];
    for (const nodeType of suspiciousNodes) {
      if (content.includes(nodeType)) {
        const threat: ThreatDetection = {
          id: crypto.randomUUID(),
          model_id: '',
          threat_type: 'backdoor',
          confidence_score: 0.8,
          status: 'detected',
          description: `ONNX model with suspicious node type: ${nodeType}`,
          metadata: {
            formatType: 'onnx',
            suspiciousNodeType: nodeType
          },
          created_at: new Date(),
          updated_at: new Date()
        };
        threats.push(threat);
      }
    }

    return threats;
  }

  /**
   * Validate file before scanning
   */
  private static async validateFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      
      if (!stats.isFile()) {
        throw new Error('Path is not a file');
      }

      if (stats.size > this.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${this.MAX_FILE_SIZE} bytes`);
      }

      if (stats.size === 0) {
        throw new Error('File is empty');
      }

    } catch (error) {
      if (error instanceof Error && error.message.includes('ENOENT')) {
        throw new Error('File not found');
      }
      throw error;
    }
  }

  /**
   * Read file content safely
   */
  private static async readFileContent(filePath: string): Promise<string> {
    try {
      // Read first 1MB for text analysis
      const buffer = await fs.readFile(filePath);
      const maxReadSize = 1024 * 1024; // 1MB
      const readSize = Math.min(buffer.length, maxReadSize);
      
      return buffer.slice(0, readSize).toString('utf8', 0, readSize);
    } catch (error) {
      logger.warn('Failed to read file as text, using binary analysis', {
        filePath,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Fallback to binary analysis
      const buffer = await fs.readFile(filePath);
      return buffer.toString('hex');
    }
  }

  /**
   * Determine if file should be quarantined
   */
  private static shouldQuarantineFile(threats: ThreatDetection[]): boolean {
    if (threats.length === 0) return false;

    // Quarantine if any threat has high confidence
    const hasHighConfidenceThreat = threats.some(
      threat => threat.confidence_score >= this.QUARANTINE_THRESHOLD
    );

    // Quarantine if multiple medium confidence threats
    const mediumConfidenceThreats = threats.filter(
      threat => threat.confidence_score >= 0.5
    );

    return hasHighConfidenceThreat || mediumConfidenceThreats.length >= 3;
  }

  /**
   * Quarantine file
   */
  private static async quarantineFile(
    scan: ModelScan,
    threats: ThreatDetection[]
  ): Promise<void> {
    try {
      const { FileUploadService } = await import('@/services/FileUploadService');
      
      const quarantineReason = `Multiple threats detected: ${threats
        .map(t => t.threat_type)
        .join(', ')}`;

      await FileUploadService.quarantineFile(scan.id as string, quarantineReason);
      await NotificationUtils.sendFileQuarantineNotification(scan, quarantineReason);

      logger.warn('File quarantined', {
        scanId: scan.id,
        filename: scan.filename,
        threatCount: threats.length,
        reason: quarantineReason
      });

    } catch (error) {
      logger.error('Failed to quarantine file', {
        scanId: scan.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send scan completion notifications
   */
  private static async sendScanNotifications(
    scan: ModelScan,
    scanResults: { threatDetections: ThreatDetection[] },
    status: string
  ): Promise<void> {
    try {
      if (status === 'completed') {
        await NotificationUtils.sendScanCompleteNotification(scan);
      }

      // Send individual threat notifications for high-confidence threats
      for (const threat of scanResults.threatDetections) {
        if (threat.confidence_score >= 0.7) {
          await NotificationUtils.sendThreatDetectedNotification(scan, threat);
        }
      }

    } catch (error) {
      logger.error('Failed to send scan notifications', {
        scanId: scan.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Cache scan results
   */
  private static async cacheScanResults(
    scanId: string,
    results: { threatDetections: ThreatDetection[]; scanResults: Record<string, unknown> }
  ): Promise<void> {
    try {
      await setCache(`scan_results:${scanId}`, results, this.CACHE_TTL);
    } catch (error) {
      logger.warn('Failed to cache scan results', {
        scanId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get cached scan results
   */
  static async getCachedScanResults(scanId: string): Promise<{
    threatDetections: ThreatDetection[];
    scanResults: Record<string, unknown>;
  } | null> {
    try {
      return await getCache(`scan_results:${scanId}`) as {
        threatDetections: ThreatDetection[];
        scanResults: Record<string, unknown>;
      } | null;
    } catch {
      return null;
    }
  }

  /**
   * Split content into chunks for analysis
   */
  private static splitIntoChunks(content: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Calculate Shannon entropy
   */
  private static calculateEntropy(data: string): number {
    if (data.length === 0) return 0;

    const frequency: Record<string, number> = {};
    for (const char of data) {
      frequency[char] = (frequency[char] || 0) + 1;
    }

    let entropy = 0;
    const length = data.length;
    
    for (const count of Object.values(frequency)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }

  /**
   * Get scanning statistics
   */
  static async getScanningStats(): Promise<Record<string, unknown>> {
    try {
      const stats = await ModelScanModel.getScanStats();
      return {
        ...stats,
        scanningService: 'active',
        supportedFormats: ['.pkl', '.pth', '.pt', '.h5', '.hdf5', '.pb', '.onnx', '.tflite'],
        vulnerabilityPatterns: this.VULNERABILITY_PATTERNS.length,
        quarantineThreshold: this.QUARANTINE_THRESHOLD
      };
    } catch (error) {
      logger.error('Failed to get scanning stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { error: 'Failed to retrieve statistics' };
    }
  }
}