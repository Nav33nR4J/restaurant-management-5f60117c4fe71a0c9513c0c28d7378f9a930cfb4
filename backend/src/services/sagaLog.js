/**
 * Saga Log Model - Tracks saga execution states
 * 
 * The saga pattern ensures distributed transactions through a sequence of local transactions.
 * Each step can be compensated (rolled back) if a later step fails.
 */
const { pool } = require('../config/database');
const { generateId } = require('../utils/auth');

// Saga States
const SAGA_STATES = {
  STARTED: 'started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  COMPENSATING: 'compensating',
  COMPENSATED: 'compensated'
};

// Saga Step States
const STEP_STATES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  COMPENSATED: 'compensated'
};

/**
 * Initialize saga log table
 */
const initSagaLog = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS saga_logs (
      id VARCHAR(36) PRIMARY KEY,
      saga_type VARCHAR(100) NOT NULL,
      saga_id VARCHAR(36) NOT NULL,
      current_step INT DEFAULT 0,
      state ENUM('started', 'in_progress', 'completed', 'failed', 'compensating', 'compensated') DEFAULT 'started',
      payload JSON,
      result JSON,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      INDEX idx_saga_type (saga_type),
      INDEX idx_saga_id (saga_id),
      INDEX idx_state (state)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS saga_steps (
      id VARCHAR(36) PRIMARY KEY,
      saga_log_id VARCHAR(36) NOT NULL,
      step_name VARCHAR(100) NOT NULL,
      step_order INT NOT NULL,
      state ENUM('pending', 'completed', 'failed', 'compensated') DEFAULT 'pending',
      payload JSON,
      result JSON,
      compensation_data JSON,
      error_message TEXT,
      started_at TIMESTAMP NULL,
      completed_at TIMESTAMP NULL,
      FOREIGN KEY (saga_log_id) REFERENCES saga_logs(id),
      INDEX idx_saga_log_id (saga_log_id),
      INDEX idx_step_name (step_name)
    )
  `);
};

/**
 * Create a new saga log entry
 */
const createSagaLog = async (sagaType, sagaId, initialPayload) => {
  const id = generateId();
  await pool.execute(
    'INSERT INTO saga_logs (id, saga_type, saga_id, state, payload) VALUES (?, ?, ?, ?, ?)',
    [id, sagaType, sagaId, SAGA_STATES.STARTED, JSON.stringify(initialPayload)]
  );
  return id;
};

/**
 * Update saga log state
 */
const updateSagaState = async (sagaLogId, state, result = null, errorMessage = null) => {
  const completedAt = [SAGA_STATES.COMPLETED, SAGA_STATES.COMPENSATED, SAGA_STATES.FAILED].includes(state)
    ? new Date()
    : null;
  
  await pool.execute(
    `UPDATE saga_logs 
     SET state = ?, result = ?, error_message = ?, current_step = current_step + 1, completed_at = ?
     WHERE id = ?`,
    [state, result ? JSON.stringify(result) : null, errorMessage, completedAt, sagaLogId]
  );
};

/**
 * Add a step to the saga
 */
const addSagaStep = async (sagaLogId, stepName, stepOrder, payload) => {
  const id = generateId();
  await pool.execute(
    'INSERT INTO saga_steps (id, saga_log_id, step_name, step_order, state, payload, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, sagaLogId, stepName, stepOrder, STEP_STATES.PENDING, JSON.stringify(payload), new Date()]
  );
  return id;
};

/**
 * Mark step as completed
 */
const completeStep = async (stepId, result, compensationData = null) => {
  await pool.execute(
    `UPDATE saga_steps 
     SET state = ?, result = ?, compensation_data = ?, completed_at = ?
     WHERE id = ?`,
    [STEP_STATES.COMPLETED, JSON.stringify(result), JSON.stringify(compensationData), new Date(), stepId]
  );
};

/**
 * Mark step as failed
 */
const failStep = async (stepId, errorMessage) => {
  await pool.execute(
    'UPDATE saga_steps SET state = ?, error_message = ? WHERE id = ?',
    [STEP_STATES.FAILED, errorMessage, stepId]
  );
};

/**
 * Mark step as compensated
 */
const compensateStep = async (stepId, result) => {
  await pool.execute(
    'UPDATE saga_steps SET state = ?, result = ?, completed_at = ? WHERE id = ?',
    [STEP_STATES.COMPENSATED, JSON.stringify(result), new Date(), stepId]
  );
};

/**
 * Get saga log by ID
 */
const getSagaLog = async (sagaLogId) => {
  const [logs] = await pool.execute(
    'SELECT * FROM saga_logs WHERE id = ?',
    [sagaLogId]
  );
  
  if (logs.length === 0) return null;
  
  const [steps] = await pool.execute(
    'SELECT * FROM saga_steps WHERE saga_log_id = ? ORDER BY step_order DESC',
    [sagaLogId]
  );
  
  return {
    ...logs[0],
    payload: logs[0].payload ? JSON.parse(logs[0].payload) : null,
    result: logs[0].result ? JSON.parse(logs[0].result) : null,
    steps
  };
};

/**
 * Get saga log by saga ID
 */
const getSagaLogBySagaId = async (sagaId) => {
  const [logs] = await pool.execute(
    'SELECT * FROM saga_logs WHERE saga_id = ? ORDER BY created_at DESC LIMIT 1',
    [sagaId]
  );
  
  if (logs.length === 0) return null;
  
  const [steps] = await pool.execute(
    'SELECT * FROM saga_steps WHERE saga_log_id = ? ORDER BY step_order DESC',
    [logs[0].id]
  );
  
  return {
    ...logs[0],
    payload: logs[0].payload ? JSON.parse(logs[0].payload) : null,
    result: logs[0].result ? JSON.parse(logs[0].result) : null,
    steps
  };
};

/**
 * Get pending sagas for recovery
 */
const getPendingSagas = async (limit = 50) => {
  const [logs] = await pool.execute(
    `SELECT * FROM saga_logs 
     WHERE state IN ('started', 'in_progress', 'compensating')
     ORDER BY created_at ASC LIMIT ?`,
    [limit]
  );
  return logs;
};

module.exports = {
  pool,
  SAGA_STATES,
  STEP_STATES,
  initSagaLog,
  createSagaLog,
  updateSagaState,
  addSagaStep,
  completeStep,
  failStep,
  compensateStep,
  getSagaLog,
  getSagaLogBySagaId,
  getPendingSagas
};
