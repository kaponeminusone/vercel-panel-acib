// src/components/Sidebar/Sidebar.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Sidebar.css';
import { API_CONFIG } from '../../config';

interface ProcessData {
  id_proceso_ejecutado: number;
  no_conformidades: number;
  conformidades: number;
  num_etapas_con_conformidades: number;
  tasa_de_exito: number;
  cantidad_salida: number;
  cantidad_entrada: number;
  creado: string;
  nombre_proceso: string;
  id_usuario: number;
  nombre_usuario: string;
}

const Sidebar: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await axios.get<ProcessData[]>(`${API_CONFIG.baseURL}/logs/latest/executed/definition/100`);
        setProcesses(response.data);
      } catch (error) {
        console.error("Error fetching processes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  if (loading) {
    return <p className="text-gray-500 text-center">Cargando procesos recientes...</p>;
  }

  return (
    <div className="sidebar">
      <h1>DASHBOARD</h1>
      <input 
        type="text" 
        placeholder="Buscar..." 
        className="search-input" 
      />
      <h2>Últimos procesos ejecutados</h2>
      <div className="recent-processes">
        {processes.map((process) => (
          <div key={process.id_proceso_ejecutado} className="card">
            <div className="card-header">
              <div>
                <p className="card-time">{new Date(process.creado).toLocaleString()}</p>
                <p className="card-title">{process.nombre_proceso}</p>
                <p className="card-subtitle">Encargado: {process.nombre_usuario}</p>
              </div>
              <div className="card-tags">
                <span className="tag blue-tag">{process.cantidad_entrada} Entrada</span>
                <span className="tag green-tag">{process.cantidad_salida} Salida</span>
                <span className="tag yellow-tag">Éxito: {process.tasa_de_exito.toFixed(1)}%</span>
                <span className="tag red-tag">{process.no_conformidades} No Conformes</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
