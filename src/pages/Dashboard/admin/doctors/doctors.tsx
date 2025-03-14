import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaChevronDown,
  FaFileExport,
} from "react-icons/fa";
import axios from 'axios';
import Modal from "react-modal";
import * as XLSX from "xlsx";

// Configuration de react-modal
Modal.setAppElement("#root");

// ==============================
// 1) Interfaces
// ==============================
interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  mail: string;
  availability: boolean;
  birthday: string;
  phoneNumber: string;
  image: string;
  specialty: {
    id: number;
    name: string;
  };
  department: string;
  experience: number; // en années
  fee: number; // frais de consultation
  clinicLocation: "UniSanté Clinic";
  profilePic?: string;
  about?: string;
  skills?: string[];
}

// ==============================
// 2) Modale de Profil d'un Docteur
// ==============================
interface DoctorProfileModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  doctor: Doctor | null;
}

// Styles de la modale principale (Profil)
const profileModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "90%",
    height: "80%", // Hauteur fixe pour uniformiser les onglets
    maxWidth: "1200px",
    maxHeight: "90vh",
    borderRadius: "8px",
    padding: "0",
    overflow: "hidden",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
  },
};

// Styles pour les modales imbriquées (Ajouter, Edit, Delete)
const nestedModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "400px",
    borderRadius: "8px",
    padding: "1rem",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 11000,
  },
};

const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({
  isOpen,
  onRequestClose,
  doctor,
}) => {
  const [activeTab, setActiveTab] = useState<"apropos" | "competences" | "parametres">("apropos");

  if (!doctor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={profileModalStyles}
      contentLabel="Profil du docteur"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-3 right-4 text-red-500 font-bold text-xl"
      >
        X
      </button>
      <div className="w-full h-full flex flex-col md:flex-row">
        {/* Colonne gauche : Photo et infos rapides */}
        <div className="w-full md:w-1/3 bg-gray-100 p-4 flex flex-col items-center">
          <img
            src={`http://localhost:3000${doctor.profilePic ||doctor?.image || "https://via.placeholder.com/150"}`} 
            alt="Profil"
            className="w-36 h-36 object-cover rounded-full mb-4"
          />
          <h2 className="text-xl font-semibold">
            {doctor.firstName} {doctor.lastName}
          </h2>
          <p className="text-gray-500">{doctor.specialty.name}</p>
          <p className="mt-2 text-gray-600">{doctor.department}</p>
          <p className="text-gray-600">{doctor.phoneNumber}</p>
          <p className="text-gray-600">{doctor.mail}</p>
        </div>
        {/* Colonne droite : Onglets */}
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="flex space-x-4 mb-4 border-b p-4">
            <button
              onClick={() => setActiveTab("apropos")}
              className={`p-2 ${activeTab === "apropos" ? "border-b-2 border-blue-500" : ""}`}
            >
              À propos
            </button>
            <button
              onClick={() => setActiveTab("competences")}
              className={`p-2 ${activeTab === "competences" ? "border-b-2 border-blue-500" : ""}`}
            >
              Compétences
            </button>
            <button
              onClick={() => setActiveTab("parametres")}
              className={`p-2 ${activeTab === "parametres" ? "border-b-2 border-blue-500" : ""}`}
            >
              Paramètres
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "apropos" && (
              <div>
                <h3 className="text-lg font-bold mb-2">À propos</h3>
                <p className="text-gray-700">
                  {doctor.about || "Description ou biographie du docteur, son parcours, etc."}
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold">Informations générales</h4>
                  <p>Expérience : {doctor.experience} ans</p>
                  <p>Frais de consultation : {doctor.fee} FCFA</p>
                  <p>Disponibilité : {doctor.availability ? "Disponible" : "Non disponible"}</p>
                  <p>Date de naissance : {doctor.birthday}</p>
                  <p>Localisation : {doctor.clinicLocation}</p>
                </div>
              </div>
            )}
            {activeTab === "competences" && (
              <div>
                <h3 className="text-lg font-bold mb-2">Compétences</h3>
                {doctor.skills && doctor.skills.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {doctor.skills.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucune compétence renseignée.</p>
                )}
              </div>
            )}
            {activeTab === "parametres" && (
              <div>
                <h3 className="text-lg font-bold mb-2">Paramètres du compte</h3>
                <div className="space-y-4">
                  {/* Paramètres de sécurité */}
                  <div className="border p-4 rounded mb-4">
                    <h4 className="font-semibold mb-2">Paramètres de sécurité</h4>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="text"
                        placeholder="Nom d'utilisateur"
                        className="border p-2 rounded"
                      />
                      <input
                        type="password"
                        placeholder="Mot de passe actuel"
                        className="border p-2 rounded"
                      />
                      <input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        className="border p-2 rounded"
                      />
                      <button className="bg-blue-500 text-white p-2 rounded mt-2">
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                  {/* Paramètres du compte */}
                  <div className="border p-4 rounded mb-4">
                    <h4 className="font-semibold mb-2">Paramètres du compte</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Prénom"
                        className="border p-2 rounded"
                        defaultValue={doctor.firstName}
                      />
                      <input
                        type="text"
                        placeholder="Nom de famille"
                        className="border p-2 rounded"
                        defaultValue={doctor.lastName}
                      />
                      <input
                        type="text"
                        placeholder="Ville"
                        className="border p-2 rounded"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        className="border p-2 rounded"
                        defaultValue={doctor.mail}
                      />
                      <input
                        type="text"
                        placeholder="Pays"
                        className="border p-2 rounded"
                      />
                      <textarea
                        placeholder="Adresse"
                        className="border p-2 rounded col-span-2"
                      ></textarea>
                    </div>
                  </div>
                  {/* Options de confidentialité */}
                  <div className="border p-4 rounded">
                    <h4 className="font-semibold mb-2">Options de confidentialité</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span>Visibilité du profil pour tous</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span>Notifications de nouvelles tâches</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <span>Notifications de nouvelles demandes d'amis</span>
                      </label>
                    </div>
                    <button className="bg-blue-500 text-white p-2 rounded mt-4">
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ==============================
// 3) Modale d’Ajout de Docteur
// ==============================
interface AddDoctorModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onAdd: (newDoctor: Doctor) => void;
}

interface Specialization {
  id: number;
  name: string;
}

const AddDoctorModal: React.FC<AddDoctorModalProps> = ({
  isOpen,
  onRequestClose,
  onAdd,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mail, setMail] = useState("");
  const [availability, setAvailability] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState<string>("");
  const [experience, setExperience] = useState(0);
  const [fee, setFee] = useState(0);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);

  // Récupérer les spécialisations depuis l'API lors du montage du composant
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await axios.get<Specialization[]>('http://localhost:3000/specialty');
        // On suppose que la réponse renvoie un tableau d'objets respectant l'interface Specialization
        setSpecializations(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des spécialisations :", error);
      }
    };

    fetchSpecializations();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoctor: Doctor = {
      id: Date.now(),
      firstName,
      lastName,
      mail,
      availability,
      birthday,
      phoneNumber,
      specialty: {
        id: Date.now(), // Vous pouvez remplacer par une logique d'assignation d'id plus adaptée
        name: specialization,
      },
      department,
      experience,
      fee,
      clinicLocation: "UniSanté Clinic",
      profilePic: "https://via.placeholder.com/150",
      image:"",
      about: "Nouveau docteur ajouté.",
      skills: [],
    };
    onAdd(newDoctor);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        ...nestedModalStyles,
        content: {
          ...nestedModalStyles.content,
          maxWidth: "600px", // Override pour l'ajout
        },
      }}
      contentLabel="Ajouter un Docteur"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-2 right-2 text-red-500 font-bold"
      >
        X
      </button>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Ajouter un Docteur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border p-2 rounded w-1/2"
              required
            />
            <input
              type="text"
              placeholder="Nom de famille"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border p-2 rounded w-1/2"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <div className="flex items-center">
            <label className="mr-2">Disponible</label>
            <input
              type="checkbox"
              checked={availability}
              onChange={(e) => setAvailability(e.target.checked)}
            />
          </div>
          <input
            type="date"
            placeholder="Date de naissance"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Département"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="border p-2 rounded w-full"
            required
          >
            <option value="" disabled>
              Spécialisation
            </option>
            {specializations.map((spec) => (
              <option key={spec.id} value={spec.name}>
                {spec.name}
              </option>
            ))}
          </select>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Expérience (années)"
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="border p-2 rounded w-1/2"
              required
            />
            <input
              type="number"
              placeholder="Frais de consultation"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              className="border p-2 rounded w-1/2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded mt-2 w-full"
          >
            Ajouter
          </button>
        </form>
      </div>
    </Modal>
  );
};

// ==============================
// 4) Modale de Modification de Docteur
// ==============================
interface EditDoctorModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  doctor: Doctor | null;
  onSave: (updatedDoctor: Doctor) => void;
}
const EditDoctorModal: React.FC<EditDoctorModalProps> = ({
  isOpen,
  onRequestClose,
  doctor,
  onSave,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mail, setMail] = useState("");
  const [availability, setAvailability] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState(0);
  const [fee, setFee] = useState(0);

  useEffect(() => {
    if (doctor) {
      setFirstName(doctor.firstName);
      setLastName(doctor.lastName);
      setMail(doctor.mail);
      setAvailability(doctor.availability);
      setBirthday(doctor.birthday);
      setPhoneNumber(doctor.phoneNumber);
      setDepartment(doctor.department);
      setSpecialization(doctor.specialty.name);
      setExperience(doctor.experience);
      setFee(doctor.fee);
    }
  }, [doctor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    const updatedDoctor: Doctor = {
      ...doctor,
      firstName,
      lastName,
      mail,
      availability,
      birthday,
      phoneNumber,
      department,
      specialty: {
        id: doctor.specialty.id, // Conserver l'id existant de la spécialité
        name: specialization,
      },
      experience,
      fee,
      clinicLocation: "UniSanté Clinic",
    };
    onSave(updatedDoctor);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        ...nestedModalStyles,
        content: {
          ...nestedModalStyles.content,
          maxWidth: "600px", // Override pour la modification
        },
      }}
      contentLabel="Modifier un Docteur"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-2 right-2 text-red-500 font-bold"
      >
        X
      </button>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Modifier le Docteur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border p-2 rounded w-1/2"
              required
            />
            <input
              type="text"
              placeholder="Nom de famille"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border p-2 rounded w-1/2"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <div className="flex items-center">
            <label className="mr-2">Disponible</label>
            <input
              type="checkbox"
              checked={availability}
              onChange={(e) => setAvailability(e.target.checked)}
            />
          </div>
          <input
            type="date"
            placeholder="Date de naissance"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Département"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Spécialisation"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Expérience (années)"
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="border p-2 rounded w-1/2"
              required
            />
            <input
              type="number"
              placeholder="Frais de consultation"
              value={fee}
              onChange={(e) => setFee(Number(e.target.value))}
              className="border p-2 rounded w-1/2"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded mt-2 w-full"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </Modal>
  );
};

// ==============================
// 5) Modale de Suppression de Docteur
// ==============================
interface DeleteDoctorModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  doctorCount: number;
  onConfirmDelete: () => void;
}
const DeleteDoctorModal: React.FC<DeleteDoctorModalProps> = ({
  isOpen,
  onRequestClose,
  doctorCount,
  onConfirmDelete,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={nestedModalStyles}
      contentLabel="Supprimer Docteur"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-2 right-2 text-red-500 font-bold"
      >
        X
      </button>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">
          Voulez-vous supprimer ce(s) docteur(s) ?
        </h2>
        <p className="mb-4">
          Confirmez la suppression de {doctorCount} docteur(s).
        </p>
        <div className="flex space-x-2">
          <button
            onClick={onConfirmDelete}
            className="bg-red-500 text-white p-2 rounded"
          >
            Oui
          </button>
          <button
            onClick={onRequestClose}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Non
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ==============================
// 6) Composant Principal : Doctors
// ==============================
const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  useEffect(() => {
    fetch('http://localhost:3000/doctor')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }
        return response.json();
      })
      .then((data: Doctor[]) => setDoctors(data))
      .catch(error => console.error('Erreur:', error));
  }, []);

// Colonnes cochables
const [columns, setColumns] = useState([
  { name: "Nom et prénom", visible: true },
  { name: "Département", visible: true },
  { name: "Spécialisation", visible: true },
  { name: "Disponibilité", visible: true },
  { name: "Téléphone", visible: true },
  { name: "Expérience", visible: true },
  { name: "Frais", visible: true },
  { name: "Email", visible: true },
  { name: "Date de naissance", visible: true },
  { name: "Localisation", visible: true },
  { name: "Profil", visible: true },
]);

// Sélection multiple
const [selectedDoctors, setSelectedDoctors] = useState<number[]>([]);

// Barre de recherche
const [searchQuery, setSearchQuery] = useState("");

// États des modales
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

// Docteur à modifier ou afficher dans le profil
const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState<Doctor | null>(null);

// Menu déroulant pour les colonnes
const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

// Filtrage par nom (utilise firstName et lastName)
const filteredDoctors = doctors.filter((d) =>
  `${d.firstName} ${d.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
);

// --- Fonctions de gestion des modales ---
const handleOpenAddModal = () => setIsAddModalOpen(true);
const handleCloseAddModal = () => setIsAddModalOpen(false);

const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

const handleProfileClick = (doctor: Doctor) => {
  setSelectedDoctorForProfile(doctor);
  setIsProfileModalOpen(true);
};
const handleCloseProfileModal = () => {
  setIsProfileModalOpen(false);
  setSelectedDoctorForProfile(null);
};

const handleModifyDoctor = () => {
  if (selectedDoctors.length === 1) {
    const d = doctors.find((doc) => doc.id === selectedDoctors[0]);
    if (d) {
      setDoctorToEdit(d);
      setIsEditModalOpen(true);
    }
  }
};
const handleCloseEditModal = () => {
  setIsEditModalOpen(false);
  setDoctorToEdit(null);
};

// --- Fonctions de mise à jour des données ---
const handleAddDoctor = async (newDoctor: Doctor) => {
  try {
    const response = await fetch('http://localhost:3000/doctor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDoctor),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de l'ajout du docteur");
    }
    const addedDoctor = await response.json();
    
    setDoctors((prev) => [...prev, addedDoctor]);
  } catch (error) {
    console.error("Erreur lors de l'ajout du docteur:", error);
  }
};
// Mise à jour du state local avec le docteur renvoyé par l'API
// Modification d'un docteur dans la base de données via une requête PUT
const handleSaveDoctor = async (updatedDoctor: Doctor) => {
  try {
    const response = await fetch(`http://localhost:3000/doctor/${updatedDoctor.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedDoctor),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la modification du docteur");
    }
    const savedDoctor = await response.json();
    // Mise à jour du state local avec le docteur modifié
    setDoctors((prev) =>
      prev.map((d) => (d.id === savedDoctor.id ? savedDoctor : d))
    );
  } catch (error) {
    console.error("Erreur lors de la modification du docteur:", error);
  }
};

// Suppression d'un ou plusieurs docteurs dans la base de données via une requête DELETE
const handleDeleteDoctors = async () => {
  try {
    // Suppression individuelle pour chaque docteur sélectionné
    for (const id of selectedDoctors) {
      const response = await fetch(`http://localhost:3000/doctor/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression du docteur avec l'id ${id}`);
      }
    }
    // Mise à jour du state local après suppression
    setDoctors((prev) => prev.filter((d) => !selectedDoctors.includes(d.id)));
    setSelectedDoctors([]);
    handleCloseDeleteModal();
  } catch (error) {
    console.error("Erreur lors de la suppression des docteurs:", error);
  }
};

// Gestion des checkbox
const handleSelectDoctor = (doctorId: number) => {
  setSelectedDoctors((prev) =>
    prev.includes(doctorId)
      ? prev.filter((id) => id !== doctorId)
      : [...prev, doctorId]
  );
};
const handleSelectAll = () => {
  if (selectedDoctors.length === filteredDoctors.length) {
    setSelectedDoctors([]);
  } else {
    setSelectedDoctors(filteredDoctors.map((d) => d.id));
  }
};

// Menu déroulant pour les colonnes
const toggleColumn = (columnName: string) => {
  setColumns((prev) =>
    prev.map((col) =>
      col.name === columnName ? { ...col, visible: !col.visible } : col
    )
  );
};

// --- Export en Excel avec XLSX ---
const handleExportExcel = () => {
  const ws = XLSX.utils.json_to_sheet(filteredDoctors);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Docteurs");
  XLSX.writeFile(wb, "docteurs.xlsx");
};


return (
  <div className="p-4">
    {/* Barre de navigation */}
    <div className="flex items-center space-x-2 text-gray-700 mb-2">
      <FaHome />
      <span>&gt;</span>
      <span className="text-xl font-semibold">Docteur</span>
    </div>

    {/* Titre de la page */}
    <h1 className="text-2xl font-bold p-4">Docteur</h1>

    {/* Barre de recherche */}
    <div className="mb-4 flex items-center space-x-2">
      <FaSearch className="text-gray-500" />
      <input
        type="text"
        placeholder="Rechercher un docteur"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="p-2 border rounded"
      />
    </div>

    {/* Boutons d'actions */}
    <div className="flex items-center mb-4 space-x-2">
      <button
        onClick={handleOpenAddModal}
        className="bg-blue-500 text-white p-2 rounded flex items-center space-x-2"
      >
        <FaPlus />
        <span>Ajouter Docteur</span>
      </button>

      {selectedDoctors.length > 0 && (
        <>
          <button
            onClick={handleOpenDeleteModal}
            className="bg-red-500 text-white p-2 rounded flex items-center space-x-2"
          >
            <FaTrash />
            <span>Supprimer</span>
          </button>
          {selectedDoctors.length === 1 && (
            <button
              onClick={handleModifyDoctor}
              className="bg-yellow-500 text-white p-2 rounded flex items-center space-x-2"
            >
              <FaEdit />
              <span>Modifier</span>
            </button>
          )}
        </>
      )}

      {/* Bouton d'export en Excel */}
      <button
        onClick={handleExportExcel}
        className="bg-green-500 text-white p-2 rounded flex items-center space-x-2"
      >
        <FaFileExport />
        <span>Exporter Excel</span>
      </button>
    </div>

    {/* Menu déroulant pour la gestion des colonnes */}
    <div className="relative mb-4">
      <button
        onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
        className="bg-gray-300 text-black p-2 rounded flex items-center space-x-1"
      >
        <span>Gérer les colonnes</span>
        <FaChevronDown />
      </button>
      {showColumnsDropdown && (
        <div className="absolute z-10 bg-white border p-2 rounded shadow-md mt-2">
          {columns.map((col) => (
            <label key={col.name} className="flex items-center">
              <input
                type="checkbox"
                checked={col.visible}
                onChange={() => toggleColumn(col.name)}
                className="mr-1"
              />
              {col.name}
            </label>
          ))}
        </div>
      )}
    </div>

    {/* Tableau des docteurs */}
    <table className="min-w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border p-2">
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={
                selectedDoctors.length === filteredDoctors.length &&
                filteredDoctors.length > 0
              }
            />
          </th>
          {columns
            .filter((c) => c.visible)
            .map((col) => (
              <th key={col.name} className="border p-2">
                {col.name}
              </th>
            ))}
        </tr>
      </thead>
      <tbody>
        {filteredDoctors.map((doctor) => (
          <tr key={doctor.id}>
            <td className="border p-2">
              <input
                type="checkbox"
                checked={selectedDoctors.includes(doctor.id)}
                onChange={() => handleSelectDoctor(doctor.id)}
              />
            </td>
            {columns
              .filter((c) => c.visible)
              .map((col) => {
                switch (col.name) {
                  case "Nom et prénom":
                    return (
                      <td key={col.name} className="border p-2">
                        {doctor.firstName} {doctor.lastName}
                      </td>
                    );
                  case "Département":
                    return (
                      <td key={col.name} className="border p-2">
                        {doctor.department}
                      </td>
                    );
                  case "Spécialisation":
                    return (
                      <td key={col.name} className="border p-2">
                        {doctor.specialty.name}
                      </td>
                    );
                  case "Disponibilité":
                    return (
                      <td key={col.name} className="border p-2">
                        {doctor.availability ? "Disponible" : "Non disponible"}
                      </td>
                    );
                  case "Téléphone":
                    return (
                      <td key={col.name} className="border p-2">
                        {doctor.phoneNumber}
                      </td>
                    );
                  case "Expérience":
                    return (
                      <td key={col.name} className="border p-2">
                        {doctor.experience} ans
                      </td>
                    );
                  case "Frais":
                    return (
                      <td key={col.name} className="border p-2">
                        {doctor.fee} FCFA
                      </td>
                    );
                  case "Email":
                    return (
                      <td key={col.name} className="border p-2">
                        {doctor.mail}
                      </td>
                    );
                  case "Date de naissance":
                    return (
                      <td key={col.name} className="border p-2">
                        {doctor.birthday}
                      </td>
                    );
                  case "Localisation":
                    return (
                      <td key={col.name} className="border p-2">
                        {doctor.clinicLocation}
                      </td>
                    );
                  case "Profil":
                    return (
                      <td key={col.name} className="border p-2">
                        <button
                          onClick={() => handleProfileClick(doctor)}
                          className="text-blue-500"
                        >
                          Voir Profil
                        </button>
                      </td>
                    );
                  default:
                    return (
                      <td key={col.name} className="border p-2">
                        -
                      </td>
                    );
                }
              })}
          </tr>
        ))}
      </tbody>
    </table>

    {/* Modale d'ajout de docteur */}
    <AddDoctorModal
      isOpen={isAddModalOpen}
      onRequestClose={handleCloseAddModal}
      onAdd={handleAddDoctor}
    />

    {/* Modale de suppression de docteur */}
    <DeleteDoctorModal
      isOpen={isDeleteModalOpen}
      onRequestClose={handleCloseDeleteModal}
      doctorCount={selectedDoctors.length}
      onConfirmDelete={handleDeleteDoctors}
    />

    {/* Modale de modification de docteur */}
    <EditDoctorModal
      isOpen={isEditModalOpen}
      onRequestClose={handleCloseEditModal}
      doctor={doctorToEdit}
      onSave={handleSaveDoctor}
    />

    {/* Modale de profil du docteur */}
    <DoctorProfileModal
      isOpen={isProfileModalOpen}
      onRequestClose={handleCloseProfileModal}
      doctor={selectedDoctorForProfile}
    />
  </div>
);

};

export default Doctors;
