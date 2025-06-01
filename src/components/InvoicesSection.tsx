import React from "react";
import { Invoice } from "../types";
//import { formatCurrency } from "../utils/formatters";
import EmptyState from "./EmptyState";
import { FileText, Download } from "lucide-react";

interface InvoicesSectionProps {
  invoices: any;
}

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split("T")[0].split("-");
  const date = new Date(+year, +month - 1, +day);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Format a date string to include time
 */
const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    return "Invalid date";
  }
};

/**
 * Format a currency value with proper symbols
 */
const formatCurrency = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch (error) {
    return `${amount} ${currency}`;
  }
};

const InvoicesSection: React.FC<InvoicesSectionProps> = ({ invoices }) => {
  if (!invoices || invoices.length === 0) {
    return <EmptyState message="No hay facturas disponibles" />;
  }
  console.log(invoices)

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Folio
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Fecha generado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Monto
              </th>
              {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id_factura} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-gray-400" />
                    {invoice.id_facturama}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatDateTime(invoice.fecha_emision)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatCurrency(invoice.monto_factura, "mxn")}
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatCurrency(invoice.amount)}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicesSection;
