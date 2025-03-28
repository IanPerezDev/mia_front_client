import React, { useState } from 'react';
import { Company } from '../types';
import { X } from 'lucide-react';

interface CompanyFormProps {
  onSubmit: (data: Partial<Company>) => void;
  onCancel: () => void;
  initialData?: Company;
}

export function CompanyForm({ onSubmit, onCancel, initialData }: CompanyFormProps) {
  const [tipoPersona, setTipoPersona] = useState(initialData?.tipo_persona || 'fisica');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data: Partial<Company> = {
      nombre_comercial: formData.get('nombre_comercial') as string,
      razon_social: formData.get('razon_social') as string,
      tipo_persona: formData.get('tipo_persona') as string,
      direccion: formData.get('address') as string,
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {initialData ? (tipoPersona === 'fisica' ? 'Editar Persona Física' : 'Editar Compañía') : (tipoPersona === 'fisica' ? 'Registrar Nueva Persona Física' : 'Registrar Nueva Compañía')}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {tipoPersona === 'fisica' ? 'Nombre de la Persona Física' : 'Nombre Comercial de la Empresa'}
          </label>
          <input
            type="text"
            name="nombre_comercial"
            defaultValue={initialData?.nombre_comercial}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Direccion
          </label>
          <input
            type="text"
            name="address"
            defaultValue={initialData?.direccion}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            {tipoPersona === 'fisica' ? 'Nombre de la Persona Física' : 'Razón Social'}
          </label>
          <input
            type="text"
            name="razon_social"
            defaultValue={initialData?.razon_social}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Persona
          </label>
          <select
            name="tipo_persona"
            value={tipoPersona}
            onChange={(e) => setTipoPersona(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="fisica">Física</option>
            <option value="moral">Moral</option>
          </select>
        </div>

      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          {initialData ? 'Actualizar' : 'Guardar'} {tipoPersona === 'fisica' ? 'Persona Física' : 'Compañía'}
        </button>
      </div>
    </form>
  );
}