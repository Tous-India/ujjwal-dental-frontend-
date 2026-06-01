import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UndoIcon from "@mui/icons-material/Undo";
import { usePatientCoupons, useCouponMutations } from "../../../hooks/admin/useCoupons";
import { toast } from "react-toastify";

const statusColors = {
  unused: "success",
  used: "default",
  locked: "warning",
};

const PatientCouponsModal = ({ open, onClose, patientId, patientName }) => {
  const { data, isLoading } = usePatientCoupons(patientId);
  const { undoCoupon, isUndoing } = useCouponMutations();
  const coupons = data?.data?.coupons || [];

  const handleUndo = (couponId) => {
    undoCoupon(couponId, {
      onSuccess: () => toast.success("Coupon usage reverted"),
      onError: (err) => toast.error(err.response?.data?.message || "Failed to undo"),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Coupons — {patientName || "Patient"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {coupons.filter((c) => c.status === "used").length} of {coupons.length} used
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : coupons.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            No coupons found for this patient.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {coupons.map((coupon) => (
              <Box
                key={coupon._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: coupon.status === "unused" ? "#006694" : "#e0e0e0",
                  bgcolor: coupon.status === "used" ? "#f5f5f5" : coupon.status === "unused" ? "#e8f4fd" : "#fafafa",
                  opacity: coupon.status === "locked" ? 0.6 : 1,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", fontFamily: "monospace" }}>
                      #{coupon.couponNumber} — {coupon.code}
                    </Typography>
                    <Chip label={coupon.status.toUpperCase()} size="small" color={statusColors[coupon.status]} sx={{ fontSize: "0.65rem", height: 20 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    ₹{coupon.flatDiscount} off + {coupon.surgeryDiscount}% surgery discount
                  </Typography>
                  {coupon.status === "used" && coupon.usedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Used on {new Date(coupon.usedAt).toLocaleDateString("en-IN")}
                      {coupon.usageNotes ? ` — ${coupon.usageNotes}` : ""}
                    </Typography>
                  )}
                </Box>

                {coupon.status === "used" && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={isUndoing ? <CircularProgress size={14} /> : <UndoIcon />}
                    onClick={() => handleUndo(coupon._id)}
                    disabled={isUndoing}
                    sx={{ fontSize: "0.7rem" }}
                  >
                    Undo
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PatientCouponsModal;
