import { Box, Typography, Chip } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const CouponCard = ({ coupon }) => {
  const isUsed = coupon.status === "used";
  const isActive = coupon.status === "unused";
  const isLocked = coupon.status === "locked";
  const isExpired = new Date() > new Date(coupon.membershipExpiry);

  return (
    <Box
      sx={{
        position: "relative",
        border: isActive ? "2px dashed #006694" : "2px dashed #ccc",
        borderRadius: 2,
        p: 2.5,
        background: isUsed
          ? "#f5f5f5"
          : isActive
            ? "linear-gradient(135deg, #e8f4fd 0%, #d0ecf9 100%)"
            : "#fafafa",
        opacity: isUsed ? 0.55 : isLocked ? 0.5 : 1,
        filter: isUsed ? "grayscale(100%)" : "none",
        transition: "all 0.3s",
        overflow: "hidden",
        minHeight: 170,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Used Stamp */}
      {isUsed && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-20deg)",
            border: "3px solid #999",
            borderRadius: 1,
            px: 2,
            py: 0.5,
            zIndex: 2,
          }}
        >
          <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, color: "#999", letterSpacing: 3 }}>
            USED
          </Typography>
        </Box>
      )}

      {/* Lock Overlay */}
      {isLocked && !isExpired && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          }}
        >
          <LockIcon sx={{ fontSize: 36, color: "#bbb" }} />
        </Box>
      )}

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: isActive ? "#003366" : "#999" }}>
          COUPON #{coupon.couponNumber} of {coupon.totalCoupons}
        </Typography>
        <Chip
          size="small"
          label={isUsed ? "Used" : isActive ? "Active" : isExpired ? "Expired" : "Locked"}
          color={isUsed ? "default" : isActive ? "success" : "default"}
          sx={{ fontSize: "0.65rem", height: 20 }}
        />
      </Box>

      {/* Discount Info */}
      <Box sx={{ textAlign: "center", my: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
          <LocalOfferIcon sx={{ fontSize: 18, color: isActive ? "#006694" : "#999" }} />
          <Typography className="font-numbers" sx={{ fontSize: "1.3rem", fontWeight: 800, color: isActive ? "#003366" : "#999" }}>
            ₹{coupon.flatDiscount} OFF
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: isActive ? "#006694" : "#aaa" }}>
          + {coupon.surgeryDiscount}% Off on Surgery
        </Typography>
      </Box>

      {/* Code + Expiry */}
      <Box>
        {isActive && (
          <Box sx={{ textAlign: "center", mb: 0.5, bgcolor: "#fff", borderRadius: 1, py: 0.5, border: "1px solid #e0e0e0" }}>
            <Typography sx={{ fontSize: "0.7rem", color: "#999" }}>Your Code</Typography>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#003366", letterSpacing: 1, fontFamily: "monospace" }}>
              {coupon.code}
            </Typography>
          </Box>
        )}
        <Typography sx={{ fontSize: "0.65rem", color: "#999", textAlign: "center", mt: 0.5 }}>
          {isUsed
            ? `Used on ${new Date(coupon.usedAt).toLocaleDateString("en-IN")}`
            : `Valid till ${new Date(coupon.membershipExpiry).toLocaleDateString("en-IN")}`}
        </Typography>
      </Box>

      {/* Conditions */}
      {coupon.conditions && isActive && (
        <Typography sx={{ fontSize: "0.6rem", color: "#888", textAlign: "center", mt: 0.5, fontStyle: "italic" }}>
          {coupon.conditions}
        </Typography>
      )}
    </Box>
  );
};

export default CouponCard;
