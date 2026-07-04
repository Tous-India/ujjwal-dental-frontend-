/**
 * Add Appointment Modal
 *
 * Form modal to create a new appointment.
 * Fields reordered to Date/Time/Type/Reason single row for tablet admin UX — 2026-07-03
 */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
  Chip,
  Paper,
} from "@mui/material";
import { toast } from "react-toastify";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AppointmentSlipPreviewModal from "../../AppointmentSlipPreviewModal";
import { useAppointmentMutations } from "../../../hooks/admin/useAppointments";
import { searchPatients, createPatient } from "../../../api/admin/patients.api";
import api from "../../../api/axios";
import { getClinics } from "../../../api/admin/clinics.api";
import { getFeeSettings } from "../../../api/admin/settings.api";
import { getAvailableSlots } from "../../../api/admin/appointments.api";
import { getTreatmentMaster } from "../../../api/admin/treatments.api";
import {
  MAX_DATE,
  todayStr,
  dateGuards,
  isPastDate,
  isPastSlotForDate,
} from "../../../utils/dateInput";
/**
 * Appointment type options
 */
const typeOptions = [
  { value: "regular", label: "Regular" },
  { value: "follow_up", label: "Follow-up" },
];

/**
 * Source options
 */
const sourceOptions = [
  { value: "walk_in", label: "Walk-in" },
  { value: "phone", label: "Phone" },
  { value: "online", label: "Online" },
  { value: "app", label: "App" },
];

/**
 * Time slots
 */
const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
];

// Sentinel option appended to the Treatment dropdown for one-off custom
// treatments not in Treatment Master.
const OTHER_TREATMENT = { _id: "other", name: "Other (custom treatment)", price: null };

const formatCurrency = (val) => `₹${(Number(val) || 0).toLocaleString("en-IN")}`;

// Factory so every reset gets today's date fresh (not the module-load date).
const getInitialFormState = () => ({
  patient: null,
  clinic: null,
  date: todayStr(),
  timeSlot: "",
  type: "regular",
  appointmentType: "regular", // urgency: "regular" | "emergency"
  reason: "",
  source: "walk_in",
  notes: "",
  opdFee: 300,
  isFree: false,
  // Visit type & treatment fields
  visitType: "opd", // "opd" | "treatment"
  treatment: null,
  treatmentName: "",
  fee: "",
});

const AddAppointmentModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(getInitialFormState());
  const [patientSearch, setPatientSearch] = useState("");
  const [patientOptions, setPatientOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [clinicLoading, setClinicLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [feeSettings, setFeeSettings] = useState({
    opdFeeRegular: 300,
    opdFeeEmergency: 500,
    consultationFee: 500,
  });
  const [feeLoading, setFeeLoading] = useState(false);
  const [treatments, setTreatments] = useState([]);
  // null = not fetched yet (no clinic+date); otherwise array of open "HH:MM" slots
  const [availableSlots, setAvailableSlots] = useState(null);
  const { createAppointment, isCreating } = useAppointmentMutations();

  // Appointment data after successful booking (drives success banner + slip download)
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // FIX 1: Add patient inline state
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", phone: "", email: "" });
  const [addingPatient, setAddingPatient] = useState(false);

  // FIX 3: Payment method state
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [feeCollected, setFeeCollected] = useState(false);
  const [slipPreviewOpen, setSlipPreviewOpen] = useState(false);

  // Active-membership discount for the selected patient (server re-verifies it).
  const membership = formData.patient?.membership;
  const isActiveMember =
    membership?.status === "active" &&
    (!membership.expiryDate || new Date(membership.expiryDate) > new Date());
  const discountPercent = isActiveMember ? membership.discountPercent || 0 : 0;

  // Effective base fee for this visit (before membership discount).
  const baseFee = formData.isFree
    ? 0
    : formData.visitType === "treatment"
    ? Number(formData.fee) || 0
    : Number(formData.opdFee) || 0;
  const discountedFee =
    discountPercent > 0 ? Math.max(0, Math.round(baseFee * (1 - discountPercent / 100))) : baseFee;

  // Derived OPD default (feeSettings x urgency) — used to pre-fill the editable
  // fee field and to detect when a manual override differs from it.
  const derivedOpdDefault =
    formData.appointmentType === "emergency" ? feeSettings.opdFeeEmergency : feeSettings.opdFeeRegular;
  const opdFeeDiffersFromDefault =
    formData.visitType === "opd" &&
    !formData.isFree &&
    Number(formData.opdFee) !== Number(derivedOpdDefault);

  // Fetch slot availability whenever clinic + date are both chosen, so full and
  // past slots can be disabled in the dropdown.
  useEffect(() => {
    const clinicId = formData.clinic?._id;
    if (!open || !clinicId || !formData.date) {
      setAvailableSlots(null);
      return;
    }
    let active = true;
    getAvailableSlots(clinicId, formData.date)
      .then((res) => {
        if (!active) return;
        const slots = res?.data?.availableSlots || [];
        setAvailableSlots(slots);
        // Clear the selected slot if it is no longer available
        setFormData((prev) =>
          prev.timeSlot && !slots.includes(prev.timeSlot)
            ? { ...prev, timeSlot: "" }
            : prev,
        );
      })
      .catch(() => {
        if (active) setAvailableSlots([]);
      });
    return () => {
      active = false;
    };
  }, [open, formData.clinic, formData.date]);

  // Fetch clinics and fee settings when modal opens
  useEffect(() => {
    if (!open) return;

    const fetchClinics = async () => {
      setClinicLoading(true);
      try {
        const res = await getClinics();
        console.log("CLINICS 👉", res.data);
        setClinics(res.data);
      } catch (err) {
        console.error("Failed to fetch clinics", err);
        setClinics([]);
      } finally {
        setClinicLoading(false);
      }
    };

    const fetchFeeSettings = async () => {
      setFeeLoading(true);
      try {
        const res = await getFeeSettings();
        if (res.data?.fees) {
          setFeeSettings(res.data.fees);
          // Set initial OPD fee based on settings
          setFormData((prev) => ({
            ...prev,
            opdFee: res.data.fees.opdFeeRegular,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch fee settings", err);
      } finally {
        setFeeLoading(false);
      }
    };

    const fetchTreatments = async () => {
      try {
        const res = await getTreatmentMaster();
        setTreatments(res.data?.treatmentTypes || []);
      } catch (err) {
        console.error("Failed to fetch treatments", err);
        setTreatments([]);
      }
    };

    fetchClinics();
    fetchFeeSettings();
    fetchTreatments();
  }, [open]);

  // FIX 2: Auto-select Delhi Road clinic once the list loads
  useEffect(() => {
    if (clinics.length > 0 && !formData.clinic) {
      const defaultClinic = clinics.find(
        (c) =>
          c.name?.toLowerCase().includes("delhi road") ||
          c.name?.toLowerCase().includes("delhi"),
      );
      if (defaultClinic) setFormData((prev) => ({ ...prev, clinic: defaultClinic }));
    }
  }, [clinics]);

  // Update OPD fee when urgency (regular/emergency) changes
  useEffect(() => {
    if (formData.isFree) return; // Don't change if marked as free

    const newFee = formData.appointmentType === "emergency"
      ? feeSettings.opdFeeEmergency
      : feeSettings.opdFeeRegular;

    setFormData((prev) => ({
      ...prev,
      opdFee: newFee,
    }));
  }, [formData.appointmentType, feeSettings, formData.isFree]);

  // Membership auto-free: active membership + OPD → automatically set free,
  // and reset back when the patient/visit no longer qualifies (e.g. admin
  // switches to a non-member patient while still on OPD) — otherwise isFree
  // stays stuck at true and the visit never gets charged (revenue leak).
  // formData.isFree is read directly (not in the dep array) so this only acts
  // on an actual patient/visitType transition, not on every render — that way
  // a manual Free-toggle override for a non-member is left alone.
  useEffect(() => {
    if (!open) return;
    const m = formData.patient?.membership;
    const isMember =
      m?.status === "active" && (!m.expiryDate || new Date(m.expiryDate) > new Date());
    const shouldBeFree = isMember && formData.visitType === "opd";

    if (formData.isFree === shouldBeFree) return;

    if (shouldBeFree) {
      setFormData((prev) => ({ ...prev, isFree: true, opdFee: 0 }));
      setPaymentMethod("free");
    } else {
      const defaultFee =
        formData.appointmentType === "emergency" ? feeSettings.opdFeeEmergency : feeSettings.opdFeeRegular;
      setFormData((prev) => ({
        ...prev,
        isFree: false,
        opdFee: prev.visitType === "opd" ? defaultFee : prev.opdFee,
      }));
      setPaymentMethod("cash");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.patient, formData.visitType, open]);

  /**
   * Search patients
   */
  const handlePatientSearch = async (query) => {
    if (!query || query.length < 2) {
      setPatientOptions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await searchPatients(query);
      setPatientOptions(response.data?.patients || []);
    } catch (error) {
      console.error("Patient search failed:", error);
      setPatientOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Date field: reject past dates (manual typing / picker), reset to today.
  const handleDateChange = (e) => {
    const value = e.target.value;
    if (isPastDate(value)) {
      setErrors((prev) => ({ ...prev, date: "Date cannot be in the past" }));
      setFormData((prev) => ({ ...prev, date: todayStr(), timeSlot: "" }));
      return;
    }
    setErrors((prev) => ({ ...prev, date: "" }));
    setFormData((prev) => ({ ...prev, date: value }));
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient) {
      newErrors.patient = "Patient is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.timeSlot) {
      newErrors.timeSlot = "Time slot is required";
    }
    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
    }
    if (!formData.clinic) {
      newErrors.clinic = "Clinic is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submit — accepts optional paymentOverrides (e.g. { opdFeePaid: true })
   * injected after a successful Razorpay payment.
   */
  const handleSubmit = (paymentOverrides = {}) => {
    if (!validateForm()) return;

    if (formData.visitType === "treatment") {
      if (!formData.treatment) {
        setErrors((prev) => ({ ...prev, treatment: "Select a treatment" }));
        return;
      }
      if (formData.treatment?._id === "other" && !formData.treatmentName.trim()) {
        setErrors((prev) => ({ ...prev, treatmentName: "Enter the treatment name" }));
        return;
      }
      if (!formData.isFree && (!Number(formData.fee) || Number(formData.fee) <= 0)) {
        setErrors((prev) => ({ ...prev, fee: "Enter a valid fee" }));
        return;
      }
    }

    const appointmentData = {
      // Backend createAppointment expects `patientId` (existing patient) and
      // requires `phone` in its top-level validation — send both.
      patientId: formData.patient._id,
      phone: formData.patient.phone,
      name: formData.patient.name,
      clinic: formData.clinic._id,
      date: formData.date,
      timeSlot: formData.timeSlot,
      type: formData.type,
      appointmentType: formData.appointmentType,
      reason: formData.reason,
      source: formData.source,
      notes: formData.notes || undefined,
      visitType: formData.visitType,
      isFree: formData.isFree,
      opdFeePaid: formData.isFree || feeCollected,
      paymentMethod: formData.isFree ? "free" : paymentMethod,
      ...(formData.visitType === "treatment"
        ? {
            treatmentId: formData.treatment?._id,
            treatmentName:
              formData.treatment?._id === "other"
                ? formData.treatmentName.trim()
                : undefined,
            fee: formData.isFree ? 0 : Number(formData.fee),
          }
        : {
            opdFee: formData.isFree ? 0 : Number(formData.opdFee),
          }),
      ...paymentOverrides,
    };

    createAppointment(appointmentData, {
      onSuccess: (response) => {
        const token = response?.data?.tokenNumber;
        toast.success(
          token ? `Appointment booked — Token #${token}` : "Appointment booked",
        );
        // Build slip object from formData (before reset) + server response
        const slipData = {
          ...response?.data,
          date: formData.date,
          timeSlot: formData.timeSlot,
          clinic: formData.clinic,
          reason: formData.reason,
          patient: {
            ...response?.data?.patient,
            name: formData.patient?.name,
            phone: formData.patient?.phone,
            age: formData.patient?.age,
            gender: formData.patient?.gender,
            address: formData.patient?.address,
          },
        };
        setBookedAppointment(slipData);
        setFormData(getInitialFormState());
        setPatientOptions([]);
        setPaymentMethod("cash");
        setFeeCollected(false);
        onSuccess?.(response);
        // Modal stays open to show success banner; user closes it manually
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to create appointment",
        );
      },
    });
  };

  /**
   * FIX 4: Open Razorpay checkout, verify payment, then book appointment.
   */
  const handlePayOnline = async () => {
    if (formData.visitType !== "opd") return;
    if (!validateForm()) return;

    try {
      const res = await api.post("/payments/razorpay/create-order", {
        type: "opd_fee",
        patient: formData.patient._id,
        clinic: formData.clinic._id,
        isEmergency: formData.appointmentType === "emergency",
      });

      const { order, paymentId, key_id } = res.data.data;

      const options = {
        key: key_id,
        amount: order.amount,
        currency: "INR",
        name: "Ujjwal Dental Clinic",
        description: "OPD Consultation Fee",
        order_id: order.id,
        handler: async (paymentResponse) => {
          try {
            await api.post("/payments/razorpay/verify", {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              paymentId,
            });
            handleSubmit({ opdFeePaid: true });
          } catch (err) {
            console.error("Payment verify error:", err);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.patient?.name,
          email: formData.patient?.email || "",
          contact: formData.patient?.phone,
        },
        theme: { color: "#f59e0b" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      const msg = err?.response?.data?.message || err?.message || "";
      if (
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("e11000") ||
        msg.toLowerCase().includes("paymentnumber")
      ) {
        toast.warning("Payment number conflict detected. Please try again.", { autoClose: 4000 });
      } else {
        toast.error(msg || "Failed to initiate payment", { autoClose: 4000 });
      }
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isCreating) {
      setFormData(getInitialFormState());
      setPatientOptions([]);
      setErrors({});
      setShowAddPatient(false);
      setNewPatient({ name: "", phone: "", email: "" });
      setPaymentMethod("cash");
      setFeeCollected(false);
      setBookedAppointment(null);
      onClose();
    }
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { className: "rounded-xl" } }}
    >
      {/* Header — slim title bar */}
      <DialogTitle className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white" sx={{ py: 1.25, px: 2 }}>
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <EventIcon className="text-white" fontSize="small" />
            <Typography variant="subtitle1" className="font-bold text-white">
              Book New Appointment
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} disabled={isCreating}>
            <CloseIcon className="text-white" fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content — compact, helper texts muted/smaller */}
      <DialogContent
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1.5,
          "& .MuiFormHelperText-root": {
            fontSize: "0.7rem",
            lineHeight: 1.3,
            mt: 0.25,
            mb: 0,
            minHeight: 0,
            visibility: "hidden",
          },
          "& .MuiInputBase-root": { height: "40px", fontSize: "13px" },
          "& .notes-field .MuiInputBase-root": { height: "auto" },
          "& .MuiInputBase-input": { fontSize: "13px", paddingTop: "5px", paddingBottom: "5px" },
          "& .MuiInputLabel-root": { fontSize: "13px" },
          "& .MuiAutocomplete-root .MuiInputBase-root": { height: "40px" },
          "& .MuiAutocomplete-input": { paddingTop: "2px !important", paddingBottom: "2px !important" },
          "& .MuiSelect-select": { paddingTop: "8px", paddingBottom: "8px" },
        }}
        className="mt-5"
      >
        {/* Success banner — shown after booking, replaces the form */}
        {bookedAppointment && (
          <Box
            sx={{
              border: "1px solid #d1fae5",
              borderRadius: "10px",
              backgroundColor: "#f0fdf4",
              p: 3,
              textAlign: "center",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48, color: "#059669", mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#065f46", mb: 0.5 }}>
              Appointment Booked!
            </Typography>
            {bookedAppointment.tokenNumber && (
              <Typography variant="body2" sx={{ color: "#047857", mb: 0.5 }}>
                Token <strong>#{bookedAppointment.tokenNumber}</strong>
              </Typography>
            )}
            {bookedAppointment.appointmentNumber && (
              <Typography variant="body2" sx={{ color: "#6b7280", mb: 2 }}>
                {bookedAppointment.appointmentNumber}
              </Typography>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => setSlipPreviewOpen(true)}
              sx={{
                textTransform: "none",
                borderColor: "#f59e0b",
                color: "#f59e0b",
                "&:hover": { borderColor: "#d97706", backgroundColor: "#fffbeb" },
              }}
            >
              Preview & Download Slip
            </Button>
            <Typography variant="caption" sx={{ display: "block", color: "#9ca3af", mt: 2 }}>
              Close this dialog to book another appointment.
            </Typography>
          </Box>
        )}

        {/* mt on the container guarantees a gap below the purple header
            (MUI zeroes DialogContent padding-top right after DialogTitle). */}
        {!bookedAppointment && (
        <Grid container spacing={1.5} sx={{ mt: 1 }}>

          {/* ─── ROW 1: Patient ─── */}
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              options={patientOptions}
              getOptionLabel={(option) => `${option.name} (${option.phone})`}
              value={formData.patient}
              onChange={(_, value) =>
                setFormData((prev) => ({ ...prev, patient: value }))
              }
              onInputChange={(_, value) => {
                setPatientSearch(value);
                handlePatientSearch(value);
              }}
              loading={searchLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient"
                  placeholder="Type patient name or phone..."
                  error={!!errors.patient}
                  helperText={errors.patient}
                  required
                  size="small"
                />
              )}
              noOptionsText={
                patientSearch.length < 2 ? (
                  "Type at least 2 characters"
                ) : (
                  <Box>
                    <Typography sx={{ fontSize: "13px", color: "#666", mb: 1 }}>
                      No patient found
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setShowAddPatient(true)}
                      sx={{
                        fontSize: "12px",
                        textTransform: "none",
                        color: "#f59e0b",
                        borderColor: "#f59e0b",
                      }}
                    >
                      + Add New Patient
                    </Button>
                  </Box>
                )
              }
            />
          </Grid>
          {/* ─── ROW 2: Date → Time → Appointment Type → Reason ─── */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Appointment Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              error={!!errors.date}
              helperText={errors.date}
              required
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: todayStr(), max: MAX_DATE, ...dateGuards }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Time Slot"
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleChange}
              error={!!errors.timeSlot}
              helperText={
                errors.timeSlot ||
                (Array.isArray(availableSlots)
                  ? "Full or past slots are disabled"
                  : "Select clinic and date first")
              }
              required
              select
              size="small"
            >
              <MenuItem value="">Select Time</MenuItem>
              {timeSlots.map((slot) => {
                const disabled =
                  isPastSlotForDate(formData.date, slot) ||
                  (Array.isArray(availableSlots) &&
                    !availableSlots.includes(slot));
                return (
                  <MenuItem key={slot} value={slot} disabled={disabled}>
                    {slot}
                    {disabled ? " — unavailable" : ""}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Appointment Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              select
              size="small"
            >
              {typeOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Reason for Visit"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              error={!!errors.reason}
              helperText={errors.reason}
              required
              size="small"
              placeholder="e.g., Tooth pain, Cleaning"
            />
          </Grid>

          {/* ─── ADD NEW PATIENT (conditional, full width) ─── */}
          {showAddPatient && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  p: 2,
                  mt: 1,
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography sx={{ fontSize: "13px", fontWeight: 600, mb: 1.5, color: "#1a1a1a" }}>
                  Add New Patient
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                  <TextField
                    label="Full Name *"
                    size="small"
                    sx={{ flex: 1, minWidth: "140px" }}
                    value={newPatient.name}
                    onChange={(e) => setNewPatient((p) => ({ ...p, name: e.target.value }))}
                  />
                  <TextField
                    label="Phone *"
                    size="small"
                    sx={{ flex: 1, minWidth: "140px" }}
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient((p) => ({ ...p, phone: e.target.value }))}
                    inputProps={{ maxLength: 10 }}
                    placeholder="10-digit mobile"
                  />
                  <TextField
                    label="Email"
                    size="small"
                    sx={{ flex: 1, minWidth: "140px" }}
                    value={newPatient.email}
                    onChange={(e) => setNewPatient((p) => ({ ...p, email: e.target.value }))}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!newPatient.name || !newPatient.phone || addingPatient}
                    onClick={async () => {
                      setAddingPatient(true);
                      try {
                        const result = await createPatient({
                          name: newPatient.name,
                          phone: newPatient.phone,
                          email: newPatient.email || undefined,
                        });
                        const created = result.data?.patient || result.patient || result;
                        setFormData((prev) => ({ ...prev, patient: created }));
                        setShowAddPatient(false);
                        setNewPatient({ name: "", phone: "", email: "" });
                        toast.success(`Patient ${created.name} added`);
                      } catch (err) {
                        console.error("Add patient error:", err);
                        toast.error(err.response?.data?.message || "Failed to add patient");
                      }
                      setAddingPatient(false);
                    }}
                    sx={{ backgroundColor: "#f59e0b", textTransform: "none", fontSize: "12px", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    {addingPatient ? "Adding..." : "Add & Select"}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setShowAddPatient(false);
                      setNewPatient({ name: "", phone: "", email: "" });
                    }}
                    sx={{ textTransform: "none", fontSize: "12px", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Grid>
          )}

          {/* ─── SECTION DIVIDER ─── */}
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          {/* ─── ROW 3: Clinic + Source ─── */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Autocomplete
              options={clinics}
              getOptionLabel={(option) =>
                `${option.name}${option.address?.city ? ` - ${option.address.city}` : ""}`
              }
              value={formData.clinic}
              onChange={(_, value) =>
                setFormData((prev) => ({ ...prev, clinic: value }))
              }
              loading={clinicLoading}
              isOptionEqualToValue={(opt, val) => opt._id === val?._id}
              getOptionDisabled={(option) => !option.isActive}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Clinic"
                  placeholder="Choose clinic"
                  required
                  size="small"
                  error={!!errors.clinic}
                  helperText={errors.clinic || "Inactive clinics are disabled"}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 4 }}>
            <TextField
              fullWidth
              label="Booking Source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              select
              size="small"
            >
              {sourceOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* ─── SECTION DIVIDER ─── */}
          <Grid size={{ xs: 12 }}>
            <Divider />
          </Grid>

          {/* Membership notice */}
          {isActiveMember && formData.visitType === "opd" && (
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.75,
                  bgcolor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 1,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 14, color: "#059669" }} />
                <Typography variant="caption" sx={{ color: "#059669", fontWeight: 600 }}>
                  Patient has {membership?.planName || "an active membership"} — OPD is free
                </Typography>
              </Box>
            </Grid>
          )}

          {/* ─── ROW 4: Visit Config (bordered group) ─── */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 1.5,
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "flex-start",
                bgcolor: "#fafafa",
              }}
            >
              {/* Visit Type */}
              <FormControl>
                <FormLabel className="text-xs font-semibold text-gray-700" sx={{ "&.Mui-focused": { color: "inherit" } }}>
                  Visit Type
                </FormLabel>
                <RadioGroup
                  row
                  value={formData.visitType}
                  onChange={(e) => {
                    const newVisitType = e.target.value;
                    if (newVisitType === "treatment") {
                      setPaymentMethod("cash");
                      setFeeCollected(false);
                      if (isActiveMember && formData.isFree) {
                        const defaultFee =
                          formData.appointmentType === "emergency"
                            ? feeSettings.opdFeeEmergency
                            : feeSettings.opdFeeRegular;
                        setFormData((prev) => ({
                          ...prev,
                          visitType: "treatment",
                          isFree: false,
                          opdFee: defaultFee,
                        }));
                        return;
                      }
                    }
                    setFormData((prev) => ({
                      ...prev,
                      visitType: newVisitType,
                      ...(newVisitType === "opd"
                        ? { treatment: null, treatmentName: "", fee: "" }
                        : {}),
                    }));
                  }}
                  sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8rem" }, "& .MuiFormControlLabel-root": { mr: 1 } }}
                >
                  <FormControlLabel value="opd" control={<Radio size="small" />} label="OPD" />
                  <FormControlLabel value="treatment" control={<Radio size="small" />} label="Treatment" />
                </RadioGroup>
              </FormControl>

              {/* Urgency */}
              <FormControl>
                <FormLabel className="text-xs font-semibold text-gray-700" sx={{ "&.Mui-focused": { color: "inherit" } }}>
                  Urgency
                </FormLabel>
                <RadioGroup
                  row
                  value={formData.appointmentType}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, appointmentType: e.target.value }))
                  }
                  sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8rem" }, "& .MuiFormControlLabel-root": { mr: 1 } }}
                >
                  <FormControlLabel value="regular" control={<Radio size="small" />} label="Regular" />
                  <FormControlLabel
                    value="emergency"
                    control={<Radio size="small" sx={{ "&.Mui-checked": { color: "#dc2626" } }} />}
                    label="Emergency"
                  />
                </RadioGroup>
              </FormControl>

              {/* OPD Fee — editable, pre-filled from feeSettings default.
                  Disabled + shown as "Free (Membership)" when the membership
                  auto-detect effect has marked this visit free. */}
              {formData.visitType === "opd" && (
                <Box sx={{ flex: "0 0 auto", minWidth: 180 }}>
                  <TextField
                    label={
                      formData.isFree
                        ? "OPD Fee — Free (Membership)"
                        : `OPD Fee (₹) — ${formData.appointmentType === "emergency" ? "Emergency" : "Regular"}`
                    }
                    name="opdFee"
                    type="number"
                    value={formData.opdFee}
                    onChange={handleChange}
                    size="small"
                    disabled={formData.isFree}
                    inputProps={{ min: 0 }}
                  />
                  {formData.isFree ? (
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "#059669", fontSize: "0.65rem", mt: 0.25 }}
                    >
                      Membership benefit — cannot be overridden
                    </Typography>
                  ) : (
                    opdFeeDiffersFromDefault && (
                      <Button
                        size="small"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, opdFee: derivedOpdDefault }))
                        }
                        startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
                        sx={{ textTransform: "none", fontSize: "0.65rem", mt: 0.25, p: 0, minWidth: 0 }}
                      >
                        Reset to default
                      </Button>
                    )
                  )}
                </Box>
              )}

              {/* Treatment dropdown (only when treatment selected) */}
              {formData.visitType === "treatment" && (
                <Box sx={{ flex: "0 0 auto", minWidth: 220 }}>
                  <Autocomplete
                    options={[...treatments, OTHER_TREATMENT]}
                    getOptionLabel={(o) => (o ? o.name || "" : "")}
                    value={formData.treatment}
                    isOptionEqualToValue={(opt, val) => opt._id === val?._id}
                    onChange={(_, value) => {
                      const isOther = value?._id === "other";
                      setFormData((prev) => ({
                        ...prev,
                        treatment: value,
                        fee: isOther ? "" : value?.price ?? prev.fee,
                        treatmentName: isOther ? prev.treatmentName : "",
                      }));
                      setErrors((prev) => ({ ...prev, treatment: "", treatmentName: "", fee: "" }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Treatment"
                        placeholder="Select a treatment"
                        required
                        size="small"
                        error={!!errors.treatment}
                        helperText={errors.treatment}
                      />
                    )}
                  />
                </Box>
              )}

              {/* Custom treatment name (only when "Other" selected) */}
              {formData.visitType === "treatment" && formData.treatment?._id === "other" && (
                <Box sx={{ flex: "0 0 auto", minWidth: 200 }}>
                  <TextField
                    fullWidth
                    label="Treatment name"
                    name="treatmentName"
                    value={formData.treatmentName}
                    onChange={handleChange}
                    required
                    size="small"
                    error={!!errors.treatmentName}
                    helperText={errors.treatmentName || "Enter the custom treatment name"}
                    placeholder="e.g., Custom procedure"
                  />
                </Box>
              )}

              {/* Free toggle */}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFree}
                    onChange={(e) => {
                      const isFree = e.target.checked;
                      const defaultFee = formData.appointmentType === "emergency"
                        ? feeSettings.opdFeeEmergency
                        : feeSettings.opdFeeRegular;
                      setFormData((prev) => ({
                        ...prev,
                        isFree,
                        opdFee: isFree ? 0 : defaultFee,
                      }));
                      if (isFree) setPaymentMethod("cash");
                    }}
                    color="success"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    Free
                  </Typography>
                }
              />
            </Box>
            {formData.appointmentType === "emergency" && formData.visitType === "opd" && (
              <Typography variant="caption" className="text-red-600 font-medium" sx={{ fontSize: "0.7rem", display: "block", mt: 0.5 }}>
                Emergency OPD fee applied (₹{feeSettings.opdFeeEmergency}).
              </Typography>
            )}
            {formData.appointmentType === "emergency" && formData.visitType === "treatment" && (
              <Typography variant="caption" className="text-gray-500" sx={{ fontSize: "0.7rem", display: "block", mt: 0.5 }}>
                Flagged emergency — treatment fee unchanged.
              </Typography>
            )}
          </Grid>

          {/* ─── ROW 5: Fee Summary + Notes (same row, same height) ─── */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper variant="outlined" className="p-3 bg-gray-50">
              <Box className="flex justify-between items-center py-1">
                <Typography variant="caption" className="text-gray-600">
                  {formData.visitType === "treatment"
                    ? formData.treatment?._id === "other"
                      ? formData.treatmentName.trim() || "Custom treatment"
                      : formData.treatment?.name || "Treatment fee"
                    : "OPD / Consultation fee"}
                </Typography>
                {discountPercent > 0 && !formData.isFree ? (
                  <Box className="flex items-center gap-2">
                    <span className="font-numbers text-gray-400 line-through text-[13px]">
                      {formatCurrency(baseFee)}
                    </span>
                    <span className="font-numbers font-semibold text-accent">
                      {formatCurrency(discountedFee)}
                    </span>
                  </Box>
                ) : (
                  <span className="font-numbers font-semibold">
                    {formData.isFree ? "Free" : formatCurrency(baseFee)}
                  </span>
                )}
              </Box>
              {discountPercent > 0 && !formData.isFree && (
                <Box className="flex justify-between items-center py-1">
                  <Typography variant="caption" className="text-gray-500">
                    Membership discount
                  </Typography>
                  <Chip size="small" color="warning" label={`${discountPercent}% off`} sx={{ height: 18, fontWeight: 700 }} />
                </Box>
              )}
              <Divider className="my-2.5" />
              <Box className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 py-0.5 mt-2">
                <Box className="flex items-center gap-1">
                  <Typography variant="caption" className="text-gray-500">Method:</Typography>
                  {formData.isFree ? (
                    <Chip size="small" variant="outlined" label="Free" sx={{ height: 20 }} />
                  ) : (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant={paymentMethod === "cash" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setPaymentMethod("cash")}
                        sx={{
                          textTransform: "none", fontSize: "11px", height: 22, minWidth: 0, px: 1.5,
                          ...(paymentMethod === "cash"
                            ? { backgroundColor: "#1e3a5f", color: "#fff", "&:hover": { backgroundColor: "#162d4a" } }
                            : { borderColor: "#1e3a5f", color: "#1e3a5f" }),
                        }}
                      >
                        Cash
                      </Button>
                      <Button
                        variant={paymentMethod === "online" ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setPaymentMethod("online")}
                        sx={{
                          textTransform: "none", fontSize: "11px", height: 22, minWidth: 0, px: 1.5,
                          ...(paymentMethod === "online"
                            ? { backgroundColor: "#059669", color: "#fff", "&:hover": { backgroundColor: "#047857" } }
                            : { borderColor: "#059669", color: "#059669" }),
                        }}
                      >
                        Online
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
              {!formData.isFree && (
                <Box className="flex items-center mt-2">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={feeCollected}
                        onChange={(e) => setFeeCollected(e.target.checked)}
                        size="small"
                        sx={{ py: 0.5, color: "#059669", "&.Mui-checked": { color: "#059669" } }}
                      />
                    }
                    label={
                      <Typography variant="caption" sx={{ color: feeCollected ? "#059669" : "text.secondary", fontWeight: feeCollected ? 600 : 400 }}>
                        Payment collected
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              className="notes-field"
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={4}
              size="small"
              placeholder="Additional notes..."
            />
          </Grid>
        </Grid>
        )}
      </DialogContent>

      {/* Actions — slim sticky footer with a top divider */}
      <DialogActions
        className="px-4 py-2 bg-gray-50"
        sx={{ borderTop: 1, borderColor: "divider" }}
      >
        <Button onClick={handleClose} color="inherit" disabled={isCreating}>
          {bookedAppointment ? "Close" : "Cancel"}
        </Button>

        {/* FIX 3 & 4: Conditional submit button (hidden after booking) */}
        {!bookedAppointment && (
          <Button
            variant="contained"
            onClick={() => handleSubmit()}
            disabled={isCreating}
            className="bg-indigo-600 hover:bg-indigo-700"
            startIcon={isCreating ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {isCreating ? "Booking..." : "Book Appointment"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
    <AppointmentSlipPreviewModal
      open={slipPreviewOpen}
      onClose={() => setSlipPreviewOpen(false)}
      appointment={bookedAppointment}
    />
    </>
  );
};

export default AddAppointmentModal;
