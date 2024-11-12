import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Item {
  id: number;
  [key: string]: any;
}

interface EtapaProps {
  numEtapa: number;
  onRemove: () => void;
  onDataChange: (data: any) => void;
}

export default function Etapa({ numEtapa, onRemove, onDataChange }: EtapaProps) {
  const [items, setItems] = useState<{ [key: string]: Item[] }>({
    entradas: [],
    indicadores: [],
    salidas: [],
  });
  const [newItem, setNewItem] = useState<{ [key: string]: string }>({
    entradas: '',
    indicadores: '',
    indicadoresEntrada: '',
    salidas: '',
  });

  const handleAddItem = (type: string) => {
    if (newItem[type] !== '') {
      const id = Number(newItem[type]);
      let newItemObj: Item = { id };

      if (type === 'indicadores' && newItem.indicadoresEntrada !== '') {
        newItemObj.entrada_id = Number(newItem.indicadoresEntrada);
      }

      setItems((prev) => ({
        ...prev,
        [type]: [...prev[type], newItemObj],
      }));
      setNewItem((prev) => ({ ...prev, [type]: '', indicadoresEntrada: '' }));
    }
  };

  const handleRemoveItem = (type: string, id: number) => {
    setItems((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.id !== id),
    }));
  };

  useEffect(() => {
    onDataChange({
      num_etapa: numEtapa,
      ...items,
    });
  }, [items, numEtapa]); // Esto evita el ciclo infinito, limitando la ejecución solo cuando cambia 'items' o 'numEtapa'

  const renderTable = (type: string) => (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="text-left font-medium">ID</th>
          {type === 'indicadores' && <th className="text-left font-medium">Entrada ID</th>}
          <th className="text-right">Acción</th>
        </tr>
      </thead>
      <tbody>
        {items[type].map((item) => (
          <tr key={item.id} className="border-t">
            <td>{item.id}</td>
            {type === 'indicadores' && <td>{item.entrada_id}</td>}
            <td className="text-right">
              <button
                onClick={() => handleRemoveItem(type, item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">Etapa {numEtapa}</h3>
        <button onClick={onRemove} className="text-red-500 hover:text-red-700 focus:outline-none">
          Eliminar Etapa
        </button>
      </div>
      {['entradas', 'indicadores', 'salidas'].map((type) => (
        <div key={type} className="space-y-2">
          <h4 className="text-sm font-medium capitalize text-gray-700">{type}</h4>
          {renderTable(type)}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={newItem[type]}
              onChange={(e) => setNewItem((prev) => ({ ...prev, [type]: e.target.value }))}
              placeholder={`ID de ${type.slice(0, -1)}`}
              className="flex-grow px-2 py-1 text-sm border rounded focus:outline-none focus:ring focus:ring-blue-500"
            />
            {type === 'indicadores' && (
              <input
                type="number"
                value={newItem.indicadoresEntrada}
                onChange={(e) => setNewItem((prev) => ({ ...prev, indicadoresEntrada: e.target.value }))}
                placeholder="ID de Entrada"
                className="flex-grow px-2 py-1 text-sm border rounded focus:outline-none focus:ring focus:ring-blue-500"
              />
            )}
            <button
              onClick={() => handleAddItem(type)}
              className="flex items-center justify-center p-1 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}