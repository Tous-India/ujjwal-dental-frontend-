/**
 * Patient Payments API
 *
 * API functions for patients to view their payment history.
 */
import api from "../axios";

/**
 * Get patient's payments (paginated)
 * @param {string} patientId - Patient ID
 * @param {Object} params - { page, limit }
 */
export const getMyPayments = (patientId, params = {}) =>
  api.get(`/patients/${patientId}/payments`, { params }).then((res) => res.data);
