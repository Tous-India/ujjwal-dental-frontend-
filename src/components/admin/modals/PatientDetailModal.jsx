/**
 * Patient Detail Modal (Enhanced)
 *
 * Displays complete patient information with tabs:
 * - Overview: Personal info, medical info, membership
 * - Appointments: Patient's appointment history (with edit)
 * - Treatments: Treatment history
 * - Payment History: Payment history with summary (with add payment)
 * - Reports: Medical reports
 * - Lab: Lab orders for this patient (client-side filtered)
 * - Invoices: Patient's invoices (server-side filtered by patient ID)
 */
import React, { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import CakeIcon from "@mui/icons-material/Cake";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import EventIcon from "@mui/icons-material/Event";
import PaymentIcon from "@mui/icons-material/Payment";
import DescriptionIcon from "@mui/icons-material/Description";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ScienceIcon from "@mui/icons-material/Science";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockResetIcon from "@mui/icons-material/LockReset";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import AddIcon from "@mui/icons-material/Add";
import {
  getPatientAppointments,
  getPatientTreatments,
  getPatientReports,
  getPatientTests,
  deletePatient,
} from "../../../api/admin/patients.api";
import { getLabOrders } from "../../../api/admin/labOrders.api";
import { getBillingStats, getInvoices } from "../../../api/admin/billing.api";
import { getPayments } from "../../../api/admin/payments.api";
import EditAppointmentModal from "./EditAppointmentModal";
import AssignMembershipModal from "./AssignMembershipModal";
import ResetPasswordDialog from "./ResetPasswordDialog";
import FollowUpReminderModal from "./FollowUpReminderModal";
import ConfirmDialog from "../../common/ConfirmDialog";
import InvoiceDetailModal from "./InvoiceDetailModal";
import { toast } from "react-toastify";

/**
 * Tab Panel Component
 */
const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box className="py-2">{children}</Box>}
  </div>
);

/**
 * Info row component
 */
const InfoRow = ({ icon: Icon, label, value, color = "text-gray-600" }) => (
  <Box className="flex items-center gap-2 py-0.5">
    {Icon && <Icon className={color} sx={{ fontSize: 14 }} />}
    <Typography variant="caption" className="text-gray-500 shrink-0" sx={{ minWidth: 80 }}>
      {label}
    </Typography>
    <Typography variant="body2" className={value ? "font-medium" : "text-gray-400"}>
      {value || "—"}
    </Typography>
  </Box>
);

/**
 * Section header component
 */
const SectionHeader = ({ title, icon: Icon }) => (
  <Box className="flex items-center gap-1.5 mb-1">
    {Icon && <Icon className="text-blue-600" sx={{ fontSize: 14 }} />}
    <Typography
      variant="caption"
      className="font-semibold text-gray-600 uppercase tracking-wide"
    >
      {title}
    </Typography>
  </Box>
);

/**
 * Format date
 */
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
};

/**
 * Status chip colors
 */
const statusColors = {
  scheduled: "info",
  confirmed: "primary",
  completed: "success",
  cancelled: "error",
  in_progress: "warning",
  pending: "warning",
  paid: "success",
  partial: "warning",
  unpaid: "error",
  delivered: "success",
  rejected: "error",
  partially_paid: "warning",
};

/**
 * Overview Tab Content
 */
const OverviewTab = ({ patient, onAssignMembership }) => {
  const {
    phone,
    email,
    gender,
    dateOfBirth,
    calculatedAge,
    address,
    bloodGroup,
    allergies,
    medicalHistory,
    emergencyContact,
    membership,
    membershipHistory,
    notes,
  } = patient;

  const paymentMethodLabels = {
    cash: "Cash",
    card: "Card",
    upi: "UPI",
    bank_transfer: "Bank Transfer",
    online: "Online",
  };

  return (
    <Grid container spacing={2}>
      {/* Left Column */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box className="space-y-3">
          <Box>
            <SectionHeader title="Personal Information" icon={PersonIcon} />
            <Box className="bg-gray-50 rounded-lg p-2.5">
              <InfoRow icon={PhoneIcon} label="Phone" value={phone} color="text-blue-600" />
              <InfoRow icon={EmailIcon} label="Email" value={email} color="text-blue-600" />
              <InfoRow
                icon={PersonIcon}
                label="Gender"
                value={gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : null}
              />
              <InfoRow
                icon={CakeIcon}
                label="Date of Birth"
                value={dateOfBirth ? `${formatDate(dateOfBirth)} (${calculatedAge} years)` : null}
              />
            </Box>
          </Box>

          <Box>
            <SectionHeader title="Address" icon={LocationOnIcon} />
            <Box className="bg-gray-50 rounded-lg p-2.5">
              {address ? (
                <Typography variant="body2">
                  {[address.street, address.city, address.state, address.pincode]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </Typography>
              ) : (
                <Typography variant="body2" className="text-gray-400">
                  No address provided
                </Typography>
              )}
            </Box>
          </Box>

          <Box>
            <SectionHeader title="Emergency Contact" icon={ContactPhoneIcon} />
            <Box className="bg-gray-50 rounded-lg p-2.5">
              {emergencyContact?.name ? (
                <>
                  <Typography variant="body2" className="font-medium">
                    {emergencyContact.name}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {emergencyContact.phone} ({emergencyContact.relation || "Contact"})
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" className="text-gray-400">
                  No emergency contact
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Right Column */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box className="space-y-3">
          <Box>
            <SectionHeader title="Medical Information" icon={LocalHospitalIcon} />
            <Box className="bg-gray-50 rounded-lg p-2.5">
              <InfoRow label="Blood Group" value={bloodGroup} />
              <Box className="py-2">
                <Typography variant="caption" className="text-gray-500 block mb-1">
                  Allergies
                </Typography>
                {allergies?.length > 0 ? (
                  <Box className="flex flex-wrap gap-1">
                    {allergies.map((allergy, idx) => (
                      <Chip
                        key={idx}
                        label={allergy}
                        size="small"
                        color="error"
                        variant="outlined"
                        icon={<WarningAmberIcon />}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" className="text-gray-400">
                    No known allergies
                  </Typography>
                )}
              </Box>
              <Box className="py-2">
                <Typography variant="caption" className="text-gray-500 block mb-1">
                  Medical History
                </Typography>
                {medicalHistory?.length > 0 ? (
                  <Box className="flex flex-wrap gap-1">
                    {medicalHistory.map((condition, idx) => (
                      <Chip key={idx} label={condition} size="small" variant="outlined" />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" className="text-gray-400">
                    No medical history recorded
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          <Box>
            <Box className="flex items-center justify-between mb-2">
              <Box className="flex items-center gap-2">
                <CardMembershipIcon className="text-blue-600" fontSize="small" />
                <Typography
                  variant="subtitle2"
                  className="font-semibold text-gray-700 uppercase tracking-wide"
                >
                  Membership
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onAssignMembership}
                sx={{ fontSize: "0.7rem" }}
              >
                Assign Membership
              </Button>
            </Box>
            <Box className="bg-gray-50 rounded-lg p-2.5">
              {membership?.status ? (
            <>
              <Box className="flex items-center justify-between mb-2">
                <Typography variant="body2" className="font-medium">
                  {membership.planName}
                </Typography>
                <Chip
                  label={membership.status}
                  size="small"
                  color={membership.status === "active" ? "success" : "default"}
                />
              </Box>
              {membership.discountPercent != null && membership.discountPercent > 0 && (
                <Typography variant="caption" className="text-gray-500 block">
                  Discount: {membership.discountPercent}%
                </Typography>
              )}
              <Typography variant="caption" className="text-gray-500 block">
                Valid: {formatDate(membership.startDate)} - {formatDate(membership.expiryDate)}
              </Typography>
              {membership.amountPaid != null && (
                <Typography variant="caption" className="text-gray-500 block">
                  Amount paid: {formatCurrency(membership.amountPaid)}
                  {membership.paymentMethod
                    ? ` (${paymentMethodLabels[membership.paymentMethod] || membership.paymentMethod})`
                    : ""}
                </Typography>
              )}
              {membership.notes && (
                <Typography variant="caption" className="text-gray-500 block">
                  Notes: {membership.notes}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="body2" className="text-gray-400">
              No active membership
            </Typography>
          )}
            </Box>
          </Box>

          {notes && (
            <Box>
              <SectionHeader title="Notes" />
              <Box className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <Typography variant="body2">{notes}</Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

/**
 * Appointments Tab Content
 */
const AppointmentsTab = ({ patientId, patient, refreshKey, onRefresh }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPatientAppointments(patientId, { limit: 50 });
      setAppointments(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) fetchAppointments();
  }, [patientId, refreshKey, fetchAppointments]);

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchAppointments();
    onRefresh?.();
  };

  if (loading) return <Box className="text-center py-8"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!appointments.length) return <Typography className="text-gray-400 text-center py-8">No appointments found</Typography>;

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Clinic</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map((apt) => (
              <TableRow key={apt._id} hover>
                <TableCell>{formatDate(apt.date)}</TableCell>
                <TableCell>{apt.timeSlot || "-"}</TableCell>
                <TableCell>{apt.clinic?.name || "-"}</TableCell>
                <TableCell>
                  <Chip size="small" label={apt.type?.replace("_", " ") || "Regular"} variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip size="small" label={apt.status} color={statusColors[apt.status] || "default"} />
                </TableCell>
                <TableCell>{apt.reason || "-"}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit Appointment">
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(apt)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSuccess={handleEditSuccess}
      />
    </>
  );
};

/**
 * Treatments Tab Content
 */
const TreatmentsTab = ({ patientId }) => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true);
        const res = await getPatientTreatments(patientId, { limit: 50 });
        setTreatments(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load treatments");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchTreatments();
  }, [patientId]);

  if (loading) return <Box className="text-center py-8"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!treatments.length) return <Typography className="text-gray-400 text-center py-8">No treatments found</Typography>;

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead className="bg-gray-50">
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Treatment</TableCell>
            <TableCell>Clinic</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {treatments.map((trt) => (
            <TableRow key={trt._id} hover>
              <TableCell>{formatDate(trt.createdAt)}</TableCell>
              <TableCell>{trt.treatmentType?.name || trt.name || "-"}</TableCell>
              <TableCell>{trt.clinic?.name || "-"}</TableCell>
              <TableCell>
                <Chip size="small" label={trt.status} color={statusColors[trt.status] || "default"} />
              </TableCell>
              <TableCell>{formatCurrency(trt.totalCost || trt.treatmentType?.price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Tests Tab Content
 */
const TestsTab = ({ patientId }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const res = await getPatientTests(patientId, { limit: 50 });
        setTests(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load tests");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchTests();
  }, [patientId]);

  if (loading) return <Box className="text-center py-8"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!tests.length) return <Typography className="text-gray-400 text-center py-8">No tests found</Typography>;

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead className="bg-gray-50">
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Test Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tests.map((test) => (
            <TableRow key={test._id} hover>
              <TableCell>{formatDate(test.createdAt || test.date)}</TableCell>
              <TableCell>{test.testType?.name || test.name || "-"}</TableCell>
              <TableCell>
                <Chip size="small" label={test.testType?.category || test.category || "-"} variant="outlined" />
              </TableCell>
              <TableCell>
                <Chip size="small" label={test.status || "pending"} color={statusColors[test.status] || "default"} />
              </TableCell>
              <TableCell>{formatCurrency(test.cost || test.testType?.price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Payment History Tab Content
 * Shows one row per Payment transaction (not per invoice).
 * Read-only — actions (Record Payment, Refund) are on the Billing page.
 */
const PaymentsTab = ({ patientId, refreshKey, onTabSwitch }) => {
  const [data, setData] = useState({ payments: [], invoiceStats: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [payRes, statsRes] = await Promise.all([
        getPayments({ patient: patientId, limit: 50 }),
        getBillingStats({ patient: patientId }),
      ]);
      setData({
        payments: payRes.data || [],
        invoiceStats: statsRes.data?.stats || null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payment history");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) fetchData();
  }, [patientId, refreshKey, fetchData]);

  if (loading) return <Box className="text-center py-8"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const { payments, invoiceStats } = data;

  const paymentMethodLabel = (method) => {
    const map = {
      cash: "Cash", card: "Card", upi: "UPI", online: "Online",
      razorpay: "Online", "pay-at-clinic": "Pay at Clinic", free: "Free",
    };
    return map[method] || (method ? method.replace(/-/g, " ") : "-");
  };

  const paymentTypeLabel = (type) => {
    const map = {
      opd_fee: "Appointment Fee", treatment: "Treatment", invoice_payment: "Invoice Payment",
      consultation: "Consultation", membership: "Membership",
      advance: "Advance", refund: "Refund", other: "Other",
    };
    return map[type] || (type ? type.replace(/_/g, " ") : "-");
  };

  const paymentStatusColors = {
    paid: "success", refunded: "error", reversed: "default",
    pending: "warning", failed: "error", cancelled: "default", refund_pending: "warning",
  };

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  const sorted = [...payments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      {/* Invoice-based billing summary — same source as Billing page */}
      {invoiceStats && (
        <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Box
            className="bg-purple-50 rounded-lg p-4 text-center cursor-pointer hover:bg-purple-100 transition-colors"
            onClick={() => onTabSwitch?.(7)}
          >
            <Typography variant="h6" className="font-numbers font-bold text-purple-600">
              {formatCurrency(invoiceStats.totalAmount)}
            </Typography>
            <Typography variant="caption" className="text-gray-600">Total Amount</Typography>
          </Box>
          <Box className="bg-green-50 rounded-lg p-4 text-center">
            <Typography variant="h6" className="font-numbers font-bold text-green-600">
              {formatCurrency(invoiceStats.totalPaid)}
            </Typography>
            <Typography variant="caption" className="text-gray-600">Total Paid</Typography>
          </Box>
          <Box
            className="bg-red-50 rounded-lg p-4 text-center cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => onTabSwitch?.(7, "unpaid")}
          >
            <Typography variant="h6" className="font-numbers font-bold text-red-600">
              {formatCurrency(invoiceStats.totalDue)}
            </Typography>
            <Typography variant="caption" className="text-gray-600">Balance Due</Typography>
          </Box>
          <Box
            className="bg-blue-50 rounded-lg p-4 text-center cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={() => onTabSwitch?.(7)}
          >
            <Typography variant="h6" className="font-numbers font-bold text-blue-600">
              {invoiceStats.totalInvoices || 0}
            </Typography>
            <Typography variant="caption" className="text-gray-600">Invoices</Typography>
          </Box>
        </Box>
      )}

      {!sorted.length ? (
        <Typography className="text-gray-400 text-center py-8">
          No payments recorded for this patient yet.
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((pay) => (
                <TableRow key={pay._id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateTime(pay.createdAt)}</TableCell>
                  <TableCell className="font-numbers font-semibold text-green-700">
                    {formatCurrency(pay.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={paymentMethodLabel(pay.paymentMode)} variant="outlined" />
                  </TableCell>
                  <TableCell>{paymentTypeLabel(pay.type)}</TableCell>
                  <TableCell className="font-numbers text-gray-500">
                    {pay.invoice?.invoiceNumber || pay.settledInvoices?.[0]?.invoiceNumber || "—"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={pay.status || "-"}
                      color={paymentStatusColors[pay.status] || "default"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

/**
 * Reports Tab Content
 */
const ReportsTab = ({ patientId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await getPatientReports(patientId, { limit: 50 });
        setReports(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchReports();
  }, [patientId]);

  if (loading) return <Box className="text-center py-8"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!reports.length) return <Typography className="text-gray-400 text-center py-8">No reports found</Typography>;

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead className="bg-gray-50">
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Uploaded By</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((rpt) => (
            <TableRow key={rpt._id} hover>
              <TableCell>{formatDate(rpt.createdAt)}</TableCell>
              <TableCell>{rpt.title || "-"}</TableCell>
              <TableCell>
                <Chip size="small" label={rpt.category?.replace("_", " ") || "-"} variant="outlined" />
              </TableCell>
              <TableCell>{rpt.uploadedBy?.name || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Invoices Tab Content
 */
const InvoicesTab = ({ patientId, paymentStatusFilter, onClearFilter }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const params = { patient: patientId, limit: 50 };
        if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
        const res = await getInvoices(params);
        setInvoices(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchInvoices();
  }, [patientId, paymentStatusFilter]);

  if (loading) return <Box className="text-center py-8"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      {paymentStatusFilter && (
        <Box className="flex items-center gap-2 mb-3">
          <Chip
            label={`Filter: ${paymentStatusFilter.replace(/_/g, " ")}`}
            size="small"
            color="warning"
            onDelete={onClearFilter}
          />
          <Typography variant="caption" className="text-gray-500">
            Click × to show all invoices
          </Typography>
        </Box>
      )}

      {!invoices.length ? (
        <Typography className="text-gray-400 text-center py-8">
          {paymentStatusFilter
            ? `No ${paymentStatusFilter.replace(/_/g, " ")} invoices found for this patient.`
            : "No invoices found for this patient."}
        </Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell>Invoice No.</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Balance Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv._id} hover>
                  <TableCell className="font-numbers">{inv.invoiceNumber || "-"}</TableCell>
                  <TableCell>{formatDate(inv.createdAt)}</TableCell>
                  <TableCell>
                    {inv.items?.length > 0 ? inv.items[0].description || "-" : "-"}
                    {inv.items?.length > 1 && (
                      <Typography component="span" variant="caption" className="text-gray-400">
                        {` +${inv.items.length - 1} more`}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(inv.grandTotal)}</TableCell>
                  <TableCell className="text-green-600">{formatCurrency(inv.amountPaid)}</TableCell>
                  <TableCell className="text-red-600">{formatCurrency(inv.balanceDue)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={inv.paymentStatus?.replace(/_/g, " ") || "-"}
                      color={statusColors[inv.paymentStatus] || "default"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Invoice">
                      <IconButton
                        size="small"
                        onClick={() => { setSelectedInvoice(inv); setInvoiceModalOpen(true); }}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <InvoiceDetailModal
        open={invoiceModalOpen}
        onClose={() => { setInvoiceModalOpen(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
        onRefresh={() => {
          setInvoiceModalOpen(false);
          setSelectedInvoice(null);
        }}
      />
    </>
  );
};

/**
 * Lab Orders Tab Content
 * Fetches all lab orders and filters client-side by patient ID.
 */
const LabOrdersTab = ({ patientId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await getLabOrders({ limit: 200 });
        const all = res.data || [];
        setOrders(
          all.filter((o) => String(o.patient?._id || o.patient) === String(patientId))
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load lab orders");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchOrders();
  }, [patientId]);

  if (loading) return <Box className="text-center py-8"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!orders.length) return <Typography className="text-gray-400 text-center py-8">No lab orders found for this patient.</Typography>;

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead className="bg-gray-50">
          <TableRow>
            <TableCell>Order No.</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Lab</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Delivery</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id} hover>
              <TableCell className="font-numbers">{order.orderNumber || "-"}</TableCell>
              <TableCell>{formatDate(order.orderDate)}</TableCell>
              <TableCell>{order.lab?.name || "-"}</TableCell>
              <TableCell>
                {order.items?.length > 0
                  ? order.items.map((it) => it.procedure).join(", ")
                  : "-"}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={order.deliveryStatus?.replace(/_/g, " ") || "-"}
                  color={statusColors[order.deliveryStatus] || "default"}
                />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={order.paymentStatus?.replace(/_/g, " ") || "-"}
                  color={statusColors[order.paymentStatus] || "default"}
                />
              </TableCell>
              <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Main Component
 */
const PatientDetailModal = ({ open, onClose, patient, onEdit, onDelete, onReactivate, onRefresh }) => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [assignMembershipOpen, setAssignMembershipOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [permDeleteConfirmOpen, setPermDeleteConfirmOpen] = useState(false);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState("");

  // Reset tab when modal opens
  useEffect(() => {
    if (open) setActiveTab(0);
  }, [open]);

  // Trigger refresh for child components
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    onRefresh?.();
  };

  const handlePermDelete = async () => {
    try {
      setPermDeleteConfirmOpen(false);
      const result = await deletePatient(patient._id);
      const patientName = result?.data?.name || patient?.name || "Patient";
      toast.success(`"${patientName}" has been permanently deleted.`);
      onClose();
      queryClient.invalidateQueries({ queryKey: ["admin", "patients"] });
      queryClient.refetchQueries({ queryKey: ["admin", "patients"] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete patient");
    }
  };

  if (!patient) return null;

  const { name, isActive, hasMembership, membership, currentDiscount, createdAt, updatedAt } = patient;

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: "8px", maxHeight: "90vh" } }}
    >
      {/* Header */}
      <DialogTitle className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white" sx={{ p: 0 }}>
        <Box className="flex items-center justify-between px-4 py-2">
          <Box className="flex items-center gap-3">
            <Avatar className="bg-white text-blue-600 font-bold" sx={{ width: 40, height: 40, fontSize: "1rem" }}>
              {name?.[0]?.toUpperCase() || "P"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" className="font-bold leading-tight">
                {name || "Unknown Patient"}
              </Typography>
              <Box className="flex items-center gap-2 mt-0.5">
                <Chip
                  label={isActive ? "Active" : "Inactive"}
                  size="small"
                  color={isActive ? "success" : "error"}
                  sx={!isActive ? { bgcolor: "#ef4444", color: "#fff" } : {}}
                />
                {hasMembership && (
                  <Chip
                    label={`${membership?.planName} (${currentDiscount}% off)`}
                    size="small"
                    sx={{ bgcolor: "#fef9c3", color: "#92400e", fontWeight: 500 }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon className="text-white" fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Tabs */}
      <Box className="border-b border-gray-200 px-4">
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            if (val === 7) setInvoiceStatusFilter("");
            setActiveTab(val);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 36,
            "& .MuiTab-root": { minHeight: 36, py: 0.5, px: 1.5, fontSize: "0.75rem", fontWeight: 600, textTransform: "none", minWidth: 0 },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Appointments" />
          <Tab label="Treatments" />
          <Tab label="Tests" />
          <Tab label="Payment History" />
          <Tab label="Reports" />
          <Tab label="Lab" />
          <Tab label="Invoices" />
        </Tabs>
      </Box>

      {/* Content — scrolls within the dialog; the pinned footer below stays clear.
          overflowY forced so content never hides behind the action buttons. */}
      <DialogContent
        className="p-4"
        sx={{ overflowY: "auto !important" }}
      >
        <TabPanel value={activeTab} index={0}>
          <OverviewTab
            patient={patient}
            onAssignMembership={() => setAssignMembershipOpen(true)}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <AppointmentsTab
            patientId={patient._id}
            patient={patient}
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <TreatmentsTab patientId={patient._id} />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <TestsTab patientId={patient._id} />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <PaymentsTab
            patientId={patient._id}
            refreshKey={refreshKey}
            onTabSwitch={(tabIndex, filter = "") => {
              setInvoiceStatusFilter(filter);
              setActiveTab(tabIndex);
            }}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={5}>
          <ReportsTab patientId={patient._id} />
        </TabPanel>
        <TabPanel value={activeTab} index={6}>
          <LabOrdersTab patientId={patient._id} />
        </TabPanel>
        <TabPanel value={activeTab} index={7}>
          <InvoicesTab
            patientId={patient._id}
            paymentStatusFilter={invoiceStatusFilter}
            onClearFilter={() => setInvoiceStatusFilter("")}
          />
        </TabPanel>

      </DialogContent>

      {/* Actions — pinned footer, clearly separated with a top divider */}
      <DialogActions
        className="p-3 bg-gray-50 justify-between"
        sx={{ borderTop: 1, borderColor: "divider", flexWrap: "wrap", rowGap: 1 }}
      >
        <Box className="flex gap-2 flex-wrap">
          <Button
            variant="outlined"
            startIcon={<LockResetIcon />}
            onClick={() => setResetPasswordOpen(true)}
            sx={{ textTransform: "none", fontSize: "12px", py: 0.5, px: 1.5 }}
          >
            Reset Password
          </Button>
          <Button
            variant="outlined"
            startIcon={<EventRepeatIcon />}
            onClick={() => setFollowUpOpen(true)}
            sx={{ textTransform: "none", fontSize: "12px", py: 0.5, px: 1.5 }}
          >
            Add Follow-up Reminder
          </Button>
          {onDelete && isActive && (
            <Tooltip
              title={hasMembership ? "Patient has an active membership — cannot deactivate." : ""}
              arrow
            >
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(patient)}
                  disabled={hasMembership}
                  sx={{ textTransform: "none", fontSize: "12px", py: 0.5, px: 1.5 }}
                >
                  Deactivate
                </Button>
              </span>
            </Tooltip>
          )}
          {onDelete && !isActive && (
            <>
              <Button
                variant="outlined"
                color="success"
                onClick={() => onReactivate?.(patient)}
                sx={{ textTransform: "none", fontSize: "12px", py: 0.5, px: 1.5 }}
              >
                Activate
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setPermDeleteConfirmOpen(true)}
                sx={{ textTransform: "none", fontSize: "12px", py: 0.5, px: 1.5 }}
              >
                Delete Permanently
              </Button>
            </>
          )}
        </Box>
        <Box className="flex gap-2 flex-wrap">
          <Button onClick={onClose} color="inherit" sx={{ textTransform: "none", fontSize: "12px", py: 0.5, px: 1.5 }}>
            Close
          </Button>
          {onEdit && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => onEdit(patient)}
              className="bg-blue-600 hover:bg-blue-700"
              sx={{ textTransform: "none", fontSize: "12px", py: 0.5, px: 1.5 }}
            >
              Edit Patient
            </Button>
          )}
        </Box>
      </DialogActions>


      {/* Assign Membership Modal */}
      <AssignMembershipModal
        open={assignMembershipOpen}
        onClose={() => setAssignMembershipOpen(false)}
        patient={patient}
        onSuccess={handleRefresh}
      />

      {/* Reset / Set Password */}
      <ResetPasswordDialog
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
        patient={patient}
      />

      {/* Follow-up Reminder (reminder only — no payment) */}
      <FollowUpReminderModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
        patient={patient}
      />
    </Dialog>

    <ConfirmDialog
      open={permDeleteConfirmOpen}
      onClose={() => setPermDeleteConfirmOpen(false)}
      onConfirm={handlePermDelete}
      title="Permanently Delete Patient"
      message={`Permanently delete ${name}? This cannot be undone.`}
      confirmText="Delete Permanently"
      confirmColor="error"
    />
    </>
  );
};

export default PatientDetailModal;
