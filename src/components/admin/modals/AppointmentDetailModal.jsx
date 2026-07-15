/**
 * Appointment Detail Modal
 *
 * Displays complete appointment information.
 * Compact detail modal layout v2 — banner + section grouping fixes — 2026-07-04
 */
import React, { useState } from "react";
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
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
import LockIcon from "@mui/icons-material/Lock";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import api from "../../../api/axios";
import ConfirmDialog from "../../common/ConfirmDialog";
import CollectPaymentModal from "./CollectPaymentModal";

/**
 * Info row — single-line inline: [icon] [label] [value]
 */
const InfoRow = ({ icon: Icon, label, value, color = "text-gray-500" }) => (
  <Box className="flex items-center gap-2 py-0.5">
    {Icon && <Icon className={color} sx={{ fontSize: 14 }} />}
    <Typography variant="caption" className="text-gray-600 shrink-0" sx={{ minWidth: 100 }}>
      {label}
    </Typography>
    <Typography
      variant="caption"
      className="font-semibold text-gray-900 truncate"
      title={typeof value === "string" ? value : undefined}
    >
      {value || "-"}
    </Typography>
  </Box>
);

/**
 * Section title — compact uppercase label with strong contrast
 */
const SectionTitle = ({ children, className = "" }) => (
  <Typography
    variant="caption"
    className={`text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1.5 block ${className}`}
  >
    {children}
  </Typography>
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

const treatmentStatusColors = {
  active: "primary",
  completed: "success",
  closed_early: "warning",
  abandoned: "error",
};

const treatmentStatusLabels = {
  active: "Active",
  completed: "Completed",
  closed_early: "Closed Early",
  abandoned: "Abandoned",
};

const AppointmentDetailModal = ({ open, onClose, appointment, onEdit, onCancel, onDelete, onRenew, onCloneTreatment }) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [collectPaymentOpen, setCollectPaymentOpen] = useState(false);
  const [closeTreatmentOpen, setCloseTreatmentOpen] = useState(false);
  const [closeResolution, setCloseResolution] = useState("completed");
  const [closeReason, setCloseReason] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState("");

  if (!appointment) return null;

  const isSession = appointment.visitType === "treatment_session";
  const isParentTreatment = appointment.visitType === "treatment";
  const alreadyClosed = ["completed", "closed_early", "abandoned"].includes(appointment.treatmentStatus);
  const canCloseTreatment =
    isParentTreatment &&
    !alreadyClosed &&
    appointment.status !== "cancelled";

  const canCollectSessionPayment =
    isSession &&
    appointment.invoice &&
    (appointment.invoice.paymentStatus === "unpaid" || appointment.invoice.paymentStatus === "partial");

  const handleCloseTreatmentSubmit = async () => {
    if (!closeReason.trim()) {
      setCloseError("Reason is required.");
      return;
    }
    setCloseLoading(true);
    setCloseError("");
    try {
      await api.post(`/appointments/${appointment._id}/close-treatment`, {
        resolution: closeResolution,
        reason: closeReason.trim(),
      });
      setCloseTreatmentOpen(false);
      setCloseReason("");
      setCloseResolution("completed");
      onClose();
    } catch (err) {
      setCloseError(err?.response?.data?.message || "Failed to close treatment plan.");
    } finally {
      setCloseLoading(false);
    }
  };

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
    invoice,
    paymentStatus,
    source,
    createdAt,
    cancellation,
    payment,
  } = appointment;

  const patientName = patient?.name || "Unknown Patient";
  const patientPhone = patient?.phone || "-";

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ className: "rounded-xl" }}
    >
      {/* Header — slim strip */}
      <DialogTitle className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white p-0">
        <Box className="flex items-center justify-between px-4 py-2">
          <Box className="flex items-center gap-3">
            <Avatar className="bg-white text-indigo-600 w-10 h-10">
              <EventIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="h6" component="span" className="font-bold leading-tight">
                {appointmentNumber || "Appointment"}
              </Typography>
              <Box className="flex items-center gap-2 mt-0.5">
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
                {isParentTreatment && appointment.treatmentStatus && (
                  <Chip
                    label={treatmentStatusLabels[appointment.treatmentStatus] || appointment.treatmentStatus}
                    size="small"
                    color={treatmentStatusColors[appointment.treatmentStatus] || "default"}
                    icon={alreadyClosed ? <LockIcon sx={{ fontSize: "12px !important" }} /> : undefined}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon className="text-white" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent className="p-5 mt-3">
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Patient Info */}
            <SectionTitle>Patient Information</SectionTitle>
            <Box className="bg-gray-50/60 rounded px-3 py-2 mb-2">
              <InfoRow icon={PersonIcon} label="Patient Name" value={patientName} color="text-indigo-500" />
              <InfoRow icon={PhoneIcon} label="Phone" value={patientPhone} color="text-indigo-500" />
            </Box>

            {/* Appointment Details */}
            <SectionTitle>Appointment Details</SectionTitle>
            <Box className="bg-gray-50/60 rounded px-3 py-2 mb-2">
              <InfoRow icon={EventIcon} label="Date" value={formatDate(date)} />
              <InfoRow icon={AccessTimeIcon} label="Time Slot" value={timeSlot} />
              <InfoRow icon={ConfirmationNumberIcon} label="Token Number" value={`#${tokenNumber}`} />
              <InfoRow icon={LocalHospitalIcon} label="Reason" value={reason} />
            </Box>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            {/* Timing Info */}
            <SectionTitle>Timing Information</SectionTitle>
            <Box className="bg-gray-50/60 rounded px-3 py-2 mb-2">
              <InfoRow label="Check-in Time" value={checkInTime ? formatTime(checkInTime) : "Not checked in"} />
              <InfoRow label="Start Time" value={startTime ? formatTime(startTime) : "Not started"} />
              <InfoRow label="End Time" value={endTime ? formatTime(endTime) : "Not ended"} />
            </Box>

            {/* Payment & Source */}
            <SectionTitle>Payment & Source</SectionTitle>
            <Box className="bg-gray-50/60 rounded px-3 py-2 mb-2">
              <Box className="flex justify-between items-center py-1">
                <Typography variant="caption" className="text-gray-600">
                  {(isParentTreatment || isSession) ? "Treatment Fee" : "Appointment Fee"}
                </Typography>
                {isFree ? (
                  <Chip label="Free" size="small" color="info" />
                ) : invoice ? (
                  <Typography variant="caption" className="font-numbers font-semibold text-gray-900">
                    ₹{(invoice.amountPaid || 0).toLocaleString("en-IN")} / ₹{(invoice.grandTotal || 0).toLocaleString("en-IN")}
                  </Typography>
                ) : (
                  <Typography variant="caption" className="font-numbers font-semibold text-gray-900">₹{opdFee || 300}</Typography>
                )}
              </Box>
              <Box className="flex justify-between items-center py-1">
                <Typography variant="caption" className="text-gray-600">Payment Status</Typography>
                {isFree ? (
                  <Chip label="N/A" size="small" variant="outlined" />
                ) : (() => {
                  const invPs = invoice?.paymentStatus;
                  if (invPs === "paid" || paymentStatus === "paid") {
                    return <Chip label="Paid" size="small" color="success" />;
                  }
                  if (invPs === "partial") {
                    return <Chip label="Partially Paid" size="small" color="warning" />;
                  }
                  if (opdFeePaid) {
                    return <Chip label="Paid" size="small" color="success" />;
                  }
                  return <Chip label="Unpaid" size="small" color="error" />;
                })()}
              </Box>
              {payment && (
                <>
                  <Box className="flex justify-between items-center py-1">
                    <Typography variant="caption" className="text-gray-600">Payment ID</Typography>
                    <Typography variant="caption" className="font-mono font-semibold text-gray-900">
                      {payment.paymentNumber || payment.razorpayPaymentId || "-"}
                    </Typography>
                  </Box>
                  <Box className="flex justify-between items-center py-1">
                    <Typography variant="caption" className="text-gray-600">Payment Mode</Typography>
                    <Chip
                      label={payment.paymentMode?.toUpperCase() || "ONLINE"}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                  {payment.paidAt && (
                    <Box className="flex justify-between items-center py-1">
                      <Typography variant="caption" className="text-gray-600">Paid On</Typography>
                      <Typography variant="caption" className="font-semibold text-gray-900">
                        {formatDate(payment.paidAt)}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
              <Box className="flex justify-between items-center py-1">
                <Typography variant="caption" className="text-gray-600">Booking Source</Typography>
                <Chip label={source?.replace("_", " ") || "Walk-in"} size="small" variant="outlined" />
              </Box>
            </Box>

            {/* Notes */}
            {notes && (
              <>
                <SectionTitle>Notes</SectionTitle>
                <Box className="bg-yellow-50 rounded px-3 py-2 border border-yellow-200 mb-2">
                  <Typography variant="caption">{notes}</Typography>
                </Box>
              </>
            )}

            {/* Treatment Payment Status — session appointments only */}
            {isSession && appointment.invoice && (
              <>
                <SectionTitle>Treatment Payment Status</SectionTitle>
                <Box
                  sx={{
                    border: "1px solid #bbf7d0",
                    borderRadius: 1.5,
                    px: 2,
                    py: 1.5,
                    mb: 2,
                    backgroundColor: "#f0fdf4",
                  }}
                >
                  <Box className="flex justify-between items-center">
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#065f46" }}>
                      {appointment.invoice.invoiceNumber}
                    </Typography>
                    <Chip
                      label={appointment.invoice.paymentStatus === "paid" ? "Paid" : appointment.invoice.paymentStatus === "partial" ? "Partial" : "Unpaid"}
                      size="small"
                      color={appointment.invoice.paymentStatus === "paid" ? "success" : appointment.invoice.paymentStatus === "partial" ? "warning" : "error"}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mt: 0.5 }}>
                    Total: ₹{(appointment.invoice.grandTotal || 0).toLocaleString("en-IN")} · Paid: ₹{(appointment.invoice.amountPaid || 0).toLocaleString("en-IN")}
                  </Typography>
                  {appointment.invoice.balanceDue > 0 && (
                    <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 700, display: "block", mt: 0.25 }}>
                      ₹{(appointment.invoice.balanceDue || 0).toLocaleString("en-IN")} outstanding
                    </Typography>
                  )}
                </Box>
              </>
            )}

            {/* Cancellation Info */}
            {status === "cancelled" && cancellation && (
              <>
                <Typography
                  variant="caption"
                  className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-1.5 block"
                >
                  Cancellation Details
                </Typography>
                <Box className="bg-red-50 rounded px-3 py-2 border border-red-200">
                  <Typography variant="caption" className="text-red-700 block">
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
        <Divider className="my-2" />
        <Box className="flex justify-between">
          <Typography variant="caption" className="text-gray-600">
            Created: {formatDate(createdAt)}{createdAt ? `, ${formatTime(createdAt)}` : ""}
          </Typography>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions className="p-3 bg-gray-50 justify-between">
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
              onClick={() => setDeleteConfirmOpen(true)}
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
          {onCloneTreatment && isParentTreatment && alreadyClosed && (
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={() => onCloneTreatment(appointment)}
            >
              Clone Treatment
            </Button>
          )}
          {canCloseTreatment && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<LockIcon />}
              onClick={() => setCloseTreatmentOpen(true)}
            >
              Close Treatment Plan
            </Button>
          )}
          {canCollectSessionPayment && (
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => setCollectPaymentOpen(true)}
              sx={{
                textTransform: "none",
                backgroundColor: "#059669",
                "&:hover": { backgroundColor: "#047857" },
              }}
            >
              Collect Session Payment
            </Button>
          )}
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

    <ConfirmDialog
      open={deleteConfirmOpen}
      onClose={() => setDeleteConfirmOpen(false)}
      onConfirm={() => { setDeleteConfirmOpen(false); onDelete(appointment); }}
      title="Delete Appointment"
      message="Permanently delete this appointment? This cannot be undone."
      confirmText="Delete Permanently"
      confirmColor="error"
    />

    {collectPaymentOpen && appointment.invoice && (
      <CollectPaymentModal
        open={collectPaymentOpen}
        onClose={() => setCollectPaymentOpen(false)}
        invoice={appointment.invoice}
        patient={appointment.patient}
        onSuccess={() => {
          setCollectPaymentOpen(false);
          onClose();
        }}
      />
    )}

    {/* Close Treatment Plan dialog */}
    <Dialog
      open={closeTreatmentOpen}
      onClose={() => { if (!closeLoading) { setCloseTreatmentOpen(false); setCloseError(""); } }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LockIcon color="warning" fontSize="small" />
        Close Treatment Plan
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This will cancel all remaining scheduled sessions and formally close the treatment plan.
          This action cannot be undone.
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Resolution</InputLabel>
          <Select
            value={closeResolution}
            label="Resolution"
            onChange={(e) => setCloseResolution(e.target.value)}
            disabled={closeLoading}
          >
            <MenuItem value="completed">Completed — all planned sessions done</MenuItem>
            <MenuItem value="write_off">Write Off — close and waive outstanding balance</MenuItem>
            <MenuItem value="refund">Refund — patient requests refund (admin handles separately)</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Reason *"
          multiline
          rows={3}
          fullWidth
          size="small"
          value={closeReason}
          onChange={(e) => { setCloseReason(e.target.value); if (closeError) setCloseError(""); }}
          disabled={closeLoading}
          placeholder="Briefly explain why this treatment plan is being closed…"
          error={!!closeError && !closeReason.trim()}
        />
        {closeError && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
            {closeError}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => { setCloseTreatmentOpen(false); setCloseError(""); }}
          color="inherit"
          disabled={closeLoading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={closeLoading ? <CircularProgress size={14} color="inherit" /> : <LockIcon />}
          onClick={handleCloseTreatmentSubmit}
          disabled={closeLoading || !closeReason.trim()}
        >
          {closeLoading ? "Closing…" : "Confirm Close"}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default AppointmentDetailModal;
