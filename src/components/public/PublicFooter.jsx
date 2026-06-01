/**
 * Public Footer
 *
 * Footer with SVG wave, contact info, useful links, operating hours, and copyright.
 * Matches the Ujjwal Dental Planet website design.
 */
import { Box, Typography, Container, IconButton } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const WEBSITE = "https://ujjwaldentalplanet.com";

const usefulLinks = [
  { label: "About Us", href: `${WEBSITE}/about-us` },
  { label: "Our Team", href: `${WEBSITE}/our-team` },
  { label: "Career", href: `${WEBSITE}/carrer` },
  { label: "News & Media", href: `${WEBSITE}/news-media` },
  { label: "Achievements", href: `${WEBSITE}/success-story` },
  { label: "Patient Safety", href: `${WEBSITE}/patient-safety` },
  { label: "Terms & Condition", href: `${WEBSITE}/terms&condition` },
  { label: "Privacy Policy", href: `${WEBSITE}/privacy-policy` },
];

const operatingDays = [
  { day: "Monday", time: "09.00 am to 08.00 pm" },
  { day: "Tuesday", time: "09.00 am to 08.00 pm" },
  { day: "Wednesday", time: "09.00 am to 08.00 pm" },
  { day: "Thursday", time: "09.00 am to 08.00 pm" },
  { day: "Friday", time: "09.00 am to 08.00 pm" },
  { day: "Saturday", time: "09.00 am to 08.00 pm" },
  { day: "Sunday", time: "By Appointment" },
];

const socialLinks = [
  {
    icon: <FacebookIcon />,
    url: "https://www.facebook.com/ujjwaldentalimplant",
    label: "Facebook",
  },
  {
    icon: <TwitterIcon />,
    url: "https://x.com/ujjwaldental",
    label: "Twitter",
  },
  {
    icon: <InstagramIcon />,
    url: "https://www.instagram.com/ujjwaldentalimplant/",
    label: "Instagram",
  },
  {
    icon: <YouTubeIcon />,
    url: "https://www.youtube.com/@ujjwaldentalplanet",
    label: "YouTube",
  },
  {
    icon: <LinkedInIcon />,
    url: "https://www.linkedin.com/company/unavailable/",
    label: "LinkedIn",
  },
];

const PublicFooter = () => {
  return (
    <Box sx={{ position: "relative", mt: 0 }}>
      {/* SVG Wave */}

      {/* Footer Content */}
      <Box
        sx={{
          bgcolor: "#084a75",
          color: "#fff",
          pt: 5,
          pb: 2,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.02) 0%, transparent 40%)
          `,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Contact Info */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className="flex items-start gap-3 mb-4">
                <LocationOnIcon sx={{ fontSize: 24, color: "#fff", mt: 0.3 }} />
                <Typography
                  variant="body1"
                  sx={{ color: "#fff", lineHeight: 1.7 }}
                >
                  <strong>Address :</strong> Plot 35/13, Sikka Colony, Delhi
                  Road,
                  <br />
                  Sonipat, Haryana, India-131001
                </Typography>
              </Box>

              <Box className="flex items-center gap-3 mb-4">
                <PhoneIcon sx={{ fontSize: 24, color: "#fff" }} />
                <Typography variant="body1" sx={{ color: "#fff" }}>
                  <strong>Phone :</strong>{" "}
                  <a
                    href="tel:+918708362763"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    +91 8708362763
                  </a>
                </Typography>
              </Box>

              <Box className="flex items-center gap-3 mb-4">
                <EmailIcon sx={{ fontSize: 24, color: "#fff" }} />
                <Typography variant="body1" sx={{ color: "#fff" }}>
                  <strong>Email :</strong>{" "}
                  <a
                    href="mailto:ujjwaldentalplanet.in@gmail.com"
                    style={{ color: "#fff", textDecoration: "none" }}
                  >
                    ujjwaldentalplanet.in@gmail.com
                  </a>
                </Typography>
              </Box>

              {/* Social Icons */}
              <Box className="flex gap-2 mt-3">
                {socialLinks.map((social, i) => (
                  <IconButton
                    key={i}
                    href={social.url}
                    aria-label={social.label}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      width: 44,
                      height: 44,
                      "&:hover": { bgcolor: "#fff", color: "#084a75" },
                      transition: "all 0.3s",
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* Useful Links */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 3, fontSize: "1.3rem" }}
              >
                Useful Links
              </Typography>
              {usefulLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "rgba(255,255,255,0.85)",
                    textDecoration: "none",
                    marginBottom: 12,
                    fontSize: "0.95rem",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(255,255,255,0.85)")
                  }
                >
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  {link.label}
                </a>
              ))}
            </Grid>

            {/* Days / Operating Hours */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 3, fontSize: "1.3rem" }}
              >
                Days
              </Typography>
              {operatingDays.map((item) => (
                <Typography
                  key={item.day}
                  variant="body2"
                  sx={{
                    color:
                      item.day === "Sunday"
                        ? "#ffd700"
                        : "rgba(255,255,255,0.85)",
                    mb: 1.2,
                    fontSize: "0.95rem",
                  }}
                >
                  {item.day} - {item.time}
                </Typography>
              ))}
            </Grid>
          </Grid>

          {/* Copyright */}
          <Box
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.15)",
              mt: 5,
              pt: 2.5,
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}
            >
              &copy; Copyright {new Date().getFullYear()}. All Rights Reserved.
              Developed By{" "}
              <a
                href="https://griditsolutions.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#4db8d9", textDecoration: "none" }}
              >
                Grid IT Solutions
              </a>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicFooter;
