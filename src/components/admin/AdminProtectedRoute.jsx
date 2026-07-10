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
  const { isAuthenticated, admin } = useAdminStore();
  const location = useLocation();

  // If not authenticated, redirect to admin login
  // Save the attempted URL for redirecting after login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // SEO Executive (blog_editor role) is restricted to the Blogs module only.
  // Blocks direct URL entry (e.g. /admin/billing) from bypassing the hidden
  // sidebar item — mirrors the same restriction enforced server-side.
  if (admin?.role === "blog_editor" && !location.pathname.startsWith("/admin/blogs")) {
    return <Navigate to="/admin/blogs" replace />;
  }

  // Authenticated - render child routes
  return <Outlet />;
};

export default AdminProtectedRoute;
