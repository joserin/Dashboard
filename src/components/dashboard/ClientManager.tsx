import React, { useMemo } from 'react';
import { useDashboardFilters } from '../../hooks/useDashboardClient.ts';
import { DataTable } from '../client/DataTable.tsx';
import { FiltersBar } from '../client/FiltersBar.tsx';
import { StatsGrid } from '../client/statsGrid.tsx';
import { PDFExporter } from '../client/PDFExporter.tsx';
import { FileUpload } from '../file/FileUpload.tsx';
import { TimeCharts } from '../client/TimeCharts.tsx';

export default function ClientManager() {
  const { filteredData, 
    stats, 
    clients, 
    selectedClient, 
    setSelectedClient, 
    dateRange, 
    setDateRange,
    handleFileUpload,
    isLoading,
    error
  } = useDashboardFilters();

  // Función auxiliar para convertir "09:15:00" a minutos (555)
  const timeToMinutes = (timeVal: string) => {

    if (timeVal === undefined || timeVal === null || timeVal === "") return 0;

     const numVal = typeof timeVal === 'string' ? parseFloat(timeVal) : timeVal;

     if (!isNaN(numVal) && typeof numVal === 'number' && !String(timeVal).includes(':')) {
      return Math.round(numVal * 24 * 60);
    }
    
    // Si es el formato string "HH:MM:SS"
    if (typeof timeVal === 'string' && timeVal.includes(':')) {
      const parts = timeVal.split(':');
      const hrs = parseInt(parts[0], 10) || 0;
      const mins = parseInt(parts[1], 10) || 0;
      return (hrs * 60) + mins;
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
      if (item.status === 'Cancelado') return acc;
      // Formateamos la fecha para que se vea bien en la gráfica (ej: "15 Oct")
      const rawDate = item.fecha; 

      if (!acc[rawDate]) {
        acc[rawDate] = { 
          date: rawDate, // Guardamos la fecha real
          // Creamos el label bonito solo para la vista
          displayDate: new Date(item.fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
          }),
          Completas: 0, 
          Pendientes: 0, 
          Cancelados: 0, 
          Monto: 0,
          totalRetiro: 0,
          totalEntrega: 0,
          countTiempos: 0
        };
      }
      if (item.status === 'Completado') {
        acc[rawDate].Completas++;
        
        // 2. Lógica Financiera: Solo sumamos monto si fue COMPLETADO
        acc[rawDate].Monto += item.tarifaClient;

        // 3. Lógica de Tiempos: Solo promediamos tiempos de pedidos COMPLETADOS
        const retiroMins = timeToMinutes(item.timeRetiro);
        const entregaMins = timeToMinutes(item.timeEntrega);

        if (retiroMins > 0 && entregaMins > 0) {
          acc[rawDate].totalRetiro += retiroMins;
          acc[rawDate].totalEntrega += entregaMins;
          acc[rawDate].countTiempos++;
        }
      } 
      else if (item.status === 'Pendiente') {
        acc[rawDate].Pendientes++;
      } 
      else if (item.status === 'Cancelado') {
        acc[rawDate].Cancelados++;
        // Nota: Aquí NO sumamos monto ni tiempos
      }

      return acc;
    }, {});

    const sortedArray = Object.values(groups).sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return sortedArray.map((g: any) => ({
      ...g,
      date: g.displayDate, 
      Tiempo: g.countTiempos > 0 ? Math.round((g.totalEntrega - g.totalRetiro) / g.countTiempos) : 0,
      Retiro: g.countTiempos > 0 ? Math.round(g.totalRetiro / g.countTiempos) : 0,
      Entrega: g.countTiempos > 0 ? Math.round(g.totalEntrega / g.countTiempos) : 0,
    }));
  }, [filteredData]);

  const receptorDisplay = useMemo(() => {
    if (selectedClient !== 'Todos' && filteredData.length > 0) {
      // Tomamos el campo 'clienteRecibe' del primer elemento del array filtrado
      return filteredData[0].clienteRecibe || 'No especificado';
    }
    return null; // Si son "Todos", devolvemos null para no mostrarlo
  }, [selectedClient, filteredData]);

  return (
    <div className="flex flex-col gap-5">      
      <header className="flex flex-col md:flex-row justify-between gap-6">
        <section className="flex flex-col items-baseline md:items-center gap-2">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 mb-1 uppercase">Centro de informes</p>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Clientes Dashboard</h2>
        </section>
        <section>
          <FileUpload onFileSelect={handleFileUpload} isLoading={isLoading} />
        </section>
      </header>

      <FiltersBar 
        clients={clients}
        selectedClient={selectedClient}
        onClientChange={setSelectedClient}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <StatsGrid stats={stats} />
      <TimeCharts data={chartData}/>
      <DataTable data={filteredData} />

        {filteredData.length > 0 && (
            <PDFExporter 
              data={filteredData} 
              stats={stats} 
              clientName={selectedClient === 'Todos' ? 'Reporte General' : selectedClient}
              dateRange={effectiveDateRange}
              receptor={receptorDisplay}
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