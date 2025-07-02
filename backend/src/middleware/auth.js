const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { getSession } = require('../config/valkey');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'omnisecai_jwt_secret_change_in_production');
      
      // Check if session exists in Valkey
      const sessionData = await getSession(decoded.sessionId);
      if (!sessionData) {
        return res.status(401).json({
          success: false,
          error: 'Session expired. Please login again.',
          timestamp: new Date().toISOString()
        });
      }

      // Get user from database
      const result = await query(
        `SELECT u.*, o.name as organization_name, o.slug as organization_slug 
         FROM users u 
         JOIN organizations o ON u.organization_id = o.id 
         WHERE u.id = $1 AND u.is_active = true`,
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: 'User not found or inactive.',
          timestamp: new Date().toISOString()
        });
      }

      const user = result.rows[0];

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        organizationSlug: user.organization_slug,
        settings: user.settings,
        mfaEnabled: user.mfa_enabled
      };

      // Update last activity
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      logger.debug('User authenticated', {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      next();
    } catch (error) {
      logger.error('Token verification failed', {
        error: error.message,
        token: token.substring(0, 20) + '...',
        ip: req.ip
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid token.',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      error: 'Authentication error.',
      timestamp: new Date().toISOString()
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Please authenticate.',
        timestamp: new Date().toISOString()
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip
      });

      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

const requireMFA = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Please authenticate.',
      timestamp: new Date().toISOString()
    });
  }

  if (!req.user.mfaEnabled) {
    return res.status(403).json({
      success: false,
      error: 'Multi-factor authentication required for this action.',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// API Key authentication middleware
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required.',
        timestamp: new Date().toISOString()
      });
    }

    // Get API key from database
    const result = await query(
      `SELECT ak.*, u.id as user_id, u.email, u.role, u.organization_id,
              o.name as organization_name, o.slug as organization_slug
       FROM api_keys ak
       JOIN users u ON ak.user_id = u.id
       JOIN organizations o ON ak.organization_id = o.id
       WHERE ak.key_hash = $1 AND ak.is_active = true 
       AND (ak.expires_at IS NULL OR ak.expires_at > CURRENT_TIMESTAMP)`,
      [Buffer.from(apiKey).toString('base64')]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired API key.',
        timestamp: new Date().toISOString()
      });
    }

    const keyData = result.rows[0];

    // Update last used timestamp
    await query(
      'UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = $1',
      [keyData.id]
    );

    // Attach API key info to request
    req.apiKey = {
      id: keyData.id,
      name: keyData.name,
      permissions: keyData.permissions
    };

    req.user = {
      id: keyData.user_id,
      email: keyData.email,
      role: keyData.role,
      organizationId: keyData.organization_id,
      organizationName: keyData.organization_name,
      organizationSlug: keyData.organization_slug
    };

    logger.debug('API key authenticated', {
      apiKeyId: keyData.id,
      apiKeyName: keyData.name,
      userId: keyData.user_id,
      organizationId: keyData.organization_id,
      ip: req.ip
    });

    next();
  } catch (error) {
    logger.error('API key authentication error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      error: 'Authentication error.',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  requireMFA,
  authenticateApiKey
};