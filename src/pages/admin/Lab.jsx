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
      <Box className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, v) => { if (v) { setView(v); setPage(1); } }}
        >
          <ToggleButton value="active">Active</ToggleButton>
          <ToggleButton value="archived">Archived</ToggleButton>
        </ToggleButtonGroup>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ bgcolor: "#f57c00", "&:hover": { bgcolor: "#e06c00" } }}
        >
          New Lab Order
        </Button>
      </Box>

      {/* Consolidated filter row: From, To, Search, Lab, Delivery, Payment, Refresh */}
      <Paper className="p-3 mb-4">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
          <Box className="flex items-center gap-1 shrink-0">
            <CalendarTodayIcon className="text-gray-500" fontSize="small" />
            <Typography variant="body2" className="text-gray-600 font-medium">Date Filter:</Typography>
          </Box>
          <TextField
            type="date"
            size="small"
            label="From"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          <TextField
            type="date"
            size="small"
            label="To"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          {(fromDate || toDate) && (
            <IconButton size="small" onClick={() => { setFromDate(""); setToDate(""); setPage(1); }} title="Clear dates">
              <ClearIcon fontSize="small" />
            </IconButton>
          )}
          <TextField
            size="small"
            placeholder="Search by order #..."
            value={filters.search || ""}
            onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value || undefined })); setPage(1); }}
            sx={{ flex: 1, minWidth: 200 }}
            autoComplete="off"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />
          {filterOptions.map((filter) => (
            <FormControl key={filter.key} size="small" sx={{ minWidth: 160 }}>
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
          ))}
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
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
    <Box>
      <Box className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <Typography variant="body2" className="text-gray-500">Manage labs and their procedure price lists</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditing(null); setFormOpen(true); }}
          sx={{ bgcolor: "#f57c00", "&:hover": { bgcolor: "#e06c00" } }}
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
      <Box className="mb-4">
        <Typography variant="h4" className="font-bold text-gray-800">Lab</Typography>
        <Typography variant="body2" className="text-gray-500">Dental lab orders and lab management</Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Lab Orders" />
          <Tab label="Labs" />
        </Tabs>
      </Box>

      {tab === 0 ? <LabOrdersTab /> : <LabsTab />}
    </Box>
  );
};

export default Lab;
