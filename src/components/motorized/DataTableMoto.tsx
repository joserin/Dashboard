import React, { useState } from 'react';
import type { DeliveryData } from '../../env';

interface DataTableProps {
  data: DeliveryData[];
}

export function DataTableMoto({ data = []}: DataTableProps) {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalItems = data?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 mb-4">
      {/* Header de pestañas similar al original */}
      <header className="flex border-b border-slate-100 px-8 bg-slate-50/30">
        <h3 className="px-6 py-5 text-sm font-bold text-orange-600 border-b-2 border-orange-600">
          Detalle de Pedidos
        </h3>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Motorizado</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ruta (Zonas)</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Tarifa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentItems.map((item, index) => {
              const isEven = index % 2 !== 0;
              const rowClass = `hover:bg-orange-50/30 transition-colors group ${isEven ? 'bg-slate-50/30' : ''}`;

              // Lógica de colores para estados
              const statusContainerClass = `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                item.status === 'Completado' ? "bg-green-100 text-green-700" :
                item.status === 'Pendiente' ? "bg-blue-100 text-blue-700" :
                "bg-red-100 text-red-700"
              }`;

              const dotClass = `w-1 h-1 rounded-full ${
                item.status === 'Completado' ? "bg-green-600" :
                item.status === 'Pendiente' ? "bg-blue-600" :
                "bg-red-600"
              }`;

              return (
                <tr key={item.pedidoId || index} className={rowClass}>
                  <td className="px-8 py-4 text-sm font-medium text-slate-600">
                    {new Date(item.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-orange-600 font-mono">
                    {item.motorizadoName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                        {item.zonaOrigen}
                      </span>
                      <span className="text-slate-300 text-xs">→</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                        {item.zonaDestino}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={statusContainerClass}>
                      <span className={dotClass}></span>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                    ${item.tarifaRider.toFixed(2)}
                  </td>
                </tr>
              );
            })}
            
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center text-slate-400 italic">
                  No hay pedidos cargados en el sistema
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer de paginación (Estructura similar a DataTable de clientes) */}
      {totalPages > 1 && (
        <footer className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando <span className="text-slate-900 font-bold">{currentItems.length}</span> de <span className="text-slate-900 font-bold">{data.length}</span> entregas
          </p>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button 
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all ${
                  currentPage === pageNum 
                  ? "bg-orange-600 text-white shadow-md shadow-orange-200" 
                  : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </footer>
      )}
    </div>
    
  );
}
