import type { DashboardStatsMoto } from '../../env';

interface StatsGridProps {
  stats: DashboardStatsMoto;
}

export function StatsGridMoto({ stats }: StatsGridProps) {

  const cards = [
    {
      title: "Total Entregas",
      value: stats.totalEntregas.toLocaleString(),
      description: "Servicios completados con éxito",
      highlight: false
    },
    {
      title: "Monto Total Bruto",
      value: `$${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      description: "Volumen total de facturación",
      highlight: false
    },
    {
      title: "Comisión Motorizado",
      value: `$${stats.rider.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      description: "Ganancia neta para el motorizado",
      highlight: true // Para aplicar el borde naranja distintivo
    }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
      {/* Grid Principal de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <section 
            key={card.title}
            className={`p-4 rounded-xl shadow-sm border transition-all duration-300 hover:-translate-y-1 
              ${card.highlight 
                ? 'bg-white border-t-4 border-t-orange-600 border-x-slate-100 border-b-slate-100' 
                : 'bg-white border-slate-100'
              }`}
          >
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
              {card.title}
            </p>
            <h3 className="text-4xl font-black text-slate-900 tracking-tight">
              {card.value}
            </h3>
            <p className="text-[10px] text-slate-400 mt-2">
              {card.description}
            </p>
          </section>
        ))}
      </div>

      {/* Sección de Zonas Frecuentes (Mantenida aparte por su estructura de lista) */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-md">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">
          Distribución por Zonas
        </span>
        <div className="space-y-4">
          {stats.zonasFrecuentes.length > 0 ? (
            stats.zonasFrecuentes.map((zona, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zona.color }}></div>
                  <span className="text-sm font-semibold text-slate-700">{zona.nombre}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{zona.porcentaje}%</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-400 italic">No hay datos de zonas disponibles</div>
          )}
        </div>
      </div>
    </div>
  );
}
