import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../../../config';
import { Alert, AlertDescription } from "./Alert";

interface EntradaResponse {
  id: number;
  nombre: string;
  tipo: 'int' | 'float';
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
  tipo: 'int' | 'float';
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

export default function ValidatedCompactProcessModalWithAlerts({ id, onClose }: ModalProps) {
  const apiURL = API_CONFIG.baseURL;

  const [processData, setProcessData] = useState<ProcesoResponse | null>(null);
  const [formData, setFormData] = useState<any>({ etapas: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
              checkbox: indicador.tipo === 'checkbox' ? false : undefined,
              range: indicador.tipo === 'range' ? '' : undefined,
              criteria: indicador.tipo === 'criteria' ? '' : undefined,
              state: false,
            })),
            salidas: etapa.salidas.map((salida) => ({ id: salida.id, value: 0 })), // Salida inicialmente en 0
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

  const handlePreviewEvaluation = async (etapaIndex: number) => {
    try {
      const etapa = formData.etapas[etapaIndex];
      const response = await axios.post<{ preview: { salidas: any[]; indicadores: any[] } }>(
        `${apiURL}/execution/preview-evaluation`,
        {
          num_etapa: etapa.num_etapa,
          entradas: etapa.entradas,
          indicadores: etapa.indicadores.map((indicador: any) => ({
            id: indicador.id,
            entrada_id: indicador.entrada_id,
            checkbox: indicador.checkbox,
            range: indicador.range,
            criteria: indicador.criteria,
          })),
          salidas: etapa.salidas.map((salida: any) => ({ id: salida.id, value: 0 })),
        }
      );

      const previewData = response.data.preview;

      setFormData((prevState: any) => {
        const updatedEtapas = [...prevState.etapas];
        
        // Actualizar salidas con valores devueltos por la previsualización
        updatedEtapas[etapaIndex].salidas = previewData.salidas.map((salida: any) => ({
          ...salida,
        }));
        
        // Actualizar el estado de los indicadores si afectaron la salida
        updatedEtapas[etapaIndex].indicadores = previewData.indicadores.map((indicador: any, index: number) => ({
          ...updatedEtapas[etapaIndex].indicadores[index],
          state: indicador.state,
        }));
        
        return { ...prevState, etapas: updatedEtapas };
      });
    } catch (error) {
      console.error('Error fetching preview data:', error);
      setAlertMessage({ type: 'error', message: 'Error al obtener la previsualización. Intente de nuevo.' });
    }
  };

  const handleInputChange = (etapaIndex: number, type: string, fieldIndex: number, _fieldId: number, value: any) => {
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
      }
      return { ...prevState, etapas: updatedEtapas };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertMessage(null);

    try {
      await axios.post(`${apiURL}/execution/`, formData);
      setAlertMessage({ type: 'success', message: 'Proceso ejecutado exitosamente' });
      setTimeout(() => {
        setAlertMessage(null);
        onClose();
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
                        {processData.etapas[etapaIndex].entradas.map((entrada, entradaIndex) => (
                          <tr key={entrada.id}>
                            <td className="pr-2 py-1">
                              <label className="text-sm font-medium text-gray-700">{entrada.nombre}:</label>
                            </td>
                            <td>
                              <input
                                type="number"
                                value={etapa.entradas[entradaIndex].value}
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
                        {processData.etapas[etapaIndex].indicadores.map((indicador, indicadorIndex) => (
                          <tr key={indicador.id}>
                            <td className="pr-2 py-1">
                              <label className="text-sm font-medium text-gray-700">
                                {indicador.nombre}:
                                {etapa.indicadores[indicadorIndex].state && (
                                  <span className="text-xs ml-2 text-red-600">Afectó la salida</span>
                                )}
                              </label>
                            </td>
                            <td>
                              {indicador.tipo === 'checkbox' ? (
                                <input
                                  type="checkbox"
                                  checked={etapa.indicadores[indicadorIndex].checkbox || false}
                                  onChange={(e) => handleInputChange(etapaIndex, 'indicador', indicadorIndex, indicador.id, e.target.checked)}
                                />
                              ) : indicador.tipo === 'range' ? (
                                <input
                                  type="text"
                                  value={etapa.indicadores[indicadorIndex].range || ''}
                                  onChange={(e) => handleInputChange(etapaIndex, 'indicador', indicadorIndex, indicador.id, e.target.value)}
                                  placeholder="10-50"
                                  className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={etapa.indicadores[indicadorIndex].criteria || ''}
                                  onChange={(e) => handleInputChange(etapaIndex, 'indicador', indicadorIndex, indicador.id, e.target.value)}
                                  placeholder="Ej. 10%"
                                  className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
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
                              <label className="text-sm font-medium text-gray-700">{processData.etapas[etapaIndex].salidas[salidaIndex].nombre}:</label>
                            </td>
                            <td>
                              <input
                                type="number"
                                value={salida.value}
                                readOnly
                                className="w-full border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      type="button"
                      onClick={() => handlePreviewEvaluation(etapaIndex)}
                      className="mt-2 text-blue-600 hover:underline"
                    >
                      Realizar previsualización
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
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
