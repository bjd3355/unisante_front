import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { 
  FaBars, FaCalendarAlt, FaUserMd, FaUsers, FaSignOutAlt, FaBell, FaSearch, FaPlus,
  FaEnvelope, FaCalendar, FaUser, FaPhone, FaStar, FaClock, FaChevronLeft,
  FaChevronRight, FaMoon, FaSun, FaNotesMedical, FaVideo, FaEye, FaChartLine, FaCheck, 
  FaTimes, FaUserPlus
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams} from 'react-router-dom';
import { Menu } from '@headlessui/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import logo from '../assets/images/logo-unisante.jpg';
import avatar from '../assets/images/avatar.jpg';
import doctorIllustration from '../assets/images/Doctor.gif';
import WeatherCard from '../../components/WeatherCard';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip);

// Interfaces

interface AppointmentAction {
  isProcessing: boolean;
  actionType: 'accept' | 'refuse' | 'postpone' | null;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  availability: boolean;
  specialty: {
    id: number;
    name: string;
  };
  // Ajoute d'autres champs si nécessaire
  appointments?: Appointment[]; // Optionnel, si tu souhaites récupérer les rendez-vous du docteur
  address: string;
  fees: string;
  rating: number;
  feedbackCount: number;
  image: string;
  online: boolean;
}

interface Appointment { 
  id: number;
  date: string;
  time: string;
  status: string;
  type: string;
  doctor:{
    id: number;
    firstName: string;
    lastName: string;
  };
  patient:{
    id: number;
    firstName: string;
    lastName: string;
    gender: string;
  };
  gender: string; 
  disease: string; 
  report: string; 
}

interface Patient { 
  id: number; 
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  gender: 'homme' | 'femme' | 'non defini';
  adresse: string;
  phoneNumber?: string;
  image?: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  // Champs supplémentaires selon les besoins
  lastDiagnosis?: string;
  reports?: string;
  appointments?: Appointment[];
  patientId: string; 
  appointmentTime: string; 
  status: 'Stable' | 'Critique'; 
}

interface Notification { 
  id: number; 
  message: string; 
  time: string; 
  read: boolean; 
  type: 'info' | 'warning' | 'urgent'; 
}

interface Reminder { 
  id: number; 
  title: string; 
  description: string; 
  time: string; 
  priority: 'low' | 'medium' | 'high'; 
  completed: boolean; 
}

interface PatientGroup {
  letter: string;
  disease: string;
  patientCount: number;
  color: string;
}

interface DoctorStatus {
  name: string;
  degree: string;
  status: 'Available' | 'Absent';
  image: string;
}

interface PatientNumberData {
  day: string;
  male: number;
  female: number;
}

// Sample data
const patientsSurveyData = [
  { time: '00:00', newPatients: 20, oldPatients: 30 },
  { time: '01:00', newPatients: 30, oldPatients: 40 },
  { time: '02:00', newPatients: 40, oldPatients: 50 },
  { time: '03:00', newPatients: 60, oldPatients: 45 },
  { time: '04:00', newPatients: 80, oldPatients: 60 },
  { time: '05:00', newPatients: 70, oldPatients: 55 },
  { time: '06:00', newPatients: 50, oldPatients: 40 },
];

// Modification des couleurs pour le graphique "Rendez-vous"
const appointmentReviewData = {
  labels: ['Face to Face', 'E-Consult', 'Available'],
  datasets: [{
    data: [100, 80, 60],
    backgroundColor: ['#FF6F61', '#6B5B95', '#88B04B'], // Couleurs différentes : Corail, Violet profond, Vert olive
    borderWidth: 1,
  }],
};

// Modification des couleurs pour les groupes de patients
const patientGroups: PatientGroup[] = [
  { letter: 'C', disease: 'Cholestérol', patientCount: 5, color: '#FF6347' }, // Tomate
  { letter: 'D', disease: 'Diabète', patientCount: 14, color: '#4682B4' }, // Bleu acier
  { letter: 'L', disease: 'Low Blood Pressure', patientCount: 10, color: '#32CD32' }, // Vert lime
  { letter: 'H', disease: 'Hypertension', patientCount: 21, color: '#FFD700' }, // Or
  { letter: 'M', disease: 'Malaria', patientCount: 11, color: '#FF4500' }, // Rouge orangé
  { letter: 'D', disease: 'Dental Problem', patientCount: 17, color: '#8A2BE2' }, // Violet bioluminescent
  { letter: 'A', disease: 'Asthma', patientCount: 8, color: '#20B2AA' }, // Turquoise
];

// Données pour le statut des docteurs
const doctorStatusData: DoctorStatus[] = [
  { name: 'Dr. Jay Soni', degree: 'MBBS, MD', status: 'Available', image: doctorIllustration },
  { name: 'Dr. Sarah Smil', degree: 'BDS, MDS', status: 'Absent', image: doctorIllustration },
  { name: 'Dr. Megha Trin', degree: 'BHMS', status: 'Available', image: doctorIllustration },
  { name: 'Dr. John Deo', degree: 'MBBS, MS', status: 'Available', image: doctorIllustration },
  { name: 'Dr. Jacob Rya', degree: 'MBBS, MD', status: 'Absent', image: doctorIllustration },
  { name: 'Dr. Jay Soni', degree: 'MBBS', status: 'Available', image: doctorIllustration },
  { name: 'Dr. Linda Cart', degree: 'MBBS', status: 'Available', image: doctorIllustration },
];

// Données pour le graphique du nombre de patients
const patientNumberData: PatientNumberData[] = [
  { day: 'Mon', male: 40, female: 60 },
  { day: 'Tue', male: 50, female: 80 },
  { day: 'Wed', male: 60, female: 90 },
  { day: 'Thu', male: 55, female: 85 },
  { day: 'Fri', male: 45, female: 100 },
  { day: 'Sat', male: 20, female: 30 },
];

// Components
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  className: string;
  onClick?: () => void;
}> = React.memo(({ title, value, icon, className, onClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }} 
    onClick={onClick}
    className={`p-4 rounded-xl text-white shadow-md cursor-pointer ${className}`}
  >
    <div className="flex items-center space-x-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide">{title}</h2>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  </motion.div>
));

const NotificationCard: React.FC<Notification & { onClick: () => void }> = React.memo(
  ({ message, time, read, type, onClick }) => (
    <motion.li 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      whileHover={{ backgroundColor: '#f0fdf4' }} 
      className={`py-2 px-3 flex justify-between items-center rounded-md ${
        read ? 'opacity-60' : 
        type === 'urgent' ? 'bg-red-50' : 
        type === 'warning' ? 'bg-yellow-50' : 'bg-green-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-2">
        <FaEnvelope className={`text-${
          type === 'urgent' ? 'red' : 
          type === 'warning' ? 'yellow' : 'green'
        }-600`} />
        <div>
          <p className="text-sm text-green-900">{message}</p>
          <p className="text-xs text-green-500">{time}</p>
        </div>
      </div>
      {!read && (
        <motion.span 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ duration: 1, repeat: Infinity }} 
          className={`w-2 h-2 ${
            type === 'urgent' ? 'bg-red-500' : 
            type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
          } rounded-full`}
        />
      )}
    </motion.li>
  )
);

const ReminderCard: React.FC<Reminder & { onToggle: () => void }> = React.memo(
  ({ title, description, time, priority, completed, onToggle }) => (
    <motion.li 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      whileHover={{ backgroundColor: '#f0fdf4' }} 
      className={`py-2 px-3 flex justify-between items-center rounded-md ${
        completed ? 'line-through text-gray-400' : 'text-green-900'
      } border-l-4 ${
        priority === 'high' ? 'border-red-500' : 
        priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
      }`}
    >
      <div className="flex items-center space-x-2">
        <FaClock className="text-green-600" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-green-600">{description}</p>
          <p className="text-xs text-green-500">{time}</p>
        </div>
      </div>
      <motion.button 
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.9 }} 
        onClick={onToggle}
        className={`p-1 rounded-full ${
          completed ? 'bg-green-100 text-green-600' : 'bg-green-600 text-white'
        }`}
      >
        {completed ? '✓' : '○'}
      </motion.button>
    </motion.li>
  )
);

const RecentAppointment: React.FC<Appointment & { 
  onView: () => void;
  onAccept: () => void;
  onRefuse: () => void;
  onPostpone: () => void;
  actionState: AppointmentAction;
}> = React.memo(
  ({ patient, date, time, disease, status, type, report, onView, onAccept, onRefuse, onPostpone, actionState }) => (
    <motion.tr 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      whileHover={{ backgroundColor: '#f9fafb' }} 
      className="border-b"
    >
      <td className="py-3 px-4 text-green-900 font-medium truncate max-w-[150px]">
        {patient?.lastName} {patient?.firstName}
      </td>
      <td className="py-3 px-4 text-green-700">
        {patient?.gender}
      </td>
      <td className="py-3 px-4 text-green-700">
        {date} {time}
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs ${
          disease === 'fievre' ? 'bg-pink-100 text-pink-700' : // Rose pour Fièvre
          disease === 'infection' ? 'bg-teal-100 text-teal-700' : // Teal pour Infection
          disease === 'paludisme' ? 'bg-amber-100 text-amber-700' : // Ambre pour Paludisme
          disease === 'migraine' ? 'bg-indigo-100 text-indigo-700' : // Indigo pour Migraine
          disease === 'grippe' ? 'bg-cyan-100 text-cyan-700' : // Cyan pour Grippe
          'bg-green-100 text-green-700'
        }`}>
          {disease}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === 'Confirmé' ? 'bg-emerald-100 text-emerald-700' : // Émeraude pour Confirmé
          (['en attente', 'pending'].includes(status.toLowerCase())) ? 'bg-orange-100 text-orange-700' : // Orange pour En attente/pending
          status === 'Annulé' ? 'bg-rose-100 text-rose-700' : // Rose pour Annulé
          'bg-sky-100 text-sky-700' // Ciel pour Reporté
        }`}>
          {status}
        </span>
      </td>
      <td className="py-3 px-4 text-green-700">
        {type}
      </td>
      <td className="py-3 px-4">
        <a href={report} target="_blank" rel="noopener noreferrer">
          <FaEye className="text-green-600" />
        </a>
      </td>
      <td className="py-3 px-4 flex space-x-2">
  {actionState.isProcessing ? (
    <motion.div 
      animate={{ rotate: 360 }} 
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
      className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full"
    />
  ) : (['en attente', 'pending'].includes(status.toLowerCase())) ? (
    <>
      <motion.button 
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.9 }} 
        onClick={onAccept}
        className="p-1 text-green-600 hover:text-green-800"
        title="Accepter"
      >
        <FaCheck />
      </motion.button>
      <motion.button 
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.9 }} 
        onClick={onRefuse}
        className="p-1 text-red-600 hover:text-red-800"
        title="Refuser"
      >
        <FaTimes />
      </motion.button>
      <motion.button 
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.9 }} 
        onClick={onPostpone}
        className="p-1 text-blue-600 hover:text-blue-800"
        title="Reporter"
      >
        <FaClock />
      </motion.button>
    </>
  ) : (
    <motion.button 
      whileHover={{ scale: 1.1 }} 
      whileTap={{ scale: 0.9 }} 
      onClick={onView}
      className="text-green-600 hover:text-green-800"
    >
      Détails
    </motion.button>
  )}
</td>

    </motion.tr>
  )
);


// Composant Memoized DoctorCard utilisant Doctor
const DoctorCard: React.FC<Doctor> = React.memo(
  ({ firstName, lastName, specialty, rating, feedbackCount, address, fees, availability, online }) => {
    const fullName = `${firstName} ${lastName}`;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }} 
        className="p-5 rounded-xl bg-white shadow-md border border-gray-100"
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="relative">
            <img src={doctorIllustration} alt={fullName} className="w-14 h-14 rounded-md border border-green-200" />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
              online ? 'bg-lime-500' : 'bg-gray-400' 
            } border-2 border-white`}></span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">{fullName}</h3>
            <p className="text-sm text-green-600">{specialty?.name}</p>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'} size={12} />
              ))}
              <span className="text-xs text-green-600">({feedbackCount})</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-green-700 mb-2"><FaSearch className="inline mr-1" />{address}</p>
        <p className="text-sm text-green-700 mb-2">{fees} | {availability}</p>
        <div className="flex space-x-2">
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: '#15803d', color: '#fff' }} 
            whileTap={{ scale: 0.9 }}
            className="flex-1 py-2 border border-green-600 text-green-600 rounded-md"
          >
            Profil
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: online ? '#15803d' : '#d1d5db', color: online ? '#fff' : '#6b7280' }} 
            whileTap={{ scale: 0.9 }}
            className={`p-2 border border-green-600 text-green-600 rounded-md ${!online ? 'cursor-not-allowed' : ''}`}
            disabled={!online}
          >
            <FaVideo />
          </motion.button>
        </div>
      </motion.div>
    );
  }
);

/* Composant PatientCard */
const PatientCard: React.FC<{
  name: string;
  patientId: number;
  appointmentTime?: string;
  address: string;
  phone: string;
  bloodGroup?: string;
  lastDiagnosis?: string;
  status?: string;
  reports?: string;
  image?: string;
  doctorIllustration: string;
}> = React.memo(({
  name,
  patientId,
  appointmentTime,
  address,
  phone,
  bloodGroup,
  lastDiagnosis,
  status,
  reports,
  image,
  doctorIllustration,
}) => {
  // Utilisation de l'image du patient si disponible, sinon fallback vers doctorIllustration
  const imageSrc = image || doctorIllustration;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }} 
      className="p-5 rounded-xl bg-white shadow-md border border-gray-100"
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="relative">
          <img 
            src={`http://localhost:3000${imageSrc}`} 
            alt={name} 
            className="w-14 h-14 rounded-md border border-green-200" 
          />
          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
            status === 'Stable' ? 'bg-emerald-500' : 'bg-rose-500'
          } border-2 border-white`}></span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-900">{name}</h3>
          <p className="text-sm text-green-600">ID: {patientId}</p>
          <p className="text-xs text-green-500">{appointmentTime}</p>
        </div>
      </div>
      <p className="text-sm text-green-700 mb-2">
        <FaSearch className="inline mr-1" />
        {address}
      </p>
      <p className="text-sm text-green-700 mb-2">
        <FaPhone className="inline mr-1" />
        {phone}
      </p>
      <p className="text-sm text-green-700 mb-2">
        Groupe sanguin: {bloodGroup}
      </p>
      <p className="text-sm text-green-700 mb-3">
        Dernier diagnostic: {lastDiagnosis} | 
        <a href={reports} className="text-green-600 hover:underline">Rapports</a>
      </p>
      <div className="flex space-x-2">
        <motion.button 
          whileHover={{ scale: 1.05, backgroundColor: '#15803d', color: '#fff' }} 
          whileTap={{ scale: 0.9 }}
          className="flex-1 py-2 border border-green-600 text-green-600 rounded-md"
        >
          Dossier
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05, backgroundColor: '#15803d', color: '#fff' }} 
          whileTap={{ scale: 0.9 }}
          className="p-2 border border-green-600 text-green-600 rounded-md"
        >
          <FaNotesMedical />
        </motion.button>
      </div>
    </motion.div>
  );
});

const PatientGroupCard: React.FC<PatientGroup> = React.memo(
  ({ letter, disease, patientCount, color }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      whileHover={{ scale: 1.05 }} 
      className="flex items-center space-x-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100"
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: color }}>
        {letter}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{disease}</p>
        <p className="text-xs text-gray-600">{patientCount} patients</p>
      </div>
    </motion.div>
  )
);

const DoctorStatusCard: React.FC<DoctorStatus> = React.memo(
  ({ name, degree, status, image }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      whileHover={{ backgroundColor: '#f9fafb' }} 
      className="flex items-center justify-between p-3 border-b border-gray-200"
    >
      <div className="flex items-center space-x-3">
        <img src={image} alt={name} className="w-10 h-10 rounded-full border border-green-200" />
        <div>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{degree}</p>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs ${
        status === 'Available' ? 'bg-lime-100 text-lime-700' : 'bg-amber-100 text-amber-700' // Lime pour Available, Ambre pour Absent
      }`}>
        {status}
      </span>
    </motion.div>
  )
);

// Main Dashboard Component
const DashboardDoctor: React.FC = () => {
  // Extrait l'id de l'utilisateur depuis l'URL (par exemple, /patientPage/123)
  const { userId } = useParams<{ userId: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchPatient, setSearchPatient] = useState('');
  const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [error,setError] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [editedDoctor, setEditedDoctor] = useState<Partial<Doctor>>({});
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  const [newAppointment, setNewAppointment] = useState({
    patient: '',
    gender: 'Homme' as 'Homme' | 'Femme',
    date: '',
    time: '',
    disease: '',
    type: 'Présentiel' as 'Présentiel' | 'Téléconsultation'
  });

  const handleProfileChange = (field: keyof Doctor, value: string | boolean) => {
    setEditedDoctor(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSaveProfile = async () => {
      if (!doctor || !userId) return;
      
      try {
        const updatedDoctor = {
          ...doctor,
          ...editedDoctor
        };
  
        await axios.put(`http://localhost:3000/doctor/${doctor?.id}`, updatedDoctor, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if(doctor.email!== updatedDoctor.email){
          await axios.put(`http://localhost:3000/users/${userId}`, updatedDoctor, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
        }
        setDoctor(updatedDoctor);
        setIsEditingProfile(false);
        setIsProfileModalOpen(false);
        toast.success(('Mise à jour du profil'));
      } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        toast.error(('profileUpdateError'));
      }
    };

  // Fonction pour gérer le téléversement d'une nouvelle image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && doctor) {
      const formData = new FormData();
      formData.append("image", file);
  
      try {
        const response = await fetch(`http://localhost:3000/doctor/${doctor.id}/upload-image`, {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok) throw new Error("Échec du téléversement");
  
        const data = await response.json();
        setDoctor((prev) => prev ? { ...prev, image: data.image } : null); // Mise à jour du state avec la nouvelle image
  
        toggleModal(); // Ferme la modale après upload
      } catch (error) {
        console.error("Erreur lors du téléversement :", error);
      }
    }
  };
  

  const deleteImage = async () => {
    if (!doctor) return;
  
    try {
      // Mettre à jour l'image localement
      setDoctor((prev) => prev ? { ...prev, image: "" } : null);
  
      // Envoyer la mise à jour au backend
      await axios.put(`http://localhost:3000/doctor/${doctor.id}/image`, { image: "" });
  
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image :", error);
    }
  
    toggleModal(); // Fermer la modale après suppression
  };

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [appointmentActions, setAppointmentActions] = useState<Map<number, AppointmentAction>>(
    new Map()
  );

  // Exemple d'effet pour récupérer les docteurs via l'API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get("http://localhost:3000/doctor", {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setDoctors(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des docteurs :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!userId) return;
    
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token d'authentification manquant.");
        toast.error("Veuillez vous reconnecter.");
        return;
      }
    
      setIsLoading(true);
      try {
        // 🔹 Récupération des données du docteur
        const { data: doctorData } = await axios.get<Doctor>(
          `http://localhost:3000/doctor/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        // 🔹 Récupération des rendez-vous du docteur
        const { data: fetchedAppointments } = await axios.get<Appointment[]>(
          `http://localhost:3000/appointments/doctor/${doctorData.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("📅 Rendez-vous reçus :", fetchedAppointments);
    
        setAppointments(fetchedAppointments);
        setDoctor({ ...doctorData, appointments: fetchedAppointments });
    
        // 🔹 Extraction unique des IDs des patients depuis les rendez-vous
        const patientIds = [
          ...new Set(fetchedAppointments.map((app) => app.patient?.id).filter(Boolean)),
        ];
        console.log("👤 Patient IDs :", patientIds);
    
        // 🔹 Récupération des informations de chaque patient
        const patientPromises = patientIds.map((id) =>
          axios
            .get<Patient>(`http://localhost:3000/patient/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch((error) => {
              console.warn(`⚠️ Erreur lors de la récupération du patient ${id} :`, error);
              return null;
            })
        );
    
        const patientResponses = await Promise.all(patientPromises);
        const patientsData = patientResponses.filter(Boolean).map((response) => response!.data);
    
        setPatients(patientsData);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des données :", error);
        setError("Impossible de charger les données du docteur.");
        toast.error("Erreur de chargement des données du docteur.");
      } finally {
        setIsLoading(false);
      }
    };
    
  
    fetchDoctorData();
  }, [userId]);
  

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, message: 'Rappel: RDV Jean Doe à 10h', time: '09:30', read: false, type: 'info' },
    { id: 2, message: 'Résultats labo disponibles: Sarah S.', time: '08:45', read: false, type: 'urgent' },
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: 1, title: 'Suivi Jean Doe', description: 'Résultats sanguins', time: '11:00', priority: 'high', completed: false },
    { id: 2, title: 'Réunion équipe', description: 'Salle 2', time: '15:00', priority: 'medium', completed: false },
  ]);

  const dashboardRef = useRef<HTMLDivElement>(null!);
  const appointmentsRef = useRef<HTMLDivElement>(null!);
  const doctorsRef = useRef<HTMLDivElement>(null!);
  const patientsRef = useRef<HTMLDivElement>(null!);
  const profileRef = useRef<HTMLDivElement>(null!);

  // Fonction pour ouvrir/fermer la modale
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const toggleModal2 = () => {
    setIsModalOpen2(!isModalOpen2);
  };

  const handleProfileClick = () => {
    scrollToSection(profileRef);
    setIsProfileModalOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = useCallback(async () => {
    if (window.confirm('Confirmer la déconnexion ?')) {
      setIsLoadingAction('logout');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoadingAction(null);
      navigate(`/`);
    }
  }, []);

  const handleViewAppointment = useCallback((apt: Appointment) => {
    alert(`Patient: ${apt.patient}\nDate: ${apt.date} ${apt.time}\nMaladie: ${apt.disease}\nStatut: ${apt.status}\nType: ${apt.type}`);
  }, []);

  const handleAppointmentAction = useCallback(async (
    appointmentId: number,
    action: 'accept' | 'refuse' | 'postpone'
  ) => {
    // Marquer l'action comme en cours dans l'UI
    setAppointmentActions(prev => new Map(prev).set(appointmentId, {
      isProcessing: true,
      actionType: action
    }));
  
    // Déterminer le nouveau statut à appliquer
    let newStatus: string;
    let newStatusBDD: string;
    switch (action) {
      case 'accept':
        newStatus = 'Confirmé';
        newStatusBDD = 'confirmer';
        break;
      case 'refuse':
        newStatus = 'Refusé';
        newStatusBDD = 'refuser';
        break;
      case 'postpone':
        newStatus = 'Reporté';
        newStatusBDD = 'reporter';
        break;
      default:
        newStatus = '';
        newStatusBDD = '';
    }
  
    try {
      // Appel à l'API pour mettre à jour le statut du rendez-vous dans la base de données
      await axios.patch(
        `http://localhost:3000/appointments/${appointmentId}`,
        { status: newStatusBDD },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
  
      // Mise à jour de l'état local des rendez-vous
      setAppointments(prev => prev.map(apt => {
        if (apt.id === appointmentId) {
          return { ...apt, status: newStatus };
        }
        return apt;
      }));
  
      // Ajout d'une notification
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now(),
          message: `RDV ${action === 'accept' ? 'accepté' : action === 'refuse' ? 'refusé' : 'reporté'} pour ${appointments.find(a => a.id === appointmentId)?.patient}`,
          time: new Date().toLocaleTimeString(),
          read: false,
          type: action === 'refuse' ? 'warning' : 'info'
        }
      ]);
      toast.success("Statut du rendez-vous mis à jour avec succès.");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rendez-vous :", error);
      toast.error("Erreur lors de la mise à jour du rendez-vous.");
    } finally {
      // Réinitialiser l'état de traitement pour cet id
      setAppointmentActions(prev => {
        const newMap = new Map(prev);
        newMap.delete(appointmentId);
        return newMap;
      });
    }
  }, [appointments]);
  
  
  const markNotificationAsRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const toggleReminder = useCallback((id: number) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  }, []);

  const scrollToSection = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);


  const closeModal = useCallback(() => {
    setIsModalOpen2(false);
    setNewAppointment({
      patient: '',
      gender: 'Homme',
      date: '',
      time: '',
      disease: '',
      type: 'Présentiel'
    });
  }, []);

  const handleAddAppointment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Vérification des champs obligatoires
    if (!newAppointment.patient || !newAppointment.date || !newAppointment.time || !newAppointment.disease) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }
  
    setIsLoadingAction('add');
  
    try {
      // Récupération du token dans le localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token introuvable');
      }
  
      // Appel API pour créer le rendez-vous
      const response = await axios.post(
        'http://localhost:3000/appointments', // Assurez-vous que cet endpoint existe côté serveur
        newAppointment,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // Supposons que le back-end renvoie le rendez-vous créé
      const addedAppointment = response.data;
  
      // Mise à jour de l'état avec le nouveau rendez-vous
      setAppointments(prev => [...prev, addedAppointment]);
      setNotifications(prev => [
        ...prev,
        {
          id: Date.now(),
          message: `Nouveau RDV ajouté pour ${newAppointment.patient}`,
          time: new Date().toLocaleTimeString(),
          read: false,
          type: 'info'
        }
      ]);
    } catch (error) {
      console.error("Erreur lors de l'ajout du rendez-vous :", error);
      alert("Erreur lors de l'ajout du rendez-vous. Veuillez réessayer.");
    } finally {
      setIsLoadingAction(null);
      closeModal();
    }
  }, [newAppointment, closeModal]);

  const filteredAppointments = appointments.filter(apt => 
    apt.patient.firstName.toLowerCase().includes(searchPatient.toLowerCase())
  );
   // Filtrage des patients selon la chaîne de recherche
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchPatient.toLowerCase());
  });
  // Filtrer les médecins selon le terme de recherche
  const filteredDoctors = doctors.filter((doc) =>
    doc.firstName.toLowerCase().includes(searchPatient.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex font-sans antialiased ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 260 : 70 }}
        animate={{ width: isSidebarOpen ? 260 : 70 }}
        className="bg-green-900 text-white flex flex-col h-screen fixed z-20 shadow-xl"
      >
        {/* En-tête avec logo et nom UniSanté */}
      <div className="p-2 flex flex-col items-center">
        <motion.img
          src={logo}
          alt="Logo UniSanté"
          className="w-12 h-12 rounded-full border border-green-200 mb-1"
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.5 }}
        />
        {isSidebarOpen && (
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xl font-bold"
          >
            UniSanté
          </motion.h1>
        )}
      </div>
      {/* Section utilisateur avec traits et décalage à droite */}
      <div className="p-2 flex items-center justify-between relative">
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center space-x-3 ml-4"
          >
            {/* Trait supérieur */}
            <div className="w-full h-px bg-white/30 absolute top-0 left-0"></div>
            <img
              src={`http://localhost:3000${doctor?.image || avatar}`}
              alt="Doctor"
              className="w-16 h-20 rounded-lg mt-1 mb-1"
              onClick={(e) => {
                e.stopPropagation(); // Empêche la propagation vers d'autres gestionnaires de clic
                toggleModal();
              }}
            />
            {/* Trait inférieur */}
            <div className="w-full h-px bg-white/30 absolute bottom-0 left-0"></div>
            <div>
              <span className="text-sm">Docteur</span>
              <p className="text-sm font-semibold">{doctor?.firstName} {doctor?.lastName}</p>
            </div>
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="p-2 rounded-full bg-green-800/50 hover:bg-green-700/70"
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </motion.button>
      </div>

        {/* Menu de navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-2">
          {[
            { label: 'Tableau de bord', icon: <FaBars />, ref: dashboardRef },
            { label: 'Rendez-vous', icon: <FaCalendarAlt />, ref: appointmentsRef },
            { label: 'Médecins', icon: <FaUserMd />, ref: doctorsRef },
            { label: 'Patients', icon: <FaUsers />, ref: patientsRef },
            { label: 'Profil', icon: <FaUser />, ref: profileRef, onClick: handleProfileClick },
          ].map((item, index) => (
            <motion.li
              key={index}
              onClick={item.onClick} 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              className="rounded-md"
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection(item.ref)}
                className={`flex items-center p-3 w-full text-left ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}
              >
                <span className="text-xl">{item.icon}</span>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </nav>

        <div className="p-3 border-t border-green-600/50">
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center space-x-3 mb-3"
            >
              <img 
                src={`http://localhost:3000${doctor?.image || avatar}`}
                alt={`Dr. ${doctor?.firstName} ${doctor?.lastName}`} 
                className="w-9 h-9 rounded-full border-2 border-green-200"
              />
              <div>
                <span className="text-sm font-medium">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </span>
                <p className="text-xs text-green-600">{doctor?.specialty?.name}</p>
              </div>
            </motion.div>
            
            )}
          </AnimatePresence>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }} 
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className={`flex items-center p-3 w-full rounded-md bg-red-600 hover:bg-red-700 ${
              isSidebarOpen ? 'space-x-3' : 'justify-center'
            } ${isLoadingAction === 'logout' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoadingAction === 'logout'}
          >
            {isLoadingAction === 'logout' ? (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <FaSignOutAlt />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-medium"
                  >
                    Déconnexion
                  </motion.span>
                )}
              </>
            )}
          </motion.button>
        </div>
      </motion.aside>

      {/* Modale de gestion de l'image */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-bold mb-4">Changer d'image</h3>
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

      {/* Main Content */}
      <main className={`flex-1 p-6 ${isSidebarOpen ? 'ml-[260px]' : 'ml-[70px]'} overflow-y-auto`}>
        <header 
          className={`flex justify-between items-center mb-6 p-4 rounded-xl shadow-md sticky top-2 z-10 ${
            isDarkMode ? 'bg-gray-800/90' : 'bg-white/95'
          } backdrop-blur-md border border-gray-200/50`}
        >
          <div className="flex items-center space-x-4">
            <motion.img
              src={`http://localhost:3000${doctor?.image || avatar}`}
              alt={`Dr. ${doctor?.firstName} ${doctor?.lastName}`}
              className="w-16 h-16 rounded-lg border-2 border-green-300 shadow-md object-cover"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.3 }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <FaUser className="text-green-600" />
                <h1 className="text-3xl font-bold text-green-900">Dr. {doctor?.firstName} {doctor?.lastName}</h1>
              </div>
              <p className="text-base text-green-600 font-medium">{doctor?.specialty?.name ? `${doctor.specialty?.name} - UniSanté 2025` : "Spécialisation non renseignée"}</p>
            </div>
          </div>
          {/* Section droite : Météo, notifications, mode sombre, avatar */}
          <div className="flex items-center space-x-6">
            
            {/* Météo avec WeatherCard */}
            <WeatherCard isDarkMode={isDarkMode} />

            <Menu as="div" className="relative">
              <Menu.Button className="p-3 text-green-900 hover:text-green-700 relative focus:outline-none">
                <FaBell className="text-2xl" />
                {notifications.some((n) => !n.read) && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border border-white"
                  />
                )}
              </Menu.Button>
              <Menu.Items
            className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl p-3 max-h-72 overflow-y-auto ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-green-900'
            } border border-gray-200`}
          >
            {notifications.map((n) => (
              <Menu.Item key={n.id}>
                {({ active }: { active: boolean }) => (
                  <button
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                      active ? 'bg-gray-100' : ''
                    }`}
                  >
                    <NotificationCard {...n} onClick={() => {}} />
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
            </Menu>
            {/* Bouton Mode Sombre/Clair */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`p-3 rounded-full ${
                isDarkMode ? 'bg-green-700 text-white' : 'bg-green-100 text-green-900'
              } hover:bg-green-200 shadow-md`}
              title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {isDarkMode ? <FaSun className="text-2xl" /> : <FaMoon className="text-2xl" />}
            </motion.button>
            {/* Avatar droite */}
            <motion.img 
              src={`http://localhost:3000${doctor?.image || avatar}`}
              alt={`Dr. ${doctor?.firstName} ${doctor?.lastName}`} 
              className="w-12 h-12 rounded-full border-2 border-green-300 shadow-md object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />

          </div>
        </header>

        {/* Dashboard Section */}
        <motion.div ref={dashboardRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-900">Tableau de bord</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm flex items-center space-x-1 hover:bg-green-700"
            >
              <FaChartLine /> <span>Rapport complet</span>
            </motion.button>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <motion.div className="w-10 h-10 border-4 border-green-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className={`space-y-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-md border border-gray-200`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Rendez-vous" 
                  value={`${appointments.length}`} 
                  icon={<FaCalendar />} 
                  className="bg-violet-300" // Violet
                  onClick={() => scrollToSection(appointmentsRef)}
                />
                <StatCard 
                  title="Chirurgies" 
                  value="3+" 
                  icon={<FaUserMd />} 
                  className="bg-rose-300" // Rose
                />
                <StatCard 
                  title="Visites" 
                  value={`${patients.length}`} 
                  icon={<FaUsers />} 
                  className="bg-teal-300" // Teal
                  onClick={() => scrollToSection(patientsRef)}
                />
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-white'} shadow-md border border-gray-200`}>
                <h3 className="text-lg font-semibold text-green-900 mb-3">Rappels</h3>
                <ul className="space-y-2 max-h-40 overflow-y-auto">
                  {reminders.map(reminder => (
                    <ReminderCard 
                      key={reminder.id} 
                      {...reminder} 
                      onToggle={() => toggleReminder(reminder.id)}
                    />
                  ))}
                </ul>
              </div>
            </div>
          )}
        </motion.div>

        {/* Charts Section - Graphiques côte à côte */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className={`space-y-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-md border border-gray-200`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Statistiques Patients</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={patientsSurveyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: isDarkMode ? '#374151' : '#fff', border: 'none' }} />
                    <Area type="monotone" dataKey="newPatients" stackId="1" fill="#FF8C00" stroke="#FF8C00" name="Nouveaux" /> {/* Orange foncé */}
                    <Area type="monotone" dataKey="oldPatients" stackId="1" fill="#00CED1" stroke="#00CED1" name="Anciens" /> {/* Turquoise foncé */}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Rendez-vous</h3>
                <div className="flex justify-center">
                  <div className="w-full h-[300px]">
                    <Doughnut 
                      data={appointmentReviewData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                          tooltip: { backgroundColor: isDarkMode ? '#374151' : '#fff' },
                        },
                        cutout: '70%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Doctor Status and Patient Numbers Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className={`space-y-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-md border border-gray-200`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doctor Status */}
              <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Statut des Docteurs</h3>
                <div className="max-h-96 overflow-y-auto">
                  {doctorStatusData.map((doctor, index) => (
                    <DoctorStatusCard key={index} {...doctor} />
                  ))}
                </div>
              </div>
              {/* Number of Patients */}
              <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Nombre de Patients</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={patientNumberData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: isDarkMode ? '#374151' : '#fff', border: 'none' }} />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar dataKey="male" fill="#DC143C" name="Homme" /> {/* Rouge cramoisi */}
                    <Bar dataKey="female" fill="#7B68EE" name="Femme" /> {/* Violet moyen */}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appointments Section with Patient Group */}
        <motion.div
          ref={appointmentsRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-green-900 mb-4">Rendez-vous</h2>

          {/* Section Liste des rendez-vous (pleinement étendue) */}
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md border border-gray-200 mb-8`}>
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-1/2">
                <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-green-600" />
                <input
                  type="text"
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  placeholder="Rechercher un patient..."
                  className={`pl-10 pr-4 py-2 rounded-md w-full border border-gray-300 focus:ring-2 focus:ring-green-600 ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={toggleModal2} 
                className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-1 hover:bg-green-700"
              >
                <FaPlus /> <span>Nouveau RDV</span>
              </motion.button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <th className="py-2 px-4 text-sm font-semibold text-green-900">Patient</th>
                    <th className="py-2 px-4 text-sm font-semibold text-green-900">Genre</th>
                    <th className="py-2 px-4 text-sm font-semibold text-green-900">Date & Heure</th>
                    <th className="py-2 px-4 text-sm font-semibold text-green-900">Maladie</th>
                    <th className="py-2 px-4 text-sm font-semibold text-green-900">Statut</th>
                    <th className="py-2 px-4 text-sm font-semibold text-green-900">Type</th>
                    <th className="py-2 px-4 text-sm font-semibold text-green-900">Rapport</th>
                    <th className="py-2 px-4 text-sm font-semibold text-green-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(apt => (
                    <RecentAppointment 
                      key={apt.id} 
                      {...apt} 
                      onView={() => handleViewAppointment(apt)}
                      onAccept={() => handleAppointmentAction(apt.id, 'accept')}
                      onRefuse={() => handleAppointmentAction(apt.id, 'refuse')}
                      onPostpone={() => handleAppointmentAction(apt.id, 'postpone')}
                      actionState={appointmentActions.get(apt.id) || { isProcessing: false, actionType: null }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section Groupe de patients (affichage horizontal) */}
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md border border-gray-200`}>
            <h3 className="text-lg font-semibold text-green-900 mb-4">Groupe de Patients</h3>
            <div className="flex space-x-4 overflow-x-auto">
              {patientGroups.map(group => (
                <PatientGroupCard key={group.disease} {...group} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Modal pour ajouter un rendez-vous */}
        <AnimatePresence>
          {isModalOpen2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} w-full max-w-md`}
              >
                <h3 className="text-xl font-bold mb-4">Nouveau Rendez-vous</h3>
                <form onSubmit={handleAddAppointment}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Patient</label>
                      <input
                        type="text"
                        value={newAppointment.patient}
                        onChange={(e) => setNewAppointment({ ...newAppointment, patient: e.target.value })}
                        className={`w-full p-2 rounded-md border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Genre</label>
                      <select
                        value={newAppointment.gender}
                        onChange={(e) => setNewAppointment({ ...newAppointment, gender: e.target.value as 'Homme' | 'Femme' })}
                        className={`w-full p-2 rounded-md border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                      >
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="date"
                        value={newAppointment.date}
                        onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                        className={`w-full p-2 rounded-md border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Heure</label>
                      <input
                        type="time"
                        value={newAppointment.time}
                        onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                        className={`w-full p-2 rounded-md border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Maladie</label>
                      <input
                        type="text"
                        value={newAppointment.disease}
                        onChange={(e) => setNewAppointment({ ...newAppointment, disease: e.target.value })}
                        className={`w-full p-2 rounded-md border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={newAppointment.type}
                        onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value as 'Présentiel' | 'Téléconsultation' })}
                        className={`w-full p-2 rounded-md border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                      >
                        <option value="Présentiel">Présentiel</option>
                        <option value="Téléconsultation">Téléconsultation</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400"
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 bg-green-600 text-white rounded-md flex items-center space-x-1 hover:bg-green-700 ${
                        isLoadingAction === 'add' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={isLoadingAction === 'add'}
                    >
                      {isLoadingAction === 'add' ? (
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <FaUserPlus /> <span>Ajouter</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Doctors Section */}
        <motion.div ref={doctorsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h2 className="text-2xl font-bold text-green-900 mb-4">Médecins</h2>
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md border border-gray-200`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map(doc => (
                <DoctorCard key={doc.id} {...doc} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Patients Section */}
        <div className="patients-section">

        {isLoading ? (
          <p>{("Chargement...")}</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-green-900'} mb-4`}>{('Patients')}</h2>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              {/* Barre de recherche */}
              <div className="mb-4">
                  <input
                    type="text"
                    placeholder={('Rechercher un patient')}
                    value={searchPatient}
                    onChange={(e) => setSearchPatient(e.target.value)}
                    className={`p-2 border rounded ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                  />
              </div>
              {filteredPatients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPatients.map(patient => (
                    <PatientCard
                      key={patient.id}
                      name={`${patient.firstName} ${patient.lastName}`}
                      patientId={patient.id}
                      appointmentTime={
                        // On récupère l'heure du rendez-vous correspondant (le premier trouvé)
                        appointments.find(app => app.patient?.id === patient.id)?.time
                      }
                      address={patient.adresse}
                      phone={patient.phoneNumber || ''}
                      bloodGroup={patient.bloodGroup}
                      lastDiagnosis={patient.lastDiagnosis}
                      status={patient.status}
                      reports={patient.reports}
                      image={patient.image} // Utilisation de l'image du patient s'il existe
                      doctorIllustration={doctorIllustration}
                    />
                  ))}
                </div>
              ) : (
                <p>{("Aucun patient trouvé")}</p>
              )}
            </div>
          </motion.div>
        )}
         </div>

        {/* Profile Section */}
        <motion.div ref={profileRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2 className="text-2xl font-bold text-green-900 mb-4">Profil</h2>
          <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md border border-gray-200`}>
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={`http://localhost:3000${doctor?.image || avatar}`}
                alt={`Dr. ${doctor?.firstName} ${doctor?.lastName}`}
                className="w-16 h-16 rounded-md border border-green-200"
              />
              <div>
                <h3 className="text-xl font-semibold text-green-900">
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </h3>
                <p className="text-sm text-green-600">
                  {doctor?.specialty?.name || "Spécialisation non renseignée"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-green-900">
              <p><strong>Email :</strong> {doctor?.email || "Non renseigné"}</p>
              <p><strong>Téléphone :</strong> {doctor?.phoneNumber || "Non renseigné"}</p>
              <p><strong>Adresse :</strong>{doctor?.address ?? ('notSpecified')}</p>
              <p><strong>Hôpital :</strong> {"UniSanté Dakar"}</p>
              <p><strong>Statut :</strong> {doctor?.availability === true ? 'Disponible' : doctor?.availability === false ? 'Indisponible' : 'Non spécifié'}</p>
              <p><strong>ID médical :</strong> {doctor?.id || "MED-XXXXXXXX"}</p>
            </div>
          </div>
        </motion.div>       

        {/* Profile Modal */}
        {isProfileModalOpen && doctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className={`p-6 rounded-xl max-w-md w-full ${isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-100'} border shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{('profile')}</h3>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className={`p-2 rounded-full hover:bg-gray-200 ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-600'}`}
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {('prenom')}
                    </label>
                    <input
                      type="text"
                      value={editedDoctor.firstName ?? doctor.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      className={`mt-1 w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {('nom')}
                    </label>
                    <input
                      type="text"
                      value={editedDoctor.lastName ?? doctor.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      className={`mt-1 w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {('email')}
                    </label>
                    <input
                      type="text"
                      value={editedDoctor.email ?? doctor.email ?? ''}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className={`mt-1 w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {('téléphone')}
                    </label>
                    <input
                      type="tel"
                      value={editedDoctor.phoneNumber ?? doctor.phoneNumber ?? ''}
                      onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                      className={`mt-1 w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {('adresse')}
                    </label>
                    <input
                      type="text"
                      value={editedDoctor.address ?? doctor.address}
                      onChange={(e) => handleProfileChange('address', e.target.value)}
                      className={`mt-1 w-full p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {('Disponibilité')}
                    </label>
                    <select
                      value={(editedDoctor.availability ?? doctor.availability) ? 'available' : 'unavailable'}
                      onChange={(e) =>
                        handleProfileChange('availability', e.target.value === 'available')
                      }
                      className={`mt-1 w-full p-2 border rounded-lg ${
                        isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                      }`}
                    >
                      <option value="available">Disponible</option>
                      <option value="unavailable">Indisponible</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className={`px-4 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white'}`}
                    >
                      {('Annuler')}
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className={`px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white'}`}
                    >
                      {('sauvegarder')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p><strong>{('nom')}: </strong>{doctor.firstName} {doctor.lastName}</p>
                  <p><strong>{('email')}: </strong>{doctor.email ?? ('notSpecified')}</p>
                  <p><strong>{('téléphone')}: </strong>{doctor.phoneNumber ?? ('notSpecified')}</p>
                  <p><strong>{('Adresse')}: </strong>{doctor.address ?? ('notSpecified')}</p>
                  <p><strong>{('Disponibilité')}:</strong> {doctor.availability === true ? 'Disponible' : doctor.availability === false ? 'Indisponible' : 'Non spécifié'}</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditedDoctor({
                          firstName: doctor.firstName,
                          lastName: doctor.lastName,
                          email: doctor.email,
                          phoneNumber: doctor.phoneNumber,
                          address: doctor.address,
                          availability: doctor.availability
                        });
                        setIsEditingProfile(true);
                      }}
                      className={`px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white'}`}
                    >
                      {('Modifier')}
                    </button>
                    <button
                      onClick={() => setIsProfileModalOpen(false)}
                      className={`px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white'}`}
                    >
                      {('Fermer')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}        

      </main>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f1f5f9'};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#6b7280' : '#9ca3af'};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#9ca3af' : '#6b7280'};
        }
      `}</style>
    </div>
  );
};

export default DashboardDoctor;