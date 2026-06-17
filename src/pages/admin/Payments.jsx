import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Autocomplete,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Divider,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import DataTable from "../../components/common/DataTable";
import CompactFilterBar from "../../components/common/CompactFilterBar";
import CollectPaymentModal from "../../components/admin/modals/CollectPaymentModal";
import { usePayments, useAdminPaymentMutations, usePatientUnpaidInvoices } from "../../hooks/admin/usePayments";
import { searchPatients } from "../../api/admin/patients.api";
import AddPaymentModal from "../../components/admin/modals/AddPaymentModal";
import PaymentDetailModal from "../../components/admin/modals/PaymentDetailModal";

const fmt = (n) => (n || 0).toLocaleString("en-IN");

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ── Category chip colors ────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Treatment: { bg: "#ede9fe", color: "#5b21b6" },
  Membership: { bg: "#fef3c7", color: "#92400e" },
  "OPD Fee": { bg: "#dbeafe", color: "#1e40af" },
  Test: { bg: "#dcfce7", color: "#166534" },
  Medicine: { bg: "#fce7f3", color: "#9d174d" },
  Other: { bg: "#f3f4f6", color: "#374151" },
};

// ── Payment history table columns ────────────────────────────────────────────
const paymentColumns = [
  {
    field: "paymentNumber",
    headerName: "Payment #",
    minWidth: 140,
    render: (value) => (
      <Typography variant="body2" className="font-mono font-medium text-green-600">
        {value || "-"}
      </Typography>
    ),
  },
  {
    field: "patient",
    headerName: "Patient",
    minWidth: 180,
    render: (value) => (
      <Box className="flex items-center gap-2">
        <Avatar className="bg-green-100 text-green-600" sx={{ width: 32, height: 32 }}>
          {value?.name?.[0]?.toUpperCase() || "P"}
        </Avatar>
        <Box>
          <Typography variant="body2" className="font-medium">
            {value?.name || "Unknown"}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {value?.phone || ""}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    field: "amount",
    headerName: "Amount",
    minWidth: 120,
    render: (value) => (
      <Typography variant="body2" className="font-numbers font-semibold text-green-600">
        ₹{fmt(value)}
      </Typography>
    ),
  },
  {
    field: "paymentMode",
    headerName: "Mode",
    minWidth: 100,
    render: (value) => {
      const labels = {
        cash: "Cash",
        card: "Card",
        upi: "UPI",
        razorpay: "Razorpay",
        netbanking: "Net Banking",
        other: "Other",
      };
      return (
        <Typography variant="body2" className="capitalize">
          {labels[value] || value || "-"}
        </Typography>
      );
    },
  },
  {
    field: "type",
    headerName: "Type",
    minWidth: 130,
    render: (value) => {
      const labels = {
        opd_fee: "OPD Fee",
        consultation: "Consultation",
        treatment: "Treatment",
        test: "Test",
        invoice_payment: "Invoice",
        advance: "Advance",
        membership: "Membership",
        refund: "Refund",
        other: "Other",
      };
      return (
        <Chip
          label={labels[value] || value || "-"}
          size="small"
          variant="outlined"
          className="capitalize"
        />
      );
    },
  },
  {
    field: "status",
    headerName: "Status",
    minWidth: 110,
    render: (value, row) => {
      const colors = {
        pending: "warning",
        paid: "success",
        failed: "error",
        refunded: "info",
        cancelled: "default",
        reversed: "default",
      };
      const chip = (
        <Chip
          label={value === "reversed" ? "Reversed" : value || "pending"}
          size="small"
          color={colors[value] || "default"}
          className="capitalize"
          sx={
            value === "reversed"
              ? { color: "#6b7280", bgcolor: "#f3f4f6", borderColor: "#d1d5db" }
              : {}
          }
        />
      );
      if (value === "reversed" && row?.reversalReason) {
        return (
          <Tooltip title={`Reason: ${row.reversalReason}`} placement="top">
            {chip}
          </Tooltip>
        );
      }
      return chip;
    },
  },
  {
    field: "clinic",
    headerName: "Clinic",
    minWidth: 120,
    render: (value) => (
      <Typography variant="body2">{value?.name || "-"}</Typography>
    ),
  },
  {
    field: "paidAt",
    headerName: "Paid At",
    minWidth: 120,
    type: "date",
  },
];

const filterOptions = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "pending", label: "Pending" },
      { value: "paid", label: "Paid" },
      { value: "failed", label: "Failed" },
      { value: "refunded", label: "Refunded" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    key: "paymentMode",
    label: "Mode",
    options: [
      { value: "cash", label: "Cash" },
      { value: "card", label: "Card" },
      { value: "upi", label: "UPI" },
      { value: "razorpay", label: "Razorpay" },
      { value: "netbanking", label: "Net Banking" },
    ],
  },
  {
    key: "type",
    label: "Type",
    options: [
      { value: "opd_fee", label: "OPD Fee" },
      { value: "consultation", label: "Consultation" },
      { value: "treatment", label: "Treatment" },
      { value: "test", label: "Test" },
      { value: "invoice_payment", label: "Invoice" },
      { value: "advance", label: "Advance" },
      { value: "membership", label: "Membership" },
    ],
  },
];

const Payments = () => {
  // ── Patient search state ───────────────────────────────────────────────────
  const [patientQuery, setPatientQuery] = useState("");
  const [patientOptions, setPatientOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // ── Collect payment modal state ────────────────────────────────────────────
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectInvoice, setCollectInvoice] = useState(null);

  // ── Payment history table state ────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // ── Reversal state ─────────────────────────────────────────────────────────
  const [reverseDialogOpen, setReverseDialogOpen] = useState(false);
  const [reversalPayment, setReversalPayment] = useState(null);
  const [reversalReason, setReversalReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const { reversePayment, isReversing } = useAdminPaymentMutations();

  // ── Unpaid invoices (React Query, enabled only when patient selected) ───────
  const {
    data: unpaidData,
    isLoading: loadingUnpaid,
  } = usePatientUnpaidInvoices(selectedPatient?._id);

  // ── Payment history ────────────────────────────────────────────────────────
  const { data, isLoading, refetch } = usePayments({
    page,
    limit,
    search,
    ...filters,
    ...(fromDate && { from: fromDate }),
    ...(toDate && { to: toDate }),
  });

  const payments = data?.data || [];
  const pagination = data?.pagination || { total: 0 };

  // ── Patient search ─────────────────────────────────────────────────────────
  const fetchPatients = useCallback(async (q) => {
    setSearchLoading(true);
    try {
      const res = await searchPatients(q);
      setPatientOptions(res?.data?.patients || []);
    } catch {
      setPatientOptions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients("");
  }, [fetchPatients]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(patientQuery), 300);
    return () => clearTimeout(timer);
  }, [patientQuery, fetchPatients]);

  const handlePatientChange = (_, newValue) => {
    setSelectedPatient(newValue);
  };

  // ── Payment history handlers ───────────────────────────────────────────────
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const handleRowClick = (payment) => {
    setSelectedPayment(payment);
    setDetailModalOpen(true);
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    setPage(1);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    setPage(1);
  };

  const handleClearDates = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  // ── Reversal ───────────────────────────────────────────────────────────────
  const handleReverseConfirm = async () => {
    if (!reversalPayment || !reversalReason.trim()) return;
    const payNum = reversalPayment.paymentNumber || "Payment";
    try {
      await reversePayment({ paymentId: reversalPayment._id, reason: reversalReason.trim() });
      setReverseDialogOpen(false);
      setReversalPayment(null);
      setReversalReason("");
      setSnackbar({
        open: true,
        message: `${payNum} reversed successfully.`,
        severity: "success",
      });
      refetch();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to reverse payment.",
        severity: "error",
      });
    }
  };

  const allColumns = [
    ...paymentColumns,
    {
      field: "_id",
      headerName: "Reverse",
      minWidth: 80,
      align: "center",
      render: (_value, row) => {
        if (row.reversed || row.status === "reversed" || !row.settledInvoices?.length)
          return null;
        return (
          <Tooltip title="Reverse this payment">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                setReversalPayment(row);
                setReversalReason("");
                setReverseDialogOpen(true);
              }}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  // ── Unpaid invoice data ────────────────────────────────────────────────────
  const unpaidInvoices = unpaidData?.invoices || [];
  const patientInfo = unpaidData?.patient || {};
  const totalPending = unpaidData?.totalPending || 0;

  return (
    <Box>
      {/* ── PAGE HEADER ────────────────────────────────────────────────────── */}
      <Box className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Payments
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Collect payments against patient invoices
          </Typography>
        </Box>
      </Box>

      {/* ── PATIENT SEARCH SECTION ─────────────────────────────────────────── */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ pb: "16px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <PersonSearchIcon sx={{ color: "#1e3a5f" }} />
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#1e3a5f" }}>
              Search Patient to Collect Payment
            </Typography>
          </Box>

          <Autocomplete
            options={patientOptions}
            getOptionLabel={(opt) => opt?.name || ""}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            filterOptions={(x) => x}
            loading={searchLoading}
            value={selectedPatient}
            onChange={handlePatientChange}
            inputValue={patientQuery}
            onInputChange={(_, val, reason) => {
              if (reason !== "reset") setPatientQuery(val);
            }}
            noOptionsText={searchLoading ? "Searching…" : "No patients found"}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option._id}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {option.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.phone || "—"}
                    {option.email ? ` · ${option.email}` : ""}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Type patient name or phone…"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchLoading ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* ── UNPAID INVOICES SECTION (shown after patient selected) ────────── */}
      {selectedPatient && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ pb: "16px !important" }}>
            {loadingUnpaid ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Loading invoices…
                </Typography>
              </Box>
            ) : (
              <>
                {/* Patient header */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: 16 }}>
                      {patientInfo.name || selectedPatient.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {patientInfo.phone || selectedPatient.phone || "—"}
                    </Typography>
                  </Box>
                  {totalPending > 0 && (
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Pending
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ color: "#dc2626", lineHeight: 1.2 }}
                      >
                        ₹{fmt(totalPending)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {unpaidInvoices.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "#6b7280",
                      bgcolor: "#f9fafb",
                      borderRadius: 1.5,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      ✅ All invoices are paid
                    </Typography>
                    <Typography variant="body2">
                      {patientInfo.name || selectedPatient.name} has no outstanding balance.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f9fafb" }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Invoice #</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>Category</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 13 }} align="right">
                            Total
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 13 }} align="right">
                            Paid
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 13 }} align="right">
                            Balance Due
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 13 }} align="center">
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {unpaidInvoices.map((inv) => {
                          const catStyle =
                            CATEGORY_COLORS[inv.category] || CATEGORY_COLORS.Other;
                          return (
                            <TableRow
                              key={inv._id}
                              sx={{ "&:last-child td": { border: 0 } }}
                            >
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  sx={{ fontFamily: "monospace", color: "#4338ca" }}
                                >
                                  {inv.invoiceNumber}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontSize: 13 }}>
                                  {formatDate(inv.date)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box
                                  component="span"
                                  sx={{
                                    px: 1,
                                    py: 0.3,
                                    bgcolor: catStyle.bg,
                                    color: catStyle.color,
                                    borderRadius: "4px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                  }}
                                >
                                  {inv.category}
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontSize: 13 }}>
                                  ₹{fmt(inv.totalAmount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}
                                >
                                  ₹{fmt(inv.amountPaid)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  sx={{ color: "#dc2626", fontSize: 14 }}
                                >
                                  ₹{fmt(inv.balanceDue)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => {
                                    setCollectInvoice(inv);
                                    setCollectOpen(true);
                                  }}
                                  sx={{
                                    bgcolor: "#f59e0b",
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: 12,
                                    px: 1.5,
                                    "&:hover": { bgcolor: "#d97706" },
                                  }}
                                >
                                  Collect Payment
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── RECENT PAYMENTS ───────────────────────────────────────────────── */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: "#1e3a5f" }}>
          Recent Payments
        </Typography>
      </Box>

      <CompactFilterBar
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={handleFromDateChange}
        onToChange={handleToDateChange}
        onClearDates={handleClearDates}
        search={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search by payment number or patient…"
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onRefresh={refetch}
      />

      <DataTable
        columns={allColumns}
        data={payments}
        loading={isLoading}
        getRowStyle={(row) =>
          row.reversed || row.status === "reversed" ? { opacity: 0.55 } : undefined
        }
        pagination={{
          page,
          limit,
          total: pagination.total,
          onPageChange: setPage,
          onLimitChange: (newLimit) => {
            setLimit(newLimit);
            setPage(1);
          },
        }}
        onRowClick={handleRowClick}
        emptyMessage="No payments found"
      />

      {/* ── COLLECT PAYMENT MODAL ─────────────────────────────────────────── */}
      <CollectPaymentModal
        open={collectOpen}
        onClose={() => {
          setCollectOpen(false);
          setCollectInvoice(null);
        }}
        invoice={collectInvoice}
        patient={
          unpaidData?.patient || {
            name: selectedPatient?.name,
            phone: selectedPatient?.phone,
          }
        }
        onSuccess={(msg) => {
          setSnackbar({ open: true, message: msg, severity: "success" });
          refetch();
        }}
      />

      {/* ── ADD PAYMENT MODAL (legacy, keep for record button elsewhere) ─── */}
      <AddPaymentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* ── PAYMENT DETAIL MODAL ─────────────────────────────────────────── */}
      <PaymentDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        onRefund={() => refetch()}
        onDelete={() => {
          setDetailModalOpen(false);
          setSelectedPayment(null);
          refetch();
        }}
      />

      {/* ── REVERSAL CONFIRM DIALOG ───────────────────────────────────────── */}
      <Dialog
        open={reverseDialogOpen}
        onClose={() => !isReversing && setReverseDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reverse Payment</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {reversalPayment && (
            <Box sx={{ bgcolor: "#f3f4f6", borderRadius: 1.5, p: 1.5, mb: 2 }}>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25 }}>
                {reversalPayment.paymentNumber} &bull; ₹
                {fmt(reversalPayment.amount)} &bull;{" "}
                {reversalPayment.patient?.name || "Unknown"}
                {reversalPayment.patient?.phone
                  ? ` — ${reversalPayment.patient.phone}`
                  : ""}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {reversalPayment.paidAt
                  ? new Date(reversalPayment.paidAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}{" "}
                &bull; Mode:{" "}
                {reversalPayment.paymentMode
                  ? reversalPayment.paymentMode.charAt(0).toUpperCase() +
                    reversalPayment.paymentMode.slice(1)
                  : "—"}
              </Typography>
            </Box>
          )}
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              color: "#b45309",
              bgcolor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 1,
              p: 1.5,
            }}
          >
            ⚠️ This will undo all invoice settlements from this payment and restore previous
            balances.
          </Typography>
          <TextField
            label="Reason for reversal *"
            fullWidth
            multiline
            rows={2}
            size="small"
            value={reversalReason}
            onChange={(e) => setReversalReason(e.target.value)}
            placeholder="e.g. Payment recorded by mistake"
            disabled={isReversing}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setReverseDialogOpen(false)}
            disabled={isReversing}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReverseConfirm}
            disabled={!reversalReason.trim() || isReversing}
            startIcon={isReversing ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
              "&:disabled": { bgcolor: "#fca5a5" },
            }}
          >
            {isReversing ? "Reversing…" : "Reverse Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── SNACKBAR ────────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payments;
