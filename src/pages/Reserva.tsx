import React, { useEffect, useState } from "react";
import { Calendar, Hotel, User, Bed, ArrowRight } from "lucide-react";
import { HEADERS_API, URL } from "../constants/apiConstant";
import { useRoute } from "wouter";

// Types for our reservation data
interface Reservation {
  id: string;
  viajero: string;
  nombre_hotel: string;
  check_in: string;
  check_out: string;
  room: string;
}

// Reusable components
const InfoCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm p-4 rounded-lg">
    <Icon className="w-6 h-6 text-blue-600" />
    <div>
      <p className="text-sm font-medium text-blue-900/60">{label}</p>
      <p className="text-lg font-semibold text-blue-900">{value}</p>
    </div>
  </div>
);

const DateCard = ({
  check_in,
  check_out,
}: {
  check_in: string;
  check_out: string;
}) => (
  <div className="bg-white/50 backdrop-blur-sm p-4 rounded-lg">
    <div className="flex items-center space-x-3">
      <Calendar className="w-6 h-6 text-blue-600" />
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900/60">
          Fechas de Estancia
        </p>
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-sm text-blue-900/60">Check-in</p>
            <p className="text-lg font-semibold text-blue-900">{check_in}</p>
          </div>
          <div className="mr-10">
            <ArrowRight className="text-blue-500 w-12 h-12"></ArrowRight>
          </div>
          <div>
            <p className="text-sm text-blue-900/60">Check-out</p>
            <p className="text-lg font-semibold text-blue-900">{check_out}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export function Reserva() {
  // TODO: Extract ID from URL using React Router
  // const { id } = useParams();
  const [match, params] = useRoute("/reserva/:id");
  const [mockReservation, setMockReservation] = useState<Reservation>({
    id: params?.id || "hola",
    viajero: "",
    nombre_hotel: "",
    check_in: "",
    check_out: "",
    room: "",
  });

  useEffect(() => {
    const fetchReservation = async () => {
      if (match) {
        const response = await fetch(
          `${URL}/v1/mia/solicitud/id?id=${params.id}`,
          {
            method: "GET",
            headers: HEADERS_API,
          }
        );
        const json = await response.json();
        const data = json[0];
        const responseviajero = await fetch(
          `${URL}/v1/mia/solicitud/viajero?id=${data.id_viajero}`,
          {
            method: "GET",
            headers: HEADERS_API,
          }
        );
        const jsonviajero = await responseviajero.json();
        const dataviajero = jsonviajero[0];
        const { primer_nombre, apellido_paterno } = dataviajero;
        console.log(jsonviajero);
        console.log(data);
        setMockReservation({
          id: data.id_solicitud,
          viajero: `${primer_nombre} ${apellido_paterno}`,
          nombre_hotel: data.hotel,
          check_in: data.check_in.split("T")[0],
          check_out: data.check_out.split("T")[0],
          room: data.room,
        });
      } else {
        setMockReservation({
          id: "",
          viajero: "",
          nombre_hotel: "",
          check_in: "",
          check_out: "",
          room: "",
        });
      }
    };
    fetchReservation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-blue-900">
            Detalles de la Reservación
          </h1>
          <p className="text-blue-600 mt-2">
            Confirmación #{mockReservation.id}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-6 shadow-xl shadow-blue-100">
          <div className="grid gap-6">
            {/* Guest and Hotel Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon={User}
                label="Huésped"
                value={mockReservation.viajero}
              />
              <InfoCard
                icon={Hotel}
                label="Hotel"
                value={mockReservation.nombre_hotel}
              />
            </div>

            {/* Dates */}
            <DateCard
              check_in={mockReservation.check_in}
              check_out={mockReservation.check_out}
            />

            {/* Room Type */}
            <InfoCard
              icon={Bed}
              label="Tipo de Habitación"
              value={mockReservation.room}
            />
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">
              Para cualquier modificación en su reserva, por favor contacte
              directamente con el hotel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
