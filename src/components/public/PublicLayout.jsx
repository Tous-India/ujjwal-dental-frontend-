/**
 * Public Layout
 *
 * Wraps public pages with header and footer.
 */
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

const PublicLayout = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: "'Poppins', sans-serif !important" }} className="public-layout">
      <PublicHeader />
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <PublicFooter />
    </Box>
  );
};

export default PublicLayout;
