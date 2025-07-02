const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { setSession, deleteSession } = require('../config/valkey');
const { logSecurityEvent } = require('../config/mongodb');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, organizationSlug } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, first name, and last name are required.',
        timestamp: new Date().toISOString()
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format.',
        timestamp: new Date().toISOString()
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.',
        timestamp: new Date().toISOString()
      });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists.',
        timestamp: new Date().toISOString()
      });
    }

    // Get or create organization
    let organizationId;
    if (organizationSlug) {
      const orgResult = await query(
        'SELECT id FROM organizations WHERE slug = $1',
        [organizationSlug]
      );
      
      if (orgResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Organization not found.',
          timestamp: new Date().toISOString()
        });
      }
      
      organizationId = orgResult.rows[0].id;
    } else {
      // Use default organization
      const defaultOrg = await query(
        'SELECT id FROM organizations WHERE slug = $1',
        ['omnisecai-demo']
      );
      organizationId = defaultOrg.rows[0].id;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      `INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role, organization_id, created_at`,
      [organizationId, email.toLowerCase(), passwordHash, firstName, lastName, 'viewer']
    );

    const user = result.rows[0];

    // Log security event
    await logSecurityEvent({
      event_type: 'authentication',
      severity: 'info',
      source: 'auth_api',
      organization_id: organizationId,
      user_id: user.id,
      details: {
        action: 'user_registration',
        email: email.toLowerCase(),
        success: true
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      organizationId,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          organizationId: user.organization_id,
          createdAt: user.created_at
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('User registration failed', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
        timestamp: new Date().toISOString()
      });
    }

    // Get user from database
    const result = await query(
      `SELECT u.*, o.name as organization_name, o.slug as organization_slug 
       FROM users u 
       JOIN organizations o ON u.organization_id = o.id 
       WHERE u.email = $1 AND u.is_active = true`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      await logSecurityEvent({
        event_type: 'authentication',
        severity: 'medium',
        source: 'auth_api',
        details: {
          action: 'failed_login',
          email: email.toLowerCase(),
          reason: 'user_not_found',
          success: false
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
        timestamp: new Date().toISOString()
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      await logSecurityEvent({
        event_type: 'authentication',
        severity: 'medium',
        source: 'auth_api',
        organization_id: user.organization_id,
        user_id: user.id,
        details: {
          action: 'failed_login',
          email: email.toLowerCase(),
          reason: 'invalid_password',
          success: false
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
        timestamp: new Date().toISOString()
      });
    }

    // Create session
    const sessionId = uuidv4();
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
      loginTime: new Date().toISOString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Store session in Valkey (24 hours)
    await setSession(sessionId, sessionData, 86400);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organization_id,
        sessionId
      },
      process.env.JWT_SECRET || 'omnisecai_jwt_secret_change_in_production',
      { expiresIn: '24h' }
    );

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Log successful login
    await logSecurityEvent({
      event_type: 'authentication',
      severity: 'info',
      source: 'auth_api',
      organization_id: user.organization_id,
      user_id: user.id,
      details: {
        action: 'successful_login',
        email: user.email,
        sessionId,
        success: true
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
      sessionId,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          organizationId: user.organization_id,
          organizationName: user.organization_name,
          organizationSlug: user.organization_slug,
          mfaEnabled: user.mfa_enabled,
          lastLogin: user.last_login
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('User login failed', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Get session ID from token
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.decode(token);

    if (decoded && decoded.sessionId) {
      await deleteSession(decoded.sessionId);
    }

    // Log logout event
    await logSecurityEvent({
      event_type: 'authentication',
      severity: 'info',
      source: 'auth_api',
      organization_id: req.user.organizationId,
      user_id: req.user.id,
      details: {
        action: 'user_logout',
        email: req.user.email,
        sessionId: decoded?.sessionId,
        success: true
      },
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    logger.info('User logged out successfully', {
      userId: req.user.id,
      email: req.user.email,
      sessionId: decoded?.sessionId,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('User logout failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Logout failed. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
});

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get current user failed', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get user information.',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;