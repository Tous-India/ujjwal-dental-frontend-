import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useCouponMutations } from "../../hooks/admin/useCoupons";
import { toast } from "react-toastify";

const CouponVerifySection = () => {
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);
  const { verifyCouponAsync, isVerifying } = useCouponMutations();

  const handleVerify = async () => {
    if (!code.trim()) {
      toast.info("Please enter a coupon code");
      return;
    }

    setResult(null);
    try {
      const res = await verifyCouponAsync({ code: code.trim(), usageNotes: notes });
      setResult({ success: true, data: res.data });
      setCode("");
      setNotes("");
      toast.success("Coupon verified and redeemed!");
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || "Verification failed",
      });
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <QrCodeScannerIcon sx={{ color: "#006694" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1rem" }}>
            Verify Coupon Code
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the coupon code shown on the patient's dashboard to verify and redeem.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
          <TextField
            size="small"
            label="Coupon Code"
            placeholder="UJJ-IND-GLD-A3F7-01"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
            sx={{ minWidth: 250 }}
            slotProps={{ input: { style: { fontFamily: "monospace", fontWeight: 700, letterSpacing: 1 } } }}
          />
          <TextField
            size="small"
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={handleVerify}
            disabled={isVerifying}
            startIcon={isVerifying ? <CircularProgress size={16} /> : <VerifiedIcon />}
            sx={{ bgcolor: "#006694", "&:hover": { bgcolor: "#005580" } }}
          >
            {isVerifying ? "Verifying..." : "Verify & Redeem"}
          </Button>
        </Box>

        {result && (
          <Box sx={{ mt: 2 }}>
            {result.success ? (
              <Alert severity="success" sx={{ alignItems: "center" }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {result.data.message}
                  </Typography>
                  <Typography variant="body2">
                    Patient: <strong>{result.data.patient?.name}</strong> ({result.data.patient?.phone})
                  </Typography>
                  <Chip
                    label={`Coupon #${result.data.coupon?.couponNumber} of ${result.data.coupon?.totalCoupons}`}
                    size="small"
                    color="success"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Alert>
            ) : (
              <Alert severity="error">{result.message}</Alert>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CouponVerifySection;
