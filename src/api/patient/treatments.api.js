/**
 * Patient Treatments API
 *
 * API functions for patients to view their treatment history.
 */
import api from "../axios";

/**
 * Get patient's treatments (paginated)
 * @param {string} patientId - Patient ID
 * @param {Object} params - { status, page, limit }
 */
export const getMyTreatments = (patientId, params = {}) =>
  api.get(`/patients/${patientId}/treatments`, { params }).then((res) => res.data);
