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
