/**
 * Patient Login Page
 *
 * Supports two login methods:
 * 1. OTP-based: Patient enters email, receives OTP via email, verifies on next page
 * 2. Password-based: Patient enters email + password given by doctor
 */
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { requestOtp, loginWithPassword } from "../../api/auth.api";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const fieldCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-800 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-orange-200";

const trustPoints = [
  "Book appointments online",
  "View treatment history",
  "Manage your dental health",
];

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Optional post-login destination, e.g. /login?redirect=/membership-plans
  const redirect = searchParams.get("redirect");
  const setPendingEmail = useAuthStore((state) => state.setPendingEmail);
  const login = useAuthStore((state) => state.login);

  const [loginMethod, setLoginMethod] = useState(0); // 0 = OTP, 1 = Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      navigate(
        redirect
          ? `/verify-otp?redirect=${encodeURIComponent(redirect)}`
          : "/verify-otp",
        { replace: true },
      );
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
      login(response.data.patient, response.data.token);
      navigate(redirect || "/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid email or password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <title>Patient Login | Ujjwal Dental Clinic</title>
      <meta
        name="description"
        content="Login to your Ujjwal Dental patient portal. View appointments, treatment history, and manage your dental health."
      />
      <meta property="og:title" content="Patient Login | Ujjwal Dental Clinic" />
      <meta
        property="og:description"
        content="Login to your Ujjwal Dental patient portal. View appointments, treatment history, and manage your dental health."
      />

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
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-block text-[14px] text-gray-500 hover:text-[#003366] no-underline transition-colors mb-6"
          >
            ← Back to Home
          </Link>
          {/* Brand on mobile only (desktop shows it on the left panel) */}
          <p className="lg:hidden text-[#003366] text-xl font-bold text-center mb-4">
            Ujjwal Dental
          </p>

          <h1 className="text-[#003366] text-2xl font-bold">Patient Portal</h1>

          {/* Tab switcher (pill style) */}
          <div className="flex gap-2 mt-5 mb-6">
            <button
              type="button"
              onClick={() => setLoginMethod(0)}
              className={`flex-1 rounded-full py-2 text-[14px] font-semibold transition-colors cursor-pointer ${
                loginMethod === 0
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Login with OTP
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod(1)}
              className={`flex-1 rounded-full py-2 text-[14px] font-semibold transition-colors cursor-pointer ${
                loginMethod === 1
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Login with Password
            </button>
          </div>

          {/* OTP login */}
          {loginMethod === 0 && (
            <form onSubmit={handleOtpSubmit}>
              <input
                type="email"
                className={fieldCls}
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 flex items-center justify-center bg-accent hover:bg-accent-dark disabled:opacity-70 text-white rounded-xl py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Send OTP"
                )}
              </button>
              <p className="text-[13px] text-gray-400 text-center mt-3">
                You will receive an OTP on your registered email address
              </p>
            </form>
          )}

          {/* Password login */}
          {loginMethod === 1 && (
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="email"
                className={`${fieldCls} mb-4`}
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${fieldCls} pr-12`}
                  placeholder="Enter password given by doctor"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <VisibilityOff className="text-[20px]!" />
                  ) : (
                    <Visibility className="text-[20px]!" />
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 flex items-center justify-center bg-accent hover:bg-accent-dark disabled:opacity-70 text-white rounded-xl py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Login"
                )}
              </button>
              <p className="text-[13px] text-gray-400 text-center mt-3">
                Use the password provided by the clinic staff
              </p>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[13px] text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* New patient */}
          <div className="text-center">
            <p className="text-[14px] text-gray-500 mb-2">
              New patient? Book your first appointment
            </p>
            <Link
              to="/book-appointment"
              className="w-full inline-flex items-center justify-center gap-2 border-2 border-accent text-accent hover:bg-accent hover:text-white rounded-xl py-3 text-[15px] font-semibold no-underline transition-colors duration-200"
            >
              <CalendarMonthIcon className="text-[20px]!" />
              Book Appointment
            </Link>
          </div>

          {/* Admin Login */}
          <p className="text-center text-[14px] text-gray-500 mt-6">
            Staff?{" "}
            <Link
              to="/admin/login"
              className="text-accent font-semibold no-underline hover:text-accent-dark"
            >
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
