const express = require('express');
const { query } = require('../config/database');
const { getThreatDetections, getSecurityEvents } = require('../config/mongodb');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/v1/security/dashboard
// @desc    Get security dashboard data
// @access  Private
router.get('/dashboard', async (req, res) => {
  try {
    // Get threat summary
    const threatsResult = await query(
      `SELECT severity, COUNT(*) as count
       FROM security_threats 
       WHERE organization_id = $1 AND NOT is_resolved
       GROUP BY severity`,
      [req.user.organizationId]
    );

    // Get recent threats from MongoDB
    const recentThreats = await getThreatDetections(
      { organization_id: req.user.organizationId },
      { limit: 10 }
    );

    // Get security events from MongoDB
    const recentEvents = await getSecurityEvents(
      { organization_id: req.user.organizationId },
      { limit: 20 }
    );

    // Get model count
    const modelsResult = await query(
      'SELECT COUNT(*) as total, COUNT(CASE WHEN is_active THEN 1 END) as active FROM ai_models WHERE organization_id = $1',
      [req.user.organizationId]
    );

    const dashboardData = {
      threats: {
        summary: threatsResult.rows,
        recent: recentThreats
      },
      events: recentEvents,
      models: modelsResult.rows[0],
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Security dashboard failed', {
      error: error.message,
      organizationId: req.user.organizationId,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get security dashboard.',
      timestamp: new Date().toISOString()
    });
  }
});

// @route   GET /api/v1/security/threats
// @desc    Get security threats
// @access  Private
router.get('/threats', async (req, res) => {
  try {
    const result = await query(
      `SELECT st.*, am.name as model_name
       FROM security_threats st
       LEFT JOIN ai_models am ON st.model_id = am.id
       WHERE st.organization_id = $1
       ORDER BY st.created_at DESC
       LIMIT 50`,
      [req.user.organizationId]
    );

    res.json({
      success: true,
      data: {
        threats: result.rows,
        total: result.rows.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get threats failed', {
      error: error.message,
      organizationId: req.user.organizationId,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get threats.',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;