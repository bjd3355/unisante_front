import React, { useState, useEffect } from "react";
import Modal, { Styles } from "react-modal";
import {
  FaHome,
  FaPlus,
  FaTrash,
  FaSearch,
  FaFileAlt,
  FaChevronDown,
} from "react-icons/fa";

// Configuration de react-modal
Modal.setAppElement("#root");

// ==============================
// 1) Interfaces
// ==============================
interface Visit {
  date: string;
  doctor: string;
  treatment: string;
  cost: number;
}

interface Patient {
  id: number;
  name: string;
  treatment: string;
  gender: string;
  mobile: string;
  admissionDate: string;
  doctor: string;
  address: string;
  bloodGroup: string;
  dischargeDate: string;
  status: string;
  profilePic?: string;
  email?: string;
  documents?: string[];
  about?: string;
  visits?: Visit[];
}

// ==============================
// 2) Modale de Profil avec modales imbriquées pour édition/suppression d'une visite
// ==============================
interface ProfileModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  patient: Patient | null;
}

// Styles de la modale principale (Profil)
const profileModalStyles: Styles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: "1000px",
    maxHeight: "90vh",
    overflowY: "auto",
    borderRadius: "8px",
    padding: "0",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
  },
};

// Styles pour les modales imbriquées ou plus petites (Ajout, Edit, Delete)
const nestedModalStyles: Styles = {
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
    zIndex: 11000, // supérieur à la modale principale
  },
};

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onRequestClose,
  patient,
}) => {
  // Gestion locale des visites pour modification/suppression
  const [localVisits, setLocalVisits] = useState<Visit[]>([]);
  const [visitToEdit, setVisitToEdit] = useState<{ index: number; data: Visit } | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<{ index: number; data: Visit } | null>(null);

  useEffect(() => {
    if (patient && patient.visits) {
      setLocalVisits(patient.visits);
    }
  }, [patient]);

  // ----- Modale imbriquée d'édition d'une visite (non accessible via l'UI, mais conservée) -----
  interface EditVisitModalProps {
    isOpen: boolean;
    visit: Visit;
    onRequestClose: () => void;
    onSave: (updatedVisit: Visit) => void;
  }
  const EditVisitModal: React.FC<EditVisitModalProps> = ({
    isOpen,
    visit,
    onRequestClose,
    onSave,
  }) => {
    const [date, setDate] = useState(visit.date);
    const [doctor, setDoctor] = useState(visit.doctor);
    const [treatment, setTreatment] = useState(visit.treatment);
    const [cost, setCost] = useState(visit.cost);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({ date, doctor, treatment, cost });
      onRequestClose();
    };

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        style={nestedModalStyles}
        contentLabel="Modifier la visite"
      >
        <button
          onClick={onRequestClose}
          className="absolute top-2 right-2 text-red-500 font-bold"
        >
          X
        </button>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Modifier la visite</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="Médecin"
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="text"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Traitement"
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              placeholder="Frais (FCFA)"
              className="border p-2 rounded w-full"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={onRequestClose}
                className="flex-1 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </Modal>
    );
  };

  // ----- Modale imbriquée de suppression d'une visite -----
  interface DeleteVisitModalProps {
    isOpen: boolean;
    visit: Visit;
    onRequestClose: () => void;
    onConfirm: () => void;
  }
  const DeleteVisitModal: React.FC<DeleteVisitModalProps> = ({
    isOpen,
    visit,
    onRequestClose,
    onConfirm,
  }) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        style={nestedModalStyles}
        contentLabel="Supprimer la visite"
      >
        <button
          onClick={onRequestClose}
          className="absolute top-2 right-2 text-red-500 font-bold"
        >
          X
        </button>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Supprimer la visite</h2>
          <p className="mb-4">
            Voulez-vous vraiment supprimer la visite du {visit.date} ?
          </p>
          <div className="flex space-x-2">
            <button
              onClick={onConfirm}
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

  if (!patient) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={profileModalStyles}
      contentLabel="Profil du patient"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-3 right-4 text-red-500 font-bold text-xl"
      >
        X
      </button>
      <div className="flex flex-col md:flex-row">
        {/* Partie gauche : Photo et infos rapides */}
        <div className="w-full md:w-1/3 bg-gray-100 p-4 flex flex-col items-center">
          <img
            src={patient.profilePic || "https://via.placeholder.com/150"}
            alt="Profil"
            className="w-36 h-36 object-cover rounded-full mb-4"
          />
          <h2 className="text-xl font-semibold">{patient.name}</h2>
          <p className="text-gray-500">{patient.gender}</p>
          <p className="mt-2 text-gray-600">{patient.address}</p>
          <p className="text-gray-600">{patient.mobile}</p>
          <p className="text-gray-600">{patient.email}</p>
        </div>

        {/* Partie droite : À propos, rapport général et historique des visites */}
        <div className="w-full md:w-2/3 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">À propos</h3>
            <p className="text-gray-700">
              {patient.about ||
                "Ici, vous pouvez afficher une description détaillée du patient."}
            </p>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Rapport général</h3>
            <div className="flex items-center mb-2">
              <span className="w-1/4">Battement de cœur</span>
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5 ml-2">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <span className="w-1/4">Pression artérielle</span>
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5 ml-2">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <span className="w-1/4">Sucre</span>
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5 ml-2">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "50%" }}></div>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <span className="w-1/4">Hémoglobine</span>
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5 ml-2">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Historique des visites passées</h3>
            <table className="min-w-full border text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Médecin</th>
                  <th className="p-2">Traitement</th>
                  <th className="p-2">Frais (FCFA)</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {localVisits && localVisits.length > 0 ? (
                  localVisits.map((visit, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{visit.date}</td>
                      <td className="p-2">{visit.doctor}</td>
                      <td className="p-2">{visit.treatment}</td>
                      <td className="p-2">{visit.cost}</td>
                      <td className="p-2 flex space-x-2">
                        {/* Option de modification retirée */}
                        <button
                          onClick={() => setVisitToDelete({ index, data: visit })}
                          className="text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-2">
                      Aucune visite enregistrée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {visitToEdit && (
        <EditVisitModal
          isOpen={true}
          visit={visitToEdit.data}
          onRequestClose={() => setVisitToEdit(null)}
          onSave={(updatedVisit) => {
            setLocalVisits((prev) =>
              prev.map((v, i) =>
                i === visitToEdit.index ? updatedVisit : v
              )
            );
            setVisitToEdit(null);
          }}
        />
      )}
      {visitToDelete && (
        <DeleteVisitModal
          isOpen={true}
          visit={visitToDelete.data}
          onRequestClose={() => setVisitToDelete(null)}
          onConfirm={() => {
            setLocalVisits((prev) =>
              prev.filter((_, i) => i !== visitToDelete.index)
            );
            setVisitToDelete(null);
          }}
        />
      )}
    </Modal>
  );
};

// ==============================
// 3) Modale d'Ajout de Patient (mise à jour)
// ==============================
interface AddPatientModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onAdd: (newPatient: Patient) => void;
}
const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onRequestClose,
  onAdd,
}) => {
  const [name, setName] = useState("");
  const [treatment, setTreatment] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [doctor, setDoctor] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [dischargeDate, setDischargeDate] = useState("");
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: Date.now(),
      name,
      treatment,
      gender,
      mobile,
      admissionDate,
      doctor,
      address,
      bloodGroup,
      dischargeDate,
      status,
      email,
      profilePic: "https://via.placeholder.com/150",
      visits: [],
    };
    onAdd(newPatient);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={nestedModalStyles}
      contentLabel="Ajouter un Patient"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-2 right-2 text-red-500 font-bold"
      >
        X
      </button>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Ajouter un Patient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Traitement"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Genre"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
            <input
              type="text"
              placeholder="Mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="date"
              placeholder="Date d'admission"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
            <input
              type="date"
              placeholder="Date de sortie"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Médecin désigné"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
            <input
              type="text"
              placeholder="Groupe sanguin"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
          </div>
          <input
            type="text"
            placeholder="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Statut"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded mt-2"
          >
            Ajouter
          </button>
        </form>
      </div>
    </Modal>
  );
};

// ==============================
// 4) Modale de Modification de Patient (mise à jour)
// ==============================
interface EditPatientModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  patient: Patient | null;
  onSave: (updatedPatient: Patient) => void;
}
const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onRequestClose,
  patient,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [treatment, setTreatment] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [doctor, setDoctor] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [dischargeDate, setDischargeDate] = useState("");
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setTreatment(patient.treatment);
      setGender(patient.gender);
      setMobile(patient.mobile);
      setAdmissionDate(patient.admissionDate);
      setDoctor(patient.doctor);
      setAddress(patient.address);
      setBloodGroup(patient.bloodGroup);
      setDischargeDate(patient.dischargeDate);
      setStatus(patient.status);
      setEmail(patient.email || "");
    }
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    const updated: Patient = {
      ...patient,
      name,
      treatment,
      gender,
      mobile,
      admissionDate,
      doctor,
      address,
      bloodGroup,
      dischargeDate,
      status,
      email,
    };
    onSave(updated);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={nestedModalStyles}
      contentLabel="Modifier le Patient"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-2 right-2 text-red-500 font-bold"
      >
        X
      </button>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Modifier le Patient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="text"
            placeholder="Traitement"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Genre"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
            <input
              type="text"
              placeholder="Mobile"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="date"
              placeholder="Date d'admission"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
            <input
              type="date"
              placeholder="Date de sortie"
              value={dischargeDate}
              onChange={(e) => setDischargeDate(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Médecin désigné"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
            <input
              type="text"
              placeholder="Groupe sanguin"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
          </div>
          <input
            type="text"
            placeholder="Adresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Statut"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded mt-2"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </Modal>
  );
};

// ==============================
// 5) Modale de Suppression de Patient (mise à jour)
// ==============================
interface DeletePatientModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  patientCount: number;
  onConfirmDelete: () => void;
}
const DeletePatientModal: React.FC<DeletePatientModalProps> = ({
  isOpen,
  onRequestClose,
  patientCount,
  onConfirmDelete,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={nestedModalStyles}
      contentLabel="Supprimer Patient"
    >
      <button
        onClick={onRequestClose}
        className="absolute top-2 right-2 text-red-500 font-bold"
      >
        X
      </button>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">
          Voulez-vous supprimer ce(s) patient(s) ?
        </h2>
        <p className="mb-4">
          Confirmez la suppression de {patientCount} patient(s).
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
// 6) Composant Principal : Patients
// ==============================
const Patients: React.FC = () => {
  // Liste des patients
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1,
      name: "John Doe",
      treatment: "Malaria",
      gender: "Homme",
      mobile: "123456789",
      admissionDate: "2025-02-01",
      doctor: "Dr. Smith",
      address: "123 Main St",
      bloodGroup: "O+",
      dischargeDate: "2025-02-10",
      status: "Sous traitement",
      profilePic: "https://via.placeholder.com/150",
      email: "john.doe@example.com",
      documents: ["document1.pdf", "document2.pdf"],
      about: "Patient suivi pour un traitement de la malaria.",
      visits: [
        { date: "2025-02-01", doctor: "Dr. Smith", treatment: "Hospitalisation", cost: 8000 },
        { date: "2025-02-05", doctor: "Dr. Smith", treatment: "Contrôle", cost: 2000 },
      ],
    },
    // D'autres patients peuvent être ajoutés ici...
  ]);

  // Définition des colonnes avec visibilité
  const [columns, setColumns] = useState([
    { name: "Nom", visible: true },
    { name: "Traitement", visible: true },
    { name: "Genre", visible: true },
    { name: "Mobile", visible: true },
    { name: "Date d'admission", visible: true },
    { name: "Médecin désigné", visible: true },
    { name: "Adresse", visible: true },
    { name: "Groupe sanguin", visible: true },
    { name: "Date de sortie", visible: true },
    { name: "Statut", visible: true },
    { name: "Document", visible: true },
    { name: "Profil", visible: true },
  ]);

  // Gestion de la sélection via checkbox
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  // Barre de recherche
  const [searchQuery, setSearchQuery] = useState("");

  // États pour les modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Patient à modifier ou afficher dans le profil
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [selectedPatientForProfile, setSelectedPatientForProfile] = useState<Patient | null>(null);

  // Pour le menu déroulant des colonnes
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

  // Filtrage des patients par recherche
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Fonctions de gestion des modales ---
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleProfileClick = (patient: Patient) => {
    setSelectedPatientForProfile(patient);
    setIsProfileModalOpen(true);
  };
  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedPatientForProfile(null);
  };

  const handleModifyPatient = () => {
    if (selectedPatients.length === 1) {
      const p = patients.find((p) => p.id === selectedPatients[0]);
      if (p) {
        setPatientToEdit(p);
        setIsEditModalOpen(true);
      }
    }
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setPatientToEdit(null);
  };

  // --- Fonctions de mise à jour des données ---
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prev) => [...prev, newPatient]);
  };

  const handleSavePatient = (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  };

  const handleDeletePatients = () => {
    setPatients((prev) => prev.filter((p) => !selectedPatients.includes(p.id)));
    setSelectedPatients([]);
    handleCloseDeleteModal();
  };

  // Gestion des checkbox
  const handleSelectPatient = (patientId: number) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };
  const handleSelectAll = () => {
    if (selectedPatients.length === filteredPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map((p) => p.id));
    }
  };

  // Gestion du menu déroulant pour les colonnes
  const toggleColumn = (columnName: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.name === columnName ? { ...col, visible: !col.visible } : col
      )
    );
  };

  return (
    <div className="p-4">
      {/* Barre de navigation */}
      <div className="flex items-center space-x-2 text-gray-700">
        <FaHome />
        <span>&gt;</span>
        <span className="text-xl font-semibold">Patient</span>
      </div>

      {/* Titre de la page */}
      <h1 className="text-2xl font-bold p-4">Patient</h1>

      {/* Barre de recherche */}
      <div className="mb-4 flex items-center space-x-2">
        <FaSearch className="text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher un patient"
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
          <span>Ajouter Patient</span>
        </button>

        {selectedPatients.length > 0 && (
          <>
            <button
              onClick={handleOpenDeleteModal}
              className="bg-red-500 text-white p-2 rounded flex items-center space-x-2"
            >
              <FaTrash />
              <span>Supprimer</span>
            </button>
            {selectedPatients.length === 1 && (
              <button
                onClick={handleModifyPatient}
                className="bg-yellow-500 text-white p-2 rounded flex items-center space-x-2"
              >
                <FaTrash />
                <span>Modifier</span>
              </button>
            )}
          </>
        )}
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

      {/* Tableau des patients */}
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border p-2">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  selectedPatients.length === filteredPatients.length &&
                  filteredPatients.length > 0
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
          {filteredPatients.map((patient) => (
            <tr key={patient.id}>
              <td className="border p-2">
                <input
                  type="checkbox"
                  checked={selectedPatients.includes(patient.id)}
                  onChange={() => handleSelectPatient(patient.id)}
                />
              </td>
              {columns
                .filter((c) => c.visible)
                .map((col) => {
                  if (col.name === "Nom")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.name}
                      </td>
                    );
                  if (col.name === "Traitement")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.treatment}
                      </td>
                    );
                  if (col.name === "Genre")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.gender}
                      </td>
                    );
                  if (col.name === "Mobile")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.mobile}
                      </td>
                    );
                  if (col.name === "Date d'admission")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.admissionDate}
                      </td>
                    );
                  if (col.name === "Médecin désigné")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.doctor}
                      </td>
                    );
                  if (col.name === "Adresse")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.address}
                      </td>
                    );
                  if (col.name === "Groupe sanguin")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.bloodGroup}
                      </td>
                    );
                  if (col.name === "Date de sortie")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.dischargeDate}
                      </td>
                    );
                  if (col.name === "Statut")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.status}
                      </td>
                    );
                  if (col.name === "Document")
                    return (
                      <td key={col.name} className="border p-2">
                        {patient.documents && patient.documents.length > 0 ? (
                          <FaFileAlt className="text-blue-500" />
                        ) : (
                          "Aucun document"
                        )}
                      </td>
                    );
                  if (col.name === "Profil")
                    return (
                      <td key={col.name} className="border p-2">
                        <button
                          onClick={() => handleProfileClick(patient)}
                          className="text-blue-500"
                        >
                          Voir Profil
                        </button>
                      </td>
                    );
                  return (
                    <td key={col.name} className="border p-2">
                      N/A
                    </td>
                  );
                })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modale d'ajout de patient */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onRequestClose={handleCloseAddModal}
        onAdd={handleAddPatient}
      />

      {/* Modale de suppression de patient */}
      <DeletePatientModal
        isOpen={isDeleteModalOpen}
        onRequestClose={handleCloseDeleteModal}
        patientCount={selectedPatients.length}
        onConfirmDelete={handleDeletePatients}
      />

      {/* Modale de modification de patient */}
      <EditPatientModal
        isOpen={isEditModalOpen}
        onRequestClose={handleCloseEditModal}
        patient={patientToEdit}
        onSave={handleSavePatient}
      />

      {/* Modale de profil (incluant ses modales imbriquées) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onRequestClose={handleCloseProfileModal}
        patient={selectedPatientForProfile}
      />
    </div>
  );
};

export default Patients;
