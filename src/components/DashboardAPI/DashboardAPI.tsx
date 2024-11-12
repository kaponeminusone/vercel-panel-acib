import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PieChart from '../PieChart/PieChart';

interface ApiData {
  labels: string[];  // Array de etiquetas
  values: number[];  // Array de valores
  label: string;     // Label para el conjunto de datos
  colors: string[];  // Array de colores
}

const DashboardAPI: React.FC = () => {
  const [chartData, setChartData] = useState<{ labels: string[]; values: number[] } | null>(null);

  useEffect(() => {
    // Hacer la petición a la API
    axios.get<ApiData>('/api/data')
      .then(response => {
        // Procesar y transformar los datos
        const apiData: ApiData = response.data as ApiData; 
        const transformedData = {
          labels: apiData.labels,
          values: apiData.values, // Asegúrate de que esto corresponda a lo que necesitas
        };
        setChartData(transformedData); // Pasar solo labels y values
      })
      .catch(error => {
        console.error("Error al cargar datos de la API:", error);
      });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {chartData ? <PieChart data={chartData} /> : <p>Cargando...</p>}
    </div>
  );
};

export default DashboardAPI;
