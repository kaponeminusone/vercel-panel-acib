import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config'; // Asegúrate de que esta ruta sea correcta
import { Alert, AlertDescription } from "./Alert"

// Define las interfaces para las respuestas del API
interface EntradaResponse {
    id: number;
    nombre: string;
    tipo: 'int' | 'float'; // Asegúrate de que estos coincidan con tus tipos de entrada
}

interface IndicadorResponse {
    id: number;
    nombre: string;
    tipo: 'range' | 'checkbox' | 'criteria';
    entrada_id: number;
}

interface SalidaResponse {
    id: number;
    nombre: string;
    tipo: 'int' | 'float'; // Asegúrate de que estos coincidan con tus tipos de salida
}

interface EtapaResponse {
    id: number;
    num_etapa: number;
    entradas: EntradaResponse[];
    indicadores: IndicadorResponse[];
    salidas: SalidaResponse[];
}

interface ProcesoResponse {
    id: number;
    nombre: string;
    num_etapas: number;
    etapas: EtapaResponse[];
}
interface ModalProps {
  id: string;
  onClose: () => void;
}

interface ModalProps {
  id: string;
  onClose: () => void;
}

export default function ValidatedCompactProcessModalWithAlerts({ id, onClose }: ModalProps) {
  const apiURL = API_CONFIG.baseURL;

  const [processData, setProcessData] = useState<ProcesoResponse | null>(null);
  const [formData, setFormData] = useState<any>({ etapas: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    const fetchProcessData = async () => {
      try {
        const response = await axios.get<ProcesoResponse>(`${apiURL}/process/${id}`);
        setProcessData(response.data);

        const initialFormData = {
          id_proceso: parseInt(id),
          etapas: response.data.etapas.map((etapa) => ({
            num_etapa: etapa.num_etapa,
            entradas: etapa.entradas.map((entrada) => ({ id: entrada.id, value: '' })),
            indicadores: etapa.indicadores.map((indicador) => ({
              id: indicador.id,
              entrada_id: indicador.entrada_id,
              checkbox: false,
              range: '',
              criteria: '',
            })),
            salidas: etapa.salidas.map((salida) => ({ id: salida.id, value: '' })),
          })),
        };
        setFormData(initialFormData);
      } catch (error) {
        console.error('Error fetching process data:', error);
        setAlertMessage({ type: 'error', message: 'Error al cargar los datos del proceso. Por favor, intente de nuevo.' });
      }
    };

    fetchProcessData();
  }, [id, apiURL]);

  useEffect(() => {
    const validateForm = () => {
      if (!formData.etapas) return false;

      return formData.etapas.every((etapa: any) => 
        etapa.entradas.every((entrada: any) => entrada.value !== '') &&
        etapa.indicadores.every((indicador: any) => {
          if (indicador.checkbox !== undefined) return true;
          if (indicador.range !== undefined) return indicador.range !== '';
          if (indicador.criteria !== undefined) return indicador.criteria !== '';
          return false;
        }) &&
        etapa.salidas.every((salida: any) => salida.value !== '')
      );
    };

    setIsFormValid(validateForm());
  }, [formData]);

  const handleInputChange = (etapaIndex: number, type: string, fieldIndex: number, fieldId: number, value: any) => {
    setFormData((prevState: any) => {
      const updatedEtapas = [...prevState.etapas];
      switch (type) {
        case 'entrada':
          updatedEtapas[etapaIndex].entradas[fieldIndex].value = value;
          break;
        case 'indicador':
          const indicator = updatedEtapas[etapaIndex].indicadores[fieldIndex];
          if (indicator.checkbox !== undefined) indicator.checkbox = value;
          else if (indicator.range !== undefined) indicator.range = value;
          else if (indicator.criteria !== undefined) indicator.criteria = value;
          break;
        case 'salida':
          updatedEtapas[etapaIndex].salidas[fieldIndex].value = value;
          break;
      }
      return { ...prevState, etapas: updatedEtapas };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setAlertMessage(null);

    try {
      const response = await axios.post(`${apiURL}/execution/`, formData);
      console.log('Respuesta del servidor:', response.data);
      setAlertMessage({ type: 'success', message: 'Proceso ejecutado exitosamente' });
      setTimeout(() => {
        setAlertMessage(null);
        onClose(); // Cerrar el modal después de una presentación exitosa
      }, 3000);
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      setAlertMessage({ type: 'error', message: 'Error al ejecutar el proceso. Por favor, intente de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-md w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Iniciar Proceso - ID: {id}</h2>
        
        {alertMessage && (
          <Alert className={`mb-4 ${alertMessage.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'}`}>
            <AlertDescription>{alertMessage.message}</AlertDescription>
          </Alert>
        )}
        
        {processData && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formData.etapas.map((etapa: any, etapaIndex: number) => (
              <div key={etapa.num_etapa} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Etapa {etapa.num_etapa}</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  {/* Entradas */}
                  <div>
                    <h4 className="text-md font-medium mb-2">Entradas</h4>
                    <table className="w-full">
                      <tbody>
                        {etapa.entradas.map((entrada: any, entradaIndex: number) => (
                          <tr key={entrada.id}>
                            <td className="pr-2 py-1">
                              <label htmlFor={`entrada-${entrada.id}`} className="text-sm font-medium text-gray-700">
                                {processData.etapas[etapaIndex].entradas[entradaIndex].nombre}:
                              </label>
                            </td>
                            <td>
                              <input
                                id={`entrada-${entrada.id}`}
                                type="number"
                                value={entrada.value}
                                onChange={(e) => handleInputChange(etapaIndex, 'entrada', entradaIndex, entrada.id, e.target.value)}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                                required
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Indicadores */}
                  <div>
                    <h4 className="text-md font-medium mb-2">Indicadores</h4>
                    <table className="w-full">
                      <tbody>
                        {etapa.indicadores.map((indicador: any, indicadorIndex: number) => (
                          <tr key={indicador.id}>
                            <td className="pr-2 py-1">
                              <label className="text-sm font-medium text-gray-700">
                                {processData.etapas[etapaIndex].indicadores[indicadorIndex].nombre}:
                              </label>
                              <div className="text-xs text-gray-500">
                                (Afecta: {processData.etapas[etapaIndex].entradas.find((e: any) => e.id === indicador.entrada_id)?.nombre})
                              </div>
                            </td>
                            <td>
                              {indicador.checkbox !== undefined ? (
                                <input
                                  type="checkbox"
                                  checked={indicador.checkbox}
                                  onChange={(e) => handleInputChange(etapaIndex, 'indicador', indicadorIndex, indicador.id, e.target.checked)}
                                  className="mt-1"
                                />
                              ) : indicador.range !== undefined ? (
                                <input
                                  type="text"
                                  value={indicador.range}
                                  onChange={(e) => handleInputChange(etapaIndex, 'indicador', indicadorIndex, indicador.id, e.target.value)}
                                  placeholder="10-50"
                                  className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                                  required
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={indicador.criteria}
                                  onChange={(e) => handleInputChange(etapaIndex, 'indicador', indicadorIndex, indicador.id, e.target.value)}
                                  placeholder="Ej. >300"
                                  className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                                  required
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Salidas */}
                  <div>
                    <h4 className="text-md font-medium mb-2">Salidas</h4>
                    <table className="w-full">
                      <tbody>
                        {etapa.salidas.map((salida: any, salidaIndex: number) => (
                          <tr key={salida.id}>
                            <td className="pr-2 py-1">
                              <label htmlFor={`salida-${salida.id}`} className="text-sm font-medium text-gray-700">
                                {processData.etapas[etapaIndex].salidas[salidaIndex].nombre}:
                              </label>
                            </td>
                            <td>
                              <input
                                id={`salida-${salida.id}`}
                                type="number"
                                value={salida.value}
                                onChange={(e) => handleInputChange(etapaIndex, 'salida', salidaIndex, salida.id, e.target.value)}
                                className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                                required
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </button>
              <button
                onClick={onClose}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                type="button"
              >
                Cerrar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}