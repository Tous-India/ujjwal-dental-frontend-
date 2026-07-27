/**
 * Treatment Plan Detail Modal
 *
 * Focused detail view for a single collapsed treatment-plan row (Treatments
 * tab, Phase 2). Deliberately separate from AppointmentDetailModal (OPD rows,
 * untouched) and from TreatmentDetailModal (treatment-catalog type detail,
 * a different feature entirely — name collision avoided on purpose).
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
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentsIcon from "@mui/icons-material/Payments";
import LinkIcon from "@mui/icons-material/Link";
import SaveIcon from "@mui/icons-material/Save";
import api from "../../../api/axios";
import { useAppointments, useAppointmentMutations } from "../../../hooks/admin/useAppointments";
import { usePayments } from "../../../hooks/admin/usePayments";

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const treatmentStatusColors = {
  completed: "success",
  closed_early: "warning",
  abandoned: "error",
};
const treatmentStatusLabels = {
  completed: "Completed",
  closed_early: "Closed Early",
  abandoned: "Abandoned",
};

const SectionTitle = ({ children }) => (
  <Typography
    variant="caption"
    className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1.5 block"
  >
    {children}
  </Typography>
);

const TreatmentPlanDetailModal = ({ open, onClose, appointment, onCloneTreatment, onBookNextSession, onRefetch }) => {
  const [sessionsPlannedInput, setSessionsPlannedInput] = useState("");
  const [savingSessions, setSavingSessions] = useState(false);

  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [closeResolution, setCloseResolution] = useState("completed");
  const [closeReason, setCloseReason] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState("");

  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [reopenError, setReopenError] = useState("");

  const [markingCompleteId, setMarkingCompleteId] = useState(null);
  const [collectDialogSession, setCollectDialogSession] = useState(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMode, setCollectMode] = useState("cash");
  const [collectLoading, setCollectLoading] = useState(false);
  const [collectError, setCollectError] = useState("");

  const { updateAppointment, reopenTreatment, isReopeningTreatment } = useAppointmentMutations();

  // Session timeline — reuses the existing appointments list endpoint (search
  // by phone + visitType filter, both already-supported query params) rather
  // than adding a new backend `parentAppointment` filter. Filtered client-side
  // down to this treatment's own children.
  const patientPhone = appointment?.patient?.phone;
  const { data: historyData, refetch: refetchSessions } = useAppointments(
    { visitType: "treatment,treatment_session", search: patientPhone || "", limit: 100 },
    { enabled: open && !!patientPhone }
  );
  const sessionRows = (historyData?.data || [])
    .filter((a) => a._id === appointment?._id || a.parentAppointment === appointment?._id)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Per-session collected amount -- each Payment is linked to the SPECIFIC
  // appointment it was collected for (payment.appointment), never the
  // invoice's shared cumulative total (which is identical across every
  // session on the same treatment and was the source of Bug 1).
  const patientId = appointment?.patient?._id;
  const { data: paymentsData, refetch: refetchPayments } = usePayments(
    { patient: patientId, limit: 200 },
    { enabled: open && !!patientId }
  );
  const collectedBySession = {};
  (paymentsData?.data || []).forEach((p) => {
    if (!p.appointment) return;
    const apptId = typeof p.appointment === "string" ? p.appointment : p.appointment._id;
    collectedBySession[apptId] = (collectedBySession[apptId] || 0) + (p.amount || 0);
  });

  const refreshAll = () => {
    refetchSessions();
    refetchPayments();
    onRefetch?.();
  };

  if (!appointment) return null;

  const alreadyClosed = !!appointment.treatmentStatus;
  const patientName = appointment.patient?.name || "Unknown Patient";

  const handleSaveSessionsPlanned = () => {
    const n = Number(sessionsPlannedInput);
    if (!sessionsPlannedInput || !Number.isFinite(n) || n <= 0) {
      toast.error("Enter a valid number of sessions.");
      return;
    }
    setSavingSessions(true);
    updateAppointment(
      { id: appointment._id, data: { sessionsPlanned: n } },
      {
        onSuccess: () => {
          toast.success("Sessions planned updated.");
          refreshAll();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to update sessions planned"),
        onSettled: () => setSavingSessions(false),
      }
    );
  };

  const handleMarkSessionComplete = (session) => {
    setMarkingCompleteId(session._id);
    updateAppointment(
      { id: session._id, data: { status: "completed" } },
      {
        onSuccess: () => {
          toast.success("Session marked complete.");
          refreshAll();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to mark session complete"),
        onSettled: () => setMarkingCompleteId(null),
      }
    );
  };

  const handleCollectPaymentSubmit = async () => {
    const amt = Number(collectAmount);
    if (!amt || amt <= 0) {
      setCollectError("Enter a valid amount.");
      return;
    }
    setCollectLoading(true);
    setCollectError("");
    try {
      await api.post("/payments/admin/collect", {
        invoiceId: appointment.invoice?._id,
        amount: amt,
        mode: collectMode,
        appointmentId: collectDialogSession._id,
      });
      toast.success("Payment collected.");
      setCollectDialogSession(null);
      setCollectAmount("");
      refreshAll();
    } catch (err) {
      setCollectError(err?.response?.data?.message || "Failed to collect payment.");
    } finally {
      setCollectLoading(false);
    }
  };

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
      toast.success("Treatment plan closed.");
      setCloseDialogOpen(false);
      setCloseReason("");
      setCloseResolution("completed");
      refreshAll();
      onClose();
    } catch (err) {
      setCloseError(err?.response?.data?.message || "Failed to close treatment plan.");
    } finally {
      setCloseLoading(false);
    }
  };

  const handleReopenSubmit = () => {
    if (!reopenReason.trim() || reopenReason.trim().length < 10) {
      setReopenError("Reason must be at least 10 characters.");
      return;
    }
    reopenTreatment(
      { id: appointment._id, reason: reopenReason.trim() },
      {
        onSuccess: () => {
          toast.success("Treatment reopened.");
          setReopenDialogOpen(false);
          setReopenReason("");
          setReopenError("");
          refreshAll();
        },
        onError: (err) => setReopenError(err.response?.data?.message || "Failed to reopen treatment"),
      }
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ className: "rounded-xl" }}>
        <DialogTitle className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white p-0">
          <Box className="flex items-center justify-between px-4 py-2">
            <Box className="flex items-center gap-3">
              <Avatar className="bg-white text-indigo-600 w-10 h-10">
                <LocalHospitalIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="h6" component="span" className="font-bold leading-tight">
                  {appointment.treatmentName || "Treatment Plan"}
                </Typography>
                <Box className="flex items-center gap-2 mt-0.5">
                  <Chip
                    label={alreadyClosed ? (treatmentStatusLabels[appointment.treatmentStatus] || "Completed") : "Active"}
                    size="small"
                    color={alreadyClosed ? (treatmentStatusColors[appointment.treatmentStatus] || "success") : "primary"}
                  />
                </Box>
              </Box>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon className="text-white" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent className="p-5 mt-3">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionTitle>Patient Information</SectionTitle>
              <Box className="bg-gray-50/60 rounded px-3 py-2 mb-3">
                <Box className="flex items-center gap-2 py-0.5">
                  <PersonIcon className="text-indigo-500" sx={{ fontSize: 14 }} />
                  <Typography variant="caption" className="font-semibold text-gray-900">{patientName}</Typography>
                </Box>
                <Box className="flex items-center gap-2 py-0.5">
                  <PhoneIcon className="text-indigo-500" sx={{ fontSize: 14 }} />
                  <Typography variant="caption" className="font-semibold text-gray-900">{appointment.patient?.phone || "-"}</Typography>
                </Box>
                <Box className="flex items-center gap-2 py-0.5">
                  <LinkIcon className="text-indigo-500" sx={{ fontSize: 14 }} />
                  <Typography variant="caption" className="text-gray-600">
                    {appointment.originatingOpdAppointment?.appointmentNumber
                      ? `Linked OPD Visit: ${appointment.originatingOpdAppointment.appointmentNumber}`
                      : "No OPD visit linked"}
                  </Typography>
                </Box>
              </Box>

              <SectionTitle>Billing</SectionTitle>
              <Box className="bg-gray-50/60 rounded px-3 py-2 mb-3">
                {appointment.invoice?.items?.length > 0 && (
                  <Box className="mb-2">
                    {appointment.invoice.items.map((item, i) => (
                      <Box key={i} className="flex justify-between py-0.5">
                        <Typography variant="caption" className="text-gray-600">
                          {item.description}{item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </Typography>
                        <Typography variant="caption" className="font-numbers">
                          ₹{(item.unitPrice || 0).toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                    ))}
                    {(appointment.invoice.discount?.percentage > 0 || appointment.invoice.discount?.amount > 0) && (
                      <Box className="flex justify-between py-0.5">
                        <Typography variant="caption" className="text-gray-600">Discount</Typography>
                        <Typography variant="caption" className="font-numbers text-red-600">
                          {appointment.invoice.discount.percentage > 0
                            ? `${appointment.invoice.discount.percentage}%`
                            : `₹${appointment.invoice.discount.amount}`}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 0.75 }} />
                  </Box>
                )}
                <Box className="flex justify-between py-0.5">
                  <Typography variant="caption" className="text-gray-600">Total Fee</Typography>
                  <Typography variant="caption" className="font-numbers font-semibold">
                    ₹{(appointment.invoice?.grandTotal ?? appointment.fee ?? 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box className="flex justify-between py-0.5">
                  <Typography variant="caption" className="text-gray-600">Amount Paid</Typography>
                  <Typography variant="caption" className="font-numbers font-semibold text-green-700">
                    ₹{(appointment.invoice?.amountPaid ?? 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box className="flex justify-between py-0.5">
                  <Typography variant="caption" className="text-gray-600">Balance Due</Typography>
                  <Typography variant="caption" className="font-numbers font-semibold text-red-600">
                    ₹{(appointment.invoice?.balanceDue ?? 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Box>

              <SectionTitle>Sessions Planned</SectionTitle>
              <Box className="bg-gray-50/60 rounded px-3 py-2 mb-3 flex items-center gap-2">
                <TextField
                  size="small"
                  type="number"
                  placeholder={appointment.sessionsPlanned ? String(appointment.sessionsPlanned) : "Not set"}
                  value={sessionsPlannedInput}
                  onChange={(e) => setSessionsPlannedInput(e.target.value)}
                  inputProps={{ min: 1, max: 50 }}
                  sx={{ width: 120 }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={savingSessions ? <CircularProgress size={12} /> : <SaveIcon fontSize="small" />}
                  onClick={handleSaveSessionsPlanned}
                  disabled={savingSessions}
                >
                  Save
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <SectionTitle>Session Timeline</SectionTitle>
              <Box className="bg-gray-50/60 rounded px-3 py-2 mb-3" sx={{ maxHeight: 260, overflowY: "auto" }}>
                {sessionRows.length === 0 ? (
                  <Typography variant="caption" className="text-gray-500">No sessions booked yet.</Typography>
                ) : (
                  sessionRows.map((s) => {
                    const collected = collectedBySession[s._id] || 0;
                    const isCompleted = s.status === "completed";
                    return (
                      <Box key={s._id} className="flex justify-between items-center gap-1 py-1 border-b border-gray-100 last:border-0">
                        <Typography variant="caption" className="font-semibold">
                          {s.visitType === "treatment" ? "Session 1" : `Session ${s.sessionNumber || "?"}`}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">{formatDate(s.date)}</Typography>
                        <Typography variant="caption" className="font-numbers">
                          ₹{collected.toLocaleString("en-IN")}
                        </Typography>
                        <Chip label={s.status?.replace("_", " ") || "-"} size="small" variant="outlined" sx={{ fontSize: "10px" }} />
                        <Box className="flex items-center gap-0.5">
                          {!isCompleted && (
                            <Tooltip title="Mark Complete">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleMarkSessionComplete(s)}
                                  disabled={markingCompleteId === s._id}
                                >
                                  {markingCompleteId === s._id ? (
                                    <CircularProgress size={14} />
                                  ) : (
                                    <CheckCircleIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          {(appointment.invoice?.balanceDue || 0) > 0 && (
                            <Tooltip title="Collect Payment">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setCollectDialogSession(s);
                                  setCollectAmount("");
                                  setCollectMode("cash");
                                  setCollectError("");
                                }}
                              >
                                <PaymentsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    );
                  })
                )}
              </Box>

              <SectionTitle>Treatment History</SectionTitle>
              <Box className="bg-gray-50/60 rounded px-3 py-2 mb-3" sx={{ maxHeight: 160, overflowY: "auto" }}>
                {!appointment.treatmentHistory?.length ? (
                  <Typography variant="caption" className="text-gray-500">No history recorded.</Typography>
                ) : (
                  [...appointment.treatmentHistory].reverse().map((h, i) => (
                    <Box key={i} className="py-1 border-b border-gray-100 last:border-0">
                      <Box className="flex justify-between">
                        <Typography variant="caption" className="font-semibold capitalize">{h.action}{h.resolution ? ` — ${h.resolution.replace("_", " ")}` : ""}</Typography>
                        <Typography variant="caption" className="text-gray-500">{formatDate(h.performedAt)}</Typography>
                      </Box>
                      {h.reason && <Typography variant="caption" className="text-gray-600 block">{h.reason}</Typography>}
                    </Box>
                  ))
                )}
              </Box>
            </Grid>
          </Grid>
          <Divider className="my-2" />
        </DialogContent>

        <DialogActions className="p-3 bg-gray-50 justify-end">
          <Box className="flex gap-2">
            {!alreadyClosed && (
              <Button
                variant="outlined"
                startIcon={<EventRepeatIcon />}
                onClick={() =>
                  onBookNextSession?.(appointment, { nextSessionNumber: sessionRows.length + 1 })
                }
              >
                Book Next Session
              </Button>
            )}
            {!alreadyClosed && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<LockIcon />}
                onClick={() => setCloseDialogOpen(true)}
              >
                Mark Complete
              </Button>
            )}
            {alreadyClosed && (
              <Button
                variant="outlined"
                color="success"
                startIcon={<LockOpenIcon />}
                onClick={() => setReopenDialogOpen(true)}
              >
                Reopen Treatment
              </Button>
            )}
            {alreadyClosed && (
              <Button
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => onCloneTreatment?.(appointment)}
              >
                Clone Treatment
              </Button>
            )}
            <Button onClick={onClose} color="inherit">Close</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Mark Complete (close-treatment) dialog — mirrors AppointmentDetailModal's */}
      <Dialog
        open={closeDialogOpen}
        onClose={() => { if (!closeLoading) { setCloseDialogOpen(false); setCloseError(""); } }}
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
          <Button onClick={() => { setCloseDialogOpen(false); setCloseError(""); }} color="inherit" disabled={closeLoading}>
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

      {/* Reopen Treatment dialog */}
      <Dialog
        open={reopenDialogOpen}
        onClose={() => { if (!isReopeningTreatment) { setReopenDialogOpen(false); setReopenError(""); } }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LockOpenIcon color="success" fontSize="small" />
          Reopen Treatment
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This clears the closed status so new sessions can be booked again. A reason of at least
            10 characters is required for the audit trail.
          </Typography>
          <TextField
            label="Reason *"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={reopenReason}
            onChange={(e) => { setReopenReason(e.target.value); if (reopenError) setReopenError(""); }}
            disabled={isReopeningTreatment}
            placeholder="Briefly explain why this treatment is being reopened…"
            error={!!reopenError}
            helperText={reopenError || `${reopenReason.trim().length}/10 minimum`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setReopenDialogOpen(false); setReopenError(""); }} color="inherit" disabled={isReopeningTreatment}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={isReopeningTreatment ? <CircularProgress size={14} color="inherit" /> : <LockOpenIcon />}
            onClick={handleReopenSubmit}
            disabled={isReopeningTreatment || reopenReason.trim().length < 10}
          >
            {isReopeningTreatment ? "Reopening…" : "Confirm Reopen"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collect Payment dialog -- post-hoc, per-session collection */}
      <Dialog
        open={!!collectDialogSession}
        onClose={() => { if (!collectLoading) { setCollectDialogSession(null); setCollectError(""); } }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Collect Payment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Recording a payment for{" "}
            {collectDialogSession?.visitType === "treatment" ? "Session 1" : `Session ${collectDialogSession?.sessionNumber || "?"}`}
            . Balance due: ₹{(appointment.invoice?.balanceDue || 0).toLocaleString("en-IN")}
          </Typography>
          <TextField
            label="Amount *"
            type="number"
            fullWidth
            size="small"
            value={collectAmount}
            onChange={(e) => { setCollectAmount(e.target.value); if (collectError) setCollectError(""); }}
            disabled={collectLoading}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth size="small">
            <InputLabel>Mode</InputLabel>
            <Select
              value={collectMode}
              label="Mode"
              onChange={(e) => setCollectMode(e.target.value)}
              disabled={collectLoading}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </Select>
          </FormControl>
          {collectError && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
              {collectError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setCollectDialogSession(null); setCollectError(""); }} color="inherit" disabled={collectLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCollectPaymentSubmit}
            disabled={collectLoading}
            startIcon={collectLoading ? <CircularProgress size={14} color="inherit" /> : null}
          >
            {collectLoading ? "Collecting…" : "Collect Payment"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TreatmentPlanDetailModal;
