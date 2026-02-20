/**
 * Saga Orchestrator - Manages saga execution and compensation
 * 
 * The orchestrator handles:
 * 1. Sequential execution of saga steps
 * 2. Automatic compensation (rollback) on failure
 * 3. State persistence for recovery
 */
const { pool } = require('../config/database');
const sagaLog = require('./sagaLog');

/**
 * Saga Orchestrator Class
 * Manages the execution of a saga with automatic compensation
 */
class SagaOrchestrator {
  constructor(sagaType, sagaId) {
    this.sagaType = sagaType;
    this.sagaId = sagaId;
    this.sagaLogId = null;
    this.steps = [];
    this.executedSteps = [];
  }

  /**
   * Initialize the saga
   */
  async initialize(payload) {
    this.sagaLogId = await sagaLog.createSagaLog(this.sagaType, this.sagaId, payload);
    await sagaLog.updateSagaState(this.sagaLogId, sagaLog.SAGA_STATES.IN_PROGRESS);
    return this.sagaLogId;
  }

  /**
   * Add a step to the saga
   */
  addStep(stepName, executeFn, compensateFn, payload = {}) {
    const stepOrder = this.steps.length;
    this.steps.push({
      name: stepName,
      execute: executeFn,
      compensate: compensateFn,
      payload,
      order: stepOrder
    });
    return this;
  }

  /**
   * Execute the saga
   */
  async execute(initialPayload) {
    await this.initialize(initialPayload);
    
    try {
      // Execute each step sequentially
      for (const step of this.steps) {
        const stepId = await sagaLog.addSagaStep(
          this.sagaLogId,
          step.name,
          step.order,
          step.payload
        );

        console.log(`[Saga ${this.sagaId}] Executing step: ${step.name}`);

        try {
          // Execute the step
          const result = await step.execute(step.payload);
          
          // Store compensation data for potential rollback
          const compensationData = result.compensation || result;
          
          // Mark step as completed
          await sagaLog.completeStep(stepId, result, compensationData);
          
          // Track executed step
          this.executedSteps.push({
            step,
            stepId,
            result
          });

          // Update payload for next step with results
          if (result.data) {
            // Update subsequent steps with result data
            this.steps.slice(step.order + 1).forEach(s => {
              if (s.payload.dependsOn === step.name) {
                s.payload = { ...s.payload, ...result.data };
              }
            });
          }

        } catch (stepError) {
          console.error(`[Saga ${this.sagaId}] Step ${step.name} failed:`, stepError.message);
          await sagaLog.failStep(stepId, stepError.message);
          
          // Compensate all previous steps
          await this.compensate();
          
          throw stepError;
        }
      }

      // All steps completed successfully
      await sagaLog.updateSagaState(
        this.sagaLogId,
        sagaLog.SAGA_STATES.COMPLETED,
        { sagaId: this.sagaId }
      );

      console.log(`[Saga ${this.sagaId}] Completed successfully`);
      
      // Get final result
      const finalStep = this.executedSteps[this.executedSteps.length - 1];
      return finalStep ? finalStep.result : { success: true };

    } catch (error) {
      await sagaLog.updateSagaState(
        this.sagaLogId,
        sagaLog.SAGA_STATES.FAILED,
        null,
        error.message
      );
      throw error;
    }
  }

  /**
   * Compensate (rollback) all executed steps
   */
  async compensate() {
    console.log(`[Saga ${this.sagaId}] Starting compensation...`);
    
    await sagaLog.updateSagaState(
      this.sagaLogId,
      sagaLog.SAGA_STATES.COMPENSATING
    );

    // Compensate in reverse order
    for (const executedStep of this.executedSteps.reverse()) {
      const { step, stepId, result } = executedStep;
      
      if (step.compensate) {
        console.log(`[Saga ${this.sagaId}] Compensating step: ${step.name}`);
        
        try {
          const compensationData = result.compensation || result;
          const compensationResult = await step.compensate(compensationData);
          await sagaLog.compensateStep(stepId, compensationResult);
        } catch (compError) {
          console.error(`[Saga ${this.sagaId}] Compensation for ${step.name} failed:`, compError.message);
          // Continue compensating other steps even if one fails
        }
      }
    }

    await sagaLog.updateSagaState(
      this.sagaLogId,
      sagaLog.SAGA_STATES.COMPENSATED
    );

    console.log(`[Saga ${this.sagaId}] Compensation completed`);
  }

  /**
   * Get saga status
   */
  async getStatus() {
    return await sagaLog.getSagaLog(this.sagaLogId);
  }
}

/**
 * Create a new saga orchestrator
 */
const createSaga = (sagaType, sagaId) => {
  return new SagaOrchestrator(sagaType, sagaId);
};

/**
 * Retry a failed saga
 */
const retrySaga = async (sagaLogId) => {
  const saga = await sagaLog.getSagaLog(sagaLogId);
  
  if (!saga) {
    throw new Error('Saga not found');
  }

  if (saga.state !== sagaLog.SAGA_STATES.FAILED) {
    throw new Error('Can only retry failed sagas');
  }

  // Create new saga with same type and ID
  const orchestrator = new SagaOrchestrator(saga.saga_type, saga.saga_id);
  return orchestrator.execute(saga.payload);
};

/**
 * Manually compensate a saga
 */
const compensateSaga = async (sagaLogId) => {
  const saga = await sagaLog.getSagaLog(sagaLogId);
  
  if (!saga) {
    throw new Error('Saga not found');
  }

  if (saga.state === sagaLog.SAGA_STATES.COMPENSATED) {
    throw new Error('Saga already compensated');
  }

  const orchestrator = new SagaOrchestrator(saga.saga_type, saga.saga_id);
  orchestrator.sagaLogId = sagaLogId;
  
  // Reconstruct executed steps from log
  for (const step of saga.steps) {
    if (step.state === sagaLog.STEP_STATES.COMPLETED) {
      orchestrator.executedSteps.push({
        step: {
          name: step.step_name,
          compensate: null // Will need to be provided by caller
        },
        stepId: step.id,
        result: step.result
      });
    }
  }

  await orchestrator.compensate();
  return orchestrator.getStatus();
};

module.exports = {
  SagaOrchestrator,
  createSaga,
  retrySaga,
  compensateSaga
};
