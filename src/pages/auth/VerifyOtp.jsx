import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { verifyOtp, resendOtp } from "../../api/auth.api";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const trustPoints = [
  "Book appointments online",
  "View treatment history",
  "Manage your dental health",
];

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
  const { pendingEmail, isAuthenticated, login, setPendingEmail } =
    useAuthStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  // Redirect to login only if there's no pending email AND the user hasn't
  // just authenticated. (login() clears pendingEmail; without the
  // isAuthenticated guard this effect would race the post-verify navigation
  // to /dashboard and bounce the user back to /login.)
  useEffect(() => {
    if (!pendingEmail && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [pendingEmail, isAuthenticated, navigate]);

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
    <div className="min-h-screen flex">
      <title>Verify OTP | Ujjwal Dental Clinic</title>

      {/* Left branding panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-[#0D1B4A] to-[#060c28] flex-col items-center justify-center text-center px-12">
        <div>
          <p className="text-white text-[28px] font-bold leading-tight">
            UJJWAL DENTAL
          </p>
          <p className="text-gray-300 text-[13px] tracking-wide">
            CARING FOR YOUR SMILE
          </p>
          <div className="mt-8 space-y-3 text-left inline-block">
            {trustPoints.map((point) => (
              <p
                key={point}
                className="text-gray-300 text-[14px] flex items-center gap-2"
              >
                <span className="text-accent">✓</span>
                {point}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-[45%] bg-white flex items-center justify-center px-[40px] py-10">
        <div className="w-full max-w-sm">
          {/* Back link */}
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-[14px] text-gray-500 hover:text-[#003366] transition-colors cursor-pointer mb-6"
          >
            <ArrowBackIcon className="text-[18px]!" />
            Back
          </button>

          {/* Security icon */}
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <LockOutlinedIcon className="text-accent!" />
          </div>

          <h1 className="text-[#003366] text-2xl font-bold">Verify OTP</h1>
          <p className="text-gray-500 text-[15px] mt-1 mb-6">
            Enter the 6-digit OTP sent to{" "}
            <span className="text-[#003366] font-semibold">{pendingEmail}</span>
          </p>

          {/* OTP input boxes */}
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                maxLength={1}
                inputMode="numeric"
                autoFocus={index === 0}
                disabled={loading}
                className="font-numbers w-[52px] h-[52px] rounded-xl border border-gray-200 text-center text-[20px] font-semibold text-gray-800 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-orange-200 disabled:opacity-60"
              />
            ))}
          </div>

          {/* Verify button */}
          <button
            type="button"
            onClick={() => handleVerify(otp.join(""))}
            disabled={loading || otp.some((d) => !d)}
            className="w-full flex items-center justify-center bg-accent hover:bg-accent-dark disabled:opacity-50 text-white rounded-xl py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Verify OTP"
            )}
          </button>

          {/* Resend */}
          <div className="text-center mt-4">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-accent text-[14px] font-semibold hover:text-accent-dark cursor-pointer"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-[14px] text-gray-400">
                Resend OTP in {resendTimer}s
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
