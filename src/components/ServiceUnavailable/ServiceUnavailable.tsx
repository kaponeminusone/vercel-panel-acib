// src/components/ServiceUnavailable.tsx

import React, { useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { API_CONFIG } from '../../config';

// Registrar componentes de Chart.js
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface DailySummary {
  hoy: {
    fecha: string;
    indicadores: number;
    procesos: number;
    entradas_salidas: number;
    procesos_ejecutados: number;
    produccion: number;
    no_conformes: number;
  };
  ayer: {
    fecha: string;
    indicadores: number;
    procesos: number;
    entradas_salidas: number;
    procesos_ejecutados: number;
    produccion: number;
    no_conformes: number;
  };
}

// Función para normalizar usando el valor máximo entre hoy y ayer
const normalize = (value: number, max: number) => (max === 0 ? 0 : (value / max) * 100);

const ServiceUnavailable: React.FC = () => {
  const [dataSummary, setDataSummary] = useState<DailySummary | null>(null);

  // Cargar datos del endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<DailySummary>(`${API_CONFIG.baseURL}/resumen-dia`);
        setDataSummary(response.data);
      } catch (error) {
        console.error('Error fetching daily summary data:', error);
      }
    };

    fetchData();
  }, []);

  // Determinar los máximos dinámicos
  const maxValues = dataSummary
    ? {
        indicadores: Math.max(dataSummary.hoy.indicadores, dataSummary.ayer.indicadores),
        procesos: Math.max(dataSummary.hoy.procesos, dataSummary.ayer.procesos),
        entradas_salidas: Math.max(dataSummary.hoy.entradas_salidas, dataSummary.ayer.entradas_salidas),
        procesos_ejecutados: Math.max(dataSummary.hoy.procesos_ejecutados, dataSummary.ayer.procesos_ejecutados),
        produccion: Math.max(dataSummary.hoy.produccion, dataSummary.ayer.produccion),
        no_conformes: Math.max(dataSummary.hoy.no_conformes, dataSummary.ayer.no_conformes),
      }
    : {
        indicadores: 1,
        procesos: 1,
        entradas_salidas: 1,
        procesos_ejecutados: 1,
        produccion: 1,
        no_conformes: 1,
      };

  // Configurar datos del gráfico con normalización
  const radarData = {
    labels: [
      `Indicadores (Máx: ${maxValues.indicadores})`,
      `Procesos (Máx: ${maxValues.procesos})`,
      `Entradas/Salidas (Máx: ${maxValues.entradas_salidas})`,
      `Procesos Ejecutados (Máx: ${maxValues.procesos_ejecutados})`,
      `Producción (Máx: ${maxValues.produccion})`,
      `No Conformes (Máx: ${maxValues.no_conformes})`,
    ],
    datasets: [
      {
        label: 'Hoy',
        data: dataSummary
          ? [
              normalize(dataSummary.hoy.indicadores, maxValues.indicadores),
              normalize(dataSummary.hoy.procesos, maxValues.procesos),
              normalize(dataSummary.hoy.entradas_salidas, maxValues.entradas_salidas),
              normalize(dataSummary.hoy.procesos_ejecutados, maxValues.procesos_ejecutados),
              normalize(dataSummary.hoy.produccion, maxValues.produccion),
              normalize(dataSummary.hoy.no_conformes, maxValues.no_conformes),
            ]
          : [],
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75, 192, 192)',
      },
      {
        label: 'Ayer',
        data: dataSummary
          ? [
              normalize(dataSummary.ayer.indicadores, maxValues.indicadores),
              normalize(dataSummary.ayer.procesos, maxValues.procesos),
              normalize(dataSummary.ayer.entradas_salidas, maxValues.entradas_salidas),
              normalize(dataSummary.ayer.procesos_ejecutados, maxValues.procesos_ejecutados),
              normalize(dataSummary.ayer.produccion, maxValues.produccion),
              normalize(dataSummary.ayer.no_conformes, maxValues.no_conformes),
            ]
          : [],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)',
      },
    ],
  };

  return (
    <div className="flex flex-col w-full items-center min-h-screen bg-gray-100 p-4">
      <header className="w-full text-center bg-red-600 text-white py-2 font-semibold text-xl">
        Servicio no disponible en este momento.
      </header>
      
      <div className="flex flex-col items-center justify-center flex-grow mt-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Comparativa del Día</h2>
        <Radar
          data={radarData}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            scales: {
              r: {
                angleLines: { display: true },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                  stepSize: 20,
                  callback: (value) => `${value}%`,
                },
                pointLabels: {
                  font: {
                    size: 12, // Tamaño de fuente aumentado para las etiquetas
                    weight: 'bold',
                  },
                  color: '#333', // Color de las etiquetas
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default ServiceUnavailable;
