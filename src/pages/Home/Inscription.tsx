import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import medicalIllustration from "../assets/images/Medical prescription (2).gif";
import logounisante from "../assets/images/logo-unisante.jpg";

const SignupPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Side */}
      <div
        className="w-1/2 flex flex-col justify-center items-center"
        style={{ backgroundColor: "#C0FBCA" }}
      >
        <div className="flex items-center mb-6">
          <img
            src={logounisante}
            alt="UniSanté Logo"
            className="w-16 h-16 rounded-full mr-4"
            style={{ objectFit: "cover" }}
          />
          <div className="text-4xl font-bold">
            <span style={{ color: "#056608" }}>Uni</span>
            <span className="text-white">Santé</span>
          </div>
        </div>
        <img
          src={medicalIllustration}
          alt="Medical Illustration"
          className="w-3/4 opacity-80"
        />
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white p-10 shadow-lg">
        <h2 className="text-4xl font-bold text-gray-700 mb-2">S'inscrire</h2>
        <p className="text-sm text-gray-500 mb-6">
          Déjà un compte ?{" "}
          <a href="#" className="text-blue-500 hover:underline">
            Se connecter
          </a>
        </p>

        {/* Signup Form */}
        <form className="w-full max-w-md space-y-4">
          <div className="relative">
            <label className="block text-gray-700 mb-1" >Nom d'utilisateur</label>
            <div className="flex items-center border rounded-lg px-4 py-2" style={{ backgroundColor: "#C0FBCA" }}>
              <input
                type="text"
                className="w-full bg-transparent focus:outline-none"
                placeholder="Coura"
                style={{ backgroundColor: "#C0FBCA" }}/>
              <FaUser style={{ color: "#056608" }} className="ml-2" />
            </div>
          </div>
          <div className="relative">
            <label className="block text-gray-700 mb-1">Adresse mail</label>
            <div className="flex items-center border rounded-lg px-4 py-2" style={{ backgroundColor: "#C0FBCA" }}>
              <input
                type="email"
                className="w-full bg-transparent focus:outline-none"
                placeholder="couradiop731@gmail.com"
                style={{ backgroundColor: "#C0FBCA" }}/>
              <FaEnvelope style={{ color: "#056608" }} className="ml-2" />
            </div>
          </div>
          <div className="relative">
            <label className="block text-gray-700 mb-1">Mot de passe</label>
            <div className="flex items-center border rounded-lg px-4 py-2" style={{ backgroundColor: "#C0FBCA" }}>
              <input
                type="password"
                className="w-full bg-transparent focus:outline-none"
                placeholder="password"
                style={{ backgroundColor: "#C0FBCA" }}/>
              <FaLock style={{ color: "#056608" }} className="ml-2" />
            </div>
          </div>
          <div className="relative">
            <label className="block text-gray-700 mb-1">Confirmer mot de passe</label>
            <div className="flex items-center border rounded-lg px-4 py-2" style={{ backgroundColor: "#C0FBCA" }}>
              <input
                type="password"
                className="w-full bg-transparent focus:outline-none"
                placeholder="password"
                style={{ backgroundColor: "#C0FBCA" }}/>
              <FaLock style={{ color: "#056608" }} className="ml-2" />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white pt-4 py-2 rounded-lg text-lg hover:bg-green-200 transition duration-200 "
          >
            Enregistrer
          </button>
        </form>

        {/* Social Signup */}
        <div className="mt-6 text-gray-500">OU</div>
        <div className="flex space-x-4 mt-4">
          <button className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition duration-200">
            <i className="fab fa-google" style={{ color: "#056608" }}></i>
          </button>
          <button className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition duration-200">
            <i className="fab fa-facebook" style={{ color: "#056608" }}></i>
          </button>
          <button className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition duration-200">
            <i className="fab fa-linkedin" style={{ color: "#056608" }}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
