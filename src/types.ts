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
  tipo_persona: string;
  empresa_direccion: string | null;
  empresa_colonia: string | null;
  empresa_estado: string | null;
  empresa_municipio: string | null;
  empresa_cp: string | null;
}


export interface TaxInfo {
  id_datos_fiscales: string;
  id_empresa: string;
  rfc: string;
  calle: string;
  municipio: string;
  estado: string;
  colonia: string;
  codigo_postal_fiscal: string;
  regimen_fiscal: string;
}

export interface Employee {
  id_viajero: string;
  id_agente: string;
  primer_nombre: string;
  segundo_nombre?: string | null;
  apellido_paterno: string;
  apellido_materno?: string | null;
  correo: string;
  genero: string;
  telefono: string;
  fecha_nacimiento?: string | null;
  nacionalidad: string;
  numero_pasaporte: string;
  numero_empleado: string;
  empresas: {
    id_empresa: string;
    razon_social: string;
  }[];
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

export interface CompanyWithTaxInfo {
  id_empresa: string;
  razon_social: string;
  nombre_comercial: string;
  empresa_direccion: string; // Asegurar que haya dirección
  empresa_municipio: string;
  empresa_estado: string;
  empresa_cp: string;
  empresa_colonia: string;
  tipo_persona: string;
  taxInfo?: TaxInfo | null;
}

export interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export type PolicyType = 'budget' | 'schedule' | 'benefits' | 'other';
export type PolicyStatus = 'active' | 'inactive' | 'draft' | 'expired';
export type FormMode = 'create' | 'edit';