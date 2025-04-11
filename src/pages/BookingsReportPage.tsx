import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Hotel,
  Search,
  Download,
  MessageSquare,
  Filter,
  Receipt,
  ListCollapse,
  User,
  ChevronDown,
  Book,
  CreditCard,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { useSolicitud } from "../hooks/useSolicitud";
import { Link } from "wouter";
import { useUser } from "../context/authContext";

interface Booking {
  id: string;
  confirmation_code: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  room_type: string;
  total_price: number;
  status: string;
  created_at: string;
  image_url?: string;
  traveler_name?: string;
  traveler_id?: string;
  payment_method?: string;
  booking_stage?: string;
  id_pago: string;
  pendiente_por_cobrar: number;
}

interface BookingsReportPageProps {
  onBack: () => void;
}

export const BookingsReportPage: React.FC<BookingsReportPageProps> = ({
  onBack,
}) => {
  const { obtenerSolicitudesWithViajero } = useSolicitud();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"hotel" | "traveler" | "date">(
    "hotel"
  );
  const [showFilters, setShowFilters] = useState(false);
  const { authState } = useUser();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");

  useEffect(() => {
    if (authState?.user) {
      obtenerSolicitudesWithViajero((json) => {
        setBookings([...json, ...bookings]);
      }, authState?.user?.id);
    }
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    return status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const filteredBookings = bookings.filter((booking) => {
    const searchLower = searchTerm.toLowerCase();
    let matches = true;

    switch (filterType) {
      case "hotel":
        matches =
          matches && booking.hotel_name.toLowerCase().includes(searchLower);
        break;
      case "traveler":
        matches =
          matches &&
          (booking.traveler_name?.toLowerCase().includes(searchLower) ||
            false ||
            booking.traveler_id?.toLowerCase().includes(searchLower) ||
            false);
        break;
      case "date":
        matches =
          matches &&
          (booking.check_in.includes(searchLower) ||
            booking.check_out.includes(searchLower));
        break;
    }

    if (selectedPaymentMethod !== "all") {
      matches = matches && booking.payment_method === selectedPaymentMethod;
    }

    if (selectedStage !== "all") {
      matches = matches && booking.booking_stage === selectedStage;
    }

    if (startDate && endDate) {
      const bookingDate = new Date(booking.check_in);
      const start = new Date(startDate);
      const end = new Date(endDate);
      matches = matches && bookingDate >= start && bookingDate <= end;
    }

    return matches;
  });

  const downloadReport = () => {
    const element = document.getElementById("bookings-report");
    if (!element) return;

    const opt = {
      margin: 1,
      filename: "reporte-reservas.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-[#4c93f8] pt-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Descargar Reporte</span>
          </button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Buscar por ${filterType === "hotel"
                  ? "nombre de hotel"
                  : filterType === "traveler"
                    ? "nombre o ID de viajero"
                    : "fecha"
                  }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 pl-10"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* Botón de filtros */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Panel de filtros */}
              {showFilters && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-4 z-50">
                  <div className="space-y-4">
                    {/* Tipo de búsqueda */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Buscar por
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setFilterType("hotel")}
                          className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${filterType === "hotel"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100"
                            }`}
                        >
                          <Hotel className="w-4 h-4" />
                          <span>Hotel</span>
                        </button>
                        <button
                          onClick={() => setFilterType("traveler")}
                          className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${filterType === "traveler"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100"
                            }`}
                        >
                          <User className="w-4 h-4" />
                          <span>Viajero</span>
                        </button>
                      </div>
                    </div>

                    {/* Rango de fechas */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Rango de fechas
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    {/* Método de pago */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Método de pago
                      </label>
                      <select
                        value={selectedPaymentMethod}
                        onChange={(e) =>
                          setSelectedPaymentMethod(e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">Todos</option>
                        <option value="credit_card">Tarjeta de crédito</option>
                        <option value="debit_card">Tarjeta de débito</option>
                        <option value="cash">Efectivo</option>
                      </select>
                    </div>

                    {/* Etapa de reservación */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Etapa
                      </label>
                      <select
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">Todas</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="completed">Completada</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Reservaciones */}
        <div
          id="bookings-report"
          className="bg-white rounded-lg overflow-hidden"
        >
          {filteredBookings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <>
                  {booking.pendiente_por_cobrar == 0 && booking.id_pago != null &&
                    (<div key={booking.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <img
                                src={
                                  booking.image_url ||
                                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                                }
                                alt={booking.hotel_name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">
                                {booking.hotel_name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>Código: {booking.confirmation_code}</span>
                                {booking.traveler_id && (
                                  <>
                                    <span>•</span>
                                    <span>ID Viajero: {booking.traveler_id}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(booking.check_in)} -{" "}
                                  {formatDate(booking.check_out)}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                    booking.status
                                  )}`}
                                >
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {booking.pendiente_por_cobrar == 0 && booking.id_pago != null ? (<Link
                            to={`/factura/${booking.id}`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            <Receipt className="w-4 h-4" />
                            <span>Facturar</span>
                          </Link>)
                            : (
                              <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                                <CreditCard className="w-4 h-4" />
                                <span>Pagar</span>
                              </button>
                            )}
                          <Link
                            to={`/reserva/${booking.id}`}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            <ListCollapse className="w-4 h-4" />
                            <span>Detalles</span>
                          </Link>
                        </div>
                      </div>
                    </div>)
                  }
                </>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron reservaciones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingsReportPage;
