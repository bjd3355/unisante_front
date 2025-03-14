import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  unreadCount?: number; // renvoyé par l'API pour indiquer les messages non lus
}

interface Message {
  id: number;
  sender: 'patient' | 'assistance';
  text: string;
  timestamp: string;
}

const Assistance: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Chargement initial et rafraîchissement périodique de la liste des patients
  useEffect(() => {
    fetchPatients();
    const interval = setInterval(fetchPatients, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:3000/patient');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des patients', error);
    }
  };

  // Chargement initial et polling des messages pour le patient sélectionné
  const fetchMessages = async (patientId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/messages/${patientId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages', error);
    }
  };

  // Lors de la sélection d'un patient, on récupère ses messages
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    fetchMessages(patient.id);
    // Ici, vous pouvez aussi appeler une API pour marquer les messages comme lus.
  };

  // Polling des messages toutes les 5 secondes pour afficher les nouvelles réponses automatiquement
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedPatient) {
      interval = setInterval(() => {
        fetchMessages(selectedPatient.id);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedPatient]);

  // Auto-scroll vers le bas de la conversation à chaque mise à jour des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Envoi d'un message par l'assistance (bouton et sur touche Enter)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPatient) return;

    const messageToSend = {
      patientId: selectedPatient.id,
      sender: 'assistance',
      text: newMessage,
    };

    try {
      // NOTE : l'endpoint POST est défini pour recevoir le message dans le body, sans patientId dans l'URL
      const response = await fetch('http://localhost:3000/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageToSend)
      });

      if (response.ok) {
        // On récupère le message créé depuis l'API (ou on peut l'ajouter avec un id temporaire)
        const createdMessage = await response.json();
        setMessages(prevMessages => [...prevMessages, createdMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-green-900 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">Assistance - Messagerie</h1>
      </header>

      <div className="flex flex-1">
        <aside className="w-1/3 border-r border-gray-300 p-4 bg-white">
          <h2 className="text-xl font-semibold mb-4">Patients</h2>
          <ul className="space-y-2">
            {patients.map((patient) => (
              <li 
                key={patient.id} 
                onClick={() => handleSelectPatient(patient)}
                className={`p-3 rounded-lg cursor-pointer flex justify-between items-center ${
                  selectedPatient?.id === patient.id 
                    ? 'bg-green-900 text-white' 
                    : 'bg-green-50 hover:bg-green-100 text-green-900'
                }`}
              >
                <div>
                  <div className="font-medium">{patient.firstName} {patient.lastName}</div>
                  <div className="text-sm">{patient.email}</div>
                </div>
                {patient.unreadCount && patient.unreadCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full text-xs px-2">
                    {patient.unreadCount}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 p-4 flex flex-col bg-gray-50">
          {selectedPatient ? (
            <>
              <div className="flex items-center mb-4">
                <button onClick={() => setSelectedPatient(null)} className="text-green-900 mr-4">
                  <FaArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold">
                  Conversation avec {selectedPatient.firstName} {selectedPatient.lastName}
                </h2>
              </div>
              <div className="flex-1 bg-white p-4 rounded-lg shadow-md overflow-y-auto">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`mb-4 flex ${msg.sender === 'assistance' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md p-3 rounded-lg shadow-sm ${
                      msg.sender === 'assistance'
                        ? 'bg-green-900 text-white text-right'
                        : 'bg-green-50 text-green-900 text-left'
                    }`}>
                      <p>{msg.text}</p>
                      <span className="text-xs block mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="mt-4 flex">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg"
                  placeholder="Votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-green-900 text-white px-6 rounded-r-lg flex items-center justify-center"
                >
                  <FaPaperPlane size={18} />
                  <span className="ml-2">Envoyer</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-xl font-semibold text-green-900">
                Sélectionnez un patient pour démarrer la conversation
              </h2>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-white text-center p-2 text-gray-500 text-sm border-t border-gray-300">
        Assistance © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Assistance;
