/**
 * Patient Membership Page (PORTAL)
 *
 * Shows the patient's current membership status within the portal layout.
 * Links to public membership plans page for purchasing/upgrading.
 */
import CouponGrid from "../../components/patient/CouponGrid";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  Chip,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useMyMembership } from "../../hooks/patient/useMemberships";

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
};

/**
 * Format date
 */
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Check if membership is active
 */
const isMembershipActive = (membership) => {
  if (!membership || !membership.endDate) return false;
  return new Date(membership.endDate) > new Date();
};

const Membership = () => {
  const patient = useAuthStore((state) => state.patient);
  const { data: membershipData, isLoading } = useMyMembership(patient?._id);
  const membership = membershipData?.data?.membership;
  const plan = membership?.plan;
  const isActive = isMembershipActive(membership);

  return (
    <Box>
      {/* Page Header */}
      <Box className="mb-6">
        <Typography variant="h5" className="font-semibold">
          My Membership
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View your membership status and benefits
        </Typography>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={300} className="rounded-lg" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rectangular" height={300} className="rounded-lg" />
          </Grid>
        </Grid>
      ) : membership && plan ? (
        <Grid container spacing={3}>
          {/* Current Membership Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card className="h-full">
              <Box
                className={`p-4 text-white ${
                  isActive
                    ? "bg-linear-to-r from-green-500 to-green-600"
                    : "bg-linear-to-r from-gray-500 to-gray-600"
                }`}
              >
                <Box className="flex items-center gap-2 mb-2">
                  <CardMembershipIcon />
                  <Typography variant="h6" className="font-bold">
                    {plan.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={isActive ? "Active" : "Expired"}
                    sx={{
                      ml: "auto",
                      bgcolor: "rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                </Box>
                <Typography variant="body2" className="opacity-80">
                  {plan.type === "family" ? "Family Plan" : "Individual Plan"}
                </Typography>
              </Box>

              <CardContent className="p-4">
                {/* Membership Dates */}
                <Box className="space-y-3 mb-4">
                  <Box className="flex items-center gap-2">
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <span className="text-gray-500">Started:</span>{" "}
                      <span className="font-medium">{formatDate(membership.startDate)}</span>
                    </Typography>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <span className="text-gray-500">Expires:</span>{" "}
                      <span className="font-medium">{formatDate(membership.endDate)}</span>
                    </Typography>
                  </Box>
                </Box>

                {!isActive && (
                  <Alert severity="warning" className="mb-4">
                    Your membership has expired. Renew to continue enjoying benefits.
                  </Alert>
                )}

                {/* Plan Price */}
                <Box className="bg-gray-50 rounded-lg p-3 mb-4">
                  <Typography variant="caption" color="text.secondary">
                    Plan Value
                  </Typography>
                  <Typography variant="h5" className="font-bold text-green-600">
                    {formatCurrency(plan.price)}
                    <Typography component="span" variant="body2" color="text.secondary">
                      {" "}
                      / {plan.duration || 12} months
                    </Typography>
                  </Typography>
                </Box>

                {/* Renewal Button */}
                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  to="/membership-plans"
                  startIcon={<ShoppingCartIcon />}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isActive ? "Upgrade Plan" : "Renew Membership"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Benefits Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card className="h-full">
              <CardContent className="p-4">
                <Typography variant="h6" className="font-semibold mb-4">
                  Your Benefits
                </Typography>

                {/* Discounts */}
                {plan.discounts && (
                  <Box className="bg-amber-50 rounded-lg p-4 mb-4">
                    <Typography variant="subtitle2" className="font-semibold text-amber-700 mb-2">
                      Member Discounts
                    </Typography>
                    <Box className="space-y-2">
                      {plan.discounts.consultationDiscount > 0 && (
                        <Box className="flex items-center gap-2">
                          <CheckCircleIcon fontSize="small" className="text-green-500" />
                          <Typography variant="body2">
                            {plan.discounts.consultationDiscount}% off on consultations
                          </Typography>
                        </Box>
                      )}
                      {plan.discounts.treatmentDiscount > 0 && (
                        <Box className="flex items-center gap-2">
                          <CheckCircleIcon fontSize="small" className="text-green-500" />
                          <Typography variant="body2">
                            {plan.discounts.treatmentDiscount}% off on treatments
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" className="font-semibold mb-2">
                      Plan Features
                    </Typography>
                    <Box className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <Box key={idx} className="flex items-start gap-2">
                          <CheckCircleIcon fontSize="small" className="text-green-500 mt-0.5" />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* No features */}
                {(!plan.features || plan.features.length === 0) && (
                  <Typography variant="body2" color="text.secondary">
                    Contact the clinic for detailed benefits information.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        /* No Membership */
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CardMembershipIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              No Active Membership
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
            >
              You don't have an active membership plan. Explore our membership options to enjoy
              exclusive benefits and discounts on consultations and treatments.
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/membership-plans"
              startIcon={<ShoppingCartIcon />}
              endIcon={<OpenInNewIcon />}
              className="bg-teal-600 hover:bg-teal-700"
            >
              View Membership Plans
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="mt-6 bg-blue-50">
        <CardContent className="p-4">
          <Typography variant="subtitle2" className="font-semibold mb-1">
            Need Help?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            For membership inquiries, renewals, or upgrades, please contact our front desk or call
            us at +91 98765 43210.
          </Typography>
        </CardContent>
      </Card>

      {/* Coupon Cards Section */}
      <CouponGrid />
    </Box>
  );
};

export default Membership;
