import React, { useState } from 'react';
import Etapa from './Etapa'; // Asegúrate de que la ruta sea correcta
import { Plus } from 'lucide-react';

interface ProcesoProps {
  onCreateProcess: (newProcess: { nombre: string; etapas: any[] }) => void;
}

const Proceso: React.FC<ProcesoProps> = ({ onCreateProcess }) => {
  const [etapas, setEtapas] = useState<any[]>([]);
  const [nombreProceso, setNombreProceso] = useState<string>(''); // Estado para el nombre del proceso

  const addEtapa = () => {
    const newEtapa = {
      num_etapa: etapas.length + 1,
      entradas: [],
      indicadores: [],
      salidas: [],
    };
    setEtapas([...etapas, newEtapa]);
  };

  const removeEtapa = (index: number) => {
    setEtapas(etapas.filter((_, i) => i !== index));
  };

  const getEtapaData = (data: any) => {
    const updatedEtapas = [...etapas];
    updatedEtapas[data.num_etapa - 1] = data; // Actualiza los datos de la etapa
    setEtapas(updatedEtapas);
  };

  const handleCreateProcess = () => {
    const processData = {
      nombre: nombreProceso, // Usa el nombre del proceso ingresado
      etapas,
    };

    onCreateProcess(processData); // Envía los datos del nuevo proceso al componente padre
    // Reiniciar el formulario después de crear el proceso
    setNombreProceso('');
    setEtapas([]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Formulario de Proceso</h1>
      <input
        type="text"
        value={nombreProceso}
        onChange={(e) => setNombreProceso(e.target.value)}
        placeholder="Nombre del Proceso"
        className="mb-4 px-2 py-1 border rounded"
      />
      <button type="button" onClick={addEtapa} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
        <Plus className="inline-block mr-1" /> Añadir Etapa
      </button>
      {etapas.map((etapa, index) => (
        <Etapa 
          key={index} 
          numEtapa={etapa.num_etapa} 
          onRemove={() => removeEtapa(index)} 
          onDataChange={getEtapaData} // Pasar función para actualizar datos
        />
      ))}
      {etapas.length > 0 && (
        <button onClick={handleCreateProcess} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
          Crear Proceso
        </button>
      )}
    </div>
  );
};

export default Proceso;
