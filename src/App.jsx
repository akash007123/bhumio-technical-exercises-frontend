import { useState, useRef, useEffect, useCallback } from 'react';
import Form from './Form';
import RecordList from './RecordList';
import { ToastContainer } from './Toast';
import { UI_STATE } from './retry';

/**
 * Main App component - manages application state and coordinates components
 */
function App() {
  // UI state machine
  const [currentState, setCurrentState] = useState(UI_STATE.IDLE);

  // Records storage - keyed by requestId for idempotency
  const [records, setRecords] = useState({});

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Reference to track submitted request IDs for duplicate prevention
  const submittedRequests = useRef(new Map());

  // Generate unique ID for toasts
  const generateToastId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // Add a toast notification
  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = generateToastId();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, [generateToastId]);

  // Remove a toast notification
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Load records from localStorage on mount
  useEffect(() => {
    const savedRecords = localStorage.getItem('ecf_records');
    if (savedRecords) {
      try {
        const parsed = JSON.parse(savedRecords);
        setRecords(parsed);
        // Restore submitted requests map
        Object.keys(parsed).forEach((key) => {
          submittedRequests.current.set(key, true);
        });
      } catch (e) {
        console.error('Failed to load saved records:', e);
      }
    }
  }, []);

  // Save records to localStorage when they change
  useEffect(() => {
    if (Object.keys(records).length > 0) {
      localStorage.setItem('ecf_records', JSON.stringify(records));
    }
  }, [records]);

  /**
   * Add a new record to the records map
   * @param {Object} record - Record to add
   */
  const addRecord = (record) => {
    setRecords((prev) => ({
      ...prev,
      [record.requestId]: record,
    }));
  };

  /**
   * Update an existing record
   * @param {string} requestId - ID of the record to update
   * @param {Object} updates - Fields to update
   */
  const updateRecord = (requestId, updates) => {
    setRecords((prev) => ({
      ...prev,
      [requestId]: {
        ...prev[requestId],
        ...updates,
      },
    }));
  };

  /**
   * Handle form submission completion
   * @param {Object} record - The submitted record
   */
  const handleFormSubmit = (record) => {
    console.log('Form submitted:', record);
  };

  /**
   * Clear all records and reset state
   */
  const handleClearRecords = () => {
    setRecords({});
    submittedRequests.current.clear();
    setCurrentState(UI_STATE.IDLE);
    localStorage.removeItem('ecf_records');
    addToast('All records cleared', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Eventually Consistent Form
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Demonstrating retry logic, idempotency, and proper UI state handling
            for distributed systems
          </p>
        </header>

        {/* State Machine Legend */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            State Machine:
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(UI_STATE).map((state) => (
              <div
                key={state}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentState === state
                    ? 'ring-2 ring-primary-500 ring-offset-1'
                    : ''
                } ${
                  state === UI_STATE.IDLE
                    ? 'bg-gray-100 text-gray-800'
                    : state === UI_STATE.PENDING
                    ? 'bg-yellow-100 text-yellow-800'
                    : state === UI_STATE.RETRYING
                    ? 'bg-orange-100 text-orange-800'
                    : state === UI_STATE.SUCCESS
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {state}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Form Section */}
          <div>
            <Form
              onSubmit={handleFormSubmit}
              currentState={currentState}
              setCurrentState={setCurrentState}
              updateRecord={updateRecord}
              addRecord={addRecord}
              submittedRequests={submittedRequests}
              addToast={addToast}
            />

            {/* Clear Button */}
            {Object.keys(records).length > 0 && (
              <button
                onClick={handleClearRecords}
                className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
              >
                Clear All Records
              </button>
            )}
          </div>

          {/* Records Section */}
          <div>
            <RecordList records={records} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            This application demonstrates eventual consistency patterns commonly
            used in distributed systems.
          </p>
          <p className="mt-1">
            The mock API randomly returns success, failure (503), or delayed
            responses.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
