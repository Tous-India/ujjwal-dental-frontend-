import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  TextField,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DataTable from "../../components/common/DataTable";
import CouponVerifySection from "../../components/admin/CouponVerifySection";
import PatientCouponsModal from "../../components/admin/modals/PatientCouponsModal";
import { useAllCoupons } from "../../hooks/admin/useCoupons";

const statusColors = {
  unused: "success",
  used: "default",
  locked: "warning",
};

const columns = [
  {
    field: "code",
    headerName: "Coupon Code",
    minWidth: 200,
    render: (value) => (
      <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.8rem" }}>
        {value}
      </Typography>
    ),
  },
  {
    field: "patient",
    headerName: "Patient",
    minWidth: 170,
    render: (value) => (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{value?.name || "-"}</Typography>
        <Typography variant="caption" className="text-gray-500">{value?.phone || ""}</Typography>
      </Box>
    ),
  },
  {
    field: "membershipPlan",
    headerName: "Plan",
    minWidth: 150,
    render: (value) => (
      <Typography variant="body2">{value?.name || "-"}</Typography>
    ),
  },
  {
    field: "couponNumber",
    headerName: "#",
    minWidth: 80,
    render: (value, row) => (
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value} of {row.totalCoupons}
      </Typography>
    ),
  },
  {
    field: "status",
    headerName: "Status",
    minWidth: 100,
    render: (value) => (
      <Chip
        label={value?.toUpperCase()}
        size="small"
        color={statusColors[value] || "default"}
        sx={{ fontSize: "0.65rem" }}
      />
    ),
  },
  {
    field: "flatDiscount",
    headerName: "Flat Off",
    minWidth: 80,
    render: (value) => <Typography variant="body2" className="font-numbers">₹{value}</Typography>,
  },
  {
    field: "surgeryDiscount",
    headerName: "Surgery %",
    minWidth: 80,
    render: (value) => <Typography variant="body2">{value}%</Typography>,
  },
  {
    field: "usedAt",
    headerName: "Used Date",
    minWidth: 110,
    render: (value) => (
      <Typography variant="body2">
        {value ? new Date(value).toLocaleDateString("en-IN") : "-"}
      </Typography>
    ),
  },
  {
    field: "membershipExpiry",
    headerName: "Expires",
    minWidth: 110,
    render: (value) => (
      <Typography variant="body2" sx={{ color: new Date(value) < new Date() ? "#d32f2f" : "inherit" }}>
        {value ? new Date(value).toLocaleDateString("en-IN") : "-"}
      </Typography>
    ),
  },
];

const AdminCoupons = () => {
  const [filters, setFilters] = useState({ status: "", search: "", page: 1 });
  const [selectedPatient, setSelectedPatient] = useState(null);

  const params = {};
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;
  params.page = filters.page;
  params.limit = 20;

  const { data, isLoading } = useAllCoupons(params);
  const coupons = data?.data?.coupons || [];
  const stats = data?.data?.stats || {};
  const totalPages = data?.data?.totalPages || 1;

  const statCards = [
    { label: "Total Coupons", value: stats.total || 0, icon: <CardGiftcardIcon />, color: "#003366" },
    { label: "Active (Unused)", value: stats.unused || 0, icon: <LocalOfferIcon />, color: "#2e7d32" },
    { label: "Used", value: stats.used || 0, icon: <CheckCircleIcon />, color: "#757575" },
    { label: "Locked", value: stats.locked || 0, icon: <LockIcon />, color: "#ed6c02" },
  ];

  return (
    <Box>
      {/* Header */}
      <Box className="flex justify-between items-center mb-4">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Coupon Management
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            View, verify and manage all membership coupons
          </Typography>
        </Box>
      </Box>

      {/* Verify Section */}
      <CouponVerifySection />

      {/* Stats Cards */}
      <Grid container spacing={2} className="mb-4">
        {statCards.map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ color: s.color, display: "flex" }}>{s.icon}</Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: s.color }}>{s.value}</Typography>
                  <Typography variant="caption" className="text-gray-500">{s.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Box className="flex gap-3 mb-4 flex-wrap">
        <TextField
          size="small"
          label="Search patient or code"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
          sx={{ minWidth: 250 }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="unused">Unused (Active)</MenuItem>
          <MenuItem value="used">Used</MenuItem>
          <MenuItem value="locked">Locked</MenuItem>
        </TextField>
      </Box>

      {/* Coupons Table */}
      <DataTable
        columns={columns}
        rows={coupons}
        loading={isLoading}
        page={filters.page}
        totalPages={totalPages}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        onRowClick={(row) => setSelectedPatient({ id: row.patient?._id, name: row.patient?.name })}
        emptyMessage="No coupons found"
      />

      {/* Patient Coupons Modal */}
      {selectedPatient && (
        <PatientCouponsModal
          open={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
        />
      )}
    </Box>
  );
};

export default AdminCoupons;
