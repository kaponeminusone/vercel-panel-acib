import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Check } from 'lucide-react';
import './MonitoreoDashboard.css';
import PdfViewer from './PdfViewer';
import pdfDocument from '../../assets/proof.pdf';
import { API_CONFIG } from '../../config';
import { useUser } from '../../context/UserContext'; // Contexto de usuario

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

interface UserResponse {
  id: number;
  nombre: string;
  email: string;
  tipo: string;
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
  const { user } = useUser(); // Obtener usuario del contexto
  const [usuario, setUsuario] = useState(user?.email || ''); // Placeholder del email del usuario
  const [notas, setNotas] = useState('');
  const [destino, setDestino] = useState<string>(''); // Campo de destino como string de correos electrónicos
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const fetchProcesses = async () => {
    try {
      const apiURL = API_CONFIG.baseURL;
      const response = await axios.get<Process[]>(`${apiURL}/logs/latest/executed/definition/100`);
      setProcesses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching processes:', error);
      setErrorProcesses(true);
    }
  };

  const fetchRecords = async () => {
    try {
      const apiURL = API_CONFIG.baseURL;
      const response = await axios.get<Record[]>(`${apiURL}/logs/latest/100`);
      setRecords(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching records:', error);
      setErrorRecords(true);
    }
  };

  useEffect(() => {
    fetchProcesses();
    fetchRecords();
  }, []);

  const fetchUserIdByEmail = async (email: string): Promise<number | null> => {
    try {
      const apiURL = API_CONFIG.baseURL;
      const response = await axios.get<UserResponse>(`${apiURL}/users/${email}`);
      return response.data.id; // Retorna el ID encontrado
    } catch (error) {
      console.warn(`No se encontró el ID para el correo: ${email}`);
      return null;
    }
  };

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
    const destinatarios = await Promise.all(
      destino.split(',').map(async (email) => {
        const id = await fetchUserIdByEmail(email.trim());
        return id !== null ? id : null;
      })
    ).then((ids) => ids.filter((id) => id !== null) as number[]);

    const userId = await fetchUserIdByEmail(usuario); // Usar el ID del usuario si existe

    const reportData = {
      titulo,
      motivo,
      usuario: userId ?? undefined,
      notas,
      destino: destinatarios,
      informacion: {
        procesos_ejecutados: Array.from(selectedProcesses),
        registros: Array.from(selectedRecords),
      },
    };

    setIsGeneratingReport(true);

    try {
      const apiURL = API_CONFIG.baseURL;
      const response = await axios.post<Blob>(`${apiURL}/latex/generate`, reportData, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setPdfUrl(url);
      setReportGenerated(true);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const sendReport = async () => {
    if (!reportGenerated) return;

    const formData = new FormData();
    const destinatarios = await Promise.all(
      destino.split(',').map(async (email) => {
        const id = await fetchUserIdByEmail(email.trim());
        return id !== null ? id : null;
      })
    );

    destinatarios.forEach((id) => id && formData.append('destino', id.toString()));

    const pdfBlob = await fetch(pdfUrl).then((res) => res.blob());
    formData.append('pdf', pdfBlob, 'reporte.pdf');

    setIsSendingReport(true);

    try {
      const apiURL = API_CONFIG.baseURL;
      const response = await axios.post(`${apiURL}/email/report/send`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) alert('Reporte enviado con éxito!');
    } catch (error) {
      console.error('Error sending report:', error);
      alert('Hubo un error al enviar el reporte.');
    } finally {
      setIsSendingReport(false);
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
              <div className="card-list">
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
              <div className="card-list">
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
            {reportGenerated && (
              <button
                className="action-button"
                onClick={sendReport}
                disabled={isSendingReport}
              >
                {isSendingReport ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            )}
          </div>
          <div className="sidebar-content">
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
            <div className="space-y-3 text-sm w-[95%]">
              <label htmlFor="usuario" className="block text-gray-700 mb-1">Usuario:</label>
              <input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder={user?.email || 'Ingresa el correo del usuario'}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <label htmlFor="destino" className="block text-gray-700 mb-1">Destino:</label>
              <input
                id="destino"
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Introduce correos separados por comas"
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <small className="text-gray-500 text-xs">Introduce correos separados por comas</small>
              <label htmlFor="notas" className="block text-gray-700 mb-1">Notas:</label>
              <textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 h-20 resize-none"
              />
              <div className="text-xs text-gray-600">
                <p># de procesos seleccionados: {selectedProcesses.size}</p>
                <p># de reportes seleccionados: {selectedRecords.size}</p>
              </div>
            </div>
            <h2 className="sidebar-title">PDF Visor</h2>
            <PdfViewer pdfFile={pdfUrl} />
          </div>
        </div>
      </main>
    </div>
  );
}
