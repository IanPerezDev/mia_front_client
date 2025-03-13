import React, { useEffect, useState } from 'react';
import { Company, Employee, Assignment, FormMode, Tag, Policy } from '../types';
import { CompanyForm } from '../components/CompanyForm';
import { EmployeeForm } from '../components/EmployeeForm';
import { AssignmentForm } from '../components/AssignmentForm';
import { TagForm } from '../components/TagForm';
import { PolicyForm } from '../components/PolicyForm';
import {
  Building2,
  Users,
  Link,
  Search,
  Plus,
  Pencil,
  Trash2,
  Tags,
  BookOpen,
} from 'lucide-react';
import { getCompaniesAgent } from '../hooks/useDatabase';
import { supabase } from '../services/supabaseClient';


export const Configuration = () => {
  const [activeTab, setActiveTab] = useState<'companies' | 'employees' | 'assignments' | 'tags' | 'policies' | 'notifications'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (activeTab === "companies") {
      fetchCompaniesAgent();
    }
  }, [activeTab])


  const fetchCompaniesAgent = async () => {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
      const companiesData = await getCompaniesAgent(user.user.id);
      setCompanies(companiesData.data || [] );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }
  // List of departments (could be moved to a separate configuration)
  const departments = [
    'Ingenieria',
    'Marketing',
    'Ventas',
    'Recursos Humanos',
    'Finanzas',
    'Operaciones',
  ];

  const handleSearch = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const handleDelete = (type: 'company' | 'employee' | 'assignment' | 'tag' | 'policy', id: string) => {
    if (!confirm('Estas seguro que quieres eliminarlo?')) return;

    switch (type) {
      case 'company':
        setCompanies(companies.filter((c) => c.id !== id));
        setAssignments(assignments.filter((a) => a.companyId !== id));
        break;
      case 'employee':
        setEmployees(employees.filter((e) => e.id !== id));
        setAssignments(assignments.filter((a) => a.employeeId !== id));
        setPolicies(policies.map(p => ({
          ...p,
          employeeIds: p.employeeIds.filter(eId => eId !== id)
        })));
        break;
      case 'assignment':
        setAssignments(assignments.filter((a) => a.id !== id));
        break;
      case 'tag':
        setTags(tags.filter((t) => t.id !== id));
        setEmployees(employees.map(e => ({
          ...e,
          tagIds: e.tagIds.filter(tId => tId !== id)
        })));
        break;
      case 'policy':
        setPolicies(policies.filter((p) => p.id !== id));
        break;
    }
  };

  const handleSubmit = (type: 'company' | 'employee' | 'assignment' | 'tag' | 'policy', data: any) => {
    const id = formMode === 'create' ? crypto.randomUUID() : selectedItem.id;
    const newData = { ...data, id };

    switch (type) {
      case 'company':
        if (formMode === 'create') {
          setCompanies([...companies, newData]);
        } else {
          setCompanies(companies.map((c) => (c.id === id ? newData : c)));
        }
        break;
      case 'employee':
        if (formMode === 'create') {
          setEmployees([...employees, newData]);
        } else {
          setEmployees(employees.map((e) => (e.id === id ? newData : e)));
        }
        break;
      case 'assignment':
        if (formMode === 'create') {
          setAssignments([...assignments, newData]);
        } else {
          setAssignments(assignments.map((a) => (a.id === id ? newData : a)));
        }
        break;
      case 'tag':
        if (formMode === 'create') {
          setTags([...tags, newData]);
        } else {
          setTags(tags.map((t) => (t.id === id ? newData : t)));
        }
        break;
      case 'policy':
        if (formMode === 'create') {
          setPolicies([...policies, newData]);
        } else {
          setPolicies(policies.map((p) => (p.id === id ? newData : p)));
        }
        break;
    }

    setShowForm(false);
    setSelectedItem(null);
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'companies':
        return (
          <CompanyForm
            onSubmit={(data) => handleSubmit('company', data)}
            onCancel={() => setShowForm(false)}
            initialData={selectedItem}
          />
        );
      case 'employees':
        return (
          <EmployeeForm
            onSubmit={(data) => handleSubmit('employee', data)}
            onCancel={() => setShowForm(false)}
            tags={tags}
            departments={departments}
            initialData={selectedItem}
            empresas={companies}
          />
        );
      case 'assignments':
        return (
          <AssignmentForm
            companies={companies}
            employees={employees}
            onSubmit={(data) => handleSubmit('assignment', data)}
            onCancel={() => setShowForm(false)}
            initialData={selectedItem}
          />
        );
      case 'tags':
        return (
          <TagForm
            onSubmit={(data) => handleSubmit('tag', data)}
            onCancel={() => setShowForm(false)}
            initialData={selectedItem}
            employees={employees}
          />
        );
      case 'policies':
        return (
          <PolicyForm
            onSubmit={(data) => handleSubmit('policy', data)}
            onCancel={() => setShowForm(false)}
            departments={departments}
            employees={employees}
            initialData={selectedItem}
            empresas={companies}
          />
        );
    }
  };

  const renderTags = (tagIds: string[]) => {
    return (
      <div className="flex flex-wrap gap-2">
        {tagIds.map((tagId) => {
          const tag = tags.find((t) => t.id === tagId);
          if (!tag) return null;
          return (
            <span
              key={tag.id}
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                border: `1px solid ${tag.color}`,
              }}
            >
              {tag.name}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configuración de la cuenta</h1>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap">
              <button
                onClick={() => setActiveTab('companies')}
                className={`${activeTab === 'companies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <Building2 className="mr-2 h-5 w-5" />
                Compañias
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`${activeTab === 'employees'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <Users className="mr-2 h-5 w-5" />
                Viajeros
              </button>
              {/* <button
                onClick={() => setActiveTab('assignments')}
                className={`${
                  activeTab === 'assignments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <Link className="mr-2 h-5 w-5" />
                Assignments
              </button> */}
              <button
                onClick={() => setActiveTab('tags')}
                className={`${activeTab === 'tags'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <Tags className="mr-2 h-5 w-5" />
                Etiquetas
              </button>
              <button
                onClick={() => setActiveTab('policies')}
                className={`${activeTab === 'policies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Politicas
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`${activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center w-1/5 py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Notificaciones
              </button>
            </nav>
          </div>

          <div className="p-6">
            {showForm ? (
              renderForm()
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setFormMode('create');
                      setSelectedItem(null);
                      setShowForm(true);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Añadir nueva
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        {activeTab === 'companies' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre de la empresa
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dirección
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo de persona
                            </th>
                          </>
                        )}
                        {activeTab === 'employees' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Empleado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Posición
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Etiquetas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contacto
                            </th>
                          </>
                        )}
                        {activeTab === 'assignments' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Compañia
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Empleado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rol
                            </th>
                          </>
                        )}
                        {activeTab === 'tags' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre de la etiqueta
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Descripción
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Usada por
                            </th>
                          </>
                        )}
                        {activeTab === 'policies' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre de politica
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estatus
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Validez
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeTab === 'companies' &&
                        handleSearch(companies).map((company) => (
                          <tr key={company.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {company.logo ? (
                                  <img
                                    src={company.logo}
                                    alt={company.nombre_comercial}
                                    className="h-10 w-10 rounded-full mr-3"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                    <Building2 className="h-6 w-6 text-gray-500" />
                                  </div>
                                )}
                                <div className="text-sm font-medium text-gray-900">
                                  {company.nombre_comercial}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {company.direccion}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {company.tipo_persona}
                              <br />
                              {company.phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setFormMode('edit');
                                  setSelectedItem(company);
                                  setShowForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete('company', company.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {activeTab === 'employees' &&
                        handleSearch(employees).map((employee) => (
                          <tr key={employee.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {employee.photo ? (
                                  <img
                                    src={employee.photo}
                                    alt={employee.fullName}
                                    className="h-10 w-10 rounded-full mr-3"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                    <Users className="h-6 w-6 text-gray-500" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {employee.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {employee.documentId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{employee.position}</div>
                              <div className="text-sm text-gray-500">{employee.department}</div>
                            </td>
                            <td className="px-6 py-4">
                              {renderTags(employee.tagIds || [])}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {employee.email}
                              <br />
                              {employee.phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setFormMode('edit');
                                  setSelectedItem(employee);
                                  setShowForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete('employee', employee.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      {activeTab === 'assignments' &&
                        handleSearch(assignments).map((assignment) => {
                          const company = companies.find((c) => c.id === assignment.companyId);
                          const employee = employees.find((e) => e.id === assignment.employeeId);
                          return (
                            <tr key={assignment.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {company?.logo ? (
                                    <img
                                      src={company.logo}
                                      alt={company.name}
                                      className="h-10 w-10 rounded-full mr-3"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                      <Building2 className="h-6 w-6 text-gray-500" />
                                    </div>
                                  )}
                                  <div className="text-sm font-medium text-gray-900">
                                    {company?.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {employee?.photo ? (
                                    <img
                                      src={employee.photo}
                                      alt={employee.fullName}
                                      className="h-10 w-10 rounded-full mr-3"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                      <Users className="h-6 w-6 text-gray-500" />
                                    </div>
                                  )}
                                  <div className="text-sm font-medium text-gray-900">
                                    {employee?.fullName}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assignment.role === 'admin'
                                  ? 'bg-red-100 text-red-800'
                                  : assignment.role === 'manager'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                  }`}>
                                  {assignment.role.charAt(0).toUpperCase() + assignment.role.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setFormMode('edit');
                                    setSelectedItem(assignment);
                                    setShowForm(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete('assignment', assignment.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {activeTab === 'tags' &&
                        handleSearch(tags).map((tag) => {
                          const taggedEmployees = employees.filter((e) => e.tagIds?.includes(tag.id));
                          return (
                            <tr key={tag.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div
                                    className="h-6 w-6 rounded mr-2"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  <div className="text-sm font-medium text-gray-900">
                                    {tag.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {tag.description || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {taggedEmployees.length} employees
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    setFormMode('edit');
                                    setSelectedItem(tag);
                                    setShowForm(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete('tag', tag.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {activeTab === 'policies' &&
                        handleSearch(policies).map((policy) => (
                          <tr key={policy.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {policy.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {policy.description.length > 50
                                  ? policy.description.substring(0, 50) + '...'
                                  : policy.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${policy.type === 'budget'
                                ? 'bg-green-100 text-green-800'
                                : policy.type === 'schedule'
                                  ? 'bg-blue-100 text-blue-800'
                                  : policy.type === 'benefits'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                {policy.type.charAt(0).toUpperCase() + policy.type.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${policy.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : policy.status === 'inactive'
                                  ? 'bg-gray-100 text-gray-800'
                                  : policy.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(policy.startDate).toLocaleDateString()} -
                              <br />
                              {new Date(policy.endDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setFormMode('edit');
                                  setSelectedItem(policy);
                                  setShowForm(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <Pencil className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete('policy', policy.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}