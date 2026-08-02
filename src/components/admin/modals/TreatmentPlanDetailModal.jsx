/**
 * Treatment Plan Detail Modal
 *
 * Focused detail view for a single collapsed treatment-plan row (Treatments
 * tab, Phase 2). Deliberately separate from AppointmentDetailModal (OPD rows,
 * untouched) and from TreatmentDetailModal (treatment-catalog type detail,
 * a different feature entirely — name collision avoided on purpose).
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../../api/axios";
import { useAppointments, useAppointmentMutations } from "../../../hooks/admin/useAppointments";
import { usePayments } from "../../../hooks/admin/usePayments";

// Same underlying itemType enum as AddAppointmentModal's treatment booking
// flow -- kept in sync intentionally (same billing categories server-side).
const treatmentItemTypeOptions = [
  { value: "treatment", label: "Treatment" },
  { value: "surgery", label: "Surgery" },
  { value: "test", label: "Test" },
  { value: "medicine", label: "Medicine" },
  { value: "other", label: "Other" },
];

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

  // Edit Treatment -- name/line items/discount, available throughout the
  // active lifecycle (locked once treatmentStatus is set, see alreadyClosed
  // gate below). Reuses AddAppointmentModal's treatment-items UI pattern.
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTreatmentName, setEditTreatmentName] = useState("");
  const [editItems, setEditItems] = useState([{ description: "", unitPrice: "", itemType: "treatment" }]);
  const [editDiscountPercent, setEditDiscountPercent] = useState(0);
  const [editItemsError, setEditItemsError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  // Server response after a successful edit -- the `appointment` prop is
  // owned by the parent page/modal and isn't guaranteed to be re-fetched
  // immediately (e.g. Appointments.jsx's `selectedTreatment` is a point-in-
  // time snapshot from the row click, not re-derived from its list refetch),
  // so the freshly-saved treatmentName/invoice figures are held here and
  // preferred for display until a new appointment is opened.
  const [editedSnapshot, setEditedSnapshot] = useState(null);

  useEffect(() => {
    setEditedSnapshot(null);
  }, [appointment?._id, open]);

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
  // Prefer the just-saved snapshot over the (possibly stale) prop so Edit
  // Treatment's new total/items/name reflect immediately without requiring
  // the parent page to re-fetch and re-pass a fresh `appointment` prop.
  const displayTreatmentName = editedSnapshot?.treatmentName ?? appointment.treatmentName;
  const displayInvoice = editedSnapshot?.invoice ?? appointment.invoice;

  const openEditDialog = () => {
    const sourceItems =
      displayInvoice?.items?.length > 0
        ? displayInvoice.items.map((it) => ({
            description: it.description || "",
            unitPrice: it.unitPrice ?? it.amount ?? 0,
            itemType: it.itemType || "treatment",
          }))
        : [
            {
              description: displayTreatmentName || "Treatment",
              unitPrice: displayInvoice?.grandTotal ?? appointment.fee ?? 0,
              itemType: "treatment",
            },
          ];
    setEditItems(sourceItems);
    setEditTreatmentName(displayTreatmentName || "");
    setEditDiscountPercent(displayInvoice?.discount?.percentage || 0);
    setEditItemsError("");
    setEditError("");
    setEditDialogOpen(true);
  };

  const addEditItem = () =>
    setEditItems((prev) => [...prev, { description: "", unitPrice: "", itemType: "treatment" }]);

  const removeEditItem = (index) => {
    if (editItems.length <= 1) {
      toast.error("At least one item is required");
      return;
    }
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEditItem = (index, field, value) =>
    setEditItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  // Mirrors AddAppointmentModal's treatmentTotal formula exactly (subtotal =
  // sum of unitPrice, discountAmount = round(subtotal * pct / 100), total =
  // max(0, subtotal - discountAmount)) -- the backend recomputes the same way.
  const editSubtotal = editItems.reduce((sum, item) => sum + (Number(item.unitPrice) || 0), 0);
  const editDiscountAmount = Math.round((editSubtotal * (Number(editDiscountPercent) || 0)) / 100);
  const editTotal = Math.max(0, editSubtotal - editDiscountAmount);

  const handleEditSubmit = async () => {
    const hasInvalidItem = editItems.some(
      (item) => !item.description?.trim() || !(Number(item.unitPrice) > 0)
    );
    if (hasInvalidItem) {
      setEditItemsError("Each item needs a description and a fee greater than ₹0");
      return;
    }
    setEditItemsError("");
    setEditError("");
    setEditLoading(true);
    try {
      const res = await api.patch(`/appointments/${appointment._id}/treatment-items`, {
        treatmentName: editTreatmentName.trim(),
        items: editItems.map((item) => ({
          description: item.description.trim(),
          unitPrice: Number(item.unitPrice) || 0,
          itemType: item.itemType || "treatment",
        })),
        discountPercent: Number(editDiscountPercent) || 0,
      });
      const body = res.data?.data || {};
      setEditedSnapshot({ treatmentName: body.appointment?.treatmentName, invoice: body.appointment?.invoice });
      if (body.warning) {
        toast.warning(body.warning);
      } else {
        toast.success("Treatment updated.");
      }
      setEditDialogOpen(false);
      refreshAll();
    } catch (err) {
      setEditError(err?.response?.data?.message || "Failed to update treatment.");
    } finally {
      setEditLoading(false);
    }
  };

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
                  {displayTreatmentName || "Treatment Plan"}
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

              <Box className="flex items-center justify-between mb-1.5">
                <SectionTitle>Billing</SectionTitle>
                {!alreadyClosed && (
                  <Button
                    size="small"
                    startIcon={<EditIcon fontSize="small" />}
                    onClick={openEditDialog}
                    sx={{ textTransform: "none", fontSize: "11px", minWidth: 0, py: 0, mb: 1 }}
                  >
                    Edit Treatment
                  </Button>
                )}
              </Box>
              <Box className="bg-gray-50/60 rounded px-3 py-2 mb-3">
                {displayInvoice?.items?.length > 0 && (
                  <Box className="mb-2">
                    {displayInvoice.items.map((item, i) => (
                      <Box key={i} className="flex justify-between py-0.5">
                        <Typography variant="caption" className="text-gray-600">
                          {item.description}{item.quantity > 1 ? ` × ${item.quantity}` : ""}
                        </Typography>
                        <Typography variant="caption" className="font-numbers">
                          ₹{(item.unitPrice || 0).toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                    ))}
                    {(displayInvoice.discount?.percentage > 0 || displayInvoice.discount?.amount > 0) && (
                      <Box className="flex justify-between py-0.5">
                        <Typography variant="caption" className="text-gray-600">Discount</Typography>
                        <Typography variant="caption" className="font-numbers text-red-600">
                          {displayInvoice.discount.percentage > 0
                            ? `${displayInvoice.discount.percentage}%`
                            : `₹${displayInvoice.discount.amount}`}
                        </Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 0.75 }} />
                  </Box>
                )}
                <Box className="flex justify-between py-0.5">
                  <Typography variant="caption" className="text-gray-600">Total Fee</Typography>
                  <Typography variant="caption" className="font-numbers font-semibold">
                    ₹{(displayInvoice?.grandTotal ?? appointment.fee ?? 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box className="flex justify-between py-0.5">
                  <Typography variant="caption" className="text-gray-600">Amount Paid</Typography>
                  <Typography variant="caption" className="font-numbers font-semibold text-green-700">
                    ₹{(displayInvoice?.amountPaid ?? 0).toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <Box className="flex justify-between py-0.5">
                  <Typography variant="caption" className="text-gray-600">Balance Due</Typography>
                  <Typography variant="caption" className="font-numbers font-semibold text-red-600">
                    ₹{(displayInvoice?.balanceDue ?? 0).toLocaleString("en-IN")}
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
                          {(displayInvoice?.balanceDue || 0) > 0 && (
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
            . Balance due: ₹{(displayInvoice?.balanceDue || 0).toLocaleString("en-IN")}
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

      {/* Edit Treatment dialog -- name/line items/discount, available throughout
          the active lifecycle (any sessions delivered), locked once closed.
          Reuses AddAppointmentModal's treatment-items UI pattern. */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          if (!editLoading) {
            setEditDialogOpen(false);
            setEditError("");
            setEditItemsError("");
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EditIcon color="primary" fontSize="small" />
          Edit Treatment
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Treatment Name"
            fullWidth
            size="small"
            value={editTreatmentName}
            onChange={(e) => setEditTreatmentName(e.target.value)}
            disabled={editLoading}
            sx={{ mb: 2 }}
          />

          <Box className="flex items-center justify-between mb-1.5">
            <Typography variant="caption" className="font-semibold text-gray-700">
              Fee Items
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={addEditItem}
              variant="outlined"
              disabled={editLoading}
              sx={{ textTransform: "none", fontSize: "12px", height: 28 }}
            >
              Add Item
            </Button>
          </Box>

          {editItems.map((item, index) => (
            <Box key={index} sx={{ border: "1px solid #e5e7eb", borderRadius: "6px", p: 1.25, mb: 1 }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                  select
                  label="Category"
                  value={item.itemType || "treatment"}
                  onChange={(e) => updateEditItem(index, "itemType", e.target.value)}
                  size="small"
                  disabled={editLoading}
                  sx={{ flex: "0 0 auto", minWidth: 120 }}
                >
                  {treatmentItemTypeOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Description"
                  value={item.description}
                  onChange={(e) => updateEditItem(index, "description", e.target.value)}
                  size="small"
                  placeholder="e.g., Root Canal"
                  disabled={editLoading}
                  sx={{ flex: "1 1 200px", minWidth: 160 }}
                />
                <TextField
                  label="Amount (₹)"
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateEditItem(index, "unitPrice", e.target.value)}
                  size="small"
                  inputProps={{ min: 0, step: 50 }}
                  disabled={editLoading}
                  sx={{ flex: "0 0 auto", minWidth: 130 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeEditItem(index)}
                  disabled={editLoading || editItems.length <= 1}
                  sx={{ p: 0.5 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
          {editItemsError && (
            <Typography variant="caption" className="text-red-600" sx={{ display: "block", mb: 1 }}>
              {editItemsError}
            </Typography>
          )}

          <TextField
            label="Discount %"
            type="number"
            size="small"
            value={editDiscountPercent}
            onChange={(e) => setEditDiscountPercent(e.target.value)}
            disabled={editLoading}
            inputProps={{ min: 0, max: 100 }}
            sx={{ mb: 1.5, width: 140 }}
          />

          <Box sx={{ mt: 0.5, p: 1.5, borderRadius: "6px", bgcolor: "#f9fafb" }}>
            <Box className="flex justify-between items-center">
              <Typography variant="caption" className="text-gray-600">Subtotal</Typography>
              <span className="font-numbers text-[13px]">₹{editSubtotal.toLocaleString("en-IN")}</span>
            </Box>
            {Number(editDiscountPercent) > 0 && (
              <Box className="flex justify-between items-center mt-0.5">
                <Typography variant="caption" className="text-gray-600">
                  Discount ({Number(editDiscountPercent)}%)
                </Typography>
                <span className="font-numbers text-[13px] text-red-600">
                  -₹{editDiscountAmount.toLocaleString("en-IN")}
                </span>
              </Box>
            )}
            <Divider className="my-1" />
            <Box className="flex justify-between items-center">
              <Typography variant="caption" className="font-semibold text-gray-800">New Total</Typography>
              <span className="font-numbers font-semibold text-[13px]">₹{editTotal.toLocaleString("en-IN")}</span>
            </Box>
            {(displayInvoice?.amountPaid || 0) > editTotal && (
              <Typography variant="caption" className="text-orange-600" sx={{ display: "block", mt: 0.75 }}>
                Warning: ₹{(displayInvoice?.amountPaid || 0).toLocaleString("en-IN")} already collected is more
                than this new total -- saving is still allowed, but please review.
              </Typography>
            )}
          </Box>

          {editError && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
              {editError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => { setEditDialogOpen(false); setEditError(""); setEditItemsError(""); }}
            color="inherit"
            disabled={editLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={14} color="inherit" /> : <SaveIcon fontSize="small" />}
          >
            {editLoading ? "Saving…" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TreatmentPlanDetailModal;
