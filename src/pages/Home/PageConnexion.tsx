import { FaUser, FaLock, FaGoogle, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import medicalIllustration from "../assets/images/gif.up.gif";
import logoUnisante from "../assets/images/logo-unisante.jpg";
import backgroundImage from "../assets/images/fond.jpg";

const LoginPage = () => {
  return (
    <>
      <div
          className="relative flex min-h-screen bg-gray-50"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            backgroundColor: "rgba(0, 0, 0, 0.1)", // Fond gris léger
            backdropFilter: "blur(2px)", // Effet flou subtil
          }}
          >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-transparent to-green-700/10"></div>
        {/* Conteneur principal */}
        <div className="relative z-10 flex w-full max-w-6xl mx-auto my-16 rounded-3xl overflow-hidden shadow-2xl border border-gray-200/30 backdrop-blur-md">
          {/* Côté gauche */}
          <div
  className="w-1/2 flex flex-col justify-between items-center p-10"
  style={{
    background: "rgba(58, 220, 115, 0.75)",
  }}
>
  <div className="flex flex-col items-center space-y-6 animate-fade-in">
    <img
      src={logoUnisante}
      alt="Logo UniSanté"
      className="w-28 h-28 rounded-full border-4 border-white/95 shadow-lg object-cover transition-transform duration-500 hover:scale-110 hover:shadow-xl"
    />
    <h1 className="text-5xl font-extrabold tracking-tight text-center drop-shadow-lg">
      <span style={{ color: "#056608" }}>Uni</span>
      <span className="text-white">Santé</span>
    </h1>
  </div>

            <div className="w-full max-w-md mt-6 animate-slide-up"> {/* Changé de max-w-xs à max-w-md */}
              <img
                src={medicalIllustration}
                alt="Medical Illustration"
                className="w-full h-auto object-contain rounded-xl shadow-lg transition-transform duration-500 hover:scale-105 hover:shadow-xl border border-gray-100/30"
              />
            </div>
          </div>

          {/* Côté droit - Formulaire */}
          <div
            className="w-1/2 flex flex-col justify-center items-center p-10"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in tracking-tight">
              Bienvenue chez UniSanté
            </h2>
            <p className="text-sm text-gray-600 mb-6 font-medium">
              Besoin d’un compte ?{" "}
              <a href="#" className="text-green-600 hover:text-green-700 transition-colors duration-300 underline underline-offset-4 hover:underline-offset-2">
                S’enregistrer
              </a>
            </p>

            {/* Boutons de rôle */}
            <div className="flex space-x-4 mb-6">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300">
                Admin
              </button>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300">
                Médecin
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300">
                Patient
              </button>
            </div>

            {/* Formulaire */}
            <form className="w-full max-w-sm space-y-5">
              <div className="space-y-1">
                <label className="block text-gray-700 text-sm font-semibold">Nom d'utilisateur</label>
                <div className="flex items-center border border-gray-300/50 rounded-lg px-3 py-2 bg-green-50/50 shadow-sm focus-within:ring-2 focus-within:ring-green-500 transition-all duration-300 hover:bg-green-50/70">
                  <input
                    type="text"
                    className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-gray-700 text-sm"
                    placeholder="Votre nom d’utilisateur"
                  />
                  <FaUser style={{ color: "#056608" }} className="ml-2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-gray-700 text-sm font-semibold">Mot de passe</label>
                <div className="flex items-center border border-gray-300/50 rounded-lg px-3 py-2 bg-green-50/50 shadow-sm focus-within:ring-2 focus-within:ring-green-500 transition-all duration-300 hover:bg-green-50/70">
                  <input
                    type="password"
                    className="w-full bg-transparent focus:outline-none placeholder-gray-400 text-gray-700 text-sm"
                    placeholder="Votre mot de passe"
                  />
                  <FaLock style={{ color: "#056608" }} className="ml-2" />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-gray-600 font-medium">Souvenez-vous de moi</span>
                </label>
                <a href="#" className="text-green-600 hover:text-green-700 transition-colors duration-300">
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2.5 rounded-lg text-base font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              >
                Connectez-vous
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

      {/* Animations */}
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

export default LoginPage;
