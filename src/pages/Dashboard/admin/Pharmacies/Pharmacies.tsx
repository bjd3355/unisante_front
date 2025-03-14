import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHome, FaPlus, FaFileExcel, FaTrash, FaEdit } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface pour une pharmacie
interface Pharmacy {
  id: number | null;
  name: string;
  address: string;
  phone: string;
  status: string;
  latitude: number;
  longitude: number;
}

const Pharmacies: React.FC = () => {
  // États pour les pharmacies, la recherche, la modale et le formulaire
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<Pharmacy>({
    id: null,
    name: '',
    address: '',
    phone: '',
    status: '',
    latitude: 0,
    longitude: 0,
  });
  const [pharmacyToDelete, setPharmacyToDelete] = useState<Pharmacy | null>(null);

  // Chargement initial des pharmacies via l'API
  useEffect(() => {
    fetchPharmacies();
  }, []);

  const fetchPharmacies = () => {
    axios.get('http://localhost:3000/pharmacies')
      .then(response => {
        setPharmacies(response.data);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des pharmacies :", error);
        toast.error("Erreur lors du chargement des pharmacies");
      });
  };

  // Filtrage des pharmacies en fonction de la recherche
  const filteredPharmacies = pharmacies.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ouvre la modale d'ajout/modification
  const openModal = (pharmacy: Pharmacy | null = null) => {
    if (pharmacy) {
      setFormData(pharmacy);
    } else {
      setFormData({
        id: null,
        name: '',
        address: '',
        phone: '',
        status: '',
        latitude: 0,
        longitude: 0,
      });
    }
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  // Gestion de la soumission du formulaire
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.id) {
      // Modification existante
      axios.put(`http://localhost:3000/pharmacies/${formData.id}`, formData)
        .then(response => {
          setPharmacies(pharmacies.map(p => p.id === formData.id ? response.data : p));
          toast.success("Pharmacie mise à jour avec succès");
          closeModal();
        })
        .catch(error => {
          console.error("Erreur lors de la mise à jour :", error);
          toast.error("Erreur lors de la mise à jour de la pharmacie");
        });
    } else {
      // Création d'une nouvelle pharmacie
      axios.post('http://localhost:3000/pharmacies', formData)
        .then(response => {
          setPharmacies([...pharmacies, response.data]);
          toast.success("Pharmacie ajoutée avec succès");
          closeModal();
        })
        .catch(error => {
          console.error("Erreur lors de l'ajout :", error);
          toast.error("Erreur lors de l'ajout de la pharmacie");
        });
    }
  };

  // Ouverture de la modale de confirmation de suppression
  const openDeleteModal = (pharmacy: Pharmacy) => {
    setPharmacyToDelete(pharmacy);
  };

  const closeDeleteModal = () => setPharmacyToDelete(null);

  // Confirmation de la suppression
  const confirmDelete = () => {
    if (pharmacyToDelete) {
      axios.delete(`http://localhost:3000/pharmacies/${pharmacyToDelete.id}`)
        .then(() => {
          setPharmacies(pharmacies.filter(p => p.id !== pharmacyToDelete.id));
          toast.success("Pharmacie supprimée avec succès");
          closeDeleteModal();
        })
        .catch(error => {
          console.error("Erreur lors de la suppression :", error);
          toast.error("Erreur lors de la suppression de la pharmacie");
        });
    }
  };

  // Export des données en Excel
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(pharmacies);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pharmacies');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'pharmacies.xlsx');
    toast.success("Exportation effectuée avec succès");
  };

  return (
    <div className="p-4">
      {/* Navigation */}
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

      {/* Barre de recherche */}
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
            <th className="border p-2">Téléphone</th>
            <th className="border p-2">Statut</th>
            <th className="border p-2">Latitude</th>
            <th className="border p-2">Longitude</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPharmacies.map((pharmacy) => (
            <tr key={pharmacy.id ?? 0} className="text-center">
              <td className="border p-2">{pharmacy.name}</td>
              <td className="border p-2">{pharmacy.address}</td>
              <td className="border p-2">{pharmacy.phone}</td>
              <td className="border p-2">{pharmacy.status}</td>
              <td className="border p-2">{pharmacy.latitude}</td>
              <td className="border p-2">{pharmacy.longitude}</td>
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
              <input
                type="text"
                placeholder="Téléphone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border p-2 mb-2"
                required
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border p-2 mb-2"
                required
              >
                <option value="">Statut</option>
                <option value="Ouvert">Ouvert</option>
                <option value="Jour">Jour</option>
                <option value="Nuit">Nuit</option>
                <option value="Garde">Garde</option>
              </select>
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full border p-2 mb-2"
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full border p-2 mb-4"
                required
              />
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

      {/* Container pour les notifications */}
      <ToastContainer />
    </div>
  );
};

export default Pharmacies;
