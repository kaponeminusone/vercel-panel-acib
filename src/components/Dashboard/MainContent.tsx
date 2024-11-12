// src/components/MainContent/MainContent.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MainContent.css';
import LineChart from '../LineChart/LineChart';
import CarbonComponent from '../Carbon/Carbon';
import PieChart from '../PieChart/PieChart';
import { API_CONFIG } from '../../config';

interface LineChartData {
  labels: string[];
  noConformes: number[];
  salidas: number[];
}

interface PieChartData {
  labels: string[];
  values: number[];
}

interface CarbonData {
  id: number;
  nombre: string;
  cantidad_entrada: number;
  cantidad_salida: number;
}

interface ProcessSuccessData {
  id_proceso: number;
  nombre: string;
  exito_promedio: number;
}

interface ProcessResponse {
  procesos_menos_exito: ProcessSuccessData[];
  procesos_mayor_exito: ProcessSuccessData[];
}

const MainContent: React.FC = () => {
  const [lineChartData, setLineChartData] = useState<LineChartData>({
    labels: [],
    noConformes: [],
    salidas: [],
  });
  const [dataPie, setDataPie] = useState<PieChartData>({ labels: ['Conformes', 'No Conformes'], values: [0, 0] });
  const [carbonData, setCarbonData] = useState<CarbonData[]>([]);
  const [lowSuccessProcesses, setLowSuccessProcesses] = useState<ProcessSuccessData[]>([]);
  const [highSuccessProcesses, setHighSuccessProcesses] = useState<ProcessSuccessData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lineResponse, pieResponse, carbonResponse, processResponse] = await Promise.all([
          axios.get<{ num_etapa: number; conformes: number; no_conformes: number }[]>(`${API_CONFIG.baseURL}/stadistics/estadisticas/estado-general-etapas`),
          axios.get<{ conformes: number; no_conformes: number }>(`${API_CONFIG.baseURL}/stadistics/estadisticas/diagrama-no-conformidades`),
          axios.get<CarbonData[]>(`${API_CONFIG.baseURL}/stadistics/estadisticas/estado-entradas-salidas`),
          axios.get<ProcessResponse>(`${API_CONFIG.baseURL}/stadistics/estadisticas/procesos-exito`),
        ]);

        // Actualizar datos del gráfico de líneas
        setLineChartData({
          labels: lineResponse.data.map(item => `Etapa ${item.num_etapa}`),
          noConformes: lineResponse.data.map(item => item.no_conformes),
          salidas: lineResponse.data.map(item => item.conformes),
        });

        // Actualizar datos del gráfico de pastel
        setDataPie({
          labels: ['Conformes', 'No Conformes'],
          values: [pieResponse.data.conformes, pieResponse.data.no_conformes],
        });

        // Actualizar datos de entradas y salidas
        setCarbonData(carbonResponse.data);

        // Actualizar procesos de éxito
        setLowSuccessProcesses(processResponse.data.procesos_menos_exito);
        setHighSuccessProcesses(processResponse.data.procesos_mayor_exito);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-700 text-lg">Cargando datos, por favor espere...</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="content">
        <section className="chart-section">
          <h2>Estado general x etapas</h2>
          <div className="h-[325px]">
            <LineChart data={lineChartData} />
          </div>
        </section>
        <section className="chart-section">
          <h2>Estado de entradas y salidas</h2>
          <div className="carbon-container">
            {carbonData.map(item => (
              <CarbonComponent 
                key={item.id} 
                name={item.nombre} 
                id={item.id} 
                inputs={item.cantidad_entrada} 
                outputs={item.cantidad_salida} 
              />
            ))}
          </div>
        </section>
        <div className="bottom-section">
          <section className="chart-section small">
            <h2>Diagrama de no conformidades</h2>
            <div className="chart-container">
              <PieChart data={dataPie} />
            </div>
          </section>
          <div className="process-lists">
            <div>
              <h2>Procesos con menos éxito</h2>
              <ul>
                {lowSuccessProcesses.length > 0 ? (
                  lowSuccessProcesses.map(process => (
                    <li key={process.id_proceso}>
                      {process.nombre} - Éxito Promedio: {process.exito_promedio.toFixed(2)}
                    </li>
                  ))
                ) : (
                  <li>No hay procesos con bajo éxito.</li>
                )}
              </ul>
            </div>
            <div>
              <h2>Procesos con mayor éxito</h2>
              <ul>
                {highSuccessProcesses.length > 0 ? (
                  highSuccessProcesses.map(process => (
                    <li key={process.id_proceso}>
                      {process.nombre} - Éxito Promedio: {process.exito_promedio.toFixed(2)}
                    </li>
                  ))
                ) : (
                  <li>No hay procesos con alto éxito.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
