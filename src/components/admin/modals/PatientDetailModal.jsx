/**
 * Patient Detail Modal (Enhanced)
 *
 * Displays complete patient information with tabs:
 * - Overview: Personal info, medical info, membership
 * - Appointments: Patient's appointment history (with edit)
 * - Treatments: Treatment history
 * - Payments: Payment history with summary (with add payment)
 * - Reports: Medical reports
 */
import React, { useState, useEffect, useCallback } from "react";
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
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import PatientCouponsModal from "./PatientCouponsModal";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import EventIcon from "@mui/icons-material/Event";
import PaymentIcon from "@mui/icons-material/Payment";
import DescriptionIcon from "@mui/icons-material/Description";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ScienceIcon from "@mui/icons-material/Science";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  getPatientAppointments,
  getPatientTreatments,
  getPatientPayments,
  getPatientReports,
  getPatientTests,
} from "../../../api/admin/patients.api";
import EditAppointmentModal from "./EditAppointmentModal";
import RecordPaymentModal from "./RecordPaymentModal";

/**
 * Tab Panel Component
 */
const TabPanel = ({ children, value, index, ...other }) => (
  <div role="tabpanel" hidden={value !== index} {...other}>
    {value === index && <Box className="py-4">{children}</Box>}
  </div>
);

/**
 * Info row component
 */
const InfoRow = ({ icon: Icon, label, value, color = "text-gray-600" }) => (
  <Box className="flex items-start gap-3 py-2">
    {Icon && <Icon className={`${color} mt-0.5`} fontSize="small" />}
    <Box>
      <Typography variant="caption" className="text-gray-500 block">
        {label}
      </Typography>
      <Typography variant="body2" className="font-medium">
        {value || "-"}
      </Typography>
    </Box>
  </Box>
);

/**
 * Section header component
 */
const SectionHeader = ({ title, icon: Icon }) => (
  <Box className="flex items-center gap-2 mb-3 mt-4">
    {Icon && <Icon className="text-blue-600" fontSize="small" />}
    <Typography
      variant="subtitle2"
      className="font-semibold text-gray-700 uppercase tracking-wide"
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
};

/**
 * Overview Tab Content
 */
const OverviewTab = ({ patient }) => {
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

  return (
    <Grid container spacing={4}>
      {/* Left Column */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionHeader title="Personal Information" icon={PersonIcon} />
        <Box className="bg-gray-50 rounded-lg p-4">
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

        <SectionHeader title="Address" icon={LocationOnIcon} />
        <Box className="bg-gray-50 rounded-lg p-4">
          {address ? (
            <Typography variant="body2">
              {[address.street, address.city, address.state, address.pincode]
                .filter(Boolean)
                .join(", ") || "-"}
            </Typography>
          ) : (
            <Typography variant="body2" className="text-gray-400">
              No address provided
            </Typography>
          )}
        </Box>

        <SectionHeader title="Emergency Contact" icon={ContactPhoneIcon} />
        <Box className="bg-gray-50 rounded-lg p-4">
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
      </Grid>

      {/* Right Column */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionHeader title="Medical Information" icon={LocalHospitalIcon} />
        <Box className="bg-gray-50 rounded-lg p-4">
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
              <Typography variant="body2">No known allergies</Typography>
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
              <Typography variant="body2">No medical history recorded</Typography>
            )}
          </Box>
        </Box>

        <SectionHeader title="Membership" icon={CardMembershipIcon} />
        <Box className="bg-gray-50 rounded-lg p-4">
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
              <Typography variant="caption" className="text-gray-500 block">
                Discount: {membership.discountPercent}%
              </Typography>
              <Typography variant="caption" className="text-gray-500 block">
                Valid: {formatDate(membership.startDate)} - {formatDate(membership.expiryDate)}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CardGiftcardIcon />}
                onClick={() => setCouponsModalOpen(true)}
                sx={{ mt: 1, fontSize: "0.7rem" }}
              >
                View Coupons
              </Button>
            </>
          ) : (
            <Typography variant="body2" className="text-gray-400">
              No active membership
            </Typography>
          )}
        </Box>

        {notes && (
          <>
            <SectionHeader title="Notes" />
            <Box className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <Typography variant="body2">{notes}</Typography>
            </Box>
          </>
        )}
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
 * Payments Tab Content
 */
const PaymentsTab = ({ patientId, patient, refreshKey, onRefresh }) => {
  const [data, setData] = useState({ payments: [], summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPatientPayments(patientId, { limit: 50 });
      setData({
        payments: res.data?.payments || [],
        summary: res.data?.summary || null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) fetchPayments();
  }, [patientId, refreshKey, fetchPayments]);

  const handlePaymentSuccess = () => {
    fetchPayments();
    onRefresh?.();
  };

  if (loading) return <Box className="text-center py-8"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const { payments, summary } = data;

  return (
    <>
      {/* Header with Add Payment Button */}
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="subtitle1" className="font-semibold text-gray-700">
          Payment History
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setRecordPaymentOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          Record Payment
        </Button>
      </Box>

      {/* Payment Summary */}
      {summary && (
        <Box className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Box className="bg-green-50 rounded-lg p-4 text-center">
            <Typography variant="h6" className="font-bold text-green-600">
              {formatCurrency(summary.totalPaid)}
            </Typography>
            <Typography variant="caption" className="text-gray-600">Total Paid</Typography>
          </Box>
          <Box className="bg-red-50 rounded-lg p-4 text-center">
            <Typography variant="h6" className="font-bold text-red-600">
              {formatCurrency(summary.totalPending)}
            </Typography>
            <Typography variant="caption" className="text-gray-600">Pending</Typography>
          </Box>
          <Box className="bg-blue-50 rounded-lg p-4 text-center">
            <Typography variant="h6" className="font-bold text-blue-600">
              {summary.totalPayments || 0}
            </Typography>
            <Typography variant="caption" className="text-gray-600">Total Payments</Typography>
          </Box>
          <Box className="bg-purple-50 rounded-lg p-4 text-center">
            <Typography variant="h6" className="font-bold text-purple-600">
              {formatCurrency(summary.totalAmount)}
            </Typography>
            <Typography variant="caption" className="text-gray-600">Total Amount</Typography>
          </Box>
        </Box>
      )}

      {!payments.length ? (
        <Typography className="text-gray-400 text-center py-8">No payments found</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead className="bg-gray-50">
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((pmt) => (
                <TableRow key={pmt._id} hover>
                  <TableCell>{formatDate(pmt.createdAt)}</TableCell>
                  <TableCell className="capitalize">{pmt.type?.replace("_", " ") || "-"}</TableCell>
                  <TableCell className="capitalize">{pmt.paymentMode?.replace("_", " ") || pmt.method?.replace("_", " ") || "-"}</TableCell>
                  <TableCell className="font-medium text-green-600">{formatCurrency(pmt.amount)}</TableCell>
                  <TableCell>{pmt.referenceNumber || "-"}</TableCell>
                  <TableCell>{pmt.notes || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        open={recordPaymentOpen}
        onClose={() => setRecordPaymentOpen(false)}
        patient={patient}
        onSuccess={handlePaymentSuccess}
      />
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
 * Main Component
 */
const PatientDetailModal = ({ open, onClose, patient, onEdit, onDelete, onReactivate, onPermanentDelete, onRefresh }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [couponsModalOpen, setCouponsModalOpen] = useState(false);

  // Reset tab when modal opens
  useEffect(() => {
    if (open) setActiveTab(0);
  }, [open]);

  // Trigger refresh for child components
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    onRefresh?.();
  };

  if (!patient) return null;

  const { name, isActive, hasMembership, membership, currentDiscount, createdAt, updatedAt } = patient;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ className: "rounded-xl", sx: { maxHeight: "90vh" } }}
    >
      {/* Header */}
      <DialogTitle className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-0">
        <Box className="flex items-center justify-between p-0">
          <Box className="flex items-center gap-4">
            <Avatar className="bg-white text-blue-600 w-16 h-16 text-2xl font-bold">
              {name?.[0]?.toUpperCase() || "P"}
            </Avatar>
            <Box>
              <Typography variant="h5" className="font-bold">
                {name || "Unknown Patient"}
              </Typography>
              <Box className="flex items-center gap-2 mt-1">
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
                    className="bg-yellow-100 text-yellow-700"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon className="text-white" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Tabs */}
      <Box className="border-b border-gray-200 px-4">
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PersonIcon />} label="Overview" iconPosition="start" />
          <Tab icon={<EventIcon />} label="Appointments" iconPosition="start" />
          <Tab icon={<MedicalServicesIcon />} label="Treatments" iconPosition="start" />
          <Tab icon={<ScienceIcon />} label="Tests" iconPosition="start" />
          <Tab icon={<PaymentIcon />} label="Payments" iconPosition="start" />
          <Tab icon={<DescriptionIcon />} label="Reports" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Content */}
      <DialogContent className="p-6" style={{ minHeight: "400px" }}>
        <TabPanel value={activeTab} index={0}>
          <OverviewTab patient={patient} />
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
            patient={patient}
            refreshKey={refreshKey}
            onRefresh={handleRefresh}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={5}>
          <ReportsTab patientId={patient._id} />
        </TabPanel>

        {/* Footer Info */}
        <Divider className="my-4" />
        <Box className="flex justify-between text-gray-400">
          <Typography variant="caption">Registered: {formatDate(createdAt)}</Typography>
          <Typography variant="caption">Last Updated: {formatDate(updatedAt)}</Typography>
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions className="p-4 bg-gray-50 justify-between">
        <Box className="flex gap-2">
          {onDelete && isActive && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(patient)}
            >
              Deactivate
            </Button>
          )}
          {onDelete && !isActive && (
            <>
              <Button
                variant="outlined"
                color="success"
                onClick={() => {
                  if (onReactivate) onReactivate(patient);
                  else onDelete(patient); // fallback: toggle
                }}
              >
                Activate
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  if (window.confirm(`Permanently delete ${name}? This cannot be undone.`)) {
                    if (onPermanentDelete) onPermanentDelete(patient);
                  }
                }}
              >
                Delete Permanently
              </Button>
            </>
          )}
        </Box>
        <Box className="flex gap-2">
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
          {onEdit && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => onEdit(patient)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Edit Patient
            </Button>
          )}
        </Box>
      </DialogActions>

      {/* Patient Coupons Modal */}
      <PatientCouponsModal
        open={couponsModalOpen}
        onClose={() => setCouponsModalOpen(false)}
        patientId={patient?._id}
        patientName={patient?.name}
      />
    </Dialog>
  );
};

export default PatientDetailModal;
