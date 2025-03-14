import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { saveAs } from "file-saver";
import "react-big-calendar/lib/css/react-big-calendar.css";
import * as XLSX from "xlsx";
import {
  FaHome,
  FaPlus,
  FaSync,
  FaDownload,
  FaEllipsisV,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

// -------------------- INTERFACES --------------------
export interface Appointment {
  id: number;
  patient: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    phoneNumber: string;
    userId?: number;
    // Optionnel : si vous souhaitez ajouter le genre directement dans patient
    gender?: string;
  };
  // 'start' correspond à la date de début.
  // Format souhaité (ex. DD-MM-YYYY) sera appliqué à l'affichage.
  start: Date;
}

export interface AppointmentRecord extends Appointment {
  doctor: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    availability: boolean;
    specialty: { id: number; name: string };
    userId?: number;
  };
  // Pour le patient, ces infos seront extraites de l'objet patient.
  genre?: string;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
  // Par défaut, lors de la création, le statut est "en attente".
  status: string;
  type: string;
  fournisseurAssurance?: string;
  remarques?: string;
  actes?: string;
}

// -------------------- CONFIGURATION --------------------
moment.locale("fr");
const localizer = momentLocalizer(moment);

const messages = {
  allDay: "Toute la journée",
  previous: "Précédent",
  next: "Suivant",
  today: "Aujourd'hui",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Agenda",
  date: "Date",
  time: "Heure",
  event: "Événement",
  noEventsInRange: "Aucun événement dans cette période.",
  showMore: (total: number) => `+ Voir plus (${total})`,
};

const allColumns = [
  "Nom",
  "Médecin",
  "Genre",
  "Date",
  "heure",
  "Mobile",
  "E-mail",
  "Statut",
  "Type de visite",
  "Fournisseur d'assurance",
  "Remarques",
  "Actes",
];

const defaultColumns = [
  "Nom",
  "Médecin",
  "Genre",
  "Date",
  "heure",
  "Mobile",
  "E-mail",
  "Statut",
  "Type de visite",
];

// -------------------- EDIT MODAL --------------------
interface EditModalProps {
  appointment: AppointmentRecord;
  onSave: (edited: AppointmentRecord) => void;
  onCancel: () => void;
}

const EditModal: React.FC<EditModalProps> = ({
  appointment,
  onSave,
  onCancel,
}) => {
  // Pour simplifier, on gère ici le nom complet du patient et du médecin sous forme de chaîne.
  const [patientName, setPatientName] = useState(
    `${appointment.patient.firstName} ${appointment.patient.lastName}`
  );
  const [doctorName, setDoctorName] = useState(
    `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
  );
  const [genre, setGenre] = useState(appointment.genre);
  const [start, setStart] = useState(
    moment(appointment.start).format("YYYY-MM-DDTHH:mm")
  );
  const [phoneNumber, setMobile] = useState(appointment.phoneNumber);
  const [email, setEmail] = useState(appointment.email);
  const [status, setStatus] = useState(appointment.status);
  const [type, setTypeVisite] = useState(appointment.type);
  const [fournisseurAssurance, setFournisseurAssurance] = useState(
    appointment.fournisseurAssurance || ""
  );
  const [remarques, setRemarques] = useState(appointment.remarques || "");
  const [actes, setActes] = useState(appointment.actes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientParts = patientName.trim().split(" ");
    const doctorParts = doctorName.trim().split(" ");
    const editedAppointment: AppointmentRecord = {
      ...appointment,
      patient: {
        ...appointment.patient,
        firstName: patientParts[0],
        lastName: patientParts.slice(1).join(" ") || "",
      },
      doctor: {
        ...appointment.doctor,
        firstName: doctorParts[0],
        lastName: doctorParts.slice(1).join(" ") || "",
      },
      genre,
      start: new Date(start),
      phoneNumber,
      email,
      status,
      type,
      fournisseurAssurance,
      remarques,
      actes,
    };
    onSave(editedAppointment);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Éditer le rendez-vous</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="w-full">
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Nom du patient"
            className="border p-2 rounded w-full"
            required
          />
        </div>
        <div className="flex space-x-4">
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="Médecin"
            className="border p-2 rounded w-1/2"
            required
          />
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre"
            className="border p-2 rounded w-1/2"
            required
          />
        </div>
        <div className="w-full">
          <label>
            Début :
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </label>
        </div>
        <div className="flex space-x-4">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile"
            className="border p-2 rounded w-1/2"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="border p-2 rounded w-1/2"
            required
          />
        </div>
        <div className="flex space-x-4">
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Statut"
            className="border p-2 rounded w-1/2"
            required
          />
          <input
            type="text"
            value={type}
            onChange={(e) => setTypeVisite(e.target.value)}
            placeholder="Type de visite"
            className="border p-2 rounded w-1/2"
            required
          />
        </div>
        <div className="w-full">
          <input
            type="text"
            value={fournisseurAssurance}
            onChange={(e) => setFournisseurAssurance(e.target.value)}
            placeholder="Fournisseur d'assurance"
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="w-full">
          <textarea
            value={remarques}
            onChange={(e) => setRemarques(e.target.value)}
            placeholder="Remarques"
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="w-full">
          <input
            type="text"
            value={actes}
            onChange={(e) => setActes(e.target.value)}
            placeholder="Actes"
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

// -------------------- ADD MODAL --------------------
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
}

interface AddModalProps {
  onSave: (appointment: AppointmentRecord) => void;
  onCancel: () => void;
  patients: Patient[] | null; // Patients peuvent être une liste ou null si aucune donnée disponible
  doctors: Doctor[] | null;  // Idem pour les docteurs
}

const AddModal: React.FC<AddModalProps> = ({ onSave, onCancel, patients, doctors }) => {
  const [patientFirstName, setPatientFirstName] = useState("");
  const [patientLastName, setPatientLastName] = useState("");
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [doctorLastName, setDoctorLastName] = useState("");
  const [genre, setGenre] = useState("");
  const [start, setStart] = useState("");
  const [phoneNumber, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const status = "en attente";
  const [type, setTypeVisite] = useState("");
  const [countryCode] = useState("+33");


  // Vérification si patients ou doctors sont null et affichage du message approprié
  if (!patients || !doctors) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto text-center relative">
        <p className="text-lg text-red-500">Les données sont indisponibles actuellement.</p>
        <p className="text-sm text-gray-500 mt-2">Veuillez réessayer plus tard.</p>
      </div>
    );
  }


  // Filtrer les patients et docteurs en fonction de l'entrée
  const filteredPatients = patients.filter((p: Patient) =>
    p?.firstName.toLowerCase().includes(patientFirstName.toLowerCase()) ||
    p?.lastName.toLowerCase().includes(patientLastName.toLowerCase())
  );
  
  const filteredDoctors = doctors.filter((d: Doctor) =>
    d?.firstName.toLowerCase().includes(doctorFirstName.toLowerCase()) ||
    d?.lastName.toLowerCase().includes(doctorLastName.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppointment: AppointmentRecord = {
      id: Date.now(),
      patient: {
        id: 0,
        firstName: patientFirstName,
        lastName: patientLastName,
        email: email,
        birthDate: "",
        phoneNumber: phoneNumber,
        userId: 0,
      },
      start: new Date(start),
      doctor: {
        id: 0,
        firstName: doctorFirstName,
        lastName: doctorLastName,
        email: "",
        availability: true,
        specialty: { id: 0, name: "" },
        userId: 0,
      },
      genre,
      countryCode,
      phoneNumber,
      email,
      status,
      type,
    };
    onSave(newAppointment);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Ajouter un rendez-vous</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient */}
        <input
          type="text"
          value={patientFirstName}
          onChange={(e) => setPatientFirstName(e.target.value)}
          placeholder="Prénom du patient"
          className="border p-2 rounded w-full"
          required
        />
        {patientFirstName && (
          <ul className="border rounded bg-white max-h-40 overflow-y-auto">
            {filteredPatients.map((p) => (
              <li
                key={p.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setPatientFirstName(p.firstName);
                  setPatientLastName(p.lastName);
                  setMobile(p.phoneNumber);
                  setEmail(p.email);
                }}
              >
                {p.firstName} {p.lastName}
              </li>
            ))}
          </ul>
        )}
        <input
          type="text"
          value={patientLastName}
          onChange={(e) => setPatientLastName(e.target.value)}
          placeholder="Nom du patient"
          className="border p-2 rounded w-full"
          required
        />

        {/* Docteur */}
        <input
          type="text"
          value={doctorFirstName}
          onChange={(e) => setDoctorFirstName(e.target.value)}
          placeholder="Prénom du médecin"
          className="border p-2 rounded w-full"
          required
        />
        {doctorFirstName && (
          <ul className="border rounded bg-white max-h-40 overflow-y-auto">
            {filteredDoctors.map((d) => (
              <li
                key={d.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setDoctorFirstName(d.firstName);
                  setDoctorLastName(d.lastName);
                }}
              >
                {d.firstName} {d.lastName}
              </li>
            ))}
          </ul>
        )}
        <input
          type="text"
          value={doctorLastName}
          onChange={(e) => setDoctorLastName(e.target.value)}
          placeholder="Nom du médecin"
          className="border p-2 rounded w-full"
          required
        />

        {/* Genre */}
        <input
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Genre"
          className="border p-2 rounded w-full"
          required
        />

        {/* Début */}
        <label>
          Début :
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </label>

        {/* Mobile */}
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Mobile"
          className="border p-2 rounded w-full"
          required
        />

        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="border p-2 rounded w-full"
          required
        />

        {/* Type de visite (présentiel ou téléconférence) */}
        <select
          value={type}
          onChange={(e) => setTypeVisite(e.target.value)}
          className="border p-2 rounded w-full"
          required
        >
          <option value="">Sélectionner un type</option>
          <option value="Présentiel">Présentiel</option>
          <option value="Téléconférence">Téléconférence</option>
        </select>

        {/* Boutons */}
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

// -------------------- COMPOSANT PRINCIPAL --------------------
const Appointmentsadmin: React.FC = () => {
  // Calendrier
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  // Données issues de l'API
  const [tableData, setTableData] = useState<AppointmentRecord[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showExtraMenu, setShowExtraMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentRecord | null>(null);
  const [deletingAppointment, setDeletingAppointment] =
    useState<AppointmentRecord | null>(null);
  const [addingAppointment, setAddingAppointment] = useState(false);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(tableData.map((item) => item.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const toggleColumn = (col: string) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter((c) => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(defaultColumns);

    const filteredData = tableData.filter((item) => {
      const firstName = item.patient?.firstName ?? "";
      const lastName = item.patient?.lastName ?? "";
      return `${firstName} ${lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    });
       

  // Récupération des rendez-vous via l'API
  const fetchAppointments = () => {
    axios
      .get<AppointmentRecord[]>("http://localhost:3000/appointments")
      .then((response) => {
        setTableData(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des rendez-vous :", error);
      });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RendezVous");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "rendezvous.xlsx");
  };

  const handleRefresh = () => {
    fetchAppointments();
  };

  const handleSaveNewAppointment = (newAppointment: AppointmentRecord) => {
    axios
      .post<AppointmentRecord>(
        "http://localhost:3000/appointments",
        newAppointment
      )
      .then((response) => {
        setTableData([...tableData, response.data]);
        setAddingAppointment(false);
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout du rendez-vous :", error);
      });
  };

  const handleSaveEditedAppointment = (edited: AppointmentRecord) => {
    axios
      .put<AppointmentRecord>(
        `http://localhost:3000/appointments/${edited.id}`,
        edited
      )
      .then((response) => {
        setTableData(
          tableData.map((item) => (item.id === edited.id ? response.data : item))
        );
        setEditingAppointment(null);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du rendez-vous :", error);
      });
  };

  const handleConfirmDelete = () => {
    if (deletingAppointment) {
      axios
        .delete(`http://localhost:3000/appointments/${deletingAppointment.id}`)
        .then(() => {
          setTableData(
            tableData.filter((item) => item.id !== deletingAppointment.id)
          );
          setDeletingAppointment(null);
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression du rendez-vous :", error);
        });
    }
  };

  const eventStyleGetter = (): { style: React.CSSProperties } => ({
    style: {
      backgroundColor: "#3B82F6",
      borderRadius: "4px",
      opacity: 0.9,
      color: "white",
      border: "0px",
      display: "block",
    },
  });

  const renderCell = (item: AppointmentRecord, col: string) => {
    switch (col) {
      case "Nom":
        return `${item.patient?.firstName} ${item.patient?.lastName}`;
      case "Médecin":
        return `${item.doctor.firstName} ${item.doctor.lastName}`;
      case "Genre":
        // On récupère le genre depuis l'objet patient s'il existe, sinon on utilise item.genre.
        return (item.patient)?.gender || item?.genre;
      case "Date":
        return moment(item.start).format("YYYY/MM/DD");
      case "heure":
        return moment(item.start).format("HH:mm:ss");
      case "Mobile":
        return item.patient?.phoneNumber;
      case "E-mail":
        return item.patient?.email;
      case "Statut":
        return item.status;
      case "Type de visite":
        return item.type;
      case "Fournisseur d'assurance":
        return item.fournisseurAssurance || "N/A";
      case "Remarques":
        return item.remarques || "N/A";
      case "Actes":
        return (
          <button
            onClick={() => setEditingAppointment(item)}
            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Gérer
          </button>
        );
      default:
        return "";
    }
  };

  return (
    <div className="p-4 relative">
      {/* Barre de navigation */}
      <div className="flex items-center space-x-2 text-gray-700 mb-4">
        <FaHome />
        <span>&gt;</span>
        <span className="text-xl font-semibold">Rendez-vous</span>
      </div>

      {/* Titre */}
      <h1 className="text-2xl font-bold mb-2">Rendez-vous</h1>

      {/* Calendrier */}
      <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
        Calendrier des rendez-vous
      </h2>
      <div className="h-[600px] bg-white shadow-md p-4 rounded-lg mb-8">
        <Calendar
          localizer={localizer}
          events={tableData.map((appt) => ({
            ...appt,
            title: `${appt.patient?.firstName} ${appt.patient?.lastName}`,
            end: new Date(new Date(appt.start).getTime() + 60 * 60 * 1000),
          }))}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          style={{ height: 500 }}
          messages={messages}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) =>
            setSelectedAppointment(event as Appointment)
          }
        />
      </div>

      {/* Carnet de rendez-vous */}
      <h2 className="text-2xl font-bold mb-4">Carnet de rendez-vous</h2>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAddingAppointment(true)}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            <FaPlus />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            <FaSync />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            <FaDownload />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExtraMenu(!showExtraMenu)}
              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              <FaEllipsisV />
            </button>
            {showExtraMenu && (
              <div className="absolute z-10 bg-white border p-2 rounded shadow-md">
                {allColumns.map((col) => (
                  <div key={col} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                      className="mr-1"
                    />
                    <span>{col}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Rechercher..."
            className="border rounded p-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border rounded p-1"
          >
            <option value={10}>10 premiers</option>
            <option value={15}>15 premiers</option>
            <option value={20}>20 premiers</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
              {selectedColumns.map((col) => (
                <th key={col} className="p-2 border">
                  {col}
                </th>
              ))}
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(0, itemsPerPage).map((item) => (
              <tr key={item.id} className="text-center">
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(item.id)}
                    onChange={() => toggleSelectRow(item.id)}
                  />
                </td>
                {selectedColumns.map((col) => (
                  <td key={col} className="p-2 border">
                    {renderCell(item, col)}
                  </td>
                ))}
                <td className="p-2 border">
                  <button
                    onClick={() => setEditingAppointment(item)}
                    className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition mr-1"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => setDeletingAppointment(item)}
                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal d'édition */}
      {editingAppointment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <EditModal
            appointment={editingAppointment}
            onSave={handleSaveEditedAppointment}
            onCancel={() => setEditingAppointment(null)}
          />
        </div>
      )}

      {/* Modal de suppression */}
      {deletingAppointment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              Voulez-vous supprimer{" "}
              {`${deletingAppointment.patient.firstName} ${deletingAppointment.patient.lastName}`} ?
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Oui
              </button>
              <button
                onClick={() => setDeletingAppointment(null)}
                className="flex-1 p-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {addingAppointment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <AddModal
            onSave={handleSaveNewAppointment}
            onCancel={() => setAddingAppointment(false)}
          />
        </div>
      )}

      {/* Modal du calendrier */}
      {selectedAppointment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 transition-transform transform scale-100">
            <h2 className="text-xl font-bold">
              Rendez-vous avec{" "}
              {`${selectedAppointment.patient.firstName} ${selectedAppointment.patient.lastName}`}
            </h2>
            <p className="text-gray-600">
              Date :{" "}
              {moment(selectedAppointment.start).format(
                "DD MMMM YYYY, HH:mm"
              )}
            </p>
            <button
              onClick={() => setSelectedAppointment(null)}
              className="mt-4 p-2 bg-red-500 text-white rounded w-full hover:bg-red-600 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointmentsadmin;
