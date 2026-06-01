/**
 * Public Membership Plans Page
 *
 * Displays membership plans from backend API.
 * Allows purchase via Razorpay (requires patient login).
 */
import { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import BreadcrumbBanner from "../../components/public/BreadcrumbBanner";

// Tier colors
const tierColors = {
  silver: { bg: "#e3f2fd", border: "#1976d2", accent: "#1565c0", badge: "#1976d2" },
  gold: { bg: "#fff8e1", border: "#ffc107", accent: "#f57f17", badge: "#ffc107" },
  platinum: { bg: "#e8eaf6", border: "#3f51b5", accent: "#1a237e", badge: "#3f51b5" },
};

// Plan images from public folder
const planImages = {
  "individual silver": "/student-dental-plan.jpg",
  "individual gold": "/women-dental-plan.jpeg",
  "individual platinum": "/implant-post-care.webp",
  "family silver": "/oral-hygiene-kids.jpg",
  "family gold": "/oral-hygiene-adults.jpg",
  "family platinum": "/family-dental-plan.jpg",
};

const getPlanImage = (plan) => {
  const key = plan?.name?.toLowerCase();
  return planImages[key] || "/implant-post-care.webp";
};

const PlansPage = () => {
  const [buyDialog, setBuyDialog] = useState(null);
  const [buyForm, setBuyForm] = useState({ name: "", phone: "", email: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch plans from API
  const { data, isLoading } = useQuery({
    queryKey: ["public", "membership-plans"],
    queryFn: () => api.get("/memberships/plans").then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const plans = data?.data?.plans || data?.data || [];

  // Handle Buy Now click
  const handleBuyClick = (plan) => {
    setBuyDialog(plan);
    setBuyForm({ name: "", phone: "", email: "" });
  };

  // Handle purchase with Razorpay
  const handlePurchase = async () => {
    if (!buyForm.name.trim() || !buyForm.phone.trim() || !buyForm.email.trim()) {
      toast.info("Please fill in all fields");
      return;
    }
    if (!/^\d{10}$/.test(buyForm.phone.replace(/\D/g, ""))) {
      toast.info("Please enter a valid 10-digit phone number");
      return;
    }

    setIsProcessing(true);
    try {
      // Create Razorpay order
      const orderRes = await api.post("/payments/razorpay/create-order", {
        amount: buyDialog.price,
        type: "membership",
        isOnlineBooking: true,
      });

      const { order, paymentId, key_id } = orderRes.data.data;

      // Load Razorpay
      const rzp = new window.Razorpay({
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Ujjwal Dental Clinic",
        description: `${buyDialog.name} Membership`,
        order_id: order.id,
        prefill: {
          name: buyForm.name,
          contact: buyForm.phone,
          email: buyForm.email,
        },
        theme: { color: "#006694" },
        handler: async (response) => {
          try {
            // Verify payment
            await api.post("/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
            });

            // Purchase membership
            await api.post("/memberships/purchase", {
              planId: buyDialog._id,
              paymentId,
              name: buyForm.name,
              phone: buyForm.phone,
              email: buyForm.email,
            });

            toast.success("Membership purchased successfully! Check your email for login details.");
            setBuyDialog(null);
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.warning("Payment cancelled");
          },
        },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <BreadcrumbBanner
        title="Our Plans"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Plans" }]}
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Page Intro */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h4" fontWeight={800} color="#003366" gutterBottom>
            Membership Plans
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Choose the perfect plan for you and your family. Enjoy exclusive discounts and priority care.
          </Typography>
        </Box>

        {/* Plans Grid */}
        {isLoading ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : plans.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography variant="h6" color="text.secondary">
              No plans available at the moment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Contact us for membership information
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {plans.map((plan) => {
              const colors = tierColors[plan.tier] || tierColors.silver;
              const image = getPlanImage(plan);

              return (
                <Grid key={plan._id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      border: `2px solid ${colors.border}`,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: 8,
                      },
                      overflow: "hidden",
                    }}
                  >
                    {/* Plan Image */}
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative",
                      }}
                    >
                      <Chip
                        icon={<StarIcon sx={{ fontSize: 14, color: "#fff !important" }} />}
                        label={plan.tier?.toUpperCase()}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          bgcolor: colors.badge,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }}
                      />
                    </Box>

                    {/* Plan Details */}
                    <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 3 }}>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color={colors.accent}
                        sx={{ textTransform: "uppercase", mb: 1, fontSize: "0.95rem" }}
                      >
                        {plan.name}
                      </Typography>

                      {plan.description && (
                        <ul style={{ margin: 0, paddingLeft: "18px", marginBottom: "12px" }}>
                          {plan.description.split("\n").filter(Boolean).map((line, i) => (
                            <li key={i} style={{ fontSize: "0.8rem", color: "#666", marginBottom: "4px", lineHeight: 1.5 }}>
                              {line.trim()}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Price */}
                      <Typography
                        variant="h4"
                        fontWeight={900}
                        color="#003366"
                        sx={{ mb: 2 }}
                      >
                        ₹{plan.price?.toLocaleString("en-IN")}
                      </Typography>

                      {/* Features */}
                      {plan.features?.length > 0 && (
                        <Box sx={{ textAlign: "left", mb: 2 }}>
                          {plan.features.slice(0, 4).map((feature, i) => (
                            <Box key={i} className="flex items-center gap-1 mb-1">
                              <CheckCircleIcon sx={{ fontSize: 16, color: colors.badge }} />
                              <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                                {feature}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Buy Button — goes to detail page */}
                      <Button
                        variant="contained"
                        fullWidth
                        component={Link}
                        to={`/membership-plans/${plan.name?.toLowerCase().replace(/\s+/g, "-")}`}
                        state={{ planId: plan._id }}
                        startIcon={<ShoppingCartIcon />}
                        sx={{
                          bgcolor: "#006694",
                          borderRadius: 5,
                          py: 1.2,
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          textDecoration: "none",
                          "&:hover": { bgcolor: "#005580" },
                        }}
                      >
                        BUY NOW
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Buy Dialog */}
      <Dialog
        open={!!buyDialog}
        onClose={() => !isProcessing && setBuyDialog(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#003366" }}>
          Purchase {buyDialog?.name}
          <Typography variant="body2" color="text.secondary">
            ₹{buyDialog?.price?.toLocaleString("en-IN")} — {buyDialog?.tier} plan
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Full Name *"
              value={buyForm.name}
              onChange={(e) => setBuyForm((p) => ({ ...p, name: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Phone Number *"
              value={buyForm.phone}
              onChange={(e) => setBuyForm((p) => ({ ...p, phone: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Email *"
              type="email"
              value={buyForm.email}
              onChange={(e) => setBuyForm((p) => ({ ...p, email: e.target.value }))}
              helperText="Login credentials will be sent to this email"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setBuyDialog(null)} disabled={isProcessing} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePurchase}
            disabled={isProcessing}
            sx={{ bgcolor: "#006694", borderRadius: 5, px: 4, "&:hover": { bgcolor: "#005580" } }}
            startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : <ShoppingCartIcon />}
          >
            {isProcessing ? "Processing..." : `Pay ₹${buyDialog?.price?.toLocaleString("en-IN")}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
    </>
  );
};

export default PlansPage;
