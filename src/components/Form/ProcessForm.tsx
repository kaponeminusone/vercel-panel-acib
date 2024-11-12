import React, { useState } from 'react';
import Etapa from './Etapa';
import { Plus } from 'lucide-react';

interface ProcesoProps {
  onCreateProcess: (newProcess: { nombre: string; etapas: any[] }) => void;
}

const Proceso: React.FC<ProcesoProps> = ({ onCreateProcess }) => {
  const [etapas, setEtapas] = useState<any[]>([]);
  const [nombreProceso, setNombreProceso] = useState<string>('');

  const addEtapa = () => {
    const newEtapa = {
      num_etapa: etapas.length + 1,
      entradas: [],
      indicadores: [],
      salidas: [],
    };
    setEtapas((prev) => [...prev, newEtapa]);
  };

  const removeEtapa = (index: number) => {
    setEtapas((prev) => prev.filter((_, i) => i !== index));
  };

  const getEtapaData = (data: any) => {
    setEtapas((prev) => {
      const updatedEtapas = [...prev];
      updatedEtapas[data.num_etapa - 1] = data;
      return updatedEtapas;
    });
  };

  const handleCreateProcess = () => {
    const processData = {
      nombre: nombreProceso,
      etapas,
    };
    onCreateProcess(processData);
    setNombreProceso('');
    setEtapas([]);
  };

  return (
    <div className="p-4 space-y-4 bg-white shadow rounded-lg max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-2 text-gray-800">Formulario de Proceso</h1>
      <input
        type="text"
        value={nombreProceso}
        onChange={(e) => setNombreProceso(e.target.value)}
        placeholder="Nombre del Proceso"
        className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={addEtapa}
        className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
      >
        <Plus className="h-4 w-4 mr-1" /> Añadir Etapa
      </button>
      <div className="space-y-3">
        {etapas.map((etapa, index) => (
          <Etapa
            key={index}
            numEtapa={etapa.num_etapa}
            onRemove={() => removeEtapa(index)}
            onDataChange={getEtapaData}
          />
        ))}
      </div>
      {etapas.length > 0 && (
        <button
          onClick={handleCreateProcess}
          className="w-full py-2 mt-4 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
        >
          Crear Proceso
        </button>
      )}
    </div>
  );
};

export default Proceso;