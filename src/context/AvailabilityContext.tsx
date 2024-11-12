// src/context/AvailabilityContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config';

interface Availability {
  disponible: boolean;
  inicio: string;
  fin: string;
}

interface AvailabilityContextProps {
  availability: Availability | null;
  isLoading: boolean;
  updateAvailability: () => Promise<void>; // Función para actualizar la disponibilidad
}

const AvailabilityContext = createContext<AvailabilityContextProps | undefined>(undefined);

export const AvailabilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get<Availability>(`${API_CONFIG.baseURL}/disponibilidad`);
      setAvailability(response.data);
    } catch (error) {
      console.error('Error al obtener la disponibilidad del servicio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Función para actualizar la disponibilidad
  const updateAvailability = async () => {
    setIsLoading(true);
    await fetchAvailability();
    setIsLoading(false);
  };

  return (
    <AvailabilityContext.Provider value={{ availability, isLoading, updateAvailability }}>
      {children}
    </AvailabilityContext.Provider>
  );
};

export const useAvailability = () => {
  const context = useContext(AvailabilityContext);
  if (!context) throw new Error('useAvailability debe ser utilizado dentro de un AvailabilityProvider');
  return context;
};
