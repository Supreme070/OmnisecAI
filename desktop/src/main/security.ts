/**
 * Security manager for OmnisecAI Desktop
 * Handles certificate verification, CSP, and security policies
 */
import { Certificate } from 'electron';
import log from 'electron-log';

export class SecurityManager {
  private trustedDomains: Set<string>;
  private blockedDomains: Set<string>;

  constructor() {
    this.trustedDomains = new Set([
      'omnisecai.com',
      'api.omnisecai.com',
      'localhost',
      '127.0.0.1',
    ]);
    
    this.blockedDomains = new Set([
      // Add any domains that should be blocked
    ]);
  }

  /**
   * Verify SSL certificate for a given URL
   */
  public verifyCertificate(url: string, certificate: Certificate): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      // Always allow localhost and development URLs
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return true;
      }

      // Check if domain is explicitly blocked
      if (this.isBlocked(hostname)) {
        log.warn(`Blocked certificate verification for ${hostname}`);
        return false;
      }

      // Check if domain is trusted
      if (this.isTrusted(hostname)) {
        return this.validateCertificate(certificate, hostname);
      }

      // For unknown domains, perform strict validation
      return this.strictCertificateValidation(certificate, hostname);
    } catch (error) {
      log.error('Certificate verification error:', error);
      return false;
    }
  }

  /**
   * Check if a domain is in the trusted list
   */
  private isTrusted(hostname: string): boolean {
    // Check exact match
    if (this.trustedDomains.has(hostname)) {
      return true;
    }

    // Check subdomain match
    for (const trustedDomain of this.trustedDomains) {
      if (hostname.endsWith('.' + trustedDomain)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a domain is blocked
   */
  private isBlocked(hostname: string): boolean {
    return this.blockedDomains.has(hostname) || 
           Array.from(this.blockedDomains).some(blocked => hostname.endsWith('.' + blocked));
  }

  /**
   * Validate certificate for trusted domains
   */
  private validateCertificate(certificate: Certificate, hostname: string): boolean {
    // Basic certificate validation
    if (!certificate || !certificate.subject) {
      log.warn(`Invalid certificate for ${hostname}`);
      return false;
    }

    // Check if certificate is expired (if expiry date is available)
    const now = new Date();
    if (certificate.validExpiry && new Date(certificate.validExpiry) < now) {
      log.warn(`Expired certificate for ${hostname}`);
      return false;
    }

    // Check if certificate is not yet valid
    if (certificate.validStart && new Date(certificate.validStart) > now) {
      log.warn(`Certificate not yet valid for ${hostname}`);
      return false;
    }

    log.info(`Certificate validated for ${hostname}`);
    return true;
  }

  /**
   * Strict certificate validation for unknown domains
   */
  private strictCertificateValidation(certificate: Certificate, hostname: string): boolean {
    // For unknown domains, we require stricter validation
    if (!this.validateCertificate(certificate, hostname)) {
      return false;
    }

    // Additional checks for unknown domains
    if (!certificate.issuer || !certificate.subjectName) {
      log.warn(`Incomplete certificate information for unknown domain ${hostname}`);
      return false;
    }

    // Check if the certificate subject matches the hostname
    const subjectName = certificate.subjectName.toLowerCase();
    const hostnameToCheck = hostname.toLowerCase();
    
    if (!subjectName.includes(hostnameToCheck) && !this.checkWildcardMatch(subjectName, hostnameToCheck)) {
      log.warn(`Certificate subject mismatch for ${hostname}`);
      return false;
    }

    log.info(`Strict certificate validation passed for ${hostname}`);
    return true;
  }

  /**
   * Check if hostname matches a wildcard certificate
   */
  private checkWildcardMatch(subjectName: string, hostname: string): boolean {
    // Simple wildcard matching for *.example.com certificates
    if (subjectName.startsWith('*.')) {
      const wildcardDomain = subjectName.substring(2);
      return hostname.endsWith('.' + wildcardDomain) || hostname === wildcardDomain;
    }
    return false;
  }

  /**
   * Add a domain to the trusted list
   */
  public addTrustedDomain(domain: string): void {
    this.trustedDomains.add(domain.toLowerCase());
    log.info(`Added trusted domain: ${domain}`);
  }

  /**
   * Remove a domain from the trusted list
   */
  public removeTrustedDomain(domain: string): void {
    this.trustedDomains.delete(domain.toLowerCase());
    log.info(`Removed trusted domain: ${domain}`);
  }

  /**
   * Add a domain to the blocked list
   */
  public addBlockedDomain(domain: string): void {
    this.blockedDomains.add(domain.toLowerCase());
    log.info(`Added blocked domain: ${domain}`);
  }

  /**
   * Remove a domain from the blocked list
   */
  public removeBlockedDomain(domain: string): void {
    this.blockedDomains.delete(domain.toLowerCase());
    log.info(`Removed blocked domain: ${domain}`);
  }

  /**
   * Get Content Security Policy headers
   */
  public getCSPHeaders(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss: https://api.omnisecai.com https://omnisecai.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
  }

  /**
   * Validate URL before navigation
   */
  public validateNavigation(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      // Block blocked domains
      if (this.isBlocked(hostname)) {
        log.warn(`Navigation blocked to ${hostname}`);
        return false;
      }

      // Allow trusted domains and localhost
      if (this.isTrusted(hostname) || hostname === 'localhost' || hostname === '127.0.0.1') {
        return true;
      }

      // Block navigation to unknown external domains
      log.warn(`Navigation blocked to unknown domain ${hostname}`);
      return false;
    } catch (error) {
      log.error('URL validation error:', error);
      return false;
    }
  }
}