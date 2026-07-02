/**
 * Reschedule Appointment Modal
 *
 * Allows admin/staff to change an appointment's date and time slot.
 * Payment, invoice, treatment, and all other fields are untouched.
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
  IconButton,
  CircularProgress,
  MenuItem,
  Alert,
} from "@mui/material";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import { useAppointmentMutations } from "../../../hooks/admin/useAppointments";
import { getAvailableSlots } from "../../../api/admin/appointments.api";

const todayStr = () => new Date().toISOString().split("T")[0];

const ALL_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30",
];

const RescheduleAppointmentModal = ({ open, onClose, appointment, onSuccess }) => {
  const [newDate, setNewDate] = useState(todayStr());
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [availableSlots, setAvailableSlots] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const { rescheduleAppointment, isRescheduling } = useAppointmentMutations();

  // Reset state when the modal opens for a new appointment
  useEffect(() => {
    if (open && appointment) {
      setNewDate(todayStr());
      setNewTimeSlot("");
      setReason("");
      setAvailableSlots(null);
    }
  }, [open, appointment]);

  // Fetch available slots when date changes (and clinic is known)
  useEffect(() => {
    const clinicId = appointment?.clinic?._id || appointment?.clinic;
    if (!newDate || !clinicId) {
      setAvailableSlots(null);
      return;
    }
    let active = true;
    setSlotsLoading(true);
    getAvailableSlots(clinicId, newDate)
      .then((res) => {
        if (!active) return;
        const slots = res?.data?.availableSlots || [];
        setAvailableSlots(slots);
        // Clear selected slot if no longer available on the new date
        setNewTimeSlot((prev) => (prev && !slots.includes(prev) ? "" : prev));
      })
      .catch(() => {
        if (active) setAvailableSlots(null);
      })
      .finally(() => {
        if (active) setSlotsLoading(false);
      });
    return () => { active = false; };
  }, [newDate, appointment]);

  const handleSubmit = () => {
    if (!newDate) {
      toast.error("Please select a new date");
      return;
    }
    if (!newTimeSlot) {
      toast.error("Please select a new time slot");
      return;
    }

    rescheduleAppointment(
      { id: appointment._id, data: { newDate, newTimeSlot, reason: reason.trim() || undefined } },
      {
        onSuccess: () => {
          toast.success("Appointment rescheduled successfully");
          onSuccess?.();
          handleClose();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to reschedule appointment");
        },
      }
    );
  };

  const handleClose = () => {
    if (!isRescheduling) {
      setNewDate(todayStr());
      setNewTimeSlot("");
      setReason("");
      setAvailableSlots(null);
      onClose();
    }
  };

  if (!appointment) return null;

  const currentDateStr = appointment.date
    ? new Date(appointment.date).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { className: "rounded-xl" } }}
    >
      {/* Header */}
      <DialogTitle className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-2">
            <EventRepeatIcon className="text-white" />
            <Typography variant="h6" component="span" className="font-bold text-white">
              Reschedule Appointment
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isRescheduling}>
            <CloseIcon className="text-white" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent className="p-6">
        <Box className="flex flex-col gap-5 mt-2">
          {/* Appointment info */}
          <Box className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <Typography variant="caption" className="text-gray-500 uppercase tracking-wide text-xs">
              Appointment
            </Typography>
            <Typography variant="body2" className="font-medium text-gray-800">
              {appointment.appointmentNumber} — {appointment.patient?.name || "Patient"}
            </Typography>
          </Box>

          {/* Current date + time (read-only) */}
          <Box className="flex gap-3">
            <Box className="flex-1">
              <Typography variant="caption" className="text-gray-500 text-xs uppercase tracking-wide mb-1 block">
                Current Date
              </Typography>
              <Box className="bg-gray-100 rounded px-3 py-2 border border-gray-200">
                <Typography variant="body2" className="text-gray-700 font-medium">
                  {currentDateStr}
                </Typography>
              </Box>
            </Box>
            <Box className="flex-1">
              <Typography variant="caption" className="text-gray-500 text-xs uppercase tracking-wide mb-1 block">
                Current Time
              </Typography>
              <Box className="bg-gray-100 rounded px-3 py-2 border border-gray-200">
                <Typography variant="body2" className="text-gray-700 font-medium">
                  {appointment.timeSlot || "—"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* New date picker */}
          <TextField
            label="New Date"
            type="date"
            value={newDate}
            onChange={(e) => {
              setNewDate(e.target.value);
              setNewTimeSlot("");
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: todayStr() }}
            fullWidth
            size="small"
            disabled={isRescheduling}
          />

          {/* New time slot */}
          <TextField
            label="New Time Slot"
            select
            value={newTimeSlot}
            onChange={(e) => setNewTimeSlot(e.target.value)}
            fullWidth
            size="small"
            disabled={isRescheduling || !newDate}
            helperText={
              slotsLoading
                ? "Loading available slots…"
                : Array.isArray(availableSlots)
                ? "Full slots are marked unavailable"
                : "Select a date first"
            }
          >
            <MenuItem value="">Select time slot</MenuItem>
            {ALL_SLOTS.map((slot) => {
              const unavailable =
                Array.isArray(availableSlots) && !availableSlots.includes(slot);
              return (
                <MenuItem key={slot} value={slot} disabled={unavailable}>
                  {slot}
                  {unavailable ? " — unavailable" : ""}
                </MenuItem>
              );
            })}
          </TextField>

          {/* Reason (optional) */}
          <TextField
            label="Reason for Rescheduling (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 200))}
            multiline
            rows={3}
            fullWidth
            size="small"
            placeholder="e.g. Patient requested a different day"
            helperText={`${reason.length}/200`}
            disabled={isRescheduling}
          />

          <Alert severity="info" sx={{ py: 0.5 }}>
            Only the date and time slot will change. Payment, invoice, and all other details remain untouched.
          </Alert>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions className="p-4 bg-gray-50">
        <Button onClick={handleClose} color="inherit" disabled={isRescheduling}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isRescheduling || !newDate || !newTimeSlot}
          sx={{ bgcolor: "#f97316", "&:hover": { bgcolor: "#ea580c" } }}
          startIcon={
            isRescheduling
              ? <CircularProgress size={16} color="inherit" />
              : <EventRepeatIcon />
          }
        >
          {isRescheduling ? "Rescheduling…" : "Reschedule"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RescheduleAppointmentModal;
