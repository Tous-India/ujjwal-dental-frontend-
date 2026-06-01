/**
 * Patient Login Page
 *
 * Supports two login methods:
 * 1. OTP-based: Patient enters email, receives OTP via email, verifies on next page
 * 2. Password-based: Patient enters email + password given by doctor
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { requestOtp, loginWithPassword } from "../../api/auth.api";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Divider,
} from "@mui/material";
import { toast } from "react-toastify";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

/**
 * Tab Panel Component
 */
const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const setPendingEmail = useAuthStore((state) => state.setPendingEmail);
  const login = useAuthStore((state) => state.login);

  const [loginMethod, setLoginMethod] = useState(0); // 0 = OTP, 1 = Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMethodChange = (event, newValue) => {
    setLoginMethod(newValue);
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return null;
    }
    return email.toLowerCase();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    const validEmail = validateEmail();
    if (!validEmail) return;

    setLoading(true);

    try {
      await requestOtp(validEmail);
      setPendingEmail(validEmail);
      navigate("/verify-otp", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to send OTP. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const validEmail = validateEmail();
    if (!validEmail) return;

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const response = await loginWithPassword(validEmail, password);
      login(response.data.patient);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid email or password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo/Title */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Ujjwal Dental Clinic
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Patient Portal
            </Typography>
          </Box>

          {/* Login Method Tabs */}
          <Tabs
            value={loginMethod}
            onChange={handleMethodChange}
            variant="fullWidth"
            sx={{ mb: 1 }}
          >
            <Tab label="Login with OTP" />
            <Tab label="Login with Password" />
          </Tabs>

          {/* OTP Login Tab - Email based */}
          <TabPanel value={loginMethod} index={0}>
            <form onSubmit={handleOtpSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 3 }}
                disabled={loading}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !email}
                sx={{ py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Send OTP"
                )}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 2, textAlign: "center" }}
              >
                You will receive an OTP on your registered email address
              </Typography>
            </form>
          </TabPanel>

          {/* Password Login Tab - Email based */}
          <TabPanel value={loginMethod} index={1}>
            <form onSubmit={handlePasswordSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Password"
                placeholder="Enter password given by doctor"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 3 }}
                disabled={loading}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !email || !password}
                sx={{ py: 1.5 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 2, textAlign: "center" }}
              >
                Use the password provided by the clinic staff
              </Typography>
            </form>
          </TabPanel>

          {/* Book Appointment Link */}
          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              New patient? Book your first appointment
            </Typography>
            <Button
              component={Link}
              to="/book-appointment"
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              fullWidth
            >
              Book Appointment
            </Button>
          </Box>

          {/* Admin Login Link */}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Staff?{" "}
              <Link to="/admin/login" style={{ color: "#1976d2", textDecoration: "none", fontWeight: 600 }}>
                Admin Login
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
