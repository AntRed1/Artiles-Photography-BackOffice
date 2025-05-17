import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GalleryProvider } from "./context/GalleryContext";
import { AlertProvider } from "./components/common/AlertManager";
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

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requireAdmin?: boolean;
}> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    console.log("No autenticado, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log("No es administrador, redirigiendo a /unauthorized");
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
                  <div className="flex h-screen bg-gray-100">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Header />
                      <main className="flex-1 overflow-y-auto p-6">
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
                          <Route
                            path="/settings"
                            element={
                              <ProtectedRoute requireAdmin>
                                <SettingsPage />
                              </ProtectedRoute>
                            }
                          />
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
