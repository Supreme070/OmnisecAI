const express = require('express');
const { query } = require('../config/database');
const { authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/v1/users
// @desc    Get all users in organization
// @access  Private (admin, security_analyst)
router.get('/', authorize('admin', 'security_analyst'), async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, role, is_active, last_login, created_at
       FROM users 
       WHERE organization_id = $1 
       ORDER BY created_at DESC`,
      [req.user.organizationId]
    );

    res.json({
      success: true,
      data: {
        users: result.rows,
        total: result.rows.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get users failed', {
      error: error.message,
      organizationId: req.user.organizationId,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get users.',
      timestamp: new Date().toISOString()
    });
  }
});

// @route   GET /api/v1/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get profile.',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;