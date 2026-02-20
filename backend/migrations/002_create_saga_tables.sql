-- Saga Log Table
-- Tracks saga execution states for distributed transaction management

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
);

-- Saga Steps Table
-- Tracks individual steps within each saga

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
);
