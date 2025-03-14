import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "font-awesome/css/font-awesome.min.css";
import "leaflet/dist/leaflet.css";
import "react-toastify/dist/ReactToastify.css";
import "./pages/Dashboard/i18n";
import { UserProvider } from "./contexts/UserContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Composants chargés paresseusement
const LoginPage = lazy(() => import("./pages/Home/PageConnexion"));
const SignupPage = lazy(() => import("./pages/Home/Inscription"));
const Home = lazy(() => import("./pages/Home/Home"));
const Appointments = lazy(() => import("./pages/Appointments/Appointments"));
const Pharmacies = lazy(() => import("./pages/Pharmacies/Pharmacies"));
const Dashboard = lazy(() => import("./pages/Dashboard/admin/Dashboard/Dashboard"));
const DashboardDoctor = lazy(() => import("./pages/Dashboard/DashboardDoctor"));
const PatientPage = lazy(() => import("./pages/Dashboard/PatientPage"));
const Appointmentsadmin = lazy(() => import("./pages/Dashboard/admin/Appointments/Appointments"));
const Pharmaciesadmin = lazy(() => import("./pages/Dashboard/admin/Pharmacies/Pharmacies"));
const Patients = lazy(() => import("./pages/Dashboard/admin/patient/Patients"));
const Contact = lazy(() => import("./pages/Dashboard/admin/contact/Contact"));
const Doctors = lazy(() => import("./pages/Dashboard/admin/doctors/doctors"));
const Layout = lazy(() => import("./components/layout/Layout")); // le layout avec Sidebar


// Composant de chargement
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 border-4 border-[#056608] border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-600 text-lg">Chargement...</span>
    </div>
  </div>
);

// Composant pour gérer les accès protégés
interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const userRole = localStorage.getItem("userRole");
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

// Composant pour afficher un message d'accès refusé
const Unauthorized: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-red-600">Accès refusé</h1>
      <p className="mt-4 text-lg">
        Vous n'avez pas les droits nécessaires pour accéder à cette page.
      </p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    // Assure-toi de remplacer "TON_CLIENT_ID_GOOGLE" par ton identifiant client Google
    <GoogleOAuthProvider clientId="1086457158576-s1coktbijn87bu8k4okfg25plpvi6et5.apps.googleusercontent.com">
      <UserProvider>
      <Router>
        <ToastContainer />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/appointments/:patientId" element={<Appointments />} />
            <Route path="/pharmacies" element={<Pharmacies />} />
            <Route path="/dashboardDoctor/:userId" element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DashboardDoctor />
              </ProtectedRoute>
            } />
            <Route path="/patientPage/:userId" element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientPage />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Routes protégées avec layout */}
            <Route element={<Layout />}>
              <Route
                path="/dashboard/:userId"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointmentsadmin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Appointmentsadmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pharmaciesadmin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Pharmaciesadmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patients"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Patients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctors"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Doctors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contact"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Contact />
                  </ProtectedRoute>
                }
              />
            </Route>

          </Routes>
        </Suspense>
      </Router>
    </UserProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
