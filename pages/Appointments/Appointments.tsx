import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from 'react-modal';
import { useTranslation } from 'react-i18next';

Modal.setAppElement('#root');

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

interface AppointmentPageState {
  doctor: Doctor;
}

const AppointmentPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { doctor } = (location.state as AppointmentPageState) || {};
  // Extrait l'id du patient depuis l'URL (ex: /appointments/123)
  const { patientId } = useParams<{ patientId: string }>();

  // Si aucun médecin n'est passé, rediriger vers la page précédente
  useEffect(() => {
    if (!doctor) {
      toast.error(t("Aucun médecin sélectionné."));
      navigate(-1);
    }
  }, [doctor, navigate, t]);

  // Étapes du flow
  const [step, setStep] = useState<number>(1);

  // Étape 1 : Détails du rendez-vous
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('Présentiel'); // "Présentiel" ou "Téléconsultation"

  const initialTimes = ["08:00", "08:15", "08:30", "08:45", "09:00", "09:15", "09:30", "09:45"];
  const additionalTimes = ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15"];
  const [showMoreHours, setShowMoreHours] = useState<boolean>(false);
  const availableTimes = showMoreHours ? [...initialTimes, ...additionalTimes] : initialTimes;
  const [bookedAppointments, setBookedAppointments] = useState<string[]>([]);

  // Étape 2 : Vérification par email
  const [email, setEmail] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  // Étape 3 : Saisie du code de vérification
  const [code, setCode] = useState<string>('');

  // Modal pour confirmation finale
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Récupérer les créneaux réservés pour le médecin le jour sélectionné
  useEffect(() => {
    if (doctor && selectedDate) {
      // Récupérer les créneaux réservés pour le médecin à une date donnée
      axios.get(`http://localhost:3000/appointments/doctor/${doctor.id}`, {
        params: { date: selectedDate },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(response => {
        if (Array.isArray(response.data)) {
          // On récupère les créneaux réservés pour cette date
          const timesWithoutSeconds = response.data.map((rdv: { time: string }) => rdv.time.substring(0, 5));
          setBookedAppointments(timesWithoutSeconds); // Par exemple : ["08:15", "09:00"]
        } else {
          console.error("Format de réponse inattendu :", response.data);
        }
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des créneaux réservés :", error);
      });
    }
  }, [doctor, selectedDate]);
  

  // Envoi du code de vérification par email
  const sendVerificationCode = async () => {
    try {
      const response = await axios.post('http://localhost:3000/mail/send-code', { email });
      setVerificationCode(response.data.code);
      toast.success(t("Le code a été envoyé."));
    } catch (error) {
      console.error("Erreur lors de l'envoi du code :", error);
      toast.error(t("Erreur lors de l'envoi du code."));
    }
  };

  // Gestion de la navigation entre les étapes
  const handleNext = async () => {
    if (step === 1) {
      if (!selectedDate) { alert(t("Veuillez sélectionner une date.")); return; }
      if (!selectedTime) { alert(t("Veuillez sélectionner une heure.")); return; }
      if (!appointmentType) { alert(t("Veuillez sélectionner un type de consultation.")); return; }
      setStep(2);
    } else if (step === 2) {
      if (!email) { alert(t("Veuillez saisir votre email.")); return; }
      if (!termsAccepted) { alert(t("Vous devez accepter les CGU et la politique de confidentialité.")); return; }
      await sendVerificationCode();
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCodeSubmit = () => {
    if (code === verificationCode) {
      setStep(4);
      setIsModalOpen(true);
    } else {
      alert(t("Code invalide, veuillez réessayer."));
    }
  };

  // Confirmation finale : affichage du récapitulatif et sauvegarde du rendez-vous
  const handleAppointmentConfirm = () => {
    axios.post('http://localhost:3000/appointments', {
      doctorId: doctor?.id,
      date: selectedDate,
      time: selectedTime,
      status: "en attente",
      type: appointmentType,
      patientId: patientId ? parseInt(patientId, 10) : null,
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    .then(() => {
      toast.success(t("Votre rendez-vous a été réservé avec succès."));
      setIsModalOpen(false);
      navigate(`/patientPage/${localStorage.getItem("userId")}`);
    })
    .catch(error => {
      console.error("Erreur lors de la réservation du rendez-vous :", error);
      console.log("Données envoyées :", {
        doctorId: doctor?.id,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
        type: appointmentType,
        patientId: patientId ? parseInt(patientId, 10) : null,
      });
      
      toast.error(t("Erreur lors de la réservation du rendez-vous."));
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Colonne gauche (image) */}
      <div className="hidden md:block md:w-1/2">
        <img 
          src="/images/Orthopedic-amico.png" 
          alt="Prise de rendez-vous" 
          className="w-full h-screen object-cover"
        />
      </div>

      {/* Colonne droite : Flow de réservation */}
      <div className="w-full md:w-1/2 p-8 bg-green-500">
        {/* Bloc Médecin sélectionné */}
        {doctor && (
          <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{t("Médecin sélectionné")}</h2>
            <p className="mt-2 text-lg">{doctor.firstName} {doctor.lastName}</p>
            <p className="text-gray-600">{doctor.specialty?.name}</p>
            <p className="text-gray-600">{doctor.mail}</p>
          </div>
        )}

        {/* Indicateur de progression */}
        <div className="flex justify-between mb-6 text-white">
          {["Date/Heure", "Vérification", "Code", "Confirmation"].map((label, idx) => (
            <div key={idx} className={`flex-1 text-center ${step >= idx + 1 ? 'font-bold' : 'opacity-50'}`}>
              {label}
            </div>
          ))}
        </div>

        {/* Étape 1 : Détails du rendez-vous */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-xl font-semibold mb-4">{t("Choisissez les détails de votre rendez-vous")}</h2>
            <div className="mb-4">
              <label className="block mb-2">{t("Sélectionnez une date")}</label>
              <input 
                type="date" 
                className="w-full p-2 border border-gray-300 rounded"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime(""); // réinitialiser l'heure si la date change
                }}
              />
            </div>
            {selectedDate && (
              <>
                <h3 className="text-lg font-semibold mb-2">{t("Sélectionnez une heure")}</h3>
                <div className="grid grid-cols-4 gap-2 mb-2">
                {availableTimes.map((timeSlot) => {
                  const isBooked = bookedAppointments.includes(timeSlot); // Vérifie si le créneau est réservé
                  return (
                    <button 
                      key={timeSlot} 
                      disabled={isBooked}
                      className={`p-2 border rounded ${selectedTime === timeSlot 
                        ? 'bg-green-600 text-white' 
                        : isBooked 
                          ? 'bg-red-500 text-white cursor-not-allowed' 
                          : 'bg-gray-200 hover:bg-gray-300'}`}
                      onClick={() => !isBooked && setSelectedTime(timeSlot)} // Ne change pas l'heure si déjà réservé
                    >
                      {timeSlot}
                    </button>
                  );
                })}

                </div>
                {!showMoreHours && (
                  <button 
                    className="text-green-600 underline text-sm"
                    onClick={() => setShowMoreHours(true)}
                  >
                    {t("Voir plus d'horaires")}
                  </button>
                )}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">{t("Sélectionnez le type de consultation")}</h3>
                  <div className="flex space-x-4">
                    {["Présentiel", "Téléconsultation"].map((type) => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-100">
                        <input 
                          type="radio" 
                          name="appointmentType" 
                          value={type} 
                          checked={appointmentType === type} 
                          onChange={(e) => setAppointmentType(e.target.value)} 
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-between mt-6">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => navigate(-1)}
              >
                {t("Annuler")}
              </button>
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleNext}
              >
                {t("Suivant")}
              </button>
            </div>
          </div>
        )}

        {/* Étape 2 : Vérification par email */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-xl font-semibold mb-4">{t("Vérifiez votre rendez-vous")}</h2>
            <div className="mb-4">
              <label className="block font-medium mb-1">{t("Email")}</label>
              <input 
                type="email" 
                className="w-full p-2 border border-gray-300 rounded"
                placeholder={t("Entrez votre email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <small className="text-gray-500">{t("Un code vous sera envoyé pour valider votre rendez-vous.")}</small>
            </div>
            <div className="flex items-center mb-4">
              <input 
                type="checkbox"
                className="mr-2"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
              />
              <span className="text-gray-700 text-sm">
                {t("En cliquant sur 'Suivant', vous acceptez les CGU et la politique de confidentialité.")}
              </span>
            </div>
            <div className="flex justify-between">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={handleBack}
              >
                {t("Précédent")}
              </button>
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleNext}
              >
                {t("Suivant")}
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 : Saisie du code de vérification */}
        {step === 3 && (
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-xl font-semibold mb-4">{t("Entrez votre code de vérification")}</h2>
            <div className="mb-4">
              <input 
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder={t("Code à 6 chiffres max")}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className="flex justify-between mt-6">
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={handleBack}
              >
                {t("Précédent")}
              </button>
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleCodeSubmit}
              >
                {t("Valider le code")}
              </button>
            </div>
          </div>
        )}

        {/* Étape 4 : Confirmation finale dans la modal avec récapitulatif complet */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="bg-white rounded-lg shadow-xl p-8 w-11/12 md:w-1/2"
          overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center"
        >
          {step === 4 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">{t("Confirmation finale")}</h2>
              <div className="text-left mb-4 border p-4 rounded bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">{t("Récapitulatif du rendez-vous")}</h3>
                <p><strong>{t("Médecin")}:</strong> {doctor?.firstName} {doctor?.lastName}</p>
                <p><strong>{t("Spécialité")}:</strong> {doctor?.specialty?.name}</p>
                <p><strong>{t("Email du médecin")}:</strong> {doctor?.mail}</p>
                <p><strong>{t("Date")}:</strong> {selectedDate}</p>
                <p><strong>{t("Heure")}:</strong> {selectedTime}</p>
                <p><strong>{t("Type de consultation")}:</strong> {appointmentType}</p>
                <p><strong>{t("Patient")}:</strong> {t("Vous êtes connecté(e)")}</p>
              </div>
              <div className="flex justify-between">
                <button 
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  onClick={() => { setIsModalOpen(false); navigate(-1); }}
                >
                  {t("Annuler")}
                </button>
                <button 
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  onClick={handleAppointmentConfirm}
                >
                  {t("Confirmer le rendez-vous")}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AppointmentPage;
