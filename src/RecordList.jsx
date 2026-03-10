import { UI_STATE } from './retry';

/**
 * Get status badge class based on state
 * @param {string} status - Current status
 * @returns {string} CSS classes for the badge
 */
const getStatusBadgeClass = (status) => {
  switch (status) {
    case UI_STATE.IDLE:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    case UI_STATE.PENDING:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case UI_STATE.RETRYING:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case UI_STATE.SUCCESS:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case UI_STATE.FAILED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

/**
 * Get status label with emoji based on state
 * @param {string} status - Current status
 * @returns {string} Status label
 */
const getStatusLabel = (status) => {
  switch (status) {
    case UI_STATE.IDLE:
      return 'Idle';
    case UI_STATE.PENDING:
      return '⏳ Pending';
    case UI_STATE.RETRYING:
      return '🔄 Retrying';
    case UI_STATE.SUCCESS:
      return '✅ Success';
    case UI_STATE.FAILED:
      return '❌ Failed';
    default:
      return status;
  }
};

/**
 * Get status icon based on state
 * @param {string} status - Current status
 * @returns {JSX.Element} Icon component
 */
const getStatusIcon = (status) => {
  switch (status) {
    case UI_STATE.PENDING:
      return (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
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
      );
    case UI_STATE.RETRYING:
      return (
        <svg className="h-4 w-4 animate-spin flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      );
    case UI_STATE.SUCCESS:
      return (
        <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case UI_STATE.FAILED:
      return (
        <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
};

/**
 * RecordList component - displays all submitted records
 * @param {Object} props
 * @param {Object} props.records - Map of records keyed by requestId
 */
const RecordList = ({ records }) => {
  // Convert records map to array and sort by creation date (newest first)
  const recordArray = Object.values(records).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (recordArray.length === 0) {
    return (
      <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Submission History
        </h2>
        <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-600 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm sm:text-base">No submissions yet</p>
          <p className="text-xs sm:text-sm mt-1">Submit the form to see your records here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">
          Submission History
        </h2>
        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full self-start sm:self-auto">
          {recordArray.length} {recordArray.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {recordArray.map((record) => (
          <div
            key={record.requestId}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
          >
            {/* Mobile Layout (≤ 640px) */}
            <div className="block sm:hidden">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {record.email}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 font-mono text-sm mt-0.5">
                    ₹{record.amount?.toFixed(2) || '0.00'}
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ₹{getStatusBadgeClass(
                    record.status
                  )}`}
                >
                  {getStatusIcon(record.status)}
                  <span>{getStatusLabel(record.status)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span className="truncate">ID: {record.requestId.slice(0, 6)}...</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="whitespace-nowrap">
                  {new Date(record.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>

              {/* Retry counter indicator - Mobile */}
              {record.status === UI_STATE.RETRYING && record.retryCount > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((num) => (
                      <span
                        key={num}
                        className={`w-2 h-2 rounded-full ₹{
                          num <= record.retryCount
                            ? 'bg-orange-500 animate-pulse'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    Retry {record.retryCount}/3
                    {record.lastRetryDelay && (
                      <span className="text-gray-400 dark:text-gray-500 ml-1">
                        (waiting {record.lastRetryDelay / 1000}s)
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Error message - Mobile */}
              {record.status === UI_STATE.FAILED && record.error && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400 break-words">
                  Error: {record.error}
                </div>
              )}

              {/* Success message - Mobile */}
              {record.status === UI_STATE.SUCCESS && record.message && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400 break-words">
                  {record.message}
                </div>
              )}
            </div>

            {/* Desktop/Tablet Layout (≥ 641px) */}
            <div className="hidden sm:block">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {record.email}
                    </span>
                    <span className="text-gray-400 dark:text-gray-600">|</span>
                    <span className="text-gray-600 dark:text-gray-400 font-mono">
                      ₹{record.amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                    <span>ID: {record.requestId.slice(0, 8)}...</span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span>
                      {new Date(record.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Retry counter indicator - Desktop */}
                  {record.status === UI_STATE.RETRYING && record.retryCount > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((num) => (
                          <span
                            key={num}
                            className={`w-2 h-2 rounded-full ₹{
                              num <= record.retryCount
                                ? 'bg-orange-500 animate-pulse'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        Retry {record.retryCount}/3
                        {record.lastRetryDelay && (
                          <span className="text-gray-400 dark:text-gray-500 ml-1">
                            (waiting {record.lastRetryDelay / 1000}s)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Error message - Desktop */}
                  {record.status === UI_STATE.FAILED && record.error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400 break-words">
                      Error: {record.error}
                    </div>
                  )}

                  {/* Success message - Desktop */}
                  {record.status === UI_STATE.SUCCESS && record.message && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400 break-words">
                      {record.message}
                    </div>
                  )}
                </div>

                {/* Status Badge - Desktop */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ₹{getStatusBadgeClass(
                    record.status
                  )}`}
                >
                  {getStatusIcon(record.status)}
                  <span>{getStatusLabel(record.status)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordList;