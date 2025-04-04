import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  Mail,
  Receipt,
  Building2,
  FileText,
  DollarSign,
  Percent,
  ArrowRight,
  CheckCircle2,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "../helpers/helpers";
import { DataInvoice, ProductInvoice } from "../types/billing";
import { useRoute, Link } from "wouter";
import { HEADERS_API, URL } from "../constants/apiConstant";
import { DataFiscalModalWithCompanies } from "../components/DataFiscalModalWithCompanies";
import { CompanyWithTaxInfo } from "../types";

interface FiscalDataModalProps {
  isOpen: boolean;
}

const FiscalDataModal: React.FC<FiscalDataModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-500 w-6 h-6" />
          <h2 className="text-xl font-semibold text-gray-900">Atención</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Necesitas tener tus datos fiscales en orden, actualiza tus datos
          fiscales en tu configuración.
        </p>
        <div className="flex justify-end">
          <Link
            to="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Ir a Configuración
          </Link>
        </div>
      </div>
    </div>
  );
};

export const BillingPage: React.FC<BillingPageProps> = ({
  onBack,
  invoiceData,
}) => {
  const [match, params] = useRoute("/factura/:id");
  const [showFiscalModal, setShowFiscalModal] = useState(false);
  const [solicitud, setSolicitud] = useState(null);
  const [idCompany, setIdCompany] = useState<string | null>(null);
  const [cfdi, setCfdi] = useState({
    Receiver: {
      Name: "",
      CfdiUse: "",
      Rfc: "",
      FiscalRegime: "",
      TaxZipCode: "",
    },
    CfdiType: "",
    NameId: "",
    Observations: "",
    ExpeditionPlace: "",
    Serie: null,
    Folio: 0,
    PaymentForm: "",
    PaymentMethod: "",
    Exportation: "",
    Items: [
      {
        Quantity: "",
        ProductCode: "",
        UnitCode: "",
        Unit: "",
        Description: "",
        IdentificationNumber: "",
        UnitPrice: "",
        Subtotal: "",
        TaxObject: "",
        Taxes: [
          {
            Name: "",
            Rate: "",
            Total: "",
            Base: "",
            IsRetention: "",
            IsFederalTax: "",
          },
        ],
        Total: "",
      },
    ],
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
        const data_solicitud = json[0];
        console.log(data_solicitud);
        const responsefiscal = await fetch(
          `${URL}/v1/mia/datosFiscales/id?id=${idCompany}`,
          {
            method: "GET",
            headers: HEADERS_API,
          }
        );
        setSolicitud(data_solicitud);
        const jsonfiscal = await responsefiscal.json();
        const data_fiscal = jsonfiscal[0];
        console.log(data_fiscal);
        if (!data_fiscal.rfc || !data_fiscal.codigo_postal_fiscal) {
          setShowFiscalModal(true);
          setCfdi({
            Receiver: {
              Name: "",
              CfdiUse: "",
              Rfc: "",
              FiscalRegime: "",
              TaxZipCode: "",
            },
            CfdiType: "",
            NameId: "",
            Observations: "",
            ExpeditionPlace: "",
            Serie: null,
            Folio: 0,
            PaymentForm: "",
            PaymentMethod: "",
            Exportation: "",
            Items: [
              {
                Quantity: "",
                ProductCode: "",
                UnitCode: "",
                Unit: "",
                Description: "",
                IdentificationNumber: "",
                UnitPrice: "",
                Subtotal: "",
                TaxObject: "",
                Taxes: [
                  {
                    Name: "",
                    Rate: "",
                    Total: "",
                    Base: "",
                    IsRetention: "",
                    IsFederalTax: "",
                  },
                ],
                Total: "",
              },
            ],
          });
          return;
        }
        setCfdi({
          Receiver: {
            Name: data_fiscal.razon_social,
            CfdiUse: "G03",
            Rfc: data_fiscal.rfc,
            FiscalRegime: data_fiscal.regimen_fiscal || "601",
            TaxZipCode: data_fiscal.codigo_postal_fiscal,
          },
          CfdiType: "I",
          NameId: "1",
          ExpeditionPlace: "42501",
          Serie: null,
          Folio: Math.round(Math.random() * 999999999),
          PaymentForm: "03",
          PaymentMethod: "PUE",
          Exportation: "01",
          Observations: `${data_solicitud.hotel} de ${formatDate(
            data_solicitud.check_in
          )} - ${formatDate(data_solicitud.check_out)}`,
          Items: [
            {
              Quantity: "1",
              ProductCode: "90121500",
              UnitCode: "E48",
              Unit: "Unidad de servicio",
              Description: "Servicio de administración y Gestión de Reservas",
              IdentificationNumber: "EDL",
              UnitPrice: (data_solicitud.solicitud_total * 0.84).toFixed(2),
              Subtotal: (data_solicitud.solicitud_total * 0.84).toFixed(2),
              TaxObject: "02",
              Taxes: [
                {
                  Name: "IVA",
                  Rate: "0.16",
                  Total: (data_solicitud.solicitud_total * 0.16).toFixed(2),
                  Base: "1",
                  IsRetention: "false",
                  IsFederalTax: "true",
                },
              ],
              Total: data_solicitud.solicitud_total,
            },
          ],
        });
      }
    };
    if (idCompany) {
      fetchReservation();
    } else {
      return;
    }
  }, [idCompany]);

  const handleUpdateCompany = (idCompany: string) => {
    setIdCompany(idCompany);
  };

  useEffect(() => {
    if (!idCompany) {
      setShowFiscalModal(true);
    }
  }, []);

  const handleDownloadPDF = () => {
    // Implementar lógica de descarga de PDF
    console.log("Descargando PDF...");
  };

  const handleSendEmail = () => {
    // Implementar lógica de envío por correo
    console.log("Enviando por correo...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Volver</span>
          </button>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <BillingPageHeader
            onSendMail={handleSendEmail}
            onDonwload={handleDownloadPDF}
          />
          {/* Content */}
          <div className="p-8">
            {/* Billing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                  Datos de Facturación
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-900 font-medium">{}</p>
                  <p className="text-gray-600">RFC: {cfdi?.Receiver.Rfc}</p>
                  <p className="text-gray-600">{cfdi?.Receiver.Name}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600 mr-2" />
                  Detalles de la Reserva
                </h3>
                <div className="space-y-3">
                  <p className="text-gray-900 font-medium">
                    {solicitud?.hotel || ""}
                  </p>
                  <p className="text-gray-600">
                    {solicitud ? (
                      <>
                        {formatDate(solicitud?.check_in)} -
                        {formatDate(solicitud?.check_out)}
                      </>
                    ) : (
                      <>
                        <p> </p>
                      </>
                    )}
                  </p>
                  <p className="text-gray-600">
                    {/* Confirmación: {cfdi.booking.confirmation_code} */}
                  </p>
                </div>
              </div>
            </div>

            <BillingPageAmountDetails items={cfdi?.Items} />

            <BillingPageActions
              onClick={() => {
                // Verificar datos fiscales antes de generar la factura
                const hasFiscalData =
                  cfdi?.Receiver?.Rfc && cfdi?.Receiver?.Name;
                if (!hasFiscalData) {
                  setShowFiscalModal(true);
                  return;
                }
                // Proceder con la generación de la factura
                console.log("Generando factura...");
              }}
            />
          </div>
        </div>
      </div>

      <DataFiscalModalWithCompanies
        onClose={() => {
          setShowFiscalModal(false);
        }}
        actualizarCompany={handleUpdateCompany}
        isOpen={showFiscalModal}
      />
    </div>
  );
};

const BillingPageHeader = ({
  onSendMail,
  onDonwload,
}: {
  onSendMail: () => void;
  onDonwload: () => void;
}) => {
  return (
    <div className="p-8 bg-blue-50 border-b border-blue-100">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-6">
        <div className="flex items-center space-x-3 sm:space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Receipt className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Facturación</h2>
            <p className="text-gray-600">Detalles de la factura</p>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-3">
          <button
            onClick={onSendMail}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>Enviar por Correo</span>
          </button>

          <button
            onClick={onDonwload}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const BillingPageAmountDetails = ({
  items,
}: {
  items: ProductInvoice[] | undefined;
}) => {
  const cfdi = items ? items[0] : undefined;

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileText className="w-5 h-5 text-blue-600 mr-2" />
        Desglose
      </h3>

      <div className="space-y-4">
        <AmountDetailsSplit amount={formatCurrency(cfdi?.Subtotal || 0)}>
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Subtotal</span>
        </AmountDetailsSplit>

        <AmountDetailsSplit
          amount={formatCurrency(cfdi?.Taxes?.[0]?.Total || 0)}
        >
          <Percent className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">
            IVA ({(cfdi?.Taxes?.[0]?.Rate ?? 0) * 100}%)
          </span>
        </AmountDetailsSplit>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(cfdi?.Total || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AmountDetailsSplit = ({
  children,
  amount,
}: {
  children: React.ReactNode;
  amount: string;
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-2">{children}</div>
      <span className="text-gray-900 font-medium">{amount}</span>
    </div>
  );
};

const BillingPageActions = ({ onClick }: { onClick: () => void }) => {
  return (
    <div className="mt-8 flex justify-end">
      <button
        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        onClick={onClick}
      >
        <CheckCircle2 className="w-5 h-5" />
        <span>Confirmar y Generar Factura</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

interface BillingPageProps {
  onBack: () => void;
  invoiceData?: DataInvoice;
}
