import React, { useMemo } from 'react';
import { useDashboardDelivery } from '../../hooks/useDashboardMoto.ts';
import { FileUpload } from '../file/FileUpload.tsx';
import { MotorizadoPDFExporter } from '../motorized/MotorizadoPDFExporter.tsx';
import  { Filters } from '../motorized/Filters.tsx';
import { StatsGridMoto } from '../motorized/StatsGridMoto.tsx';
import { DataTableMoto } from '../motorized/DataTableMoto.tsx';
import { MotoPerformanceCharts } from '../motorized/MotoTimeCharts.tsx';

export default function MotorizedManager() {

  const { 
        filteredData,
        stats,
        motorizados, 
        selectedMotorizado, 
        setSelectedMotorizado, 
        dateRange, 
        setDateRange,
        handleFileUpload,
        isLoading,
        error
  } = useDashboardDelivery();

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

    // 1. Agrupamos usando la fecha ISO original para evitar colisiones y permitir ordenamiento
    const groups = filteredData.reduce((acc: any, item) => {
      if (item.status === 'Cancelado') return acc;
      const rawDate = item.fecha; // Mantenemos el formato original (ISO) para la lógica

      if (!acc[rawDate]) {
        acc[rawDate] = {
          date: rawDate,
          displayDate: new Date(item.fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
          }),
          montoAcumulado: 0,
          sumaMinutosRetiro: 0,
          sumaMinutosEntrega: 0,
          cantidadPedidos: 0,
        };
      }
      
      acc[rawDate].montoAcumulado += item.tarifaRider || 0;

      const retiro = timeToMinutes(item.timeRetiro);
      const entrega = timeToMinutes(item.timeEntrega);
      
      if (retiro > 0 && entrega > 0) {
        acc[rawDate].sumaMinutosRetiro += retiro;
        acc[rawDate].sumaMinutosEntrega += entrega;
        acc[rawDate].cantidadPedidos++;
      }

      return acc;
    }, {});

    // 2. ORDENAMOS: Importante para que la línea de la gráfica no haga zig-zag
    const sortedArray = Object.values(groups).sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // 3. MAPEAMOS: Calculamos promedios y limpiamos nombres para Tremor
    return sortedArray.map((g: any) => {
      const promedioMinutos = g.cantidadPedidos > 0 
        ? Math.round((g.sumaMinutosEntrega - g.sumaMinutosRetiro) / g.cantidadPedidos) : 0;

      return {
        date: g.displayDate,     // Eje X de las gráficas
        tarifa: g.montoAcumulado, // Gráfica de Comisiones
        Tiempo: promedioMinutos,  // Gráfica de Tiempo Promedio
      };
    });
  }, [filteredData]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hora: `${i}:00`,
      pedidos: 0
    }));

    filteredData.forEach(item => {
      if (item.status !== 'Cancelado') {
        const mins = timeToMinutes(item.timeRetiro);
        const hour = Math.floor(mins / 60);
        if (hour >= 0 && hour < 24) {
          hours[hour].pedidos++;
        }
      }
    });

    // Filtramos horas sin pedidos para que la gráfica no se vea tan vacía
    return hours.filter(h => h.pedidos > 0);
  }, [filteredData]);

  return (
    <div className="flex flex-col gap-5">      
      <header className="flex flex-col md:flex-row justify-between gap-6">
        <section className="flex flex-col items-baseline md:items-center gap-2">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 mb-1 uppercase">Centro de informes</p>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Motorizados Dashboard</h2>
        </section>
        <section>
            <FileUpload onFileSelect={handleFileUpload} isLoading={isLoading} />
        </section>
      </header>

      <Filters 
        motorizados={motorizados}
        selectedMotorizado={selectedMotorizado}
        onMotorizadoChange={setSelectedMotorizado}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <StatsGridMoto stats={stats} />
      <MotoPerformanceCharts data={chartData} zonas={stats.zonasFrecuentes} hourlyData={hourlyData}/>
      <DataTableMoto data={filteredData} />

        {filteredData.length > 0 && (
            <MotorizadoPDFExporter 
              data={filteredData} 
              stats={stats} 
              motorizadoNombre={selectedMotorizado === 'Todos' ? 'Reporte General' : selectedMotorizado}
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