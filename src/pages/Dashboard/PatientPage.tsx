import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaCalendar, FaMapMarkerAlt, FaBell, FaUser, FaFileMedical, 
  FaStethoscope, FaHome, FaSignOutAlt, FaChevronLeft, FaChevronRight, 
  FaMoon, FaSun, FaQuestionCircle, 
  FaHeartbeat, FaPrescriptionBottleAlt, FaStar, FaList, FaLightbulb, FaTimes, FaComment 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from '@headlessui/react';
import Skeleton from 'react-loading-skeleton';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import "leaflet";

// Dark Mode CSS
const darkModeStyles = `
  .dark .react-calendar {
    background: #2d3748;
    color: #e2e8f0;
    border: 1px solid #4a5568;
  }
  .dark .react-calendar__tile {
    color: #e2e8f0;
  }
  .dark .react-calendar__tile--active {
    background: #48bb78;
    color: #fff;
  }
  .dark .leaflet-container {
    background: #2d3748;
  }
  .dark .leaflet-popup-content-wrapper, .dark .leaflet-popup-tip {
    background: #2d3748;
    color: #e2e8f0;
  }
  .dark .Toastify__toast {
    background: #2d3748;
    color: #e2e8f0;
  }
  .dark .react-loading-skeleton {
    background-color: #4a5568;
    background-image: linear-gradient(90deg, #4a5568, #718096, #4a5568);
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = darkModeStyles;
document.head.appendChild(styleSheet);

// Interfaces with optional and nullable types
interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate?: string;
  phoneNumber?: string;
  appointments: Appointment[];
  healthRecords: HealthRecord[];
  notifications: string[];
  profilePicture?: string;
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
}

interface HealthRecord {
  date: string;
  type: string;
  result: string;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  mail: string;
  availability: boolean;
  specialty: {
    id: number;
    name: string;
  };
}

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  distance: string;
  status: string;
  latitude: number;
  longitude: number;
}


interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

interface ActivityLog {
  date: string;
  action: string;
}

// Reusable Components with TypeScript Props
const StatCard = React.memo(
  ({ title, value, icon, className }: { title: string; value: string | number; icon: React.ReactNode; className: string }) => {
    const theme = useTheme();
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} 
        className={`p-6 rounded-2xl text-white shadow-lg cursor-pointer transition-all duration-300 ${className} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`text-3xl opacity-80 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`}>{icon}</span>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide opacity-90 text-white">{title}</h2>
              <p className="text-3xl font-extrabold text-white">{value}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

const NotificationCard = React.memo(
  ({ message, time, read, onClick }: { message: string; time: string; read: boolean; onClick: () => void }) => {
    const theme = useTheme();
    return (
      <motion.li 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        whileHover={{ backgroundColor: theme === 'dark' ? '#4a5568' : '#f7fafc' }} 
        className={`py-3 px-4 flex justify-between items-center rounded-lg transition-colors duration-200 ${read ? 'opacity-75' : theme === 'dark' ? 'bg-green-900' : 'bg-green-50'}`} 
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <FaBell className={`text-green-700 text-lg ${theme === 'dark' ? 'text-green-400' : ''}`} />
          <div>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-green-100' : 'text-green-900'}`}>{message}</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>{time}</p>
          </div>
        </div>
        {!read && <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-red-500 rounded-full" />}
      </motion.li>
    );
  }
);

const AppointmentCard = React.memo(
  ({ date, doctor, location, status,type, onAddToCalendar }: { date: string; doctor: string; location: string; status: string; type: string; onAddToCalendar: () => void }) => {
    const theme = useTheme();
    const { t } = useTranslation();
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }} 
        className={`p-6 rounded-2xl shadow-md transition-all duration-300 border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-100'}`}
      >
        <div className="flex items-center space-x-4 mb-4">
          <FaCalendar className={`text-green-500 text-2xl ${theme === 'dark' ? 'text-green-400' : ''}`} />
          <div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-green-100' : 'text-green-900'}`}>{date}</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>{t('doctor')}: {doctor}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-500'}`}>{t('location')}: {location}</p>
            <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-500'}`}>{t('type')}: {type}</p>
          </div>
        </div>
        <p className={`text-sm font-medium ${status === 'confirmed' ? 'text-green-700' : 'text-yellow-700'} ${theme === 'dark' ? 'text-green-400' : ''}`}>
          {t('status')}: {t(status)}
        </p>
        <button 
          onClick={onAddToCalendar} 
          className={`mt-2 px-4 py-2 rounded-lg hover:bg-blue-600 transition-all duration-300 ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white'}`}
        >
          {t('addToGoogleCalendar')}
        </button>
      </motion.div>
    );
  }
);

const DoctorList = React.memo(
  ({ doctors, onSelectDoctor }: { doctors: Doctor[]; onSelectDoctor: (doctor: Doctor) => void }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              whileHover={{ scale: 1.03 }}
              className={`p-4 rounded-xl shadow-md border ${
                theme === "dark"
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-100"
              }`}
            >
              <h3
                className={`text-lg font-semibold ${
                  theme === "dark" ? "text-green-100" : "text-green-900"
                }`}
              >
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-green-300" : "text-green-600"
                }`}
              >
                {t("specialty")}:  {doctor.specialty?.name || "Inconnue"}
              </p>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-green-300" : "text-green-600"
                }`}
              >
                {t("Localité")}: Unisante Clinic
              </p>
              <p
              className={`text-sm ${
                doctor.availability 
                  ? (theme === "dark" ? "text-green-300" : "text-green-600")
                  : (theme === "dark" ? "text-red-300" : "text-red-600")
              }`}
                >
                  {t("Statut")}: {doctor.availability ? t("Disponible") : t("Indisponible")}
                </p>
              <button
                onClick={() => onSelectDoctor(doctor)}
                className={`mt-2 px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-green-500 text-white"
                }`}
              >
                {t("bookAppointment")}
              </button>
            </motion.div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500">
            Aucun médecin trouvé
          </p>
        )}
      </div>
    );
  }
);

// Custom hook for theme
const useTheme = (): string => {
  const [theme] = useState('light');
  return theme;
};

// Main Component with TypeScript
const PatientPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<string>('light');
  // Extrait l'id de l'utilisateur depuis l'URL (par exemple, /patientPage/123)
  const { userId } = useParams<{ userId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [searchAppointments] = useState<string>(''); 
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filters] = useState<{ status: string; doctor: string; date: string }>({ status: '', doctor: '', date: '' }); 
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'patient' | 'doctor'; time: string; doctor?: string }[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [realTimeData, setRealTimeData] = useState<{ pulse: number; bloodPressure: string }>({ pulse: 0, bloodPressure: '' });
  const [prescriptions] = useState<{ name: string; dosage: string; startDate: string; endDate: string }[]>([
    { name: 'Paracetamol', dosage: '500mg, 2x/day', startDate: '01/03/2025', endDate: '15/03/2025' },
    { name: 'Amoxicillin', dosage: '250mg, 3x/day', startDate: '02/03/2025', endDate: '10/03/2025' },
  ]);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [favoritePharmacies, setFavoritePharmacies] = useState<string[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [selectedDoctorForChat, setSelectedDoctorForChat] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const appointmentsRef = useRef<HTMLDivElement>(null);
  const healthRecordsRef = useRef<HTMLDivElement>(null);
  const pharmaciesRef = useRef<HTMLDivElement>(null);
  const prescriptionsRef = useRef<HTMLDivElement>(null);
  const healthTipsRef = useRef<HTMLDivElement>(null);
  const activityLogRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const themeStyles: { [key: string]: string } = {
    light: 'bg-green-50 text-gray-900',
    dark: 'bg-gray-900 text-white',
    blue: 'bg-blue-50 text-blue-900',
  };

  useEffect(() => {
    axios.get('http://localhost:3000/pharmacies')
      .then(response => {
        // On suppose que l'API renvoie un tableau d'objets Pharmacy
        setPharmacies(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des pharmacies :", error);
        setIsLoading(false);
      });
  }, []);

   // On mélange aléatoirement la liste pour l'affichage sur la carte
   const shuffledPharmacies = React.useMemo(() => {
    const copy = [...pharmacies];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [pharmacies]);

   // On récupère les deux premières pharmacies pour l'affichage en liste
   const firstTwoPharmacies = pharmacies.slice(0, 4);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!userId) {
        console.warn("Aucun userId trouvé, arrêt du chargement.");
        return;
      }
  
      setIsLoading(true);
      try {
        // Récupération des informations du patient
        const { data: patientData } = await axios.get(`http://localhost:3000/patient/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
  
        // Récupération des rendez-vous du patient
        const { data: appointments } = await axios.get(`http://localhost:3000/appointments/patient/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
  
        // Valeurs par défaut pour healthRecords, notifications et profilePicture
        const defaultHealthRecords: HealthRecord[] = [
          { date: '20/02/2025', type: 'bloodTest', result: 'normal' },
          { date: '15/01/2025', type: 'generalCheckup', result: 'excellent' },
        ];
        const defaultNotifications = ['appointmentReminderTomorrow', 'newRecordAvailable'];
        const defaultProfilePicture = '/src/assets/images/profile.jpg';
  
        // Fusionner les données récupérées avec les valeurs par défaut si nécessaire
        const updatedPatient: Patient = {
          ...patientData,
          appointments, // Liste des rendez-vous récupérée depuis l'API
          healthRecords: patientData.healthRecords?.length ? patientData.healthRecords : defaultHealthRecords,
          notifications: patientData.notifications?.length ? patientData.notifications : defaultNotifications,
          profilePicture: patientData.profilePicture || defaultProfilePicture,
        };
  
        setPatient(updatedPatient);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        setError("Impossible de charger les données du patient.");
        toast.error("Erreur de chargement des données.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPatientData();
  }, [userId]);
  
  // récupération des médecins depuis l'API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:3000/doctor', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setDoctors(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des médecins :", error);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        pulse: Math.floor(Math.random() * (80 - 60 + 1)) + 60,
        bloodPressure: `${Math.floor(Math.random() * (120 - 90 + 1)) + 90}/${Math.floor(Math.random() * (80 - 60 + 1)) + 60}`,
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm(t('logoutConfirm'))) {
      window.location.reload();
      setActivityLog(prev => [...prev, { date: new Date().toLocaleDateString(), action: t('loggedOut') }]);
    }
  }, [t]);

  const markNotificationAsRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif)));
  }, []);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start'  });
    }
  };
  
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const toggleTheme = useCallback(() => setTheme(prev => (prev === 'light' ? 'dark' : prev === 'dark' ? 'blue' : 'light')), []);

  const filteredAppointments = useMemo(() => {
    if (!patient?.appointments) return [];
  
    return patient.appointments.filter((apt) => {
      const doctorFullName = `${apt.doctor?.firstName ?? ""} ${apt.doctor?.lastName ?? ""}`.toLowerCase();
      const appointmentDate = apt.date?.toLowerCase() || "";
      const appointmentLocation = "unisante clinic";
  
      return (
        (!filters.status || apt.status === filters.status) &&
        (!filters.doctor || doctorFullName.includes(filters.doctor.toLowerCase())) &&
        (!filters.date || appointmentDate.includes(filters.date.toLowerCase())) &&
        (doctorFullName.includes(searchAppointments.toLowerCase()) || 
         appointmentDate.includes(searchAppointments.toLowerCase()) || 
         appointmentLocation.includes(searchAppointments.toLowerCase()))
      );
    });
  }, [patient?.appointments, filters, searchAppointments]);
  

  const unreadNotifications = useMemo(() => notifications.filter(notif => !notif.read).length, [notifications]);

  // Function to convert data to CSV and trigger download
  const downloadCSV = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    };

  const exportAppointments = () => {
        const headers = ['ID,Date,Time,Doctor,Location,Status'];

        const rows = patient?.appointments?.map(apt => {
            const doctorName = `${apt.doctor?.firstName ?? ''} ${apt.doctor?.lastName ?? ''}`;
            const location = "Unisante Clinic";
            return `"${apt.id}","${apt.date}","${apt.time}","${doctorName}","${location}","${t(apt.status)}"`;
        }) ?? [];

        const csvContent = [headers.join(','), ...rows].join('\n');

        downloadCSV(csvContent, 'appointments.csv');
  };


  const exportHealthRecords = () => {
    const headers = ['Date,Type,Result'];
    const rows = patient?.healthRecords?.map(record => 
      `${record.date},${t(record.type)},${t(record.result)}`
    ) ?? [];
    const csvContent = [...headers, ...rows].join('\n');
    downloadCSV(csvContent, 'health_records.csv');
  };

  const exportPrescriptions = () => {
    const headers = ['Name,Dosage,Start Date,End Date'];
    const rows = prescriptions.map(prescription => 
      `${prescription.name},${prescription.dosage},${prescription.startDate},${prescription.endDate}`
    );
    const csvContent = [...headers, ...rows].join('\n');
    downloadCSV(csvContent, 'prescriptions.csv');
  };

  const exportToGoogleCalendar = (appointment: Appointment) => {
    const startDateTime = new Date(`${appointment.date}T${appointment.time}`); // Fusionne date et heure
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Ajoute 1h pour l'événement

    const start = startDateTime.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = endDateTime.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const doctorName = `${appointment.doctor?.firstName ?? ''} ${appointment.doctor?.lastName ?? ''}`;
    const location = "Unisante Clinic";

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=Rendez-vous avec ${doctorName}&dates=${start}/${end}&details=${location}`;

    window.open(url, '_blank');
};

  // Fonction pour ajouter/enlever une pharmacie des favoris
  const toggleFavorite = (pharmacyName: string) => {
    setFavoritePharmacies((prev) =>
      prev.includes(pharmacyName)
        ? prev.filter((name) => name !== pharmacyName)
        : [...prev, pharmacyName]
    );
  };

  const scheduleReminder = (prescription: { name: string; dosage: string }) => {
    const reminderTime = new Date();
    reminderTime.setMinutes(reminderTime.getMinutes() + 1);
    setTimeout(() => {
      toast.info(`${t('takeMedicationReminder')} ${prescription.name} (${prescription.dosage})`);
    }, reminderTime.getTime() - Date.now());
  };

  // Modification de handleDoctorSelect pour rediriger
  const handleSelectDoctor = (doctor: Doctor) => {
    // Par exemple, rediriger en passant les infos dans le state
    navigate('/appointments', { state: { doctor } });
  };

  const handleProfileClick = () => {
    scrollToSection(profileRef);
    setIsProfileModalOpen(true);
  };

  const handleSendMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() && selectedDoctorForChat) {
      const patientMessage = {
        text: e.currentTarget.value.trim(),
        sender: 'patient' as const,
        time: new Date().toLocaleTimeString(),
        doctor: selectedDoctorForChat.name 
      };
      setMessages([...messages, patientMessage]);

      setTimeout(() => {
        let doctorResponse = '';
        if (patientMessage.text.toLowerCase().includes('appointment')) {
          doctorResponse = t('doctorResponseAppointment', { doctor: selectedDoctorForChat.name });
        } else if (patientMessage.text.toLowerCase().includes('health')) {
          doctorResponse = t('doctorResponseHealth', { doctor: selectedDoctorForChat.name });
        } else if (patientMessage.text.toLowerCase().includes('symptom')) {
          doctorResponse = t('doctorResponseSymptom', { doctor: selectedDoctorForChat.name });
        } else {
          doctorResponse = t('doctorResponseGeneric', { doctor: selectedDoctorForChat.name });
        }

        setMessages(prev => [
          ...prev,
          { text: doctorResponse, sender: 'doctor' as const, time: new Date().toLocaleTimeString(), doctor: selectedDoctorForChat.name },
        ]);
      }, 1000);

      e.currentTarget.value = '';
    }
  };

  return (
    <div className={`min-h-screen flex font-sans antialiased ${themeStyles[theme]} transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 256 : 64 }}
        animate={{ width: isSidebarOpen ? 256 : 64 }}
        className={`bg-green-700 text-white p-4 flex flex-col fixed h-screen z-30 shadow-2xl transition-all duration-300 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}
      >
        <div className="flex items-center justify-between mb-8">
          <motion.div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <img src="/src/assets/images/logo-unisante.jpg" alt="UniSanté Logo" className="w-10 h-10 object-cover rounded-full" />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            aria-label={t('toggleSidebar')}
            className={`p-2 text-white hover:text-green-300 rounded-full bg-green-600/50 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}
          >
            {isSidebarOpen ? <FaChevronLeft className="text-xl" /> : <FaChevronRight className="text-xl" />}
          </motion.button>
        </div>
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center mb-8">
              <motion.div className={`w-20 h-20 rounded-full border-4 mb-3 overflow-hidden ${theme === 'dark' ? 'border-green-700/50' : 'border-white/20'}`}>
                {patient?.profilePicture ? (
                  <img src={patient.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className={`text-green-500 text-4xl w-full h-full flex items-center justify-center ${theme === 'dark' ? 'text-green-400 bg-gray-700' : 'bg-green-100'}`} />
                )}
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">{patient?.firstName ?? t('user')} {patient?.lastName ?? t('')}</h3>
            </motion.div>
          )}
        </AnimatePresence>
        <nav className="flex-1">
          <ul className="space-y-3">
            {[
              { label: t('dashboard'), icon: <FaHome />, ref: dashboardRef },
              { label: t('appointments'), icon: <FaCalendar />, ref: appointmentsRef },
              { label: t('healthRecords'), icon: <FaFileMedical />, ref: healthRecordsRef },
              { label: t('pharmacies'), icon: <FaMapMarkerAlt />, ref: pharmaciesRef },
              { label: t('prescriptions'), icon: <FaPrescriptionBottleAlt />, ref: prescriptionsRef },
              { label: t('healthTips'), icon: <FaLightbulb />, ref: healthTipsRef },
              { label: t('activityLog'), icon: <FaList />, ref: activityLogRef },
              { label: t('profile'), icon: <FaUser />, ref: profileRef },
            ].map((item, index) => (
              <motion.li key={index} whileHover={{ scale: 1.05, x: isSidebarOpen ? 5 : 0 }} whileTap={{ scale: 0.95 }} className="rounded-lg overflow-hidden">
                <button
                  onClick={() => item.ref && scrollToSection(item.ref)}
                  className={`flex items-center p-3 w-full text-left hover:bg-green-600 transition-colors duration-300 ${isSidebarOpen ? 'space-x-4' : 'justify-center'} text-white`}
                >
                  <span className="text-xl text-white">{item.icon}</span>
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-sm font-medium text-white">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.li>
            ))}
          </ul>
        </nav>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#dc2626' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className={`mt-auto flex items-center p-3 rounded-lg bg-red-700/80 hover:bg-red-600 transition-colors duration-200 ${isSidebarOpen ? 'space-x-4' : 'justify-center'} text-white ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}
        >
          <FaSignOutAlt className="text-lg text-white" />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-sm font-medium text-white">
                {t('logout')}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <header className={`flex justify-between items-center mb-6 p-6 rounded-2xl shadow-lg sticky top-4 z-10 ${theme === 'dark' ? 'bg-gray-800/90 text-white border-gray-700' : 'bg-white/95 text-gray-900 border-gray-100/50'} backdrop-blur-md border`}>
          <div className="flex items-center space-x-4">
            <motion.div className="w-12 h-12 rounded-full overflow-hidden">
              {patient?.profilePicture ? (
                <img src={patient.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className={`text-green-500 text-2xl w-full h-full flex items-center justify-center ${theme === 'dark' ? 'text-green-400 bg-gray-700' : 'bg-gray-200'}`}>+</span>
              )}
            </motion.div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} font-medium`}>{t('dashboard')}</p>
              <h1 className={`text-3xl font-bold tracking-tight ${theme === 'dark' ? 'text-green-100' : 'text-green-900'}`}>{t('welcome', {name: `${patient?.firstName ?? t('user')} ${patient?.lastName ? patient.lastName : ''}`} )}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Menu as="div" className="relative">
              <Menu.Button className={`p-2 ${theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-900 hover:text-green-600'} relative`}>
                <FaBell className="text-xl" />
                {unreadNotifications > 0 && (
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
                )}
              </Menu.Button>
              <Menu.Items className={`absolute right-0 mt-2 w-72 rounded-xl shadow-xl py-3 ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-green-900 border-gray-100'} border`}>
                {notifications.map((notif) => (
                  <Menu.Item key={notif.id}>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`block px-4 py-2 text-sm w-full text-left transition-colors duration-200 ${active ? (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100') : ''} ${theme === 'dark' ? 'text-white' : 'text-green-900'}`}
                      >
                        {notif.message}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleTheme} className={`p-2 ${theme === 'dark' ? 'text-green-400 hover:text-green-300 bg-green-700/20' : 'text-green-900 hover:text-green-600 bg-green-100'} rounded-full`}>
              {theme === 'dark' ? <FaSun /> : theme === 'blue' ? <FaMoon /> : <FaSun />}
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr')} className={`p-2 ${theme === 'dark' ? 'text-green-400 hover:text-green-300 bg-green-700/20' : 'text-green-900 hover:text-green-600 bg-green-100'} rounded-full`}>
              {t('changeLanguage')}
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsHelpOpen(true)} className={`p-2 ${theme === 'dark' ? 'text-green-400 hover:text-green-300 bg-green-700/20' : 'text-green-900 hover:text-green-600 bg-green-100'} rounded-full`}>
              <FaQuestionCircle size={20} />
            </motion.button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 rounded-xl mb-6 ${theme === 'dark' ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-900'}`}>
            {error}
          </motion.div>
        )}

        {/* Dashboard Section */}
        <motion.div ref={dashboardRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <h2 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-green-100' : 'text-green-900'}`}>{t('overview')}</h2>
          {isLoading ? (
            <Skeleton count={5} height={100} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title={t('appointments')} value={`${patient?.appointments?.length ?? 0}+`} icon={<FaCalendar />} className="bg-gradient-to-br from-green-600 to-green-400" />
              <StatCard title={t('healthRecords')} value={`${patient?.healthRecords?.length ?? 0}+`} icon={<FaFileMedical />} className="bg-gradient-to-br from-green-500 to-green-300" />
              <StatCard title={t('notifications')} value={`${unreadNotifications}+`} icon={<FaBell />} className="bg-gradient-to-br from-green-400 to-green-200" />
              <StatCard title={t('pulse')} value={`${realTimeData.pulse} bpm`} icon={<FaHeartbeat />} className="bg-gradient-to-br from-green-600 to-green-400" />
              <StatCard title={t('bloodPressure')} value={realTimeData.bloodPressure} icon={<FaStethoscope />} className="bg-gradient-to-br from-green-500 to-green-300" />
            </div>
          )}
        </motion.div>

        {/* Appointments Section */}
        <motion.div ref={appointmentsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <h2 className={`text-3xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-green-100' : 'text-green-900'}`}>
            <FaCalendar className={`mr-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />{t('appointments')}
          </h2>
          {isLoading ? (
            <Skeleton count={3} height={150} />
          ) : (
            <div className={`p-6 rounded-2xl shadow-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border`}>
              <h3 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-green-100' : 'text-green-800'}`}>{t('myAppointments')}</h3>
              {filteredAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {filteredAppointments.map((apt) => (
                    <AppointmentCard 
                    key={apt.id} 
                    date={`${apt.date} ${apt.time}`} 
                    doctor={`${apt.doctor?.firstName ?? ''} ${apt.doctor?.lastName ?? ''}`} 
                    location={"Unisante Clinic"} 
                    status={apt.status} 
                    type={apt.type}
                    onAddToCalendar={() => exportToGoogleCalendar(apt)} 
                  />                  
                  ))}
                </div>
              ) : (
                <p className={`text-gray-500 mb-6 ${theme === 'dark' ? 'text-gray-400' : ''}`}>{t('noAppointments')}</p>
              )}
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                className={`mb-8 px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white'}`} 
                onClick={exportAppointments}
              >
                {t('exportAppointments')}
              </motion.button>

              <h3 className={`text-2xl font-semibold mb-4 ${theme === 'dark' ? 'text-green-100' : 'text-green-800'}`}>{t('bookNewAppointment')}</h3>
              <DoctorList doctors={doctors} onSelectDoctor={handleSelectDoctor} />
              <Calendar
                onChange={(value: Value) => setCalendarDate(value as Date)}
                value={calendarDate}
                tileContent={({ date }) => {
                  const hasAppointment = patient?.appointments.some(apt => 
                    new Date(apt.date.split(' ')[0]).toDateString() === date.toDateString()
                  );
                  return hasAppointment ? <span className={`w-2 h-2 ${theme === 'dark' ? 'bg-green-400' : 'bg-green-500'} rounded-full inline-block`} /> : null;
                }}
                className={theme === 'dark' ? 'dark' : ''}
              />
            </div>
          )}
        </motion.div>

        {/* Health Records Section */}
        <motion.div ref={healthRecordsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <h2 className={`text-3xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-green-100' : 'text-green-900'}`}><FaFileMedical className={`mr-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />{t('healthRecords')}</h2>
          {isLoading ? (
            <Skeleton count={3} height={150} />
          ) : (
            <div className={`p-6 rounded-2xl shadow-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border`}>
              <LineChart width={600} height={300} data={patient?.healthRecords?.map((record) => ({ date: record.date, value: record.result === 'normal' ? 1 : 2 })) ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
                <XAxis dataKey="date" stroke={theme === 'dark' ? '#a0aec0' : '#4a5568'} />
                <YAxis stroke={theme === 'dark' ? '#a0aec0' : '#4a5568'} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#2d3748' : '#fff', border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`, color: theme === 'dark' ? '#e2e8f0' : '#4a5568' }} />
                <Legend wrapperStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#4a5568' }} />
                <Line type="monotone" dataKey="value" stroke="#10B981" />
              </LineChart>
              <motion.button whileHover={{ scale: 1.05 }} className={`mt-6 px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white'}`} onClick={exportHealthRecords}>
                {t('exportHealthRecords')}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Pharmacies Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12 relative"
        >
          <h2
            className={`text-3xl font-bold mb-6 flex items-center ${
              theme === "dark" ? "text-green-100" : "text-green-900"
            }`}
          >
            <FaMapMarkerAlt
              className={`mr-3 ${
                theme === "dark" ? "text-green-400" : "text-green-500"
              }`}
            />
            {t("pharmacies")}
          </h2>

          {isLoading ? (
            <Skeleton count={3} height={150} />
          ) : (
            <div
              className={`p-6 rounded-2xl shadow-md ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              } border`}
            >
              {/* Carte affichant toutes les pharmacies */}
              <MapContainer
                center={[14.6928, -17.4467] as [number, number]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
                className={theme === "dark" ? "dark" : ""}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {shuffledPharmacies.map((pharmacy, index) => (
                  <Marker key={pharmacy.id || index} position={[pharmacy.latitude, pharmacy.longitude]}>
                    <Popup>
                      <div
                        className={`p-2 rounded-md ${
                          theme === "dark" ? "text-white bg-gray-900" : "text-black"
                        }`}
                      >
                        <strong>{pharmacy.name}</strong>
                        <br />
                        {t("Status")}: {pharmacy.status}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Liste des deux premières pharmacies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {firstTwoPharmacies.map((pharmacy, index) => (
                  <motion.div
                    key={pharmacy.id || index}
                    className={`p-6 rounded-2xl shadow-md border ${
                      theme === "dark"
                        ? "bg-gray-800 text-white border-gray-700"
                        : "bg-white text-gray-900 border-gray-100"
                    }`}
                  >
                    <h3
                      className={`text-lg font-semibold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {pharmacy.name}
                    </h3>
                    <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                      {pharmacy.address}
                    </p>
                    <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                      {t("Status")}: {pharmacy.status}
                    </p>
                    <button
                      onClick={() => toggleFavorite(pharmacy.name)}
                      className={`mt-3 px-4 py-2 rounded-lg flex items-center gap-2 ${
                        favoritePharmacies.includes(pharmacy.name)
                          ? "bg-yellow-500 text-white"
                          : theme === "dark"
                          ? "bg-gray-600 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <FaStar />
                      {favoritePharmacies.includes(pharmacy.name)
                        ? t("Unfavorite")
                        : t("Favorite")}
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* ✅ Bouton pour voir toutes les pharmacies (bien placé sous la liste) */}
              <div className="flex justify-center mt-6">
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                  onClick={() => navigate("/pharmacies")}
                >
                  {t("Voir toutes les pharmacies")}
                </button>
              </div>
            </div>
          )}
        </motion.div>


        {/* Prescriptions Section */}
        <motion.div ref={prescriptionsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <h2 className={`text-3xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-green-100' : 'text-green-900'}`}><FaPrescriptionBottleAlt className={`mr-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />{t('prescriptions')}</h2>
          {isLoading ? (
            <Skeleton count={3} height={150} />
          ) : (
            <div className={`p-6 rounded-2xl shadow-md ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border`}>
              <ul className="space-y-4">
                {prescriptions.map((prescription, index) => (
                  <motion.li key={index} className={`p-4 rounded-xl shadow-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-100'}`}>
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{prescription.name}</h3>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('dosage')}: {prescription.dosage}</p>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('from')} {prescription.startDate} {t('to')} {prescription.endDate}</p>
                    <button onClick={() => scheduleReminder(prescription)} className={`mt-2 px-4 py-2 rounded-lg hover:bg-yellow-700 transition-all duration-300 ${theme === 'dark' ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'}`}>
                      {t('setReminder')}
                    </button>
                  </motion.li>
                ))}
              </ul>
              <motion.button whileHover={{ scale: 1.05 }} className={`mt-6 px-6 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white'}`} onClick={exportPrescriptions}>
                {t('exportPrescriptions')}
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Health Tips Section */}
        <motion.div ref={healthTipsRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <h2 className={`text-3xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-green-100' : 'text-green-900'}`}>
            <FaLightbulb className={`mr-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
            {t('healthTips')}
          </h2>
          {isLoading ? (
            <Skeleton count={2} height={150} />
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              {[
                { title: t('stayHydrated'), content: t('drinkWaterDaily') },
                { title: t('exercise'), content: t('exerciseDaily') },
              ].map((tip, index) => (
                <motion.div key={index} className={`p-6 rounded-2xl shadow-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-100'}`}>
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tip.title}</h3>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{tip.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Activity Log Section */}
        <motion.div ref={activityLogRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <h2 className={`text-3xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-green-100' : 'text-green-900'}`}>
            <FaList className={`mr-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
            {t('activityLog')}
          </h2>
          {isLoading ? (
            <Skeleton count={3} height={100} />
          ) : (
            <ul className={`space-y-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              {activityLog.map((activity, index) => (
                <motion.li key={index} className={`p-4 rounded-xl shadow-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-100'}`}>
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{activity.date} - {activity.action}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Profile Section */}
        <motion.div ref={profileRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
          <h2 className={`text-3xl font-bold mb-6 flex items-center ${theme === 'dark' ? 'text-green-100' : 'text-green-900'}`}>
            <FaUser className={`mr-3 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />{t('profile')}
          </h2>
          {isLoading ? (
            <Skeleton count={3} height={150} />
          ) : (
            <div className={`p-6 rounded-2xl shadow-md ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-100'} border`}>
              <p><strong>{t('name')}: </strong>{patient?.firstName ?? t('notSpecified')}     {patient?.lastName ?? t('notSpecified')}</p>
              <p><strong>{t('email')}: </strong>{patient?.email ?? t('notSpecified')}</p>
              <p><strong>{t('phone')}: </strong>{patient?.phoneNumber ?? t('notSpecified')}</p>
            </div>
          )}
        </motion.div>

        {/* Chat Modal */}
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`fixed top-20 right-8 w-96 rounded-xl shadow-2xl p-4 z-50 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t('chatWithUniSanteDoctors')}
              </h3>
              <button 
                onClick={() => setIsChatOpen(false)} 
                className={`p-2 rounded-full hover:bg-gray-200 ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-600'}`}
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            {!selectedDoctorForChat ? (
              <div className="mb-4">
                <h4 className={`text-md font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {t('selectDoctorToChat')}
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctorForChat(doctor)}
                      className={`w-full p-2 mb-2 rounded-lg hover:bg-gray-200 transition-colors ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-900'}`}
                    >
                      {doctor.firstName} ({t(doctor.specialty?.name)})
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="h-48 overflow-y-auto mb-4">
                  {messages
                    .filter(msg => msg.doctor === selectedDoctorForChat.firstName)
                    .map((msg, index) => (
                      <div key={index} className={`mb-2 ${msg.sender === 'patient' ? 'text-right' : 'text-left'}`}>
                        <p className={`inline-block p-2 rounded-lg ${msg.sender === 'patient' ? theme === 'dark' ? 'bg-green-700 text-white' : 'bg-green-200 text-green-900' : theme === 'dark' ? 'bg-blue-700 text-white' : 'bg-blue-200 text-blue-900'}`}>
                          {msg.text} <span className="text-xs">{msg.time}</span>
                        </p>
                      </div>
                    ))}
                </div>
                <input
                  type="text"
                  placeholder={t('typeMessage')}
                  className={`w-full p-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-600'}`}
                  onKeyPress={handleSendMessage}
                />
                <button 
                  onClick={() => setSelectedDoctorForChat(null)}
                  className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'}`}
                >
                  {t('changeDoctor')}
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* Help Modal */}
        {isHelpOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`p-6 rounded-xl max-w-md w-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
              <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('helpAndFAQ')}</h3>
              <ul className="list-disc pl-5">
                <li className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('howToSchedule')}</li>
                <li className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('howToViewRecords')}</li>
                <li className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{t('contactUs')}</li>
              </ul>
              <button onClick={() => setIsHelpOpen(false)} className={`mt-4 px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 ${theme === 'dark' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white'}`}>{t('close')}</button>
            </motion.div>
          </motion.div>
        )}

        {/* Profile Modal */}
        {isProfileModalOpen && patient && (
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
              className={`p-6 rounded-xl max-w-md w-full ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-100'} border shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('profile')}</h3>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className={`p-2 rounded-full hover:bg-gray-200 ${theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-600'}`}
                >
                  <FaTimes className="text-lg" />
                </button>
    </div>
              <div className="space-y-4">
                <p><strong>{t('name')}: </strong>{patient.firstName}  {patient.lastName}</p>
                <p><strong>{t('email')}: </strong>{patient.email ?? t('notSpecified')}</p>
                <p><strong>{t('phone')}: </strong>{patient.phoneNumber ?? t('notSpecified')}</p>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className={`mt-4 px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-300 ${theme === 'dark' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white'}`}
              >
                {t('close')}
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Floating Chat Button */}
        <motion.button 
          whileHover={{ scale: 1.1 }} 
          onClick={() => setIsChatOpen(true)} 
          className={`fixed bottom-20 right-8 p-4 rounded-full z-40 ${theme === 'dark' ? 'bg-green-700 text-white' : 'bg-green-700 text-white'}`}
        >
          <FaComment size={24} />
        </motion.button>

        <ToastContainer />
      </main>
    </div>
  );
};

export default PatientPage;