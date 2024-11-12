// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

interface ProtectedRouteProps {
  allowedRoles: string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, redirectTo = '/' }) => {
  const { user, isLoading } = useUser();

  const token = localStorage.getItem('token'); // Verificar si hay un token en localStorage

  // Si no hay token, redirige a la página de inicio (Home)
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Espera a que el usuario esté completamente cargado antes de redirigir
  if (isLoading) return null; // Puedes mostrar un spinner o mensaje de carga aquí si lo prefieres

  // Si el usuario tiene un rol permitido, renderiza la ruta; si no, redirige
  return allowedRoles.includes(user?.tipo || '') ? <Outlet /> : <Navigate to={redirectTo} replace />;
};

export default ProtectedRoute;
