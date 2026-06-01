import { Box, Typography, CircularProgress, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CouponCard from "./CouponCard";
import { useMyCoupons } from "../../hooks/patient/useCoupons";

const CouponGrid = () => {
  const { data, isLoading } = useMyCoupons();
  const coupons = data?.data?.coupons || [];

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (coupons.length === 0) return null;

  const usedCount = coupons.filter((c) => c.status === "used").length;
  const remaining = coupons.length - usedCount;

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CardGiftcardIcon sx={{ color: "#006694" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#003366", fontSize: "1rem" }}>
            Your Coupon Cards
          </Typography>
        </Box>
        <Chip
          label={`${remaining} of ${coupons.length} remaining`}
          color={remaining > 0 ? "success" : "default"}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <Grid container spacing={2}>
        {coupons.map((coupon) => (
          <Grid key={coupon._id} size={{ xs: 12, sm: 6, md: 4 }}>
            <CouponCard coupon={coupon} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CouponGrid;
