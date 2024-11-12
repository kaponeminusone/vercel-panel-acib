// src/components/ProcessDateEditor.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { API_CONFIG } from '../../config';

interface Registro {
  id: number;
  id_usuario: number;
  descripcion: string;
  creado: string;
  modificado: string;
  id_proceso: number | null;
  id_indicador: number | null;
  id_entrada: number | null;
  id_proceso_ejecutado: number | null;
}

const ProcessDateEditor: React.FC = () => {
  const [processId, setProcessId] = useState('');
  const [executionId, setExecutionId] = useState('');
  const [processName, setProcessName] = useState('');
  const [creationDate, setCreationDate] = useState<Date | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [recordDetails, setRecordDetails] = useState<Registro | null>(null); // Estado para almacenar el registro completo
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (processId || executionId || processName) {
      fetchProcess();
    }
  }, [processId, executionId, processName]);

  const fetchProcess = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get<Registro[]>(`${API_CONFIG.baseURL}/logs/search/process/executed`, {
        params: {
          id_proceso: processId || undefined,
          id_proceso_ejecutado: executionId || undefined,
          nombre_proceso: processName || undefined,
        },
      });

      if (response.data.length > 0) {
        const firstRecord = response.data[0];
        setRecordId(firstRecord.id);
        setRecordDetails(firstRecord); // Guardamos el registro completo para mostrar sus detalles
        setCreationDate(new Date(firstRecord.creado));
      } else {
        setError('No se encontró ningún registro con los criterios especificados.');
      }
    } catch (error) {
      setError('Error al obtener el registro. Por favor, intenta nuevamente.');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: Date | null) => {
    setCreationDate(date);
  };

  const updateCreationDate = async () => {
    if (!recordId || !creationDate) {
      setError('Por favor, selecciona una fecha válida.');
      return;
    }

    try {
      await axios.put(`${API_CONFIG.baseURL}/update-creation-date/${recordId}`, {
        anio: creationDate.getFullYear(),
        mes: creationDate.getMonth() + 1,
        dia: creationDate.getDate(),
        hora: creationDate.getHours(),
        minuto: creationDate.getMinutes(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError('Error al actualizar la fecha. Por favor, intenta nuevamente.');
      console.error('Update error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] mx-auto mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-3">Editar Fecha de Creación del Proceso</h3>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="ID Proceso"
          value={processId}
          onChange={(e) => setProcessId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
        />

        <input
          type="text"
          placeholder="ID Ejecución Proceso"
          value={executionId}
          onChange={(e) => setExecutionId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
        />

        <input
          type="text"
          placeholder="Nombre Proceso"
          value={processName}
          onChange={(e) => setProcessName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
        />

        <button
          onClick={fetchProcess}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          disabled={isLoading}
        >
          {isLoading ? 'Buscando...' : 'Buscar Registro'}
        </button>

        {recordDetails && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <h4 className="text-sm font-semibold m-0">Detalles del Registro</h4>
            <p className="text-sm m-0"><strong>ID:</strong> {recordDetails.id}</p>
            <p className="text-sm m-0"><strong>Usuario ID:</strong> {recordDetails.id_usuario}</p>
            <p className="text-sm m-0"><strong>Descripción:</strong> {recordDetails.descripcion}</p>
            <p className="text-sm m-0"><strong>Creado:</strong> {new Date(recordDetails.creado).toLocaleString()}</p>
            <p className="text-sm m-0"><strong>Proceso Ejecutado ID:</strong> {recordDetails.id_proceso_ejecutado || 'N/A'}</p>
          </div>
        )}

        {creationDate && (
          <>
            <DatePicker
              selected={creationDate}
              onChange={handleDateChange}
              showTimeSelect
              dateFormat="Pp"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />

            <button
              onClick={updateCreationDate}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none mt-3"
            >
              Actualizar Fecha
            </button>
          </>
        )}

        {success && <div className="text-green-600 text-sm mt-3">Fecha actualizada correctamente.</div>}
        {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
      </div>
    </div>
  );
};

export default ProcessDateEditor;
