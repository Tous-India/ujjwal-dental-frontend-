/**
 * Add Appointment Modal
 *
 * Form modal to create a new appointment.
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
import { useAppointmentMutations } from "../../../hooks/admin/useAppointments";
import { searchPatients } from "../../../api/admin/patients.api";
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

/**
 * Initial form state
 */
const initialFormState = {
  patient: null,
  clinic: null,
  date: "",
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
  treatment: null, // selected treatment object (for treatment visits)
  treatmentName: "", // custom treatment name (only when "Other" is selected)
  fee: "", // treatment fee (editable)
  feeNotes: "",
};

// Sentinel option appended to the Treatment dropdown for one-off custom
// treatments not in Treatment Master. _id "other" signals the backend to store
// a custom name + manual fee instead of looking up a catalog entry.
const OTHER_TREATMENT = { _id: "other", name: "Other (custom treatment)", price: null };

const formatCurrency = (val) => `₹${(Number(val) || 0).toLocaleString("en-IN")}`;

const AddAppointmentModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(initialFormState);
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
   * Handle form submit
   */
  const handleSubmit = () => {
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
      // requires `phone` in its top-level validation — send both. (Sending only
      // `patient` left patientId/phone undefined, which made the backend reject
      // with a misleading "Clinic, date and time slot are required" message.)
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
      opdFeePaid: formData.isFree, // Mark as paid if free
      ...(formData.visitType === "treatment"
        ? {
            // "other" is a sentinel — backend stores treatmentName + manual fee
            // instead of looking up a Treatment Master entry.
            treatmentId: formData.treatment?._id,
            treatmentName:
              formData.treatment?._id === "other"
                ? formData.treatmentName.trim()
                : undefined,
            fee: formData.isFree ? 0 : Number(formData.fee),
            feeNotes: formData.feeNotes || undefined,
          }
        : {
            // OPD: send opdFee so the backend uses the admin value
            opdFee: formData.isFree ? 0 : Number(formData.opdFee),
          }),
    };

    createAppointment(appointmentData, {
      onSuccess: (response) => {
        const token = response?.data?.tokenNumber;
        toast.success(
          token ? `Appointment booked — Token #${token}` : "Appointment booked",
        );
        setFormData(initialFormState);
        setPatientOptions([]);
        onSuccess?.(response);
        onClose();
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to create appointment",
        );
      },
    });
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isCreating) {
      setFormData(initialFormState);
      setPatientOptions([]);
      setErrors({});
      onClose();
    }
  };

  return (
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
          pt: 2.5,
          pb: 2,
          "& .MuiFormHelperText-root": {
            fontSize: "0.7rem",
            lineHeight: 1.3,
            mt: 0.25,
          },
        }}
      >
        {/* mt on the container guarantees a gap below the purple header
            (MUI zeroes DialogContent padding-top right after DialogTitle). */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Patient Search */}
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
                patientSearch.length < 2
                  ? "Type at least 2 characters"
                  : "No patients found"
              }
            />
          </Grid>
          {/* Clinic Selection */}
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
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
          {/* Source */}
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
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
          {/* Date */}
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
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

          {/* Time Slot */}
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
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
                // Disable if the slot is in the past today (client clock = IST)
                // or full/unavailable per the backend.
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

          {/* Type */}
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
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

          {/* Reason */}
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
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

          {/* Visit Type + Urgency — side by side, compact inline radios */}
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
            <FormControl>
              <FormLabel className="text-xs font-semibold text-gray-700" sx={{ "&.Mui-focused": { color: "inherit" } }}>
                Visit Type
              </FormLabel>
              <RadioGroup
                row
                value={formData.visitType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    visitType: e.target.value,
                    // reset treatment fields when switching back to OPD
                    ...(e.target.value === "opd"
                      ? { treatment: null, treatmentName: "", fee: "", feeNotes: "" }
                      : {}),
                  }))
                }
                sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.85rem" }, "& .MuiFormControlLabel-root": { mr: 1.5 } }}
              >
                <FormControlLabel value="opd" control={<Radio size="small" />} label="OPD" />
                <FormControlLabel value="treatment" control={<Radio size="small" />} label="Treatment" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Urgency (Regular / Emergency) */}
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
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
                sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.85rem" }, "& .MuiFormControlLabel-root": { mr: 1.5 } }}
              >
                <FormControlLabel value="regular" control={<Radio size="small" />} label="Regular" />
                <FormControlLabel
                  value="emergency"
                  control={<Radio size="small" sx={{ "&.Mui-checked": { color: "#dc2626" } }} />}
                  label="Emergency"
                />
              </RadioGroup>
              {formData.appointmentType === "emergency" && formData.visitType === "opd" && (
                <Typography variant="caption" className="text-red-600 font-medium" sx={{ fontSize: "0.7rem" }}>
                  Emergency OPD fee applied (₹{feeSettings.opdFeeEmergency}).
                </Typography>
              )}
              {formData.appointmentType === "emergency" && formData.visitType === "treatment" && (
                <Typography variant="caption" className="text-gray-500" sx={{ fontSize: "0.7rem" }}>
                  Flagged emergency — treatment fee unchanged.
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Treatment fields (treatment visits only) */}
          {formData.visitType === "treatment" && (
            <>
              <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                <Autocomplete
                  options={[...treatments, OTHER_TREATMENT]}
                  getOptionLabel={(o) =>
                    o ? `${o.name}${o.price ? ` — ₹${o.price}` : ""}` : ""
                  }
                  value={formData.treatment}
                  isOptionEqualToValue={(opt, val) => opt._id === val?._id}
                  onChange={(_, value) => {
                    const isOther = value?._id === "other";
                    setFormData((prev) => ({
                      ...prev,
                      treatment: value,
                      // "Other": no preset price — clear the fee so the admin
                      // types it manually. Normal: auto-fill from treatment price.
                      fee: isOther ? "" : value?.price ?? prev.fee,
                      // Drop any custom name when switching back to a normal treatment.
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
              </Grid>
              {formData.treatment?._id === "other" && (
                <Grid size={{ xs: 6, sm: 6, md: 4 }}>
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
                </Grid>
              )}
              <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  label="Fee (₹)"
                  name="fee"
                  type="number"
                  value={formData.fee}
                  onChange={handleChange}
                  size="small"
                  disabled={formData.isFree}
                  error={!!errors.fee}
                  helperText={
                    formData.isFree
                      ? "Fee waived for free appointment"
                      : formData.treatment?._id === "other"
                      ? "Enter the fee for this custom treatment"
                      : "Auto-filled from treatment price — editable per patient"
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Fee Notes (optional)"
                  name="feeNotes"
                  value={formData.feeNotes}
                  onChange={handleChange}
                  size="small"
                  placeholder="e.g., 2nd sitting, crown fitting"
                />
              </Grid>
            </>
          )}

          {/* Free Appointment Toggle */}
          <Grid size={{ xs: 6, sm: 6, md: 4 }}>
            <Box className="flex items-center h-full">
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
                    }}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Free Appointment
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      No payment required
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Grid>

          {/* OPD Fee (OPD visits only) */}
          {formData.visitType === "opd" && (
            <Grid size={{ xs: 6, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label={`OPD Fee (₹) - ${formData.appointmentType === "emergency" ? "Emergency" : "Regular"}`}
                name="opdFee"
                type="number"
                value={formData.opdFee}
                onChange={handleChange}
                size="small"
                disabled={formData.isFree || feeLoading}
                helperText={
                  formData.isFree
                    ? "Fee waived for free appointment"
                    : `Default: ₹${formData.appointmentType === "emergency" ? feeSettings.opdFeeEmergency : feeSettings.opdFeeRegular} (from settings)`
                }
              />
            </Grid>
          )}

          {/* Fee Summary — compact */}
          <Grid size={{ xs: 12 }}>
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
              <Box className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-0.5">
                <Box className="flex items-center gap-1">
                  <Typography variant="caption" className="text-gray-500">Method:</Typography>
                  <Chip size="small" variant="outlined" label="Pay at Clinic" sx={{ height: 20 }} />
                </Box>
                <Box className="flex items-center gap-1">
                  <Typography variant="caption" className="text-gray-500">Status:</Typography>
                  <Chip
                    size="small"
                    color={formData.isFree ? "info" : "warning"}
                    label={formData.isFree ? "Free" : "Pending"}
                    sx={{ height: 20 }}
                  />
                </Box>
              </Box>
              {!formData.isFree && (
                <Typography variant="caption" className="text-gray-400 block mt-2.5 pt-0.5" sx={{ fontSize: "0.7rem" }}>
                  An invoice will be auto-created (unpaid), collected at the clinic.
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              multiline
              rows={2}
              size="small"
              placeholder="Additional notes..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Actions — slim sticky footer with a top divider */}
      <DialogActions
        className="px-4 py-2 bg-gray-50"
        sx={{ borderTop: 1, borderColor: "divider" }}
      >
        <Button onClick={handleClose} color="inherit" disabled={isCreating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isCreating}
          className="bg-indigo-600 hover:bg-indigo-700"
          startIcon={isCreating ? <CircularProgress size={16} /> : <AddIcon />}
        >
          {isCreating ? "Booking..." : "Book Appointment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAppointmentModal;
