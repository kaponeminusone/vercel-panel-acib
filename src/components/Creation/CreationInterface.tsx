'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Plus, Trash2, Eye } from 'lucide-react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion';
import { Button } from "./components/Button"
import { Input } from "./components/Input"
import { Textarea } from "./components/Textarea"
import { Alert, AlertDescription } from "./components/Alert"
import Proceso from '../Form/ProcessForm' 
import EntradaForm from '../Form/EntradaForm' 
import IndicadorForm from '../Form/IndicadorForm' 
import { API_CONFIG } from '../../config'
import './CreationInterface.css'
import Modal from './components/Modal';


type ItemType = 'process' | 'indicator' | 'input'

interface Item {
  id: string
  name: string
  type: ItemType
  details?: string[]
  description?: string
}

interface Process {
  id: number
  nombre: string
}

interface Indicator {
  id: number
  nombre: string
  tipo: 'range' | 'criteria' | 'checkbox'
}

interface InputData {
  id: number
  nombre: string
  tipo: 'int' | 'float'
}

interface ItemListProps {
  type: ItemType
  items: Item[]
  removeItem: (id: string) => void
}

const ItemList: React.FC<ItemListProps> = ({ type, items, removeItem }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  const toggleItem = (itemId: string) => {
    const newExpandedItems = new Set(expandedItems);
    if (newExpandedItems.has(itemId)) {
      newExpandedItems.delete(itemId);
    } else {
      newExpandedItems.add(itemId);
    }
    setExpandedItems(newExpandedItems);
  };

  return (
    <>
      <Accordion type="multiple">
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id.toString()}
            className="card-creation" // Clase para aplicar estilos de tarjeta
          >
            <AccordionTrigger
              className="card-header-creation item-container-content w-full m-0 flex min-h-10 pt-2 pb-2 pl-4 justify-between items-center bg-white" // Clase de cabecera de tarjeta
              onClick={() => toggleItem(item.id.toString())}
            >
              <div className='flex w-full justify-between'>
                <h4 className="card-title-creation item-title m-0 inline-block">{item.name}</h4>
                {item.type && <p className="card-subtitle-creation text-sm">ID: <span className="font-medium">{item.id}</span></p>}
              </div>
              {expandedItems.has(item.id.toString()) && (
                <Eye className="h-5 w-5 text-gray-700 hover:text-gray-900 transition-colors" />
              )}
            </AccordionTrigger>
            <AccordionContent className="p-1 text-gray-700">
                {item.type && (
                <p className="card-subtitle-creation text-sm">
                  {item.type === 'process' 
                    ? `ID: ${item.id}    Inicialización de parametros con los valores`
                    : `ID: ${item.id}`}
                </p>
              )}
              {item.type === 'process' && (
                <div
                  onClick={() => setSelectedProcessId(item.id)} // Abre el modal con el ID del proceso
                  className="mt-3 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500 transition-colors rounded-md px-4 py-2 cursor-pointer"
                >
                  <span>Iniciar Proceso</span>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Renderiza el modal solo si hay un proceso seleccionado */}
      {selectedProcessId && (
        <Modal id={selectedProcessId} onClose={() => setSelectedProcessId(null)} />
      )}
    </>
  );
};

export default function CreationInterface() {
  const [activeForm, setActiveForm] = useState<ItemType | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showProcessForm, setShowProcessForm] = useState(false)

  const apiURL = API_CONFIG.baseURL

  const [processes, setProcesses] = useState<Process[]>([])
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [inputs, setInputs] = useState<InputData[]>([])

  const [newItemName, setNewItemName] = useState<string>('')
  const [newItemDescription, setNewItemDescription] = useState<string>('')

  const addItem = async (type: ItemType, newItem?: Item) => {
    try {
      let response;
  
      if (type === 'input') {
        response = await axios.post(`${apiURL}/inputs/`, {
          id: Number(newItem?.id),
          nombre: newItem?.name,
          tipo: 'int',
        });
      } else if (type === 'indicator') {
        response = await axios.post(`${apiURL}/indicators/`, {
          id: Number(newItem?.id),
          nombre: newItem?.name,
          tipo: 'range',
        });
      } else if (type === 'process') {
        response = await axios.post(`${apiURL}/process/`, JSON.parse(newItem?.description || '{}'));
      }
  
      console.log("Response:", response?.data);
  
      await fetchData();
  
      setSuccessMessage(`${type === 'process' ? 'Proceso' : type === 'indicator' ? 'Indicador' : 'Entrada/Salida'} creado exitosamente`);
  
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error al crear el item:', error);
      setSuccessMessage('Error al crear el item. Por favor, intente de nuevo.');
    }
  };
  
  const fetchData = async () => {
    try {
      const processResponse = await axios.get<Process[]>(`${apiURL}/process/`);
      setProcesses(processResponse.data);
  
      const indicatorResponse = await axios.get<Indicator[]>(`${apiURL}/indicators/`);
      setIndicators(indicatorResponse.data);
  
      const inputResponse = await axios.get<InputData[]>(`${apiURL}/inputs/`);
      setInputs(inputResponse.data);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  }
  
  useEffect(() => {
    fetchData();
  }, [apiURL]);

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const handleAddEntrada = (entrada: { id: number; nombre: string; tipo: 'int' | 'float' }) => {
    const newEntrada: Item = {
      id: entrada.id.toString(),
      name: entrada.nombre,
      type: 'input',
      description: `Tipo: ${entrada.tipo}`,
      details: []
    };
    addItem('input', newEntrada);
  };

  const handleAddIndicador = (indicador: { id: number; nombre: string; tipo: 'range' | 'criteria' | 'checkbox' }) => {
    const newIndicador: Item = {
      id: indicador.id.toString(),
      name: indicador.nombre,
      type: 'indicator',
      description: `Tipo: ${indicador.tipo}`,
      details: []
    };
    addItem('indicator', newIndicador);
  };

  // Mapea los procesos a Items
  const mapProcessesToItems = (processes: Process[]): Item[] => {
    return processes.map(process => ({
      id: process.id.toString(),
      name: process.nombre,
      type: 'process', 
      description: '',  
      details: []
    }));
  };

  // Mapea los indicadores a Items
  const mapIndicatorsToItems = (indicators: Indicator[]): Item[] => {
    return indicators.map(indicator => ({
      id: indicator.id.toString(),
      name: indicator.nombre,
      type: 'indicator',
      description: '',  
      details: []
    }));
  };

  // Mapea las entradas a Items
  const mapInputsToItems = (inputs: InputData[]): Item[] => {
    return inputs.map(input => ({
      id: input.id.toString(),
      name: input.nombre,
      type: 'input',
      description: '',  
      details: []
    }));
  };

  // Modifica la función renderItems para usar los mapeos
  const renderItems = (type: ItemType) => {
    let filteredItems: Item[];

    if (type === 'process') {
      filteredItems = mapProcessesToItems(processes);
    } else if (type === 'indicator') {
      filteredItems = mapIndicatorsToItems(indicators);
    } else {
      filteredItems = mapInputsToItems(inputs);
    }

    return (
      <ItemList
        type={type}
        items={filteredItems}
        removeItem={removeItem}
      />
    );
  };

  const renderForm = () => {
    if (activeForm === 'process' && showProcessForm) {
      return (
        <div className="mt-4">
          <Proceso onCreateProcess={(newProcess) => {
            const newItem: Item = {
              id: Date.now().toString(),
              name: newProcess.nombre,
              type: 'process',
              description: JSON.stringify(newProcess, null, 2),
              details: newProcess.etapas,
            };
            addItem('process', newItem);
          }} />
        </div>
      );
    } else if (activeForm === 'input') {
      return (
        <EntradaForm onAddEntrada={handleAddEntrada} />
      );
    } else if (activeForm === 'indicator') {
      return (
        <IndicadorForm onAddIndicador={handleAddIndicador} />
      );
    }
  
    return (
      <form onSubmit={(e) => { 
          e.preventDefault(); 
          addItem(activeForm!, { id: Date.now().toString(), name: newItemName, type: activeForm!, description: newItemDescription }); 
          setNewItemName(''); 
          setNewItemDescription(''); 
        }} 
        className="space-y-4"
      >
        <Input
          type="text"
          placeholder={`Nombre del ${activeForm === 'process' ? 'proceso' : activeForm === 'indicator' ? 'indicador' : 'entrada/salida'}`}
          value={newItemName} 
          onChange={(e) => setNewItemName(e.target.value)} 
        />
        <Textarea
          placeholder="Descripción"
          value={newItemDescription} 
          onChange={(e) => setNewItemDescription(e.target.value)} 
        />
        <Button type="submit">Crear {activeForm === 'process' ? 'Proceso' : activeForm === 'indicator' ? 'Indicador' : 'Entrada/Salida'}</Button>
      </form>
    )
  }

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
          <div className='flex flex-row justify-between'>
            <h3 className="text-xl font-semibold mb-2">Procesos</h3>
            <Button className="button-creation" onClick={() => { setActiveForm('process'); setShowProcessForm(true); }} size="sm">
              <Plus className="mr-2 h-4 w-4" />
            </Button>
          </div>
          {renderItems('process')}
        </div>
        <div className='col-span-1'>
          <div className='flex flex-row justify-between'>
            <h3 className="text-xl font-semibold mb-2">Indicadores</h3>
            <Button className="button-creation" onClick={() => { setActiveForm('indicator'); setShowProcessForm(false); }} size="sm">
              <Plus className="mr-2 h-4 w-4" />
            </Button>
          </div>
          {renderItems('indicator')}
        </div>
        <div className='col-span-1'>
          <div className='flex flex-row justify-between'>
            <h3 className="text-xl font-semibold mb-2">Entradas/Salidas</h3>
            <Button className="button-creation" onClick={() => { setActiveForm('input'); setShowProcessForm(false); }} size="sm">
              <Plus className="mr-2 h-4 w-4" />
            </Button>
          </div>
          {renderItems('input')}
        </div>
        <div className='col-span-1 flex w-full box-border pr-10'>  
          {renderForm()}
        </div>
      </div>
  </div>

  )
}
