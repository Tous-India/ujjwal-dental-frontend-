/**
 * Admin Payments Page
 *
 * Displays list of all payments with:
 * - Search by payment number/patient name
 * - Filter by status, payment mode, type
 * - Filter by date range
 * - Pagination (10 per page)
 * - Add new payment
 * - View payment details
 */
import { useState } from "react";
import { Box, Typography, Chip, Avatar, Button, TextField, Paper, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DataTable from "../../components/common/DataTable";
import { usePayments } from "../../hooks/admin/usePayments";
import AddPaymentModal from "../../components/admin/modals/AddPaymentModal";
import PaymentDetailModal from "../../components/admin/modals/PaymentDetailModal";

/**
 * Table columns configuration
 */
const columns = [
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
        ₹{(value || 0).toLocaleString("en-IN")}
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
    render: (value) => {
      const colors = {
        pending: "warning",
        paid: "success",
        failed: "error",
        refunded: "info",
        cancelled: "default",
      };
      return (
        <Chip
          label={value || "pending"}
          size="small"
          color={colors[value] || "default"}
          className="capitalize"
        />
      );
    },
  },
  {
    field: "clinic",
    headerName: "Clinic",
    minWidth: 120,
    render: (value) => (
      <Typography variant="body2">
        {value?.name || "-"}
      </Typography>
    ),
  },
  {
    field: "paidAt",
    headerName: "Paid At",
    minWidth: 120,
    type: "date",
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
  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  // Date filter state
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Fetch payments with date filters
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

  const handleAddSuccess = () => {
    refetch();
  };

  const handleRefund = () => {
    refetch();
  };

  // Handle date filter change
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
    setPage(1);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
    setPage(1);
  };

  // Clear date filters
  const handleClearDates = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <Box>
      {/* Header */}
      <Box className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Payments
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Manage all payment transactions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          Record Payment
        </Button>
      </Box>

      {/* Date Filter Section */}
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
            <IconButton
              size="small"
              onClick={handleClearDates}
              className="text-gray-500 hover:text-red-500"
              title="Clear dates"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
          {(fromDate || toDate) && (
            <Chip
              label={`${fromDate || "Start"} → ${toDate || "End"}`}
              size="small"
              variant="outlined"
              onDelete={handleClearDates}
              className="ml-2"
            />
          )}
        </Box>
      </Paper>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={payments}
        loading={isLoading}
        searchPlaceholder="Search by payment number or patient..."
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
        emptyMessage="No payments found"
      />

      {/* Add Payment Modal */}
      <AddPaymentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedPayment(null);
        }}
        payment={selectedPayment}
        onRefund={handleRefund}
        onDelete={() => {
          setDetailModalOpen(false);
          setSelectedPayment(null);
          refetch();
        }}
      />
    </Box>
  );
};

export default Payments;
