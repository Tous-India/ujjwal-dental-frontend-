/**
 * Admin Lab page (admin-only)
 *
 * Tab 1: Lab Orders — table of all orders with filters + create/detail.
 * Tab 2: Labs — manage labs and their procedure price lists.
 */
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  TextField,
  IconButton,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import DataTable from "../../components/common/DataTable";
import { useLabOrders, useLabOrderMutations } from "../../hooks/admin/useLabOrders";
import { useLabs } from "../../hooks/admin/useLabs";
import CreateLabOrderModal from "../../components/admin/modals/CreateLabOrderModal";
import LabOrderDetailModal from "../../components/admin/modals/LabOrderDetailModal";
import LabFormModal from "../../components/admin/modals/LabFormModal";

const paymentStatusColors = { unpaid: "error", partially_paid: "warning", paid: "success" };
const paymentStatusLabels = { unpaid: "Unpaid", partially_paid: "Partially Paid", paid: "Paid" };
const deliveryStatusColors = { pending: "default", in_progress: "info", delivered: "success", rejected: "error" };
const deliveryStatusLabels = { pending: "Pending", in_progress: "In Progress", delivered: "Delivered", rejected: "Rejected" };

const money = (v) => `₹${(Number(v) || 0).toLocaleString("en-IN")}`;

// ---------- Lab Orders tab ----------
const orderColumns = [
  {
    field: "orderNumber",
    headerName: "Order #",
    minWidth: 130,
    render: (v) => <Typography variant="body2" className="font-mono font-medium text-indigo-600">{v || "-"}</Typography>,
  },
  {
    field: "orderDate",
    headerName: "Date",
    minWidth: 110,
    render: (v) => (v ? new Date(v).toLocaleDateString("en-IN") : "-"),
  },
  { field: "lab", headerName: "Lab", minWidth: 150, render: (v) => v?.name || "-" },
  { field: "patient", headerName: "Patient", minWidth: 150, render: (v) => v?.name || "-" },
  {
    field: "items",
    headerName: "Procedures",
    minWidth: 200,
    render: (v) => (
      <Typography variant="body2" className="max-w-[240px] truncate" title={(v || []).map((i) => i.procedure).join(", ")}>
        {(v || []).map((i) => i.procedure).join(", ") || "-"}
      </Typography>
    ),
  },
  { field: "totalAmount", headerName: "Total", minWidth: 100, render: (v) => <span className="font-numbers font-semibold">{money(v)}</span> },
  { field: "amountPaid", headerName: "Paid", minWidth: 100, render: (v) => <span className="font-numbers text-green-600">{money(v)}</span> },
  {
    field: "balanceDue",
    headerName: "Balance",
    minWidth: 100,
    render: (v) => <span className={`font-numbers ${v > 0 ? "text-red-600 font-medium" : "text-gray-400"}`}>{money(v)}</span>,
  },
  {
    field: "paymentStatus",
    headerName: "Payment",
    minWidth: 130,
    render: (v) => <Chip size="small" label={paymentStatusLabels[v] || v} color={paymentStatusColors[v] || "default"} variant="outlined" />,
  },
  {
    field: "deliveryStatus",
    headerName: "Delivery",
    minWidth: 130,
    render: (v) => <Chip size="small" label={deliveryStatusLabels[v] || v} color={deliveryStatusColors[v] || "default"} />,
  },
];

const LabOrdersTab = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({});
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [view, setView] = useState("active"); // "active" | "archived"

  const { data: labsData } = useLabs();
  const labs = labsData?.data?.labs || [];

  const { archiveLabOrder, unarchiveLabOrder } = useLabOrderMutations();

  const { data, isLoading, refetch } = useLabOrders({
    page,
    limit,
    archived: view === "archived",
    ...filters,
    ...(fromDate && { from: fromDate }),
    ...(toDate && { to: toDate }),
  });
  const orders = data?.data || [];
  const pagination = data?.pagination || { total: 0 };

  const handleArchive = (row) => {
    archiveLabOrder(row._id, {
      onSuccess: () => { toast.success("Order archived"); refetch(); },
      onError: (e) => toast.error(e.response?.data?.message || "Failed to archive"),
    });
  };
  const handleUnarchive = (row) => {
    unarchiveLabOrder(row._id, {
      onSuccess: () => { toast.success("Order restored"); refetch(); },
      onError: (e) => toast.error(e.response?.data?.message || "Failed to restore"),
    });
  };

  const handleReset = () => {
    setFilters({});
    setFromDate("");
    setToDate("");
    setPage(1);
    setView("active");
  };

  // Append a per-row archive / unarchive action column.
  const columns = [
    ...orderColumns,
    {
      field: "_actions",
      headerName: "",
      minWidth: 60,
      render: (_, row) =>
        view === "archived" ? (
          <Tooltip title="Restore to Active">
            <IconButton
              size="small"
              sx={{ color: "#9ca3af", "&:hover": { color: "#f57c00" } }}
              onClick={(e) => { e.stopPropagation(); handleUnarchive(row); }}
            >
              <UnarchiveOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Archive">
            <IconButton
              size="small"
              sx={{ color: "#9ca3af", "&:hover": { color: "#f57c00" } }}
              onClick={(e) => { e.stopPropagation(); handleArchive(row); }}
            >
              <ArchiveOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
    },
  ];

  const filterOptions = [
    { key: "lab", label: "Lab", options: labs.map((l) => ({ value: l._id, label: l.name })) },
    {
      key: "deliveryStatus",
      label: "Delivery",
      options: [
        { value: "pending", label: "Pending" },
        { value: "in_progress", label: "In Progress" },
        { value: "delivered", label: "Delivered" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    {
      key: "paymentStatus",
      label: "Payment",
      options: [
        { value: "unpaid", label: "Unpaid" },
        { value: "partially_paid", label: "Partially Paid" },
        { value: "paid", label: "Paid" },
      ],
    },
  ];

  return (
    <Box>
      {/* Filter bar */}
      <Paper className="p-3 mb-4">
        {/* Actions: New Lab Order (left) + Refresh (right, above filter rows) */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ bgcolor: "#f57c00", "&:hover": { bgcolor: "#e06c00" }, textTransform: "none", fontSize: "12px", fontWeight: 600, height: 36, px: 2, whiteSpace: "nowrap" }}
          >
            New Lab Order
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={handleReset}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filter Grid — 4 columns on desktop */}
        <Grid container spacing={1.5}>
          {/* Row 1: View toggle · From · To (+Clear inline) · Search */}
          <Grid size={{ xs: 12, md: 3 }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={view}
              onChange={(_, v) => { if (v) { setView(v); setPage(1); } }}
              sx={{ "& .MuiToggleButton-root": { py: 0.5, px: 1.5, fontSize: "0.75rem", textTransform: "none" } }}
            >
              <ToggleButton value="active">Active</ToggleButton>
              <ToggleButton value="archived">Archived</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              size="small"
              label="From"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ "& .MuiInputBase-root": { height: 36, fontSize: "12px" } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label="To"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ "& .MuiInputBase-root": { height: 36, fontSize: "12px" } }}
              />
              {(fromDate || toDate) && (
                <IconButton size="small" onClick={() => { setFromDate(""); setToDate(""); setPage(1); }} title="Clear dates">
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by order #..."
              value={filters.search || ""}
              onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value || undefined })); setPage(1); }}
              sx={{ "& .MuiInputBase-root": { height: 36, fontSize: "12px" } }}
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Row 2: Lab · Delivery · Payment */}
          {filterOptions.map((filter) => (
            <Grid key={filter.key} size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small" sx={{ "& .MuiInputBase-root": { height: 36, fontSize: "12px" } }}>
                <InputLabel>{filter.label}</InputLabel>
                <Select
                  value={filters[filter.key] || ""}
                  label={filter.label}
                  onChange={(e) => { setFilters((f) => ({ ...f, [filter.key]: e.target.value || undefined })); setPage(1); }}
                >
                  <MenuItem value="">All</MenuItem>
                  {filter.options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <DataTable
        columns={columns}
        data={orders}
        loading={isLoading}
        pagination={{
          page,
          limit,
          total: pagination.total,
          onPageChange: setPage,
          onLimitChange: (l) => { setLimit(l); setPage(1); },
        }}
        onRowClick={(row) => setDetail(row)}
        emptyMessage="No lab orders found"
      />

      <CreateLabOrderModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={refetch} />
      <LabOrderDetailModal open={!!detail} order={detail} onClose={() => setDetail(null)} onRefresh={refetch} />
    </Box>
  );
};

// ---------- Labs tab ----------
const LabsTab = () => {
  const { data, isLoading, refetch } = useLabs();
  const labs = data?.data?.labs || [];
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const columns = [
    { field: "name", headerName: "Lab Name", minWidth: 200, render: (v) => <Typography variant="body2" className="font-medium">{v}</Typography> },
    { field: "contactPerson", headerName: "Contact", minWidth: 150, render: (v) => v || "-" },
    { field: "phone", headerName: "Phone", minWidth: 130, render: (v) => v || "-" },
    { field: "procedures", headerName: "Procedures", minWidth: 110, render: (v) => <Chip size="small" variant="outlined" label={`${v?.length || 0}`} /> },
    {
      field: "status",
      headerName: "Status",
      minWidth: 110,
      render: (v) => <Chip size="small" label={v === "active" ? "Active" : "Inactive"} color={v === "active" ? "success" : "default"} />,
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box className="flex justify-end mb-4">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditing(null); setFormOpen(true); }}
          sx={{ bgcolor: "#f57c00", "&:hover": { bgcolor: "#e06c00" }, textTransform: "none", fontSize: "12px", fontWeight: 600, height: 36 }}
        >
          Add Lab
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={labs}
        loading={isLoading}
        onRowClick={(row) => { setEditing(row); setFormOpen(true); }}
        onRefresh={refetch}
        emptyMessage="No labs yet"
      />

      {formOpen && (
        <LabFormModal
          key={editing?._id || "new"}
          open
          lab={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSuccess={refetch}
        />
      )}
    </Box>
  );
};

const Lab = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f2937", whiteSpace: "nowrap" }}>Lab</Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minHeight: 32,
            "& .MuiTab-root": { minHeight: 32, py: 0.5, px: 1.5, fontSize: "0.8rem", fontWeight: 600, textTransform: "none", minWidth: 0 },
          }}
        >
          <Tab label="Lab Orders" />
          <Tab label="Labs" />
        </Tabs>
      </Box>

      {tab === 0 ? <LabOrdersTab /> : <LabsTab />}
    </Box>
  );
};

export default Lab;
