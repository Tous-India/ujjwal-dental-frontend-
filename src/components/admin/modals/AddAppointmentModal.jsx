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
  { value: "emergency", label: "Emergency" },
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
  reason: "",
  source: "walk_in",
  notes: "",
  opdFee: 300,
  isFree: false,
};

const AddAppointmentModal = ({ open, onClose, onSuccess, clinicId }) => {
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
  // null = not fetched yet (no clinic+date); otherwise array of open "HH:MM" slots
  const [availableSlots, setAvailableSlots] = useState(null);
  const { createAppointment, isCreating } = useAppointmentMutations();

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

    fetchClinics();
    fetchFeeSettings();
  }, [open]);

  // Update OPD fee when appointment type changes
  useEffect(() => {
    if (formData.isFree) return; // Don't change if marked as free

    const newFee = formData.type === "emergency"
      ? feeSettings.opdFeeEmergency
      : feeSettings.opdFeeRegular;

    setFormData((prev) => ({
      ...prev,
      opdFee: newFee,
    }));
  }, [formData.type, feeSettings, formData.isFree]);

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

    const appointmentData = {
      patient: formData.patient._id,
      clinic: formData.clinic._id,
      date: formData.date,
      timeSlot: formData.timeSlot,
      type: formData.type,
      reason: formData.reason,
      source: formData.source,
      notes: formData.notes || undefined,
      opdFee: formData.isFree ? 0 : formData.opdFee,
      isFree: formData.isFree,
      opdFeePaid: formData.isFree, // Mark as paid if free
    };

    createAppointment(appointmentData, {
      onSuccess: (response) => {
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
      {/* Header */}
      <DialogTitle className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white ">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <EventIcon className="text-white" />
            <Typography variant="h6" className="font-bold text-white">
              Book New Appointment
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isCreating}>
            <CloseIcon className="text-white" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent className="p-6 mt-5">
        <Grid container spacing={3} className="mt-2">
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
          <Grid size={{ xs: 12 }}>
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
          {/* Date */}
          <Grid size={{ xs: 12, md: 6 }}>
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
          <Grid size={{ xs: 12, md: 6 }}>
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
          <Grid size={{ xs: 12, md: 6 }}>
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

          {/* Source */}
          <Grid size={{ xs: 12, md: 6 }}>
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

          {/* Reason */}
          <Grid size={{ xs: 12 }}>
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
              placeholder="e.g., Tooth pain, Cleaning, Checkup"
            />
          </Grid>

          {/* Free Appointment Toggle */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="flex items-center h-full">
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFree}
                    onChange={(e) => {
                      const isFree = e.target.checked;
                      const defaultFee = formData.type === "emergency"
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

          {/* OPD Fee */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={`OPD Fee (₹) - ${formData.type === "emergency" ? "Emergency" : "Regular"}`}
              name="opdFee"
              type="number"
              value={formData.opdFee}
              onChange={handleChange}
              size="small"
              disabled={formData.isFree || feeLoading}
              helperText={
                formData.isFree
                  ? "Fee waived for free appointment"
                  : `Default: ₹${formData.type === "emergency" ? feeSettings.opdFeeEmergency : feeSettings.opdFeeRegular} (from settings)`
              }
            />
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

      {/* Actions */}
      <DialogActions className="p-4 bg-gray-50">
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
