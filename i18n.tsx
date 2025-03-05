import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      dashboard: 'Dashboard',
      welcome: 'Welcome, {{name}}!',
      user: 'User',
      overview: 'Overview',
      appointments: 'Appointments',
      healthRecords: 'Health Records',
      notifications: 'Notifications',
      pulse: 'Pulse',
      bloodPressure: 'Blood Pressure',
      myAppointments: 'My Appointments',
      noAppointments: 'No appointments scheduled.',
      exportAppointments: 'Export Appointments (CSV)', // Updated for clarity
      doctor: 'Doctor',
      location: 'Location',
      status: 'Status',
      confirmed: 'Confirmed',
      pending: 'Pending',
      addToGoogleCalendar: 'Add to Google Calendar',
      bookNewAppointment: 'Book a New Appointment',
      specialty: 'Specialty',
      cardiologist: 'Cardiologist',
      generalPractitioner: 'General Practitioner',
      pediatrician: 'Pediatrician',
      bookAppointment: 'Book Appointment',
      healthRecordsList: 'Health Records List',
      exportHealthRecords: 'Export Health Records (CSV)', // Updated for clarity
      pharmacies: 'Pharmacies',
      distance: 'Distance',
      favorite: 'Favorite',
      unfavorite: 'Unfavorite',
      prescriptions: 'Prescriptions',
      dosage: 'Dosage',
      from: 'From',
      to: 'to',
      setReminder: 'Set Reminder',
      takeMedicationReminder: 'Time to take your medication:',
      prescriptionsList: 'Prescriptions List',
      exportPrescriptions: 'Export Prescriptions (CSV)', // Updated for clarity
      healthTips: 'Health Tips',
      stayHydrated: 'Stay Hydrated',
      drinkWaterDaily: 'Drink at least 8 glasses of water daily.',
      exercise: 'Exercise Regularly',
      exerciseDaily: 'Aim for 30 minutes of exercise daily.',
      activityLog: 'Activity Log',
      loggedIn: 'Logged in',
      updatedProfile: 'Updated profile',
      loggedOut: 'Logged out',
      profile: 'Profile',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      notSpecified: 'Not specified',
      toggleSidebar: 'Toggle Sidebar',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to logout?',
      dataLoadError: 'Error loading data. Please try again.',
      chatWithUniSanteDoctors: 'Chat with UniSanté Doctors',
      typeMessage: 'Type a message...',
      close: 'Close',
      helpAndFAQ: 'Help & FAQ',
      howToSchedule: 'How to schedule an appointment: Go to the Appointments section and select "Book a New Appointment".',
      howToViewRecords: 'How to view health records: Navigate to the Health Records section.',
      contactUs: 'Contact us at support@unisante.com for assistance.',
      changeLanguage: '🌐',
      bookAppointmentWith: 'Book an appointment with {{doctor}} ({{specialty}})',
      selectSlot: 'Select a time slot',
      cancel: 'Cancel',
      confirm: 'Confirm',
      appointmentBooked: 'Appointment booked with {{doctor}} on {{date}}!',
      doctorResponseAppointment: 'Please provide your appointment details, and I’ll assist you in scheduling or checking its status.',
      doctorResponseHealth: 'Could you specify your health concern? I’ll provide guidance or recommend a consultation.',
      doctorResponseSymptom: 'Please describe your symptoms in detail, and I’ll advise you on the next steps or suggest seeing a doctor.',
      doctorResponseGeneric: 'How can I assist you today? Please provide more details about your query.',
      bloodTest: 'Blood Test', // Added for health record types
      generalCheckup: 'General Checkup', // Added for health record types
      normal: 'Normal', // Added for health record results
      excellent: 'Excellent' // Added for health record results
    }
  },
  fr: {
    translation: {
      dashboard: 'Tableau de bord',
      welcome: 'Bienvenue, {{name}} !',
      user: 'Utilisateur',
      overview: 'Vue d’ensemble',
      appointments: 'Rendez-vous',
      healthRecords: 'Dossiers médicaux',
      notifications: 'Notifications',
      pulse: 'Pouls',
      bloodPressure: 'Pression artérielle',
      myAppointments: 'Mes rendez-vous',
      noAppointments: 'Aucun rendez-vous planifié.',
      exportAppointments: 'Exporter les rendez-vous (CSV)', // Updated for clarity
      doctor: 'Médecin',
      location: 'Lieu',
      status: 'Statut',
      confirmed: 'Confirmé',
      pending: 'En attente',
      addToGoogleCalendar: 'Ajouter au calendrier Google',
      bookNewAppointment: 'Prendre un nouveau rendez-vous',
      specialty: 'Spécialité',
      cardiologist: 'Cardiologue',
      generalPractitioner: 'Médecin généraliste',
      pediatrician: 'Pédiatre',
      bookAppointment: 'Prendre rendez-vous',
      healthRecordsList: 'Liste des dossiers médicaux',
      exportHealthRecords: 'Exporter les dossiers médicaux (CSV)', // Updated for clarity
      pharmacies: 'Pharmacies',
      distance: 'Distance',
      favorite: 'Favori',
      unfavorite: 'Retirer des favoris',
      prescriptions: 'Ordonnances',
      dosage: 'Dosage',
      from: 'Du',
      to: 'au',
      setReminder: 'Définir un rappel',
      takeMedicationReminder: 'Il est temps de prendre votre médicament :',
      prescriptionsList: 'Liste des ordonnances',
      exportPrescriptions: 'Exporter les ordonnances (CSV)', // Updated for clarity
      healthTips: 'Conseils de santé',
      stayHydrated: 'Restez hydraté',
      drinkWaterDaily: 'Buvez au moins 8 verres d’eau par jour.',
      exercise: 'Faites de l’exercice régulièrement',
      exerciseDaily: 'Visez 30 minutes d’exercice par jour.',
      activityLog: 'Journal d’activité',
      loggedIn: 'Connecté',
      updatedProfile: 'Profil mis à jour',
      loggedOut: 'Déconnecté',
      profile: 'Profil',
      name: 'Nom',
      email: 'Email',
      phone: 'Téléphone',
      notSpecified: 'Non spécifié',
      toggleSidebar: 'Basculer la barre latérale',
      logout: 'Déconnexion',
      logoutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      dataLoadError: 'Erreur de chargement des données. Veuillez réessayer.',
      chatWithUniSanteDoctors: 'Discuter avec les médecins de UniSanté',
      typeMessage: 'Tapez un message...',
      close: 'Fermer',
      helpAndFAQ: 'Aide & FAQ',
      howToSchedule: 'Comment planifier un rendez-vous : Allez dans la section Rendez-vous et sélectionnez "Prendre un nouveau rendez-vous".',
      howToViewRecords: 'Comment consulter les dossiers médicaux : Naviguez vers la section Dossiers médicaux.',
      contactUs: 'Contactez-nous à support@unisante.com pour assistance.',
      changeLanguage: '🌐',
      bookAppointmentWith: 'Prendre un rendez-vous avec {{doctor}} ({{specialty}})',
      selectSlot: 'Sélectionnez un créneau horaire',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      appointmentBooked: 'Rendez-vous réservé avec {{doctor}} le {{date}} !',
      doctorResponseAppointment: 'Veuillez fournir les détails de votre rendez-vous, et je vous aiderai à planifier ou vérifier son statut.',
      doctorResponseHealth: 'Pouvez-vous préciser votre souci de santé ? Je vous donnerai des conseils ou recommanderai une consultation.',
      doctorResponseSymptom: 'Décrivez vos symptômes en détail, et je vous conseillerai sur les prochaines étapes ou suggérerai de consulter un médecin.',
      doctorResponseGeneric: 'Comment puis-je vous aider aujourd’hui ? Veuillez fournir plus de détails sur votre requête.',
      bloodTest: 'Analyse de sang', // Added for health record types
      generalCheckup: 'Bilan général', // Added for health record types
      normal: 'Normal', // Added for health record results
      excellent: 'Excellent' // Added for health record results
    }
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safely escapes values
    }
  });

export default i18n;