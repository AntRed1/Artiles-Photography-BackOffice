import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GalleryProvider } from "./context/GalleryContext";
import { AlertProvider } from "./components/common/AlertManager";
import { RealTimeProvider } from "./context/RealTimeContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import GalleryPage from "./pages/GalleryPage";
import PackagesPage from "./pages/PackagesPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import ContactMessagesPage from "./pages/ContactMessagesPage";
import SettingsPage from "./pages/SettingsPage";
import LogsActuatorPage from "./pages/LogsActuatorPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex h-screen bg-gray-100">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAdmin?: boolean;
}> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <svg
          className="animate-spin h-8 w-8 text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
          />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AlertProvider>
      <AuthProvider>
        <GalleryProvider>
          <RealTimeProvider>
            <ErrorBoundary>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Rutas protegidas */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DashboardPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requireAdmin>
                      <MainLayout>
                        <ErrorBoundary>
                          <UsersPage />
                        </ErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/gallery"
                  element={
                    <ProtectedRoute requireAdmin>
                      <MainLayout>
                        <ErrorBoundary>
                          <GalleryPage />
                        </ErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/packages"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PackagesPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/testimonials"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <TestimonialsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/contact-messages"
                  element={
                    <ProtectedRoute requireAdmin>
                      <MainLayout>
                        <ErrorBoundary>
                          <ContactMessagesPage />
                        </ErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <ProtectedRoute requireAdmin>
                      <MainLayout>
                        <ErrorBoundary>
                          <AppointmentsPage />
                        </ErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute requireAdmin>
                      <MainLayout>
                        <SettingsPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/logs-actuator"
                  element={
                    <ProtectedRoute requireAdmin>
                      <MainLayout>
                        <ErrorBoundary>
                          <LogsActuatorPage />
                        </ErrorBoundary>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </RealTimeProvider>
        </GalleryProvider>
      </AuthProvider>
    </AlertProvider>
  );
};

export default App;
