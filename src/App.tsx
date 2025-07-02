
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { useAuth } from "@/stores/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import SecurityAnalytics from "./pages/SecurityAnalytics";
import PerformanceMetrics from "./pages/PerformanceMetrics";
import UsageAnalytics from "./pages/UsageAnalytics";
import ModelInventory from "./pages/ModelInventory";
import ThreatIntelligence from "./pages/ThreatIntelligence";
import AuditLogs from "./pages/AuditLogs";
import ModelUpload from "./pages/ModelUpload";
import UserInvite from "./pages/UserInvite";
import GeneralSettings from "./pages/GeneralSettings";
import SystemDemo from "./pages/SystemDemo";
import LoadingDemo from "./pages/LoadingDemo";
import ProfileSettings from "./pages/ProfileSettings";
import OrganizationSettings from "./pages/OrganizationSettings";
import ApiKeyManagement from "./pages/ApiKeyManagement";
import SecuritySettings from "./pages/SecuritySettings";

const queryClient = new QueryClient();

const AppContent = () => {
  const { initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/access/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/access/roles"
            element={
              <ProtectedRoute requiredRole="admin">
                <RoleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics/security"
            element={
              <ProtectedRoute>
                <SecurityAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics/performance"
            element={
              <ProtectedRoute>
                <PerformanceMetrics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/analytics/usage"
            element={
              <ProtectedRoute>
                <UsageAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/models/inventory"
            element={
              <ProtectedRoute>
                <ModelInventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/threats/active"
            element={
              <ProtectedRoute>
                <ThreatIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/threats/intelligence"
            element={
              <ProtectedRoute>
                <ThreatIntelligence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/compliance/audit"
            element={
              <ProtectedRoute requiredRole="security_analyst">
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/models/upload"
            element={
              <ProtectedRoute>
                <ModelUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/access/users/invite"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserInvite />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings/general"
            element={
              <ProtectedRoute requiredRole="admin">
                <GeneralSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/system-demo"
            element={
              <ProtectedRoute>
                <SystemDemo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/loading-demo"
            element={
              <ProtectedRoute>
                <LoadingDemo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings/organization"
            element={
              <ProtectedRoute requiredRole="admin">
                <OrganizationSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings/api-keys"
            element={
              <ProtectedRoute>
                <ApiKeyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings/security"
            element={
              <ProtectedRoute>
                <SecuritySettings />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all route - redirect to dashboard if authenticated, otherwise to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
