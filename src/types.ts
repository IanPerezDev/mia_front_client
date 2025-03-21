export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  isLoading?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  promptCount: number;
}

export interface BookingData {
  confirmationCode: string | null;
  hotel: {
    name: string | null;
    location: string | null;
    image: string | null;
    additionalImages?: string[];
  };
  dates: {
    checkIn: string | null;
    checkOut: string | null;
  };
  room: {
    type: 'single' | 'double' | null;
    pricePerNight: number | null;
    totalPrice: number | null;
  };
  guests: string[];
  totalNights: number | null;
}

export interface WebhookResponse {
  output: string | null;
  type: string | null;
  data: {
    bookingData: BookingData;
  };
}

export interface Company {
  id_empresa: string;
  razon_social: string;
  nombre_comercial: string;
  direccion: string;
  tipo_persona:string;
}

export interface TaxInfo {
  id_datos_fiscales: string;
  id_empresa: string;
  rfc: string;
  calle: string;
  municipio: string;
  estado: string;
  colonia:string;
  codigo_postal_fiscal: string;
  regimen_fiscal: string;
}

export interface Employee {
  id_viajero: string;
  id_empresa: string;
  primer_nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  correo: string;
  telefono: string;
  segundo_nombre: string;
  razon_social: string;
  genero: string;
  fecha_nacimiento: string;
}

export interface Assignment {
  id: string;
  companyId: string;
  employeeId: string;
  startDate: string;
  role: 'admin' | 'user' | 'manager';
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  employeeIds: string[];
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  value?: number;
  startDate: string;
  endDate: string;
  departments: string[];
  employeeIds: string[];
  empresasIds: string[];
  status: PolicyStatus;
}

export type PolicyType = 'budget' | 'schedule' | 'benefits' | 'other';
export type PolicyStatus = 'active' | 'inactive' | 'draft' | 'expired';
export type FormMode = 'create' | 'edit';