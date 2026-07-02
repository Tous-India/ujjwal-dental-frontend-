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
 * Login with password — accepts phone number OR email as identifier.
 * @param {string} identifier - Patient's 10-digit phone number or email address
 * @param {string} password - Password
 * @returns {Promise} - { patient, token }
 */
export const loginWithPassword = (identifier, password) =>
  api.post("/auth/patient/login-password", { identifier, password }).then((res) => res.data);

export const logoutPatient = () =>
  api.post("/auth/patient/logout").then((res) => res.data);

/**
 * Request a password reset link (works for patients and admins server-side;
 * patients receive a link to the public /reset-password page).
 * @param {string} email
 */
export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email }).then((res) => res.data);

/**
 * Reset password using the emailed token.
 * @param {string} token
 * @param {string} newPassword
 */
export const resetPassword = (token, newPassword) =>
  api.post("/auth/reset-password", { token, newPassword }).then((res) => res.data);

/**
 * Change the logged-in patient's password.
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export const changePatientPassword = (currentPassword, newPassword) =>
  api
    .post("/auth/patient/change-password", { currentPassword, newPassword })
    .then((res) => res.data);
