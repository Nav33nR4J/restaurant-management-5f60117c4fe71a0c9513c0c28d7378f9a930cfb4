/**
 * Saga Management API Routes
 * 
 * Endpoints for managing and monitoring saga executions
 */
const express = require('express');
const router = express.Router();
const sagaLog = require('../services/sagaLog');
const { retrySaga, compensateSaga } = require('../services/sagaOrchestrator');
const { successResponse, paginatedResponse } = require('../utils/response');

/**
 * Get all saga logs with optional filtering
 */
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, state, saga_type } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM saga_logs WHERE 1=1';
    const params = [];

    if (state) {
      query += ' AND state = ?';
      params.push(state);
    }

    if (saga_type) {
      query += ' AND saga_type = ?';
      params.push(saga_type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [logs] = await sagaLog.pool.execute(query, params);

    // Parse JSON fields
    const parsedLogs = logs.map(log => ({
      ...log,
      payload: log.payload ? JSON.parse(log.payload) : null,
      result: log.result ? JSON.parse(log.result) : null
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM saga_logs WHERE 1=1';
    const countParams = [];
    if (state) {
      countQuery += ' AND state = ?';
      countParams.push(state);
    }
    if (saga_type) {
      countQuery += ' AND saga_type = ?';
      countParams.push(saga_type);
    }
    const [countResult] = await sagaLog.pool.execute(countQuery, countParams);

    return paginatedResponse(res, parsedLogs, pageNum, limitNum, countResult[0].total);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a specific saga log with all its steps
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const saga = await sagaLog.getSagaLog(id);

    if (!saga) {
      return res.status(404).json({ success: false, message: 'Saga not found' });
    }

    return successResponse(res, saga);
  } catch (error) {
    next(error);
  }
});

/**
 * Get saga by saga_id (for tracking order-related sagas)
 */
router.get('/track/:sagaId', async (req, res, next) => {
  try {
    const { sagaId } = req.params;
    const saga = await sagaLog.getSagaLogBySagaId(sagaId);

    if (!saga) {
      return res.status(404).json({ success: false, message: 'Saga not found' });
    }

    return successResponse(res, saga);
  } catch (error) {
    next(error);
  }
});

/**
 * Retry a failed saga
 */
router.post('/:id/retry', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await retrySaga(id);
    return successResponse(res, result, 'Saga retry initiated');
  } catch (error) {
    next(error);
  }
});

/**
 * Manually compensate a saga
 */
router.post('/:id/compensate', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await compensateSaga(id);
    return successResponse(res, result, 'Saga compensation initiated');
  } catch (error) {
    next(error);
  }
});

/**
 * Get pending sagas (for recovery)
 */
router.get('/system/pending', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const sagas = await sagaLog.getPendingSagas(parseInt(limit, 10) || 50);
    return successResponse(res, sagas);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
