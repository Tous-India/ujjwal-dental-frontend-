import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { verifyOtp, resendOtp } from "../../api/auth.api";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Link,
} from "@mui/material";
import { toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * OTP Verification Page
 *
 * 1. Shows 6 OTP input boxes
 * 2. Auto-focuses next input on entry
 * 3. Verifies OTP on complete
 * 4. Resend option with cooldown
 */
const VerifyOtp = () => {
  const navigate = useNavigate();
  const { pendingEmail, login, setPendingEmail } = useAuthStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Redirect if no pending email
  useEffect(() => {
    if (!pendingEmail) {
      navigate("/login", { replace: true });
    }
  }, [pendingEmail, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const fullOtp = newOtp.join("");
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);

      // Focus last filled input or first empty
      const lastIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();

      // Auto-submit if complete
      if (pastedData.length === 6) {
        handleVerify(pastedData);
      }
    }
  };

  // Verify OTP
  const handleVerify = async (otpValue) => {
    setLoading(true);

    try {
      const response = await verifyOtp(pendingEmail, otpValue);

      const { patient } = response.data;

      login(patient);

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(message);
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);

    try {
      await resendOtp(pendingEmail);
      // Show success message (optional)
    } catch (err) {
      toast.error("Failed to resend OTP. Please try again.");
      setCanResend(true);
    }
  };

  // Go back to login
  const handleBack = () => {
    setPendingEmail(null);
    navigate("/login", { replace: true });
  };

  if (!pendingEmail) return null;

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
      <Card sx={{ maxWidth: 400, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          {/* Back button */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mb: 2 }}
            color="inherit"
          >
            Back
          </Button>

          {/* Title */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Verify OTP
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the 6-digit OTP sent to {pendingEmail}
          </Typography>

          {/* OTP Input Boxes */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center",
              mb: 3,
            }}
          >
            {otp.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    padding: "12px",
                  },
                }}
                sx={{
                  width: 48,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderWidth: 2,
                    },
                  },
                }}
                disabled={loading}
              />
            ))}
          </Box>

          {/* Verify Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => handleVerify(otp.join(""))}
            disabled={loading || otp.some((d) => !d)}
            sx={{ py: 1.5, mb: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Verify OTP"
            )}
          </Button>

          {/* Resend OTP */}
          <Box sx={{ textAlign: "center" }}>
            {canResend ? (
              <Link
                component="button"
                onClick={handleResend}
                sx={{ cursor: "pointer" }}
              >
                Resend OTP
              </Link>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Resend OTP in {resendTimer}s
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyOtp;
