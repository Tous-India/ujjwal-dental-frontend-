/**
 * Book Appointment Page (PUBLIC)
 *
 * Standalone public page for booking appointments.
 * Works independently - no user login required.
 * Payment required before booking (Razorpay).
 */
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/auth.store";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import { filterName } from "../../utils/nameInput";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PaymentIcon from "@mui/icons-material/Payment";
import { Link } from "react-router-dom";
import { useClinics } from "../../hooks/patient/useMyAppointments";
import {
  getFeeSettings,
  createPaymentOrder,
  verifyPayment,
  bookAppointmentWithPayment,
  getAvailableSlots,
} from "../../api/patient/appointments.api";
import {
  MAX_DATE,
  dateGuards,
  todayStr,
  isPastDate,
  isPastSlotForDate,
} from "../../utils/dateInput";

/**
 * Generate time slots (9 AM to 6 PM, 30 min intervals)
 */
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    slots.push(`${hour.toString().padStart(2, "0")}:30`);
  }
  return slots;
};

const timeSlots = generateTimeSlots();

/**
 * Appointment reasons
 */
const appointmentReasons = [
  { value: "checkup", label: "Regular Checkup", type: "regular" },
  { value: "cleaning", label: "Teeth Cleaning", type: "regular" },
  { value: "pain", label: "Tooth Pain / Emergency", type: "emergency" },
  { value: "filling", label: "Filling / Cavity Treatment", type: "regular" },
  { value: "extraction", label: "Tooth Extraction", type: "regular" },
  { value: "root_canal", label: "Root Canal Treatment", type: "regular" },
  { value: "crown", label: "Crown / Bridge", type: "regular" },
  { value: "braces", label: "Braces / Orthodontics", type: "regular" },
  { value: "implant", label: "Dental Implant", type: "regular" },
  { value: "whitening", label: "Teeth Whitening", type: "regular" },
  { value: "consultation", label: "Consultation", type: "regular" },
  { value: "other", label: "Other", type: "regular" },
];

const steps = [
  "Select Clinic & Date",
  "Patient Details",
  "Payment",
  "Confirmation",
];

/**
 * Load Razorpay script dynamically
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Shared field styling so every input/select looks identical.
const fieldCls =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-800 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-orange-200";
const labelCls = "block text-[15px] font-medium text-gray-600 mb-1.5";

const BookAppointment = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  // Fee settings
  const [feeSettings, setFeeSettings] = useState({
    opdFeeRegular: 300,
    opdFeeEmergency: 500,
    requirePaymentBeforeBooking: true,
  });
  const [feeLoading, setFeeLoading] = useState(true);

  // Slot availability: null = not fetched yet; otherwise array of open "HH:MM"
  const [availableSlots, setAvailableSlots] = useState(null);
  // Transient validation message for the date field (e.g. past date reset)
  const [dateError, setDateError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    clinic: "",
    date: "",
    time: "",
    reason: "checkup",
    name: "",
    phone: "",
    email: "",
    gender: "",
    age: "",
    notes: "",
  });

  // Auto-fill form if patient is logged in
  const patient = useAuthStore((state) => state.patient);
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isLoggedIn && patient) {
      setFormData((prev) => ({
        ...prev,
        name: patient.name || prev.name,
        phone: patient.phone || prev.phone,
        email: patient.email || prev.email,
        gender: patient.gender || prev.gender,
      }));
    }
  }, [isLoggedIn, patient]);

  // Hooks
  const { data: clinicsData, isLoading: clinicsLoading } = useClinics();
  const clinics = clinicsData?.data?.clinics || [];

  // Fetch fee settings on mount
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await getFeeSettings();
        if (response.data?.fees) {
          setFeeSettings(response.data.fees);
        }
      } catch (err) {
        console.error("Failed to fetch fee settings:", err);
      } finally {
        setFeeLoading(false);
      }
    };
    fetchFees();
  }, []);

  // Set default clinic
  useEffect(() => {
    if (clinics.length > 0 && !formData.clinic) {
      setFormData((prev) => ({ ...prev, clinic: clinics[0]._id }));
    }
  }, [clinics, formData.clinic]);

  // Fetch slot availability when clinic + date are chosen, so full and past
  // slots can be disabled in the time dropdown.
  useEffect(() => {
    if (!formData.clinic || !formData.date) {
      setAvailableSlots(null);
      return;
    }
    let active = true;
    getAvailableSlots(formData.clinic, formData.date)
      .then((res) => {
        if (!active) return;
        const slots = res?.data?.availableSlots || [];
        setAvailableSlots(slots);
        // Clear the chosen time if it is no longer available
        setFormData((prev) =>
          prev.time && !slots.includes(prev.time)
            ? { ...prev, time: "" }
            : prev,
        );
      })
      .catch(() => {
        if (active) setAvailableSlots([]);
      });
    return () => {
      active = false;
    };
  }, [formData.clinic, formData.date]);

  // Get OPD fee based on appointment type
  const getOpdFee = () => {
    const reason = appointmentReasons.find((r) => r.value === formData.reason);
    const isEmergency = reason?.type === "emergency";
    return isEmergency
      ? feeSettings.opdFeeEmergency
      : feeSettings.opdFeeRegular;
  };

  const getMinDate = () => {
    // Allow booking from today onwards (past time slots are filtered out below).
    return todayStr();
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    return maxDate.toISOString().split("T")[0];
  };

  const handleChange = (field) => (e) => {
    const value = field === "name" ? filterName(e.target.value) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Date field: reject past dates (manual typing / picker), reset to today.
  const handleDateChange = (e) => {
    const value = e.target.value;
    if (isPastDate(value)) {
      setDateError("Date cannot be in the past");
      setFormData((prev) => ({ ...prev, date: todayStr(), time: "" }));
      return;
    }
    setDateError("");
    setFormData((prev) => ({ ...prev, date: value }));
  };

  const validateStep1 = () => {
    if (!formData.clinic) {
      toast.info("Please select a clinic");
      return false;
    }
    if (!formData.date) {
      toast.info("Please select a date");
      return false;
    }
    if (!formData.time) {
      toast.info("Please select a time slot");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.name.trim()) {
      toast.info("Please enter your name");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.info("Please enter your phone number");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      toast.info("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!formData.email.trim()) {
      toast.info("Please enter your email for portal access");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.info("Please enter a valid email address");
      return false;
    }
    if (!captchaToken) {
      toast.info("Please complete the reCAPTCHA verification");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep1()) return;
    if (activeStep === 1 && !validateStep2()) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  /**
   * Handle Razorpay Payment
   */
  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        setIsProcessing(false);
        return;
      }

      const opdFee = getOpdFee();
      const isEmergency =
        appointmentReasons.find((r) => r.value === formData.reason)?.type ===
        "emergency";

      // Create Razorpay order (isOnlineBooking allows creating order without patient).
      // The server prices the order authoritatively from settings; isEmergency tells
      // it which OPD fee to use. The amount below is informational only.
      const orderResponse = await createPaymentOrder({
        amount: opdFee,
        clinic: formData.clinic,
        type: "opd_fee",
        isEmergency,
        isOnlineBooking: true,
      });

      const { order, paymentId, key_id } = orderResponse.data;

      // Open Razorpay checkout
      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Ujjwal Dental Clinic",
        description: "Appointment Booking Fee",
        order_id: order.id,
        prefill: {
          name: formData.name,
          contact: formData.phone,
          email: formData.email || undefined,
        },
        theme: {
          color: "#0d9488",
        },
        handler: async (response) => {
          try {
            // Verify payment
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: paymentId,
            });

            // Book appointment after successful payment
            const selectedClinic = clinics.find(
              (c) => c._id === formData.clinic,
            );
            const reason = appointmentReasons.find(
              (r) => r.value === formData.reason,
            );

            const bookingResponse = await bookAppointmentWithPayment({
              paymentId: paymentId,
              name: formData.name,
              phone: formData.phone,
              email: formData.email || undefined,
              clinic: formData.clinic,
              date: formData.date,
              timeSlot: formData.time,
              reason: reason?.label || formData.reason,
              type: reason?.type || "regular",
              captchaToken: captchaToken,
            });

            // Success
            setSuccess(true);
            setBookedAppointment({
              ...bookingResponse.data,
              clinicName: selectedClinic?.name,
              opdFee: opdFee,
            });
            setActiveStep(3);
          } catch (err) {
            console.error(
              "[Booking] Error:",
              err.response?.data || err.message,
            );
            toast.error(
              err.response?.data?.message ||
                "Failed to book appointment after payment. Please contact support.",
            );
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.warning(
              "Payment cancelled. Please try again to book your appointment.",
            );
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to initiate payment. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString("en-IN")}`;
  };

  const resetForm = () => {
    setSuccess(false);
    setActiveStep(0);
    setFormData({
      clinic: clinics[0]?._id || "",
      date: "",
      time: "",
      reason: "checkup",
      name: "",
      phone: "",
      email: "",
      gender: "",
      age: "",
      notes: "",
    });
  };

  return (
    <div className="bg-gray-50 py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Screen */}
        {success && bookedAppointment ? (
          <div className="bg-white rounded-2xl shadow-sm px-[40px] py-[32px] text-center">
            <CheckCircleIcon className="text-accent! text-[80px]! mb-2" />
            <h2 className="text-[#003366] text-2xl md:text-3xl font-bold mb-2">
              Appointment Booked!
            </h2>
            <p className="text-gray-500 mb-6">
              Your appointment has been successfully scheduled and payment
              received
            </p>

            <div className="bg-gray-50 rounded-xl border border-gray-100 max-w-md mx-auto p-5 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[13px] text-gray-500">Date</p>
                  <p className="text-[15px] font-semibold text-gray-800">
                    {formatDate(formData.date)}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-500">Time</p>
                  <p className="text-[15px] font-semibold text-gray-800">
                    {formatTime(formData.time)}
                  </p>
                </div>
                <div className="col-span-2 border-t border-gray-200" />
                <div>
                  <p className="text-[13px] text-gray-500">Clinic</p>
                  <p className="text-[15px] font-semibold text-gray-800">
                    {bookedAppointment.clinicName}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-500">Token #</p>
                  <p className="text-[15px] font-mono font-semibold text-gray-800">
                    {bookedAppointment.tokenNumber || "-"}
                  </p>
                </div>
                <div className="col-span-2 border-t border-gray-200" />
                <div>
                  <p className="text-[13px] text-gray-500">OPD Fee Paid</p>
                  <p className="text-[15px] font-semibold text-accent">
                    {formatCurrency(bookedAppointment.opdFee)}
                  </p>
                </div>
                <div>
                  <p className="text-[13px] text-gray-500">Status</p>
                  <span className="inline-block bg-green-100 text-green-700 rounded-full px-3 py-0.5 text-[12px] font-semibold">
                    Paid
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 text-[14px] rounded-lg px-4 py-3 mb-4 text-left max-w-md mx-auto">
              A confirmation SMS will be sent to{" "}
              <strong>{formData.phone}</strong>. Please arrive 10 minutes before
              your scheduled time.
            </div>

            {formData.email && (
              <div className="bg-green-50 text-green-800 text-[14px] rounded-lg px-4 py-3 mb-4 text-left max-w-md mx-auto">
                Your patient portal is ready. Go to{" "}
                <strong>Login → "Login with OTP"</strong> and enter{" "}
                <strong>{formData.email}</strong> to view your appointments and
                payments — we'll email you a one-time code, no password needed.
              </div>
            )}

            <div className="flex justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={resetForm}
                className="bg-accent hover:bg-accent-dark text-white rounded-xl px-6 py-2.5 text-[15px] font-semibold transition-colors duration-200 cursor-pointer"
              >
                Book Another
              </button>
              <Link
                to="/login"
                className="bg-[#003366] hover:bg-[#004080] text-white rounded-xl px-6 py-2.5 text-[15px] font-semibold no-underline transition-colors duration-200"
              >
                Login to Portal
              </Link>
              <a
                href="https://ujjwaldentalplanet.com/"
                className="border-2 border-gray-300 text-gray-600 hover:border-gray-400 rounded-xl px-6 py-2.5 text-[15px] font-semibold no-underline transition-colors duration-200"
              >
                Back to Website
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="text-center mb-6">
              <h1 className="text-[#003366] text-[28px] md:text-3xl font-bold">
                Book Your Appointment
              </h1>
              <p className="text-gray-500 text-[15px] mt-1">
                Schedule your visit at Ujjwal Dental Clinic
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-start max-w-xl mx-auto mb-3">
              {steps.map((label, i) => {
                const completed = i < activeStep;
                const current = i === activeStep;
                return (
                  <div key={label} className="flex items-start flex-1 last:flex-none">
                    <div className="flex flex-col items-center shrink-0 w-12">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold ${
                          completed || current
                            ? "bg-accent text-white"
                            : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {completed ? <CheckIcon className="text-[18px]!" /> : i + 1}
                      </div>
                      <span
                        className={`mt-1.5 text-[11px] sm:text-[13px] text-center leading-tight ${
                          current
                            ? "text-[#003366] font-bold"
                            : "text-gray-400 font-medium"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mt-4 ${
                          i < activeStep ? "bg-accent" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Trust signals */}
            <p className="text-center text-[13px] text-gray-400 mb-6">
              <span className="text-accent">✓</span> Confirmed instantly{" "}
              <span className="mx-1">·</span>
              <span className="text-accent">✓</span> Free cancellation{" "}
              <span className="mx-1">·</span>
              <span className="text-accent">✓</span> Secure payment
            </p>

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-sm px-5 sm:px-[40px] py-[32px]">
              {/* Step 1: Clinic & Date */}
              {activeStep === 0 && (
                <div>
                  <h2 className="text-[#003366] text-lg font-semibold mb-5 flex items-center gap-2">
                    <CalendarMonthIcon className="text-accent" />
                    Select Clinic, Date &amp; Time
                  </h2>

                  <div className="space-y-5">
                    <div>
                      <label className={labelCls}>Select Clinic</label>
                      <select
                        className={fieldCls}
                        value={formData.clinic}
                        onChange={handleChange("clinic")}
                        disabled={clinicsLoading}
                      >
                        {clinics.map((clinic) => (
                          <option key={clinic._id} value={clinic._id}>
                            {clinic.name}
                            {clinic.address?.city
                              ? ` — ${clinic.address.city}`
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelCls}>Select Date</label>
                      <input
                        type="date"
                        className={fieldCls}
                        value={formData.date}
                        onChange={handleDateChange}
                        min={getMinDate()}
                        max={getMaxDate() || MAX_DATE}
                        {...dateGuards}
                      />
                      {dateError && (
                        <p className="text-red-500 text-[13px] mt-1">
                          {dateError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`${labelCls} flex items-center gap-1`}>
                        <AccessTimeIcon className="text-gray-400 text-[18px]!" />
                        Select Time
                      </label>
                      {!formData.date ? (
                        <p className="text-gray-400 text-[14px]">
                          Select a date first
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {timeSlots.map((slot) => {
                            // Disable if the slot is in the past today (client
                            // clock = IST) or full/unavailable per the backend.
                            const disabled =
                              isPastSlotForDate(formData.date, slot) ||
                              (Array.isArray(availableSlots) &&
                                !availableSlots.includes(slot));
                            const selected = formData.time === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={disabled}
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    time: slot,
                                  }))
                                }
                                className={`rounded-full px-2 py-2 text-[13px] font-medium transition-colors ${
                                  disabled
                                    ? "bg-gray-200 text-gray-400 line-through cursor-not-allowed"
                                    : selected
                                      ? "bg-accent text-white"
                                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 cursor-pointer"
                                }`}
                              >
                                {formatTime(slot)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={labelCls}>Reason for Visit</label>
                      <select
                        className={fieldCls}
                        value={formData.reason}
                        onChange={handleChange("reason")}
                      >
                        {appointmentReasons.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                            {reason.type === "emergency" ? " (Emergency)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Patient Details */}
              {activeStep === 1 && (
                <div>
                  <h2 className="text-[#003366] text-lg font-semibold mb-5 flex items-center gap-2">
                    <PersonIcon className="text-accent" />
                    Patient Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input
                        className={fieldCls}
                        value={formData.name}
                        onChange={handleChange("name")}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number *</label>
                      <input
                        className={fieldCls}
                        value={formData.phone}
                        onChange={handleChange("phone")}
                        placeholder="10-digit phone number"
                        maxLength={10}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>Email *</label>
                      <input
                        type="email"
                        className={fieldCls}
                        value={formData.email}
                        onChange={handleChange("email")}
                        placeholder="your@email.com"
                      />
                      <p className="text-gray-400 text-[13px] mt-1">
                        Required for login to patient portal
                      </p>
                    </div>
                    <div>
                      <label className={labelCls}>Gender</label>
                      <select
                        className={fieldCls}
                        value={formData.gender}
                        onChange={handleChange("gender")}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Age</label>
                      <input
                        type="number"
                        className={fieldCls}
                        value={formData.age}
                        onChange={handleChange("age")}
                        min={1}
                        max={120}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelCls}>
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        className={fieldCls}
                        value={formData.notes}
                        onChange={handleChange("notes")}
                        placeholder="Any specific concerns or requirements..."
                        rows={3}
                      />
                    </div>

                    {/* reCAPTCHA */}
                    <div className="md:col-span-2 flex justify-center mt-1">
                      <ReCAPTCHA
                        ref={captchaRef}
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={(token) => setCaptchaToken(token)}
                        onExpired={() => setCaptchaToken(null)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {activeStep === 2 && (
                <div>
                  <h2 className="text-[#003366] text-lg font-semibold mb-5 flex items-center gap-2">
                    <PaymentIcon className="text-accent" />
                    Payment Details
                  </h2>

                  {/* Booking Summary */}
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-4">
                    <p className="text-[15px] font-semibold text-gray-800 mb-3">
                      Booking Summary
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <p className="text-[13px] text-gray-500">Clinic</p>
                        <p className="text-[14px] font-semibold text-gray-800">
                          {clinics.find((c) => c._id === formData.clinic)?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[13px] text-gray-500">Date</p>
                        <p className="text-[14px] font-semibold text-gray-800">
                          {formatDate(formData.date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[13px] text-gray-500">Time</p>
                        <p className="text-[14px] font-semibold text-gray-800">
                          {formatTime(formData.time)}
                        </p>
                      </div>
                      <div className="col-span-2 border-t border-gray-200" />
                      <div>
                        <p className="text-[13px] text-gray-500">Patient</p>
                        <p className="text-[14px] font-semibold text-gray-800">
                          {formData.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[13px] text-gray-500">Phone</p>
                        <p className="text-[14px] font-semibold text-gray-800">
                          {formData.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* OPD Fee Card */}
                  <div className="bg-orange-50 border-l-4 border-accent rounded-lg px-4 py-3 mb-4 flex justify-between items-center">
                    <div>
                      <p className="text-[15px] font-semibold text-gray-800">
                        OPD Fee
                      </p>
                      <p className="text-[13px] text-gray-500">
                        {appointmentReasons.find(
                          (r) => r.value === formData.reason,
                        )?.type === "emergency"
                          ? "Emergency Appointment"
                          : "Regular Appointment"}
                      </p>
                    </div>
                    <div className="font-numbers text-2xl font-extrabold text-accent">
                      {feeLoading ? (
                        <CircularProgress size={24} sx={{ color: "#f57c00" }} />
                      ) : (
                        formatCurrency(getOpdFee())
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 text-blue-800 text-[14px] rounded-lg px-4 py-3 mb-4">
                    Payment is required to confirm your appointment. You can pay
                    securely using UPI, Credit/Debit Card, or Net Banking.
                  </div>

                  {/* Pay Now Button */}
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={isProcessing || feeLoading}
                    className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-60 text-white rounded-xl py-3.5 text-[15px] font-semibold transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <CircularProgress size={20} sx={{ color: "#fff" }} />
                    ) : (
                      <PaymentIcon className="text-[20px]!" />
                    )}
                    {isProcessing
                      ? "Processing..."
                      : `Pay ${formatCurrency(getOpdFee())} & Book`}
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              {activeStep < 2 && (
                <div className="flex justify-between items-center mt-8">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    className="inline-flex items-center gap-1 text-[15px] font-semibold text-[#003366] disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowBackIcon className="text-[18px]!" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1 bg-accent hover:bg-accent-dark text-white rounded-xl px-8 py-3 text-[15px] font-semibold transition-colors duration-200 cursor-pointer"
                  >
                    Next
                    <ArrowForwardIcon className="text-[18px]!" />
                  </button>
                </div>
              )}

              {activeStep === 2 && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1 text-[15px] font-semibold text-[#003366] disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ArrowBackIcon className="text-[18px]!" />
                    Back
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
