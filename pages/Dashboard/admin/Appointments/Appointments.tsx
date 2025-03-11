import React, { useState } from "react";
import {
  FaHome,
  FaPlus,
  FaSync,
  FaDownload,
  FaEllipsisV,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Appointment {
  id: number;
  patient: string;
  start: Date;
  end: Date;
}

export interface AppointmentRecord extends Appointment {
  docteur: string;
  genre: string;
  countryCode: string;
  mobile: string;
  email: string;
  status: string;
  typeVisite: string;
  blessure?: string;
  statutPaiement?: string;
  fournisseurAssurance?: string;
  remarques?: string;
  actes?: string;
}

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
  "Blessure",
  "E-mail",
  "Statut",
  "Type de visite",
  "Statut de paiement",
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

const initialTableData: AppointmentRecord[] = [
  {
    id: 1,
    patient: "Jean Dupont",
    docteur: "Dr. Martin",
    genre: "Homme",
    countryCode: "+33",
    start: new Date("2025-03-10T10:00:00"),
    end: new Date("2025-03-10T11:00:00"),
    mobile: "0123456789",
    email: "jean.dupont@mail.com",
    status: "Confirmé",
    typeVisite: "Consultation",
    blessure: "N/A",
    statutPaiement: "Payé",
    fournisseurAssurance: "AXA",
    remarques: "Aucune",
    actes: "Voir",
  },
  {
    id: 2,
    patient: "Alice Durand",
    docteur: "Dr. Bernard",
    genre: "Femme",
    countryCode: "+33",
    start: new Date("2025-03-12T11:30:00"),
    end: new Date("2025-03-12T12:30:00"),
    mobile: "0987654321",
    email: "alice.durand@mail.com",
    status: "En attente",
    typeVisite: "Suivi",
    blessure: "N/A",
    statutPaiement: "Non payé",
    fournisseurAssurance: "MAIF",
    remarques: "À vérifier",
    actes: "Voir",
  },
];

//
// Composant EditModal : permet de modifier un rendez-vous existant
//
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
  const [patient, setPatient] = useState(appointment.patient);
  const [docteur, setDocteur] = useState(appointment.docteur);
  const [genre, setGenre] = useState(appointment.genre);
  const [start, setStart] = useState(
    moment(appointment.start).format("YYYY-MM-DDTHH:mm")
  );
  const [end, setEnd] = useState(
    moment(appointment.end).format("YYYY-MM-DDTHH:mm")
  );
  const [mobile, setMobile] = useState(appointment.mobile);
  const [email, setEmail] = useState(appointment.email);
  const [status, setStatus] = useState(appointment.status);
  const [typeVisite, setTypeVisite] = useState(appointment.typeVisite);
  const [blessure, setBlessure] = useState(appointment.blessure || "");
  const [statutPaiement, setStatutPaiement] = useState(
    appointment.statutPaiement || ""
  );
  const [fournisseurAssurance, setFournisseurAssurance] = useState(
    appointment.fournisseurAssurance || ""
  );
  const [remarques, setRemarques] = useState(appointment.remarques || "");
  const [actes, setActes] = useState(appointment.actes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const editedAppointment: AppointmentRecord = {
      ...appointment,
      patient,
      docteur,
      genre,
      start: new Date(start),
      end: new Date(end),
      mobile,
      email,
      status,
      typeVisite,
      blessure,
      statutPaiement,
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
        {/* Ligne 1 : Champ sur toute la ligne */}
        <div className="w-full">
          <input
            type="text"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder="Nom du patient"
            className="border p-2 rounded w-full"
            required
          />
        </div>
        {/* Ligne 2 : Deux champs côte à côte */}
        <div className="flex space-x-4">
          <input
            type="text"
            value={docteur}
            onChange={(e) => setDocteur(e.target.value)}
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
        {/* Ligne 3 : Dates côte à côte */}
        <div className="flex space-x-4">
          <label className="w-1/2">
            Début :
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </label>
          <label className="w-1/2">
            Fin :
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </label>
        </div>
        {/* Ligne 4 : Mobile et Email */}
        <div className="flex space-x-4">
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile"
            className="border p-2 rounded w-1/2"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border p-2 rounded w-1/2"
            required
          />
        </div>
        {/* Ligne 5 : Statut et Type de visite */}
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
            value={typeVisite}
            onChange={(e) => setTypeVisite(e.target.value)}
            placeholder="Type de visite"
            className="border p-2 rounded w-1/2"
            required
          />
        </div>
        {/* Ligne 6 : Blessure sur une ligne entière */}
        <div className="w-full">
          <input
            type="text"
            value={blessure}
            onChange={(e) => setBlessure(e.target.value)}
            placeholder="Blessure"
            className="border p-2 rounded w-full"
          />
        </div>
        {/* Ligne 7 : Statut de paiement et Fournisseur d'assurance */}
        <div className="flex space-x-4">
          <input
            type="text"
            value={statutPaiement}
            onChange={(e) => setStatutPaiement(e.target.value)}
            placeholder="Statut de paiement"
            className="border p-2 rounded w-1/2"
          />
          <input
            type="text"
            value={fournisseurAssurance}
            onChange={(e) => setFournisseurAssurance(e.target.value)}
            placeholder="Fournisseur d'assurance"
            className="border p-2 rounded w-1/2"
          />
        </div>
        {/* Ligne 8 : Remarques en textarea */}
        <div className="w-full">
          <textarea
            value={remarques}
            onChange={(e) => setRemarques(e.target.value)}
            placeholder="Remarques"
            className="border p-2 rounded w-full"
          />
        </div>
        {/* Ligne 9 : Actes sur une ligne */}
        <div className="w-full">
          <input
            type="text"
            value={actes}
            onChange={(e) => setActes(e.target.value)}
            placeholder="Actes"
            className="border p-2 rounded w-full"
          />
        </div>
        {/* Boutons */}
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

//
// Composant AddModal : permet d'ajouter un nouveau rendez-vous
//
interface AddModalProps {
  onSave: (newAppointment: AppointmentRecord) => void;
  onCancel: () => void;
}

const AddModal: React.FC<AddModalProps> = ({ onSave, onCancel }) => {
  const [patient, setPatient] = useState("");
  const [docteur, setDocteur] = useState("");
  const [genre, setGenre] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [typeVisite, setTypeVisite] = useState("");
  const [blessure, setBlessure] = useState("");
  const [statutPaiement, setStatutPaiement] = useState("");
  const [fournisseurAssurance, setFournisseurAssurance] = useState("");
  const [remarques, setRemarques] = useState("");
  const [actes, setActes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppointment: AppointmentRecord = {
      id: Date.now(),
      patient,
      docteur,
      genre,
      start: new Date(start),
      end: new Date(end),
      mobile,
      email,
      status,
      typeVisite,
      blessure: blessure || undefined,
      statutPaiement: statutPaiement || undefined,
      fournisseurAssurance: fournisseurAssurance || undefined,
      remarques: remarques || undefined,
      actes: actes || undefined,
      countryCode: "+33",
    };
    onSave(newAppointment);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Ajouter un rendez-vous</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ligne 1 */}
        <div className="w-full">
          <input
            type="text"
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            placeholder="Nom du patient"
            className="border p-2 rounded w-full"
            required
          />
        </div>
        {/* Ligne 2 */}
        <div className="flex space-x-4">
          <input
            type="text"
            value={docteur}
            onChange={(e) => setDocteur(e.target.value)}
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
        {/* Ligne 3 */}
        <div className="flex space-x-4">
          <label className="w-1/2">
            Début :
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </label>
          <label className="w-1/2">
            Fin :
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
          </label>
        </div>
        {/* Ligne 4 */}
        <div className="flex space-x-4">
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile"
            className="border p-2 rounded w-1/2"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border p-2 rounded w-1/2"
            required
          />
        </div>
        {/* Ligne 5 */}
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
            value={typeVisite}
            onChange={(e) => setTypeVisite(e.target.value)}
            placeholder="Type de visite"
            className="border p-2 rounded w-1/2"
            required
          />
        </div>
        {/* Ligne 6 */}
        <div className="w-full">
          <input
            type="text"
            value={blessure}
            onChange={(e) => setBlessure(e.target.value)}
            placeholder="Blessure"
            className="border p-2 rounded w-full"
          />
        </div>
        {/* Ligne 7 */}
        <div className="flex space-x-4">
          <input
            type="text"
            value={statutPaiement}
            onChange={(e) => setStatutPaiement(e.target.value)}
            placeholder="Statut de paiement"
            className="border p-2 rounded w-1/2"
          />
          <input
            type="text"
            value={fournisseurAssurance}
            onChange={(e) => setFournisseurAssurance(e.target.value)}
            placeholder="Fournisseur d'assurance"
            className="border p-2 rounded w-1/2"
          />
        </div>
        {/* Ligne 8 */}
        <div className="w-full">
          <textarea
            value={remarques}
            onChange={(e) => setRemarques(e.target.value)}
            placeholder="Remarques"
            className="border p-2 rounded w-full"
          />
        </div>
        {/* Ligne 9 */}
        <div className="w-full">
          <input
            type="text"
            value={actes}
            onChange={(e) => setActes(e.target.value)}
            placeholder="Actes"
            className="border p-2 rounded w-full"
          />
        </div>
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

//
// Composant principal Appointments
//
const Appointments: React.FC = () => {
  // Partie calendrier
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Partie carnet (tableau)
  const [tableData, setTableData] =
    useState<AppointmentRecord[]>(initialTableData);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
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

  // Gestion des colonnes affichées dans le tableau
  const [selectedColumns, setSelectedColumns] =
    useState<string[]>(defaultColumns);
  const [showExtraMenu, setShowExtraMenu] = useState(false);
  const toggleColumn = (col: string) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter((c) => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  // Barre de recherche et pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const filteredData = tableData.filter((item) =>
    item.patient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // États pour modales d'actions sur le tableau
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentRecord | null>(null);
  const [deletingAppointment, setDeletingAppointment] =
    useState<AppointmentRecord | null>(null);
  const [addingAppointment, setAddingAppointment] = useState(false);

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "RendezVous");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "rendezvous.xlsx");
  };

  const handleRefresh = () => {
    setTableData([...initialTableData]);
  };

  const handleSaveNewAppointment = (newAppointment: AppointmentRecord) => {
    setTableData([...tableData, newAppointment]);
    setAddingAppointment(false);
  };

  const handleSaveEditedAppointment = (edited: AppointmentRecord) => {
    setTableData(
      tableData.map((item) => (item.id === edited.id ? edited : item))
    );
    setEditingAppointment(null);
  };

  const handleConfirmDelete = () => {
    if (deletingAppointment) {
      setTableData(
        tableData.filter((item) => item.id !== deletingAppointment.id)
      );
      setDeletingAppointment(null);
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
        return item.patient;
      case "Médecin":
        return item.docteur;
      case "Genre":
        return item.genre;
      case "Date":
        return moment(item.start).format("DD/MM/YYYY");
      case "heure":
        return moment(item.start).format("HH:mm");
      case "Mobile":
        return `${item.countryCode} ${item.mobile}`;
      case "Blessure":
        return item.blessure || "N/A";
      case "E-mail":
        return item.email;
      case "Statut":
        return item.status;
      case "Type de visite":
        return item.typeVisite;
      case "Statut de paiement":
        return item.statutPaiement || "N/A";
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

      {/* Titre de la page */}
      <h1 className="text-2xl font-bold mb-2">Rendez-vous</h1>

      {/* Section Calendrier des rendez-vous */}
      <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">
        Calendrier des rendez-vous
      </h2>
      <div className="h-[600px] bg-white shadow-md p-4 rounded-lg mb-8">
        <Calendar
          localizer={localizer}
          events={initialTableData.map((appt) => ({
            ...appt,
            title: appt.patient,
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

      {/* Section Carnet de rendez-vous */}
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
              Voulez-vous supprimer {deletingAppointment.patient} ?
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
              Rendez-vous avec {selectedAppointment.patient}
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

      {/* Nouvelle section : Prendre rendez-vous */}
      <TakeAppointmentForm />
    </div>
  );
};

//
// Composant pour le formulaire "Prendre rendez-vous"
//
const TakeAppointmentForm: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [doctor, setDoctor] = useState("");
  const [motif, setMotif] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:30");
  const [report, setReport] = useState<File | null>(null);

  const specialtyDoctors: { [key: string]: string[] } = {
    Cardiologie: ["Dr. Cardi", "Dr. Heart"],
    Dermatologie: ["Dr. Skin", "Dr. Derma"],
    Pédiatrie: ["Dr. Kid", "Dr. Child"],
  };

  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecialty(e.target.value);
    setDoctor("");
  };

  const handleReportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReport(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      firstName,
      lastName,
      gender,
      mobile,
      appointmentDate,
      address,
      email,
      birthDate,
      specialty,
      doctor,
      motif,
      appointmentTime,
      report,
    };
    console.log("Formulaire Prendre rendez-vous :", formData);
    // Ici, vous pouvez envoyer les données au serveur puis réinitialiser le formulaire
    setFirstName("");
    setLastName("");
    setGender("");
    setMobile("");
    setAppointmentDate("");
    setAddress("");
    setEmail("");
    setBirthDate("");
    setSpecialty("");
    setDoctor("");
    setMotif("");
    setAppointmentTime("10:30");
    setReport(null);
  };

  return (
    <div className="bg-white shadow-md p-4 rounded-lg mb-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Prendre rendez-vous</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Prénom"
            className="border rounded p-2 w-1/2"
            required
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Nom de famille"
            className="border rounded p-2 w-1/2"
            required
          />
        </div>
        <div className="flex space-x-4">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border rounded p-2 w-1/2"
            required
          >
            <option value="">Genre</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile"
            className="border rounded p-2 w-1/2"
            required
          />
        </div>
        <div className="flex space-x-4">
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            placeholder="Date du rendez-vous"
            className="border rounded p-2 w-1/2"
            required
          />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Adresse"
            className="border rounded p-2 w-1/2"
            required
          />
        </div>
        <div className="flex space-x-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="border rounded p-2 w-1/2"
            required
          />
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            placeholder="Date de naissance"
            className="border rounded p-2 w-1/2"
            required
          />
        </div>
        <div className="flex space-x-4">
          <select
            value={specialty}
            onChange={handleSpecialtyChange}
            className="border rounded p-2 w-1/2"
            required
          >
            <option value="">Spécialité</option>
            <option value="Cardiologie">Cardiologie</option>
            <option value="Dermatologie">Dermatologie</option>
            <option value="Pédiatrie">Pédiatrie</option>
          </select>
          <select
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
            className="border rounded p-2 w-1/2"
            required
            disabled={!specialty}
          >
            <option value="">Docteur</option>
            {specialty && specialtyDoctors[specialty]?.map((doc, index) => (
              <option key={index} value={doc}>
                {doc}
              </option>
            ))}
          </select>
        </div>
        <textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder="Motif"
          className="border rounded p-2 w-full"
          required
        />
        <div className="flex space-x-4">
          <label className="w-1/2">
            Plage horaire (entre 10h30 et 18h00) :
            <input
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              min="10:30"
              max="18:00"
              className="border rounded p-2 w-full"
              required
            />
          </label>
          <label className="w-1/2">
            Téléverser des rapports :
            <input
              type="file"
              onChange={handleReportChange}
              className="border rounded p-2 w-full"
            />
          </label>
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Prendre Rendez-vous
        </button>
      </form>
    </div>
  );
};

export default Appointments;
