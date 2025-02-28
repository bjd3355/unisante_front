// App.tsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Charger le composant de manière paresseuse
const Home = lazy(() => import("./pages/Home/Home"));
const Appointments = lazy(() => import("./pages/Appointments/Appointments"));
const Pharmacies = lazy(() => import("./pages/Pharmacies/Pharmacies"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen bg-gray-100 flex justify-center items-center">Chargement...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/pharmacies" element={<Pharmacies />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
