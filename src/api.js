import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Submit form data to the mock API
 * @param {string} requestId - Unique idempotency key
 * @param {string} email - User email
 * @param {number} amount - Transaction amount
 * @returns {Promise} Axios response
 */
export const submitForm = async (requestId, email, amount) => {
  const response = await api.post('/submit', {
    requestId,
    email,
    amount,
  });
  return response;
};

/**
 * Check if a request has been processed (for delayed responses)
 * @param {string} requestId - Unique idempotency key
 * @returns {Promise} Axios response
 */
export const checkRequestStatus = async (requestId) => {
  const response = await api.get(`/status/${requestId}`);
  return response;
};

export default api;
