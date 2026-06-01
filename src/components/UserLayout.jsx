import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import PatientHeader from "./PatientHeader";
import PatientSidebar, { DRAWER_WIDTH } from "./PatientSidebar";

/**
 * User Layout Component
 *
 * Main layout wrapper for patient portal pages.
 * Includes:
 * - Fixed header at top
 * - Sidebar navigation (permanent on desktop, drawer on mobile)
 * - Main content area with Outlet for nested routes
 */
const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Header */}
      <PatientHeader onMenuToggle={handleMenuToggle} />

      {/* Sidebar */}
      <PatientSidebar open={sidebarOpen} onClose={handleSidebarClose} />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          // ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar /> {/* Spacer for fixed header */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;
