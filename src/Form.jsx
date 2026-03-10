import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { UI_STATE, submitWithRetry } from './retry';

/**
 * Form component for submitting data
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {string} props.currentState - Current UI state
 * @param {Function} props.setCurrentState - Function to update UI state
 * @param {Function} props.updateRecord - Function to update a record
 * @param {Function} props.addRecord - Function to add a new record
 * @param {Object} props.submittedRequests - Map of submitted requests for idempotency
 * @param {Function} props.addToast - Function to show toast notifications
 */
const Form = ({
  onSubmit,
  currentState,
  setCurrentState,
  updateRecord,
  addRecord,
  submittedRequests,
  addToast,
}) => {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [retryCount, setRetryCount] = useState(0);

  // Validate form fields
  const validate = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Amount validation
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Generate unique requestId for idempotency
    const requestId = uuidv4();

    // Check if this request was already submitted (duplicate prevention)
    if (submittedRequests.current.has(requestId)) {
      console.log('Duplicate request detected, ignoring');
      addToast('Duplicate request detected', 'warning');
      return;
    }

    // Mark as submitted
    submittedRequests.current.set(requestId, true);

    // Set initial state to PENDING
    setCurrentState(UI_STATE.PENDING);
    addToast('Submitting transaction...', 'info', 2000);

    // Create initial record
    const record = {
      requestId,
      email,
      amount: parseFloat(amount),
      status: UI_STATE.PENDING,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    addRecord(record);

    // Callback for retry events
    const handleRetry = (attemptNumber, delay) => {
      setCurrentState(UI_STATE.RETRYING);
      setRetryCount(attemptNumber);
      updateRecord(requestId, {
        status: UI_STATE.RETRYING,
        retryCount: attemptNumber,
        lastRetryDelay: delay,
      });
      addToast(`Retry attempt ${attemptNumber}/3 (waiting ${delay / 1000}s)...`, 'warning', 2500);
    };

    // Submit with retry logic
    try {
      const result = await submitWithRetry(
        requestId,
        email,
        parseFloat(amount),
        handleRetry
      );

      if (result.success) {
        setCurrentState(UI_STATE.SUCCESS);
        updateRecord(requestId, {
          status: UI_STATE.SUCCESS,
          message: result.data?.message || 'Submitted successfully',
        });
        addToast('Transaction submitted successfully!', 'success');
      } else {
        setCurrentState(UI_STATE.FAILED);
        updateRecord(requestId, {
          status: UI_STATE.FAILED,
          error: result.error?.message || 'Submission failed',
        });
        addToast('Transaction failed. Please try again.', 'error');
      }
    } catch (error) {
      setCurrentState(UI_STATE.FAILED);
      updateRecord(requestId, {
        status: UI_STATE.FAILED,
        error: error.message || 'An unexpected error occurred',
      });
      addToast('An unexpected error occurred', 'error');
    }

    // Reset retry count
    setRetryCount(0);

    // Reset form fields
    setEmail('');
    setAmount('');
    setErrors({});

    // Notify parent
    onSubmit(record);
  };

  // Check if form is disabled
  const isDisabled = currentState === UI_STATE.PENDING || currentState === UI_STATE.RETRYING;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Submit Transaction
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isDisabled}
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Amount Field */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isDisabled}
            className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isDisabled}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {currentState === UI_STATE.PENDING && (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Submitting...</span>
            </>
          )}
          
          {currentState === UI_STATE.RETRYING && (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Retrying ({retryCount}/3)...</span>
            </>
          )}
          
          {currentState !== UI_STATE.PENDING && currentState !== UI_STATE.RETRYING && (
            <span>Submit</span>
          )}
        </button>
      </form>

      {/* Current State Indicator with Badges */}
      {currentState !== UI_STATE.IDLE && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentState === UI_STATE.PENDING
                  ? 'bg-yellow-100 text-yellow-800'
                  : currentState === UI_STATE.RETRYING
                  ? 'bg-orange-100 text-orange-800'
                  : currentState === UI_STATE.SUCCESS
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {currentState === UI_STATE.PENDING && '⏳ Pending'}
              {currentState === UI_STATE.RETRYING && `🔄 Retrying (${retryCount}/3)`}
              {currentState === UI_STATE.SUCCESS && '✅ Success'}
              {currentState === UI_STATE.FAILED && '❌ Failed'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
