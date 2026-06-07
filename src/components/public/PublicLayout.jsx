/**
 * Public Layout
 *
 * Wraps public pages with header and footer.
 */
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import MobileBottomBar from "./MobileBottomBar";

const PublicLayout = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif !important",
        // Reserve space for the fixed mobile/tablet bottom bar so the footer
        // and last section aren't hidden behind it (removed on desktop).
        pb: { xs: "calc(56px + env(safe-area-inset-bottom))", lg: 0 },
      }}
      className="public-layout"
    >
      <PublicHeader />
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <PublicFooter />
      <MobileBottomBar />
    </Box>
  );
};

export default PublicLayout;
