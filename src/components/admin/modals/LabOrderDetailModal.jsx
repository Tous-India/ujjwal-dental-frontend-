/**
 * Lab Order Detail Modal
 *
 * Full order view with payment recording (+ history) and delivery-status control.
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
  IconButton,
  CircularProgress,
  Divider,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ScienceIcon from "@mui/icons-material/Science";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { toast } from "react-toastify";
import { useLabOrder, useLabOrderMutations } from "../../../hooks/admin/useLabOrders";

const paymentStatusConfig = {
  unpaid: { color: "error", label: "Unpaid" },
  partially_paid: { color: "warning", label: "Partially Paid" },
  paid: { color: "success", label: "Paid" },
};

const deliveryStatusConfig = {
  pending: { color: "default", label: "Pending" },
  in_progress: { color: "info", label: "In Progress" },
  delivered: { color: "success", label: "Delivered" },
  rejected: { color: "error", label: "Rejected" },
};

const deliveryOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "delivered", label: "Delivered" },
  { value: "rejected", label: "Rejected" },
];

const methodOptions = ["Cash", "UPI", "Bank Transfer"];

const formatCurrency = (v) => `₹${(Number(v) || 0).toLocaleString("en-IN")}`;
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "-";

const InfoRow = ({ label, children }) => (
  <Box className="flex justify-between py-1">
    <Typography variant="body2" className="text-gray-500">{label}</Typography>
    <Typography variant="body2" className="font-medium" component="div">{children}</Typography>
  </Box>
);

const LabOrderDetailModal = ({ open, onClose, order, onRefresh }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [pay, setPay] = useState({ amount: "", method: "Cash", date: "", notes: "" });

  const { data, isLoading, refetch } = useLabOrder(order?._id);
  const o = data?.data?.order || order;

  const { recordPayment, isRecordingPayment, updateLabOrder, isUpdating } = useLabOrderMutations();

  const resetForms = () => {
    setShowPaymentForm(false);
    setPay({ amount: "", method: "Cash", date: "", notes: "" });
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  const handleRecordPayment = () => {
    const amount = Number(pay.amount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (amount > (o?.balanceDue || 0) + 0.01)
      return toast.error(`Amount cannot exceed balance due (${formatCurrency(o?.balanceDue)})`);

    recordPayment(
      { id: o._id, data: { amount, method: pay.method, date: pay.date || undefined, notes: pay.notes || undefined } },
      {
        onSuccess: () => {
          toast.success("Payment recorded");
          refetch();
          onRefresh?.();
          resetForms();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to record payment"),
      },
    );
  };

  const handleDeliveryChange = (value) => {
    updateLabOrder(
      { id: o._id, data: { deliveryStatus: value } },
      {
        onSuccess: () => {
          toast.success("Delivery status updated");
          refetch();
          onRefresh?.();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to update delivery status"),
      },
    );
  };

  if (!order) return null;

  const payStatus = paymentStatusConfig[o?.paymentStatus] || paymentStatusConfig.unpaid;
  const delStatus = deliveryStatusConfig[o?.deliveryStatus] || deliveryStatusConfig.pending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ className: "rounded-xl" }}>
      <DialogTitle className="bg-navy text-white">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-3">
            <ScienceIcon />
            <Box>
              <Typography variant="h6" className="font-bold">{o?.orderNumber || "Lab Order"}</Typography>
              <Box className="flex gap-2 mt-1">
                <Chip label={payStatus.label} size="small" color={payStatus.color} />
                <Chip label={delStatus.label} size="small" color={delStatus.color} variant="outlined" className="border-white/50 text-white" />
              </Box>
            </Box>
          </Box>
          <IconButton onClick={handleClose}><CloseIcon className="text-white" /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className="p-6 mt-2">
        {isLoading ? (
          <Box className="text-center py-8"><CircularProgress /></Box>
        ) : (
          <>
            {/* Summary */}
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Paper variant="outlined" className="p-3">
                <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2">Order Info</Typography>
                <InfoRow label="Lab">{o?.lab?.name || "-"}</InfoRow>
                <InfoRow label="Patient">{o?.patient?.name || "-"}</InfoRow>
                <InfoRow label="Doctor">{o?.doctor || "-"}</InfoRow>
              </Paper>
              <Paper variant="outlined" className="p-3">
                <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2">Dates</Typography>
                <InfoRow label="Order Date">{formatDate(o?.orderDate)}</InfoRow>
                <InfoRow label="Expected">{formatDate(o?.expectedDelivery)}</InfoRow>
                <InfoRow label="Delivered">{formatDate(o?.deliveredDate)}</InfoRow>
              </Paper>
            </Box>

            {/* Items */}
            <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2">Items</Typography>
            <TableContainer component={Paper} variant="outlined" className="mb-4">
              <Table size="small">
                <TableHead>
                  <TableRow className="bg-gray-50">
                    <TableCell className="font-semibold">Procedure</TableCell>
                    <TableCell align="right" className="font-semibold">Qty</TableCell>
                    <TableCell align="right" className="font-semibold">Unit Price</TableCell>
                    <TableCell align="right" className="font-semibold">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(o?.items || []).map((it, idx) => (
                    <TableRow key={it._id || idx} hover>
                      <TableCell>{it.procedure}</TableCell>
                      <TableCell align="right" className="font-numbers">{it.quantity}</TableCell>
                      <TableCell align="right" className="font-numbers">{formatCurrency(it.unitPrice)}</TableCell>
                      <TableCell align="right" className="font-numbers font-medium">{formatCurrency(it.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Totals */}
            <Box className="flex justify-end mb-4">
              <Paper variant="outlined" className="p-4 min-w-[260px]">
                <InfoRow label="Total"><span className="font-numbers font-bold">{formatCurrency(o?.totalAmount)}</span></InfoRow>
                <InfoRow label="Amount Paid"><span className="font-numbers text-green-600 font-medium">{formatCurrency(o?.amountPaid)}</span></InfoRow>
                <Divider className="my-1" />
                <InfoRow label="Balance Due">
                  <span className={`font-numbers font-bold ${o?.balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                    {formatCurrency(o?.balanceDue)}
                  </span>
                </InfoRow>
              </Paper>
            </Box>

            {/* Delivery status control */}
            <Paper variant="outlined" className="p-4 mb-4">
              <Box className="flex items-center gap-2 mb-2">
                <LocalShippingIcon fontSize="small" className="text-gray-500" />
                <Typography variant="subtitle2" className="font-semibold">Delivery</Typography>
              </Box>
              <TextField
                select
                label="Delivery Status"
                value={o?.deliveryStatus || "pending"}
                onChange={(e) => handleDeliveryChange(e.target.value)}
                size="small"
                disabled={isUpdating}
                className="min-w-[220px]"
              >
                {deliveryOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Paper>

            {/* Payment section */}
            <Paper variant="outlined" className="p-4">
              <Box className="flex items-center justify-between mb-2">
                <Box className="flex items-center gap-2">
                  <PaymentIcon fontSize="small" className="text-gray-500" />
                  <Typography variant="subtitle2" className="font-semibold">Payments</Typography>
                </Box>
                {o?.balanceDue > 0 && !showPaymentForm && (
                  <Button size="small" variant="contained" color="success" startIcon={<PaymentIcon />} onClick={() => setShowPaymentForm(true)}>
                    Record Payment
                  </Button>
                )}
              </Box>

              {showPaymentForm && (
                <Box className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <Box className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <TextField
                      label="Amount (₹)"
                      type="number"
                      size="small"
                      value={pay.amount}
                      onChange={(e) => setPay((p) => ({ ...p, amount: e.target.value }))}
                      inputProps={{ min: 1, max: o?.balanceDue }}
                      helperText={`Balance: ${formatCurrency(o?.balanceDue)}`}
                    />
                    <TextField
                      select
                      label="Method"
                      size="small"
                      value={pay.method}
                      onChange={(e) => setPay((p) => ({ ...p, method: e.target.value }))}
                    >
                      {methodOptions.map((m) => (
                        <MenuItem key={m} value={m}>{m}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Date"
                      type="date"
                      size="small"
                      value={pay.date}
                      onChange={(e) => setPay((p) => ({ ...p, date: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Notes"
                      size="small"
                      value={pay.notes}
                      onChange={(e) => setPay((p) => ({ ...p, notes: e.target.value }))}
                    />
                  </Box>
                  <Box className="flex gap-2 mt-3">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={handleRecordPayment}
                      disabled={isRecordingPayment}
                      startIcon={isRecordingPayment ? <CircularProgress size={16} /> : <PaymentIcon />}
                    >
                      Confirm
                    </Button>
                    <Button size="small" onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                  </Box>
                </Box>
              )}

              {/* Payment history */}
              {(o?.paymentHistory || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">No payments recorded yet.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow className="bg-gray-50">
                        <TableCell className="font-semibold">Date</TableCell>
                        <TableCell className="font-semibold">Method</TableCell>
                        <TableCell className="font-semibold">Notes</TableCell>
                        <TableCell align="right" className="font-semibold">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {o.paymentHistory.map((p, idx) => (
                        <TableRow key={p._id || idx}>
                          <TableCell>{formatDate(p.date)}</TableCell>
                          <TableCell>{p.method || "-"}</TableCell>
                          <TableCell>{p.notes || "-"}</TableCell>
                          <TableCell align="right" className="font-numbers text-green-600 font-medium">{formatCurrency(p.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>

            {o?.notes && (
              <Paper className="p-3 mt-4 bg-yellow-50 border border-yellow-200">
                <Typography variant="caption" className="text-yellow-800 font-semibold block">Notes</Typography>
                <Typography variant="body2" className="text-yellow-900">{o.notes}</Typography>
              </Paper>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions className="p-4 bg-gray-50">
        <Button onClick={handleClose} color="inherit">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabOrderDetailModal;
