/**
 * Appointment Detail Modal
 *
 * Displays complete appointment information.
 */
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";

/**
 * Info row component
 */
const InfoRow = ({ icon: Icon, label, value, color = "text-gray-600" }) => (
  <Box className="flex items-start gap-3 py-2">
    {Icon && <Icon className={`${color} mt-0.5`} fontSize="small" />}
    <Box>
      <Typography variant="caption" className="text-gray-500 block">
        {label}
      </Typography>
      <Typography variant="body2" className="font-medium">
        {value || "-"}
      </Typography>
    </Box>
  </Box>
);

/**
 * Format date
 */
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format time
 */
const formatTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Status color mapping
 */
const statusColors = {
  scheduled: "info",
  confirmed: "primary",
  checked_in: "warning",
  in_progress: "warning",
  completed: "success",
  cancelled: "error",
  no_show: "default",
};

/**
 * Type labels
 */
const typeLabels = {
  regular: "Regular",
  emergency: "Emergency",
  follow_up: "Follow-up",
};

const AppointmentDetailModal = ({ open, onClose, appointment, onEdit, onCancel, onDelete, onRenew }) => {
  if (!appointment) return null;

  const {
    appointmentNumber,
    patient,
    date,
    timeSlot,
    tokenNumber,
    type,
    status,
    reason,
    notes,
    checkInTime,
    startTime,
    endTime,
    opdFee,
    opdFeePaid,
    isFree,
    source,
    createdAt,
    cancellation,
    payment,
  } = appointment;

  const patientName = patient?.name || "Unknown Patient";
  const patientPhone = patient?.phone || "-";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ className: "rounded-xl" }}
    >
      {/* Header */}
      <DialogTitle className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white p-0">
        <Box className="flex items-center justify-between p-0">
          <Box className="flex items-center gap-4">
            <Avatar className="bg-white text-indigo-600 w-14 h-14">
              <EventIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" className="font-bold">
                {appointmentNumber || "Appointment"}
              </Typography>
              <Box className="flex items-center gap-2 mt-1">
                <Chip
                  label={status?.replace("_", " ").toUpperCase()}
                  size="small"
                  color={statusColors[status] || "default"}
                />
                <Chip
                  label={typeLabels[type] || type}
                  size="small"
                  variant="outlined"
                  className="text-white border-white"
                />
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon className="text-white" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent className="p-6 mt-8">
        <Grid container spacing={4}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Patient Info */}
            <Typography variant="subtitle2" className="font-semibold text-gray-700">
              Patient Information
            </Typography>
            <Box className="bg-gray-50 rounded-lg p-4 mb-4 mt-3">
              <InfoRow icon={PersonIcon} label="Patient Name" value={patientName} color="text-indigo-600" />
              <InfoRow icon={PhoneIcon} label="Phone" value={patientPhone} color="text-indigo-600" />
            </Box>

            {/* Appointment Details */}
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-3">
              Appointment Details
            </Typography>
            <Box className="bg-gray-50 rounded-lg p-4 mt-3">
              <InfoRow icon={EventIcon} label="Date" value={formatDate(date)} />
              <InfoRow icon={AccessTimeIcon} label="Time Slot" value={timeSlot} />
              <InfoRow icon={ConfirmationNumberIcon} label="Token Number" value={`#${tokenNumber}`} />
              <InfoRow icon={LocalHospitalIcon} label="Reason" value={reason} />
            </Box>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Timing Info */}
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-3">
              Timing Information
            </Typography>
            <Box className="bg-gray-50 rounded-lg p-4 mb-4 mt-3">
              <InfoRow label="Check-in Time" value={checkInTime ? formatTime(checkInTime) : "Not checked in"} />
              <InfoRow label="Start Time" value={startTime ? formatTime(startTime) : "Not started"} />
              <InfoRow label="End Time" value={endTime ? formatTime(endTime) : "Not ended"} />
            </Box>

            {/* Payment Info */}
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-3">
              Payment & Source
            </Typography>
            <Box className="bg-gray-50 rounded-lg p-4 mt-3 mb-3">
              <Box className="flex justify-between items-center py-2">
                <Typography variant="body2" className="text-gray-600">OPD Fee</Typography>
                {isFree ? (
                  <Chip label="Free" size="small" color="info" />
                ) : (
                  <Typography variant="body2" className="font-numbers font-medium">₹{opdFee || 300}</Typography>
                )}
              </Box>
              <Box className="flex justify-between items-center py-2">
                <Typography variant="body2" className="text-gray-600">Payment Status</Typography>
                {isFree ? (
                  <Chip label="N/A" size="small" variant="outlined" />
                ) : (
                  <Chip
                    label={opdFeePaid ? "Paid" : "Pending"}
                    size="small"
                    color={opdFeePaid ? "success" : "warning"}
                  />
                )}
              </Box>
              {payment && (
                <>
                  <Box className="flex justify-between items-center py-2">
                    <Typography variant="body2" className="text-gray-600">Payment ID</Typography>
                    <Typography variant="body2" className="font-mono font-medium text-xs">
                      {payment.paymentNumber || payment.razorpayPaymentId || "-"}
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center py-2">
                    <Typography variant="body2" className="text-gray-600">Payment Mode</Typography>
                    <Chip
                      label={payment.paymentMode?.toUpperCase() || "ONLINE"}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                  {payment.paidAt && (
                    <Box className="flex justify-between items-center py-2">
                      <Typography variant="body2" className="text-gray-600">Paid On</Typography>
                      <Typography variant="body2" className="font-medium">
                        {formatDate(payment.paidAt)}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
              <Box className="flex justify-between items-center py-2 ">
                <Typography variant="body2" className="text-gray-600">Booking Source</Typography>
                <Chip label={source?.replace("_", " ") || "Walk-in"} size="small" variant="outlined" />
              </Box>
            </Box>

            {/* Notes */}
            {notes && (
              <>
                <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-3">
                  Notes
                </Typography>
                <Box className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-5 mt-2">
                  <Typography variant="body2">{notes}</Typography>
                </Box>
              </>
            )}

            {/* Cancellation Info */}
            {status === "cancelled" && cancellation && (
              <>
                <Typography variant="subtitle2" className="font-semibold text-red-600 mb-3 mt-4">
                  Cancellation Details
                </Typography>
                <Box className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <Typography variant="body2" className="text-red-700">
                    Reason: {cancellation.reason || "No reason provided"}
                  </Typography>
                  <Typography variant="caption" className="text-red-500">
                    Cancelled on: {formatDate(cancellation.cancelledAt)}
                  </Typography>
                </Box>
              </>
            )}
          </Grid>
        </Grid>

        {/* Footer Info */}
        <Divider className="my-4" />
        <Box className="flex justify-between text-gray-400">
          <Typography variant="caption">Created: {formatDate(createdAt)}</Typography>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions className="p-4 bg-gray-50 justify-between">
        <Box className="flex gap-2">
          {/* Cancel — only for active appointments */}
          {onCancel && !["cancelled", "completed", "no_show"].includes(status) && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => onCancel(appointment)}
            >
              Cancel
            </Button>
          )}
          {/* Delete Permanently — always available for admin */}
          {onDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                if (window.confirm("Permanently delete this appointment? This cannot be undone.")) {
                  onDelete(appointment);
                }
              }}
            >
              Delete Permanently
            </Button>
          )}
          {/* Renew/Rebook — for cancelled/completed appointments */}
          {onRenew && ["cancelled", "completed", "no_show"].includes(status) && (
            <Button
              variant="outlined"
              color="success"
              onClick={() => onRenew(appointment)}
            >
              Rebook Appointment
            </Button>
          )}
        </Box>
        <Box className="flex gap-2">
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
          {onEdit && !["cancelled", "completed", "no_show"].includes(status) && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => onEdit(appointment)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Edit
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentDetailModal;
