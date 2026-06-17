/**
 * Patient Invoices Page
 *
 * Lists the logged-in patient's invoices and opens a detail dialog with the
 * full line-item breakdown. All data comes from the IDOR-protected
 * GET /patients/:id/invoices endpoint (invoices are embedded with items).
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Tooltip from "@mui/material/Tooltip";
import { useMyInvoices } from "../../hooks/patient/useMyInvoices";
import InvoicePreviewModal from "../../components/InvoicePreviewModal";

const paymentStatusConfig = {
  unpaid: { color: "error", label: "Unpaid" },
  partial: { color: "warning", label: "Partially Paid" },
  paid: { color: "success", label: "Paid" },
};

const itemCategoryLabels = {
  treatment: "Treatment",
  surgery: "Surgery",
  test: "Test",
  opd_fee: "OPD Fee",
  membership: "Membership",
  medicine: "Medicine",
  other: "Other",
};

const paymentMethodLabels = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  online: "Online",
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

/** Build a short items summary, e.g. "Root Canal, Medicine — 2 items". */
const itemsSummary = (items = []) => {
  if (!items.length) return "—";
  const names = items.map((i) => i.description).filter(Boolean);
  const shown = names.slice(0, 2).join(", ");
  const more = names.length > 2 ? "…" : "";
  return `${shown}${more} — ${items.length} item${items.length > 1 ? "s" : ""}`;
};

/** Detail row inside the dialog */
const InfoRow = ({ label, children }) => (
  <Box className="flex justify-between py-1">
    <Typography variant="body2" className="text-gray-500">
      {label}
    </Typography>
    <Typography variant="body2" className="font-medium">
      {children}
    </Typography>
  </Box>
);

const InvoiceDetailDialog = ({ invoice, open, onClose }) => {
  if (!invoice) return null;
  const pay = paymentStatusConfig[invoice.paymentStatus] || paymentStatusConfig.unpaid;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ className: "rounded-xl" }}>
      <DialogTitle className="bg-navy text-white">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center gap-3">
            <ReceiptLongIcon />
            <Box>
              <Typography variant="h6" className="font-bold">
                {invoice.invoiceNumber || "Invoice"}
              </Typography>
              <Typography variant="caption" className="text-white/80">
                {formatDate(invoice.invoiceDate)}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon className="text-white" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className="p-6">
        {/* Line Items */}
        <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-2 mt-2">
          Line Items
        </Typography>
        <TableContainer component={Paper} variant="outlined" className="mb-4">
          <Table size="small">
            <TableHead>
              <TableRow className="bg-gray-50">
                <TableCell className="font-semibold">#</TableCell>
                <TableCell className="font-semibold">Description</TableCell>
                <TableCell className="font-semibold">Category</TableCell>
                <TableCell align="right" className="font-semibold">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(invoice.items || []).map((item, idx) => (
                <TableRow key={item._id || idx} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={itemCategoryLabels[item.itemType] || item.itemType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" className="font-numbers font-medium">
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals */}
        <Box className="flex justify-end">
          <Paper variant="outlined" className="p-4 min-w-[280px]">
            <InfoRow label="Subtotal">
              <span className="font-numbers">{formatCurrency(invoice.subtotal)}</span>
            </InfoRow>
            {(invoice.discount?.percentage > 0 || invoice.discount?.amount > 0) && (
              <InfoRow
                label={`Discount${invoice.discount?.percentage ? ` (${invoice.discount.percentage}%)` : ""}`}
              >
                <span className="font-numbers text-red-500">
                  -{formatCurrency(invoice.discount?.amount || 0)}
                </span>
              </InfoRow>
            )}
            {invoice.totalTax > 0 && (
              <InfoRow label="Tax">
                <span className="font-numbers">{formatCurrency(invoice.totalTax)}</span>
              </InfoRow>
            )}
            <Divider className="my-2" />
            <InfoRow label="Grand Total">
              <span className="font-numbers text-lg font-bold">
                {formatCurrency(invoice.grandTotal)}
              </span>
            </InfoRow>
            <InfoRow label="Amount Paid">
              <span className="font-numbers text-green-600 font-medium">
                {formatCurrency(invoice.amountPaid)}
              </span>
            </InfoRow>
            {invoice.paymentMethod && (
              <InfoRow label="Payment Method">
                {paymentMethodLabels[invoice.paymentMethod] || invoice.paymentMethod}
              </InfoRow>
            )}
            <Divider className="my-1" />
            <InfoRow label="Balance Due">
              <span
                className={`font-numbers font-bold ${invoice.balanceDue > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {formatCurrency(invoice.balanceDue)}
              </span>
            </InfoRow>
            <Box className="flex justify-end mt-3">
              <Chip label={pay.label} color={pay.color} size="small" />
            </Box>
          </Paper>
        </Box>

        <Typography variant="caption" className="block text-center text-gray-500 mt-4">
          Ujjwal Dental Clinic — A unit of Healing Fairy Health Care Pvt. Ltd.
        </Typography>

        {invoice.notes && (
          <Paper className="p-3 mt-4 bg-yellow-50 border border-yellow-200">
            <Typography variant="caption" className="text-yellow-800 font-semibold block">
              Notes
            </Typography>
            <Typography variant="body2" className="text-yellow-900">
              {invoice.notes}
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions className="p-4 bg-gray-50">
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Invoices = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  const { data, isLoading, error } = useMyInvoices({ page, limit });

  const invoices = data?.data || [];
  const pagination = data?.pagination || { total: 0 };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Invoices
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your bills and payment status
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" fontWeight="bold">
              Your Invoices
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading invoices...
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography color="error">Failed to load invoices. Please try again.</Typography>
            </Box>
          ) : invoices.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <ReceiptLongIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No invoices found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Your invoices will appear here
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} elevation={0}>
                <Table sx={{ bgcolor: "white", minWidth: "max-content" }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Paid</TableCell>
                      <TableCell align="right">Balance</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Preview</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const pay =
                        paymentStatusConfig[invoice.paymentStatus] || paymentStatusConfig.unpaid;
                      return (
                        <TableRow
                          key={invoice._id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => setSelected(invoice)}
                        >
                          <TableCell>
                            <Typography variant="body2" className="font-mono text-xs" fontWeight="medium">
                              {invoice.invoiceNumber || "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{formatDate(invoice.invoiceDate)}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {itemsSummary(invoice.items)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" className="font-numbers">
                              {formatCurrency(invoice.grandTotal)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" className="font-numbers text-green-600">
                              {formatCurrency(invoice.amountPaid)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              className={`font-numbers ${invoice.balanceDue > 0 ? "text-red-600" : "text-gray-400"}`}
                              fontWeight={invoice.balanceDue > 0 ? "bold" : "normal"}
                            >
                              {invoice.balanceDue > 0 ? formatCurrency(invoice.balanceDue) : "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={pay.label} size="small" color={pay.color} />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Preview Invoice">
                              <IconButton
                                size="small"
                                sx={{ color: "#e06c00" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewInvoice(invoice);
                                  setPreviewOpen(true);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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

      <InvoiceDetailDialog
        invoice={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />

      <InvoicePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoice={previewInvoice}
      />
    </Box>
  );
};

export default Invoices;
