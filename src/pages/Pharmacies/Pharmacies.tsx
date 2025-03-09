import React, { useEffect, useState } from "react";

interface Pharmacy {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  status: "jour" | "nuit" | "garde" | "ouvert"; // valeurs possibles
  region: string;
  lat: number;
  lon: number;
}

const Pharmacies: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>(""); // "" = Tous
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pharmaciesPerPage = 5;
  const [modalPhoneNumber, setModalPhoneNumber] = useState<string | null>(null);

  // Calcul de distance via la formule de Haversine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Récupération des pharmacies depuis l'API
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await fetch('http://localhost:3000/pharmacies');
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des pharmacies.");
        }
        const data: Pharmacy[] = await response.json();
        setPharmacies(data);
        setFilteredPharmacies(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPharmacies();
  }, []);

  // Filtrage en fonction de la recherche, du status et de la distance (max 5 km)
  useEffect(() => {
    let result = pharmacies;

    // Filtrer par nom
    if (searchTerm.trim() !== "") {
      result = result.filter(pharmacy =>
        pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par status
    if (selectedStatus !== "") {
      result = result.filter(pharmacy =>
        pharmacy.status && pharmacy.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    // Filtrer par distance si la géolocalisation est disponible
    if (userLocation) {
      result = result.filter(pharmacy => {
        if (pharmacy.lat && pharmacy.lon) {
          return calculateDistance(userLocation.lat, userLocation.lon, pharmacy.lat, pharmacy.lon) <= 5;
        }
        return false;
      });
    }

    setFilteredPharmacies(result);
    setCurrentPage(1);
  }, [pharmacies, searchTerm, selectedStatus, userLocation]);

  // Gestion de la géolocalisation
  const handleLocateButtonClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          alert("Impossible de récupérer votre position.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  // Affichage du numéro de téléphone en modal
  const showPhoneModal = (phone: string) => {
    setModalPhoneNumber(phone);
  };

  const closeModal = () => {
    setModalPhoneNumber(null);
  };

  // Calcul de la pagination
  const indexOfLast = currentPage * pharmaciesPerPage;
  const indexOfFirst = indexOfLast - pharmaciesPerPage;
  const currentPharmacies = filteredPharmacies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPharmacies.length / pharmaciesPerPage);

  // Gestion de l'affichage des numéros de pages par groupe (groupSize = 3)
  const groupSize = 3;
  const currentGroupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
  const currentGroupEnd = Math.min(currentGroupStart + groupSize - 1, totalPages);
  const pageNumbers = [];
  for (let i = currentGroupStart; i <= currentGroupEnd; i++) {
    pageNumbers.push(i);
  }

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="bg-gray-100 p-4 min-h-screen">
      {/* En-tête avec lien "Accueil" */}
      <div className="text-sm text-gray-600">
        <span onClick={() => window.history.back()} className="cursor-pointer hover:underline">
          Accueil
        </span>
        {" / Pharmacies"}
      </div>
      <h1 id="dynamicTitle" className="text-2xl font-bold mt-2">
        {selectedStatus ? `Pharmacies (${selectedStatus})` : "Toutes les Pharmacies"}
      </h1>

      {/* Conteneur principal avec trois colonnes */}
      <div className="flex mt-6 justify-between">
        {/* Bloc filtres à gauche */}
        <div className="w-1/4 bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold">Filtrer par</h2>
          <div className="mt-2 space-y-4">
            {/* Recherche par nom */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nom de la pharmacie"
                className="p-2 border rounded-lg flex-grow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg">OK</button>
            </div>
            {/* Boutons radio pour le status */}
            <fieldset className="flex flex-wrap gap-2">
              {["Ouvert", "Jour", "Nuit", "Garde"].map((status) => (
                <label key={status} className="flex items-center space-x-1">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    className="form-radio h-4 w-4 text-green-500 rounded-full border-gray-300 focus:ring-green-500"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    checked={selectedStatus === status}
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
              <label className="flex items-center space-x-1">
                <input
                  type="radio"
                  name="status"
                  value=""
                  className="form-radio h-4 w-4 text-green-500 rounded-full border-gray-300 focus:ring-green-500"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  checked={selectedStatus === ""}
                />
                <span className="text-sm">Tous</span>
              </label>
            </fieldset>
            <div className="flex items-center p-2 border rounded-lg w-full">
              <img src="https://flagcdn.com/sn.svg" alt="Drapeau du Sénégal" className="w-5 h-5 mr-2" />
              <span className="text-sm">Sénégal</span>
            </div>
            {/* Bouton de géolocalisation */}
            <div className="flex items-center p-2 border rounded-lg w-full">
              <button onClick={handleLocateButtonClick} className="flex-grow text-left">
                {userLocation
                  ? `Votre position: ${userLocation.lat.toFixed(2)}, ${userLocation.lon.toFixed(2)}`
                  : "Utiliser ma position actuelle"}
              </button>
            </div>
            <label className="flex items-center mt-2">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-green-500 rounded border-gray-300 focus:ring-green-500" />
              <span className="text-sm">Conventionné avec CARTE Assurances</span>
            </label>
          </div>
        </div>

        {/* Liste paginée des pharmacies au centre avec un espace horizontal */}
        <div className="flex-1 mx-4">
          <div className="space-y-6">
            {currentPharmacies.length > 0 ? (
              currentPharmacies.map((pharmacy) => (
                <div key={pharmacy.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-green-600">{pharmacy.name}</h3>
                    <p className="text-sm text-gray-600">{pharmacy.description}</p>
                    <p className="text-sm text-gray-600">{pharmacy.address}</p>
                  </div>
                  <button
                    onClick={() => showPhoneModal(pharmacy.phone)}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg whitespace-nowrap"
                  >
                    Afficher le numéro
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600">Aucune pharmacie trouvée.</p>
            )}
          </div>
          {/* Pagination */}
          <div className="flex justify-center mt-8 space-x-2">
            {currentPage > 1 && (
              <button onClick={handlePrevPage} className="px-4 py-2 bg-green-500 text-white rounded-xl">
                Précédent
              </button>
            )}
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`px-4 py-2 rounded-xl ${currentPage === page ? "bg-green-700 text-white" : "bg-green-500 text-white"}`}
              >
                {page}
              </button>
            ))}
            {currentPage < totalPages && (
              <button onClick={handleNextPage} className="px-4 py-2 bg-green-500 text-white rounded-xl">
                Suivant »
              </button>
            )}
          </div>
        </div>

        {/* Bloc "Pharmacies par région" à droite */}
        <div className="w-1/6 bg-white p-6 rounded-lg shadow self-start">
          <h2 className="font-semibold">Pharmacies par région</h2>
          <div className="mt-2 space-y-4">
            {["Dakar", "Thiès", "Saint-Louis", "Ziguinchor"].map((region) => (
              <div key={region} className="flex items-center text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m-6-8h6m-2-4H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-6-6z" />
                </svg>
                Pharmacie de Nuit {region}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal pour le numéro de téléphone */}
      {modalPhoneNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Téléphone</h2>
            <p className="text-xl mb-4">{modalPhoneNumber}</p>
            <button onClick={closeModal} className="px-4 py-2 bg-green-500 text-white rounded">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacies;
