import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Check } from 'lucide-react'; 
import './MonitoreoDashboard.css';
import PdfViewer from './PdfViewer'; 
import pdfDocument from '../../assets/proof.pdf'; 
import { API_CONFIG } from '../../config';

interface Process {
  id_proceso_ejecutado: number;
  no_conformidades: number;
  conformidades: number;
  num_etapas_con_conformidades: number;
  tasa_de_exito: number;
  cantidad_salida: number;
  cantidad_entrada: number;
  creado: string;
  nombre_proceso: string;
  id_usuario: number;
  nombre_usuario: string;
}

interface Record {
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

export default function MonitoreoDashboard() {
  const pdfUrlInitial = pdfDocument; 
  const [pdfUrl, setPdfUrl] = useState(pdfUrlInitial);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedProcesses, setSelectedProcesses] = useState<Set<number>>(new Set());
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const [errorProcesses, setErrorProcesses] = useState(false);
  const [errorRecords, setErrorRecords] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [usuario, setUsuario] = useState(0); // Cambia esto según tu lógica de usuario
  const [notas, setNotas] = useState('');
  const [destino, setDestino] = useState<string>(''); // Cambia a string para facilitar la entrada
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false); // Estado para saber si se generó el reporte

  const fetchProcesses = async () => {
    try {
      const apiURL = API_CONFIG.baseURL; 
      const response = await axios.get<Process[]>(`${apiURL}/logs/latest/executed/definition/100`);
      if (Array.isArray(response.data)) {
        setProcesses(response.data);
      } else {
        console.error('La respuesta de procesos no es un arreglo', response.data);
        setProcesses([]);
      }
    } catch (error) {
      console.error('Error fetching processes:', error);
      setErrorProcesses(true); 
    }
  };

  const fetchRecords = async () => {
    try {
      const apiURL = API_CONFIG.baseURL; 
      const response = await axios.get<Record[]>(`${apiURL}/logs/latest/100`); 
      if (Array.isArray(response.data)) {
        setRecords(response.data);
      } else {
        console.error('La respuesta de registros no es un arreglo', response.data);
        setRecords([]);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      setErrorRecords(true); 
    }
  };

  useEffect(() => {
    fetchProcesses();
    fetchRecords();
  }, []);

  const toggleProcessSelection = (processId: number) => {
    const newSelected = new Set(selectedProcesses);
    if (newSelected.has(processId)) {
      newSelected.delete(processId);
    } else {
      newSelected.add(processId);
    }
    setSelectedProcesses(newSelected);
  };

  const toggleRecordSelection = (recordId: number) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const generateReport = async () => {
    const reportData = {
      titulo,
      motivo,
      usuario,
      notas,
      destino: destino.split(',').map(id => Number(id.trim())), // Convierte a un array de números
      informacion: {
        procesos_ejecutados: Array.from(selectedProcesses),
        registros: Array.from(selectedRecords),
      },
    };
  
    setIsGeneratingReport(true); // Desactiva el botón
  
    try {
      const apiURL = API_CONFIG.baseURL;
      const response = await axios.post<Blob>(`${apiURL}/latex/generate`, reportData, {
        responseType: 'blob', // Para manejar la respuesta como un Blob
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data])); // Aquí usamos 'response.data' directamente
      setPdfUrl(url); // Asigna el PDF al PdfViewer
      setReportGenerated(true); // Marca que el reporte fue generado
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false); // Reactiva el botón
    }
  };

  const sendReport = async () => {
    if (!reportGenerated) return; // Verifica si se ha generado un reporte
  
    // Crea un objeto FormData para enviar datos en multipart/form-data
    const formData = new FormData();
    
    // Agrega el destino como un string de IDs separados por comas
    const destinosArray = destino.split(',').map(id => Number(id.trim()));
    destinosArray.forEach(id => formData.append('destino', id.toString()));
    
    // Agrega el archivo PDF a FormData
    const pdfBlob = await fetch(pdfUrl).then(res => res.blob()); // Obtiene el Blob del PDF
    formData.append('pdf', pdfBlob, 'reporte.pdf'); // Asigna el Blob y un nombre de archivo
    

    setIsSendingReport(true); // Activa la carga

    try {
      const apiURL = API_CONFIG.baseURL; // Asegúrate de que este sea correcto
      const response = await axios.post(`${apiURL}/email/report/send`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 200) {
        alert('Reporte enviado con éxito!'); // Mensaje de éxito
      }
    } catch (error) {
      console.error('Error sending report:', error);
      alert('Hubo un error al enviar el reporte.'); // Mensaje de error
    }finally{
      setIsSendingReport(false); // Activa la carga
    }
  };
  

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="header-title">MONITOREO</h1>
          <div className="search-container">
            <input
              type="text"
              className="search-input-monitor"
              placeholder="Buscar..."
            />
            <Search className="search-icon" size={20} />
          </div>
        </div>
      </header>

      <main className="main-content-monitor">
        <div className="main-section">
          <div className="content-columns">
            <div className="column left-column">
              <h3 className="column-title">Últimos procesos</h3>
              <div className='card-list'>
                {errorProcesses ? (
                  <p>Error al cargar procesos. Por favor, inténtelo más tarde.</p>
                ) : (
                  processes.length > 0 ? (
                    processes.map((process) => {
                      const processId = process.id_proceso_ejecutado;
                      return (
                        <div key={processId} className="card">
                          <div className="card-header">
                            <div>
                              <p className="card-time">{new Date(process.creado).toLocaleString()}</p>
                              <p className="card-title">{process.nombre_proceso}</p>
                              <p className="card-subtitle">Usuario: {process.nombre_usuario}</p>
                            </div>
                            <div className="card-tags-monitor">
                              <span className="tag blue-tag">Conformidades: {process.conformidades}</span>
                              <span className="tag green-tag">No conformidades: {process.no_conformidades}</span>
                              <Check 
                                className={`selection-icon ${selectedProcesses.has(processId) ? 'selected' : 'not-selected'}`} 
                                size={20} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleProcessSelection(processId);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No hay procesos disponibles.</p>
                  )
                )}
              </div>
            </div>
            <div className="column right-column">
              <h3 className="column-title">Últimos registros</h3>
              <div className='card-list'>
                {errorRecords ? (
                  <p>Error al cargar registros. Por favor, inténtelo más tarde.</p>
                ) : (
                  records.length > 0 ? (
                    records.map((record) => {
                      const recordId = record.id;
                      return (
                        <div key={recordId} className="card">
                          <p className="card-time">{new Date(record.creado).toLocaleString()}</p>
                          <p className="card-title">{record.descripcion}</p>
                          <p className="card-subtitle">Usuario ID: {record.id_usuario}</p>
                          <Check 
                            className={`selection-icon ${selectedRecords.has(recordId) ? 'selected' : 'not-selected'}`} 
                            size={20} 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRecordSelection(recordId);
                            }}
                          />
                        </div>
                      );
                    })
                  ) : (
                    <p>No hay registros disponibles.</p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="sidebar-monitor">
          <div className="sidebar-actions">
            <button className="action-button" disabled={isGeneratingReport} onClick={generateReport}>
              {isGeneratingReport ? 'Generando...' : 'Generar reporte'}
            </button>
            {reportGenerated && ( // Muestra el botón de enviar si el reporte fue generado
              <button
              className="action-button"
              onClick={sendReport}
              disabled={isSendingReport} // Deshabilitar mientras se envía
            >
              {isSendingReport ? 'Enviando...' : 'Enviar Reporte'}
            </button>
            )}
          </div>
          <div className="sidebar-content">
            {selectedProcesses.size > 0 || selectedRecords.size > 0 ? (
              <>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col w-[95%]">
                    <div>
                      <label htmlFor="titulo" className="block text-gray-700 mb-1">Título del reporte:</label>
                      <input
                        id="titulo"
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="motivo" className="block text-gray-700 mb-1">Motivo:</label>
                      <input
                        id="motivo"
                        type="text"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-[95%]">
                    <div>
                      <label htmlFor="usuario" className="block text-gray-700 mb-1">Usuario:</label>
                      <input
                        id="usuario"
                        type="number"
                        value={usuario}
                        onChange={(e) => setUsuario(Number(e.target.value))}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="destino" className="block text-gray-700 mb-1">Destino:</label>
                      <input
                        id="destino"
                        type="text"
                        value={destino}
                        onChange={(e) => setDestino(e.target.value)}
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <small className="text-gray-500 text-xs">Introduce IDs separados por comas (ej. 1, 2, 3)</small>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="notas" className="block text-gray-700 mb-1 w-[95%]">Notas:</label>
                    <textarea
                      id="notas"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      className="w-[95%] px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 h-20 resize-none"
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    <p># de procesos seleccionados: {selectedProcesses.size}</p>
                    <p># de reportes seleccionados: {selectedRecords.size}</p>
                  </div>
                </div>
              </>
            ) : (
              <p>No ha seleccionado procesos ni registros.</p>
            )}
            <h2 className="sidebar-title">PDF Visor</h2>
            <PdfViewer pdfFile={pdfUrl} />
          </div>
        </div>
      </main>
    </div>
  );
}
