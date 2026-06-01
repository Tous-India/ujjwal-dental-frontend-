/**
 * Breadcrumb Banner
 *
 * Hero-style breadcrumb section with background image/gradient,
 * page title, and breadcrumb trail.
 */
import { Box, Typography, Container } from "@mui/material";
import { Link } from "react-router-dom";

const BreadcrumbBanner = ({
  backgroundImage,
}) => {
  return (
    <Box
      sx={{
        background: backgroundImage
          ? `linear-gradient(135deg, rgba(0,51,102,0.85), rgba(0,102,148,0.8)), url(${backgroundImage}) center/cover no-repeat`
          : "linear-gradient(135deg, #003366 0%, #006694 50%, #4db8d9 100%)",
        height: "10px",
      }}
    />
  );
};

export default BreadcrumbBanner;
