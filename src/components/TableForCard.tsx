import React, { useState } from 'react';

type Row = {
  nombre_viajero: string; // viene de solicitudes
  hotel: string; // viene de hospedajes, puede ser null
  codigo_reservacion_hotel?: string; // también de hospedajes
  fechas: string; // check_in - check_out en formato legible
  precio: number; // total redondeado
  estado: string; // alias de status

  // Datos del viajero (opcionalmente pueden venir null)
  primer_nombre?: string;
  apellido_paterno?: string;
  email?: string;
  telefono?: string;
};

type TableForCardProps = {
  card: {
    title: string;
    rows: Row[];
  };
  rowsPerPage?: number;
};

export const TableForCard: React.FC<TableForCardProps> = ({
  card,
  rowsPerPage = 5,
}) => {
  const data = card.rows || [];
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = data.slice(startIndex, startIndex + rowsPerPage);

  if (data.length === 0)
    return <p className="mt-4 text-gray-500">Sin datos disponibles.</p>;

  return (
    <div className="mt-6">
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 text-gray-600 font-semibold">
            <tr>
              <th className="px-4 py-2">Código</th>
              <th className="px-4 py-2">Hotel</th>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Fechas</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2">{row.codigo_reservacion_hotel}</td>
                <td className="px-4 py-2">{row.hotel}</td>
                <td className="px-4 py-2">{row.nombre_viajero || row.primer_nombre +" "+row.apellido_paterno}</td>
                <td className="px-4 py-2">{row.fechas}</td>
                <td className="px-4 py-2">${row.precio}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      row.estado === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : row.estado === 'pending'
                        ? 'bg-green-100 text-green-700'
                        : row.estado === 'complete'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {row.estado === "confirmed" ? "Confirmada" : row.estado === "pending" ? "Confirmada": row.estado === "complete" ? "Confirmada" : "Cancelada"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};
