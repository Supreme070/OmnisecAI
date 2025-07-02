const express = require('express');
const { getSecurityEvents } = require('../config/mongodb');
const { getCounter } = require('../config/valkey');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/v1/monitoring/metrics
// @desc    Get system metrics
// @access  Private
router.get('/metrics', async (req, res) => {
  try {
    // Get counters from Valkey
    const metrics = {
      api_requests: await getCounter('api_requests'),
      successful_logins: await getCounter('successful_logins'),
      failed_logins: await getCounter('failed_logins'),
      model_uploads: await getCounter('model_uploads'),
      threats_detected: await getCounter('threats_detected')
    };

    res.json({
      success: true,
      data: { metrics },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get metrics failed', {
      error: error.message,
      organizationId: req.user.organizationId,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get metrics.',
      timestamp: new Date().toISOString()
    });
  }
});

// @route   GET /api/v1/monitoring/events
// @desc    Get security events
// @access  Private
router.get('/events', async (req, res) => {
  try {
    const events = await getSecurityEvents(
      { organization_id: req.user.organizationId },
      { limit: 100 }
    );

    res.json({
      success: true,
      data: { events },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get events failed', {
      error: error.message,
      organizationId: req.user.organizationId,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get events.',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;