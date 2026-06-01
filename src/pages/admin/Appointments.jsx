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
} from "@mui/material";
import { toast } from "react-toastify";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
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
    minWidth: 140,
    render: (value) => (
      <Typography variant="body2" className="font-mono font-medium">
        {value || "-"}
      </Typography>
    ),
  },
  {
    field: "patient",
    headerName: "Patient",
    minWidth: 200,
    render: (value) => (
      <Box className="flex items-center gap-2">
        <Avatar
          sx={{ width: 32, height: 32 }}
          className="bg-indigo-100 text-indigo-600"
        >
          {value?.name?.[0]?.toUpperCase() || "P"}
        </Avatar>
        <Box>
          <Typography variant="body2" className="font-medium">
            {value?.name || "Unknown"}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {value?.phone || "-"}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    field: "date",
    headerName: "Date",
    minWidth: 120,
    render: (value) =>
      value ? new Date(value).toLocaleDateString("en-IN") : "-",
  },
  {
    field: "timeSlot",
    headerName: "Time",
    minWidth: 100,
  },
  {
    field: "type",
    headerName: "Type",
    minWidth: 110,
    render: (value) => (
      <Chip
        size="small"
        label={value?.replace("_", " ") || "regular"}
        variant="outlined"
        className="capitalize"
      />
    ),
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
      />
    ),
  },
  {
    field: "opdFeePaid",
    headerName: "Payment",
    minWidth: 100,
    render: (value, row) => {
      // Show "Free" badge if appointment is free
      if (row?.isFree) {
        return (
          <Chip size="small" label="Free" color="info" variant="outlined" />
        );
      }
      return (
        <Chip
          size="small"
          label={value ? "Paid" : "Pending"}
          color={value ? "success" : "warning"}
          variant="outlined"
        />
      );
    },
  },
];

// Function to get columns with action handlers
const getColumns = (onDeleteRow) => [
  ...columns,
  {
    field: "_actions",
    headerName: "Actions",
    minWidth: 80,
    render: (_, row) => (
      <IconButton
        size="small"
        color="error"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteRow(row);
        }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    ),
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
    key: "type",
    label: "Type",
    options: [
      { value: "regular", label: "Regular" },
      { value: "emergency", label: "Emergency" },
      { value: "follow_up", label: "Follow Up" },
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
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Delete mutation
  const { deleteAppointment, isDeleting: isDeletingAppointment } = useAppointmentMutations();

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
                <Typography variant="body2" className="font-bold text-gray-800">
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
                <Typography variant="body2" className="font-bold text-red-600">
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
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            className="bg-[#1976d2] hover:[#1976d2] whitespace-nowrap py-4!"
          >
            New Appointment
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <DataTable
        columns={getColumns((row) => setConfirmDelete(row))}
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
