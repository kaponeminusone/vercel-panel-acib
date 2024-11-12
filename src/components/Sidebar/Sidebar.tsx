// src/components/Sidebar.js

import { Link } from 'react-router-dom';
import { User } from 'lucide-react'; // Importa el icono de perfil de lucide-react
import './Sidebar.css';
import logo from '../../assets/logo.jpeg'

const Sidebar = () => {
  return (
    <div className="sidebar-bar">
      {/* Logo en la parte superior */}
      <div>
        <div className="logo-container">
          <img className="logo" src={logo} alt=""/>
          <h2 className="sidebar-title-bar">PANEL A.C.I.B</h2>
        </div>
        
        <ul>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/monitoreo">Monitoreo</Link>
          </li>
          <li>
            <Link to="/creacion">Creacion</Link>
          </li>
        </ul>
      </div>
      {/* Footer con icono de perfil */}
      <div className="sidebar-footer">
        <User className="profile-icon" />
        <span className="profile-name">Nombre Usuario</span>
      </div>
    </div>
  );
};

export default Sidebar;
