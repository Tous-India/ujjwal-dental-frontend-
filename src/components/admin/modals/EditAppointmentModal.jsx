/**
 * Edit Appointment Modal
 *
 * Modal for editing an existing appointment.
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
  FormControlLabel,
  Switch,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { useAppointmentMutations } from "../../../hooks/admin/useAppointments";

/**
 * Time slots
 */
const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
];

/**
 * Appointment types
 */
const appointmentTypes = [
  { value: "regular", label: "Regular" },
  { value: "emergency", label: "Emergency" },
  { value: "follow_up", label: "Follow Up" },
];

/**
 * Status options
 */
const statusOptions = [
  { value: "scheduled", label: "Scheduled" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked In" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

/**
 * Source options
 */
const sourceOptions = [
  { value: "walk_in", label: "Walk-in" },
  { value: "phone", label: "Phone" },
  { value: "website", label: "Website" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "referral", label: "Referral" },
];

const EditAppointmentModal = ({ open, onClose, appointment, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: null,
    timeSlot: "",
    type: "regular",
    status: "scheduled",
    reason: "",
    notes: "",
    opdFee: 300,
    opdFeePaid: false,
    source: "walk_in",
  });
  const { updateAppointment, isUpdating } = useAppointmentMutations();

  // Populate form when appointment changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        date: appointment.date ? dayjs(appointment.date) : null,
        timeSlot: appointment.timeSlot || "",
        type: appointment.type || "regular",
        status: appointment.status || "scheduled",
        reason: appointment.reason || "",
        notes: appointment.notes || "",
        opdFee: appointment.opdFee || 300,
        opdFeePaid: appointment.opdFeePaid || false,
        source: appointment.source || "walk_in",
      });
    }
  }, [appointment]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSwitchChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.checked,
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }
    if (!formData.timeSlot) {
      toast.error("Please select a time slot");
      return;
    }

    const updateData = {
      date: formData.date.toISOString(),
      timeSlot: formData.timeSlot,
      type: formData.type,
      status: formData.status,
      reason: formData.reason,
      notes: formData.notes,
      opdFee: Number(formData.opdFee),
      opdFeePaid: formData.opdFeePaid,
      source: formData.source,
    };

    updateAppointment(
      { id: appointment._id, data: updateData },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to update appointment");
        },
      }
    );
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  if (!appointment) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "rounded-xl" }}
      >
        {/* Header */}
        <DialogTitle className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-2">
              <EditIcon />
              <Typography variant="h6" className="font-bold">
                Edit Appointment - {appointment.appointmentNumber}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} disabled={isUpdating}>
              <CloseIcon className="text-white" />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Content */}
        <DialogContent className="p-6">
          {/* Patient & Clinic Info (Read-only) */}
          <Box className="bg-gray-50 rounded-lg p-4 mb-8 mt-5">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-1">
                  Patient
                </Typography>
                <Typography variant="body2">
                  {appointment.patient?.name || "Unknown"} - {appointment.patient?.phone || "-"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-1">
                  Clinic
                </Typography>
                <Typography variant="body2">
                  {appointment.clinic?.name || "Not assigned"}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {/* Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <DatePicker
                label="Date *"
                value={formData.date}
                onChange={(newValue) => setFormData((prev) => ({ ...prev, date: newValue }))}
                slotProps={{
                  textField: { fullWidth: true, size: "small" },
                }}
                minDate={dayjs()}
              />
            </Grid>

            {/* Time Slot */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Time Slot *"
                value={formData.timeSlot}
                onChange={handleChange("timeSlot")}
                size="small"
              >
                {timeSlots.map((slot) => (
                  <MenuItem key={slot} value={slot}>
                    {slot}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Type */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Appointment Type"
                value={formData.type}
                onChange={handleChange("type")}
                size="small"
              >
                {appointmentTypes.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Status"
                value={formData.status}
                onChange={handleChange("status")}
                size="small"
              >
                {statusOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Source */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Booking Source"
                value={formData.source}
                onChange={handleChange("source")}
                size="small"
              >
                {sourceOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* OPD Fee */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="OPD Fee (₹)"
                type="number"
                value={formData.opdFee}
                onChange={handleChange("opdFee")}
                size="small"
              />
            </Grid>

            {/* OPD Fee Paid */}
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.opdFeePaid}
                    onChange={handleSwitchChange("opdFeePaid")}
                    color="success"
                  />
                }
                label="OPD Fee Paid"
              />
            </Grid>

            {/* Reason */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Reason for Visit"
                value={formData.reason}
                onChange={handleChange("reason")}
                multiline
                rows={2}
                size="small"
              />
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={handleChange("notes")}
                multiline
                rows={2}
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        {/* Actions */}
        <DialogActions className="p-4 bg-gray-50">
          <Button onClick={handleClose} color="inherit" disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isUpdating}
            className="bg-indigo-600 hover:bg-indigo-700"
            startIcon={isUpdating ? <CircularProgress size={16} /> : <EditIcon />}
          >
            {isUpdating ? "Updating..." : "Update Appointment"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EditAppointmentModal;
