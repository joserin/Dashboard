import { useState, useMemo, useCallback } from 'react';
import type { DeliveryData, DashboardStatsMoto, DeliveryStatus  } from '../env'; 
import { useExcelParser, getExcelVal, convertTo24h } from './useExcelParser';

const formatExcelDate = (rawDate: any): string => {
  if (!rawDate) return new Date().toISOString();

  let d: number, m: number, y: number;

  if (typeof rawDate === 'number') {
    // Caso: Número de serie de Excel
    const date = new Date((rawDate - 25569) * 86400 * 1000);
    d = date.getUTCDate();
    m = date.getUTCMonth();
    y = date.getUTCFullYear();
  } else {
    // Caso: String "1/4/2026" o "26/03/2026"
    const parts = String(rawDate).trim().split(/[/|-]/);
    if (parts.length !== 3) return new Date().toISOString();
    
    d = parseInt(parts[0]);
    m = parseInt(parts[1]) - 1;
    y = parseInt(parts[2]);
    
    if (y < 100) y += 2000;
  }
  const finalDate = new Date(y, m, d, 12, 0, 0);
  return finalDate.toISOString();
};

export function useDashboardDelivery() {

  const { data, parseExcel, isLoading, error, setData } = useExcelParser<DeliveryData>();
  const [selectedMotorizado, setSelectedMotorizado] = useState<string>('Todos');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
 
  const handleFileUpload = async (file: File) => {
    try {
      setData([]); 
      setSelectedMotorizado('Todos')

      await parseExcel(file, 'dashboard', (row, index) => {
              
        return {
          internalId: `row-${index}-${Math.random().toString(36).slice(2)}`,
          fecha: formatExcelDate(getExcelVal(row, ['Fecha'])),
          pedidoId: String(getExcelVal(row, ['Pedido']) || `#ORD-${10000 + index}`),
          motorizadoName: String(getExcelVal(row, ['Motorizado']) || 'Desconocido'),
          clienteName: String(getExcelVal(row, ['Cliente']) || 'Sin Cliente'),
          clienteRecibe: String(getExcelVal(row, ['Receptor']) || 'Otros'),
          zonaOrigen: String(getExcelVal(row, ['zona Origen']) || 'N/A'),
          zonaDestino: String(getExcelVal(row, ['zona Destino']) || 'N/A'),
          status: (getExcelVal(row, ['Estado']) || 'Completado') as DeliveryStatus,
          observaciones: String(getExcelVal(row, ['Observacion']) || ''),
          tarifaClient: Number(getExcelVal(row, ['Tarifa Cliente']) || 0),
          tarifaRider: Number(getExcelVal(row, ['Tarifa Moto']) || 0),
          timeRetiro: convertTo24h(getExcelVal(row, ['Retiro']) || '00:00:00'),
          timeEntrega: convertTo24h(getExcelVal(row, ['Entrega']) || '00:00:00'),
        };
      });
      
    } catch (err) {
      alert("Error al subir archivo:");
    }
  };
/*
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const itemDate = parseISO(item.fecha);
      const start = startOfDay(parseISO(dateRange.start));
      const end = endOfDay(parseISO(dateRange.end));

      const matchesMoto = selectedMotorizado === 'Todos' || item.motorizadoName === selectedMotorizado;
      let matchesDate = true;
      //const matchesDate = isWithinInterval(itemDate, { start, end });
      
      if (dateRange.start && dateRange.end) {

        const itemDate = new Date(item.fecha);
        const startDate = startOfDay(parseISO(dateRange.start));
        const endDate = endOfDay(parseISO(dateRange.end));

        matchesDate = isWithinInterval(itemDate, {
          start: startDate,
          end: endDate,
        });
      }
      
      return matchesMoto && matchesDate;
    });

  }, [data, selectedMotorizado, dateRange]);*/
  
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Filtro de Motorizado
      const matchesMoto = selectedMotorizado === 'Todos' || item.motorizadoName === selectedMotorizado;

      // 2. Filtro de Fecha con protección
      let matchesDate = true;

      if (dateRange.start && dateRange.end) {
        // Extraemos año, mes, día manualmente del input (YYYY-MM-DD)
        const [startY, startM, startD] = dateRange.start.split('-').map(Number);
        const [endY, endM, endD] = dateRange.end.split('-').map(Number);
        
        // Creamos límites a medianoche local
        const startLimit = new Date(startY, startM - 1, startD, 0, 0, 0).getTime();
        const endLimit = new Date(endY, endM - 1, endD, 23, 59, 59).getTime();

        // Convertimos la fecha del item (que viene de formatExcelDate como ISO)
        const d = new Date(item.fecha);
        const itemTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0).getTime();

        matchesDate = itemTime >= startLimit && itemTime <= endLimit;
      }

      return matchesMoto && matchesDate;
    });
  }, [data, dateRange, selectedMotorizado]);

  const stats = useMemo<DashboardStatsMoto>(() => {

    const estadosActivos = ['Completado', 'Pendiente'];
    const completedData = filteredData.filter(d => estadosActivos.includes(d.status));

    const totalEntregas = completedData.length;

    const totalCobradoEnvio = completedData.reduce((acc, curr) => {
      return curr.status !== 'Cancelado' ? acc + curr.tarifaClient : acc;
    }, 0);
    const totalPagadoMoto = completedData.reduce((acc, curr) => {
      return curr.status !== 'Cancelado' ? acc + curr.tarifaRider : acc;
    }, 0);
    const gananciaDelivery = totalCobradoEnvio - totalPagadoMoto;

    // Zonas Frecuentes
    const zones: { [key: string]: number } = {};
    completedData.forEach((item) => {
      zones[item.zonaDestino] = (zones[item.zonaDestino] || 0) + 1;
    });

    const sortedZones = Object.entries(zones)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([nombre, count], index) => ({
        nombre,
        porcentaje: Math.round((count / totalEntregas) * 100) || 0,
        color: index === 0 ? '#9a4600' : index === 1 ? '#006590' : '#5c5e65',
      }));

    return {
      totalEntregas,
      zonasFrecuentes: sortedZones,
      ganancia: gananciaDelivery,
      rider: totalPagadoMoto,
      efectividad: totalEntregas > 0 
      ? (filteredData.filter(d => d.status === 'Completado').length / totalEntregas) * 100 : 0
    };
  }, [filteredData]);

  const motorizados = useMemo(() => {
    const names = Array.from(new Set(data.map((item) => item.motorizadoName)));
    return ['Todos', ...names];
  }, [data]);

  return {
    filteredData,
    stats,
    motorizados,
    handleFileUpload,
    selectedMotorizado,
    setSelectedMotorizado,
    dateRange,
    setDateRange,
    isLoading,
    error,
  };
}
