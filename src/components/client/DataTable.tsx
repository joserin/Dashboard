import React, { useState } from 'react';
import type { DeliveryData } from '../../env';


interface DataTableProps {
  data: DeliveryData[];
}

export const DataTable: React.FC<DataTableProps> = ({ data = [] }) => {
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
    <div className="bg-surface-container-lowest rounded-xl cloud-shadow overflow-hidden mb-2 overflow-x-auto">
        <header className="px-4 py-2 flex justify-between items-center">
            <h4 className="text-xl font-bold text-on-surface">Detalle de Facturación</h4>
            <div className="flex gap-3">
                <button className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
                    
                    Filtros
                </button>
                <button className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
                    
                    Exportar CSV
                </button>
            </div>
        </header>

        <section className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-surface-container-low">
                        <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Pedido ID</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Cliente/Detalle</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Estado</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Fecha</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Monto</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {currentItems.map((item, idx) => {
                        // Lógica de clases manual sin la función 'cn'
                        const isEven = idx % 2 !== 0;
                        const rowClass = `hover:bg-blue-50 transition-colors ${isEven ? 'bg-slate-50/50' : ''}`;
                        
                        const statusClasses = 
                            item.status === 'Completado' ? "bg-green-100 text-green-700" : 
                            item.status === 'Pendiente' ? "bg-orange-100 text-orange-700" : 
                            "bg-red-100 text-red-700";

                        return (
                            <tr key={item.pedidoId} className={rowClass}>
                                <td className="px-8 py-5 font-mono text-xs text-blue-600 font-bold">{item.pedidoId}</td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900">{item.clienteName}</span>
                                    <span className="text-xs text-slate-500">Entrega Estándar</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusClasses}`}>
                                    {item.status}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-sm text-slate-500">
                                    {new Date(item.fecha).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-8 py-5 text-right font-bold text-slate-900">
                                    ${item.tarifaClient.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </section>

        <footer className="px-1 py-2 bg-surface-container-low flex justify-between items-center border-t border-slate-200">
            <p className="text-sm text-on-surface-variant font-medium">
                Mostrando {currentItems.length} de {data.length} transacciones
            </p>
            <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button 
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded font-bold text-xs transition-all ${
                            currentPage === pageNum 
                            ? "bg-blue-600 text-white" 
                            : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                        >
                        {pageNum}
                    </button>
                ))}
            </div>
        </footer>
    </div>
  );
};
