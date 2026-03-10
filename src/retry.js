import { submitForm } from './api';

/**
 * UI States for the submission
 */
export const UI_STATE = {
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  RETRYING: 'RETRYING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

/**
 * Configuration for retry logic
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 2000, // 2 seconds
  useExponentialBackoff: true,
  retryableStatusCodes: [503],
};

/**
 * Calculate delay for exponential backoff
 * @param {number} attempt - Current retry attempt (0-indexed)
 * @returns {number} Delay in milliseconds
 */
const calculateDelay = (attempt) => {
  if (RETRY_CONFIG.useExponentialBackoff) {
    // Exponential backoff: 1s, 2s, 4s
    return RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  }
  // Fixed delay
  return RETRY_CONFIG.baseDelay;
};

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Resolves after the delay
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check if an error is retryable
 * @param {Error} error - The error object
 * @returns {boolean} True if the error should trigger a retry
 */
const isRetryable = (error) => {
  if (!error.response) {
    // Network error - retry
    return true;
  }
  return RETRY_CONFIG.retryableStatusCodes.includes(error.response.status);
};

/**
 * Submit form with retry logic
 * @param {string} requestId - Unique idempotency key
 * @param {string} email - User email
 * @param {number} amount - Transaction amount
 * @param {Function} onRetry - Callback when a retry occurs (receives attempt number)
 * @returns {Object} Result object with success status and data/error
 */
export const submitWithRetry = async (
  requestId,
  email,
  amount,
  onRetry = () => {}
) => {
  let lastError = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const response = await submitForm(requestId, email, amount);

      // Success - check if it's a delayed response
      if (response.data.status === 'delayed') {
        // For delayed responses, we'll treat as success but note the delay
        return {
          success: true,
          data: response.data,
          isDelayed: true,
        };
      }

      return {
        success: true,
        data: response.data,
        isDelayed: false,
      };
    } catch (error) {
      lastError = error;

      // If this was the last attempt, fail
      if (attempt === RETRY_CONFIG.maxRetries) {
        break;
      }

      // Check if we should retry
      if (!isRetryable(error)) {
        // Non-retryable error (e.g., 400 Bad Request)
        break;
      }

      // Calculate delay and notify caller
      const delay = calculateDelay(attempt);
      onRetry(attempt + 1, delay);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted or non-retryable error
  return {
    success: false,
    error: lastError,
    retriesExhausted: attempt === RETRY_CONFIG.maxRetries,
  };
};

/**
 * Get the current retry configuration
 * @returns {Object} Current retry configuration
 */
export const getRetryConfig = () => ({ ...RETRY_CONFIG });

/**
 * Update retry configuration
 * @param {Object} newConfig - New configuration options
 */
export const updateRetryConfig = (newConfig) => {
  Object.assign(RETRY_CONFIG, newConfig);
};
