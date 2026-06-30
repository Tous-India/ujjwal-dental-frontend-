/**
 * Payment Detail Modal
 *
 * Displays complete payment information with refund option.
 */
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { usePaymentMutations } from "../../../hooks/admin/usePayments";

/**
 * Format date
 */
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
};

/**
 * Info row component
 */
const InfoRow = ({ label, value, highlight = false }) => (
  <Box className="flex justify-between items-center py-0.5">
    <Typography variant="caption" className="text-gray-500">{label}</Typography>
    <Typography variant="caption" className={`font-medium ${highlight ? "text-green-600" : ""}`}>
      {value || "-"}
    </Typography>
  </Box>
);

/**
 * Status colors
 */
const statusColors = {
  pending: "warning",
  paid: "success",
  failed: "error",
  refunded: "info",
  cancelled: "default",
};

/**
 * Payment mode labels
 */
const paymentModeLabels = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  razorpay: "Razorpay",
  netbanking: "Net Banking",
  other: "Other",
};

/**
 * Payment type labels
 */
const paymentTypeLabels = {
  opd_fee: "OPD Fee",
  consultation: "Consultation",
  treatment: "Treatment",
  test: "Test/Investigation",
  invoice_payment: "Invoice Payment",
  advance: "Advance Payment",
  membership: "Membership",
  refund: "Refund",
  other: "Other",
};

const PaymentDetailModal = ({ open, onClose, payment, onRefund, onDelete }) => {
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const { processRefund, isRefunding, deletePayment, isDeleting } = usePaymentMutations();

  const handleRefund = () => {
    if (!refundReason.trim()) {
      toast.error("Please provide a reason for refund");
      return;
    }

    const amount = refundAmount ? Number(refundAmount) : payment.amount;
    if (amount <= 0 || amount > payment.amount) {
      toast.error(`Refund amount must be between 1 and ${payment.amount}`);
      return;
    }
    processRefund(
      { id: payment._id, data: { amount, reason: refundReason } },
      {
        onSuccess: () => {
          setShowRefundForm(false);
          setRefundReason("");
          setRefundAmount("");
          onRefund?.();
          onClose();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to process refund");
        },
      }
    );
  };

  const handleDelete = () => {
    if (isDeleting) return;
    if (!window.confirm("Permanently delete this payment? This action cannot be undone.")) return;
    deletePayment(payment._id, {
      onSuccess: () => {
        toast.success("Deleted successfully");
        onDelete?.();
        onClose();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to delete payment");
      },
    });
  };

  const handleClose = () => {
    if (!isRefunding) {
      setShowRefundForm(false);
      setRefundReason("");
      setRefundAmount("");
      onClose();
    }
  };

  if (!payment) return null;

  const canRefund = payment.status === "paid";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: "rounded-xl" }}
    >
      {/* Header */}
      <DialogTitle className="bg-linear-to-r from-green-600 to-green-700 text-white" sx={{ p: 0 }}>
        <Box className="flex items-center justify-between px-4 py-2">
          <Box className="flex items-center gap-2">
            <PaymentIcon fontSize="small" />
            <Typography variant="subtitle1" className="font-bold">{payment.paymentNumber}</Typography>
            <Chip label={payment.status} size="small" color={statusColors[payment.status] || "default"} className="capitalize" />
          </Box>
          <IconButton onClick={handleClose} disabled={isRefunding} size="small">
            <CloseIcon className="text-white" fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent className="p-4">
        <Grid container spacing={2}>
          {/* Left Column - Payment Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" className="font-semibold text-gray-600 uppercase flex items-center gap-1 mb-1">
              <AccountBalanceWalletIcon sx={{ fontSize: 13 }} className="text-green-600" /> Payment Info
            </Typography>
            <Box sx={{ bgcolor: "#f9fafb", borderRadius: 1, p: 1.5 }}>
              <InfoRow label="Amount" value={<span className="font-numbers">{formatCurrency(payment.amount)}</span>} highlight />
              <InfoRow label="Mode" value={paymentModeLabels[payment.paymentMode] || payment.paymentMode} />
              <InfoRow label="Type" value={paymentTypeLabels[payment.type] || payment.type} />
              <InfoRow label="Status" value={payment.status?.toUpperCase()} />
              {payment.referenceNumber && (
                <InfoRow label="Reference #" value={payment.referenceNumber} />
              )}
              <InfoRow label="Paid At" value={formatDate(payment.paidAt)} />
              <InfoRow label="Recorded" value={formatDate(payment.createdAt)} />
            </Box>
          </Grid>

          {/* Right Column - Patient & Invoice */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" className="font-semibold text-gray-600 uppercase flex items-center gap-1 mb-1">
              <PersonIcon sx={{ fontSize: 13 }} className="text-blue-600" /> Patient & Invoice
            </Typography>
            <Box sx={{ bgcolor: "#f9fafb", borderRadius: 1, p: 1.5 }}>
              <InfoRow label="Patient" value={payment.patient?.name} />
              <InfoRow label="Phone" value={payment.patient?.phone} />
              <InfoRow label="Clinic" value={payment.clinic?.name} />
              {payment.invoice && (
                <>
                  <Divider className="my-2" />
                  <InfoRow label="Invoice #" value={payment.invoice?.invoiceNumber} />
                  <InfoRow label="Invoice Total" value={<span className="font-numbers">{formatCurrency(payment.invoice?.grandTotal)}</span>} />
                </>
              )}
            </Box>

            {/* Received By */}
            {payment.receivedBy && (
              <Box className="mt-4">
                <Typography variant="caption" className="text-gray-500">
                  Received by: {payment.receivedBy?.name}
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Notes */}
          {payment.notes && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ bgcolor: "#fffbeb", borderRadius: 1, p: 1.5, border: "1px solid #fde68a" }}>
                <Typography variant="caption" className="font-semibold text-gray-700 block mb-0.5">Notes</Typography>
                <Typography variant="body2">{payment.notes}</Typography>
              </Box>
            </Grid>
          )}

          {/* Razorpay Details */}
          {payment.paymentMode === "razorpay" && payment.razorpayPaymentId && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" className="font-semibold text-gray-600 uppercase flex items-center gap-1 mb-1">
                <ReceiptIcon sx={{ fontSize: 13 }} className="text-purple-600" /> Razorpay Details
              </Typography>
              <Box sx={{ bgcolor: "#faf5ff", borderRadius: 1, p: 1.5 }}>
                <InfoRow label="Order ID" value={payment.razorpayOrderId} />
                <InfoRow label="Payment ID" value={payment.razorpayPaymentId} />
                {payment.razorpayDetails?.method && (
                  <InfoRow label="Method" value={payment.razorpayDetails.method} />
                )}
                {payment.razorpayDetails?.vpa && (
                  <InfoRow label="UPI ID" value={payment.razorpayDetails.vpa} />
                )}
              </Box>
            </Grid>
          )}

          {/* Refund Details */}
          {payment.status === "refunded" && payment.refund && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ bgcolor: "#fef2f2", borderRadius: 1, p: 1.5, border: "1px solid #fecaca" }}>
                <Typography variant="caption" className="font-semibold text-red-700 block mb-0.5">Refund Information</Typography>
                <InfoRow label="Refunded At" value={formatDate(payment.refund.refundedAt)} />
                <InfoRow label="Reason" value={payment.refund.reason} />
                {payment.refund.razorpayRefundId && (
                  <InfoRow label="Razorpay Refund ID" value={payment.refund.razorpayRefundId} />
                )}
              </Box>
            </Grid>
          )}

          {/* Refund Form */}
          {showRefundForm && canRefund && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ bgcolor: "#fef2f2", borderRadius: 1, p: 1.5, border: "1px solid #fecaca" }}>
                <Typography variant="caption" className="font-semibold text-red-700 block mb-1">Process Refund</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Refund Amount"
                      type="number"
                      size="small"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder={`Max: ${payment.amount}`}
                      inputProps={{ min: 1, max: payment.amount }}
                      helperText={`Full amount: ${formatCurrency(payment.amount)}`}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Reason for Refund *"
                      size="small"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Enter reason for refund..."
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
                <Box className="flex gap-2 mt-3">
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={handleRefund}
                    disabled={isRefunding}
                    startIcon={isRefunding ? <CircularProgress size={16} /> : <RefreshIcon />}
                  >
                    {isRefunding ? "Processing..." : "Confirm Refund"}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setShowRefundForm(false);
                    }}
                    disabled={isRefunding}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      {/* Actions */}
      <DialogActions className="p-2 bg-gray-50">
        {canRefund && !showRefundForm && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<RefreshIcon />}
            onClick={() => setShowRefundForm(true)}
            sx={{ textTransform: "none", fontSize: "12px" }}
          >
            Process Refund
          </Button>
        )}
        <Button
          variant="outlined"
          color="error"
          startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          onClick={handleDelete}
          disabled={isDeleting || isRefunding}
          sx={{ textTransform: "none", fontSize: "12px" }}
        >
          Delete
        </Button>
        <Box className="flex-grow" />
        <Button onClick={handleClose} color="inherit" disabled={isRefunding} sx={{ textTransform: "none", fontSize: "12px" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDetailModal;
