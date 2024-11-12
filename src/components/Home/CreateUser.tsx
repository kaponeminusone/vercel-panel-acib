// src/components/CreateUser.tsx

import React, { useState, useEffect } from 'react';
import { User, Mail, Users, Hash } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../../config';
import ScheduleConfig from './ScheduleConfig';
import ProcessDateEditor from './ProcessDateEditor';

interface UserData {
  id: number;
  nombre: string;
  email: string;
  tipo: 'admin' | 'user' | 'auditor';
  password: string; // Nuevo campo para la contraseña
}

export default function CreateUser() {
  const [formData, setFormData] = useState<UserData>({
    id: 0,
    nombre: '',
    email: '',
    tipo: 'user',
    password: '', // Inicializamos password en el estado
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);

  // Función para obtener la lista de usuarios
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<UserData[]>(`${API_CONFIG.baseURL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error al obtener los usuarios:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      await axios.post<UserData>(`${API_CONFIG.baseURL}/users`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess(true);
      setFormData({ id: 0, nombre: '', email: '', tipo: 'user', password: '' });
      fetchUsers(); // Volver a cargar la lista de usuarios tras crear uno nuevo

      // Desactivar success después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000); // 3000 milisegundos = 3 segundos

    } catch (err) {
      setError('Error al crear el usuario. Por favor, intente nuevamente.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 ml-[auto] mr-[auto]">
      <div className="flex space-x-10">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-8 w-[400px]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Crear Usuario</h2>
            <p className="mt-2 text-gray-600">Ingrese los datos del nuevo usuario</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">ID de Usuario</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className="block w-[90%] pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[85%]"
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Nombre Completo</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="block w-[90%] pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[85%]"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-[90%] pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[85%]"
                  placeholder="nombre@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tipo de Usuario</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="block pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="admin">Administrador</option>
                  <option value="user">Usuario</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>
            </div>

            {/* Campo para contraseña */}
            <div>
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-[90%] pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[85%]"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            {success && (
              <div className="text-green-600 text-sm text-center">
                Usuario creado exitosamente.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>

        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Lista de Usuarios</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="pb-2 text-sm font-semibold text-gray-600">ID</th>
                <th className="pb-2 text-sm font-semibold text-gray-600">Nombre</th>
                <th className="pb-2 text-sm font-semibold text-gray-600">Email</th>
                <th className="pb-2 text-sm font-semibold text-gray-600">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2 text-sm text-gray-800">{user.id}</td>
                  <td className="py-2 text-sm text-gray-800">{user.nombre}</td>
                  <td className="py-2 text-sm text-gray-800">{user.email}</td>
                  <td className="py-2 text-sm text-gray-800 capitalize">{user.tipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Componente de configuración del horario */}
        <ScheduleConfig />
        <ProcessDateEditor/>
      </div>
    </div>
  );
}
