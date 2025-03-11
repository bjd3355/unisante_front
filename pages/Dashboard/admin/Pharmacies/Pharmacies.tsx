import { useState, useEffect } from 'react';
import { FaHome, FaPlus, FaFileExcel, FaTrash, FaEdit } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Définition de l'interface pour une pharmacie
interface Pharmacy {
  id: number | null;
  name: string;
  address: string;
  guardStatus: string;
  openStatus: string;
}

const Pharmacies: React.FC = () => {
  // État pour les pharmacies, avec typage explicite
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  // État pour la barre de recherche
  const [searchQuery, setSearchQuery] = useState<string>('');
  // État pour la modale d'ajout/modification
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // État du formulaire pour ajouter/modifier une pharmacie
  const [formData, setFormData] = useState<Pharmacy>({
    id: null,
    name: '',
    address: '',
    guardStatus: '',
    openStatus: ''
  });
  // État pour la pharmacie à supprimer (pour la confirmation)
  const [pharmacyToDelete, setPharmacyToDelete] = useState<Pharmacy | null>(null);

  // Chargement initial depuis le localStorage
  useEffect(() => {
    const storedPharmacies = localStorage.getItem('pharmacies');
    if (storedPharmacies) {
      setPharmacies(JSON.parse(storedPharmacies));
    } else {
      setPharmacies([
        { id: 1, name: 'Pharma A', address: 'Rue 1', guardStatus: 'De garde', openStatus: 'Ouvert' },
        { id: 2, name: 'Pharma B', address: 'Rue 2', guardStatus: 'Pas de garde', openStatus: 'Fermé' },
      ]);
    }
  }, []);

  // Sauvegarde dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('pharmacies', JSON.stringify(pharmacies));
  }, [pharmacies]);

  // Filtrage des pharmacies selon la recherche (recherche par nom, adresse, etc.)
  const filteredPharmacies = pharmacies.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.guardStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.openStatus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ouvre la modale d'ajout/modification avec les données si fournies
  const openModal = (pharmacy: Pharmacy | null = null) => {
    setFormData(pharmacy || { id: null, name: '', address: '', guardStatus: '', openStatus: '' });
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  // Traitement du formulaire (ajout ou modification)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.id) {
      setPharmacies(pharmacies.map(p => (p.id === formData.id ? formData : p)));
    } else {
      setPharmacies([...pharmacies, { ...formData, id: Date.now() }]);
    }
    closeModal();
  };

  // Ouvre la modale de confirmation pour la suppression
  const openDeleteModal = (pharmacy: Pharmacy) => {
    setPharmacyToDelete(pharmacy);
  };

  const closeDeleteModal = () => setPharmacyToDelete(null);

  // Confirmation de la suppression
  const confirmDelete = () => {
    if (pharmacyToDelete) {
      setPharmacies(pharmacies.filter(p => p.id !== pharmacyToDelete.id));
      closeDeleteModal();
    }
  };

  // Exporter les données en Excel
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(pharmacies);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pharmacies');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'pharmacies.xlsx');
  };

  return (
    <div className="p-4">
      {/* Barre de navigation */}
      <div className="flex items-center space-x-2 text-gray-700">
        <FaHome />
        <span>&gt;</span>
        <span className="text-xl font-semibold">Pharmacie</span>
      </div>

      <h1 className="text-2xl font-bold p-4">Pharmacie</h1>

      {/* Boutons Ajouter et Exporter */}
      <div className="flex justify-between items-center mb-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded flex items-center" onClick={() => openModal()}>
          <FaPlus className="mr-2" /> Ajouter
        </button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center" onClick={handleExport}>
          <FaFileExcel className="mr-2" /> Exporter
        </button>
      </div>

      {/* Barre de recherche design */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher une pharmacie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tableau des pharmacies */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Nom</th>
            <th className="border p-2">Adresse</th>
            <th className="border p-2">Statut de garde</th>
            <th className="border p-2">Statut d'ouverture</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPharmacies.map((pharmacy) => (
            <tr key={pharmacy.id ?? 0} className="text-center">
              <td className="border p-2">{pharmacy.name}</td>
              <td className="border p-2">{pharmacy.address}</td>
              <td className="border p-2">{pharmacy.guardStatus}</td>
              <td className="border p-2">{pharmacy.openStatus}</td>
              <td className="border p-2 flex justify-center space-x-2">
                <FaEdit className="text-yellow-500 cursor-pointer" onClick={() => openModal(pharmacy)} />
                <FaTrash className="text-red-500 cursor-pointer" onClick={() => openDeleteModal(pharmacy)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modale d'ajout/modification */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">
              {formData.id ? 'Modifier' : 'Ajouter'} une pharmacie
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border p-2 mb-2"
                required
              />
              <input
                type="text"
                placeholder="Adresse"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border p-2 mb-2"
                required
              />
              <select
                value={formData.guardStatus}
                onChange={(e) => setFormData({ ...formData, guardStatus: e.target.value })}
                className="w-full border p-2 mb-2"
                required
              >
                <option value="">Statut de garde</option>
                <option value="De garde">De garde</option>
                <option value="Pas de garde">Pas de garde</option>
              </select>
              <select
                value={formData.openStatus}
                onChange={(e) => setFormData({ ...formData, openStatus: e.target.value })}
                className="w-full border p-2 mb-4"
                required
              >
                <option value="">Statut d'ouverture</option>
                <option value="Ouvert">Ouvert</option>
                <option value="Fermé">Fermé</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button type="button" className="bg-gray-400 px-4 py-2 rounded" onClick={closeModal}>
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
      {pharmacyToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded w-80">
            <h2 className="text-xl font-bold mb-4">
              Voulez-vous supprimer {pharmacyToDelete.name} ?
            </h2>
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

export default Pharmacies;
