import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './PieChart.css';

interface PieChartProps {
  data: {
    labels: string[];  // Array de etiquetas (labels) para el gráfico
    values: number[];   // Array de valores correspondientes
  };
}

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart: React.FC<PieChartProps> = ({ data }) => {

  const data_form = {
    labels: data.labels,
    datasets: [
      {
        label: '# of Votes',
        data: data.values,
        backgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderColor: [
          'rgba(255, 255, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const,  // Se asegura que 'bottom' es constante
        labels: {
          boxWidth: 20,
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="pie-chart-container">
      <Pie data={data_form} options={options} />
    </div>
  );
};

export default PieChart;
