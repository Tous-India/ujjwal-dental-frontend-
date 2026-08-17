import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  LinearProgress,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import QuickDateRangeFilter from "../../components/admin/QuickDateRangeFilter";
import { useProfitLoss } from "../../hooks/admin/useExpenses";

// ── Helpers ────────────────────────────────────────────────────────────────────

const INR = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(v || 0);

const fmtDate = (val) =>
  val
    ? new Date(val).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const CATEGORY_LABELS = {
  lab: "Lab",
  lab_orders: "Lab Orders (paid)",
  salaries: "Salaries",
  rent: "Rent",
  utilities: "Utilities",
  materials: "Materials",
  equipment: "Equipment",
  marketing: "Marketing",
  other: "Other",
};

// ── Headline card ──────────────────────────────────────────────────────────────

const HeadlineCard = ({ label, value, icon: Icon, positive, neutral, sub }) => {
  const color =
    neutral ? "text.primary"
    : positive === undefined ? "text.primary"
    : positive ? "success.main"
    : "error.main";

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: neutral ? undefined : positive ? "success.light" : "error.light",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: neutral ? "#6366f1" : positive ? "#22c55e" : "#ef4444",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700} color={color}>
              {INR(value)}
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
};

// ── Change chip ────────────────────────────────────────────────────────────────

const ChangeBadge = ({ pct }) => {
  if (pct === null || pct === undefined) {
    return <Chip size="small" label="N/A" icon={<RemoveIcon />} />;
  }
  if (pct > 0) {
    return (
      <Chip
        size="small"
        label={`+${pct}%`}
        icon={<TrendingUpIcon />}
        color="success"
        variant="outlined"
      />
    );
  }
  if (pct < 0) {
    return (
      <Chip
        size="small"
        label={`${pct}%`}
        icon={<TrendingDownIcon />}
        color="error"
        variant="outlined"
      />
    );
  }
  return <Chip size="small" label="0%" icon={<RemoveIcon />} />;
};

// ── Main page ──────────────────────────────────────────────────────────────────

const ProfitLoss = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const queryParams = useMemo(
    () => ({
      from: fromDate || undefined,
      to: toDate || undefined,
    }),
    [fromDate, toDate]
  );

  const { data: pnlData, isLoading, error } = useProfitLoss(queryParams);
  const pnl = pnlData?.data || null;

  // Date range label
  const periodLabel = useMemo(() => {
    if (!fromDate && !toDate) return "All time";
    if (fromDate && toDate && fromDate === toDate) return fmtDate(fromDate);
    if (fromDate && toDate) return `${fmtDate(fromDate)} – ${fmtDate(toDate)}`;
    if (fromDate) return `From ${fmtDate(fromDate)}`;
    return `To ${fmtDate(toDate)}`;
  }, [fromDate, toDate]);

  const prevLabel = pnl?.previousPeriod
    ? `${fmtDate(pnl.previousPeriod.from)} – ${fmtDate(pnl.previousPeriod.to)}`
    : null;

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Header */}
      <Box className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Profit &amp; Loss
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cash-basis P&amp;L. Revenue from payments collected; lab costs from lab orders paid; other expenses from the Expenses ledger.
          </Typography>
        </Box>
        {/* Date range filter — drives ALL figures */}
        <QuickDateRangeFilter
          value={{ from: fromDate, to: toDate }}
          onChange={({ from, to }) => {
            setFromDate(from);
            setToDate(to);
          }}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Period: <strong>{periodLabel}</strong>
      </Typography>

      {isLoading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Calculating…
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load P&amp;L data. Please try again.
        </Alert>
      )}

      {pnl && !isLoading && (
        <>
          {/* ── Headline figures ── */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <HeadlineCard
                label="Net Revenue"
                value={pnl.revenue.net}
                icon={AttachMoneyIcon}
                neutral
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <HeadlineCard
                label="Total Expenses"
                value={pnl.expenses.total}
                icon={MoneyOffIcon}
                positive={false}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <HeadlineCard
                label="Net Profit"
                value={pnl.netProfit}
                icon={AccountBalanceIcon}
                positive={pnl.netProfit >= 0}
                sub={prevLabel ? `Previous: ${INR(pnl.previousPeriod?.netProfit)}` : undefined}
              />
            </Grid>
          </Grid>

          {/* ── Previous period comparison ── */}
          {pnl.previousPeriod && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                vs Previous Period ({prevLabel})
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
                      Net Revenue
                    </Typography>
                    <ChangeBadge pct={pnl.previousPeriod.changes.netRevenuePct} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
                      Total Expenses
                    </Typography>
                    <ChangeBadge pct={pnl.previousPeriod.changes.totalExpensesPct} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
                      Net Profit
                    </Typography>
                    <ChangeBadge pct={pnl.previousPeriod.changes.netProfitPct} />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* ── Revenue breakdown ── */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Revenue
                  </Typography>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ border: 0 }}>Gross collected</TableCell>
                        <TableCell align="right" sx={{ border: 0 }}>
                          {INR(pnl.revenue.gross)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ border: 0, color: "text.secondary" }}>
                          Less: Refunds
                        </TableCell>
                        <TableCell align="right" sx={{ border: 0, color: "text.secondary" }}>
                          – {INR(pnl.revenue.refunds)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ borderTop: "1px solid", borderColor: "divider", fontWeight: 700 }}>
                          Net Revenue
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            borderTop: "1px solid",
                            borderColor: "divider",
                            fontWeight: 700,
                          }}
                        >
                          {INR(pnl.revenue.net)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>

            {/* ── Expense breakdown ── */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    Expenses by Category
                  </Typography>

                  {pnl.expenses.breakdown.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No expenses in this period.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {pnl.expenses.breakdown.map((item) => (
                        <Box key={item.category}>
                          <Box
                            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
                          >
                            <Typography variant="body2">
                              {CATEGORY_LABELS[item.category] || item.category}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                              <Typography variant="caption" color="text.secondary">
                                {item.pct}%
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {INR(item.total)}
                              </Typography>
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={item.pct}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      ))}

                      <Divider sx={{ my: 0.5 }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" fontWeight={700}>
                          Total Expenses
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="error.main">
                          {INR(pnl.expenses.total)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ── P&L summary table ── */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Summary
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Net Revenue</TableCell>
                    <TableCell align="right">{INR(pnl.revenue.net)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: "text.secondary" }}>
                      &nbsp;&nbsp;Lab costs (paid)
                    </TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary" }}>
                      – {INR(pnl.expenses.lab)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: "text.secondary" }}>
                      &nbsp;&nbsp;Other expenses
                    </TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary" }}>
                      – {INR(pnl.expenses.other)}
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                      Net Profit
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: pnl.netProfit >= 0 ? "success.main" : "error.main",
                      }}
                    >
                      {INR(pnl.netProfit)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* ── Unpaid lab orders alert ── */}
          {pnl.unpaidLab.count > 0 && (
            <Alert
              severity="warning"
              icon={<WarningAmberIcon />}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2" fontWeight={600}>
                {pnl.unpaidLab.count} unpaid / partially-paid lab order
                {pnl.unpaidLab.count > 1 ? "s" : ""} — balance due{" "}
                {INR(pnl.unpaidLab.balanceDue)}
              </Typography>
              <Typography variant="body2">
                These are not counted in the P&amp;L until payment is recorded. Record payments
                in the Lab section to include them.
              </Typography>
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default ProfitLoss;
