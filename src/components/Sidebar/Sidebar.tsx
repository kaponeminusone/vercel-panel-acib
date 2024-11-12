// src/components/Sidebar/Sidebar.tsx

import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useAvailability } from '../../context/AvailabilityContext';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../assets/logo.jpeg';

const Sidebar = () => {
  const { user } = useUser();
  const { availability } = useAvailability();
  const navigate = useNavigate();

  // Determinar el estado de disponibilidad y los colores
  const isAvailable = availability?.disponible;
  const availabilityColor = isAvailable ? 'bg-green-500' : 'bg-red-500';
  const availabilityText = isAvailable ? 'Disponible' : 'No disponible';

  const handleLogout = () => {
    localStorage.removeItem('token'); // Elimina el JWT del almacenamiento
    navigate('/'); // Redirige a la página de inicio
    window.location.reload(); // Recarga la página
  };

  return (
    <div className="sidebar-bar">
      {/* Logo en la parte superior */}
      <div className="logo-container">
          <img className="logo" src={logo} alt="" />
          <h2 className="sidebar-title-bar">PANEL A.C.I.B</h2>
        </div>
      <div className='flex h-full'>
        <div className="flex flex-col justify-between">
          <ul className="flex flex-col w-full border-box">
            <li>
              <Link to="/">Login</Link>
            </li>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/monitoreo">Monitoreo</Link>
            </li>
            <li>
              <Link to="/creacion">Creacion</Link>
            </li>
          </ul>
          <ul className="mt-auto">
            <li>
              <Link to="/dev">Administración</Link>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Footer con icono de perfil */}
      <div className="sidebar-footer">
        {/* Indicador de disponibilidad */}
        <div className='flex flex-col'>
          <div className="availability-indicator flex items-center">
            <div className={`w-3 h-3 rounded-full ${availabilityColor} mr-2`} />
            <span className="text-gray-800 text-sm font-semibold">{availabilityText}</span>
          </div>

          {/* Mostrar horario de actividad */}
          <div className="availability-hours text-center text-sm text-gray-600">
            {availability ? (
              <p>Horario: {availability.inicio} - {availability.fin}</p>
            ) : (
              <p>Consultando horario...</p>
            )}
          </div>
          <div className='flex'>
            <User className="profile-icon" />
            <span className="profile-name">{user ? user.nombre : 'Nombre Usuario'}</span>
          </div>
          <span className="profile-name text-sx block text-center m-0 p-0">{user ? user.tipo : 'Tipo'}</span>
          <button
            onClick={handleLogout}
            className="flex items-center text-xs px-4 py-2 mt-[5px] text-white bg-red-500 hover:bg-red-600 rounded transition-colors focus:outline-none focus:ring focus:ring-red-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
