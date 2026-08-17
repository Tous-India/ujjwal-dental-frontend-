import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import BuildIcon from "@mui/icons-material/Build";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CampaignIcon from "@mui/icons-material/Campaign";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import QuickDateRangeFilter from "../../components/admin/QuickDateRangeFilter";
import DataTable from "../../components/common/DataTable";
import CompactFilterBar from "../../components/common/CompactFilterBar";
import {
  useExpenses,
  useExpenseStats,
  useExpenseStaff,
  useCreateExpense,
  useUpdateExpense,
  useVoidExpense,
} from "../../hooks/admin/useExpenses";
import { useAdminStore } from "../../store/admin.store";
import { usePermissions } from "../../hooks/admin/usePermissions";

// ── Helpers ────────────────────────────────────────────────────────────────────

const INR = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);

const fmtDate = (val) =>
  val
    ? new Date(val).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "-";

const CATEGORY_LABELS = {
  lab: "Lab",
  salaries: "Salaries",
  rent: "Rent",
  utilities: "Utilities",
  materials: "Materials",
  equipment: "Equipment",
  marketing: "Marketing",
  other: "Other",
};

const CATEGORY_COLORS = {
  lab: "info",
  salaries: "primary",
  rent: "warning",
  utilities: "secondary",
  materials: "success",
  equipment: "default",
  marketing: "error",
  other: "default",
};

const CATEGORY_ICONS = {
  lab: MedicalServicesIcon,
  salaries: MoneyOffIcon,
  rent: HomeWorkIcon,
  utilities: ElectricBoltIcon,
  materials: BuildIcon,
  equipment: ShoppingCartIcon,
  marketing: CampaignIcon,
  other: MoreHorizIcon,
};

const PAYMENT_MODE_LABELS = {
  cash: "Cash",
  upi: "UPI",
  net_banking: "Net Banking",
  card: "Card",
  cheque: "Cheque",
  other: "Other",
};

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const PAYMENT_MODE_OPTIONS = Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => ({ value, label }));

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  category: "",
  description: "",
  amount: "",
  paymentMode: "",
  spentBy: "",
  vendor: "",
  notes: "",
};

// ── Stats card ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <Card variant="outlined" sx={{ height: "100%" }}>
    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: color,
            flexShrink: 0,
          }}
        >
          <Icon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            {value}
          </Typography>
          {sub && (
            <Typography variant="caption" color="text.secondary">
              {sub}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ── Expense form modal ─────────────────────────────────────────────────────────

const ExpenseModal = ({ open, onClose, expense, staffList, currentUserId, onSaved }) => {
  const isEdit = !!expense;
  const [form, setForm] = useState(
    isEdit
      ? {
          date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : "",
          category: expense.category || "",
          description: expense.description || "",
          amount: String(expense.amount || ""),
          paymentMode: expense.paymentMode || "",
          spentBy: expense.spentBy?._id || expense.spentBy || "",
          vendor: expense.vendor || "",
          notes: expense.notes || "",
        }
      : { ...EMPTY_FORM, spentBy: currentUserId || "" }
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.date) return setError("Date is required");
    if (!form.category) return setError("Category is required");
    if (!form.description.trim()) return setError("Description is required");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return setError("Amount must be > 0");
    if (!form.paymentMode) return setError("Payment mode is required");
    if (!form.spentBy) return setError("Spent by is required");

    setError("");
    setSaving(true);
    try {
      const payload = {
        date: form.date,
        category: form.category,
        description: form.description.trim(),
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        spentBy: form.spentBy,
        vendor: form.vendor.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: expense._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Expense" : "Record Expense"}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Date *"
                type="date"
                size="small"
                fullWidth
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Amount (₹) *"
                type="number"
                size="small"
                fullWidth
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                slotProps={{ input: { inputProps: { min: 0.01, step: 0.01 } } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={form.category}
                  label="Category *"
                  onChange={(e) => set("category", e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Payment Mode *</InputLabel>
                <Select
                  value={form.paymentMode}
                  label="Payment Mode *"
                  onChange={(e) => set("paymentMode", e.target.value)}
                >
                  {PAYMENT_MODE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description *"
                size="small"
                fullWidth
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What was this expense for?"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Spent By *</InputLabel>
                <Select
                  value={form.spentBy}
                  label="Spent By *"
                  onChange={(e) => set("spentBy", e.target.value)}
                >
                  {staffList.map((u) => (
                    <MenuItem key={u._id} value={u._id}>
                      {u.name}
                      {u._id === currentUserId ? " (me)" : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Vendor (optional)"
                size="small"
                fullWidth
                value={form.vendor}
                onChange={(e) => set("vendor", e.target.value)}
                placeholder="Supplier / vendor name"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes (optional)"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
              />
            </Grid>
            {isEdit && expense.recordedBy && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Recorded by:{" "}
                  <strong>{expense.recordedBy?.name || "—"}</strong>
                  {expense.editedBy && (
                    <> · Last edited by <strong>{expense.editedBy?.name}</strong> on {fmtDate(expense.editedAt)}</>
                  )}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {saving ? <CircularProgress size={18} /> : isEdit ? "Save Changes" : "Record Expense"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Void dialog ────────────────────────────────────────────────────────────────

const VoidDialog = ({ expense, onClose, onVoided }) => {
  const voidMutation = useVoidExpense();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [voiding, setVoiding] = useState(false);

  const handleVoid = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      return setError("Please enter a reason of at least 10 characters.");
    }
    setError("");
    setVoiding(true);
    try {
      await voidMutation.mutateAsync({ id: expense._id, reason: reason.trim() });
      onVoided();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to void expense");
      setVoiding(false);
    }
  };

  return (
    <Dialog open={!!expense} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ color: "warning.main" }}>Void Expense?</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Voiding removes this expense from P&L and stats. The record is preserved
          for audit and can be viewed under the "Voided" filter.
        </Alert>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>{fmtDate(expense?.date)}</strong> · {CATEGORY_LABELS[expense?.category]} ·{" "}
          <strong>{INR(expense?.amount)}</strong>
          <br />
          <Typography component="span" variant="caption" color="text.secondary">
            {expense?.description}
          </Typography>
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Void reason *"
          size="small"
          fullWidth
          multiline
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this expense being voided? (min 10 chars)"
          helperText={`${reason.length} / 10 min`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={voiding}>
          Cancel
        </Button>
        <Button variant="contained" color="warning" onClick={handleVoid} disabled={voiding}>
          {voiding ? <CircularProgress size={18} /> : "Void Expense"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────

const Expenses = () => {
  const { admin } = useAdminStore();
  const { hasPermission } = usePermissions();

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [voidTarget, setVoidTarget] = useState(null);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });

  const isVoidedView = filters.voided === "true";

  // Query params — stats + list share the same date/filter window
  const queryParams = useMemo(() => ({
    from: fromDate || undefined,
    to: toDate || undefined,
    category: filters.category || undefined,
    paymentMode: filters.paymentMode || undefined,
    spentBy: filters.spentBy || undefined,
    voided: filters.voided || undefined,
    search: search || undefined,
    page,
    limit,
  }), [fromDate, toDate, filters, search, page]);

  const statsParams = useMemo(() => ({
    from: fromDate || undefined,
    to: toDate || undefined,
    category: filters.category || undefined,
  }), [fromDate, toDate, filters.category]);

  const { data: expenseData, isLoading } = useExpenses(queryParams);
  const { data: statsData } = useExpenseStats(statsParams);
  const { data: staffData } = useExpenseStaff();

  const expenses = expenseData?.data || [];
  const pagination = expenseData?.pagination || {};
  const stats = statsData?.data || {};
  const staffList = staffData?.data?.users || [];

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  const handleReset = () => {
    setSearch("");
    setFilters({});
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  // Stat date label
  const statDateLabel = useMemo(() => {
    if (!fromDate && !toDate) return "All time";
    if (fromDate && toDate && fromDate === toDate)
      return fmtDate(fromDate);
    if (fromDate && toDate)
      return `${fmtDate(fromDate)} – ${fmtDate(toDate)}`;
    if (fromDate) return `From ${fmtDate(fromDate)}`;
    return `To ${fmtDate(toDate)}`;
  }, [fromDate, toDate]);

  const filterOptions = [
    {
      key: "category",
      label: "Category",
      options: CATEGORY_OPTIONS,
    },
    {
      key: "paymentMode",
      label: "Mode",
      options: PAYMENT_MODE_OPTIONS,
    },
    {
      key: "spentBy",
      label: "Spent By",
      options: staffList.map((u) => ({ value: u._id, label: u.name })),
    },
    {
      key: "voided",
      label: "Status",
      options: [
        { value: "", label: "Active" },
        { value: "true", label: "Voided" },
      ],
    },
  ];

  const columns = [
    {
      field: "date",
      headerName: "Date",
      minWidth: 110,
      render: (v) => fmtDate(v),
    },
    {
      field: "category",
      headerName: "Category",
      minWidth: 110,
      render: (v) => (
        <Chip
          label={CATEGORY_LABELS[v] || v}
          color={CATEGORY_COLORS[v] || "default"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "description",
      headerName: "Description",
      minWidth: 180,
      render: (v, row) => (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography variant="body2">{v}</Typography>
            {row.isVoided && (
              <Chip label="Voided" size="small" color="default" sx={{ height: 18, fontSize: "0.65rem" }} />
            )}
          </Box>
          {row.vendor && (
            <Typography variant="caption" color="text.secondary">
              {row.vendor}
            </Typography>
          )}
          {row.isVoided && row.voidReason && (
            <Typography variant="caption" color="text.secondary" display="block">
              Reason: {row.voidReason}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      minWidth: 110,
      align: "right",
      render: (v, row) => (
        <Typography fontWeight={600} color={row.isVoided ? "text.disabled" : "error.main"}>
          {INR(v)}
        </Typography>
      ),
    },
    {
      field: "paymentMode",
      headerName: "Mode",
      minWidth: 100,
      render: (v) => PAYMENT_MODE_LABELS[v] || v,
    },
    {
      field: "spentBy",
      headerName: "Spent By",
      minWidth: 120,
      render: (v) => v?.name || "—",
    },
    {
      field: "recordedBy",
      headerName: "Recorded By",
      minWidth: 120,
      render: (v, row) => (
        <Box>
          <Typography variant="body2">{v?.name || "—"}</Typography>
          {row.editedBy && (
            <Tooltip title={`Last edited by ${row.editedBy?.name} on ${fmtDate(row.editedAt)}`}>
              <Typography variant="caption" color="warning.main">
                edited
              </Typography>
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 100,
      align: "center",
      render: (_v, row) => {
        if (row.isVoided) return null;
        return (
          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
            {hasPermission("expenses", "edit") && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => setEditExpense(row)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {hasPermission("expenses", "delete") && (
              <Tooltip title="Void expense">
                <IconButton size="small" color="warning" onClick={() => setVoidTarget(row)}>
                  <BlockIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Header */}
      <Box className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Expenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track clinic expenditure. Revenue and lab costs appear in Profit &amp; Loss.
          </Typography>
        </Box>
        {hasPermission("expenses", "create") && !isVoidedView && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            Record Expense
          </Button>
        )}
      </Box>

      {/* Stats cards — only for active (non-voided) view */}
      {!isVoidedView && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={MoneyOffIcon}
              label="Total Expenses"
              value={INR(stats.total)}
              color="#ef4444"
              sub={statDateLabel}
            />
          </Grid>
          {(stats.byCategory || []).slice(0, 3).map((cat) => {
            const Icon = CATEGORY_ICONS[cat.category] || MoreHorizIcon;
            return (
              <Grid key={cat.category} size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  icon={Icon}
                  label={CATEGORY_LABELS[cat.category] || cat.category}
                  value={INR(cat.total)}
                  color="#6366f1"
                  sub={`${cat.count} entries · ${cat.pct}%`}
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Voided view banner */}
      {isVoidedView && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Showing voided expenses. These records are excluded from all stats and P&L figures.
        </Alert>
      )}

      {/* Filters */}
      <CompactFilterBar
        dateFilterSlot={
          <QuickDateRangeFilter
            value={{ from: fromDate, to: toDate }}
            onChange={({ from, to }) => {
              setFromDate(from);
              setToDate(to);
              setPage(1);
            }}
          />
        }
        search={search}
        onSearchChange={handleSearch}
        searchPlaceholder="Search description or vendor…"
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={handleFilterChange}
        onRefresh={handleReset}
      />

      {/* Table */}
      <DataTable
        size="small"
        columns={columns}
        data={expenses}
        loading={isLoading}
        searchValue={search}
        pagination={{
          page,
          limit,
          total: pagination.total || 0,
          onPageChange: setPage,
          onLimitChange: () => { setPage(1); },
        }}
        emptyMessage={isVoidedView ? "No voided expenses found." : "No expenses recorded for this period."}
      />

      {/* Add / Edit modal */}
      {(showForm || editExpense) && (
        <ExpenseModal
          open={showForm || !!editExpense}
          onClose={() => { setShowForm(false); setEditExpense(null); }}
          expense={editExpense}
          staffList={staffList}
          currentUserId={admin?._id}
          onSaved={() => showSnack(editExpense ? "Expense updated" : "Expense recorded")}
        />
      )}

      {/* Void confirmation dialog */}
      {voidTarget && (
        <VoidDialog
          expense={voidTarget}
          onClose={() => setVoidTarget(null)}
          onVoided={() => showSnack("Expense voided", "warning")}
        />
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Expenses;
