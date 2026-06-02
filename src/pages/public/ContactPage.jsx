/**
 * Public Contact Us Page
 */
import { useState } from "react";
import { Box, Typography, TextField, Button, Container, Card, CardContent, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";
import api from "../../api/axios";
import BreadcrumbBanner from "../../components/public/BreadcrumbBanner";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      toast.info("Please enter your name and phone number");
      return;
    }

    setSending(true);
    try {
      await api.post("/enquiries", {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        treatmentName: form.subject || "Contact Form",
        message: form.message,
        source: { page: "/contact", referrer: "Contact Page" },
      });

      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <title>Contact Ujjwal Dental Clinic Sonipat | Book Appointment</title>
      <meta
        name="description"
        content="Visit Ujjwal Dental at Delhi Road or Parsavnath City Center, Sonipat. Call +91 8708362763. Open Mon-Sat 9AM-8PM."
      />
      <meta
        property="og:title"
        content="Contact Ujjwal Dental Clinic Sonipat | Book Appointment"
      />
      <meta
        property="og:description"
        content="Visit Ujjwal Dental at Delhi Road or Parsavnath City Center, Sonipat. Call +91 8708362763. Open Mon-Sat 9AM-8PM."
      />
      <BreadcrumbBanner
        title="Contact Us"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Contact Us" }]}
      />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Contact Info Cards */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {[
                { icon: <PhoneIcon />, title: "Phone", text: "+91 8708362763", href: "tel:+918708362763" },
                { icon: <EmailIcon />, title: "Email", text: "ujjwaldentalplanet.in@gmail.com", href: "mailto:ujjwaldentalplanet.in@gmail.com" },
                { icon: <LocationOnIcon />, title: "Address", text: "Plot 35/13, Sikka Colony, Delhi Road, Sonipat, Haryana, India-131001" },
                { icon: <AccessTimeIcon />, title: "Hours", text: "Mon-Sat: 9AM-8PM | Sun: By Appointment" },
              ].map((item, i) => (
                <Card key={i} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: "#e8f4fd", display: "flex", alignItems: "center", justifyContent: "center", color: "#006694" }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">{item.title}</Typography>
                      {item.href ? (
                        <a href={item.href} style={{ color: "#003366", textDecoration: "none", fontWeight: 600 }}>{item.text}</a>
                      ) : (
                        <Typography variant="body2" fontWeight={600} color="#003366">{item.text}</Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Grid>

          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} color="#003366" gutterBottom>
                  Send us a Message
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Have a question or want to schedule an appointment? Fill out the form below.
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Your Name" required size="small" value={form.name} onChange={handleChange("name")} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Phone Number" required size="small" value={form.phone} onChange={handleChange("phone")} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth label="Email Address" type="email" size="small" value={form.email} onChange={handleChange("email")} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth label="Subject" size="small" value={form.subject} onChange={handleChange("subject")} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField fullWidth label="Your Message" multiline rows={4} size="small" value={form.message} onChange={handleChange("message")} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={sending}
                        startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                        sx={{ bgcolor: "#006694", borderRadius: 5, px: 5, "&:hover": { bgcolor: "#005580" } }}
                      >
                        {sending ? "Sending..." : "Send Message"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ContactPage;
