// src/context/UserContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG } from '../config';

interface User {
  id: number;
  nombre: string;
  email: string;
  tipo: string;
}

interface UserContextProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean; // Nuevo estado para indicar si se está cargando el usuario
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Inicialmente en carga

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken: { sub: string } = jwtDecode(token);
          const userEmail = decodedToken.sub;

          const response = await axios.get<User>(`${API_CONFIG.baseURL}/users/${encodeURIComponent(userEmail)}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error al cargar los datos del usuario desde el token:', error);
          setUser(null);
        }
      }
      setIsLoading(false); // Termina la carga cuando se completa la solicitud o hay un error
    };

    loadUserFromToken();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser debe ser utilizado dentro de un UserProvider');
  return context;
};
