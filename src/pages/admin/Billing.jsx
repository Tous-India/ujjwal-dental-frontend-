/**
 * Admin Billing Page
 *
 * Displays list of all invoices with:
 * - Stats cards (total invoices, amount, paid, balance due)
 * - Search by invoice number/patient
 * - Filter by status, payment status
 * - Date range filter
 * - Pagination
 * - Create new invoice
 * - View invoice details
 */
import { useState } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useQueryClient } from "@tanstack/react-query";
import InvoicePreviewModal from "../../components/InvoicePreviewModal";
import DataTable from "../../components/common/DataTable";
import CompactFilterBar from "../../components/common/CompactFilterBar";
import { useInvoices, useBillingStats } from "../../hooks/admin/useBilling";
import CreateInvoiceModal from "../../components/admin/modals/CreateInvoiceModal";
import InvoiceDetailModal from "../../components/admin/modals/InvoiceDetailModal";
import CollectPaymentModal from "../../components/admin/modals/CollectPaymentModal";

/**
 * Status color/label maps
 */
const statusColors = {
  draft: "default",
  sent: "info",
  partially_paid: "warning",
  paid: "success",
  overdue: "error",
  cancelled: "default",
};

const statusLabels = {
  draft: "Draft",
  sent: "Sent",
  partially_paid: "Partial Paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

const paymentStatusColors = {
  unpaid: "error",
  partial: "warning",
  paid: "success",
};

const paymentStatusLabels = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
};

/**
 * Table columns
 */
const columns = [
  {
    field: "invoiceNumber",
    headerName: "Invoice #",
    minWidth: 150,
    render: (value) => (
      <Typography variant="body2" className="font-mono font-medium text-indigo-600">
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
        <Avatar className="bg-indigo-100 text-indigo-600" sx={{ width: 32, height: 32 }}>
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
    field: "invoiceDate",
    headerName: "Date",
    minWidth: 110,
    type: "date",
  },
  {
    field: "items",
    headerName: "Items",
    minWidth: 80,
    render: (value) => (
      <Chip
        label={`${value?.length || 0} items`}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    field: "grandTotal",
    headerName: "Total",
    minWidth: 120,
    render: (value) => (
      <Typography variant="body2" className="font-numbers font-semibold">
        ₹{(value || 0).toLocaleString("en-IN")}
      </Typography>
    ),
  },
  {
    field: "amountPaid",
    headerName: "Paid",
    minWidth: 110,
    render: (value) => (
      <Typography variant="body2" className="font-numbers text-green-600">
        ₹{(value || 0).toLocaleString("en-IN")}
      </Typography>
    ),
  },
  {
    field: "balanceDue",
    headerName: "Balance",
    minWidth: 110,
    render: (value) => (
      <Typography
        variant="body2"
        className={`font-numbers ${value > 0 ? "text-red-600 font-medium" : "text-gray-500"}`}
      >
        ₹{(value || 0).toLocaleString("en-IN")}
      </Typography>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    minWidth: 130,
    render: (value) => (
      <Chip
        label={statusLabels[value] || value}
        size="small"
        color={statusColors[value] || "default"}
      />
    ),
  },
  {
    field: "paymentStatus",
    headerName: "Payment",
    minWidth: 100,
    render: (value) => (
      <Chip
        label={paymentStatusLabels[value] || value}
        size="small"
        color={paymentStatusColors[value] || "default"}
        variant="outlined"
      />
    ),
  },
];

/**
 * Filter options
 */
const filterOptions = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "draft", label: "Draft" },
      { value: "sent", label: "Sent" },
      { value: "partially_paid", label: "Partially Paid" },
      { value: "paid", label: "Paid" },
      { value: "overdue", label: "Overdue" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    key: "paymentStatus",
    label: "Payment",
    options: [
      { value: "unpaid", label: "Unpaid" },
      { value: "partial", label: "Partial" },
      { value: "paid", label: "Paid" },
    ],
  },
];

/**
 * Stat card component
 */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <Card variant="outlined">
    <CardContent className="flex items-center gap-3 py-3">
      <Box className={`p-2 rounded-lg ${color}`}>
        <Icon className="text-white" />
      </Box>
      <Box>
        <Typography variant="caption" className="text-gray-500">
          {label}
        </Typography>
        <Typography variant="h6" className="font-numbers font-bold leading-tight">
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const Billing = () => {
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectInvoice, setCollectInvoice] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Fetch data
  const { data, isLoading, refetch } = useInvoices({
    page,
    limit,
    search,
    ...filters,
    ...(fromDate && { from: fromDate }),
    ...(toDate && { to: toDate }),
  });

  const invoices = data?.data || [];
  const pagination = data?.pagination || { total: 0 };

  // Stats
  const { data: statsData } = useBillingStats({
    ...(fromDate && { from: fromDate }),
    ...(toDate && { to: toDate }),
  });
  const stats = statsData?.data?.stats || {};

  // Handlers
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    setPage(1);
  };

  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
    setDetailModalOpen(true);
  };

  const handleCreateSuccess = () => {
    refetch();
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

  const formatCurrency = (val) =>
    `₹${(val || 0).toLocaleString("en-IN")}`;

  const allColumns = [
    // Replace the balanceDue column in-place with an enhanced version that includes the Collect button
    ...columns.map((col) => {
      if (col.field !== "balanceDue") return col;
      return {
        ...col,
        minWidth: 170,
        render: (value, row) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              className={`font-numbers ${value > 0 ? "text-red-600 font-medium" : "text-gray-500"}`}
            >
              ₹{(value || 0).toLocaleString("en-IN")}
            </Typography>
            {value > 0 && row.paymentStatus !== "paid" && row.status !== "cancelled" && (
              <Button
                size="small"
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  setCollectInvoice(row);
                  setCollectOpen(true);
                }}
                sx={{
                  bgcolor: "#f59e0b",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "11px",
                  borderRadius: "6px",
                  px: 1.5,
                  py: 0.4,
                  minWidth: "auto",
                  lineHeight: 1.4,
                  "&:hover": { bgcolor: "#d97706" },
                }}
              >
                Collect
              </Button>
            )}
          </Box>
        ),
      };
    }),
    {
      field: "_id",
      headerName: "Preview",
      minWidth: 70,
      align: "center",
      render: (_value, row) => (
        <Tooltip title="Preview Invoice">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewInvoice(row);
              setPreviewOpen(true);
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Billing & Invoices
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Create and manage patient invoices
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Create Invoice
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} className="mb-4">
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={ReceiptLongIcon}
            label="Total Invoices"
            value={stats.totalInvoices || 0}
            color="bg-indigo-500"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={AttachMoneyIcon}
            label="Total Amount"
            value={formatCurrency(stats.totalAmount)}
            color="bg-blue-500"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={AccountBalanceWalletIcon}
            label="Total Paid"
            value={formatCurrency(stats.totalPaid)}
            color="bg-green-500"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={WarningAmberIcon}
            label="Balance Due"
            value={formatCurrency(stats.totalDue)}
            color="bg-red-500"
          />
        </Grid>
      </Grid>

      {/* Filters — single compact row */}
      <CompactFilterBar
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={handleFromDateChange}
        onToChange={handleToDateChange}
        onClearDates={handleClearDates}
        search={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search by invoice number or patient..."
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onRefresh={refetch}
      />

      {/* Data Table */}
      <DataTable
        columns={allColumns}
        data={invoices}
        loading={isLoading}
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
        emptyMessage="No invoices found"
      />

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoice={previewInvoice}
      />

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onRefresh={refetch}
      />

      {/* Collect Payment Modal */}
      <CollectPaymentModal
        open={collectOpen}
        onClose={() => {
          setCollectOpen(false);
          setCollectInvoice(null);
        }}
        invoice={collectInvoice}
        patient={collectInvoice?.patient}
        onSuccess={(msg) => {
          queryClient.invalidateQueries({ queryKey: ["admin", "billing"] });
          queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
          queryClient.invalidateQueries({ queryKey: ["admin", "unpaid-invoices"] });
          refetch();
          if (msg) setSnackbar({ open: true, message: msg, severity: "success" });
        }}
      />

      {/* Snackbar */}
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

export default Billing;
