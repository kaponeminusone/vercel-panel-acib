import React, { useState } from 'react';

interface Indicador {
  id: number;
  nombre: string;
  tipo: 'range' | 'criteria' | 'checkbox';
}

interface IndicadorFormProps {
  onAddIndicador: (indicador: Indicador) => void; // Función para enviar el nuevo indicador al componente padre
}

const IndicadorForm: React.FC<IndicadorFormProps> = ({ onAddIndicador }) => {
  const [id, setId] = useState<number | ''>('');
  const [nombre, setNombre] = useState<string>('');
  const [tipo, setTipo] = useState<'range' | 'criteria' | 'checkbox'>('range'); // Valor por defecto es 'range'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id !== '' && nombre) {
      onAddIndicador({ id: Number(id), nombre, tipo });
      // Reiniciar campos después de enviar
      setId('');
      setNombre('');
      setTipo('range');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-2">Crear Indicador</h2>
      <div className="mb-2">
        <label className="block mb-1">ID:</label>
        <input
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="ID de Indicador"
          className="px-2 py-1 border rounded w-full"
          required
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de Indicador"
          className="px-2 py-1 border rounded w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Tipo:</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as 'range' | 'criteria' | 'checkbox')}
          className="px-2 py-1 border rounded w-full"
        >
          <option value="range">Range</option>
          <option value="criteria">Criteria</option>
          <option value="checkbox">Checkbox</option>
        </select>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Añadir Indicador
      </button>
    </form>
  );
};

export default IndicadorForm;
