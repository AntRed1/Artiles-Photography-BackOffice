import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GalleryProvider } from "./context/GalleryContext";
import { AlertProvider } from "./components/common/AlertManager"; // <-- NUEVO
import ErrorBoundary from "./components/common/ErrorBoundary";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/DashboardPage";
import UsersPage from "./pages/UsersPage";
import GalleryPage from "./pages/GalleryPage";
import PackagesPage from "./pages/PackagesPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Componente para proteger las rutas que requieren autenticación y, opcionalmente, rol de administrador
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAdmin?: boolean;
}> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

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
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Rutas protegidas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-100 flex">
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-1 overflow-y-auto bg-gray-100">
                        <Routes>
                          <Route path="/" element={<DashboardPage />} />
                          <Route
                            path="/users"
                            element={
                              <ProtectedRoute requireAdmin>
                                <ErrorBoundary>
                                  <UsersPage />
                                </ErrorBoundary>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/gallery"
                            element={
                              <ProtectedRoute requireAdmin>
                                <ErrorBoundary key="gallery-error-boundary">
                                  <GalleryPage key="gallery-page" />
                                </ErrorBoundary>
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/packages" element={<PackagesPage />} />
                          <Route
                            path="/testimonials"
                            element={<TestimonialsPage />}
                          />
                          <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </GalleryProvider>
      </AuthProvider>
    </AlertProvider>
  );
};

export default App;
