/**
 * Admin Patients Page
 *
 * Displays list of all patients with:
 * - Search by name/phone
 * - Filter by membership status
 * - Pagination (10 per page)
 * - Click to view patient details in modal
 * - Add, Edit, Delete (soft) patient via modals
 */
import React, { useState } from "react";
import { Box, Typography, Button, Avatar, Chip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "../../components/common/DataTable";
import { usePatients, usePatientMutations } from "../../hooks/admin/usePatients";
import PatientDetailModal from "../../components/admin/modals/PatientDetailModal";
import AddPatientModal from "../../components/admin/modals/AddPatientModal";
import EditPatientModal from "../../components/admin/modals/EditPatientModal";
import DeleteConfirmModal from "../../components/common/DeleteConfirmModal";

/**
 * Table columns configuration
 */
const columns = [
  {
    field: "name",
    headerName: "Patient Name",
    minWidth: 200,
    render: (value, row) => (
      <Box className="flex items-center gap-3">
        <Avatar className="bg-blue-100 text-blue-600" sx={{ width: 36, height: 36 }}>
          {value?.[0]?.toUpperCase() || "P"}
        </Avatar>
        <Box>
          <Typography variant="body2" className="font-medium">
            {value || "Unknown"}
          </Typography>
          <Typography variant="caption" className="text-gray-500">
            {row.email || "No email"}
          </Typography>
        </Box>
      </Box>
    ),
  },
  {
    field: "phone",
    headerName: "Phone",
    minWidth: 130,
  },
  {
    field: "gender",
    headerName: "Gender",
    minWidth: 100,
    render: (value) => (
      <span className="capitalize">{value || "-"}</span>
    ),
  },
  {
    field: "bloodGroup",
    headerName: "Blood Group",
    minWidth: 100,
    render: (value) => value || "-",
  },
  {
    field: "membership",
    headerName: "Membership",
    minWidth: 130,
    render: (value) => {
      if (!value?.status) {
        return <Chip label="None" size="small" variant="outlined" />;
      }
      const colors = {
        active: "success",
        expired: "error",
        cancelled: "default",
      };
      return (
        <Chip
          label={value.planName || value.status}
          size="small"
          color={colors[value.status] || "default"}
        />
      );
    },
  },
  {
    field: "createdAt",
    headerName: "Registered",
    minWidth: 120,
    type: "date",
  },
  {
    field: "isActive",
    headerName: "Status",
    minWidth: 100,
    render: (value) => (
      <Chip
        label={value ? "Active" : "Inactive"}
        size="small"
        color={value ? "success" : "default"}
      />
    ),
  },
];

/**
 * Filter options
 */
const filterOptions = [
  {
    key: "membership",
    label: "Membership",
    options: [
      { value: "active", label: "Active" },
      { value: "expired", label: "Expired" },
      { value: "none", label: "No Membership" },
    ],
  },
  {
    key: "isActive",
    label: "Status",
    options: [
      { value: "true", label: "Active" },
      { value: "false", label: "Inactive" },
    ],
  },
];

const Patients = () => {
  // Pagination and filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  // Modal state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Fetch patients with React Query
  const { data, isLoading, refetch } = usePatients({
    page,
    limit,
    search,
    ...filters,
  });

  // Mutations
  const { deletePatient, isDeleting } = usePatientMutations();

  // Extract data from response
  const patients = data?.data || [];
  const pagination = data?.pagination || { total: 0 };

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
   * Handle row click - open patient detail modal
   */
  const handleRowClick = (row) => {
    setSelectedPatient(row);
    setDetailModalOpen(true);
  };

  /**
   * Handle add patient button click
   */
  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  /**
   * Handle patient created successfully
   */
  const handlePatientCreated = () => {
    refetch();
  };

  /**
   * Handle edit patient from detail modal
   */
  const handleEditPatient = (patient) => {
    setDetailModalOpen(false);
    setSelectedPatient(patient);
    setEditModalOpen(true);
  };

  /**
   * Handle delete patient from detail modal
   */
  const handleDeletePatient = (patient) => {
    setDetailModalOpen(false);
    setSelectedPatient(patient);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  /**
   * Confirm delete patient
   */
  const handleConfirmDelete = () => {
    if (!selectedPatient) return;

    deletePatient(selectedPatient._id, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        setSelectedPatient(null);
        refetch();
      },
      onError: (error) => {
        setDeleteError(
          error.response?.data?.message || "Failed to deactivate patient"
        );
      },
    });
  };

  /**
   * Handle patient updated successfully
   */
  const handlePatientUpdated = () => {
    refetch();
  };

  return (
    <Box>
      {/* Page Header */}
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Patients
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Manage all registered patients
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="bg-blue-600 hover:bg-blue-700"
          onClick={handleAddClick}
        >
          Add Patient
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={patients}
        loading={isLoading}
        searchPlaceholder="Search by name or phone..."
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
        emptyMessage="No patients found"
      />

      {/* Patient Detail Modal */}
      <PatientDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        patient={selectedPatient}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
      />

      {/* Add Patient Modal */}
      <AddPatientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handlePatientCreated}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        patient={selectedPatient}
        onSuccess={handlePatientUpdated}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Deactivate Patient"
        itemName={selectedPatient?.name}
        itemType="patient"
        isDeleting={isDeleting}
        error={deleteError}
        softDelete={true}
      />
    </Box>
  );
};

export default Patients;
