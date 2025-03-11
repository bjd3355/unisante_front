import React, { useState, useEffect } from 'react';
import { FaHome, FaPlus, FaFileExcel, FaTrash, FaEdit } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Contact {
  id: number | null;
  name: string;
  status: string;
  email: string;
  mobile: string;
  address: string;
}

const Contact: React.FC = () => {
  // État pour la liste des contacts
  const [contacts, setContacts] = useState<Contact[]>([]);
  // État pour la barre de recherche
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Contrôle de la modale d'ajout/édition
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Données du formulaire (ajout/modification)
  const [formData, setFormData] = useState<Contact>({
    id: null,
    name: '',
    status: '',
    email: '',
    mobile: '',
    address: ''
  });
  // Pour la confirmation de suppression
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);

  // Chargement initial des contacts depuis le localStorage
  useEffect(() => {
    const stored = localStorage.getItem('contacts');
    if (stored) {
      setContacts(JSON.parse(stored));
    } else {
      // Exemple initial de contacts
      setContacts([
        { id: 1, name: 'Dr. Jean Dupont', status: 'Docteur', email: 'jean.dupont@example.com', mobile: '0123456789', address: '123 Rue de Paris' },
        { id: 2, name: 'Marie Curie', status: 'Patient', email: 'marie.curie@example.com', mobile: '0987654321', address: '456 Avenue de Lyon' }
      ]);
    }
  }, []);

  // Sauvegarde dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Filtrage des contacts selon la recherche
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ouvre la modale d'ajout/édition
  const openModal = (contact: Contact | null = null) => {
    if (contact) {
      setFormData(contact);
    } else {
      setFormData({
        id: null,
        name: '',
        status: '',
        email: '',
        mobile: '',
        address: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Soumission du formulaire (ajout ou modification)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.id) {
      // Modification
      setContacts(contacts.map(c => (c.id === formData.id ? formData : c)));
    } else {
      // Ajout (génération d'un id avec Date.now())
      setContacts([...contacts, { ...formData, id: Date.now() }]);
    }
    closeModal();
  };

  // Ouvre la modale de confirmation de suppression
  const openDeleteModal = (contact: Contact) => {
    setDeleteContact(contact);
  };

  const closeDeleteModal = () => setDeleteContact(null);

  const confirmDelete = () => {
    if (deleteContact) {
      setContacts(contacts.filter(c => c.id !== deleteContact.id));
      closeDeleteModal();
    }
  };

  // Export des contacts en Excel
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(contacts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'contacts.xlsx');
  };

  return (
    <div className="p-4">
      {/* Barre de navigation */}
      <div className="flex items-center space-x-2 text-gray-700">
        <FaHome />
        <span>&gt;</span>
        <span className="text-xl font-semibold">Contact</span>
      </div>

      {/* Titre de la page */}
      <h1 className="text-2xl font-bold p-4">Contact</h1>

      {/* Boutons Ajouter et Exporter */}
      <div className="flex justify-between items-center mb-4">
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
          onClick={() => openModal()}
        >
          <FaPlus className="mr-2" /> Ajouter
        </button>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
          onClick={handleExport}
        >
          <FaFileExcel className="mr-2" /> Exporter
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Rechercher un contact" 
          className="w-full border p-2" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tableau des contacts */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Nom</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Mobile</th>
            <th className="border p-2">Adresse</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredContacts.map(contact => (
            <tr key={contact.id as number} className="text-center">
              <td className="border p-2">{contact.name}</td>
              <td className="border p-2">{contact.status}</td>
              <td className="border p-2">{contact.email}</td>
              <td className="border p-2">{contact.mobile}</td>
              <td className="border p-2">{contact.address}</td>
              <td className="border p-2 flex justify-center space-x-2">
                <FaEdit 
                  className="text-yellow-500 cursor-pointer" 
                  onClick={() => openModal(contact)} 
                />
                <FaTrash 
                  className="text-red-500 cursor-pointer" 
                  onClick={() => openDeleteModal(contact)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modale d'ajout/édition */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">{formData.id ? 'Modifier' : 'Ajouter'} un contact</h2>
            <form onSubmit={handleSubmit}>
              <input 
                type="text" 
                placeholder="Nom" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                className="w-full border p-2 mb-2" 
                required 
              />
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({ ...formData, status: e.target.value })} 
                className="w-full border p-2 mb-2" 
                required
              >
                <option value="">Status</option>
                <option value="Docteur">Docteur</option>
                <option value="Patient">Patient</option>
              </select>
              <input 
                type="email" 
                placeholder="Email" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                className="w-full border p-2 mb-2" 
                required 
              />
              <input 
                type="text" 
                placeholder="Mobile" 
                value={formData.mobile} 
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} 
                className="w-full border p-2 mb-2" 
                required 
              />
              <input 
                type="text" 
                placeholder="Adresse" 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                className="w-full border p-2 mb-4" 
                required 
              />
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  className="bg-gray-400 px-4 py-2 rounded" 
                  onClick={closeModal}
                >
                  Annuler
                </button>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale de confirmation de suppression */}
      {deleteContact && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="text-xl font-bold mb-4">Voulez-vous supprimer {deleteContact.name} ?</h2>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                className="bg-gray-400 px-4 py-2 rounded" 
                onClick={closeDeleteModal}
              >
                Non
              </button>
              <button 
                type="button" 
                className="bg-red-500 text-white px-4 py-2 rounded" 
                onClick={confirmDelete}
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
