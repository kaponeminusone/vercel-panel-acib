import React, { useState } from 'react';

interface Entrada {
  id: number;
  nombre: string;
  tipo: 'int' | 'float';
}

interface EntradaFormProps {
  onAddEntrada: (entrada: Entrada) => void; // Función para enviar la nueva entrada al componente padre
}

const EntradaForm: React.FC<EntradaFormProps> = ({ onAddEntrada }) => {
  const [id, setId] = useState<number | ''>('');
  const [nombre, setNombre] = useState<string>('');
  const [tipo, setTipo] = useState<'int' | 'float'>('int'); // Valor por defecto es 'int'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id !== '' && nombre) {
      onAddEntrada({ id: Number(id), nombre, tipo });
      // Reiniciar campos después de enviar
      setId('');
      setNombre('');
      setTipo('int');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded-md">
      <h2 className="text-lg font-semibold mb-2">Crear Entrada</h2>
      <div className="mb-2">
        <label className="block mb-1">ID:</label>
        <input
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="ID de Entrada"
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
          placeholder="Nombre de Entrada"
          className="px-2 py-1 border rounded w-full"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Tipo:</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as 'int' | 'float')}
          className="px-2 py-1 border rounded w-full"
        >
          <option value="int">Int</option>
          <option value="float">Float</option>
        </select>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Añadir Entrada
      </button>
    </form>
  );
};

export default EntradaForm;
