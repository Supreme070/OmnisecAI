const express = require('express');
const { query } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/v1/llm/tests
// @desc    Get LLM test results
// @access  Private
router.get('/tests', async (req, res) => {
  try {
    const result = await query(
      `SELECT ltr.*, am.name as model_name
       FROM llm_test_results ltr
       LEFT JOIN ai_models am ON ltr.model_id = am.id
       WHERE ltr.organization_id = $1
       ORDER BY ltr.created_at DESC
       LIMIT 50`,
      [req.user.organizationId]
    );

    res.json({
      success: true,
      data: {
        tests: result.rows,
        total: result.rows.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get LLM tests failed', {
      error: error.message,
      organizationId: req.user.organizationId,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get LLM tests.',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;