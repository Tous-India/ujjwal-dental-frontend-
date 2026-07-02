/**
 * Admin Appointments Page
 *
 * Displays list of all appointments with:
 * - Search by patient name/phone
 * - Filter by status, type
 * - Pagination (10 per page)
 * - Click to view appointment details in modal
 * - Add, Edit, Cancel appointment via modals
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import DownloadIcon from "@mui/icons-material/Download";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AppointmentSlipPreviewModal from "../../components/AppointmentSlipPreviewModal";
import DataTable from "../../components/common/DataTable";
import { useAppointments, useAppointmentMutations } from "../../hooks/admin/useAppointments";
import {
  getFeeSettings,
  updateFeeSettings,
} from "../../api/admin/settings.api";
import AppointmentDetailModal from "../../components/admin/modals/AppointmentDetailModal";
import AddAppointmentModal from "../../components/admin/modals/AddAppointmentModal";
import EditAppointmentModal from "../../components/admin/modals/EditAppointmentModal";
import CancelAppointmentModal from "../../components/admin/modals/CancelAppointmentModal";
import RescheduleAppointmentModal from "../../components/admin/modals/RescheduleAppointmentModal";

/**
 * Status color mapping
 */
const statusColors = {
  scheduled: "info",
  confirmed: "primary",
  checked_in: "warning",
  in_progress: "warning",
  completed: "success",
  cancelled: "error",
  no_show: "default",
};

/**
 * Table columns
 */
const columns = [
  {
    field: "appointmentNumber",
    headerName: "Appt #",
    minWidth: 110,
    render: (value) => (
      <Typography variant="body2" className="font-mono font-medium" sx={{ fontSize: '12px' }}>
        {value || "-"}
      </Typography>
    ),
  },
  {
    field: "patient",
    headerName: "Patient",
    minWidth: 160,
    render: (value) => (
      <Box>
        <Typography variant="body2" className="font-medium" sx={{ fontSize: '12px' }}>
          {value?.name || "Unknown"}
        </Typography>
        <Typography variant="caption" className="text-gray-500">
          {value?.phone || "-"}
        </Typography>
      </Box>
    ),
  },
  {
    field: "date",
    headerName: "Date",
    minWidth: 100,
    render: (value) =>
      value ? new Date(value).toLocaleDateString("en-IN") : "-",
  },
  {
    field: "timeSlot",
    headerName: "Time",
    minWidth: 80,
  },
  {
    field: "tokenNumber",
    headerName: "Token",
    minWidth: 65,
    render: (value) => (
      <Typography variant="body2" className="font-numbers font-medium">
        {value ? `#${value}` : "-"}
      </Typography>
    ),
  },
  {
    field: "type",
    headerName: "Type",
    minWidth: 95,
    render: (value) => (
      <Chip
        size="small"
        label={value?.replace("_", " ") || "regular"}
        variant="outlined"
        className="capitalize"
        sx={{ fontSize: '11px' }}
      />
    ),
  },
  {
    field: "visitType",
    headerName: "Visit Type",
    minWidth: 120,
    render: (value, row) => (
      <Box className="flex items-center gap-1 flex-wrap">
        <Chip
          size="small"
          label={value === "treatment" ? "Treatment" : "OPD"}
          color={value === "treatment" ? "warning" : "info"}
          title={row?.treatmentId?.name || row?.treatmentName || ""}
          sx={{ fontSize: '11px' }}
        />
        {row?.appointmentType === "emergency" && (
          <Chip size="small" label="Emergency" sx={{ bgcolor: "#dc2626", color: "#fff", fontWeight: 700, fontSize: '11px' }} />
        )}
      </Box>
    ),
  },
  {
    field: "fee",
    headerName: "Fee",
    minWidth: 85,
    render: (_, row) => {
      if (row?.isFree) {
        return (
          <Typography variant="body2" className="font-numbers text-gray-500">
            Free
          </Typography>
        );
      }
      const amount = row?.invoice?.grandTotal ?? row?.fee ?? row?.opdFee ?? 0;
      return (
        <Typography variant="body2" className="font-numbers font-medium">
          ₹{(amount || 0).toLocaleString("en-IN")}
        </Typography>
      );
    },
  },
  {
    field: "status",
    headerName: "Status",
    minWidth: 130,
    render: (value) => (
      <Chip
        size="small"
        label={value?.replace("_", " ") || "scheduled"}
        color={statusColors[value] || "default"}
        className="capitalize"
        sx={{ fontSize: '11px' }}
      />
    ),
  },
  {
    field: "paymentStatus",
    headerName: "Payment",
    minWidth: 120,
    render: (_, row) => {
      if (row?.isFree) {
        return <Chip size="small" label="Free" color="info" variant="outlined" />;
      }
      const ps = row?.invoice?.paymentStatus;
      if (ps) {
        const map = {
          paid: { label: "Paid", color: "success" },
          partial: { label: "Partially Paid", color: "warning" },
          unpaid: { label: "Unpaid", color: "error" },
        };
        const cfg = map[ps] || { label: ps, color: "default" };
        return <Chip size="small" label={cfg.label} color={cfg.color} variant="outlined" />;
      }
      // Fallback for legacy appointments without an invoice
      return (
        <Chip
          size="small"
          label={row?.opdFeePaid ? "Paid" : "Unpaid"}
          color={row?.opdFeePaid ? "success" : "error"}
          variant="outlined"
        />
      );
    },
  },
];

// Mongoose applies the "unpaid" schema default to old docs on read, so row.paymentStatus is
// always truthy and can't be used as a short-circuit. Check isFree first, then explicit values.
const rowPaymentStatus = (row) => {
  if (row?.isFree) return "free";
  if (row?.paymentStatus === "paid" || row?.paymentStatus === "free") return row.paymentStatus;
  if (row?.invoice?.paymentStatus === "paid") return "paid";
  return "unpaid";
};

// Function to get columns with action handlers
const getColumns = (onDeleteRow, onCancelRow, onPreviewSlip, onEditRow, onPaymentStatusChange, updatingPaymentId, onStatusChange, updatingStatusId, onRescheduleRow) => [
  ...columns.filter((c) => c.field !== "paymentStatus" && c.field !== "status"),
  {
    field: "status",
    headerName: "Status",
    minWidth: 140,
    render: (value, row) => {
      const isTerminal = ["completed", "cancelled", "no_show"].includes(value);
      if (isTerminal) {
        return (
          <Chip
            size="small"
            label={value?.replace("_", " ") || ""}
            color={statusColors[value] || "default"}
            className="capitalize"
            sx={{ fontSize: '11px' }}
          />
        );
      }
      return (
        <Select
          value={value || "scheduled"}
          size="small"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onStatusChange(row, e.target.value);
          }}
          disabled={updatingStatusId === row._id}
          sx={{
            height: 28,
            fontSize: "12px",
            "& .MuiSelect-select": { py: 0.5, px: 1 },
            "& fieldset": { borderColor: "#e5e7eb" },
          }}
        >
          <MenuItem value="scheduled" dense>Scheduled</MenuItem>
          <MenuItem value="in_progress" dense>In Progress</MenuItem>
          <MenuItem value="completed" dense>Completed</MenuItem>
        </Select>
      );
    },
  },
  {
    field: "paymentStatus",
    headerName: "Payment",
    minWidth: 120,
    render: (_, row) => {
      const current = rowPaymentStatus(row);
      return (
        <Select
          value={current}
          size="small"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onPaymentStatusChange(row, e.target.value);
          }}
          disabled={updatingPaymentId === row._id}
          sx={{
            height: 28,
            fontSize: "12px",
            "& .MuiSelect-select": { py: 0.5, px: 1 },
            "& fieldset": { borderColor: "#e5e7eb" },
          }}
        >
          <MenuItem value="paid" dense>Paid</MenuItem>
          <MenuItem value="unpaid" dense>Unpaid</MenuItem>
          <MenuItem value="free" dense>Free</MenuItem>
        </Select>
      );
    },
  },
  {
    field: "_actions",
    headerName: "Actions",
    minWidth: 160,
    render: (_, row) => {
      const canCancel = !["cancelled", "completed", "no_show"].includes(row?.status);
      const canReschedule = ["scheduled", "confirmed"].includes(row?.status);
      return (
        <Box className="flex items-center gap-1">
          <IconButton
            size="small"
            title="Preview Appointment Slip"
            onClick={(e) => {
              e.stopPropagation();
              onPreviewSlip(row);
            }}
            sx={{ color: "#f59e0b" }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            title="Edit Appointment"
            onClick={(e) => {
              e.stopPropagation();
              onEditRow(row);
            }}
            sx={{ color: "#6366f1" }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          {canReschedule && (
            <IconButton
              size="small"
              title="Reschedule Appointment"
              onClick={(e) => {
                e.stopPropagation();
                onRescheduleRow(row);
              }}
              sx={{ color: "#0891b2" }}
            >
              <EventRepeatIcon fontSize="small" />
            </IconButton>
          )}
          {canCancel && (
            <IconButton
              size="small"
              title="Cancel Appointment"
              onClick={(e) => {
                e.stopPropagation();
                onCancelRow(row);
              }}
              sx={{ color: "#dc2626" }}
            >
              <EventBusyIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            color="error"
            title="Delete Permanently"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRow(row);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    },
  },
];

/**
 * Filters
 */
const filterOptions = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "scheduled", label: "Scheduled" },
      { value: "confirmed", label: "Confirmed" },
      { value: "checked_in", label: "Checked In" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
  {
    key: "appointmentType",
    label: "Urgency",
    options: [
      { value: "regular", label: "Regular" },
      { value: "emergency", label: "Emergency" },
    ],
  },
  {
    key: "visitType",
    label: "Visit Type",
    options: [
      { value: "opd", label: "OPD" },
      { value: "treatment", label: "Treatment" },
    ],
  },
];

const Appointments = () => {
  // Table state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [slipPreviewOpen, setSlipPreviewOpen] = useState(false);
  const [slipAppointment, setSlipAppointment] = useState(null);

  // Delete + update mutations
  const { deleteAppointment, isDeleting: isDeletingAppointment, updateAppointment: updateApptMutation } = useAppointmentMutations();

  // Payment status dropdown — update appointment + sync invoice via backend
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [dateFilter, setDateFilter] = useState("");

  const handlePaymentStatusChange = (row, newStatus) => {
    setUpdatingPaymentId(row._id);
    updateApptMutation(
      { id: row._id, data: { paymentStatus: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Payment status updated to ${newStatus}`);
          refetch();
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to update payment status"),
        onSettled: () => setUpdatingPaymentId(null),
      }
    );
  };

  const handleStatusChange = (row, newStatus) => {
    setUpdatingStatusId(row._id);
    updateApptMutation(
      { id: row._id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
          refetch();
        },
        onError: (err) =>
          toast.error(err.response?.data?.message || "Failed to update status"),
        onSettled: () => setUpdatingStatusId(null),
      }
    );
  };

  // Delete guard — appointment must be cancelled first
  const handleDeleteRow = (row) => {
    if (row.status !== "cancelled") {
      toast.warning("Please cancel the appointment before deleting.");
      return;
    }
    setConfirmDelete(row);
  };

  // Fee settings state
  const [feeSettings, setFeeSettings] = useState({
    opdFeeRegular: 300,
    opdFeeEmergency: 500,
  });
  const [feeLoading, setFeeLoading] = useState(true);
  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [feeForm, setFeeForm] = useState({
    opdFeeRegular: 300,
    opdFeeEmergency: 500,
  });
  const [feeUpdating, setFeeUpdating] = useState(false);
  const [feeError, setFeeError] = useState("");

  // Fetch fee settings on mount
  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await getFeeSettings();
        if (res.data?.fees) {
          setFeeSettings(res.data.fees);
          setFeeForm(res.data.fees);
        }
      } catch (err) {
        console.error("Failed to fetch fee settings:", err);
      } finally {
        setFeeLoading(false);
      }
    };
    fetchFees();
  }, []);

  // Handle fee update
  const handleFeeUpdate = async () => {
    setFeeError("");
    setFeeUpdating(true);
    try {
      const res = await updateFeeSettings(feeForm);
      if (res.data?.fees) {
        setFeeSettings(res.data.fees);
      }
      setFeeModalOpen(false);
    } catch (err) {
      setFeeError(err.response?.data?.message || "Failed to update fees");
    } finally {
      setFeeUpdating(false);
    }
  };

  // Fetch appointments with React Query
  const { data, isLoading, refetch } = useAppointments({
    page,
    limit,
    search,
    ...filters,
  });

  // Extract data from response
  const appointments = data?.data || [];
  const pagination = data?.pagination || { total: 0 };

  // console.log(appointments,"apppointent");
  /**
   * Handle search
   */
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPage(1);
  };

  /**
   * Row click → open detail modal
   */
  const handleRowClick = (row) => {
    setSelectedAppointment(row);
    setDetailModalOpen(true);
  };

  /**
   * Handle add button click
   */
  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  /**
   * Handle edit from detail modal
   */
  const handleEditAppointment = (appointment) => {
    setDetailModalOpen(false);
    setSelectedAppointment(appointment);
    setEditModalOpen(true);
  };

  /**
   * Handle cancel from detail modal
   */
  const handleCancelAppointment = (appointment) => {
    setDetailModalOpen(false);
    setSelectedAppointment(appointment);
    setCancelModalOpen(true);
  };

  /**
   * Handle appointment created
   */
  const handleAppointmentCreated = () => {
    setAddModalOpen(false);
    refetch();
  };

  /**
   * Handle appointment updated
   */
  const handleAppointmentUpdated = () => {
    refetch();
  };

  /**
   * Handle appointment cancelled
   */
  const handleAppointmentCancelled = () => {
    refetch();
  };

  /**
   * Handle delete appointment from detail modal
   */
  const handleDeleteAppointment = (appointment) => {
    deleteAppointment(appointment._id, {
      onSuccess: () => {
        toast.success("Deleted successfully");
        setDetailModalOpen(false);
        setSelectedAppointment(null);
        refetch();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to delete appointment");
      },
    });
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const apptDate = new Date(dateStr);
    const today = new Date();
    return (
      apptDate.getDate() === today.getDate() &&
      apptDate.getMonth() === today.getMonth() &&
      apptDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800 mb-2!">
            Appointments
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Manage all appointments
          </Typography>
        </Box>

        <Box className="flex flex-wrap items-center gap-3">
          {/* OPD Fees Display */}
          <Paper className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg w-70%]">
            <CurrencyRupeeIcon className="text-green-600" fontSize="small" />
            <Box className="flex gap-3">
              <Box className="text-center">
                <Typography
                  variant="caption"
                  className="text-gray-500 block text-xs"
                >
                  Regular
                </Typography>
                <Typography variant="body2" className="font-numbers font-bold text-gray-800">
                  {feeLoading ? "..." : `₹${feeSettings.opdFeeRegular}`}
                </Typography>
              </Box>
              <Box className="text-center">
                <Typography
                  variant="caption"
                  className="text-gray-500 block text-xs"
                >
                  Emergency
                </Typography>
                <Typography variant="body2" className="font-numbers font-bold text-red-600">
                  {feeLoading ? "..." : `₹${feeSettings.opdFeeEmergency}`}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => {
                setFeeForm(feeSettings);
                setFeeError("");
                setFeeModalOpen(true);
              }}
              className="text-gray-500 hover:text-indigo-600"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Paper>

          <Button
            variant={dateFilter === "yesterday" ? "contained" : "outlined"}
            onClick={() => {
              if (dateFilter === "yesterday") {
                setDateFilter("");
                setFilters((prev) => { const f = { ...prev }; delete f.date; return f; });
              } else {
                setDateFilter("yesterday");
                const d = new Date();
                d.setDate(d.getDate() - 1);
                setFilters((prev) => ({ ...prev, date: d.toISOString().split("T")[0] }));
              }
              setPage(1);
            }}
            sx={{
              textTransform: "none",
              fontSize: "12px",
              fontWeight: 600,
              px: 1.5,
              height: 36,
              minWidth: 0,
              ...(dateFilter === "yesterday"
                ? { backgroundColor: "#6366f1", "&:hover": { backgroundColor: "#4f46e5" } }
                : { borderColor: "#d1d5db", color: "#374151" }),
            }}
          >
            Yesterday
          </Button>
          <Button
            variant={dateFilter === "today" ? "contained" : "outlined"}
            onClick={() => {
              if (dateFilter === "today") {
                setDateFilter("");
                setFilters((prev) => { const f = { ...prev }; delete f.date; return f; });
              } else {
                setDateFilter("today");
                setFilters((prev) => ({ ...prev, date: new Date().toISOString().split("T")[0] }));
              }
              setPage(1);
            }}
            sx={{
              textTransform: "none",
              fontSize: "12px",
              fontWeight: 600,
              px: 1.5,
              height: 36,
              minWidth: 0,
              ...(dateFilter === "today"
                ? { backgroundColor: "#3b82f6", "&:hover": { backgroundColor: "#2563eb" } }
                : { borderColor: "#d1d5db", color: "#374151" }),
            }}
          >
            Today
          </Button>
          <TextField
            type="date"
            size="small"
            value={dateFilter === "custom" ? (filters.date || "") : ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                setDateFilter("custom");
                setFilters((prev) => ({ ...prev, date: val }));
              } else {
                setDateFilter("");
                setFilters((prev) => { const f = { ...prev }; delete f.date; return f; });
              }
              setPage(1);
            }}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: 150,
              "& .MuiInputBase-root": { height: 36, fontSize: "12px" },
              "& .MuiInputBase-input": { py: 0.5, px: 1 },
            }}
          />
          {dateFilter && (
            <Button
              variant="text"
              onClick={() => {
                setDateFilter("");
                setFilters((prev) => { const f = { ...prev }; delete f.date; return f; });
                setPage(1);
              }}
              sx={{
                textTransform: "none",
                fontSize: "11px",
                color: "#6b7280",
                minWidth: 0,
                px: 1,
                height: 36,
              }}
            >
              Clear
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{
              textTransform: "none",
              fontSize: "13px",
              fontWeight: 600,
              height: 36,
              px: 2,
              whiteSpace: "nowrap",
            }}
          >
            New Appointment
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <DataTable
        columns={getColumns(
          handleDeleteRow,
          (row) => { setSelectedAppointment(row); setCancelModalOpen(true); },
          (row) => { setSlipAppointment(row); setSlipPreviewOpen(true); },
          (row) => { setSelectedAppointment(row); setEditModalOpen(true); },
          handlePaymentStatusChange,
          updatingPaymentId,
          handleStatusChange,
          updatingStatusId,
          (row) => { setSelectedAppointment(row); setRescheduleModalOpen(true); },
        )}
        getRowSx={(row) => {
          const today = isToday(row?.date);
          const unpaid = rowPaymentStatus(row) === "unpaid";
          if (today) {
            return {
              backgroundColor: "#eff6ff",
              borderLeft: "3px solid #3b82f6",
              "&:hover": { backgroundColor: "#dbeafe" },
            };
          }
          if (unpaid) {
            return {
              backgroundColor: "#fef2f2",
              "&:hover": { backgroundColor: "#fee2e2" },
            };
          }
          return {};
        }}
        data={appointments}
        loading={isLoading}
        searchPlaceholder="Search patient name or phone..."
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
        onRowClick={handleRowClick}
        onRefresh={refetch}
        emptyMessage="No appointments found"
      />

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
        onDelete={handleDeleteAppointment}
      />

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAppointmentCreated}
      />

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        appointment={selectedAppointment}
        onSuccess={handleAppointmentUpdated}
      />

      {/* Cancel Appointment Modal */}
      <CancelAppointmentModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        appointment={selectedAppointment}
        onSuccess={handleAppointmentCancelled}
      />

      {/* Reschedule Appointment Modal */}
      <RescheduleAppointmentModal
        open={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        appointment={selectedAppointment}
        onSuccess={() => { setRescheduleModalOpen(false); refetch(); }}
      />

      {/* Appointment Slip Preview Modal */}
      <AppointmentSlipPreviewModal
        open={slipPreviewOpen}
        onClose={() => { setSlipPreviewOpen(false); setSlipAppointment(null); }}
        appointment={slipAppointment}
      />

      {/* Fee Settings Modal */}
      <Dialog
        open={feeModalOpen}
        onClose={() => !feeUpdating && setFeeModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="bg-indigo-600 text-white">
          <Box className="flex items-center gap-2">
            <CurrencyRupeeIcon />
            <Typography variant="h6">Update OPD Fees</Typography>
          </Box>
        </DialogTitle>
        <DialogContent className="mt-4">
          {feeError && (
            <Alert severity="error" className="mb-4">
              {feeError}
            </Alert>
          )}
          <Box className="flex flex-col gap-4 mt-2">
            <TextField
              label="Regular OPD Fee (₹)"
              type="number"
              value={feeForm.opdFeeRegular}
              onChange={(e) =>
                setFeeForm((prev) => ({
                  ...prev,
                  opdFeeRegular: Number(e.target.value),
                }))
              }
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Emergency OPD Fee (₹)"
              type="number"
              value={feeForm.opdFeeEmergency}
              onChange={(e) =>
                setFeeForm((prev) => ({
                  ...prev,
                  opdFeeEmergency: Number(e.target.value),
                }))
              }
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions className="p-4 bg-gray-50">
          <Button
            onClick={() => setFeeModalOpen(false)}
            disabled={feeUpdating}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleFeeUpdate}
            disabled={feeUpdating}
            className="bg-indigo-600 hover:bg-indigo-700"
            startIcon={
              feeUpdating && <CircularProgress size={16} color="inherit" />
            }
          >
            {feeUpdating ? "Updating..." : "Update Fees"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          deleteAppointment(confirmDelete._id, {
            onSuccess: () => {
              toast.success("Appointment deleted successfully");
              setConfirmDelete(null);
            },
            onError: (err) => toast.error(err.response?.data?.message || "Delete failed"),
          });
        }}
        title="Delete Appointment"
        message={`Are you sure you want to delete "${confirmDelete?.appointmentNumber || ""}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={isDeletingAppointment}
      />
    </Box>
  );
};

export default Appointments;
