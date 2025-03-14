import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaGoogle, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import medicalIllustration from "../assets/images/online.gif";
import logoUnisante from "../assets/images/logo-unisante.jpg";
import backgroundImage from "../assets/images/fond.jpg";
import { jwtDecode } from "jwt-decode";

// Interface pour le payload du JWT
interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [nom, setNom] = useState<string>("");
  const [prenom, setPrenom] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Vérifier que tous les champs sont remplis
    if (!nom.trim() || !prenom.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      toast.error("Champs obligatoires manquants.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Vérifier la correspondance des mots de passe
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      toast.error("Les mots de passe ne correspondent pas.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setError(null);

    try {
      // Envoi de la requête d'inscription
      const response = await axios.post(
        "http://localhost:3000/auth/register",
        {
          firstName: prenom,
          lastName: nom,
          email: email,
          password: password,
          role: "patient", // Rôle fixé à "patient" pour l'inscription
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // Débogage : Afficher la réponse complète
      console.log("Réponse de l'API :", response.data);

      // Récupération et validation du token (si l'API en renvoie un)
      const token = response.data.token || response.data.accessToken || response.data.jwt;
      if (token && typeof token === "string") {
        const decodedToken = jwtDecode<JwtPayload>(token);
        // Stockage des données dans localStorage si token présent
        localStorage.setItem("token", token);
        localStorage.setItem("userId", decodedToken.id);
        localStorage.setItem("userRole", decodedToken.role);
      } else {
        console.warn("Aucun token valide renvoyé par l'API. Redirection vers login.");
      }

      toast.success("Inscription réussie ! 🎉", {
        position: "top-right",
        autoClose: 3000,
      });

      // Redirection après succès (vers login si pas de token, ou dashboard si token)
      setTimeout(() => {
        if (token && typeof token === "string") {
          const decodedToken = jwtDecode<JwtPayload>(token);
          switch (decodedToken.role.toLowerCase()) {
            case "patient":
              navigate(`/patientPage/${decodedToken.id}`);
              break;
            default:
              navigate("/dashboard");
          }
        } else {
          navigate("/login"); // Par défaut, redirection vers login si pas de token
        }
      }, 3500);
    } catch (err: unknown) {
      console.error("Erreur d'inscription :", err);
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message || "Erreur lors de l'inscription.";
        setError(serverMessage);
        toast.error(serverMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setError("Une erreur inconnue s'est produite.");
        toast.error("Une erreur inconnue s'est produite.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  return (
    <>
      <div
        className="relative flex min-h-screen bg-gray-50"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "80%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/15 to-gray-700/5"></div>
        <div className="relative z-10 flex w-full max-w-6xl mx-auto my-16 rounded-3xl overflow-hidden backdrop-blur-md">
          {/* Partie gauche */}
          <div
            className="w-1/2 flex flex-col justify-between items-center p-10"
            style={{ background: "rgba(192, 251, 202, 1)" }}
          >
            <div className="flex flex-col items-center space-y-6 animate-fade-in">
              <img
                src={logoUnisante}
                alt="Logo UniSanté"
                className="w-16 h-16 rounded-full border-4 border-white/95 shadow-lg object-cover transition-transform duration-500 hover:scale-110 hover:shadow-xl"
              />
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
          {/* Partie droite */}
          <div
            className="w-1/2 flex flex-col justify-center items-center p-10"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in tracking-tight">
              Créer un compte
            </h2>
            <p className="text-sm text-gray-600 mb-6 font-medium">
              Déjà inscrit ?{" "}
              <a
                href="/login"
                className="text-green-600 hover:text-green-700 transition-colors duration-300 underline underline-offset-4 hover:underline-offset-2"
              >
                Se connecter
              </a>
            </p>
            {error && (
              <p className="mb-4 text-red-500 bg-red-50 p-2 rounded-md text-sm">{error}</p>
            )}
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-gray-700 mb-1">Nom *</label>
                  <div
                    className="flex items-center border rounded-lg px-4 py-2"
                    style={{ backgroundColor: "#C0FBCA" }}
                  >
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full bg-transparent focus:outline-none"
                      placeholder="Votre nom"
                      style={{ backgroundColor: "#C0FBCA" }}
                      required
                    />
                    <FaUser style={{ color: "#056608" }} className="ml-2" />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-gray-700 mb-1">Prénom *</label>
                  <div
                    className="flex items-center border rounded-lg px-4 py-2"
                    style={{ backgroundColor: "#C0FBCA" }}
                  >
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      className="w-full bg-transparent focus:outline-none"
                      placeholder="Votre prénom"
                      style={{ backgroundColor: "#C0FBCA" }}
                      required
                    />
                    <FaUser style={{ color: "#056608" }} className="ml-2" />
                  </div>
                </div>
              </div>
              <div className="relative">
                <label className="block text-gray-700 mb-1">Adresse mail *</label>
                <div
                  className="flex items-center border rounded-lg px-4 py-2"
                  style={{ backgroundColor: "#C0FBCA" }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="exemple@gmail.com"
                    style={{ backgroundColor: "#C0FBCA" }}
                    required
                  />
                  <FaEnvelope style={{ color: "#056608" }} className="ml-2" />
                </div>
              </div>
              <div className="relative">
                <label className="block text-gray-700 mb-1">Mot de passe *</label>
                <div
                  className="flex items-center border rounded-lg px-4 py-2"
                  style={{ backgroundColor: "#C0FBCA" }}
                >
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="Votre mot de passe"
                    style={{ backgroundColor: "#C0FBCA" }}
                    required
                  />
                  <FaLock style={{ color: "#056608" }} className="ml-2" />
                </div>
              </div>
              <div className="relative">
                <label className="block text-gray-700 mb-1">Confirmer mot de passe *</label>
                <div
                  className="flex items-center border rounded-lg px-4 py-2"
                  style={{ backgroundColor: "#C0FBCA" }}
                >
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent focus:outline-none"
                    placeholder="Confirmez votre mot de passe"
                    style={{ backgroundColor: "#C0FBCA" }}
                    required
                  />
                  <FaLock style={{ color: "#056608" }} className="ml-2" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white pt-4 py-2 rounded-lg text-lg hover:bg-green-700 transition duration-200 shadow-md hover:shadow-lg"
              >
                Enregistrer
              </button>
            </form>
            {/* Séparateur */}
            <div className="relative my-6 w-full max-w-sm">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300/70"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 py-1 bg-white/95 text-gray-600 font-semibold rounded-full shadow-md border border-gray-200/50">
                  OU
                </span>
              </div>
            </div>
            {/* Boutons sociaux */}
            <div className="flex space-x-4">
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
      <ToastContainer />
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
    </>
  );
};

export default SignupPage;