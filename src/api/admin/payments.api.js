/**
 * Admin Payments API
 *
 * API functions for managing payments.
 */
import api from "../axios";

/**
 * Get all payments with pagination and filters
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getPayments = (params = {}) =>
  api.get("/payments", { params }).then((res) => res.data);

/**
 * Get single payment by ID
 * @param {string} id - Payment ID
 * @returns {Promise}
 */
export const getPayment = (id) =>
  api.get(`/payments/${id}`).then((res) => res.data);

/**
 * Get payment by payment number
 * @param {string} paymentNumber - Payment number
 * @returns {Promise}
 */
export const getPaymentByNumber = (paymentNumber) =>
  api.get(`/payments/number/${paymentNumber}`).then((res) => res.data);

/**
 * Create/Record a new payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise}
 */
export const createPayment = (paymentData) =>
  api.post("/payments", paymentData).then((res) => res.data);

/**
 * Record OPD payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise}
 */
export const recordOpdPayment = (paymentData) =>
  api.post("/payments/opd", paymentData).then((res) => res.data);

/**
 * Record membership payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise}
 */
export const recordMembershipPayment = (paymentData) =>
  api.post("/payments/membership", paymentData).then((res) => res.data);

/**
 * Process refund
 * @param {string} id - Payment ID
 * @param {Object} refundData - Refund data (amount, reason)
 * @returns {Promise}
 */
export const processRefund = (id, refundData) =>
  api.post(`/payments/${id}/refund`, refundData).then((res) => res.data);

/**
 * Get payment statistics
 * @param {Object} params - Query params (clinic, from, to)
 * @returns {Promise}
 */
export const getPaymentStats = (params = {}) =>
  api.get("/payments/stats", { params }).then((res) => res.data);

/**
 * Get daily collection report
 * @param {string} clinic - Clinic ID
 * @param {string} date - Date
 * @returns {Promise}
 */
export const getDailyCollection = (clinic, date) =>
  api.get("/payments/daily-collection", { params: { clinic, date } }).then((res) => res.data);

/**
 * Get patient payment summary
 * @param {string} patientId - Patient ID
 * @returns {Promise}
 */
export const getPatientPaymentSummary = (patientId) =>
  api.get(`/payments/patient/${patientId}/summary`).then((res) => res.data);

/**
 * Delete payment permanently
 * @param {string} id - Payment ID
 * @returns {Promise}
 */
export const deletePayment = (id) =>
  api.delete(`/payments/${id}`).then((res) => res.data);
