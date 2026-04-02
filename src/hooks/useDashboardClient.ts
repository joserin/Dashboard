import { useState, useCallback, useMemo } from 'react';
import { isWithinInterval, parseISO, startOfDay, endOfDay, parse, isValid } from 'date-fns';
import type { DashboardStats, DeliveryData, DeliveryStatus } from '../env';
import { getExcelVal, useExcelParser, convertTo24h } from './useExcelParser';

const formatExcelDate = (rawDate: any): string => {
  
  let formattedDate = new Date();
  if (!rawDate) return formattedDate.toISOString();

  if (!isNaN(Number(rawDate)) && typeof rawDate !== 'string') {
    formattedDate = startOfDay(new Date((Number(rawDate) - 25569) * 86400 * 1000));
  } else {
    const dateStr = String(rawDate).trim().replace(/-/g, '/');
    const attempt = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (isValid(attempt)) {
      formattedDate = attempt;
    } else {
      const fallback = new Date(dateStr);
      if (isValid(fallback)) formattedDate = fallback;
    }
  }
  return formattedDate.toISOString();

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
      const matchesClient = selectedClient === 'Todos' || item.clienteName === selectedClient;
      
      let matchesDate = true;
      if (dateRange.start && dateRange.end) {

        const itemDate = new Date(item.fecha);
        const startDate = startOfDay(parseISO(dateRange.start));
        const endDate = endOfDay(parseISO(dateRange.end));

        matchesDate = isWithinInterval(itemDate, {
          start: startDate,
          end: endDate,
        });
      }
      
      return matchesClient && matchesDate;
    });
  }, [data, selectedClient, dateRange]);

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
