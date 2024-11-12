import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import './LineChart.css';

interface LineChartProps {
  data: {
    labels: string[];  // Nombres de las etapas
    noConformes: number[];  // Datos de no conformes
    salidas: number[];  // Datos de salidas
  };
}

// Registrar los elementos y escalas necesarios
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'No Conformes',
        data: data.noConformes,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Cambiado a semi-transparente
        fill: true,
        tension: 0, // Para suavizar la curva
        animations: {
          y: {
            duration: 1000,
            delay: 500,
            from: (ctx: { type: string; mode: string; dropped?: boolean; }) => {
              if (ctx.type === 'data' && ctx.mode === 'default' && !ctx.dropped) {
                ctx.dropped = true; // Indica que se ha procesado
                return 0; // Comienza desde 0
              }
            },
          },
        },
      },
      {
        label: 'Salidas',
        data: data.salidas,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)', // Cambiado a semi-transparente
        fill: true,
        tension: 0, // Para suavizar la curva
        animations: {
          y: {
            duration: 1000,
            delay: 300,
            from: (ctx: { type: string; mode: string; dropped?: boolean; }) => {
              if (ctx.type === 'data' && ctx.mode === 'default' && !ctx.dropped) {
                ctx.dropped = true; // Indica que se ha procesado
                return 0; // Comienza desde 0
              }
            },
          },
        },
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,  // Cambia el ancho del cuadro a 20 (puedes ajustarlo según necesites)
          boxHeight: 10,  // Cambia la altura del cuadro a 20 para hacer un cuadrado
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Número de Etapas',
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

export default LineChart;
