const express = require('express');
const multer = require('multer');
const { query } = require('../config/database');
const { logModelInteraction } = require('../config/mongodb');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/models/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// @route   GET /api/v1/models
// @desc    Get all AI models
// @access  Private
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, type, version, description, file_size, is_active, created_at
       FROM ai_models 
       WHERE organization_id = $1 
       ORDER BY created_at DESC`,
      [req.user.organizationId]
    );

    res.json({
      success: true,
      data: {
        models: result.rows,
        total: result.rows.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get models failed', {
      error: error.message,
      organizationId: req.user.organizationId,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get models.',
      timestamp: new Date().toISOString()
    });
  }
});

// @route   POST /api/v1/models/upload
// @desc    Upload AI model
// @access  Private
router.post('/upload', upload.single('model'), async (req, res) => {
  try {
    const { name, type, version, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'Model file is required.',
        timestamp: new Date().toISOString()
      });
    }

    // Insert model record
    const result = await query(
      `INSERT INTO ai_models (organization_id, name, type, version, description, file_path, file_size, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.organizationId, name, type, version, description, file.path, file.size, req.user.id]
    );

    const model = result.rows[0];

    // Log model interaction
    await logModelInteraction({
      model_id: model.id,
      organization_id: req.user.organizationId,
      user_id: req.user.id,
      interaction_type: 'upload',
      input_data: {
        name,
        type,
        version,
        file_size: file.size
      }
    });

    res.status(201).json({
      success: true,
      message: 'Model uploaded successfully',
      data: { model },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Model upload failed', {
      error: error.message,
      userId: req.user.id,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      error: 'Failed to upload model.',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;