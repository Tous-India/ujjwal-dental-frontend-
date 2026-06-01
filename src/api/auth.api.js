import api from "./axios";

/**
 * AUTH API
 *
 * Patient authentication endpoints (Email OTP-based).
 *
 * Flow:
 * 1. requestOtp(email) → sends OTP to patient's email
 * 2. verifyOtp(email, otp) → verifies OTP, returns token + patient data
 */

/**
 * Request OTP for patient login
 * @param {string} email - Patient's email address
 * @returns {Promise} - API response
 */
export const requestOtp = (email) =>
  api.post("/auth/patient/login", { email }).then((res) => res.data);

/**
 * Verify OTP and login
 * @param {string} email - Patient's email address
 * @param {string} otp - OTP received via email
 * @returns {Promise} - { patient, accessToken }
 */
export const verifyOtp = (email, otp) =>
  api.post("/auth/patient/verify-otp", { email, otp }).then((res) => res.data);

/**
 * Get current patient profile
 * @returns {Promise} - Patient data
 */
export const getMe = () =>
  api.get("/patients/me").then((res) => res.data);

/**
 * Resend OTP
 * @param {string} email - Patient's email address
 * @returns {Promise} - API response
 */
export const resendOtp = (email) =>
  api.post("/auth/patient/resend-otp", { email }).then((res) => res.data);

/**
 * Login with password (given by doctor)
 * @param {string} email - Patient's email address
 * @param {string} password - Password
 * @returns {Promise} - { patient, token }
 */
export const loginWithPassword = (email, password) =>
  api.post("/auth/patient/login-password", { email, password }).then((res) => res.data);

export const logoutPatient = () =>
  api.post("/auth/patient/logout").then((res) => res.data);
