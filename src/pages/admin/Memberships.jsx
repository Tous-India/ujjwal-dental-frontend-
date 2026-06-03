/**
 * Admin Membership Plans Page
 *
 * Full CRUD management for membership plans.
 * Features:
 * - List all plans with DataTable
 * - Add, edit, delete plans via modals
 * - Filter by type, tier, status
 */
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "../../components/common/DataTable";
import {
  useMembershipPlans,
  useMembershipMutations,
} from "../../hooks/admin/useMemberships";
import AddMembershipModal from "../../components/admin/modals/AddMembershipModal";
import EditMembershipModal from "../../components/admin/modals/EditMembershipModal";
import MembershipDetailModal from "../../components/admin/modals/MembershipDetailModal";
import CouponVerifySection from "../../components/admin/CouponVerifySection";

/**
 * Tier colors
 */
const tierColors = {
  silver: "default",
  gold: "warning",
  platinum: "info",
};

/**
 * Table columns
 */
const columns = [
  {
    field: "name",
    headerName: "Plan Name",
    minWidth: 180,
    render: (value) => (
      <Typography variant="body2" className="font-medium">
        {value}
      </Typography>
    ),
  },
  {
    field: "code",
    headerName: "Code",
    minWidth: 120,
    render: (value) => (
      <Typography variant="body2" className="font-mono text-gray-600">
        {value}
      </Typography>
    ),
  },
  {
    field: "type",
    headerName: "Type",
    minWidth: 110,
    render: (value) => (
      <Chip
        label={value}
        size="small"
        variant="outlined"
        color={value === "family" ? "secondary" : "primary"}
        className="capitalize"
      />
    ),
  },
  {
    field: "tier",
    headerName: "Tier",
    minWidth: 100,
    render: (value) => (
      <Chip
        label={value}
        size="small"
        color={tierColors[value] || "default"}
        className="capitalize"
      />
    ),
  },
  {
    field: "price",
    headerName: "Price",
    minWidth: 120,
    render: (_, row) => (
      <Typography variant="body2" className="font-numbers font-semibold text-green-600">
        {row.priceDisplay || `₹${row.price?.toLocaleString("en-IN")}`}
      </Typography>
    ),
  },
  {
    field: "discountPercentage",
    headerName: "Discount",
    minWidth: 100,
    render: (value) => (
      <Chip label={`${value}%`} size="small" color="success" variant="outlined" />
    ),
  },
  {
    field: "durationMonths",
    headerName: "Duration",
    minWidth: 100,
    render: (value) => `${value} months`,
  },
  {
    field: "maxMembers",
    headerName: "Members",
    minWidth: 90,
    render: (value) => value,
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

const Memberships = () => {
  // Search and filter state
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // React Query
  const { data, isLoading, refetch } = useMembershipPlans();
  const { deletePlan, isDeleting } = useMembershipMutations();

  const plans = data?.data?.plans || [];

  /**
   * Client-side search & filter
   */
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        !search ||
        plan.name.toLowerCase().includes(search.toLowerCase()) ||
        plan.code.toLowerCase().includes(search.toLowerCase());

      const matchesType = !filters.type || plan.type === filters.type;
      const matchesTier = !filters.tier || plan.tier === filters.tier;
      const matchesStatus =
        filters.isActive === undefined || String(plan.isActive) === filters.isActive;

      return matchesSearch && matchesType && matchesTier && matchesStatus;
    });
  }, [plans, search, filters]);

  /**
   * Handlers
   */
  const handleRowClick = (plan) => {
    setSelectedPlan(plan);
    setDetailModalOpen(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setDetailModalOpen(false);
    setEditModalOpen(true);
  };

  const handleDelete = (plan) => {
    setSelectedPlan(plan);
    setDetailModalOpen(false);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPlan) {
      deletePlan(selectedPlan._id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setSelectedPlan(null);
          refetch();
        },
      });
    }
  };

  return (
    <Box>
      {/* Coupon Verification */}
      <CouponVerifySection />

      {/* Header */}
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Membership Plans
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Manage membership plans and pricing
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setAddModalOpen(true)}
        >
          Add Plan
        </Button>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPlans}
        loading={isLoading}
        searchPlaceholder="Search by plan name or code..."
        onSearch={setSearch}
        filters={[
          {
            key: "type",
            label: "Type",
            options: [
              { value: "individual", label: "Individual" },
              { value: "family", label: "Family" },
            ],
          },
          {
            key: "tier",
            label: "Tier",
            options: [
              { value: "silver", label: "Silver" },
              { value: "gold", label: "Gold" },
              { value: "platinum", label: "Platinum" },
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
        ]}
        filterValues={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        pagination={false}
        onRowClick={handleRowClick}
        onRefresh={refetch}
        emptyMessage="No membership plans found"
      />

      {/* Add Plan Modal */}
      <AddMembershipModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Edit Plan Modal */}
      <EditMembershipModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onSuccess={refetch}
      />

      {/* Plan Detail Modal */}
      <MembershipDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Deactivate Plan?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate <strong>{selectedPlan?.name}</strong>?
            This will prevent new subscriptions but won't affect existing members.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? "Deactivating..." : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Memberships;
