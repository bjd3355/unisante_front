import React, { useState } from "react";

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, BarChart, Bar, 
   AreaChart,LineChart,Line} from 'recharts';

import {
  FaHome,
  FaPen,
  FaTrashAlt,
  FaCalendarCheck,
  FaUserMd,
  FaMoneyBillWave,
  FaUserPlus,
} from "react-icons/fa";
import { MdEventAvailable, MdPendingActions } from "react-icons/md";

interface Operation {
  id: number;
  name: string;
  doctors: string;
  date: string;
  duration: string;
  anesthesia: string;
  documents: string;
  maladies: string;
}

interface Appointment {
  id: number;
  patient: string;
  date: string;
  time: string;
  status: string;
  doctor?: string;
}

const AdminDashboard: React.FC = () => {
  // Données factices pour les graphiques
  const data = [
    { name: "Jan", value: 50 },
    { name: "Fév", value: 80 },
    { name: "Mar", value: 65 },
    { name: "Avr", value: 90 },
    { name: "Mai", value: 70 },
    { name: "Juin", value: 110 },

  { month: "janv. '24", newPatients: 30, elderlyPatients: 15 },
  { month: "Fév '24", newPatients: 40, elderlyPatients: 35 },
  { month: "mars '24", newPatients: 35, elderlyPatients: 40 },
  { month: "Avr '24", newPatients: 50, elderlyPatients: 30 },
  { month: "Mai '24", newPatients: 80, elderlyPatients: 45 },
  { month: "Juin '24", newPatients: 90, elderlyPatients: 50 },
  ];


  const revenueData = [
    { month: "Jan", revenue: 500 },
    { month: "Fév", revenue: 700 },
    { month: "Mar", revenue: 1200 },
    { month: "Avr", revenue: 800 },
    { month: "Mai", revenue: 600 },
    { month: "Juin", revenue: 300 },
    { month: "Juil", revenue: 1200 },
  ];

  // États des rendez-vous et opérations
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, patient: "Jean Dupont", date: "2025-03-10", time: "10:00 AM", status: "Complété" },
    { id: 2, patient: "Alice Durand", date: "2025-03-12", time: "11:30 AM", status: "À venir" },
    { id: 3, patient: "Marc Lefevre", date: "2025-03-14", time: "02:00 PM", status: "Complété" },
    { id: 4, patient: "Claire Dubois", date: "2025-03-16", time: "09:30 AM", status: "À venir" },
  ]);

  const [operations, setOperations] = useState<Operation[]>([
    {
      id: 1,
      name: "Jean Dupont",
      doctors: "Dr. Martin, Dr. Gauthier",
      date: "10/03/2025",
      duration: "2 heures",
      anesthesia: "Générale",
      documents: "Fiche médicale",
      maladies: "Hypertension",
    },
    {
      id: 2,
      name: "Alice Durand",
      doctors: "Dr. Leroy, Dr. Dubois",
      date: "12/03/2025",
      duration: "1 heure 30",
      anesthesia: "Locoregionale",
      documents: "Ordonnance",
      maladies: "Diabète",
    },
  ]);

  // Modales pour les opérations
  const [isOperationEditModalOpen, setIsOperationEditModalOpen] = useState<boolean>(false);
  const [isOperationDeleteModalOpen, setIsOperationDeleteModalOpen] = useState<boolean>(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [editedOperation, setEditedOperation] = useState<Operation | null>(null);

  const openOperationEditModal = (op: Operation) => {
    setSelectedOperation(op);
    setEditedOperation({ ...op });
    setIsOperationEditModalOpen(true);
  };

  const closeOperationEditModal = () => {
    setIsOperationEditModalOpen(false);
    setSelectedOperation(null);
    setEditedOperation(null);
  };

  const handleOperationEditConfirm = () => {
    if (editedOperation) {
      setOperations((ops) =>
        ops.map((op) => (op.id === editedOperation.id ? editedOperation : op))
      );
    }
    closeOperationEditModal();
  };

  const openOperationDeleteModal = (op: Operation) => {
    setSelectedOperation(op);
    setIsOperationDeleteModalOpen(true);
  };

  const closeOperationDeleteModal = () => {
    setIsOperationDeleteModalOpen(false);
    setSelectedOperation(null);
  };

  const handleOperationDeleteConfirm = () => {
    if (selectedOperation) {
      setOperations((ops) => ops.filter((op) => op.id !== selectedOperation.id));
    }
    closeOperationDeleteModal();
  };

  // Modales pour les rendez-vous
  const [isAppointmentEditModalOpen, setIsAppointmentEditModalOpen] = useState<boolean>(false);
  const [isAppointmentDeleteModalOpen, setIsAppointmentDeleteModalOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editedAppointment, setEditedAppointment] = useState<Appointment | null>(null);

  const openAppointmentEditModal = (app: Appointment) => {
    setSelectedAppointment(app);
    const appData: Appointment = { ...app, doctor: app.patient === "Jean Dupont" ? "Martin" : "Leroy" };
    setEditedAppointment(appData);
    setIsAppointmentEditModalOpen(true);
  };

  const closeAppointmentEditModal = () => {
    setIsAppointmentEditModalOpen(false);
    setSelectedAppointment(null);
    setEditedAppointment(null);
  };

  const handleAppointmentEditConfirm = () => {
    if (editedAppointment) {
      setAppointments((apps) =>
        apps.map((app) => (app.id === editedAppointment.id ? editedAppointment : app))
      );
    }
    closeAppointmentEditModal();
  };

  const openAppointmentDeleteModal = (app: Appointment) => {
    setSelectedAppointment(app);
    setIsAppointmentDeleteModalOpen(true);
  };

  const closeAppointmentDeleteModal = () => {
    setIsAppointmentDeleteModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentDeleteConfirm = () => {
    if (selectedAppointment) {
      setAppointments((apps) => apps.filter((app) => app.id !== selectedAppointment.id));
    }
    closeAppointmentDeleteModal();
  };

  return (
    
  
<div className="h-screen overflow-auto bg-gray-100 p-6">
   
{/* Header Dashboard avec icône Home et séparation */}
{/* Header Dashboard avec icône Home et séparation */}
<div className="p-4 flex items-center">
        <FaHome className="text-xl mr-2" />
        <span className="mr-2">&gt;</span>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
      </div>

      {/* Bloc récapitulatif des rendez-vous */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Rendez-vous */}
        <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col items-center">
          <FaCalendarCheck className="text-green-600 text-4xl mb-2 transform transition-transform hover:scale-110" />
          <h3 className="text-lg font-semibold text-gray-800">Rendez-vous</h3>
          <p className="text-xl font-bold text-gray-800">320</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#4CAF50" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Opérations */}
        <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col items-center">
          <FaUserMd className="text-blue-600 text-4xl mb-2 transform transition-transform hover:scale-110" />
          <h3 className="text-lg font-semibold text-gray-800">Opérations</h3>
          <p className="text-xl font-bold text-gray-800">120</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2196F3" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenu */}
        <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col items-center">
          <FaMoneyBillWave className="text-yellow-500 text-4xl mb-2 transform transition-transform hover:scale-110" />
          <h3 className="text-lg font-semibold text-gray-800">Revenu Mensuel</h3>
          <p className="text-xl font-bold text-gray-800">2 500 000 FCFA</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#FFC107" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Nouveaux Patients */}
        <div className="bg-white p-4 rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col items-center">
          <FaUserPlus className="text-red-500 text-4xl mb-2 transform transition-transform hover:scale-110" />
          <h3 className="text-lg font-semibold text-gray-800">Nouveaux Patients</h3>
          <p className="text-xl font-bold text-gray-800">85</p>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={data}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#F44336" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Bloc récapitulatif des rendez-vous */}
      <div className="pt-50 grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Rendez-vous */}
  <div className="bg-white p-6 rounded-2xl shadow-md mt-6">
    <h2 className="text-xl font-semibold mb-4">Rendez-vous</h2>
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-4">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span> Rendez-vous
        </span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRendezVous" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.5}/>
            <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke="#4CAF50" fillOpacity={1} fill="url(#colorRendezVous)" strokeWidth={3}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>

  {/* Opérations */}
  <div className="bg-white p-6 mt-6 rounded-2xl shadow-md">
    <h2 className="text-xl font-semibold mb-4">Opérations</h2>
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-4">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Opérations
        </span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorOperations" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2196F3" stopOpacity={0.5}/>
            <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke="#2196F3" fillOpacity={1} fill="url(#colorOperations)" strokeWidth={3}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>

  {/* Revenu Mensuel */}
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <h2 className="text-xl font-semibold mb-4">Revenu Mensuel</h2>
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-4">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Revenu
        </span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={revenueData}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FFC107" stopOpacity={0.5}/>
            <stop offset="95%" stopColor="#FFC107" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="revenue" stroke="#FFC107" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>

  {/* Nouveaux Patients */}
  <div className="bg-white p-6 rounded-2xl shadow-md">
    <h2 className="text-xl font-semibold mb-4">Nouveaux Patients</h2>
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-4">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span> Nouveaux Patients
        </span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorNewPatients" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F44336" stopOpacity={0.5}/>
            <stop offset="95%" stopColor="#F44336" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke="#F44336" fillOpacity={1} fill="url(#colorNewPatients)" strokeWidth={3}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>
      <div className="flex space-x-4 p-4 ">
    {/* Section du graphique */}
   <div className="bg-white p-6 rounded-2xl shadow-md flex-1">
    <h2 className="text-xl font-semibold mb-2">Enquête sur les hôpitaux</h2>
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-4">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Nouveaux patients
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-500 rounded-full"></span> Patients âgés
        </span>
      </div>
   
    </div>
    <AreaChart width={600} height={300} data={data}>
      <defs>
        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="colorElderly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f97316" stopOpacity={0.5}/>
          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Area type="monotone" dataKey="newPatients" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNew)" strokeWidth={3}/>
      <Area type="monotone" dataKey="elderlyPatients" stroke="#f97316" fillOpacity={1} fill="url(#colorElderly)" strokeWidth={3}/>
    </AreaChart>
   </div>

   {/* Section des cartes */}
   <div className="flex flex-col space-y-4 flex-1">
    {/* Nominations Card */}
    <div className="bg-white p-6 rounded-2xl shadow-md text-center">
      <h3 className="text-lg font-medium">Nombre total de nominations</h3>
      <p className="text-4xl font-bold my-2">128</p>
      <div className="flex justify-center gap-4">
        <div className="bg-green-500 text-white p-4 rounded-lg w-24">
          <p className="text-xl font-bold">73</p>
          <p className="text-sm">Terminé</p>
        </div>
        <div className="bg-orange-500 text-white p-4 rounded-lg w-24">
          <p className="text-xl font-bold">55</p>
          <p className="text-sm">Arrivée</p>
        </div>
      </div>
    </div>

    {/* Revenu Card */}
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-lg font-medium">Revenu</h3>
      <p className="text-2xl font-bold">4 589 $</p>
      <div className="flex items-center text-green-500 font-medium mt-2">
        <span className="mr-1">⬆</span> +7.5%
      </div>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={60}>
          <BarChart data={revenueData}>
            <XAxis dataKey="month" hide />
            <Tooltip />
            <Bar dataKey="revenue" fill="green" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
   </div>
</div>

{/* Récapitulatif des Rendez-vous */}
<div className="bg-white p-6 rounded-xl shadow-lg mt-10 hover:shadow-2xl transition-shadow flex flex-col items-center">
  <MdEventAvailable className="text-green-600 text-5xl mb-4 transform transition-transform hover:scale-110" />
  <h2 className="text-2xl font-bold text-gray-800">Récapitulatif des Rendez-vous</h2>
  <p className="text-xl font-semibold text-gray-600 mt-2">Total : 250</p>
  <div className="flex justify-between w-full max-w-xs mt-3">
    <div className="flex items-center text-green-600">
      <MdEventAvailable className="text-2xl mr-2" />
      <span className="text-lg font-medium">✅ Complétés : 200</span>
    </div>
    <div className="flex items-center text-yellow-600">
      <MdPendingActions className="text-2xl mr-2" />
      <span className="text-lg font-medium">⏳ À venir : 50</span>
    </div>
  </div>
</div>

{/* Tableau des Opérations */}
<div className="bg-white p-6 rounded-xl shadow-lg mt-6 overflow-auto hover:shadow-2xl transition-shadow">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">Tableau des Opérations</h2>
  <table className="min-w-full bg-white border-collapse">
    <thead>
      <tr className="bg-green-100">
        <th className="px-4 py-2 border text-left text-gray-600">Nom et Prénom</th>
        <th className="px-4 py-2 border text-left text-gray-600">Équipe de Docteurs</th>
        <th className="px-4 py-2 border text-left text-gray-600">Date d'Opération</th>
        <th className="px-4 py-2 border text-left text-gray-600">Durée</th>
        <th className="px-4 py-2 border text-left text-gray-600">Type d'Anesthésie</th>
        <th className="px-4 py-2 border text-left text-gray-600">Documents</th>
        <th className="px-4 py-2 border text-left text-gray-600">Maladies</th>
        <th className="px-4 py-2 border text-left text-gray-600">Actions</th>
      </tr>
    </thead>
    <tbody>
      {operations.map((op) => (
        <tr key={op.id} className="hover:bg-gray-50">
          <td className="px-4 py-2 border">{op.name}</td>
          <td className="px-4 py-2 border">{op.doctors}</td>
          <td className="px-4 py-2 border">{op.date}</td>
          <td className="px-4 py-2 border">{op.duration}</td>
          <td className="px-4 py-2 border">{op.anesthesia}</td>
          <td className="px-4 py-2 border">{op.documents}</td>
          <td className="px-4 py-2 border">{op.maladies}</td>
          <td className="px-4 py-2 border flex justify-around">
            <FaPen
              className="text-blue-500 cursor-pointer hover:text-blue-700"
              onClick={() => openOperationEditModal(op)}
            />
            <FaTrashAlt
              className="text-red-500 cursor-pointer hover:text-red-700"
              onClick={() => openOperationDeleteModal(op)}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Tableau des Statuts des Médecins */}
<div className="bg-white p-6 rounded-xl shadow-lg mt-6 overflow-auto hover:shadow-2xl transition-shadow">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">Statuts des Médecins</h2>
  <table className="min-w-full bg-white border-collapse">
    <thead>
      <tr className="bg-green-100">
        <th className="px-4 py-2 border text-left text-gray-600">Nom du Médecin</th>
        <th className="px-4 py-2 border text-left text-gray-600">Spécialité</th>
        <th className="px-4 py-2 border text-left text-gray-600">Statut</th>
      </tr>
    </thead>
    <tbody>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-2 border">Dr. Martin</td>
        <td className="px-4 py-2 border">Chirurgie</td>
        <td className="px-4 py-2 border">Disponible</td>
      </tr>
      <tr className="hover:bg-gray-50">
        <td className="px-4 py-2 border">Dr. Leroy</td>
        <td className="px-4 py-2 border">Médecine générale</td>
        <td className="px-4 py-2 border">En pause</td>
      </tr>
    </tbody>
  </table>
</div>

      {/* Tableau des Rendez-vous */}
      <div className="bg-white p-6 rounded-xl shadow-lg mt-10 overflow-auto hover:shadow-2xl transition-shadow mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Liste des Rendez-vous</h2>
        <table className="min-w-full bg-white border-collapse">
          <thead>
            <tr className="bg-green-100">
              <th className="px-4 py-2 border text-left text-gray-600">Nom du Patient</th>
              <th className="px-4 py-2 border text-left text-gray-600">Docteur</th>
              <th className="px-4 py-2 border text-left text-gray-600">Date</th>
              <th className="px-4 py-2 border text-left text-gray-600">Heure</th>
              <th className="px-4 py-2 border text-left text-gray-600">Statut</th>
              <th className="px-4 py-2 border text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{appointment.patient}</td>
                <td className="px-4 py-2 border">
                  Dr. {appointment.patient === "Jean Dupont" ? "Martin" : "Leroy"}
                </td>
                <td className="px-4 py-2 border">{appointment.date}</td>
                <td className="px-4 py-2 border">{appointment.time}</td>
                <td className="px-4 py-2 border text-green-600">{appointment.status}</td>
                <td className="px-4 py-2 border flex justify-around">
                  <FaPen
                    className="text-blue-500 cursor-pointer hover:text-blue-700"
                    onClick={() => openAppointmentEditModal(appointment)}
                  />
                  <FaTrashAlt
                    className="text-red-500 cursor-pointer hover:text-red-700"
                    onClick={() => openAppointmentDeleteModal(appointment)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ------------------- Modales avec Design Amélioré ------------------- */}

      {/* Modal d'édition d'une opération */}
      {isOperationEditModalOpen && editedOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-xl w-11/12 md:w-1/2 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Modifier Opération</h2>
            <form>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Nom et Prénom</label>
                <input
                  type="text"
                  value={editedOperation.name}
                  onChange={(e) =>
                    setEditedOperation({ ...editedOperation, name: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Équipe de Docteurs</label>
                <input
                  type="text"
                  value={editedOperation.doctors}
                  onChange={(e) =>
                    setEditedOperation({ ...editedOperation, doctors: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Date d'Opération</label>
                <input
                  type="text"
                  value={editedOperation.date}
                  onChange={(e) =>
                    setEditedOperation({ ...editedOperation, date: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Durée</label>
                <input
                  type="text"
                  value={editedOperation.duration}
                  onChange={(e) =>
                    setEditedOperation({ ...editedOperation, duration: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Type d'Anesthésie</label>
                <input
                  type="text"
                  value={editedOperation.anesthesia}
                  onChange={(e) =>
                    setEditedOperation({ ...editedOperation, anesthesia: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Documents</label>
                <input
                  type="text"
                  value={editedOperation.documents}
                  onChange={(e) =>
                    setEditedOperation({ ...editedOperation, documents: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Maladies</label>
                <input
                  type="text"
                  value={editedOperation.maladies}
                  onChange={(e) =>
                    setEditedOperation({ ...editedOperation, maladies: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleOperationEditConfirm}
                  className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600 transition-colors"
                >
                  Valider
                </button>
                <button
                  type="button"
                  onClick={closeOperationEditModal}
                  className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de suppression d'une opération */}
      {isOperationDeleteModalOpen && selectedOperation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-xl w-11/12 md:w-1/3 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Confirmer la suppression</h2>
            <p className="mb-4 text-center">
              Voulez-vous supprimer l'opération de <span className="font-semibold">{selectedOperation.name}</span> ?
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleOperationDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded mr-2 hover:bg-red-600 transition-colors"
              >
                Oui
              </button>
              <button
                onClick={closeOperationDeleteModal}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition d'un rendez-vous */}
      {isAppointmentEditModalOpen && editedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-xl w-11/12 md:w-1/2 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Modifier Rendez-vous</h2>
            <form>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Nom du Patient</label>
                <input
                  type="text"
                  value={editedAppointment.patient}
                  onChange={(e) =>
                    setEditedAppointment({ ...editedAppointment, patient: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Docteur</label>
                <input
                  type="text"
                  value={editedAppointment.doctor || ""}
                  onChange={(e) =>
                    setEditedAppointment({ ...editedAppointment, doctor: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  value={editedAppointment.date}
                  onChange={(e) =>
                    setEditedAppointment({ ...editedAppointment, date: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Heure</label>
                <input
                  type="text"
                  value={editedAppointment.time}
                  onChange={(e) =>
                    setEditedAppointment({ ...editedAppointment, time: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="mb-3">
                <label className="block text-gray-700 mb-1">Statut</label>
                <input
                  type="text"
                  value={editedAppointment.status}
                  onChange={(e) =>
                    setEditedAppointment({ ...editedAppointment, status: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleAppointmentEditConfirm}
                  className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600 transition-colors"
                >
                  Valider
                </button>
                <button
                  type="button"
                  onClick={closeAppointmentEditModal}
                  className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de suppression d'un rendez-vous */}
      {isAppointmentDeleteModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
          <div className="bg-white p-8 rounded-xl w-11/12 md:w-1/3 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Confirmer la suppression</h2>
            <p className="mb-4 text-center">
              Voulez-vous supprimer le rendez-vous de <span className="font-semibold">{selectedAppointment.patient}</span> ?
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleAppointmentDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded mr-2 hover:bg-red-600 transition-colors"
              >
                Oui
              </button>
              <button
                onClick={closeAppointmentDeleteModal}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition-colors"
              >
                Non
              </button>
            </div>
          </div>
        </div>
      )}
    </div> 
  );
};

export default AdminDashboard;
