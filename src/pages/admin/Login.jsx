/**
 * Admin Login Page
 *
 * Email/Password based login for admin users.
 * Features:
 * - Form validation
 * - Error handling
 * - Loading states
 * - Remember me option
 * - Clean, professional design
 *
 * Uses:
 * - React Query for API calls (via useAdminAuth hook)
 * - Zustand for state management
 * - MUI components for UI
 * - Tailwind CSS for styling
 */
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { toast } from "react-toastify";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useAdminAuth } from "../../hooks/admin/useAdminAuth";
import { useAdminStore } from "../../store/admin.store";

const AdminLogin = () => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});

  // Auth hook
  const { login, isLoggingIn, loginError } = useAdminAuth();
  const { isAuthenticated } = useAdminStore();

  // Show toast on login error
  useEffect(() => {
    if (loginError) {
      const message = loginError.response?.data?.message || loginError.message || "Login failed. Please try again.";
      toast.error(message);
    }
  }, [loginError]);

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  /**
   * Validate form fields
   * @returns {boolean} - Is form valid
   */
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      login({ email, password });
    }
  };

  /**
   * Toggle password visibility
   */
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="p-8">
          {/* Logo & Title */}
          <Box className="text-center mb-8">
            <Box className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <MedicalServicesIcon className="text-blue-600 text-3xl" />
            </Box>
            <Typography variant="h4" className="font-bold text-gray-800 mb-2">
              Admin Login
            </Typography>
            <Typography variant="body2" className="text-gray-500">
              Sign in to access the admin panel
            </Typography>
          </Box>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              disabled={isLoggingIn}
              className="mb-4"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
              placeholder="admin@example.com"
            />

            {/* Password Field */}
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={Boolean(errors.password)}
              helperText={errors.password}
              disabled={isLoggingIn}
              className="mt-5!"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon className="text-gray-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      disabled={isLoggingIn}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon className="text-gray-400" />
                      ) : (
                        <VisibilityIcon className="text-gray-400" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              placeholder="Enter your password"
            />

            {/* Remember Me */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoggingIn}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" className="text-gray-600">
                  Remember me
                </Typography>
              }
              className="mb-6"
            />

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={isLoggingIn}
              size="large"
              className="bg-blue-600 hover:bg-blue-700 py-3 text-base font-medium"
            >
              {isLoggingIn ? (
                <Box className="flex items-center gap-2">
                  <CircularProgress size={20} color="inherit" />
                  <span>Signing in...</span>
                </Box>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <Box className="mt-6 text-center">
            <Typography variant="body2" className="text-gray-400">
              Dental Clinic CMS - Admin Panel
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminLogin;
