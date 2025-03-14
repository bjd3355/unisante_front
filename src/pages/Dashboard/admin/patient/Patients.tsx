import React, { useState, useEffect } from "react";
import Modal, { Styles } from "react-modal";
import axios from 'axios';
import {
  FaHome,
  FaPlus,
  FaTrash,
  FaSearch,
  FaFileAlt,
  FaEdit,
  FaChevronDown,
} from "react-icons/fa";

// Configuration de react-modal
Modal.setAppElement("#root");

// ==============================
// 1) Interfaces
// ==============================
// Interface pour un rendez-vous
interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  type: string;
  doctorId: number;
  patientId: number;
}

// Interface pour un patient
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  birthDate?: string;
  phoneNumber?: string;
  image?: string;
  userId?: number;
  gender?: string;
  treatment: string;
  doctor: string;
  address: string;
  bloodGroup: string;
  dischargeDate: string;
  status: string;
  profilePic?: string;
  documents?: string[];
  about?: string;
  appointments?: Appointment[];
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

// Props pour la modale de profil
interface ProfileModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  patient: Patient | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onRequestClose, patient }) => {
  // Gestion locale des rendez-vous pour modification/suppression
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);
  const [appointmentToEdit, setAppointmentToEdit] = useState<{ index: number; data: Appointment } | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<{ index: number; data: Appointment } | null>(null);

  useEffect(() => {
    if (patient && patient.appointments) {
      setLocalAppointments(patient.appointments);
    }
  }, [patient]);

  // ----- Modale imbriquée d'édition d'un rendez-vous -----
  interface EditAppointmentModalProps {
    isOpen: boolean;
    appointment: Appointment;
    onRequestClose: () => void;
    onSave: (updatedAppointment: Appointment) => void;
  }
  const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
    isOpen,
    appointment,
    onRequestClose,
    onSave,
  }) => {
    const [date, setDate] = useState(appointment.date);
    const [time, setTime] = useState(appointment.time);
    const [status, setStatus] = useState(appointment.status);
    const [type, setType] = useState(appointment.type);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({ ...appointment, date, time, status, type });
      onRequestClose();
    };

    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        style={profileModalStyles}
        contentLabel="Modifier le rendez-vous"
      >
        <button onClick={onRequestClose} className="absolute top-2 right-2 text-red-500 font-bold">
          X
        </button>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Modifier le rendez-vous</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Statut"
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Type"
              className="border p-2 rounded w-full"
              required
            />
            <div className="flex space-x-2">
              <button type="submit" className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
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

  // ----- Modale imbriquée de suppression d'un rendez-vous -----
  interface DeleteAppointmentModalProps {
    isOpen: boolean;
    appointment: Appointment;
    onRequestClose: () => void;
    onConfirm: () => void;
  }
  const DeleteAppointmentModal: React.FC<DeleteAppointmentModalProps> = ({
    isOpen,
    appointment,
    onRequestClose,
    onConfirm,
  }) => {
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        style={profileModalStyles}
        contentLabel="Supprimer le rendez-vous"
      >
        <button onClick={onRequestClose} className="absolute top-2 right-2 text-red-500 font-bold">
          X
        </button>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Supprimer le rendez-vous</h2>
          <p className="mb-4">
            Voulez-vous vraiment supprimer le rendez-vous du {appointment.date} à {appointment.time} ?
          </p>
          <div className="flex space-x-2">
            <button onClick={onConfirm} className="bg-red-500 text-white p-2 rounded">
              Oui
            </button>
            <button onClick={onRequestClose} className="bg-gray-500 text-white p-2 rounded">
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
      // Supposons que profileModalStyles est défini ailleurs
      style={profileModalStyles}
      contentLabel="Profil du patient"
    >
      <button onClick={onRequestClose} className="absolute top-3 right-4 text-red-500 font-bold text-xl">
        X
      </button>
      <div className="flex flex-col md:flex-row">
        {/* Partie gauche : Photo et infos rapides */}
        <div className="w-full md:w-1/3 bg-gray-100 p-4 flex flex-col items-center">
          <img
            src={`http://localhost:3000${patient.profilePic ||patient?.image || "https://via.placeholder.com/150"}`} 
            alt="Profil"
            className="w-36 h-36 object-cover rounded-full mb-4"
          />
          <h2 className="text-xl font-semibold">{patient.firstName}</h2>
          {/* Ajoutez d'autres infos si nécessaire */}
        </div>

        {/* Partie droite : Détails et historique des rendez-vous */}
        <div className="w-full md:w-2/3 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">À propos</h3>
            <p className="text-gray-700">
              {patient.about || "Le patient n'a encore mis aucune description."}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Historique des rendez-vous</h3>
            <table className="min-w-full border text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Heure</th>
                  <th className="p-2">Statut</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {localAppointments && localAppointments.length > 0 ? (
                  localAppointments.map((appointment, index) => (
                    <tr key={appointment.id} className="border-b">
                      <td className="p-2">{appointment.date}</td>
                      <td className="p-2">{appointment.time}</td>
                      <td className="p-2">{appointment.status}</td>
                      <td className="p-2">{appointment.type}</td>
                      <td className="p-2 flex space-x-2">
                        {/* Option de modification retirée */}
                        <button
                          onClick={() => setAppointmentToDelete({ index, data: appointment })}
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
                      Aucun rendez-vous enregistré
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {appointmentToEdit && (
        <EditAppointmentModal
          isOpen={true}
          appointment={appointmentToEdit.data}
          onRequestClose={() => setAppointmentToEdit(null)}
          onSave={(updatedAppointment) => {
            setLocalAppointments((prev) =>
              prev.map((a, i) => (i === appointmentToEdit.index ? updatedAppointment : a))
            );
            setAppointmentToEdit(null);
          }}
        />
      )}
      {appointmentToDelete && (
        <DeleteAppointmentModal
          isOpen={true}
          appointment={appointmentToDelete.data}
          onRequestClose={() => setAppointmentToDelete(null)}
          onConfirm={() => {
            setLocalAppointments((prev) =>
              prev.filter((_, i) => i !== appointmentToDelete.index)
            );
            setAppointmentToDelete(null);
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [treatment, setTreatment] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
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
      firstName,
      lastName,
      email,
      birthDate,
      phoneNumber,
      gender,
      treatment,
      doctor,
      address,
      bloodGroup,
      dischargeDate,
      status,
      profilePic: "https://via.placeholder.com/150",
      appointments: [],
    };
    onAdd(newPatient);
    onRequestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={profileModalStyles}
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
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border p-2 rounded w-1/2"
              required
            />
          </div>
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
              placeholder="Téléphone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="date"
              placeholder="Date de naissance"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [treatment, setTreatment] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [doctor, setDoctor] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [dischargeDate, setDischargeDate] = useState("");
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (patient) {
      setFirstName(patient.firstName);
      setLastName(patient.lastName);
      setTreatment(patient.treatment);
      setGender(patient.gender || "");
      setPhoneNumber(patient.phoneNumber || "");
      setBirthDate(patient.birthDate || "");
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
      firstName,
      lastName,
      treatment,
      gender,
      phoneNumber,
      birthDate,
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
      style={profileModalStyles}
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
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border p-2 rounded w-1/2"
              required
            />
          </div>
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
              placeholder="Téléphone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="date"
              placeholder="Date de naissance"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
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
      style={profileModalStyles}
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
  const [patients, setPatients] = useState<Patient[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Appel API pour récupérer les patients
        const patientsResponse = await axios.get("http://localhost:3000/patient");
        // Appel API pour récupérer les rendez-vous
        const appointmentsResponse = await axios.get("http://localhost:3000/appointments");

        const patientsData: Patient[] = patientsResponse.data;
        const appointmentsData: Appointment[] = appointmentsResponse.data;

        // Fusion des rendez-vous avec chaque patient en fonction de patientId
        const mergedPatients = patientsData.map((patient) => ({
          ...patient,
          appointments: appointmentsData.filter(
            (appointment) => appointment.patientId === patient.id
          ),
        }));

        setPatients(mergedPatients);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    };

    fetchData();
  }, []);
// Définition des colonnes avec visibilité
const [columns, setColumns] = useState([
  { name: "Prénom et Nom", visible: true },
  { name: "Traitement", visible: true },
  { name: "Genre", visible: true },
  { name: "Téléphone", visible: true },
  { name: "Date de naissance", visible: true },
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

// Filtrage des patients par recherche (recherche sur prénom et nom)
const filteredPatients = patients.filter((p) =>
  `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
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
const handleAddPatient = async (newPatient: Patient) => {
  try {
    const response = await axios.post("http://localhost:3000/patient", newPatient);
    setPatients((prev) => [...prev, response.data]); // Met à jour l'état local avec la réponse du serveur
  } catch (error) {
    console.error("Erreur lors de l'ajout du patient :", error);
  }
};


const handleSavePatient = async (updatedPatient: Patient) => {
  try {
    await axios.put(`http://localhost:3000/patient/${updatedPatient.id}`, updatedPatient);
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
  } catch (error) {
    console.error("Erreur lors de la modification du patient :", error);
  }
};

const handleDeletePatients = async () => {
  try {
    await Promise.all(
      selectedPatients.map((id) =>
        axios.delete(`http://localhost:3000/patient/${id}`)
      )
    );
    setPatients((prev) => prev.filter((p) => !selectedPatients.includes(p.id)));
    setSelectedPatients([]);
    handleCloseDeleteModal();
  } catch (error) {
    console.error("Erreur lors de la suppression du patient :", error);
  }
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
              <FaEdit />
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
                if (col.name === "Prénom et Nom")
                  return (
                    <td key={col.name} className="border p-2">
                      {patient.firstName} {patient.lastName}
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
                if (col.name === "Téléphone")
                  return (
                    <td key={col.name} className="border p-2">
                      {patient.phoneNumber}
                    </td>
                  );
                if (col.name === "Date de naissance")
                  return (
                    <td key={col.name} className="border p-2">
                      {patient.birthDate}
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
