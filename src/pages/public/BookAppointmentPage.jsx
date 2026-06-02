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
        content="Book your dental appointment online at Ujjwal Dental Clinic, Sonipat. Select clinic, date & time. Instant confirmation."
      />
      <meta
        property="og:title"
        content="Book Dental Appointment Online | Ujjwal Dental Clinic Sonipat"
      />
      <meta
        property="og:description"
        content="Book your dental appointment online at Ujjwal Dental Clinic, Sonipat. Select clinic, date & time. Instant confirmation."
      />
      <BreadcrumbBanner
        title="Book Appointment"
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
