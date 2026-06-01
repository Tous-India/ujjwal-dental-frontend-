/**
 * Admin Protected Route Component
 *
 * Route guard for admin pages.
 * Checks if admin is authenticated before allowing access.
 *
 * Features:
 * - Redirects to login if not authenticated
 * - Shows loading while checking auth state
 *
 * Usage:
 * <Route element={<AdminProtectedRoute />}>
 *   <Route path="dashboard" element={<Dashboard />} />
 * </Route>
 */
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAdminStore } from "../../store/admin.store";

const AdminProtectedRoute = () => {
  const { isAuthenticated } = useAdminStore();
  const location = useLocation();

  // If not authenticated, redirect to admin login
  // Save the attempted URL for redirecting after login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Authenticated - render child routes
  return <Outlet />;
};

export default AdminProtectedRoute;
