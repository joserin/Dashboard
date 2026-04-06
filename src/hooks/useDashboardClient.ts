import { useState, useCallback, useMemo } from 'react';
import { isWithinInterval, parseISO, startOfDay, endOfDay} from 'date-fns';
import type { DashboardStats, DeliveryData, DeliveryStatus } from '../env';
import { getExcelVal, useExcelParser, convertTo24h } from './useExcelParser';

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

export function useDashboardFilters() {
  const { data, parseExcel, isLoading, error, setData } = useExcelParser<DeliveryData>();
  const [selectedClient, setSelectedClient] = useState<string>('Todos');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const handleFileUpload = async (file: File) => {

    try {
      setData([]); 
      setSelectedClient('Todos')

      await parseExcel(file, 'dashboard', (row, index) => {
              
        return {
          internalId: `row-${index}-${Math.random().toString(36).slice(2)}`,
          fecha: formatExcelDate(getExcelVal(row, ['Fecha'])),
          pedidoId: (String(getExcelVal(row, ['Pedido']) || `#ORD-${10000 + index}`)).trim(),
          motorizadoName: (String(getExcelVal(row, ['Motorizado']) || 'Desconocido')).trim(),
          clienteName: (String(getExcelVal(row, ['Cliente']) || 'Sin Cliente')).trim(),
          clienteRecibe: (String(getExcelVal(row, ['Receptor']) || 'Otros')).trim(),
          zonaOrigen: (String(getExcelVal(row, ['zona Origen']) || 'N/A')).trim(),
          zonaDestino: (String(getExcelVal(row, ['zona Destino']) || 'N/A')).trim(),
          status: (getExcelVal(row, ['Estado']) || 'Completado') as DeliveryStatus,
          observaciones: (String(getExcelVal(row, ['Observacion']) || '')).trim(),
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

  const clients = useMemo(() => {
    const uniqueClients = Array.from(new Set(data.map((d) => d.clienteName)));
    return ['Todos', ...uniqueClients];
  }, [data]);

  
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Filtro de Cliente
      const matchesClient = selectedClient === 'Todos' || item.clienteName === selectedClient;

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

      return matchesClient && matchesDate;
    });
  }, [data, dateRange, selectedClient]);

  const stats = useMemo((): DashboardStats => {

    const estadosActivos = ['Completado', 'Pendiente'];
    const completedData = filteredData.filter(d => estadosActivos.includes(d.status));
    //const completedData = filteredData.filter(d => d.status === 'Completado');
    const totalIngresos = completedData.reduce((acc, curr) => acc + curr.tarifaClient, 0);

    const totalRegistros = filteredData.length;
    const totalCompletados = completedData.length;
    const cancelledCount = filteredData.filter(d => d.status === 'Cancelado').length;
    
    return {
      ingresosTotales: totalIngresos,
      ticketPromedio: totalCompletados > 0 ? totalIngresos / totalCompletados : 0,
      tasaCancelacion: totalRegistros > 0 ? (cancelledCount / totalRegistros) * 100 : 0,
      totalEntregas: totalCompletados,
    };
  }, [filteredData]);

  return {
    filteredData,
    handleFileUpload,
    isLoading,
    error,
    stats,
    clients,
    selectedClient,
    setSelectedClient,
    dateRange,
    setDateRange,
  };
}
