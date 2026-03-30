import React, { useMemo } from 'react';
import { useExcelParser, useDashboardFilters } from '../../hooks/useDashboardMoto.ts';
import { DataTable } from '../motorized/DataTable.tsx';
import { FiltersBar } from '../motorized/FiltersBar.tsx';
import { StatsGrid } from '../motorized/statsGrid.tsx';
import { PDFExporter } from '../motorized/PDFExporter.tsx';
import { FileUpload } from '../file/FileUpload.tsx';
import { TimeCharts } from '../motorized/TimeCharts.tsx';

export default function MotorizedManager() {
  const { data, isLoading, error, parseExcel } = useExcelParser();
  const { filteredData, stats, clients, selectedClient, setSelectedClient, dateRange, setDateRange } = useDashboardFilters(data);

  // Función auxiliar para convertir "09:15:00" a minutos (555)
  const timeToMinutes = (timeVal: string) => {
    if (!timeVal) return 0;
  
    // Si Excel lo envía como string "09:15:00"
    if (typeof timeVal === 'string') {
      const parts = timeVal.split(':');
      if (parts.length < 2) return 0;
      const hrs = parseInt(parts[0], 10);
      const mins = parseInt(parts[1], 10);
      return (hrs * 60) + mins;
    }
    
    // Si Excel lo envía como número (fracción de día: 0.5 = 12:00 PM)
    if (typeof timeVal === 'number') {
      return Math.round(timeVal * 24 * 60);
    }

    return 0;
  };

  const effectiveDateRange = useMemo(() => {
    // 1. Si el usuario ya eligió fechas en el filtro, usamos esas.
    if (dateRange.start && dateRange.end) {
      return dateRange;
    }

    // 2. Si no hay filtro pero hay datos, buscamos la primera y última fecha de los registros.
    if (filteredData.length > 0) {
      const dates = filteredData.map(d => new Date(d.fecha).getTime());
      return {
        start: new Date(Math.min(...dates)).toLocaleDateString('en-CA'), // Formato YYYY-MM-DD
        end: new Date(Math.max(...dates)).toLocaleDateString('en-CA')
      };
    }

    // 3. Si no hay nada, devolvemos vacío o la fecha de hoy.
    return { start: 'Inicio', end: 'Fin' };
  }, [dateRange, filteredData]);

  
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];

    // Agrupamos por fecha
    const groups = filteredData.reduce((acc: any, item) => {
      // Formateamos la fecha para que se vea bien en la gráfica (ej: "15 Oct")
      const dateLabel = new Date(item.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
      });

      if (!acc[dateLabel]) {
        acc[dateLabel] = { 
          date: dateLabel, 
          Completas: 0, 
          Pendientes: 0, 
          Cancelados: 0, 
          Monto: 0,
          totalRetiroMins: 0,
          totalEntregaMins: 0,
          countTiempos: 0
        };
      }

      // Sumamos según el estado
      if (item.status === 'Completado') acc[dateLabel].Completas++;
      else if (item.status === 'Pendiente') acc[dateLabel].Pendientes++;
      else if (item.status === 'Cancelado') acc[dateLabel].Cancelados++;

      acc[dateLabel].Monto += item.montoTotal;

      // Lógica de tiempos
      const retiroMins = timeToMinutes(item.tiempoRetiro);
      const entregaMins = timeToMinutes(item.tiempoEntrega);
      
      if (retiroMins > 0) {
        acc[dateLabel].totalRetiroMins += retiroMins;
        acc[dateLabel].totalEntregaMins += entregaMins;
        acc[dateLabel].countTiempos++;
      }

      return acc;
    }, {});

    // Convertimos el objeto en un array y lo ordenamos por fecha si es necesario
    return Object.values(groups).map((g: any) => ({
      ...g,
      // Calculamos el promedio. Si no hay datos, ponemos 0.
      'Prom. Retiro': g.countTiempos > 0 ? Math.round(g.totalRetiroMins / g.countTiempos) : 0,
      'Prom. Entrega': g.countTiempos > 0 ? Math.round(g.totalEntregaMins / g.countTiempos) : 0,
    }));
  }, [filteredData]);

  return (
    <div className="flex flex-col gap-5">      
      <header className="flex flex-col md:flex-row justify-between gap-6">
        <section className="flex flex-col items-baseline md:items-center gap-2">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 mb-1 uppercase">Centro de informes</p>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Motorizado Dashboard</h2>
        </section>
        <section>
          {data.length === 0 && <FileUpload onFileSelect={parseExcel} isLoading={isLoading} />}
        </section>
      </header>

      <section>
        <FiltersBar 
          clients={clients}
          selectedClient={selectedClient}
          onClientChange={setSelectedClient}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </section>

        <StatsGrid stats={stats} />
        <TimeCharts data={chartData}/>
        <DataTable data={filteredData} />

        {filteredData.length > 0 && (
            <PDFExporter 
              data={filteredData} 
              stats={stats} 
              clientName={selectedClient === 'All' ? 'Reporte General' : selectedClient}
              dateRange={effectiveDateRange}
            />
        )}
        
        {/* Loading Overlay */}
        {isLoading && (
            <div className="fixed inset-0 z-100 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <p>PROCESANDO...</p>
            </div>
        )}
    </div>
  );
}