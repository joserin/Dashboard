import React, { useMemo } from 'react';
import { useExcelParser, useDashboardDelivery } from '../../hooks/useDashboardMoto.ts';
import { FileUpload } from '../file/FileUpload.tsx';
import { MotorizadoPDFExporter } from '../motorized/MotorizadoPDFExporter.tsx';
import  { Filters } from '../motorized/Filters.tsx';
import { StatsGrid } from '../motorized/StatsGrid.tsx';
import { DataTableMoto } from '../motorized/DataTableMoto.tsx';
import { MotoPerformanceCharts } from '../motorized/MotoTimeCharts.tsx';

export default function MotorizedManager() {

    const { data, isParsing, error, parseExcel } = useExcelParser();

    const { 
        filteredData,
        stats,
        motorizados, 
        selectedMotorizado, 
        setSelectedMotorizado, 
        dateRange, 
        setDateRange,  
    } = useDashboardDelivery(data);

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

  const chartData = useMemo(() => {
    // Agrupamos por fecha para que la gráfica no tenga mil puntos repetidos
    const groups: { [key: string]: any } = {};

    filteredData.forEach((item) => {
        const date = new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        
        if (!groups[date]) {
            groups[date] = {
                date,
                "Tarifa Total": 0,
                "Comisión Rider": 0,
                "Prom. Retiro": 0,
                "count": 0
            };
        }
        
        groups[date]["Tarifa Total"] += item.tarifa;
        groups[date]["Comisión Rider"] += item.montoFlete;
        groups[date]["Prom. Retiro"] += timeToMinutes(item.tiempoRetiro);
        groups[date].count += 1;
    });
    // Convertimos el objeto en un array y calculamos promedios
    return Object.values(groups).map(group => ({
        ...group,
        "Prom. Retiro": Math.round(group["Prom. Retiro"] / group.count)
    }));
  }, [filteredData]);

  return (
    <div className="flex flex-col gap-5">      
      <header className="flex flex-col md:flex-row justify-between gap-6">
        <section className="flex flex-col items-baseline md:items-center gap-2">
          <p className="text-[10px] font-bold tracking-widest text-slate-500 mb-1 uppercase">Centro de informes</p>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Motorizados Dashboard</h2>
        </section>
        <section>
            <FileUpload onFileSelect={parseExcel} isLoading={isParsing} />
        </section>
      </header>

      <section>
        <Filters 
          motorizados={motorizados}
          selectedMotorizado={selectedMotorizado}
          onMotorizadoChange={setSelectedMotorizado}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </section>

        <StatsGrid stats={stats} />
        <MotoPerformanceCharts data={chartData} zonas={stats.zonasFrecuentes}/>
        <DataTableMoto data={filteredData} />

        {filteredData.length > 0 && (
            <MotorizadoPDFExporter 
              data={filteredData} 
              stats={stats} 
              motorizadoNombre={selectedMotorizado === 'All' ? 'Reporte General' : selectedMotorizado}
            />
        )}
        
        {/* Loading Overlay */}
        {isParsing && (
            <div className="fixed inset-0 z-100 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <p>PROCESANDO...</p>
            </div>
        )}
    </div>
  );
}