import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

// Componente para proteger las rutas que requieren autenticación
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="min-h-screen bg-gray-100 flex">
                <Sidebar />
                <div className="flex-1 flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1 overflow-y-auto bg-gray-100">
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/gallery" element={<GalleryPage />} />
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
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
