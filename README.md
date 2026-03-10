# Eventually Consistent Form

A production-quality single-page web application demonstrating retry logic, idempotency, and proper UI state handling for distributed systems scenarios.

## Project Description

**Eventual Consistency** is a consistency model used in distributed computing to achieve high availability. Rather than guaranteeing that all copies of data are identical at once, eventual consistency promises that if no new updates are made to a given piece of data, eventually all accesses will return the last updated value.

This project demonstrates how to handle eventual consistency scenarios in a web application:
- **Temporary failures** - Network issues or service unavailability
- **Delayed responses** - Asynchronous processing that takes time to complete
- **Duplicate prevention** - Ensuring the same request isn't processed multiple times
- **Retry logic** - Automatically retrying failed requests with proper backoff

## Features

### 1. Idempotency Keys
Each form submission generates a unique `requestId` using UUID. This key:
- Ensures duplicate submissions are detected and prevented
- Allows safe retrying of failed requests
- Stores submissions using the requestId as a key

### 2. Automatic Retry Logic
When the API returns a 503 (Temporary Failure) status:
- Maximum of **3 retry attempts**
- Uses **exponential backoff** (1s, 2s, 4s delays)
- Only retries on specific error codes (503)
- Marks submission as failed if all retries are exhausted

### 3. UI State Management
The application implements a complete state machine:

```
IDLE → PENDING → SUCCESS
         ↓
     RETRYING → SUCCESS
         ↓
       FAILED
```

States:
- **IDLE**: Initial state, form is ready
- **PENDING**: Request has been sent, waiting for response
- **RETRYING**: Initial request failed, retrying (shows retry count)
- **SUCCESS**: Request completed successfully
- **FAILED**: All retries exhausted or non-retryable error

### 4. Mock API Failures
The backend randomly returns:
- **Success** (30%): HTTP 200, immediate response
- **Temporary Failure** (30%): HTTP 503, triggers retry
- **Delayed Success** (40%): 5-10 second delay before response

### 
-5. Duplicate Prevention Uses a client-side map to track submitted requestIds
- Prevents re-submitting the same request
- Updates existing records instead of creating duplicates

## State Transitions

| From State | To State | Trigger |
|------------|----------|---------|
| IDLE | PENDING | User clicks Submit |
| PENDING | SUCCESS | API returns 200 |
| PENDING | RETRYING | API returns 503 |
| RETRYING | SUCCESS | Retry succeeds (200) |
| RETRYING | FAILED | All retries exhausted |
| Any | IDLE | User clears form |

## Retry Logic

### When Retries Occur
- Only on HTTP 503 (Service Unavailable) responses
- Network errors also trigger retries

### Retry Configuration
```javascript
{
  maxRetries: 3,
  baseDelay: 2000,  // 2 seconds
  useExponentialBackoff: true
}
```

### Backoff Schedule
- Retry 1: Wait 1 second
- Retry 2: Wait 2 seconds
- Retry 3: Wait 4 seconds

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eventually-consistent-form
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server (Terminal 1):
```bash
cd backend
npm start
```
The API server will run on http://localhost:3001

2. Start the frontend development server (Terminal 2):
```bash
cd frontend
npm run dev
```
The application will be available at http://localhost:5173

### Testing the Application

1. Open http://localhost:5173 in your browser
2. Fill in the email and amount fields
3. Click Submit
4. Watch the state transitions:
   - **PENDING**: Initial submission
   - **RETRYING**: If 503 error occurs (watch for retry attempts)
   - **SUCCESS** or **FAILED**: Final state

### Clearing Cache

To reset the server-side cache:
```bash
curl -X POST http://localhost:3001/clear-cache
```

## Architecture

```
eventually-consistent-form/
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── api.js          # Axios API calls
│   │   ├── retry.js        # Retry logic implementation
│   │   ├── Form.jsx        # Form component
│   │   ├── RecordList.jsx  # Records display component
│   │   ├── App.jsx         # Main application
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Tailwind styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/                 # Node.js + Express
│   ├── server.js           # API server
│   └── package.json
└── README.md
```

## API Endpoints

### POST /submit
Submit a transaction with idempotency key.

**Request Body:**
```json
{
  "requestId": "uuid-string",
  "email": "user@example.com",
  "amount": 100.00
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Request processed successfully"
}
```

**Temporary Failure Response (503):**
```json
{
  "status": "temporary failure",
  "message": "Service temporarily unavailable"
}
```

### GET /health
Health check endpoint.

### POST /clear-cache
Clear the server-side request cache.

## Bonus Features Implemented

- ✅ Loading spinner during submission
- ✅ Retry counter indicator
- ✅ LocalStorage persistence
- ✅ Exponential retry backoff
- ✅ Clear form functionality
- ✅ Responsive design
- ✅ Status icons for each state
