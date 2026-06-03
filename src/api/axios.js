import axios from "axios";
import { useAuthStore } from "../store/auth.store";
import { useAdminStore } from "../store/admin.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Attach the patient JWT as a Bearer token (in addition to the cookie) so
// authenticated requests succeed even when the cookie is blocked cross-site
// (e.g. frontend and backend on different domains in production).
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isAuthEndpoint =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/patient/login-password") ||
        requestUrl.includes("/auth/patient/verify-otp");

      if (!isAuthEndpoint) {
        const { isAuthenticated: isAdminAuth } = useAdminStore.getState();
        const { isAuthenticated: isPatientAuth } = useAuthStore.getState();

        if (isAdminAuth && window.location.pathname.startsWith("/admin")) {
          useAdminStore.getState().logout();
          window.location.href = "/admin/login";
        } else if (isPatientAuth) {
          useAuthStore.getState().logout();
          if (
            !window.location.pathname.startsWith("/admin") &&
            !window.location.pathname.startsWith("/login")
          ) {
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
