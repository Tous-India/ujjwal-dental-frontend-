/**
 * Public Book Appointment Page
 *
 * Wraps the existing BookAppointment component with public layout breadcrumb.
 */
import { lazy, Suspense } from "react";
import BreadcrumbBanner from "../../components/public/BreadcrumbBanner";
import { CircularProgress, Box } from "@mui/material";

const BookAppointment = lazy(() => import("../patient/BookAppointment"));

const BookAppointmentPage = () => {
  return (
    <>
      <title>Book Dental Appointment Online | Ujjwal Dental Clinic Sonipat</title>
      <meta
        name="description"
        content="Book your dental appointment online at Ujjwal Dental Clinic, Sonipat in minutes. Select your clinic, preferred date and time, and get instant confirmation."
      />
      <meta
        name="keywords"
        content="book dental appointment Sonipat, online dentist booking, Ujjwal Dental appointment"
      />
      <link rel="canonical" href="https://ujjwaldentalplanet.com/book-appointment" />
      <meta name="robots" content="index, follow" />
      <meta
        property="og:title"
        content="Book Dental Appointment Online | Ujjwal Dental Clinic Sonipat"
      />
      <meta
        property="og:description"
        content="Book your dental appointment online at Ujjwal Dental Clinic, Sonipat in minutes. Select your clinic, date and time, and get instant confirmation."
      />
      <meta property="og:url" content="https://ujjwaldentalplanet.com/book-appointment" />
      <meta
        property="og:image"
        content="https://ujjwaldentalplanet.com/ujjwal-dental-logo.png"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Book Dental Appointment Online | Ujjwal Dental Clinic Sonipat" />
      <meta
        name="twitter:description"
        content="Book your dental appointment online at Ujjwal Dental Clinic, Sonipat in minutes. Instant confirmation."
      />
      <meta
        name="twitter:image"
        content="https://ujjwaldentalplanet.com/ujjwal-dental-logo.png"
      />
      {/* showTitle omitted: the lazy-loaded BookAppointment component (patient
          portal, out of scope here) already renders its own h1 further down */}
      <BreadcrumbBanner
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Book Appointment" },
        ]}
      />
      <Suspense
        fallback={
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        }
      >
        <BookAppointment />
      </Suspense>
    </>
  );
};

export default BookAppointmentPage;
