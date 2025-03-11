import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaTachometerAlt, FaCalendarAlt, FaUser, FaPhoneAlt, FaSignOutAlt, FaBars, FaUserMd } from "react-icons/fa";
import { MdLocalPharmacy } from "react-icons/md"; // Icône Pharmacie

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // État pour contrôler la visibilité de la modale
  const [adminImage, setAdminImage] = useState("../src/components/icons/doc.jpg"); // Image de l'admin

  // Fonction pour ouvrir/fermer la modale
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Fonction pour gérer la suppression de l'image
  const deleteImage = () => {
    setAdminImage(""); // On supprime l'image de l'admin
    toggleModal(); // Ferme la modale après suppression
  };

  // Fonction pour gérer le téléversement d'une nouvelle image
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminImage(reader.result as string);
        toggleModal(); // Ferme la modale après téléversement
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside className={`h-screen bg-green-900 text-white transition-all ${collapsed ? "w-20" : "w-64"} flex flex-col`}>
      
      {/* En-tête : Logo, Nom UniSanté et Admin */}
      <div className="p-4 border-b border-green-700 flex flex-col items-center">
        {/* Logo circulaire cliquable qui redirige vers Dashboard */}
        <Link to="/Dashboard" className="flex flex-col items-center">
          <img 
            src="../src/components/icons/Untitled.png" 
            alt="Logo UniSanté" 
            className={`rounded-full transition-all ${collapsed ? "w-8 h-8" : "w-12 h-12"}`} 
          />
          {/* Nom UniSanté en mode étendu */}
          {!collapsed && (
            <span className="mt-2 text-lg font-bold">
              <span className="text-green-400">Uni</span>
              <span className="text-white">Santé</span>
            </span>
          )}
        </Link>
      </div>

      {/* Informations administrateur */}
      <div className="p-4 border-b border-green-700 flex items-center justify-center">
        {/* Photo de l'admin avec un clic qui ouvre la modale */}
        <img 
          src={adminImage || "../src/components/icons/default.jpg"} 
          alt="Admin" 
          className={`rounded transition-all ${collapsed ? "w-8 h-10" : "w-10 h-14"}`} 
          onClick={toggleModal} 
        />
        {/* Texte admin en mode étendu */}
        {!collapsed && (
          <div className="ml-2">
            <div className="text-xs text-gray-300">ADMIN</div>
            <div className="text-sm font-bold">Astou SECK</div>
          </div>
        )}
      </div>

      {/* Icône Hamburger pour réduire/agrandir le menu */}
      <div className="p-4 flex items-center justify-center border-b border-green-700">
        <button onClick={() => setCollapsed(!collapsed)} className="text-white text-2xl">
          <FaBars />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link to="/Dashboard" className="flex items-center space-x-3 p-3 hover:bg-green-700 rounded">
              <FaTachometerAlt className="w-5 h-5" />
              {!collapsed && <span>Tableau de bord</span>}
            </Link>
          </li>
          <li>
            <Link to="/appointmentsadmin" className="flex items-center space-x-3 p-3 hover:bg-green-700 rounded">
              <FaCalendarAlt className="w-5 h-5" />
              {!collapsed && <span>Rendez-vous</span>}
            </Link>
          </li>
          <li>
            <Link to="/pharmaciesadmin" className="flex items-center space-x-3 p-3 hover:bg-green-700 rounded">
              <MdLocalPharmacy className="w-5 h-5" />
              {!collapsed && <span>Pharmacie</span>}
            </Link>
          </li>
          <li>
            <Link to="/patients" className="flex items-center space-x-3 p-3 hover:bg-green-700 rounded">
              <FaUser className="w-5 h-5" />
              {!collapsed && <span>Patient</span>}
            </Link>
          </li>
          <li>
            <Link to="/doctors" className="flex items-center space-x-3 p-3 hover:bg-green-700 rounded">
              <FaUserMd className="w-5 h-5" />
              {!collapsed && <span>Docteur</span>}
            </Link>
          </li>
          <li>
            <Link to="/contact" className="flex items-center space-x-3 p-3 hover:bg-green-700 rounded">
              <FaPhoneAlt className="w-5 h-5" />
              {!collapsed && <span>Contact</span>}
            </Link>
          </li>
          <li>
            <Link to="/logout" className="flex items-center space-x-3 p-3 hover:bg-red-700 rounded">
              <FaSignOutAlt className="w-5 h-5" />
              {!collapsed && <span>Déconnexion</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Modale de gestion de l'image */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-bold mb-4">Gérer l'image de l'admin</h3>
            <div className="space-y-4">
              <button
                onClick={deleteImage}
                className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer l'image
              </button>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md"
                />
              </div>
              <button
                onClick={toggleModal}
                className="w-full py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
