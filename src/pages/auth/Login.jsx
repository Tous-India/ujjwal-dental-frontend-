/**
 * Patient Login Page
 *
 * Login redesigned — phone-first, navy primary, OTP hidden behind flag — 2026-07-04
 *
 * Supports two login methods:
 * 1. Password-based (default): Patient enters phone + password
 * 2. OTP-based (hidden): gated behind SHOW_OTP_TAB — re-enable when SMS OTP is ready
 */
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { requestOtp, loginWithPassword, forgotPassword } from "../../api/auth.api";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { GTAG_CONVERSIONS } from "../../utils/gtagConversions";

const fireBookAppointmentConversion = () => {
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", { send_to: GTAG_CONVERSIONS.BOOK_APPOINTMENT });
  }
};

// Set to true when SMS OTP is integrated to reveal the OTP tab
const SHOW_OTP_TAB = false;

// Field style — navy focus ring instead of orange
const fieldCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-800 outline-none transition-colors focus:border-[#0d1b4a] focus:ring-2 focus:ring-[#0d1b4a]/20";

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

  // Tab state — default to password (1); OTP tab hidden unless SHOW_OTP_TAB
  const [loginMethod, setLoginMethod] = useState(1); // 0 = OTP, 1 = Password

  // OTP tab state (kept intact for easy re-enable)
  const [email, setEmail] = useState("");

  // Password tab state — phone-first
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [error, setError] = useState("");

  // --- OTP handlers (preserved, gate behind SHOW_OTP_TAB) ---

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
      toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Password handler ---

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone) {
      setError("Please enter your phone number");
      return;
    }
    if (phone.length !== 10) {
      setError("Phone number must be 10 digits");
      return;
    }
    // Indian mobile validation — only when +91
    if (countryCode === "+91" && !/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number starting with 6–9");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    // Backward-compatible: send plain 10-digit phone for +91 (existing records);
    // prepend country code for other countries.
    const identifierToSend = countryCode === "+91" ? phone : `${countryCode}${phone}`;

    setLoading(true);
    try {
      const response = await loginWithPassword(identifierToSend, password);
      login(response.data.patient, response.data.token);
      navigate(redirect || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // --- Forgot password handler (email-based, unchanged) ---

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const validEmail = validateEmail();
    if (!validEmail) return;
    setLoading(true);
    try {
      await forgotPassword(validEmail);
      toast.success("If an account exists for this email, a password reset link has been sent.");
      setForgotMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <title>Patient Login | Ujjwal Dental Clinic</title>
      <meta
        name="description"
        content="Login to your Ujjwal Dental Planet patient portal to view appointments, treatment history, invoices, and manage your dental health records securely online."
      />
      <link rel="canonical" href="https://ujjwaldentalplanet.com/login" />
      <meta name="robots" content="noindex, follow" />
      <meta property="og:title" content="Patient Login | Ujjwal Dental Clinic" />
      <meta
        property="og:description"
        content="Login to your Ujjwal Dental Planet patient portal to view appointments, treatment history, and manage your dental health."
      />
      <meta property="og:url" content="https://ujjwaldentalplanet.com/login" />
      <meta
        property="og:image"
        content="https://ujjwaldentalplanet.com/ujjwal-dental-logo.png"
      />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="Patient Login | Ujjwal Dental Clinic" />
      <meta
        name="twitter:description"
        content="Login to your Ujjwal Dental Planet patient portal to view appointments and manage your dental health."
      />
      <meta
        name="twitter:image"
        content="https://ujjwaldentalplanet.com/ujjwal-dental-logo.png"
      />

      {/* Left branding panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-[#0D1B4A] to-[#060c28] flex-col items-center justify-center text-center px-12">
        <div>
          {/* Logo on desktop panel */}
          <img
            src="/ujjwal-dental-logo.png"
            alt="Ujjwal Dental"
            className="h-16 w-auto mx-auto mb-4 object-contain"
          />
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
      <div className="w-full lg:w-[45%] bg-white flex items-center justify-center px-6 sm:px-[40px] py-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-block text-[14px] text-gray-500 hover:text-[#0d1b4a] no-underline transition-colors mb-6"
          >
            ← Back to Home
          </Link>

          {/* Logo on mobile (desktop shows it on the left panel) */}
          <div className="lg:hidden flex justify-center mb-4">
            <img
              src="/ujjwal-dental-logo.png"
              alt="Ujjwal Dental"
              className="h-12 w-auto object-contain"
            />
          </div>

          <h1 className="text-[#0d1b4a] text-2xl font-bold">Patient Portal</h1>

          {!forgotMode && (
            <>
              {/* Tab switcher — only shown when SHOW_OTP_TAB is true */}
              {SHOW_OTP_TAB && (
                <div className="flex gap-2 mt-5 mb-6">
                  <button
                    type="button"
                    onClick={() => setLoginMethod(0)}
                    className={`flex-1 rounded-full py-2 text-[14px] font-semibold transition-colors cursor-pointer ${
                      loginMethod === 0
                        ? "bg-[#0d1b4a] text-white"
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
                        ? "bg-[#0d1b4a] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Login with Password
                  </button>
                </div>
              )}

              {/* OTP login — hidden until SHOW_OTP_TAB is true */}
              {SHOW_OTP_TAB && loginMethod === 0 && (
                <form onSubmit={handleOtpSubmit} className="mt-5">
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
                    className="w-full mt-5 flex items-center justify-center bg-[#0d1b4a] hover:bg-[#0d1b4a]/90 disabled:opacity-70 text-white rounded-xl py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Send OTP"}
                  </button>
                  <p className="text-[13px] text-gray-400 text-center mt-3">
                    You will receive an OTP on your registered email address
                  </p>
                </form>
              )}

              {/* Password login — always shown when SHOW_OTP_TAB is false, or when tab=1 */}
              {(!SHOW_OTP_TAB || loginMethod === 1) && (
                <form onSubmit={handlePasswordSubmit} className="mt-5">
                  {/* Phone input with country-code selector */}
                  <div className="flex gap-2 mb-4">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={loading}
                      className="rounded-xl border border-gray-200 bg-white px-2 py-3 text-[15px] text-gray-800 outline-none transition-colors focus:border-[#0d1b4a] focus:ring-2 focus:ring-[#0d1b4a]/20 cursor-pointer shrink-0"
                      aria-label="Country code"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+61">🇦🇺 +61</option>
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit phone number"
                      value={phone}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(digitsOnly);
                        if (error) setError("");
                      }}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) &&
                          !((e.metaKey || e.ctrlKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={fieldCls + " flex-1"}
                      aria-label="Phone number"
                      autoComplete="tel-national"
                      disabled={loading}
                    />
                  </div>

                  {/* Password field */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`${fieldCls} pr-12`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                      disabled={loading}
                      autoComplete="current-password"
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

                  {/* Inline error */}
                  {error && (
                    <p className="text-[13px] text-red-500 mt-2">{error}</p>
                  )}

                  {/* Primary CTA — navy */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-5 flex items-center justify-center bg-[#0d1b4a] hover:bg-[#0d1b4a]/90 disabled:opacity-70 text-white rounded-xl py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Login"}
                  </button>
                  <p className="text-[13px] text-gray-400 text-center mt-3">
                    Enter your registered phone number with your password
                  </p>
                </form>
              )}

              {/* Forgot password link — orange accent (deliberate) */}
              <p className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setError(""); }}
                  className="text-[13px] text-accent font-semibold hover:text-accent-dark cursor-pointer bg-transparent border-0"
                >
                  Forgot Password?
                </button>
              </p>
            </>
          )}

          {/* Forgot password view */}
          {forgotMode && (
            <form onSubmit={handleForgotSubmit} className="mt-6">
              <h2 className="text-[#0d1b4a] text-lg font-bold mb-1">
                Reset your password
              </h2>
              <p className="text-[14px] text-gray-600 mb-4">
                Enter your registered email and we'll send you a reset link.
              </p>
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
                className="w-full mt-5 flex items-center justify-center bg-[#0d1b4a] hover:bg-[#0d1b4a]/90 disabled:opacity-70 text-white rounded-xl py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Send Reset Link"}
              </button>
              <p className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  className="text-[13px] text-gray-500 hover:text-[#0d1b4a] cursor-pointer bg-transparent border-0"
                >
                  ← Back to login
                </button>
              </p>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[13px] text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Book Appointment — orange accent CTA (deliberate) */}
          <div className="text-center">
            <p className="text-[14px] text-gray-500 mb-2">
              New patient? Book your first appointment
            </p>
            <Link
              to="/book-appointment"
              onClick={fireBookAppointmentConversion}
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
