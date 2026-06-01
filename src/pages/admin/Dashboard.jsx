/**
 * Admin Dashboard Page
 *
 * Main dashboard showing overview statistics and recent activity.
 *
 * Features:
 * - Stats cards (patients, appointments, revenue, etc.)
 * - Recent appointments table
 * - Recent patients list
 * - Today's schedule
 *
 * Uses:
 * - MUI Grid for responsive layout
 * - Tailwind CSS for styling
 * - React Query via useDashboard hook
 */
import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Skeleton,
  IconButton,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import PaymentIcon from "@mui/icons-material/Payment";
import TodayIcon from "@mui/icons-material/Today";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../hooks/admin/useDashboard";
import PatientDetailModal from "../../components/admin/modals/PatientDetailModal";

/**
 * Stats Card Component
 * Reusable card for displaying statistics
 */
const StatsCard = ({ title, value, icon: Icon, color, loading }) => (
  <Card className="h-full">
    <CardContent className="flex items-center gap-4">
      {/* Icon */}
      <Box
        className={`p-3 rounded-xl ${color}`}
      >
        <Icon className="text-white text-2xl" />
      </Box>

      {/* Content */}
      <Box>
        <Typography variant="body2" className="text-gray-500 mb-1">
          {title}
        </Typography>
        {loading ? (
          <Skeleton width={60} height={32} />
        ) : (
          <Typography variant="h5" className="font-bold text-gray-800">
            {value ?? 0}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

/**
 * Status chip color mapping
 */
const getStatusColor = (status) => {
  const colors = {
    scheduled: "info",
    confirmed: "primary",
    checked_in: "warning",
    in_progress: "warning",
    completed: "success",
    cancelled: "error",
    no_show: "default",
    pending: "warning",
  };
  return colors[status?.toLowerCase()] || "default";
};

/**
 * Format date helper
 */
const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format time helper
 */
const formatTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    stats,
    recentAppointments,
    recentPatients,
    todayAppointments,
    recentEnquiries,
    isLoadingStats,
    isLoadingRecentAppointments,
    isLoadingRecentPatients,
    isLoadingTodayAppointments,
    isLoadingRecentEnquiries,
    refetchAll,
  } = useDashboard();

  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <Box>
      {/* Page Header */}
      <Box className="flex justify-between items-center mb-6">
        <Box>
          <Typography variant="h4" className="font-bold text-gray-800">
            Dashboard
          </Typography>
          <Typography variant="body2" className="text-gray-500">
            Welcome back! Here's what's happening today.
          </Typography>
        </Box>
        <IconButton onClick={refetchAll} className="text-gray-600">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Total Patients"
            value={stats?.totalPatients}
            icon={PeopleIcon}
            color="bg-blue-500"
            loading={isLoadingStats}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Total Appointments"
            value={stats?.totalAppointments}
            icon={EventIcon}
            color="bg-green-500"
            loading={isLoadingStats}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Pending Payments"
            value={stats?.pendingPayments}
            icon={PaymentIcon}
            color="bg-orange-500"
            loading={isLoadingStats}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatsCard
            title="Today's Appointments"
            value={stats?.todayAppointments}
            icon={TodayIcon}
            color="bg-purple-500"
            loading={isLoadingStats}
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Appointments Table */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              {/* Card Header */}
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold text-gray-800">
                  Recent Appointments
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/appointments")}
                >
                  View All
                </Button>
              </Box>

              {/* Appointments List */}
              <Box>
                {isLoadingRecentAppointments ? (
                  [...Array(3)].map((_, i) => (
                    <Box key={i} className="flex items-center gap-3 p-2">
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box flex={1}>
                        <Skeleton width="60%" height={20} />
                        <Skeleton width="40%" height={16} />
                      </Box>
                    </Box>
                  ))
                ) : recentAppointments?.length > 0 ? (
                  recentAppointments.map((appointment) => (
                    <Box
                      key={appointment._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate("/admin/appointments")}
                    >
                      <Avatar sx={{ width: 36, height: 36 }} className="bg-blue-100 text-blue-600">
                        {appointment.patient?.name?.[0] || "P"}
                      </Avatar>
                      <Box className="flex-1 min-w-0">
                        <Typography variant="body2" className="font-medium text-gray-800 truncate">
                          {appointment.patient?.name || "Unknown"}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {appointment.reason || "Checkup"} • {formatDate(appointment.date)} • {appointment.timeSlot || ""}
                        </Typography>
                      </Box>
                      <Chip
                        label={appointment.status?.replace("_", " ") || "scheduled"}
                        color={getStatusColor(appointment.status)}
                        size="small"
                        className="capitalize"
                        sx={{ fontSize: "0.65rem" }}
                      />
                    </Box>
                  ))
                ) : (
                  <Box className="text-center py-8">
                    <Typography variant="body2" className="text-gray-500">
                      No recent appointments
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Patients */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card className="h-full">
            <CardContent>
              {/* Card Header */}
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold text-gray-800">
                  Recent Patients
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/patients")}
                >
                  View All
                </Button>
              </Box>

              {/* Patient List */}
              <Box className="space-y-3">
                {isLoadingRecentPatients ? (
                  // Loading skeletons
                  [...Array(5)].map((_, index) => (
                    <Box key={index} className="flex items-center gap-3 p-2">
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box className="flex-1">
                        <Skeleton width="60%" />
                        <Skeleton width="40%" height={16} />
                      </Box>
                    </Box>
                  ))
                ) : recentPatients?.length > 0 ? (
                  recentPatients.map((patient) => (
                    <Box
                      key={patient._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <Avatar className="bg-blue-100 text-blue-600">
                        {patient.name?.[0] || "P"}
                      </Avatar>
                      <Box className="flex-1 min-w-0">
                        <Typography variant="body2" className="font-medium text-gray-800 truncate">
                          {patient.name || "Unknown"}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {patient.phone || "No phone"}
                        </Typography>
                      </Box>
                      <Typography variant="caption" className="text-gray-400">
                        {formatDate(patient.createdAt)}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Box className="text-center py-8">
                    <Typography variant="body2" className="text-gray-500">
                      No recent patients
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Enquiries / Contact Form Entries */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold text-gray-800">
                  Recent Enquiries
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/admin/enquiries")}
                >
                  View All
                </Button>
              </Box>

              <Box>
                {isLoadingRecentEnquiries ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} className="flex items-center gap-3 p-2">
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box flex={1}>
                        <Skeleton width="60%" height={20} />
                        <Skeleton width="40%" height={16} />
                      </Box>
                    </Box>
                  ))
                ) : recentEnquiries?.length > 0 ? (
                  recentEnquiries.map((enquiry) => (
                    <Box
                      key={enquiry._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate("/admin/enquiries")}
                    >
                      <Avatar className="bg-orange-100 text-orange-600">
                        {enquiry.name?.[0] || "?"}
                      </Avatar>
                      <Box className="flex-1 min-w-0">
                        <Typography variant="body2" className="font-medium text-gray-800 truncate">
                          {enquiry.name}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                          {enquiry.phone} {enquiry.treatmentName ? `• ${enquiry.treatmentName}` : ""}
                        </Typography>
                      </Box>
                      <Chip
                        label={enquiry.status || "new"}
                        size="small"
                        color={enquiry.status === "new" ? "info" : enquiry.status === "contacted" ? "warning" : "default"}
                        sx={{ fontSize: "0.65rem" }}
                      />
                    </Box>
                  ))
                ) : (
                  <Box className="text-center py-8">
                    <Typography variant="body2" className="text-gray-500">
                      No enquiries yet
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Schedule */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              {/* Card Header */}
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold text-gray-800">
                  Today's Schedule
                </Typography>
                <Typography variant="body2" className="text-gray-500">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Typography>
              </Box>

              {/* Today's Appointments */}
              {isLoadingTodayAppointments ? (
                <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} variant="rounded" height={80} />
                  ))}
                </Box>
              ) : todayAppointments?.length > 0 ? (
                <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {todayAppointments.map((appointment) => (
                    <Box
                      key={appointment._id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => navigate("/admin/appointments")}
                    >
                      <Box className="flex items-center gap-3 mb-2">
                        <Avatar sx={{ width: 36, height: 36 }} className="bg-blue-100 text-blue-600 text-sm">
                          {appointment.patient?.name?.[0] || "P"}
                        </Avatar>
                        <Box className="flex-1 min-w-0">
                          <Typography variant="body2" className="font-medium truncate">
                            {appointment.patient?.name || "Unknown"}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {appointment.timeSlot || "-"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box className="flex justify-between items-center">
                        <Typography variant="caption" className="text-gray-600 truncate max-w-[100px]">
                          {appointment.reason || "Checkup"}
                        </Typography>
                        <Chip
                          label={appointment.status?.replace("_", " ") || "scheduled"}
                          color={getStatusColor(appointment.status)}
                          size="small"
                          className="capitalize"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box className="text-center py-8">
                  <Typography variant="body2" className="text-gray-500">
                    No appointments scheduled for today
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Patient Detail Modal */}
      <PatientDetailModal
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        patient={selectedPatient}
      />
    </Box>
  );
};

export default Dashboard;