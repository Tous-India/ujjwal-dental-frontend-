/**
 * Admin Sidebar Component
 *
 * Navigation sidebar for admin panel.
 * Features:
 * - Responsive drawer (permanent on desktop, temporary on mobile)
 * - Navigation items with icons
 * - Active state highlighting
 *
 * Props:
 * - open: Boolean for mobile drawer state
 * - onClose: Function to close mobile drawer
 */
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import BiotechIcon from "@mui/icons-material/Biotech";
import PaymentIcon from "@mui/icons-material/Payment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import BusinessIcon from "@mui/icons-material/Business";
import SettingsIcon from "@mui/icons-material/Settings";
import LanguageIcon from "@mui/icons-material/Language";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import NotificationsIcon from "@mui/icons-material/Notifications";
import GroupIcon from "@mui/icons-material/Group";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";

import logo from "../../../public/ujjwal-dental-logo.png";

// Sidebar width
const DRAWER_WIDTH = 260;

/**
 * Navigation items configuration
 * Easy to add/remove menu items here
 */
const navItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: DashboardIcon },
  { label: "Patients", path: "/admin/patients", icon: PeopleIcon, badgeKey: "patients" },
  { label: "Enquiries", path: "/admin/enquiries", icon: ContactPhoneIcon, badgeKey: "enquiries", badgeColor: "#ef4444" },
  { label: "Appointments", path: "/admin/appointments", icon: EventIcon, badgeKey: "appointments", badgeColor: "#3b82f6" },
  { label: "Treatments", path: "/admin/treatments", icon: MedicalServicesIcon },
  { label: "Tests", path: "/admin/tests", icon: BiotechIcon },
  { label: "Payments", path: "/admin/payments", icon: PaymentIcon, badgeKey: "payments", badgeColor: "#f59e0b" },
  { label: "Billing", path: "/admin/billing", icon: ReceiptLongIcon },
  { label: "Reports", path: "/admin/reports", icon: AssessmentIcon },
  { label: "Memberships", path: "/admin/memberships", icon: CardMembershipIcon, badgeKey: "memberships", badgeColor: "#8b5cf6" },
  { label: "Coupons", path: "/admin/coupons", icon: CardGiftcardIcon },
  { label: "Notifications", path: "/admin/notifications", icon: NotificationsIcon, badgeKey: "notifications", badgeColor: "#ec4899" },
  { label: "Clinics", path: "/admin/clinics", icon: BusinessIcon },
  { label: "Staff", path: "/admin/users", icon: GroupIcon },
  { label: "Settings", path: "/admin/settings", icon: SettingsIcon },
  { label: "Main Website", path: "https://ujjwaldentalplanet.com", icon: LanguageIcon, external: true },
];

const AdminSidebar = ({ open, onClose }) => {
  const location = useLocation();

  // Fetch badge counts
  const { data: badgeCounts } = useQuery({
    queryKey: ["admin", "sidebar-badges"],
    queryFn: async () => {
      const [enquiries, notifications, appointments] = await Promise.allSettled([
        api.get("/enquiries/stats").then((r) => r.data),
        api.get("/notifications/unread-count").then((r) => r.data),
        api.get("/appointments/today").then((r) => r.data),
      ]);
      return {
        enquiries: enquiries.status === "fulfilled" ? (enquiries.value?.data?.stats?.byStatus?.new || 0) : 0,
        notifications: notifications.status === "fulfilled" ? (notifications.value?.data?.count || 0) : 0,
        appointments: appointments.status === "fulfilled" ? (appointments.value?.data?.length || 0) : 0,
      };
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const rawBadges = badgeCounts || {};

  // Track "seen" counts — when user visits a page, store the current count
  // Badge only shows when new count > last seen count
  const getSeenKey = (key) => `badge_seen_${key}`;

  // Save seen count when page is active
  React.useEffect(() => {
    navItems.forEach((item) => {
      if (item.badgeKey && location.pathname.startsWith(item.path) && rawBadges[item.badgeKey] !== undefined) {
        localStorage.setItem(getSeenKey(item.badgeKey), String(rawBadges[item.badgeKey]));
      }
    });
  }, [location.pathname, rawBadges]);

  // Calculate unseen badges
  const badges = {};
  Object.keys(rawBadges).forEach((key) => {
    const seen = parseInt(localStorage.getItem(getSeenKey(key)) || "0", 10);
    badges[key] = Math.max(0, rawBadges[key] - seen);
  });
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /**
   * Handle navigation item click
   */
  const handleNavClick = (path) => {
    navigate(path);
    // Close drawer on mobile after navigation
    if (isMobile) {
      onClose();
    }
  };

  /**
   * Check if path is active
   */
  const isActive = (path) => location.pathname === path;

  /**
   * Sidebar content (shared between permanent and temporary drawer)
   */
  const sidebarContent = (
    <>
      {/* Logo/Brand */}
      <Toolbar className="border-b border-gray-200">
        <Box className="flex items-center gap-2">
          <img src={logo} alt="Ujjwal Dental Clinic" width={70} />
          <Typography variant="p" className="font-bold text-[14px] text-gray-800">
            Ujjwal Dental Clinic
          </Typography>
        </Box>
      </Toolbar>

      {/* Navigation List */}
      <List className="px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <ListItem key={item.path} disablePadding className="mb-1">
              <ListItemButton
                onClick={() => {
                  if (item.external) {
                    window.open(item.path, "_blank");
                  } else {
                    handleNavClick(item.path);
                  }
                }}
                className={`
                  rounded-lg transition-all duration-200
                  ${
                    active
                      ? "bg-[#1976d2]! text-white! rounded!"
                      : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                <ListItemIcon
                  className={`min-w-[40px] ${active ? "text-white!" : "text-gray-500"}`}
                >
                  <Icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.95rem",
                    fontWeight: active ? 600 : 400,
                  }}
                />
                {item.badgeKey && badges[item.badgeKey] > 0 && !active && (
                  <Box
                    sx={{
                      bgcolor: active ? "rgba(255,255,255,0.3)" : (item.badgeColor || "#ef4444"),
                      color: "#fff",
                      borderRadius: "12px",
                      minWidth: 22,
                      height: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      px: 0.5,
                    }}
                  >
                    {badges[item.badgeKey]}
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom section */}
      <Box className="mt-auto p-4">
        <Divider className="mb-4" />
        <Typography variant="caption" className="text-gray-400">
          Dental Clinic CMS v1.0
        </Typography>
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }} // Better mobile performance
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #e5e7eb",
          },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
};

export { DRAWER_WIDTH };
export default AdminSidebar;
