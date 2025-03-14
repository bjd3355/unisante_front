import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUser,
  FaPhoneAlt,
  FaSignOutAlt,
  FaBars,
  FaUserMd,
} from "react-icons/fa";
import { MdLocalPharmacy } from "react-icons/md";

// Définition de l'interface pour l'utilisateur (admin)
interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  image: string;
}

const Sidebar: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);

  // Récupère le token (exemple, à adapter selon ton système d'authentification)
  const token = localStorage.getItem("token");

  // Récupérer les infos de l'utilisateur (admin) via l'API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get<User>(`http://localhost:3000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur", error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);

  // Fonctions pour gérer la modale et la photo (téléversement/suppression)
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const deleteImage = () => {
    if (userData) {
      // Ici, vous pouvez mettre à jour le backend pour supprimer la photo, puis mettre à jour le state
      setUserData({ ...userData, image: "" });
      toggleModal();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Ici, vous pouvez aussi mettre à jour le backend avec la nouvelle photo
        setUserData({ ...userData, image: reader.result as string });
        toggleModal();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <aside
      className={`h-screen bg-green-900 text-white transition-all ${
        collapsed ? "w-20" : "w-64"
      } flex flex-col`}
    >
      {/* En-tête : Logo et Nom UniSanté */}
      <div className="p-4 border-b border-green-700 flex flex-col items-center">
        <Link to="/Dashboard" className="flex flex-col items-center">
          <img
            src="../src/components/icons/Untitled.png"
            alt="Logo UniSanté"
            className={`rounded-full transition-all ${
              collapsed ? "w-8 h-8" : "w-12 h-12"
            }`}
          />
          {!collapsed && (
            <span className="mt-2 text-lg font-bold">
              <span className="text-green-400">Uni</span>
              <span className="text-white">Santé</span>
            </span>
          )}
        </Link>
      </div>

      {/* Informations de l'administrateur */}
      <div className="p-4 border-b border-green-700 flex items-center justify-center">
        <img
          src={userData?.image || "../icons/doc.jpg"}
          alt="Admin"
          className={`rounded transition-all ${
            collapsed ? "w-14 h-16" : "w-14 h-16"
          }`}
          onClick={toggleModal}
        />
        {!collapsed && (
          <div className="ml-5">
            <div className="text-xs text-gray-300">
              {userData ? userData.role.toUpperCase() : "ADMIN"}
            </div>
            <div className="text-sm font-bold">
              {userData ? userData.firstName : "Chargement..."} {userData ? userData.lastName : "Chargement..."}
            </div>
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
            <Link to="/Dashboard/:userId" className="flex items-center space-x-3 p-3 hover:bg-green-700 rounded">
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
              {!collapsed && <span>Assistance</span>}
            </Link>
          </li>
          <li>
            <Link to="/" className="flex items-center space-x-3 p-3 hover:bg-red-700 rounded">
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
