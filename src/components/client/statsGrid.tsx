import type { DashboardStats } from '../../env';

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
    const cards = [
        {
            title: 'Ingresos Totales',
            value: `$${stats.ingresosTotales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            color: 'bg-primary-fixed text-primary',
            description: 'Total acumulado en el Excel',
        },
        {
            title: 'Ticket Promedio',
            value: `$${stats.ticketPromedio.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            color: 'bg-secondary-fixed text-secondary',
            description: 'Promedio por pedido',
        },
        {
            title: 'Pedidos Totales',
            value: `${stats.totalEntregas}`,
            color: 'bg-green-50 text-green-700',
            description: 'Cantidad de registros',
        },
        {
            title: 'Tasa de Cancelación',
            value: `${stats.tasaCancelacion.toFixed(1)}%`,
            color: 'bg-red-50 text-red-700',
            description: 'Pedidos con estado Cancelado',
        },
    ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
            <section key={card.title}
                className="bg-surface-container-lowest p-3 rounded-xl cloud-shadow group space-y-2
                transition-all duration-300 hover:-translate-y-1"
                >
                <p className="text-on-surface-variant text-sm font-medium">{card.title}</p>
                <h3 className="text-3xl font-black text-on-surface tracking-tight">{card.value}</h3>
                <p className="text-[10px] text-slate-400">{card.description}</p>
            </section>
        ))}
    </div>
  );
};
