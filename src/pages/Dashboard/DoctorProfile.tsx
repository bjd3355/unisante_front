import { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import avatar from '../assets/images/avatar.jpg'; 

interface DoctorProfileProps {
  isDarkMode: boolean;
}

function DoctorProfile({ isDarkMode }: DoctorProfileProps) {
    
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Dr. Jophret BAKANA',
    specialty: 'Gynécologue - Certifiée depuis 2015',
    email: 'jophret@unisante.sn',
    phone: '+221771234567',
    hospital: 'UniSanté Dakar',
    medicalId: 'MED-789123',
    avatar: avatar, 
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatar); // Aperçu de l'image
  const [error, setError] = useState<string | null>(null); // Gestion des erreurs
  

  // Gestion des changements dans les champs texte
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion du téléchargement de l'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limite de 2 Mo
        setError('L’image doit être inférieure à 2 Mo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileData((prev) => ({ ...prev, avatar: result }));
        setAvatarPreview(result); // Mise à jour de l'aperçu
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validation simple avant sauvegarde
  const validateProfile = () => {
    if (!profileData.name.trim()) return 'Le nom est requis.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) return 'Email invalide.';
    if (!/^\+221\d{8,9}$/.test(profileData.phone)) return 'Numéro de téléphone invalide (ex. +221771234567).';
    return null;
  };

  // Gestion de la sauvegarde
  const handleSave = () => {
    const validationError = validateProfile();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsEditing(false);
    setError(null);
    console.log('Profil mis à jour : ', profileData); // Remplacez par une logique API si nécessaire
  };

  return (
    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800 text-green-100' : 'bg-white text-green-900'} shadow-md border border-gray-200`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <>
              <label className="cursor-pointer">
                <img
                  src={avatarPreview || profileData.avatar}
                  alt={profileData.name}
                  className="w-16 h-16 rounded-md border border-green-200 object-cover"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="text-xs text-green-600 mt-1 block">Changer l’image</span>
              </label>
              <div>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="text-xl font-semibold bg-transparent border-b border-green-600 focus:outline-none w-full"
                  placeholder="Nom"
                />
                <input
                  type="text"
                  name="specialty"
                  value={profileData.specialty}
                  onChange={handleChange}
                  className="text-sm text-green-600 bg-transparent border-b border-green-600 focus:outline-none w-full mt-1"
                  placeholder="Spécialité"
                />
              </div>
            </>
          ) : (
            <>
              <img
                src={profileData.avatar}
                alt={profileData.name}
                className="w-16 h-16 rounded-md border border-green-200 object-cover"
              />
              <div>
                <h3 className="text-xl font-semibold">{profileData.name}</h3>
                <p className="text-sm text-green-600">{profileData.specialty}</p>
              </div>
            </>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center space-x-1"
          >
            <FaUser /> <span>Modifier</span>
          </button>
        )}
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <p>
          <strong>Email:</strong>{' '}
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              className="bg-transparent border-b border-green-600 focus:outline-none w-full"
              placeholder="Email"
            />
          ) : (
            profileData.email
          )}
        </p>
        <p>
          <strong>Téléphone:</strong>{' '}
          {isEditing ? (
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              className="bg-transparent border-b border-green-600 focus:outline-none w-full"
              placeholder="+221771234567"
            />
          ) : (
            profileData.phone
          )}
        </p>
        <p>
          <strong>Hôpital:</strong>{' '}
          {isEditing ? (
            <input
              type="text"
              name="hospital"
              value={profileData.hospital}
              onChange={handleChange}
              className="bg-transparent border-b border-green-600 focus:outline-none w-full"
              placeholder="Hôpital"
            />
          ) : (
            profileData.hospital
          )}
        </p>
        <p>
          <strong>ID médical:</strong>{' '}
          {isEditing ? (
            <input
              type="text"
              name="medicalId"
              value={profileData.medicalId}
              onChange={handleChange}
              className="bg-transparent border-b border-green-600 focus:outline-none w-full"
              placeholder="ID médical"
            />
          ) : (
            profileData.medicalId
          )}
        </p>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={() => {
              setIsEditing(false);
              setAvatarPreview(avatar); // Réinitialise l'aperçu si annulé
              setError(null);
            }}
            className="px-4 py-2 text-gray-900 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Sauvegarder
          </button>
        </div>
      )}
    </div>
  );
}

export default DoctorProfile;