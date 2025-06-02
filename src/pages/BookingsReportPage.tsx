import React, { useState, useEffect, useRef } from "react";
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
  Send,
  DownloadCloud,
  X,
  Book,
  CreditCard,
  Share2,
  Tag,
  Plus,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { useSolicitud } from "../hooks/useSolicitud";
import { Link } from "wouter";
import { useUser } from "../context/authContext";
import useApi from "../hooks/useApi";
import ShareButton from "../components/ShareButton";

import { fetchTagsAgente } from "../hooks/useFetch";
import { supabase } from "../services/supabaseClient";
import { createNewSolicitudEtiqueta } from "../hooks/useDatabase";

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
  is_booking?: boolean;
  factura: string | null;
}

interface InvoiceData {
  ContentEncoding: string;
  ContentType: string;
  ContentLength: number;
  Content: string;
}

interface BookingsReportPageProps {
  onBack: () => void;
}

const TagDropdown = ({ booking, availableTags, onAddTag, loadingTagId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState(booking.tags || []);
  const dropdownRef = useRef(null);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddTag = async (tag) => {
    try {
      await onAddTag(tag, booking.id);
      setSelectedTags(prev => [...prev, tag]);
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag.id !== tagToRemove.id));
    // Aquí llamarías a una función para remover la etiqueta del backend
    // onRemoveTag(tagToRemove);
  };

  // Filtrar etiquetas que ya están seleccionadas
  const availableTagsToAdd = availableTags.filter(
    tag => !selectedTags.some(selectedTag => selectedTag.id === tag.id)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Etiquetas seleccionadas */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white`}
              style={{ backgroundColor: tag.color }}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full bg-white opacity-75`}
              ></span>
              {tag.nombre_etiqueta}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Botón principal del dropdown */}
      {/* <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border px-3 py-2 rounded-lg text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <Tag className="w-4 h-4" />
        <span>Añadir etiqueta</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button> */}

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-48 max-h-64 overflow-y-auto">
          {availableTags.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                Etiquetas disponibles
              </div>
              {availableTags.map((tag) => (
                <button
                  key={tag.id_etiqueta}
                  disabled={loadingTagId === tag.id_etiqueta}
                  onClick={() => handleAddTag(tag)}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${loadingTagId === tag.id_etiqueta ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <span
                    className={`inline-block w-3 h-3 rounded-full`}
                    style={{ backgroundColor: tag.color }}
                  ></span>
                  <span className="flex-1">{tag.nombre_etiqueta}</span>
                  {loadingTagId === tag.id && (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  )}
                  {loadingTagId !== tag.id_etiqueta && (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No hay etiquetas disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export const BookingsReportPage: React.FC<BookingsReportPageProps> = ({
  onBack,
}) => {
  const { mandarCorreo, descargarFactura } = useApi();
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
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [availableTags, setAvailableTags] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingTagId, setLoadingTagId] = useState<string | null>(null);

  useEffect(() => {
    if (authState?.user) {
      obtenerSolicitudesWithViajero((json) => {
        setBookings([...json, ...bookings]);
      }, authState?.user?.id);
      fetchEtiquetas();
    }
  }, []);

  const fetchEtiquetas = async () => {
    const data = await fetchTagsAgente();
    console.log(data)
    setAvailableTags(data);
  }

  const handleAddTag = async (tag, id_solicitud) => {
    setLoadingTagId(tag.id_etiqueta);
    // Simular llamada a API
    try {
      const { data: user, error: userError } =
        await supabase.auth.getUser();
      if (userError) {
        throw userError;
      }
      if (!user) {
        throw new Error("No hay usuario autenticado");
      }
      const responseCompany = await createNewSolicitudEtiqueta({ id_etiqueta: tag.id_etiqueta, id_solicitud: id_solicitud });
      if (!responseCompany.success) {
        throw new Error("No se pudo registrar a la empresa");
      }
      console.log(responseCompany);
    } catch (error) {
      console.error("Error creando nueva empresa", error);
    }
    setLoadingTagId(null);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    const date = new Date(+year, +month - 1, +day);
    return date.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleSendFactura = async (id_facturama: string) => {
    try {
      const correo = prompt(
        "¿A que correo electronico deseas mandar la factura?"
      );
      await mandarCorreo(id_facturama, correo || "");
      alert("El correo fue mandado con exito");
    } catch (error) {
      alert("ha ocurrido un error");
    }
  };

  const handleDescargarFactura = async (id: string) => {
    try {
      const obj = await descargarFactura(id);
      setInvoiceData(obj);
    } catch (error) {
      alert("Ha ocurrido un error al descargar la factura");
    }
  };

  const handleDownloadPDF = () => {
    if (!invoiceData) return;

    const linkSource = `data:application/pdf;base64,${invoiceData.Content}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = "factura.pdf";
    downloadLink.click();
  };

  const getStatusColor = (status: string) => {
    return status === "completed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const filteredBookings = bookings
    .filter((booking) => {
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
    })
    .filter((item) => !!item.id_pago || !!item.id_credito);

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
      {invoiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Descargar Factura</h3>
              <button
                onClick={() => setInvoiceData(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="mb-4 text-gray-600">
              Tu factura está lista para descargar. Haz clic en el botón para
              comenzar la descarga.
            </p>
            <button
              onClick={handleDownloadPDF}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <DownloadCloud className="w-5 h-5" />
              Descargar PDF
            </button>
          </div>
        </div>
      )}

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

        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                pattern="^[^<>]*$"
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

              {showFilters && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-4 z-50">
                  <div className="space-y-4">
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

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Rango de fechas
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          pattern="^[^<>]*$"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          pattern="^[^<>]*$"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

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

        <div
          id="bookings-report"
          className="bg-white rounded-lg overflow-hidden"
        >
          {filteredBookings.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <>
                  <div key={booking.id} className="p-4 hover:bg-gray-50">
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
                              <span>
                                ID Viajero:{" "}
                                {booking.traveler_name?.toUpperCase() ||
                                  booking.traveler_id}
                              </span>
                              {booking.confirmation_code && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Código: {booking.confirmation_code}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(booking.check_in)} -{" "}
                                {formatDate(booking.check_out)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {booking.factura ? (
                          <>
                            <button
                              onClick={() => {
                                handleSendFactura(booking.factura || "");
                              }}
                              className="flex border p-2 rounded-lg border-sky-200 items-center gap-1 bg-sky-600 text-blue-50 font-semibold hover:text-blue-700"
                            >
                              <Send className="w-4 h-4" /> Enviar factura
                            </button>
                            <button
                              onClick={() => {
                                handleDescargarFactura(booking.factura || "");
                              }}
                              className="flex border p-2 rounded-lg border-sky-200 items-center gap-1 bg-sky-600 text-blue-50 font-semibold hover:text-blue-700"
                            >
                              <DownloadCloud className="w-4 h-4" /> Descargar
                              factura
                            </button>
                          </>
                        ) : (
                          <>
                            {booking.pendiente_por_cobrar <= 0 ? (
                              <Link
                                href={`/factura/${booking.id}`}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <Receipt className="w-4 h-4" /> Facturar
                              </Link>
                            ) : (
                              <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                                <CreditCard className="w-4 h-4" />
                                <span>Pagar</span>
                              </button>
                            )}
                          </>
                        )}
                        {/* {booking.is_booking && } */}

                        <Link
                          to={`/reserva/${booking.id}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <ListCollapse className="w-4 h-4" />
                          <span>Detalles</span>
                        </Link>
                        <ShareButton
                          id={booking.id}
                          title="hola"
                          description="hloa"
                        >
                          <Share2 className="w-4 h-4" /> Compartir
                        </ShareButton>

                        <TagDropdown
                          booking={booking}
                          availableTags={availableTags}
                          onAddTag={handleAddTag}
                          loadingTagId={loadingTagId}
                        />

                      </div>
                    </div>
                  </div>
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
