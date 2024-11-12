import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Eye } from 'lucide-react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion';
import { Button } from "./components/Button"
import { Input } from "./components/Input"
import { Alert, AlertDescription } from "./components/Alert"
import Proceso from '../Form/ProcessForm'
import EntradaForm from '../Form/EntradaForm'
import IndicadorForm from '../Form/IndicadorForm'
import { API_CONFIG } from '../../config'
import './CreationInterface.css'
import Modal from './components/Modal';

type ItemType = 'process' | 'indicator' | 'input';

interface Process {
  id: number;
  nombre: string;
  descripcion?: string;
  num_etapas: number;
  num_entradas: number;
  num_salidas: number;
  num_indicadores: number;
}

interface Indicator {
  id: number;
  nombre: string;
  tipo: 'range' | 'criteria' | 'checkbox';
  descripcion?: string;
}

interface InputData {
  id: number;
  nombre: string;
  tipo: 'int' | 'float';
  descripcion?: string;
}

interface ProcessDetail {
  nombre: string;
  num_etapas: number;
  etapas: {
    num_etapa: number;
    entradas: { nombre: string; tipo: string }[];
    indicadores: { nombre: string; tipo: string }[];
    salidas: { nombre: string; tipo: string }[];
  }[];
}

interface ItemListProps {
  type: ItemType;
  items: (Process | Indicator | InputData)[];
}

const ItemList: React.FC<ItemListProps> = ({ type, items }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [processDetails, setProcessDetails] = useState<Record<string, ProcessDetail | null>>({});
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  const toggleItem = async (itemId: string, itemType: ItemType) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(itemId)) {
      newExpandedItems.delete(itemId);
      setProcessDetails((prevDetails) => ({ ...prevDetails, [itemId]: null }));
    } else {
      newExpandedItems.add(itemId);
      if (itemType === 'process' && !processDetails[itemId]) {
        try {
          const response = await axios.get<ProcessDetail>(`${API_CONFIG.baseURL}/process/${itemId}`);
          setProcessDetails((prevDetails) => ({ ...prevDetails, [itemId]: response.data }));
        } catch (error) {
          console.error('Error fetching process details:', error);
        }
      }
    }
    setExpandedItems(newExpandedItems);
  };

  return (
    <Accordion type="multiple">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id.toString()} className="card-creation">
          <AccordionTrigger
            className="card-header-creation item-container-content w-full m-0 flex min-h-10 pt-2 pb-2 pl-4 justify-between items-center bg-white"
            onClick={() => toggleItem(item.id.toString(), type)}
          >
            <div className='flex w-full justify-between flex-col'>
              <div className='flex w-full justify-between'>
                <h4 className="card-title-creation text-left break-words item-title m-0 inline-block">
                  {item.nombre}
                </h4>
                <h4 className="item-title text-left whitespace-nowrap inline-block pr-[10px]">ID: {item.id}</h4>
              </div>
              {type === 'process' && (
                <p className="card-subtitle-creation text-xs text-left pt-[5px] text-gray-700">
                  Etapas: {(item as Process).num_etapas}, Entradas: {(item as Process).num_entradas}, Salidas: {(item as Process).num_salidas}, Indicadores: {(item as Process).num_indicadores}
                </p>
              )}
            </div>
            {expandedItems.has(item.id.toString()) && <Eye className="h-5 w-5 text-gray-700 hover:text-gray-900 transition-colors" />}
          </AccordionTrigger>
          <AccordionContent className="p-1 text-gray-700">
            {type === 'process' && (
              <div
                onClick={() => setSelectedProcessId(item.id.toString())}
                className="text-sm flex flex-col items-center justify-center bg-blue-600 text-white hover:bg-blue-500 transition-colors rounded-md px-2 py-2 cursor-pointer"
              >
                <span>Iniciar Proceso</span>
              </div>
            )}
            {type === 'process' && processDetails[item.id] ? (
              processDetails[item.id]?.etapas.map((etapa, index) => (
                <div key={index} className="mb-3">
                  <h5 className="text-sm font-semibold">Etapa {etapa.num_etapa}</h5>
                  <div className="ml-2">
                    <h6 className="text-xs font-medium m-0">Entradas:</h6>
                    <ul className="list-disc pl-4">
                      {etapa.entradas.map((entrada, i) => (
                        <li key={i} className="text-xs">{entrada.nombre} ({entrada.tipo})</li>
                      ))}
                    </ul>
                    <h6 className="text-xs font-medium m-0">Indicadores:</h6>
                    <ul className="list-disc pl-4">
                      {etapa.indicadores.map((indicador, i) => (
                        <li key={i} className="text-xs">{indicador.nombre} ({indicador.tipo})</li>
                      ))}
                    </ul>
                    <h6 className="text-xs font-medium m-0">Salidas:</h6>
                    <ul className="list-disc pl-4">
                      {etapa.salidas.map((salida, i) => (
                        <li key={i} className="text-xs">{salida.nombre} ({salida.tipo})</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            ) : type === 'indicator' || type === 'input' ? (
              <div className="ml-2">
                <p className="text-sm font-medium">Tipo: {(item as Indicator | InputData).tipo}</p>
                {item.descripcion && <p className="text-sm text-gray-600">Descripción: {item.descripcion}</p>}
              </div>
            ) : (
              <p>Cargando detalles...</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
      {selectedProcessId && (
        <Modal id={selectedProcessId} onClose={() => setSelectedProcessId(null)} />
      )}
    </Accordion>
  );
};

export default function CreationInterface() {
  const [activeForm, setActiveForm] = useState<ItemType | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [inputs, setInputs] = useState<InputData[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const processResponse = await axios.get<Process[]>(`${API_CONFIG.baseURL}/process/`);
      setProcesses(processResponse.data);

      const indicatorResponse = await axios.get<Indicator[]>(`${API_CONFIG.baseURL}/indicators/`);
      setIndicators(indicatorResponse.data);

      const inputResponse = await axios.get<InputData[]>(`${API_CONFIG.baseURL}/inputs/`);
      setInputs(inputResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = async (type: ItemType, newItem: any) => {
    try {
      let response;
      if (type === 'process') {
        response = await axios.post(`${API_CONFIG.baseURL}/process/`, newItem);
      } else if (type === 'indicator') {
        response = await axios.post(`${API_CONFIG.baseURL}/indicators/`, newItem);
      } else if (type === 'input') {
        response = await axios.post(`${API_CONFIG.baseURL}/inputs/`, newItem);
      }

      if (response?.status === 200) {
        fetchData(); // Actualiza la lista después de una creación exitosa
        setSuccessMessage(`${type === 'process' ? 'Proceso' : type === 'indicator' ? 'Indicador' : 'Entrada/Salida'} creado exitosamente`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      if (response?.status === 201) {
        fetchData(); // Actualiza la lista después de una creación exitosa
        setSuccessMessage(`${type === 'process' ? 'Proceso' : type === 'indicator' ? 'Indicador' : 'Entrada/Salida'} creado exitosamente`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error al crear el item:', error);
      setSuccessMessage('Error al crear el item. Por favor, intente de nuevo.');
    }
  };

  const renderForm = () => {
    if (activeForm === 'process') {
      return (
        <Proceso onCreateProcess={(newProcess) => addItem('process', newProcess)} />
      );
    } else if (activeForm === 'input') {
      return <EntradaForm onAddEntrada={(entrada) => addItem('input', entrada)} />;
    } else if (activeForm === 'indicator') {
      return <IndicadorForm onAddIndicador={(indicador) => addItem('indicator', indicador)} />;
    }
    return null;
  };

  return (
    <div className="creation-container container mx-auto">
      <h1 className="text-2xl font-bold mb-4">CREACIÓN</h1>
      <Input className="mb-2 w-1/2" type="text" placeholder="Buscar..." />
      {successMessage && (
        <Alert className="mb-4">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <div className="grid h-full w-full grid-cols-4 gap-4 overflow-scroll box-border">
        <div className='col-span-1'>
          <div className='flex flex-row justify-start'>
            <h3 className="text-xl font-semibold mb-2">Procesos</h3>
            <Button
              className="flex justify-center border-none items-center w-6 h-6 mt-6 ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              onClick={() => setActiveForm('process')}
              size="sm"
            >
              <Plus className="text-white h-4 w-4" />
            </Button>
          </div>
          <ItemList type="process" items={processes} />
        </div>
        <div className='col-span-1'>
          <div className='flex flex-row justify-start'>
            <h3 className="text-xl font-semibold mb-2">Indicadores</h3>
            <Button
              className="flex justify-center border-none items-center w-6 h-6 mt-6 ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              onClick={() => setActiveForm('indicator')}
              size="sm"
            >
              <Plus className="text-white h-4 w-4" />
            </Button>
          </div>
          <ItemList type="indicator" items={indicators} />
        </div>
        <div className='col-span-1'>
          <div className='flex flex-row justify-start'>
            <h3 className="text-xl font-semibold mb-2">Entradas/Salidas</h3>
            <Button
              className="flex justify-center border-none items-center w-6 h-6 mt-6 ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              onClick={() => setActiveForm('input')}
              size="sm"
            >
              <Plus className="text-white h-4 w-4" />
            </Button>
          </div>
          <ItemList type="input" items={inputs} />
        </div>
        <div className='col-span-1 flex w-full box-border pr-10'>
          {renderForm()}
        </div>
      </div>
    </div>
  );
}
