import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

interface Message {
  sender: 'patient' | 'assistance';
  text: string;
  time: string;
}

interface FetchedMessage {
  sender: 'patient' | 'assistance';
  text: string;
  timestamp: string;
}

interface ChatAssistantProps {
  theme: string;
  patientId: number;
  t: (key: string) => string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ theme, patientId, t }) => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);

  // Fonction pour récupérer les messages depuis l'API
  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3000/messages/${patientId}`);
      const data: FetchedMessage[] = await response.json();
      const fetchedMessages: Message[] = data.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
        time: new Date(msg.timestamp).toLocaleTimeString(),
      }));

      // Si aucune conversation existante, ajouter le message d'accueil de l'assistance
      if (fetchedMessages.length === 0) {
        fetchedMessages.push({
          sender: 'assistance',
          text: "Merci pour votre message. Pouvez-vous préciser votre problème ?",
          time: new Date().toLocaleTimeString(),
        });
      }
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages : ', error);
    }
  };

  // Chargement initial des messages au montage
  useEffect(() => {
    fetchMessages();
  }, [patientId]);

  // Polling : recharger les messages toutes les 5 secondes quand le chat est ouvert
  useEffect(() => {
    if (isChatOpen) {
      const intervalId = setInterval(() => {
        fetchMessages();
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [isChatOpen, patientId]);

  // Envoi d'un message par le patient
  const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim() !== '') {
      const text = (e.target as HTMLInputElement).value;
      const userMessage: Message = {
        sender: 'patient',
        text,
        time: new Date().toLocaleTimeString(),
      };

      // Affichage immédiat du message utilisateur
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      (e.target as HTMLInputElement).value = '';

      // Envoi du message vers l'API
      try {
        await fetch('http://localhost:3000/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ patientId, sender: 'patient', text }),
        });
      } catch (error) {
        console.error('Erreur lors de l’envoi du message utilisateur : ', error);
      }
    }
  };

  return (
    <>
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className={`fixed top-20 right-8 w-96 rounded-xl shadow-2xl z-50 overflow-hidden ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}
        >
          {/* En-tête avec le bouton X pour fermer le chat */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-700">
            <h3 className="text-lg font-semibold">{t('chatWithAssistant')}</h3>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 rounded-full hover:bg-blue-600 text-white"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Zone d'affichage des messages */}
          <div className="p-4 h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Démarrez la conversation...
              </div>
            )}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg shadow ${
                    msg.sender === 'patient'
                      ? theme === 'dark'
                        ? 'bg-green-700 text-white'
                        : 'bg-green-200 text-green-900'
                      : theme === 'dark'
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-200 text-blue-900'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <div className="text-xs text-right mt-1">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Zone de saisie du message */}
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800">
            <input
              type="text"
              placeholder={t('typeMessage')}
              className="w-full p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500"
              onKeyDown={handleSendMessage}
            />
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ChatAssistant;
