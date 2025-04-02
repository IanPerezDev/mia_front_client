import React, { useState, useEffect } from "react";
import type { BookingData, PaymentMethod } from "../types";
import {
  Calendar,
  Users,
  CreditCard,
  Building2,
  ArrowRight,
  Check,
  Clock,
  Download,
  Receipt,
  CreditCard as PaymentIcon,
  BanknoteIcon,
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  Trash2,
  Plus,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import { supabase } from "../services/supabaseClient";
import { CallToBackend } from "../components/CallToBackend";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { useSolicitud } from "../hooks/useSolicitud";
import { createLogPayment, createNewPago } from "../hooks/useDatabase";
import { fetchPaymentMethods } from "../hooks/useFetch";
import { URL } from "../constants/apiConstant";

const { obtenerSolicitudes, crearSolicitud } = useSolicitud();
const API_KEY =
  "nkt-U9TdZU63UENrblg1WI9I1Ln9NcGrOyaCANcpoS2PJT3BlbkFJ1KW2NIGUYF87cuvgUF3Q976fv4fPrnWQroZf0RzXTZTA942H3AMTKFKJHV6cTi8c6dd6tybUD65fybhPJT3BlbkFJ1KW2NIGPrnWQroZf0RzXTZTA942H3AMTKFy15whckAGSSRSTDvsvfHsrtbXhdrT";
const AUTH = {
  "x-api-key": API_KEY,
};

const cardStyle = {
  style: {
    base: {
      color: "#32325d", // Color del texto
      fontSize: "16px",
      fontFamily: "Arial, sans-serif",
      "::placeholder": {
        color: "#aab7c4", // Color del placeholder
      },

      backgroundColor: "#f8f8f8", // Fondo del input
      padding: "20px",
      borderRadius: "5px",
    },
    invalid: {
      color: "#fa755a", // Color cuando hay un error
    },
  },
};

const stripePromise = loadStripe(
  "pk_test_51R1WOrQttaqZirA7uXoQzqBjIsogB3hbIMWzIimqVnmMR0ZdSGhtl9icQpUkqHhIrWDjvRj2vjV71FEHTcbZjMre005S8gHlDD"
);
const DOMAIN = "http://localhost:5173";
const getPaymentData = (bookingData: BookingData) => {
  const payment_metadata = {
    confirmation_code: bookingData.confirmationCode,
  };

  const imageToUse =
    bookingData.hotel.additionalImages?.[0] ||
    bookingData.hotel.image ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";

  const currentUrl = window.location.href;

  return {
    line_items: [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: bookingData.hotel.name,
            description: `Reservación en ${bookingData.hotel.name} - ${bookingData.room?.type === "single"
              ? "Habitación Sencilla"
              : "Habitación Doble"
              }`,
            images: [imageToUse],
          },
          unit_amount: Math.round((bookingData.room?.totalPrice || 0) * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${DOMAIN}?success=true&session={CHECKOUT_SESSION_ID}&metadata=${JSON.stringify(
      payment_metadata
    )}`,
    cancel_url: currentUrl,
  };
};

interface ReservationPanelProps {
  bookingData?: BookingData;
  onProceedToPayment?: () => void;
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return {
    weekday: date.toLocaleDateString("es-MX", { weekday: "long" }),
    day: date.getDate(),
    month: date.toLocaleDateString("es-MX", { month: "long" }),
    year: date.getFullYear(),
  };
};

const CheckOutForm = ({
  setCardPayment,
  paymentData,
  setSuccess,
  idServicio,
}: any) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    const { data } = await supabase.auth.getUser();
    const id_agente = data.user?.id;
    const cardElement = elements.getElement(CardElement)
    //crear metodo de pago
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });
    console.log("Se creo payment method");
    if (error) {
      setMessage(error.message);
    }
    else {
      const response = await fetch(`${URL}/v1/stripe/save-payment-method`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AUTH,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          id_agente: id_agente,
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(data.message || "Metodo de pago guardado");
        setSuccess(false);
      }
      else {
        setMessage("Ocurrio un error");
      }
    }
  };

  return (
    <div className="flex flex-col w-full px-4">
      <h2 className="font-semibold text-lg text-[#10244c] mb-5">
        Ingresa los detalles de tu tarjeta de credito
      </h2>
      <form onSubmit={handleSubmit}>
        <CardElement options={cardStyle} />
        <button
          type="submit"
          disabled={!stripe}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full mt-5"
        >
          <PaymentIcon className="w-4 h-4" />
          <span className="font-medium">Agregar tarjeta</span>
        </button>
        <button
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full mt-5"
          onClick={() => setSuccess(false)}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Volver</span>
        </button>
      </form>
      {message && (
        <div className="h-auto p-3 bg-red-300 border-4 mt-5 rounded-xl">
          <p className="text-base text-center">{message}</p>
        </div>
      )}
    </div>
  );
};

// const renderPaymentMethod = () => {
//   const stripe = useStripe();
//   const elements = useElements();
//   return (
//     <Elements stripe={stripePromise}>
//       <CheckoutForm />
//     </Elements>
//   )
// }

export const ReservationPanel: React.FC<ReservationPanelProps> = ({
  bookingData,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isBookingSaved, setIsBookingSaved] = useState(false);
  const [cardPayment, setCardPayment] = useState(false);
  const [successPayment, setSuccessPayment] = useState(false);
  const [idServicio, setIdServicio] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    const data = await fetchPaymentMethods();
    console.log("Payment methods data:", data);
    setPaymentMethods(data);
  };

  useEffect(() => {
    if (cardPayment) {
      fetchData();
    }
  }, [cardPayment]);

  useEffect(() => {
    // Auto-save booking when confirmation code is generated
    if (bookingData?.confirmationCode && !isBookingSaved) {
      saveBookingToDatabase();
    }
  }, [bookingData?.confirmationCode]);

  const handleDownloadPDF = () => {
    const element = document.getElementById("reservation-content");
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `reservacion-${bookingData?.confirmationCode || "borrador"
        }.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };

  const saveBookingToDatabase = async () => {
    if (!bookingData || isSaving || isBookingSaved) return;


    try {
      setIsSaving(true);
      setSaveError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Get the first image URL from additionalImages
      const imageUrl =
        bookingData.hotel.additionalImages?.[0] ||
        bookingData.hotel.image ||
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";

      const responseSolicitud = await crearSolicitud(
        {
          confirmation_code: bookingData.confirmationCode,
          hotel_name: bookingData.hotel.name,
          dates: {
            checkIn: bookingData.dates.checkIn,
            checkOut: bookingData.dates.checkOut,
          },
          room: {
            type: bookingData.room.type,
            totalPrice: bookingData.room.totalPrice,
          },
        },
        user.id
      );

      setIdServicio(responseSolicitud.data.id_servicio);

      // Save booking to database
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          confirmation_code: bookingData.confirmationCode,
          user_id: user.id,
          hotel_name: bookingData.hotel.name,
          check_in: bookingData.dates.checkIn,
          check_out: bookingData.dates.checkOut,
          room_type: bookingData.room?.type,
          total_price: bookingData.room?.totalPrice,
          status: "pending",
          image_url: imageUrl,
        })
        .select()
        .single();

      if (bookingError) {
        console.error("Error saving booking:", bookingError);
        throw bookingError;
      }

      console.log("guardado");
      setIsBookingSaved(true);
    } catch (error: any) {
      console.error("Error saving booking:", error);
      setSaveError(error.message || "Error al guardar la reservación");
    } finally {
      setIsSaving(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="h-full bg-white p-6 rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center text-[#10244c]">
          <p className="text-lg mb-2">Aún no hay detalles de la reservación</p>
          <p className="text-sm opacity-80">
            Los detalles se mostrarán aquí conforme avance la conversación
          </p>
        </div>
      </div>
    );
  }

  const hasAnyData =
    bookingData.hotel?.name ||
    bookingData.dates?.checkIn ||
    bookingData.room?.type ||
    bookingData.confirmationCode;

  if (!hasAnyData) {
    return (
      <div className="h-full bg-white p-6 rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center text-[#10244c]">
          <p className="text-lg mb-2">Aún no hay detalles de la reservación</p>
          <p className="text-sm opacity-80">
            Los detalles se mostrarán aquí conforme avance la conversación
          </p>
        </div>
      </div>
    );
  }

  const handleDeleteMethod = (id: string) => {
    console.log('Delete payment method:', id);
  };

  const handleAddMethod = () => {
    setShowAddPaymentForm(true);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setSaveError(null);

    if (!selectedMethod) return;
    const method = paymentMethods.find(m => m.id === selectedMethod);
    console.log('Processing payment with method:', method);
    const paymentData = getPaymentData(bookingData);
    try {
      const { data } = await supabase.auth.getUser();
      const id_agente = data.user?.id;
      const response = await fetch(`${URL}/v1/stripe/make-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...AUTH,
        },
        body: JSON.stringify({
          paymentMethodId: method?.id,
          id_agente: id_agente,
          amount: paymentData.line_items[0].price_data.unit_amount,
          currency: paymentData.line_items[0].price_data.currency,
        })
      })

      if (!response.ok) {
        throw new Error("Error al procesar el pago en Stripe");
      }

      const responsePayment = await response.json();
      console.log(responsePayment);
      //Se guarda el log en la base
      const responseLogPayment = await createLogPayment(
        paymentData.line_items[0].price_data.unit_amount,
        id_agente,
        responsePayment
      );
      if (!responseLogPayment.success) {
        throw new Error("No se pudo hacer log del pago");
      }

      //Se guarda el pago en la base
      const responseNewPago = await createNewPago(
        idServicio, // Reemplaza con el ID del servicio correspondiente
        paymentData.line_items[0].price_data.unit_amount,
        id_agente,
        responsePayment,
        method?.card.brand,
        method?.card.last4,
        method?.card?.funding || "xddd",
        "tarjeta"
      );
      if (!responseNewPago.success) {
        throw new Error("No se pudo guardar el pago en la base de datos");
      }

      setSuccessPayment(true);
    } catch (error) {
      console.log(error);
      setSaveError("Hubo un error al procesar el pago");
    }
    setIsProcessing(false);
  };

  const checkInDate = formatDate(bookingData.dates?.checkIn);
  const checkOutDate = formatDate(bookingData.dates?.checkOut);

  return (
    <div className="h-full bg-white p-6 rounded-lg shadow-lg space-y-10 overflow-y-auto">
      {bookingData.confirmationCode && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden shadow-lg mb-10">
          <div className="p-6">
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Check className="w-6 h-6 text-green-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-[#10244c]">
                      ¡Reservación En Proceso!
                    </h2>
                    <p className="text-[#10244c]/80">
                      Código: {bookingData.confirmationCode}
                    </p>
                  </div>
                </div>
              </div>

              {cardPayment ? (
                <>
                  {successPayment ? (
                    <>
                      <div className="w-full h-32 bg-green-300 rounded-xl border-4 border-green-500 justify-center items-center flex flex-col gap-y-2">
                        <p className="text-xl text-green-800 font-bold">
                          ¡Se realizo el pago correctamente!
                        </p>
                        <CheckCircle className="w-10 h-10 text-green-800" />
                      </div>
                      <button
                        onClick={() => window.location.reload()}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${selectedMethod
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        Volver a inicio
                      </button>
                    </>

                  ) : showAddPaymentForm ? (
                    <Elements stripe={stripePromise}>
                      <CheckOutForm
                        setCardPayment={setCardPayment}
                        paymentData={getPaymentData(bookingData)}
                        setSuccess={setShowAddPaymentForm}
                        idServicio={idServicio}
                        onCancel={() => setShowAddPaymentForm(false)}
                      />
                    </Elements>
                  ) : (
                    <div className="w-full bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-6">Metodos de pago</h3>

                      {paymentMethods.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <CreditCard className="mx-auto text-gray-400 mb-3" size={32} />
                          <p className="text-gray-500">No se han guardado metodos de pago</p>
                          <ul className="space-y-3 mb-6">
                            <li
                              onClick={handleAddMethod}
                              className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300"
                            >
                              <div className="flex items-center gap-3">
                                <Plus className="text-gray-600" size={20} />
                                <p className="font-medium text-gray-800">Agregar nuevo metodo de pago</p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      ) : (
                        <>
                          <ul className="space-y-3 mb-6">
                            {paymentMethods.map((method) => (
                              <li
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors ${selectedMethod === method.id
                                  ? 'bg-blue-50 border-2 border-blue-500'
                                  : 'bg-gray-50 hover:bg-gray-100'
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <CreditCard
                                    className={selectedMethod === method.id ? 'text-blue-600' : 'text-gray-600'}
                                    size={20}
                                  />
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {method.card.brand.toUpperCase()} •••• {method.card.last4}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Vence {method.card.exp_month}/{method.card.exp_year}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedMethod === method.id && (
                                    <CheckCircle2 className="text-blue-600" size={20} />
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMethod(method.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                    aria-label="Delete payment method"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </li>
                            ))}
                            <li
                              onClick={handleAddMethod}
                              className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300"
                            >
                              <div className="flex items-center gap-3">
                                <Plus className="text-gray-600" size={20} />
                                <p className="font-medium text-gray-800">Agregar nuevo metodo de pago</p>
                              </div>
                            </li>
                          </ul>
                          <button
                            onClick={handlePayment}
                            disabled={!selectedMethod}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${selectedMethod
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            Pagar
                          </button>
                        </>
                      )}
                      <button
                        className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-full mt-5"
                        onClick={() => setCardPayment(false)}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Cambiar forma de pago</span>
                      </button>
                    </div>
                    // <Elements stripe={stripePromise}>
                    //   <CheckOutForm
                    //     setCardPayment={setCardPayment}
                    //     paymentData={getPaymentData(bookingData)}
                    //     setSuccess={setSuccessPayment}
                    //     idServicio={idServicio}
                    //   />
                    // </Elements>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    onClick={() => setCardPayment(true)}
                  >
                    <PaymentIcon className="w-4 h-4" />
                    <span className="font-medium">Pagar por Stripe</span>
                  </button>
                  <CallToBackend
                    paymentData={getPaymentData(bookingData)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    bookingData={bookingData}
                  >
                    <BanknoteIcon className="w-4 h-4" />
                    <span className="font-medium">Pagar por Transferencia</span>
                  </CallToBackend>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#10244c] text-white rounded-xl hover:bg-[#10244c]/90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4" />
                    <span className="font-medium">Descargar</span>
                  </button>
                </div>
              )}

              {saveError && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                  {saveError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div id="reservation-content" className="space-y-8">
        {bookingData.hotel?.name && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">Hotel</h3>
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              {bookingData.hotel.image && (
                <img
                  src={bookingData.hotel.image}
                  alt={bookingData.hotel.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h4 className="font-semibold text-lg text-[#10244c]">
                  {bookingData.hotel.name}
                </h4>
                {bookingData.hotel.location && (
                  <p className="text-[#10244c]/80">
                    {bookingData.hotel.location}
                  </p>
                )}
              </div>
            </div>

            {bookingData.hotel.additionalImages &&
              bookingData.hotel.additionalImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {bookingData.hotel.additionalImages
                    .slice(0, 3)
                    .map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden shadow-sm"
                      >
                        <img
                          src={imageUrl}
                          alt={`${bookingData.hotel.name} - Vista ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                </div>
              )}
          </div>
        )}

        {(bookingData.dates?.checkIn || bookingData.dates?.checkOut) && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">
                Fechas de Estancia
              </h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[#10244c]/80 text-sm uppercase tracking-wider">
                    Check-in
                  </p>
                  {checkInDate ? (
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-[#10244c]">
                        {checkInDate.day + 1}
                      </p>
                      <div>
                        <p className="text-lg capitalize text-[#10244c]">
                          {checkInDate.month}
                        </p>
                        <p className="text-sm text-[#10244c]/80 capitalize">
                          {checkInDate.weekday}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-[#10244c]">Por definir</p>
                  )}
                </div>

                {bookingData.totalNights && (
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-6 h-6 text-[#10244c]/80" />
                    <div className="mt-2 text-center">
                      <p className="text-sm text-[#10244c]/80">Duración</p>
                      <p className="font-bold text-[#10244c]">
                        {bookingData.totalNights}{" "}
                        {bookingData.totalNights === 1 ? "noche" : "noches"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-[#10244c]/80 text-sm uppercase tracking-wider">
                    Check-out
                  </p>
                  {checkOutDate ? (
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-[#10244c]">
                        {checkOutDate.day + 1}
                      </p>
                      <div>
                        <p className="text-lg capitalize text-[#10244c]">
                          {checkOutDate.month}
                        </p>
                        <p className="text-sm text-[#10244c]/80 capitalize">
                          {checkOutDate.weekday}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-[#10244c]">Por definir</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {bookingData.room?.type && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">
                Detalles de la Habitación
              </h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#10244c]/80">
                      Tipo de Habitación
                    </p>
                    <p className="text-lg font-medium text-[#10244c]">
                      {bookingData.room.type === "single"
                        ? "Sencilla"
                        : "Doble"}
                    </p>
                  </div>
                  {bookingData.totalNights && (
                    <div>
                      <p className="text-sm text-[#10244c]/80">Duración</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-[#10244c]/80" />
                        <p className="text-lg font-medium text-[#10244c]">
                          {bookingData.totalNights}{" "}
                          {bookingData.totalNights === 1 ? "noche" : "noches"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {bookingData.room.pricePerNight && (
                    <div>
                      <p className="text-sm text-[#10244c]/80">
                        Precio por Noche
                      </p>
                      <p className="text-lg font-medium text-[#10244c]">
                        $
                        {bookingData.room.pricePerNight.toLocaleString("es-MX")}{" "}
                        MXN
                      </p>
                    </div>
                  )}
                  {bookingData.room.totalPrice && (
                    <div>
                      <p className="text-sm text-[#10244c]/80">Precio Total</p>
                      <p className="text-xl font-semibold text-[#10244c]">
                        ${bookingData.room.totalPrice.toLocaleString("es-MX")}{" "}
                        MXN
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {bookingData.guests?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">
                Huéspedes
              </h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {bookingData.guests.map((guest, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#10244c]/10 flex items-center justify-center">
                      <span className="text-[#10244c] font-medium">
                        {guest.charAt(0)}
                      </span>
                    </div>
                    <span className="text-[#10244c]/90">{guest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
      <div></div>
    </div>
  );
};
