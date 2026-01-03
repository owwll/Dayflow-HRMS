import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Landing from "./pages/Landing";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import VerifyOTP from "./pages/auth/VerifyOTP";
import EmailVerification from "./pages/auth/EmailVerification";
import EmployeeDashboard from "./pages/dashboard/EmployeeDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import NotFound from "./pages/NotFound";

// Employee Pages
import EmployeeProfile from "./pages/employee/Profile";
import EmployeeAttendance from "./pages/employee/Attendance";
import EmployeeLeaveRequests from "./pages/employee/LeaveRequests";
import EmployeePayroll from "./pages/employee/Payroll";

// Admin Pages
import Employees from "./pages/admin/Employees";
import AddEmployee from "./pages/admin/AddEmployee";
import Attendance from "./pages/admin/Attendance";
import LeaveManagement from "./pages/admin/LeaveManagement";
import Payroll from "./pages/admin/Payroll";
import Reports from "./pages/admin/Reports";
import Notifications from "./pages/admin/Notifications";
import Settings from "./pages/admin/Settings";

// Components
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Role } from "@/types";

const queryClient = new QueryClient();

// Redirect authenticated users away from auth pages
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated && user) {
    return <Navigate to={user.role === Role.ADMIN ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />

      {/* Auth Routes - redirect to dashboard if already logged in */}
      <Route path="/signin" element={
        <AuthRedirect>
          <SignIn />
        </AuthRedirect>
      } />
      <Route path="/signup" element={
        <AuthRedirect>
          <SignUp />
        </AuthRedirect>
      } />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/verify-email" element={<EmailVerification />} />

      {/* Employee Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <EmployeeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <EmployeeProfile />
        </ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute>
          <EmployeeAttendance />
        </ProtectedRoute>
      } />
      <Route path="/leave" element={
        <ProtectedRoute>
          <EmployeeLeaveRequests />
        </ProtectedRoute>
      } />
      <Route path="/payroll" element={
        <ProtectedRoute>
          <EmployeePayroll />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/employees" element={
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <Employees />
        </ProtectedRoute>
      } />
      <Route path="/admin/employees/new" element={
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <AddEmployee />
        </ProtectedRoute>
      } />
      <Route path="/admin/attendance" element={
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <Attendance />
        </ProtectedRoute>
      } />
      <Route path="/admin/leave" element={
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <LeaveManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/payroll" element={
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <Payroll />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <Notifications />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={[Role.ADMIN]}>
          <Settings />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
