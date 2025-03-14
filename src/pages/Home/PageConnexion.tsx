import { useState } from "react";
import { FaEnvelope, FaLock, FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter,FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import medicalIllustration from "../assets/images/gif.up.gif";
import logoUnisante from "../assets/images/logo-unisante.jpg";
import backgroundImage from "../assets/images/fond.jpg";
import { jwtDecode } from "jwt-decode";
import ForgotPassword from "./ForgotPassword";  
import { useGoogleLogin } from "@react-oauth/google";


// Interface pour le payload du JWT
interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [googleUserEmail, setGoogleUserEmail] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation des champs
    if (!selectedRole) {
      setError("Veuillez sélectionner un rôle.");
      toast.error("Veuillez sélectionner un rôle.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      toast.error("Champs obligatoires manquants.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      // Envoi de la requête avec le rôle inclus
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

      // Redirection basée sur le rôle
      setTimeout(() => {
        switch (decodedToken.role.toLowerCase()) {
          case "admin":
            navigate(`/dashboard/${decodedToken.id}`);
            break;
          case "doctor":
            navigate(`/dashboardDoctor/${decodedToken.id}`);
            break;
          case "patient":
            navigate(`/patientPage/${decodedToken.id}`);
            break;
          default:
            navigate("/dashboard");
        }
      }, 3500);
    } catch (err: unknown) {
      console.error("Erreur de connexion :", err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Erreur lors de la connexion.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue s'est produite.");
      }
      toast.error("Échec de la connexion. Vérifiez vos informations.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Gestion de la connexion via Google
  const handleGoogleSuccess = async (response: any) => {
    try {
      // Récupérer les informations utilisateur depuis Google
      const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${response.access_token}` },
      });
      console.log("Infos Google :", userInfo.data); // Vérifiez la présence de "picture"
      // Appel au backend pour finaliser la connexion Google en transmettant "picture"
      const backendResponse = await axios.post("http://localhost:3000/auth/google-login", {
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
      });
      const { accessToken, firstTime } = backendResponse.data;
      if (firstTime) {
        setGoogleUserEmail(userInfo.data.email);
        setShowPasswordModal(true);
      } else {
        const decodedToken = jwtDecode<JwtPayload>(accessToken);
        const userId: string = decodedToken.id;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("userRole", "patient");
        localStorage.setItem("userId", userId);
        toast.success("Connexion avec Google réussie !", { position: "top-right", autoClose: 3000 });
        navigate(`/patientPage/${userId}`);
      }
    } catch (error) {
      toast.error(`Échec de la connexion Google. ${error}`, { position: "top-right", autoClose: 3000 });
    }
  };

  const handleGoogleFailure = (error: any) => {
    toast.error(`Échec de la connexion Google. ${error}`, { position: "top-right", autoClose: 3000 });
  };

  // Ajout du scope "profile email" pour récupérer l'image de profil
  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleFailure,
    scope: 'profile email',
  });

  // Gestion de la définition du mot de passe après Google
  const handleSetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Veuillez saisir et confirmer votre mot de passe.", { position: "top-right", autoClose: 3000 });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.", { position: "top-right", autoClose: 3000 });
      return;
    }
    try {
      await axios.post("http://localhost:3000/auth/set-password", {
        email: googleUserEmail,
        password: newPassword,
      });
      toast.success("Mot de passe défini avec succès !", { position: "top-right", autoClose: 3000 });
      // Connexion automatique après définition du mot de passe
      const loginResponse = await axios.post("http://localhost:3000/auth/login", {
        email: googleUserEmail,
        password: newPassword,
        role: "patient",
      });
      const { accessToken } = loginResponse.data;
      const decodedToken = jwtDecode<JwtPayload>(accessToken);
      const userId: string = decodedToken.id;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("userRole", "patient");
      localStorage.setItem("userId", userId);
      setShowPasswordModal(false);
      navigate(`/patientPage/${userId}`);
    } catch (err: unknown) {
      toast.error(`Erreur lors de la définition du mot de passe. ${err}`, { position: "top-right", autoClose: 3000 });
    }
  };

  // Ferme la modale sans définir le mot de passe (l'utilisateur reste sur la page de connexion)
  const closeModal = () => {
    setShowPasswordModal(false);
    toast.error("Vous devez définir un mot de passe pour accéder à votre compte.", { position: "top-right", autoClose: 3000 });
  };

  // Fonction pour gérer les classes des boutons de rôle
  const getButtonClasses = (role: string, defaultClasses: string): string => {
    return selectedRole === role
      ? defaultClasses
      : "bg-gray-300 text-black px-6 py-2 rounded-full font-medium transition-all duration-300 hover:bg-gray-400";
  };

  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const adminDefault = "bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition-all duration-300";
  const doctorDefault = "bg-orange-500 text-white px-6 py-2 rounded-full font-medium hover:bg-orange-600 transition-all duration-300";
  const patientDefault = "bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-all duration-300";

  return (
    <>
      <div
        className="relative min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-green-900/20"></div>
        <div className="relative z-10 w-full max-w-5xl mx-auto my-10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg">
          <div className="flex flex-col lg:flex-row">
            {/* Partie gauche */}
            <div className="lg:w-1/2 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-green-100 to-green-50">
              <div className="flex flex-col items-center space-y-4 animate-fade-in">
                <img
                  src={logoUnisante}
                  alt="Logo UniSanté"
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover transition-transform duration-300 hover:scale-105"
                />
                <h1 className="text-4xl font-bold text-center text-gray-800">
                  <span className="text-green-700">Uni</span>
                  <span className="text-green-900">Santé</span>
                </h1>
              </div>
              <div className="w-full max-w-sm mt-8">
                <img
                  src={medicalIllustration}
                  alt="Illustration Médicale"
                  className="w-full h-auto rounded-lg shadow-md transition-transform duration-300 hover:scale-[1.02]"
                />
              </div>
            </div>

            {/* Partie droite */}
            {isForgotPassword ? (
            <ForgotPassword onBackToLogin={() => setIsForgotPassword(false)} />
            ) : (
              <div className="lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white/95">
                <div className="w-full max-w-sm mb-6 text-center">
                  <p className="text-xl font-semibold text-gray-800 font-poppins">
                    Bienvenue à UNISANTE
                  </p>
                </div>

                {/* Sélection du rôle */}
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setSelectedRole("admin")}
                    className={getButtonClasses("admin", adminDefault)}
                  >
                    ADMIN
                  </button>
                  <button
                    onClick={() => setSelectedRole("doctor")}
                    className={getButtonClasses("doctor", doctorDefault)}
                  >
                    DOCTOR
                  </button>
                  <button
                    onClick={() => setSelectedRole("patient")}
                    className={getButtonClasses("patient", patientDefault)}
                  >
                    PATIENT
                  </button>
                </div>

                <div className="flex items-center justify-between w-full max-w-sm mb-4">
                  <h2 className="text-2xl font-semibold text-gray-800 animate-fade-in">
                    Connecte-toi
                  </h2>
                  <p className="text-sm text-green-600">
                    Besoin d’un compte ?{" "}
                    <a href="/signup" className="underline hover:text-blue-700 transition-colors duration-200">
                      S’inscrire
                    </a>
                  </p>
                </div>

                {error && (
                  <p className="mb-4 text-red-600 bg-red-50 p-2 rounded-md text-sm">{error}</p>
                )}

                <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Adresse mail *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        placeholder="exemple@unisante.com"
                        required
                      />
                      <FaEnvelope className="absolute right-3 text-gray-500" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Mot de passe *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        placeholder="••••••••"
                        required
                      />
                      <FaLock className="absolute right-3 text-gray-500" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                      <span className="text-sm text-gray-600">Se souvenir de moi</span>
                    </label>
                    <button
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-full font-medium hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Se connecter
                  </button>
                </form>

                {/* Séparateur */}
                <div className="relative my-6 w-full max-w-xs">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-600 font-medium">OU</span>
                  </div>
                </div>

                {/* Boutons sociaux */}
                <div className="flex space-x-4">
                  <button onClick={() => googleLogin()} className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-300">
                    <FaGoogle className="text-green-600 text-lg" />
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-300">
                    <FaFacebookF className="text-green-600 text-lg" />
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-300">
                    <FaTwitter className="text-green-600 text-lg" />
                  </button>
                  <button className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full hover:bg-gray-300 transition-all duration-300">
                    <FaLinkedinIn className="text-green-600 text-lg" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
      {/* Fenêtre modale pour définir le mot de passe lors de la première authentification */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg p-6 w-96">
            <button onClick={closeModal} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
              <FaTimes />
            </button>
            <h2 className="text-xl font-semibold mb-4">Définissez votre mot de passe</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none"
                placeholder="Votre mot de passe"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Confirmez le mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none"
                placeholder="Confirmez votre mot de passe"
              />
            </div>
            <button onClick={handleSetPassword} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300">
              Valider
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </>
  );
};

export default LoginPage; 