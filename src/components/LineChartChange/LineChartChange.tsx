import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import './LineChartChange.css';

interface LineChartChangeProps {
  data: {
    noConformes: number[];  // Datos de no conformes
    salidas: number[];  // Datos de salidas
    num_procesos: number[]; // Datos de procesos
  };
  timeFrame: 'week' | 'month' | 'year'; // Tipo de tiempo
}

// Registrar los elementos y escalas necesarios
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const LineChartChange: React.FC<LineChartChangeProps> = ({ data, timeFrame }) => {
  // Generar etiquetas según el tipo de gráfico
  let labels: string[];

  const getDayLabel = (daysAgo: number) => {
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    const options = { weekday: 'long', day: 'numeric' } as const;
    return date.toLocaleDateString('es-ES', options); // Formato: "Jueves 10"
  };

  if (timeFrame === 'week') {
    labels = [
      getDayLabel(0),  // Hoy
      getDayLabel(1),  // D-1
      getDayLabel(2),  // D-2
      getDayLabel(3),  // D-3
      getDayLabel(4),  // D-4
      getDayLabel(5),  // D-5
      getDayLabel(6),  // D-6
    ];
  } else if (timeFrame === 'month') {
    labels = Array.from({ length: 30 }, (_, i) => `D-${i + 1}`);
  } else if (timeFrame === 'year') {
    labels = [
      'Ene', 
      'Feb', 
      'Mar', 
      'Abr', 
      'May', 
      'Jun', 
      'Jul', 
      'Ago', 
      'Sep', 
      'Oct', 
      'Nov', 
      'Dic'
    ];
  } else {
    labels = [];
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'No Conformes',
        data: data.noConformes,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Cambiado a semi-transparente
        fill: true,
        tension: 0, // Para suavizar la curva
      },
      {
        label: 'Salidas',
        data: data.salidas,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)', // Cambiado a semi-transparente
        fill: true,
        tension: 0, // Para suavizar la curva
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Días o Meses',
        },
        grid: {
          display: false,  // Oculta la cuadrícula del eje X
        },
      },
      y: {
        title: {
          display: true,
          text: 'Cantidad',
        },
        grid: {
          display: false,  // Oculta la cuadrícula del eje Y
        },
      },
    },
  };

  return (
    <div className="line-chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChartChange;
