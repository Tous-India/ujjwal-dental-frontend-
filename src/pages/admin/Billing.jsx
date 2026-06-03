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
  TextField,
  Paper,
  IconButton,
  Card,
  CardContent,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import DataTable from "../../components/common/DataTable";
import { useInvoices, useBillingStats } from "../../hooks/admin/useBilling";
import CreateInvoiceModal from "../../components/admin/modals/CreateInvoiceModal";
import InvoiceDetailModal from "../../components/admin/modals/InvoiceDetailModal";

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

      {/* Date Filter */}
      <Paper className="p-4 mb-4">
        <Box className="flex flex-wrap items-center gap-4">
          <Box className="flex items-center gap-2">
            <CalendarTodayIcon className="text-gray-500" fontSize="small" />
            <Typography variant="body2" className="text-gray-600 font-medium">
              Date Filter:
            </Typography>
          </Box>
          <TextField
            type="date"
            size="small"
            label="From Date"
            value={fromDate}
            onChange={handleFromDateChange}
            slotProps={{ inputLabel: { shrink: true } }}
            className="min-w-[160px]"
          />
          <TextField
            type="date"
            size="small"
            label="To Date"
            value={toDate}
            onChange={handleToDateChange}
            slotProps={{ inputLabel: { shrink: true } }}
            className="min-w-[160px]"
          />
          {(fromDate || toDate) && (
            <>
              <IconButton
                size="small"
                onClick={handleClearDates}
                className="text-gray-500 hover:text-red-500"
                title="Clear dates"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
              <Chip
                label={`${fromDate || "Start"} → ${toDate || "End"}`}
                size="small"
                variant="outlined"
                onDelete={handleClearDates}
                className="ml-2"
              />
            </>
          )}
        </Box>
      </Paper>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        searchPlaceholder="Search by invoice number or patient..."
        onSearch={handleSearch}
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={handleFilterChange}
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
        onRefresh={refetch}
        onRowClick={handleRowClick}
        emptyMessage="No invoices found"
      />

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
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
    </Box>
  );
};

export default Billing;
