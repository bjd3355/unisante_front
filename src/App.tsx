import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "font-awesome/css/font-awesome.min.css";
import { ToastContainer } from "react-toastify";
import "leaflet/dist/leaflet.css";
import "react-toastify/dist/ReactToastify.css";
import "./pages/Dashboard/i18n";
import { UserProvider } from "./contexts/UserContext"; // Contexte utilisateur

// Composants chargés paresseusement
const LoginPage = lazy(() => import("./pages/Home/PageConnexion"));
const SignupPage = lazy(() => import("./pages/Home/Inscription"));
const Home = lazy(() => import("./pages/Home/Home"));
const Appointments = lazy(() => import("./pages/Appointments/Appointments"));
const Pharmacies = lazy(() => import("./pages/Pharmacies/Pharmacies"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const DashboardDoctor = lazy(() => import("./pages/Dashboard/DashboardDoctor"));
const PatientPage = lazy(() => import("./pages/Dashboard/PatientPage"));

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
    <UserProvider> {/* Fournit le contexte utilisateur */}
      <Router>
        <ToastContainer />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/pharmacies" element={<Pharmacies />} />

            {/* Routes protégées avec userId dans l'URL */}
            <Route
              path="/dashboard/:userId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboardDoctor/:userId"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DashboardDoctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patientPage/:userId"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <PatientPage />
                </ProtectedRoute>
              }
            />

            {/* Route pour les accès non autorisés */}
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </Suspense>
      </Router>
    </UserProvider>
  );
};

export default App;
