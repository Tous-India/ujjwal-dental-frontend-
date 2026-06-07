/**
 * Patient Payments Page
 *
 * Shows payment history with summary cards
 */
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useMyPayments } from "../../hooks/patient/useMyPayments";
import { useMyBillingSummary } from "../../hooks/patient/useMyInvoices";

const modeLabels = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  razorpay: "Razorpay",
  netbanking: "Net Banking",
  other: "Other",
};

const typeLabels = {
  opd_fee: "OPD Fee",
  consultation: "Consultation",
  treatment: "Treatment",
  test: "Test",
  invoice_payment: "Invoice",
  advance: "Advance",
  membership: "Membership",
  other: "Other",
};

const statusColors = {
  pending: "warning",
  paid: "success",
  failed: "error",
  refunded: "info",
  cancelled: "default",
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (val) => `₹${(val || 0).toLocaleString("en-IN")}`;

const Payments = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, error } = useMyPayments({ page, limit });

  // Backend returns { data: { payments, summary }, pagination }
  const paymentsData = data?.data || {};
  const payments = paymentsData.payments || (Array.isArray(data?.data) ? data.data : []);
  const pagination = data?.pagination || { total: 0 };

  // Balance/paid/total come from the SAME invoice-based aggregation the patient
  // dashboard card and admin Billing use (backend Invoice.getStats), so this
  // tab never diverges again. Pending = sum of invoice balanceDue (totalDue).
  const { data: billingData } = useMyBillingSummary();
  const stats = billingData?.data?.stats || {};

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your payment history and pending amounts
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PaymentIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Billed
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" className="font-numbers text-navy">
                    {formatCurrency(stats.totalAmount)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AccountBalanceWalletIcon
                  color="success"
                  sx={{ fontSize: 40 }}
                />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Paid
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" className="font-numbers text-green-600">
                    {formatCurrency(stats.totalPaid)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PaymentIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending Amount
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" className="font-numbers text-orange-600">
                    {formatCurrency(stats.totalDue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment History */}
      <Card>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" fontWeight="bold">
              Payment History
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading payments...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography color="error">
                Failed to load payments. Please try again.
              </Typography>
            </Box>
          ) : payments.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <PaymentIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No payments found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Your payment history will appear here
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ bgcolor: "white", minWidth: "max-content" }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell>Payment #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Mode</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Reference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment._id} hover>
                        <TableCell>
                          <Typography variant="body2" className="font-mono text-xs" fontWeight="medium">
                            {payment.paymentNumber || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(payment.paidAt || payment.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold" className="text-green-600">
                            {formatCurrency(payment.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {modeLabels[payment.paymentMode] || payment.paymentMode || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={typeLabels[payment.type] || payment.type || "-"}
                            size="small"
                            variant="outlined"
                          />
                          {(payment.treatmentType?.name || payment.treatmentName) && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                              {payment.treatmentType?.name || payment.treatmentName}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={payment.status || "pending"}
                            size="small"
                            color={statusColors[payment.status] || "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" className="font-mono text-xs">
                            {payment.razorpayPaymentId || payment.invoice?.invoiceNumber || "-"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {pagination.total > limit && (
                <TablePagination
                  component="div"
                  count={pagination.total}
                  page={page - 1}
                  onPageChange={(_, p) => setPage(p + 1)}
                  rowsPerPage={limit}
                  onRowsPerPageChange={(e) => {
                    setLimit(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                  rowsPerPageOptions={[10, 25, 50]}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Payments;
