// src/components/ScheduleConfig.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../config';
import { useAvailability } from '../../context/AvailabilityContext';

const ScheduleConfig: React.FC = () => {
  const [startHour, setStartHour] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { updateAvailability } = useAvailability();

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      // Configurar el horario
      await axios.post(`${API_CONFIG.baseURL}/config/horario?hora_inicio=${startHour}&duracion_horas=${duration}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Llamar al endpoint para generar el resumen
      await axios.post(`${API_CONFIG.baseURL}/generar-resumen`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);

      // Actualizar disponibilidad después de configurar el horario y generar el resumen
      await updateAvailability();

      // Desactivar el mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Error al configurar el horario o generar el resumen. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] mx-auto mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Configurar Horario de Actividad</h3>
      <form onSubmit={handleScheduleSubmit} className="space-y-4">
        <div className="flex justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Hora de Inicio (0-23)</label>
            <input
              type="number"
              min="0"
              max="23"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="block w-[80%] mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 10"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Duración en Horas (1-24)</label>
            <input
              type="number"
              min="1"
              max="24"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="block w-[80%] mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 8"
              required
            />
          </div>
        </div>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}

        {success && (
          <div className="text-green-600 text-sm text-center">
            Horario configurado exitosamente.
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Configurando...' : 'Configurar Horario'}
        </button>
      </form>
    </div>
  );
};

export default ScheduleConfig;
