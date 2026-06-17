import { useState, useEffect } from "react";
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
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAdminPaymentMutations } from "../../../hooks/admin/usePayments";

const MODES = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
];

const fmt = (n) => (n || 0).toLocaleString("en-IN");

const CollectPaymentModal = ({ open, onClose, invoice, patient, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [mode, setMode] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { collectPayment, isCollecting } = useAdminPaymentMutations();

  // Pre-fill amount whenever a different invoice is opened
  useEffect(() => {
    if (open && invoice) {
      setAmount(String(invoice.balanceDue || ""));
      setAmountError("");
      setMode("cash");
      setReference("");
      setNotes("");
      setSubmitError("");
    }
  }, [open, invoice?._id]);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    const num = Number(val);
    if (!val || num <= 0) {
      setAmountError("Amount must be greater than 0");
    } else if (invoice && num > (invoice.balanceDue || 0) + 0.01) {
      setAmountError(`Cannot exceed balance due ₹${fmt(invoice.balanceDue)}`);
    } else {
      setAmountError("");
    }
  };

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!num || num <= 0) {
      setAmountError("Amount must be greater than 0");
      return;
    }
    if (invoice && num > (invoice.balanceDue || 0) + 0.01) {
      setAmountError(`Cannot exceed balance due ₹${fmt(invoice.balanceDue)}`);
      return;
    }
    setSubmitError("");
    try {
      await collectPayment({
        invoiceId: invoice._id,
        amount: num,
        mode,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onSuccess?.(`₹${fmt(num)} collected for ${invoice.invoiceNumber}`);
      onClose();
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || "Failed to collect payment. Please try again."
      );
    }
  };

  const canSubmit =
    invoice &&
    amount &&
    Number(amount) > 0 &&
    !amountError &&
    !isCollecting;

  if (!invoice) return null;

  return (
    <Dialog open={open} onClose={!isCollecting ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}
      >
        <Typography variant="h6" fontWeight={700}>
          Collect Payment
        </Typography>
        <IconButton onClick={onClose} size="small" disabled={isCollecting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        {/* Invoice info box */}
        <Box
          sx={{
            bgcolor: "#f3f4f6",
            borderRadius: 1.5,
            px: 2,
            py: 1.5,
            mb: 2.5,
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
            {invoice.invoiceNumber}
            {invoice.category ? (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 0.75,
                  py: 0.25,
                  bgcolor: "#e0e7ff",
                  color: "#3730a3",
                  borderRadius: "4px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {invoice.category}
              </Box>
            ) : null}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {patient?.name || "—"}{patient?.phone ? ` — ${patient.phone}` : ""}
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                ₹{fmt(invoice.totalAmount ?? invoice.grandTotal)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Paid
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ color: "#16a34a" }}>
                ₹{fmt(invoice.amountPaid)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Balance Due
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: "#dc2626", fontSize: 15 }}>
                ₹{fmt(invoice.balanceDue)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Amount */}
        <TextField
          label="Amount (₹) *"
          type="number"
          fullWidth
          size="small"
          value={amount}
          onChange={handleAmountChange}
          error={!!amountError}
          helperText={
            amountError ||
            `Balance due: ₹${fmt(invoice.balanceDue)} — enter full or partial amount`
          }
          inputProps={{ min: 1, step: 1 }}
          sx={{ mb: 2 }}
        />

        {/* Payment Mode */}
        <TextField
          select
          label="Payment Mode *"
          fullWidth
          size="small"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          sx={{ mb: 2 }}
        >
          {MODES.map((m) => (
            <MenuItem key={m.value} value={m.value}>
              {m.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Reference (UPI/Card) */}
        {(mode === "upi" || mode === "card") && (
          <TextField
            label="Reference / Transaction ID"
            fullWidth
            size="small"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. TXN123456"
            sx={{ mb: 2 }}
          />
        )}

        {/* Notes */}
        <TextField
          label="Notes (optional)"
          fullWidth
          size="small"
          multiline
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: submitError ? 2 : 0 }}
        />

        {submitError && <Alert severity="error">{submitError}</Alert>}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={isCollecting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          startIcon={isCollecting ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{
            bgcolor: "#f59e0b",
            color: "#fff",
            fontWeight: 700,
            "&:hover": { bgcolor: "#d97706" },
            "&:disabled": { bgcolor: "#fcd34d", color: "#fff" },
          }}
        >
          {isCollecting
            ? "Collecting…"
            : `Collect ₹${amount && Number(amount) > 0 ? fmt(Number(amount)) : fmt(invoice.balanceDue)}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CollectPaymentModal;
