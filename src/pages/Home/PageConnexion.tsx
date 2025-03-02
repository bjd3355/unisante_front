import { User } from "lucide-react"; 
import medicalIllustration from "../assets/images/gif.up.gif";
import logounisante from "../assets/images/logo-unisante.jpg";

const LoginPage = () => {
  return (
    <div className="flex h-screen bg-gray-100">
     {/* Left Side */}
      <div className="w-1/2 flex flex-col justify-center items-center" style={{ backgroundColor: "#BAE8C6" }}>
        <img src={logounisante} alt="UNISANTE" className="w-16 h-16 mb-4 absolute top-0 left-0 ml-4 mt-4" />
      <div className="text-4xl font-bold">
        <span style={{ color: "#056608" }}>Uni</span> {/* Application directe de la couleur */}
        <span className="text-white">Santé</span>
      </div>
       <img 
        src={medicalIllustration} 
        alt="Medical Illustration" 
        className="w-3/4  opacity-80"
       />
      </div>
      {/* Right Side */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-white p-10 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700">Bienvenue chez Unisante</h2>
        <p className="text-sm text-gray-500 mt-1">Besoin d’un compte ? <a href="#" className="text-blue-500">S’enregistrer</a></p>
        
      {/* Role Selection */}
        <div className="flex space-x-4 mt-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg">Admin</button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded-lg">Médecin</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Patient</button>
        </div>
        
        <form className="w-full max-w-md mt-6">
  {/* Nom d’utilisateur */}
  <div className="mb-4 relative">
    <label className="block text-gray-700">Nom d’utilisateur</label>
    <User className="absolute left-3 top-10 transform -translate-y-10 text-gray-400"/>
    <input
      type="text"
      className="w-full border pl-12 pr-4 py-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Votre nom d’utilisateur"
      style={{
        backgroundColor: "#BAE8C6",
        paddingLeft: "3rem", // Ajustez cette valeur si nécessaire
      }}
    />

  </div>

  {/* Mot de passe */}
  <div className="mb-4 relative">
    <label className="block text-gray-700">Mot de passe</label>
    <input
      type="password"
      className="w-full border pl-12 pr-4 py-2 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Votre mot de passe"
      style={{
        backgroundColor: "#BAE8C6",
        paddingLeft: "3rem", // Ajustez cette valeur si nécessaire
      }}
    />
    <i className="fas fa-lock text-gray-500 text-lg absolute left-4 top-1/2 transform -translate-y-1/2"></i>
  </div>

  <div className="flex justify-between items-center mb-4">
    <label className="flex items-center">
      <input type="checkbox" className="mr-2" />
      <span className="text-gray-600 text-sm">Souvenez-vous de moi</span>
    </label>
    <a href="#" className="text-blue-500 text-sm">Mot de passe oublié ?</a>
  </div>

  <button
    type="submit"
    className="w-full bg-blue-600 text-white py-2 rounded-lg text-lg"
    style={{ backgroundColor: "#BAE8C6" }}
  >
    Connectez-vous
  </button>
</form>

        {/* Social Login */}
        <div className="mt-6 text-gray-500">OU</div>
        <div className="flex space-x-4 mt-4">
          <button className="bg-gray-200 p-2 rounded-lg"><i className="fab fa-google"></i></button>
          <button className="bg-gray-200 p-2 rounded-lg"><i className="fab fa-facebook"></i></button>
          <button className="bg-gray-200 p-2 rounded-lg"><i className="fab fa-twitter"></i></button>
          <button className="bg-gray-200 p-2 rounded-lg"><i className="fab fa-linkedin"></i></button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
