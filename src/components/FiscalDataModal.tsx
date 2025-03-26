import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CompanyWithTaxInfo, TaxInfo } from '../types';
import { createNewDatosFiscales } from '../hooks/useDatabase';
import { supabase } from '../services/supabaseClient';
import { URL } from '../constants/apiConstant';

interface FiscalDataModalProps {
  company: CompanyWithTaxInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyId: string, fiscalData: TaxInfo) => void;
}

const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
const AUTH = {
  "x-api-key": API_KEY,
};

export function FiscalDataModal({ company, isOpen, onClose, onSave }: FiscalDataModalProps) {

  const [isEditing, setIsEditing] = useState(!company.taxInfo);
  const [formData, setFormData] = useState<TaxInfo>(
    company.taxInfo || {
      id_datos_fiscales: '',
      id_empresa: company.id_empresa,
      rfc: '',
      calle: '',
      colonia: '',
      municipio: '',
      estado: '',
      codigo_postal_fiscal: '',
      regimen_fiscal: ''
    }
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(
        company.taxInfo || {
          id_datos_fiscales: '',
          id_empresa: company.id_empresa,
          rfc: '',
          calle: '',
          colonia: '',
          municipio: '',
          estado: '',
          codigo_postal_fiscal: '',
          regimen_fiscal: ''
        }
      );
      setIsEditing(!company.taxInfo);
      setError('');
    }
  }, [isOpen, company]);

  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.codigo_postal_fiscal.length > 4) {
      fetch(`${URL}/v1/sepoMex/buscar-codigo-postal?d_codigo=${formData.codigo_postal_fiscal}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...AUTH,
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setFormData(prev => ({
              ...prev,
              colonia: data.data.d_asenta,
              municipio: data.data.D_mnpio,
              estado: data.data.d_estado,
            }));
          }
        })
        .catch((error) => console.error("Error obteniendo datos de código postal:", error));
    }
  }, [formData.codigo_postal_fiscal]);

  if (!isOpen) return null;

  const validateRFC = (rfc: string) => {
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcRegex.test(rfc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
  
      if (!validateRFC(formData.rfc)) {
        setError("El formato del RFC no es válido");
        return;
      }
  
      const responseCompany = await createNewDatosFiscales(formData);
      if (!responseCompany.success) {
        throw new Error("No se pudo registrar los datos fiscales");
      }
  
      console.log("Datos fiscales guardados:", responseCompany);
      //onSave(company.id_empresa, formData);
      setIsEditing(false);
      setError("");
    } catch (error) {
      console.error("Error creando nuevos datos fiscales", error);
      setError("Hubo un error al guardar los datos fiscales. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            Datos Fiscales de {company.razon_social}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RFC</label>
                <input
                  type="text"
                  value={formData.rfc}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                  className="w-full p-2 border rounded-md"
                  required
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                <input
                  type="text"
                  value={formData.codigo_postal_fiscal}
                  onChange={(e) => setFormData({ ...formData, codigo_postal_fiscal: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
                <input
                  type="text"
                  value={formData.calle}
                  onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colonia</label>
                <input
                  type="text"
                  value={formData.colonia}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                <input
                  type="text"
                  value={formData.municipio}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input
                  type="text"
                  value={formData.estado}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-4 mt-6">
                <button

                  type="button"
                  onClick={() => {
                    setFormData(company.taxInfo || {
                      id_datos_fiscales: '',
                      id_empresa: company.id_empresa,
                      rfc: '',
                      calle: '',
                      colonia: '',
                      municipio: '',
                      estado: '',
                      codigo_postal_fiscal: '',
                      regimen_fiscal: ''
                    });
                    setIsEditing(false);
                    setError('');
                  }}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-medium text-gray-700">{key.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="mt-1">{value || 'N/A'}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Editar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
