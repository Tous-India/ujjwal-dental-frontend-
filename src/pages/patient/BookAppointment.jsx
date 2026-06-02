/**
 * Book Appointment Page (PUBLIC)
 *
 * Standalone public page for booking appointments.
 * Works independently - no user login required.
 * Payment required before booking (Razorpay).
 */
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/auth.store";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Container,
} from "@mui/material";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import Grid from "@mui/material/Grid";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
import { MAX_DATE, dateGuards } from "../../utils/dateInput";

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
    return new Date().toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    return maxDate.toISOString().split("T")[0];
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
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
    <Box sx={{ bgcolor: "#f5f5f5", pb: 4 }} className="book-appointment-card">
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
        {/* Success Screen */}
        {success && bookedAppointment ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircleIcon
                sx={{ fontSize: 80, color: "success.main", mb: 2 }}
              />
              <Typography
                variant="h4"
                className="font-bold text-green-600 mb-2"
              >
                Appointment Booked!
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                className="mb-6"
              >
                Your appointment has been successfully scheduled and payment
                received
              </Typography>

              <Card className="bg-gray-50 mb-6 max-w-md mx-auto">
                <CardContent>
                  <Grid container spacing={2} className="text-left">
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Date
                      </Typography>
                      <Typography variant="body1" className="font-semibold">
                        {formatDate(formData.date)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Time
                      </Typography>
                      <Typography variant="body1" className="font-semibold">
                        {formatTime(formData.time)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Divider />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Clinic
                      </Typography>
                      <Typography variant="body1" className="font-semibold">
                        {bookedAppointment.clinicName}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Token #
                      </Typography>
                      <Typography
                        variant="body1"
                        className="font-mono font-semibold"
                      >
                        {bookedAppointment.tokenNumber || "-"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Divider />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        OPD Fee Paid
                      </Typography>
                      <Typography
                        variant="body1"
                        className="font-semibold text-green-600"
                      >
                        {formatCurrency(bookedAppointment.opdFee)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Chip size="small" label="Paid" color="success" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Alert
                severity="info"
                className="mb-4 text-left max-w-md mx-auto"
              >
                <Typography variant="body2">
                  A confirmation SMS will be sent to{" "}
                  <strong>{formData.phone}</strong>. Please arrive 10 minutes
                  before your scheduled time.
                </Typography>
              </Alert>

              {formData.email && (
                <Alert
                  severity="success"
                  className="mb-4 text-left max-w-md mx-auto"
                >
                  <Typography variant="body2">
                    Your patient portal is ready. Go to{" "}
                    <strong>Login → "Login with OTP"</strong> and enter{" "}
                    <strong>{formData.email}</strong> to view your appointments
                    and payments — we'll email you a one-time code, no password
                    needed.
                  </Typography>
                </Alert>
              )}

              <Box className="flex justify-center gap-3 flex-wrap">
                <Button
                  variant="contained"
                  onClick={resetForm}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Book Another
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  color="primary"
                >
                  Login to Portal
                </Button>
                <Button
                  variant="outlined"
                  href="https://ujjwaldentalplanet.com/"
                >
                  Back to Website
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Page Header */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Book Your Appointment
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Schedule your visit at Ujjwal Dental Clinic
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper
              activeStep={activeStep}
              className="mb-6"
              sx={{
                overflowX: "auto",
                "& .MuiStepLabel-label": {
                  fontSize: { xs: "0.7rem", sm: "0.875rem" },
                },
              }}
              alternativeLabel
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Card>
              <CardContent className="p-6">
                {/* Step 1: Clinic & Date */}
                {activeStep === 0 && (
                  <Box>
                    <Typography
                      variant="h6"
                      className="font-semibol mb-5! flex items-center gap-2"
                    >
                      <CalendarMonthIcon className="text-teal-600" />
                      Select Clinic, Date & Time
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          select
                          fullWidth
                          label="Select Clinic"
                          value={formData.clinic}
                          onChange={handleChange("clinic")}
                          disabled={clinicsLoading}
                        >
                          {clinics.map((clinic) => (
                            <MenuItem
                              key={clinic._id}
                              value={clinic._id}
                            >
                              <Box className="flex items-center gap-2">
                                <LocationOnIcon
                                  fontSize="small"
                                  className="text-gray-400"
                                />
                                {clinic.name}
                                {clinic.address?.city && (
                                  <Chip
                                    size="small"
                                    label={clinic.address.city}
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Select Date"
                          value={formData.date}
                          onChange={handleChange("date")}
                          slotProps={{
                            inputLabel: { shrink: true },
                            htmlInput: {
                              min: getMinDate(),
                              max: getMaxDate() || MAX_DATE,
                              ...dateGuards,
                            },
                          }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          select
                          fullWidth
                          label="Select Time"
                          value={formData.time}
                          onChange={handleChange("time")}
                          disabled={!formData.date}
                          helperText={
                            !formData.date
                              ? "Select a date first"
                              : "Full or past slots are disabled"
                          }
                        >
                          {timeSlots.map((slot) => {
                            const disabled =
                              Array.isArray(availableSlots) &&
                              !availableSlots.includes(slot);
                            return (
                              <MenuItem
                                key={slot}
                                value={slot}
                                disabled={disabled}
                              >
                                <Box className="flex items-center gap-2">
                                  <AccessTimeIcon
                                    fontSize="small"
                                    className="text-gray-400"
                                  />
                                  {formatTime(slot)}
                                  {disabled ? " — unavailable" : ""}
                                </Box>
                              </MenuItem>
                            );
                          })}
                        </TextField>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          select
                          fullWidth
                          label="Reason for Visit"
                          value={formData.reason}
                          onChange={handleChange("reason")}
                        >
                          {appointmentReasons.map((reason) => (
                            <MenuItem key={reason.value} value={reason.value}>
                              {reason.label}
                              {reason.type === "emergency" && (
                                <Chip
                                  size="small"
                                  label="Emergency"
                                  color="error"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 2: Patient Details */}
                {activeStep === 1 && (
                  <Box>
                    <Typography
                      variant="h6"
                      className="font-semibold mb-4! flex items-center gap-2"
                    >
                      <PersonIcon className="text-teal-600" />
                      Patient Information
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Full Name *"
                          value={formData.name}
                          onChange={handleChange("name")}
                          placeholder="Enter your full name"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Phone Number *"
                          value={formData.phone}
                          onChange={handleChange("phone")}
                          placeholder="10-digit phone number"
                          inputProps={{ maxLength: 10 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          required
                          label="Email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange("email")}
                          placeholder="your@email.com"
                          helperText="Required for login to patient portal"
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                          select
                          fullWidth
                          label="Gender"
                          value={formData.gender}
                          onChange={handleChange("gender")}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField
                          fullWidth
                          label="Age"
                          type="number"
                          value={formData.age}
                          onChange={handleChange("age")}
                          inputProps={{ min: 1, max: 120 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Additional Notes (Optional)"
                          value={formData.notes}
                          onChange={handleChange("notes")}
                          placeholder="Any specific concerns or requirements..."
                          multiline
                          rows={3}
                        />
                      </Grid>

                      {/* reCAPTCHA */}
                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 1,
                          }}
                        >
                          <ReCAPTCHA
                            ref={captchaRef}
                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                            onChange={(token) => setCaptchaToken(token)}
                            onExpired={() => setCaptchaToken(null)}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Step 3: Payment */}
                {activeStep === 2 && (
                  <Box>
                    <Typography
                      variant="h6"
                      className="font-semibold mb-4 flex items-center gap-2"
                    >
                      <PaymentIcon className="text-teal-600" />
                      Payment Details
                    </Typography>

                    {/* Booking Summary */}
                    <Card className="bg-gray-50 mb-4">
                      <CardContent>
                        <Typography
                          variant="subtitle2"
                          className="font-semibold mb-3"
                        >
                          Booking Summary
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Clinic
                            </Typography>
                            <Typography
                              variant="body2"
                              className="font-semibold"
                            >
                              {
                                clinics.find((c) => c._id === formData.clinic)
                                  ?.name
                              }
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 3 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Date
                            </Typography>
                            <Typography
                              variant="body2"
                              className="font-semibold"
                            >
                              {formatDate(formData.date)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 3 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Time
                            </Typography>
                            <Typography
                              variant="body2"
                              className="font-semibold"
                            >
                              {formatTime(formData.time)}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Divider />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Patient
                            </Typography>
                            <Typography
                              variant="body2"
                              className="font-semibold"
                            >
                              {formData.name}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Phone
                            </Typography>
                            <Typography
                              variant="body2"
                              className="font-semibold"
                            >
                              {formData.phone}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* OPD Fee Card */}
                    <Card className="bg-teal-50 border-2 border-teal-200 mb-4">
                      <CardContent>
                        <Box className="flex justify-between items-center">
                          <Box>
                            <Typography
                              variant="body1"
                              className="font-semibold"
                            >
                              OPD Registration Fee
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {appointmentReasons.find(
                                (r) => r.value === formData.reason,
                              )?.type === "emergency"
                                ? "Emergency Appointment"
                                : "Regular Appointment"}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h4"
                            className="font-bold text-teal-700"
                          >
                            {feeLoading ? (
                              <CircularProgress size={24} />
                            ) : (
                              formatCurrency(getOpdFee())
                            )}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    <Alert severity="info" className="mb-4">
                      <Typography variant="body2">
                        Payment is required to confirm your appointment. You can
                        pay securely using UPI, Credit/Debit Card, or Net
                        Banking.
                      </Typography>
                    </Alert>

                    {/* Pay Now Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handlePayment}
                      disabled={isProcessing || feeLoading}
                      startIcon={
                        isProcessing ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <PaymentIcon />
                        )
                      }
                      className="bg-teal-600 hover:bg-teal-700"
                      sx={{ py: 1.5 }}
                    >
                      {isProcessing
                        ? "Processing..."
                        : `Pay ${formatCurrency(getOpdFee())} & Book`}
                    </Button>
                  </Box>
                )}

                {/* Navigation Buttons */}
                {activeStep < 2 && (
                  <Box className="flex justify-between mt-6">
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={handleBack}
                      disabled={activeStep === 0}
                    >
                      Back
                    </Button>

                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleNext}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Next
                    </Button>
                  </Box>
                )}

                {activeStep === 2 && (
                  <Box className="mt-4">
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      onClick={handleBack}
                      disabled={isProcessing}
                    >
                      Back
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
};

export default BookAppointment;
