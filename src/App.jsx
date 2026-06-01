import {
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";
import UserLayout from "./components/UserLayout";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

// Patient Auth pages
const Login = lazy(() => import("./pages/auth/Login"));
const VerifyOtp = lazy(() => import("./pages/auth/VerifyOtp"));

// Patient pages
const Dashboard = lazy(() => import("./pages/patient/Dashboard"));
const Appointments = lazy(() => import("./pages/patient/Appointments"));
const AppointmentDetail = lazy(() => import("./pages/patient/AppointmentDetail"));
const Payments = lazy(() => import("./pages/patient/Payments"));
const Reports = lazy(() => import("./pages/patient/Reports"));
const Treatments = lazy(() => import("./pages/patient/Treatments"));
const Membership = lazy(() => import("./pages/patient/Membership"));
const Profile = lazy(() => import("./pages/patient/Profile"));
const PatientNotifications = lazy(() => import("./pages/patient/Notifications"));
const BookAppointment = lazy(() => import("./pages/patient/BookAppointment"));

// Public standalone pages
// const MembershipPlans = lazy(() => import("./pages/patient/MembershipPlans"));

// Public pages
const PublicLayout = lazy(() => import("./components/public/PublicLayout"));
const HomePage = lazy(() => import("./pages/public/HomePage"));
const ContactPage = lazy(() => import("./pages/public/ContactPage"));
const TreatmentsPage = lazy(() => import("./pages/public/TreatmentsPage"));
const TreatmentPage = lazy(() => import("./pages/public/TreatmentPage"));
const DentalImplantPage = lazy(() => import("./pages/public/treatments/DentalImplantPage"));
const RootCanalPage = lazy(() => import("./pages/public/treatments/RootCanalPage"));
const WisdomTeethPage = lazy(() => import("./pages/public/treatments/WisdomTeethPage"));
const ClearAlignersPage = lazy(() => import("./pages/public/treatments/ClearAlignersPage"));
const CosmeticDentalBondingPage = lazy(() => import("./pages/public/treatments/CosmeticDentalBondingPage"));
const LaserDentistryPage = lazy(() => import("./pages/public/treatments/LaserDentistryPage"));
const KidsDentistryPage = lazy(() => import("./pages/public/treatments/KidsDentistryPage"));
const DentalCrownsAndBridgesPage = lazy(() => import("./pages/public/treatments/DentalCrownsAndBridgesPage"));
const GumDiseaseTreatmentPage = lazy(() => import("./pages/public/treatments/GumDiseaseTreatmentPage"));
const DentalFillingPage = lazy(() => import("./pages/public/treatments/DentalFillingPage"));
const DenturesPage = lazy(() => import("./pages/public/treatments/DenturesPage"));
const TeethWhiteningPage = lazy(() => import("./pages/public/treatments/TeethWhiteningPage"));
const MouthUlcersPage = lazy(() => import("./pages/public/treatments/MouthUlcersPage"));
const BracesPage = lazy(() => import("./pages/public/treatments/BracesPage"));
const SmileMakeoverPage = lazy(() => import("./pages/public/treatments/SmileMakeoverPage"));
const PlansPage = lazy(() => import("./pages/public/PlansPage"));
const PlanDetailPage = lazy(() => import("./pages/public/PlanDetailPage"));
const BookAppointmentPage = lazy(() => import("./pages/public/BookAppointmentPage"));
const DoctorProfilePage = lazy(() => import("./pages/public/DoctorProfilePage"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminPatients = lazy(() => import("./pages/admin/Patients"));
const AdminAppointments = lazy(() => import("./pages/admin/Appointments"));
const AdminTreatments = lazy(() => import("./pages/admin/Treatments"));
const AdminTests = lazy(() => import("./pages/admin/Tests"));
const AdminPayments = lazy(() => import("./pages/admin/Payments"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminMemberships = lazy(() => import("./pages/admin/Memberships"));
const AdminCoupons = lazy(() => import("./pages/admin/Coupons"));
const AdminClinics = lazy(() => import("./pages/admin/Clinics"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminBilling = lazy(() => import("./pages/admin/Billing"));
const AdminNotifications = lazy(() => import("./pages/admin/Notifications"));
const AdminUsers = lazy(() => import("./pages/admin/User"));
const AdminEnquiries = lazy(() => import("./pages/admin/Enquiries"));

/**
 * App Routes
 *
 * Public standalone pages:
 * - /login - Patient phone number input
 * - /verify-otp - OTP verification
 * - /book-appointment - Book appointment (no login required)
 *
 * Patient Protected routes (require authentication):
 * - /dashboard - Patient dashboard (default)
 * - /appointments - View appointments
 * - /payments - Payment history
 * - /reports - Medical reports
 * - /treatments - Treatment history
 * - /membership - Patient's membership status
 * - /membership-plans - Buy membership plans (requires login for Razorpay payment)
 * - /profile - View/edit profile
 *
 * Admin Public routes:
 * - /admin/login - Admin email/password login
 *
 * Admin Protected routes (require admin authentication):
 * - /admin/dashboard - Admin dashboard
 * - /admin/patients - Manage patients
 * - /admin/appointments - Manage appointments
 * - /admin/treatments - Manage treatments
 * - /admin/tests - Manage tests
 * - /admin/payments - View payments
 * - /admin/reports - View reports
 * - /admin/memberships - Manage memberships
 * - /admin/clinics - Manage clinics
 * - /admin/settings - Admin settings
 */
const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* ======================== */}
        {/* PUBLIC WEBSITE ROUTES */}
        {/* ======================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" index element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/treatments" element={<TreatmentsPage />} />
          <Route path="/treatments/dental-implant" element={<DentalImplantPage />} />
          <Route path="/treatments/root-canal-treatment-rct" element={<RootCanalPage />} />
          <Route path="/treatments/wisdom-teeth" element={<WisdomTeethPage />} />
          <Route path="/treatments/clear-aligners" element={<ClearAlignersPage />} />
          <Route path="/treatments/cosmatic-dental-bonding" element={<CosmeticDentalBondingPage />} />
          <Route path="/treatments/laser-dentistry" element={<LaserDentistryPage />} />
          <Route path="/treatments/kids-dentistry" element={<KidsDentistryPage />} />
          <Route path="/treatments/dental-crowns-and-bridges" element={<DentalCrownsAndBridgesPage />} />
          <Route path="/treatments/gum-disease-treatment" element={<GumDiseaseTreatmentPage />} />
          <Route path="/treatments/dental-filling" element={<DentalFillingPage />} />
          <Route path="/treatments/dentures" element={<DenturesPage />} />
          <Route path="/treatments/teeth-whitening" element={<TeethWhiteningPage />} />
          <Route path="/treatments/mouth-ulcers" element={<MouthUlcersPage />} />
          <Route path="/treatments/braces" element={<BracesPage />} />
          <Route path="/treatments/smile-makeover" element={<SmileMakeoverPage />} />
          <Route path="/treatments/:slug" element={<TreatmentPage />} />
          <Route path="/book-appointment" element={<BookAppointmentPage />} />
          <Route path="/membership-plans" element={<PlansPage />} />
          <Route path="/membership-plans/:id" element={<PlanDetailPage />} />
          <Route path="/doctors/:slug" element={<DoctorProfilePage />} />
        </Route>

        {/* ======================== */}
        {/* PATIENT ROUTES */}
        {/* ======================== */}

        {/* Patient Auth routes (standalone pages) */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Patient Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>

            {/* Patient pages */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/:id" element={<AppointmentDetail />} />
            <Route path="payments" element={<Payments />} />
            <Route path="reports" element={<Reports />} />
            <Route path="treatments" element={<Treatments />} />
            <Route path="membership" element={<Membership />} />
            {/* <Route path="membership-plans" element={<MembershipPlans />} /> */}
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<PatientNotifications />} />
          </Route>
        </Route>

        {/* ======================== */}
        {/* ADMIN ROUTES */}
        {/* ======================== */}

        {/* Admin Public route - Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Protected routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Redirect /admin to /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />

            {/* Admin pages */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="treatments" element={<AdminTreatments />} />
            <Route path="tests" element={<AdminTests />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="billing" element={<AdminBilling />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="memberships" element={<AdminMemberships />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="clinics" element={<AdminClinics />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </>
    )
  );

  return (
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
        ariaLabel="Notifications"
      />
    </Suspense>
  );
};

export default App;
