// src/components/DoctorList.tsx
import React from 'react';

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  availableSlots: string[];
}

interface DoctorListProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
}

const DoctorList: React.FC<DoctorListProps> = ({ doctors, onSelectDoctor }) => {
  return (
    <div>
      {doctors.length > 0 ? (
        doctors.map((doctor) => (
          <div key={doctor.id}>
            <h3>{doctor.name}</h3>
            <p>{doctor.specialty}</p>
            <button onClick={() => onSelectDoctor(doctor)}>Book Appointment</button>
          </div>
        ))
      ) : (
        <p>Aucun médecin trouvé</p>
      )}
    </div>
  );
};

export default DoctorList;
