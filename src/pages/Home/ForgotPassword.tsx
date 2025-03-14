// ForgotPassword.tsx
import React, { useState } from "react";
import { FaEnvelope, FaArrowLeft, FaLock, FaKey } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [step, setStep] = useState<number>(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  

  // Étape 1 : Envoyer l'e-mail pour envoyer le code de réinitialisation (vérification de l'email côté backend)
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Veuillez entrer votre adresse e-mail.");
      toast.error("Adresse e-mail requise.", { position: "top-right", autoClose: 3000 });
      return;
    }

    try {
      // Appel à l'endpoint qui vérifie l'e-mail et envoie un code à 4 chiffres (expiration 30s)
      const response =  await axios.post("http://localhost:3000/mail/reset-password", { email });
      setVerificationCode(response.data.code);
      toast.success("Un code de réinitialisation a été envoyé à votre e-mail (valable 30s) !", {
        position: "top-right",
        autoClose: 3000,
      });
      setError(null);
      setStep(2); // Passe à l'étape du code
    } catch (err) {
      console.error("Erreur lors de l'envoi du code :", err);
      setError("Erreur lors de l'envoi du code. Vérifiez votre e-mail.");
      toast.error("Une erreur s'est produite.", { position: "top-right", autoClose: 3000 });
    }
  };

  // Étape 2 : Vérifier le code reçu par e-mail
const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!code.trim()) {
    setError("Veuillez entrer le code reçu.");
    toast.error("Code requis.", { position: "top-right", autoClose: 3000 });
    return;
  }
  if (code === verificationCode) {
    setStep(3); // Passe à l'étape du mot de passe
  } else {
    toast.error("Code invalide, veuillez réessayer.", { position: "top-right", autoClose: 3000 });
  }

}; 

  // Étape 3 : Réinitialiser le mot de passe
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      toast.error("Champs requis.", { position: "top-right", autoClose: 3000 });
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      toast.error("Mots de passe différents.", { position: "top-right", autoClose: 3000 });
      return;
    }
  
    try {
      await axios.post("http://localhost:3000/auth/reset-password", {
        email,
        newPassword,
      });
      toast.success("Mot de passe réinitialisé avec succès !", {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => onBackToLogin(), 3500); // Retour à la connexion après succès
    } catch (err) {
      console.error("Erreur lors de la réinitialisation :", err);
      setError("Erreur lors de la réinitialisation.");
      toast.error("Une erreur s'est produite.", { position: "top-right", autoClose: 3000 });
    }
  };
  

  return (
    <div className="w-full lg:w-1/2 p-8 bg-white/95 rounded-r-2xl shadow-lg transform transition-all duration-300 flex flex-col justify-center">
      <button
        onClick={onBackToLogin}
        className="flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors duration-200"
      >
        <FaArrowLeft className="mr-2" />
        <span className="text-sm font-medium">Retour à la connexion</span>
      </button>

      <div className="w-full max-w-sm mx-auto">
        {/* Indicateur d'étapes */}
        <div className="flex justify-center mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full mx-2 transition-all duration-300 ${
                step >= s ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Titre dynamique */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center animate-slide-in">
          {step === 1
            ? "Mot de passe oublié"
            : step === 2
            ? "Vérification du code"
            : "Nouveau mot de passe"}
        </h2>

        {/* Étape 1 : Email */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-6 animate-fade-in">
            <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
              Entrez votre adresse e-mail pour recevoir un code de réinitialisation.
            </p>
            {error && (
              <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm shadow-sm">
                {error}
              </p>
            )}
            <div className="relative group">
              <label className="block text-gray-700 text-sm font-medium mb-2 transition-all duration-200 group-focus-within:text-green-600">
                Adresse e-mail *
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white shadow-sm"
                  placeholder="exemple@unisante.com"
                  required
                />
                <FaEnvelope className="absolute right-4 text-gray-500 group-focus-within:text-green-600 transition-colors duration-200" />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-full font-medium hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Valider
            </button>
          </form>
        )}

        {/* Étape 2 : Code */}
        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="space-y-6 animate-fade-in">
            <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
              Entrez le code reçu par e-mail pour continuer.
            </p>
            {error && (
              <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm shadow-sm">
                {error}
              </p>
            )}
            <div className="relative group">
              <label className="block text-gray-700 text-sm font-medium mb-2 transition-all duration-200 group-focus-within:text-green-600">
                Code de vérification *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white shadow-sm"
                  placeholder="XXXX"
                  required
                />
                <FaKey className="absolute right-4 text-gray-500 group-focus-within:text-green-600 transition-colors duration-200" />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-full font-medium hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              OK
            </button>
          </form>
        )}

        {/* Étape 3 : Nouveau mot de passe */}
        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6 animate-fade-in">
            <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
              Définissez un nouveau mot de passe sécurisé.
            </p>
            {error && (
              <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm shadow-sm">
                {error}
              </p>
            )}
            <div className="relative group">
              <label className="block text-gray-700 text-sm font-medium mb-2 transition-all duration-200 group-focus-within:text-green-600">
                Nouveau mot de passe *
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <FaLock className="absolute right-4 text-gray-500 group-focus-within:text-green-600 transition-colors duration-200" />
              </div>
            </div>
            <div className="relative group">
              <label className="block text-gray-700 text-sm font-medium mb-2 transition-all duration-200 group-focus-within:text-green-600">
                Confirmer le mot de passe *
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <FaLock className="absolute right-4 text-gray-500 group-focus-within:text-green-600 transition-colors duration-200" />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-full font-medium hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Confirmer
            </button>
          </form>
        )}
      </div>

      {/* Style personnalisé */}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
