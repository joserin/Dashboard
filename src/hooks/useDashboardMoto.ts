import { useState, useMemo, useCallback } from 'react';
import type { DeliveryData, DashboardStatsMoto, DeliveryStatus  } from '../env'; 
import { isWithinInterval, parseISO, startOfDay, endOfDay, parse, isValid } from 'date-fns';
import { useExcelParser, getExcelVal } from './useExcelParser';

const formatExcelDate = (rawDate: any): string => {
  let formattedDate = new Date();
  if (!rawDate) return formattedDate.toISOString();

  if (!isNaN(Number(rawDate)) && typeof rawDate !== 'string') {
    formattedDate = startOfDay(new Date((Number(rawDate) - 25569) * 86400 * 1000));
  } else {
    const dateStr = String(rawDate).trim();
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

export function useDashboardDelivery() {

  const { data, parseExcel, isLoading, error } = useExcelParser<DeliveryData>();
  const [selectedMotorizado, setSelectedMotorizado] = useState<string>('Todos');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
 
  const handleFileUpload = async (file: File) => {
    await parseExcel(file, 'dashboard', (row, index) => {
            
      return {
        fecha: formatExcelDate(getExcelVal(row, ['Fecha'])),
        pedidoId: String(getExcelVal(row, ['Pedido']) || `#ORD-${10000 + index}`),
        motorizadoName: String(getExcelVal(row, ['Motorizado']) || 'Desconocido'),
        clienteName: String(getExcelVal(row, ['Cliente']) || 'Sin Cliente'),
        clienteRecibe: String(getExcelVal(row, ['Receptor']) || 'Otros'),
        zonaOrigen: String(getExcelVal(row, ['zona Origen']) || 'N/A'),
        zonaDestino: String(getExcelVal(row, ['zona Destino']) || 'N/A'),
        status: (getExcelVal(row, ['Estado']) || 'Completado') as DeliveryStatus,
        tarifaClient: Number(getExcelVal(row, ['Tarifa Cliente']) || 0),
        tarifaRider: Number(getExcelVal(row, ['Tarifa Moto']) || 0),
        timeRetiro: String(getExcelVal(row, ['Retiro']) || '00:00:00'),
        timeEntrega: String(getExcelVal(row, ['Entrega']) || '00:00:00'),
      };
    });
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {

      const matchesMoto = selectedMotorizado === 'Todos' || item.motorizadoName === selectedMotorizado;
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
      
      return matchesMoto && matchesDate;
    });

  }, [data, selectedMotorizado, dateRange]);

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
