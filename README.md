# Ujjwal Dental CMS - Frontend

A modern dental clinic management system built with React, MUI, and TailwindCSS.

## Tech Stack

- **React 19.2** - UI Library
- **Vite 7.2** - Build Tool
- **MUI v7.3** - Component Library (new Grid syntax with `size` prop)
- **TailwindCSS v4.1** - Utility-first CSS
- **React Query (TanStack) v5.90** - Server state management
- **Zustand v5.0** - Client state management
- **React Router v7.13** - Routing
- **Axios 1.13** - HTTP client
- **Day.js** - Date handling

## Project Structure

```
frontend/src/
├── api/                    # API layer
│   ├── axios.js           # Axios instance configuration
│   ├── auth.api.js        # Authentication API (OTP, login)
│   ├── patient/           # Patient API functions (6 modules)
│   │   ├── appointments.api.js
│   │   ├── memberships.api.js
│   │   ├── patients.api.js
│   │   ├── payments.api.js
│   │   ├── reports.api.js
│   │   └── treatments.api.js
│   └── admin/             # Admin API functions (16 modules)
│       ├── patients.api.js
│       ├── appointments.api.js
│       ├── treatments.api.js
│       ├── tests.api.js
│       ├── clinics.api.js
│       ├── memberships.api.js
│       ├── payments.api.js
│       ├── billing.api.js
│       ├── reports.api.js
│       ├── notifications.api.js
│       ├── enquiries.api.js
│       ├── users.api.js
│       ├── settings.api.js
│       └── dashboard.api.js
│
├── hooks/                  # React Query hooks
│   ├── patient/            # 6 patient hooks
│   │   ├── useMyAppointments.js
│   │   ├── useMyPayments.js
│   │   ├── useMyReports.js
│   │   ├── useMyTreatments.js
│   │   ├── useMemberships.js
│   │   └── usePatients.js
│   └── admin/              # 16 admin hooks
│       ├── useAdminAuth.js
│       ├── usePatients.js
│       ├── useAppointments.js
│       ├── useTreatments.js
│       ├── useTests.js
│       ├── useClinics.js
│       ├── useMemberships.js
│       ├── usePayments.js
│       ├── useBilling.js
│       ├── useReports.js
│       ├── useNotifications.js
│       ├── useEnquiries.js
│       ├── useUsers.js
│       ├── useSettings.js
│       └── useDashboard.js
│
├── components/
│   ├── common/            # Shared components
│   │   ├── DataTable.jsx  # Reusable data table with search, filter, pagination
│   │   └── DeleteConfirmModal.jsx  # Soft delete confirmation
│   │
│   ├── admin/
│   │   ├── AdminHeader.jsx    # Header with notification dropdown
│   │   ├── AdminSidebar.jsx   # Navigation sidebar
│   │   └── modals/        # Admin modal components (28+)
│           ├── PatientDetailModal.jsx
│           ├── AddPatientModal.jsx
│           ├── EditPatientModal.jsx
│           ├── AppointmentDetailModal.jsx
│           ├── AddAppointmentModal.jsx
│           ├── EditAppointmentModal.jsx
│           ├── CancelAppointmentModal.jsx
│           ├── TreatmentDetailModal.jsx
│           ├── AddTreatmentModal.jsx
│           ├── EditTreatmentModal.jsx
│           ├── TestDetailModal.jsx
│           ├── AddTestModal.jsx
│           ├── EditTestModal.jsx
│           ├── ClinicDetailModal.jsx
│           ├── AddClinicModal.jsx
│           ├── EditClinicModal.jsx
│           ├── MembershipDetailModal.jsx
│           ├── AddMembershipModal.jsx
│           ├── EditMembershipModal.jsx
│           ├── AddPaymentModal.jsx
│           ├── PaymentDetailModal.jsx
│           ├── RecordPaymentModal.jsx
│           ├── AddReportModal.jsx
│           ├── EditReportModal.jsx
│           ├── CreateInvoiceModal.jsx     # Invoice with line items
│           ├── InvoiceDetailModal.jsx     # Invoice actions
│           ├── SendNotificationModal.jsx  # Send/bulk notifications
│           ├── AddUserModal.jsx           # Create staff
│           ├── UserDetailModal.jsx        # Edit/deactivate staff
│           └── EnquiryDetailModal.jsx     # Lead detail + actions
│
├── pages/
│   ├── auth/              # Authentication pages
│   │   ├── Login.jsx      # Email OTP login (patient) / Email+Password (admin)
│   │   └── VerifyOtp.jsx  # OTP verification page
│   │
│   ├── admin/             # Admin pages (16 total)
│   │   ├── Dashboard.jsx
│   │   ├── Patients.jsx
│   │   ├── Enquiries.jsx      # Lead management
│   │   ├── Appointments.jsx
│   │   ├── Treatments.jsx
│   │   ├── Tests.jsx
│   │   ├── Payments.jsx
│   │   ├── Billing.jsx        # Invoice management
│   │   ├── Reports.jsx
│   │   ├── Memberships.jsx
│   │   ├── Notifications.jsx  # Notification center
│   │   ├── Clinics.jsx
│   │   ├── User.jsx           # Staff management
│   │   ├── Settings.jsx
│   │   └── Login.jsx
│   │
│   └── patient/           # Patient portal pages (9 total)
│       ├── Dashboard.jsx      # Stats from all modules
│       ├── Appointments.jsx   # Upcoming/Past/All tabs
│       ├── BookAppointment.jsx # 4-step booking wizard
│       ├── Payments.jsx       # Payment history + summary
│       ├── Treatments.jsx     # Treatment list + progress
│       ├── Reports.jsx        # Medical reports + download
│       ├── Profile.jsx        # Edit profile with API save
│       ├── Membership.jsx     # Current membership status
│       └── MembershipPlans.jsx # Browse + purchase plans
│
├── store/                 # Zustand stores
│   ├── auth.store.js      # Authentication state (admin/patient, pendingEmail)
│   └── admin.store.js     # Admin-specific state
│
└── App.jsx               # Routes configuration
```

## Admin Dashboard Features

### Notification System
- Real-time notification center with database sync
- Notification bell icon in admin header showing unread count
- Clickable dropdown showing recent notifications
- Auto-refresh every 60 seconds for new notifications
- Mark individual notifications as read
- "Mark all as read" functionality
- Notification types with custom icons:
  - Appointments (blue)
  - Payments (green)
  - Treatments (purple)
  - Tests (purple)
  - Memberships (orange)
  - General notifications (gray)
- Priority indicators (high/urgent) with colored chips
- Time ago formatting (e.g., "2h ago", "Just now")
- Loading states with skeleton placeholders
- Empty state when no notifications

### Patients Management
- View all patients with search and filters
- Click row to view patient details in modal
- **Enhanced Patient Detail Modal** with 5 tabs:
  - **Overview**: Personal info, medical info, membership, emergency contact
  - **Appointments**: View all appointments with edit button on each row
  - **Treatments**: Treatment history with status and costs
  - **Payments**: Payment summary + history with "Record Payment" button
  - **Reports**: Medical reports list
- Add new patient via modal
- Edit patient information
- Soft delete (deactivate) patients

### Appointments Management
- View all appointments with search and filters
- Filter by status (scheduled, confirmed, completed, cancelled)
- Filter by type (regular, emergency, follow-up)
- Add new appointment with patient search (Autocomplete)
- Edit appointment details (clinic shown as read-only)
- Cancel appointment with reason

### Treatment Master
- View all treatment types
- Filter by category and status
- Add new treatment type with pricing
- Edit treatment details
- Soft delete (deactivate) treatments

### Test Master
- View all diagnostic test types
- Filter by category, type (in-house/external), status
- Add new test type
- Edit test details
- Soft delete (deactivate) tests

### Clinics Management
- View all clinic locations
- Add new clinic with:
  - Name, phone number
  - Full address (street, area, city, state, pincode)
  - Active status
- Edit clinic information
- Soft delete (deactivate) clinics

### Membership Plans Management
- View all membership plans with filters (type, tier, status)
- Plan types: Individual, Family
- Plan tiers: Silver, Gold, Platinum
- Add new plan with:
  - Name, code, type, tier
  - Price, duration (months)
  - Discount percentage
  - Max members (for family plans)
  - Features list (dynamic add/remove)
  - Display order
- Edit plan details
- Soft delete (deactivate) plans

### Payments Management
- View payment history
- Record new payment from Patient Detail Modal:
  - Payment modes: Cash, UPI, Card, Bank Transfer
  - Payment types: OPD Fee, Consultation, Treatment, Test, Membership, Other
  - Reference/transaction number (for non-cash)
  - Notes

### Reports Management
- View all medical reports with search and filters
- Upload new report with file (PDF, images):
  - Patient selection (Autocomplete search)
  - Clinic selection
  - Report title and category (X-Ray, OPG, CBCT, Lab Report, Prescription, etc.)
  - Description and notes
  - Report date
  - Visibility toggle (show/hide from patient)
  - Tags support
  - File upload to Cloudinary (max 10MB)
- Edit report metadata:
  - Update title, description, notes
  - Change visibility to patient
  - Replace uploaded file (auto-deletes old file from Cloudinary)
- Download reports with proper PDF handling
- Delete reports (hard delete - removes from both Cloudinary and database)
- Auto-generated report numbers (REP-XXXXXX)

### Settings Page
Comprehensive admin settings with four tabs:

#### Profile Settings
- Personal information (name, email, phone)
- Profile picture upload
- Password change functionality
- Account preferences

#### Clinic Settings
- Clinic name and contact information
- Full address details
- Working hours configuration
- Operating days selection

#### Notification Preferences
- Email notifications toggle:
  - Appointment reminders
  - Payment confirmations
  - System alerts
- SMS notifications toggle:
  - Appointment reminders
  - Payment confirmations
  - System alerts

#### System Configuration
- Timezone selection
- Currency format (INR, USD, etc.)
- Language preference
- Date format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- Time format (12-hour, 24-hour)
- Data backup settings

## Patient Portal Features

### Email OTP Authentication
- Passwordless login using email OTP
- Enter email address to request OTP
- Receive 6-digit OTP via email
- Verify OTP to access patient portal
- OTP expires after 10 minutes
- Resend OTP functionality
- Protected routes - all patient pages require authentication
- Auto-redirect to login if not authenticated

### My Reports
- View all medical reports uploaded by admin
- Filter by category (X-Ray, OPG, CBCT, Lab Report, Prescription, etc.)
- Download reports as PDFs
- View report details (title, date, description, notes)
- Only visible reports are shown (controlled by admin)

## MUI Grid v7 Syntax

All components use the new MUI Grid v7 syntax:

```jsx
import Grid from "@mui/material/Grid";

<Grid container spacing={3}>
  <Grid size={{ xs: 12, md: 6 }}>
    {/* Content */}
  </Grid>
</Grid>
```

## TailwindCSS v4 Notes

Using Tailwind v4 syntax:
- Gradients: `bg-linear-to-r` (not `bg-gradient-to-r`)

## API Response Format

All API responses follow this structure:

```javascript
{
  success: true,
  message: "...",
  data: [...],           // Array of items
  pagination: {          // For paginated endpoints
    total: 100,
    page: 1,
    limit: 10,
    pages: 10
  }
}
```

## Data Extraction Pattern

```javascript
// In page components
const { data, isLoading, refetch } = usePatients({ page, limit, search });

// Extract data from response
const patients = data?.data || [];
const pagination = data?.pagination || { total: 0 };
```

## File Upload & Cloudinary Integration

### Medical Reports Upload
- Files are uploaded to Cloudinary for reliable storage
- Supported formats: PDF, JPEG, PNG, GIF, WebP
- Maximum file size: 10MB
- PDFs are uploaded as `resource_type: "image"` to enable download functionality
- Automatic thumbnail generation for image files (200x200)

### Download Mechanism
- Uses Cloudinary's `fl_attachment` flag to force browser downloads
- Prevents corrupted PDF downloads by proper resource type configuration
- Downloads preserve original filenames

### File Operations
- **Upload**: File → Multer (memory storage) → Cloudinary → MongoDB reference
- **Replace**: Delete old file from Cloudinary → Upload new → Update MongoDB
- **Delete**: Hard delete removes file from both Cloudinary and MongoDB database

## 📝 Recent Updates

### Notification System (Latest)
- ✅ Real-time notification center in admin header
- ✅ Unread count badge with auto-refresh (every 60s)
- ✅ Interactive notification dropdown
- ✅ Mark as read/unread functionality
- ✅ Multiple notification types with custom icons
- ✅ Priority indicators (high/urgent)
- ✅ React Query integration for efficient caching
- ✅ Loading states and empty states

### Email OTP Authentication
- ✅ Passwordless patient login via email OTP
- ✅ OTP request and verification UI
- ✅ Resend OTP functionality
- ✅ Protected routes for patient pages
- ✅ Auto-redirect on authentication failure
- ✅ Clean login/verification flow

### UI/UX Improvements
- ✅ Fixed patient table immediate refresh after add/edit
- ✅ Fixed search field autofill issue with `autoComplete="off"`
- ✅ Improved React Query cache invalidation
- ✅ Better loading states with skeleton placeholders
- ✅ Enhanced error handling and user feedback

### Payment Management
- ✅ Date range filtering for payments
- ✅ Payment statistics and reports
- ✅ Better payment modals with validation

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## Color Scheme

| Module | Primary Color |
|--------|---------------|
| Patients | Blue (`blue-600`) |
| Enquiries | Teal (`teal-600`) |
| Appointments | Indigo (`indigo-600`) |
| Treatments | Teal (`teal-600`) |
| Tests | Purple (`purple-600`) |
| Payments | Green (`green-600`) |
| Billing | Indigo (`indigo-600`) |
| Reports | Teal (`teal-600`) |
| Memberships | Purple (`purple-600`) |
| Notifications | Blue (`blue-600`) |
| Clinics | Blue (`blue-600`) |
| Staff | Purple (`purple-600`) |
| Settings | Gray (`gray-600`) |

## Modal Pattern

All admin modals follow this pattern:

1. **Detail Modal** - View item details, with Edit/Delete buttons
2. **Add Modal** - Form to create new item
3. **Edit Modal** - Form pre-filled with existing data
4. **Delete Modal** - Soft delete confirmation (reusable component)

```jsx
// Usage in page
<DetailModal
  open={detailModalOpen}
  onClose={() => setDetailModalOpen(false)}
  item={selectedItem}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## React Query Hooks Pattern

### Standard CRUD Hooks

```javascript
// Hook file (e.g., useClinics.js)
export const useClinics = (params = {}) => {
  return useQuery({
    queryKey: ["admin", "clinics", params],
    queryFn: () => getClinics(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useClinicMutations = () => {
  const queryClient = useQueryClient();

  const createClinic = useMutation({
    mutationFn: createClinicApi,
    onSuccess: () => queryClient.invalidateQueries(["admin", "clinics"]),
  });

  return {
    createClinic: createClinic.mutate,
    isCreating: createClinic.isPending,
    // ... other mutations
  };
};
```

### Notification Hooks (Real-time Updates)

```javascript
// useNotifications.js
export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["admin", "notifications", "unread-count"],
    queryFn: getUnreadCount,
    staleTime: 30 * 1000,        // 30 seconds
    refetchInterval: 60 * 1000,  // Auto-refresh every 60 seconds
  });
};

export const useNotificationMutations = () => {
  const queryClient = useQueryClient();

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
  };

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => invalidateNotifications(),
  });

  return {
    markAsRead: markReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending,
  };
};
```
