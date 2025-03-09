import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { FaUser, FaLock, FaGoogle, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import medicalIllustration from "../assets/images/gif.up.gif";
import logoUnisante from "../assets/images/logo-unisante.jpg";
import backgroundImage from "../assets/images/fond.jpg";

interface JwtPayload {
  email: string;
  role: string;
  id: string;
  // Vous pouvez ajouter d'autres propriétés si nécessaire
}

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!selectedRole) {
      toast.error("Veuillez sélectionner un rôle", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/login",
        { email, password, role: selectedRole },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(response.data);
      toast.success("Connexion réussie ! 🎉", {
        position: "top-right",
        autoClose: 3000,
      });

      // Récupération du token depuis la réponse
      const { accessToken } = response.data;

      // Décodage du token pour extraire l'id utilisateur
      const decodedToken = jwtDecode<JwtPayload>(accessToken);
      const userId: string = decodedToken.id;

      // Stockage du token, du rôle et de l'ID utilisateur dans le localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("userRole", selectedRole);
      localStorage.setItem("userId", userId);

      // Redirection vers la page dédiée avec l'ID dans l'URL
      setTimeout(() => {
        if (selectedRole === "admin") {
          navigate(`/dashboard/${userId}`);
        } else if (selectedRole === "doctor") {
          navigate(`/dashboardDoctor/${userId}`);
        } else if (selectedRole === "patient") {
          navigate(`/patientPage/${userId}`);
        } else {
          navigate("/appointments");
        }
      }, 3500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue s'est produite.");
      }
      console.error(err);
      toast.error("Échec de la connexion. Vérifiez vos informations.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const getButtonClasses = (role: string, defaultClasses: string): string => {
    if (!selectedRole) {
      return defaultClasses;
    } else {
      return selectedRole === role
        ? defaultClasses
        : "bg-gray-300 text-black px-4 py-2 rounded-lg transition-all duration-300";
    }
  };

  const adminDefault = "bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300";
  const doctorDefault = "bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300";
  const patientDefault = "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300";

  return (
    <div
      className="relative flex min-h-screen bg-gray-50 animate-slide-up"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-transparent to-green-700/10"></div>
      <div className="relative z-10 flex w-full max-w-6xl mx-auto h-screen rounded-3xl overflow-hidden shadow-2xl border border-gray-200/30 backdrop-blur-md">
        {/* Partie gauche */}
        <div
          className="w-1/2 flex flex-col justify-between items-center p-10"
          style={{ background: "rgba(58, 220, 115, 0.75)" }}
        >
          <div className="flex flex-col items-center space-y-10 animate-fade-in">
            <Link to="/login">
              <img
                src={logoUnisante}
                alt="Logo UniSanté"
                className="w-16 h-16 rounded-full border-4 border-white/95 shadow-lg object-cover transition-transform duration-500 hover:scale-110 hover:shadow-xl"
              />
            </Link>
            <h1 className="text-5xl font-extrabold tracking-tight text-center drop-shadow-lg">
              <span style={{ color: "#056608" }}>Uni</span>
              <span className="text-white">Santé</span>
            </h1>
          </div>
          <div className="w-full max-w-md mt-6 animate-slide-up">
            <img
              src={medicalIllustration}
              alt="Medical Illustration"
              className="w-full h-auto rounded-xl shadow-lg transition-transform duration-500"
            />
          </div>
        </div>
        {/* Partie droite centrée */}
        <div
          className="w-1/2 flex flex-col justify-center items-center p-10 pl-20 h-full"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
        >
          <div className="w-full">
            <h2 className="text-xl font-semibold text-gray-700">Bienvenue chez UniSanté</h2>
            <p className="text-sm text-gray-500 mt-1">
              Besoin d’un compte ?{" "}
              <Link to="/signup" className="text-blue-500 hover:underline">
                S'inscrire
              </Link>
            </p>
            {/* Sélection du rôle */}
            <div className="flex space-x-4 mt-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg focus:outline-none ${getButtonClasses("admin", adminDefault)}`}
                onClick={() => setSelectedRole("admin")}
              >
                Admin
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg focus:outline-none ${getButtonClasses("doctor", doctorDefault)}`}
                onClick={() => setSelectedRole("doctor")}
              >
                Médecin
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg focus:outline-none ${getButtonClasses("patient", patientDefault)}`}
                onClick={() => setSelectedRole("patient")}
              >
                Patient
              </button>
            </div>
            {/* Formulaire de connexion */}
            <form className="w-full max-w-md mt-6" onSubmit={handleSubmit}>
              {/* Champ email */}
              <div className="relative pb-5">
                <label className="block text-gray-700 mb-1" htmlFor="email">
                  Adresse Email
                </label>
                <div className="flex items-center border rounded-lg px-4 py-2" style={{ backgroundColor: "#C0FBCA" }}>
                  <input
                    id="email"
                    type="email"
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ backgroundColor: "#C0FBCA" }}
                  />
                  <FaUser style={{ color: "#056608" }} className="ml-2" />
                </div>
              </div>
              {/* Champ mot de passe */}
              <div className="relative pb-10">
                <label className="block text-gray-700 mb-1" htmlFor="password">
                  Mot de passe
                </label>
                <div className="flex items-center border rounded-lg px-4 py-2" style={{ backgroundColor: "#C0FBCA" }}>
                  <input
                    id="password"
                    type="password"
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ backgroundColor: "#C0FBCA" }}
                  />
                  <FaLock style={{ color: "#056608" }} className="ml-2" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-between items-center mb-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-600 text-sm">Souvenez-vous de moi</span>
                </label>
                <a href="#" className="text-blue-500 text-sm">
                  Mot de passe oublié ?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-lg"
                style={{ backgroundColor: "#BAE8C6", color: "white" }}
              >
                Connectez-vous
              </button>
            </form>
          </div>
          <div className="w-full">
            <div className="relative my-8 w-full max-w-sm mx-auto">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/70"></div>
              </div>
              <div className="relative flex justify-center p-10 text-sm">
                <span className="px-4 py-1 bg-white/95 text-gray-600 font-semibold rounded-full shadow-md border border-gray-200/50">
                  OU
                </span>
              </div>
            </div>
            <div className="flex space-x-4 justify-center">
              <button className="flex items-center justify-center w-12 h-12 bg-gray-100/95 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-md hover:scale-110 hover:shadow-xl active:scale-95">
                <FaGoogle style={{ color: "#056608" }} className="text-xl" />
              </button>
              <button className="flex items-center justify-center w-12 h-12 bg-gray-100/95 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-md hover:scale-110 hover:shadow-xl active:scale-95">
                <FaFacebookF style={{ color: "#056608" }} className="text-xl" />
              </button>
              <button className="flex items-center justify-center w-12 h-12 bg-gray-100/95 rounded-full hover:bg-gray-200 transition-all duration-300 shadow-md hover:scale-110 hover:shadow-xl active:scale-95">
                <FaLinkedinIn style={{ color: "#056608" }} className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
