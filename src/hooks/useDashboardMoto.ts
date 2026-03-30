import { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { isWithinInterval, parseISO, startOfDay, endOfDay, parse, isValid } from 'date-fns';
import type { DashboardStats, DeliveryData } from '../env';

export function useExcelParser() {
  const [data, setData] = useState<DeliveryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseExcel = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        // Mapping logic
        const normalizedData: DeliveryData[] = jsonData.map((row, index) => {
          // Función auxiliar para buscar valores sin importar mayúsculas/minúsculas
          const getVal = (targetKeys: string[]) => {
            const rowKeys = Object.keys(row);
            const foundKey = rowKeys.find(key => 
              targetKeys.some(target => target.toLowerCase() === key.trim().toLowerCase()));
            return foundKey ? row[foundKey] : null;
          };
          const rawDate = getVal(['Fecha']);
          let formattedDate = new Date()

          if (rawDate) {
            // Caso A: Excel lo envió como número de serie (ej: 45350)
            if (!isNaN(Number(rawDate)) && typeof rawDate !== 'string') {
              formattedDate = new Date((Number(rawDate) - 25569) * 86400 * 1000);
            }
            // Caso B: Es un String (puede venir 10/03/2026 o 03/10/2026)
            else{
              const dateStr = String(rawDate).trim();
              // Intentamos parsear asumiendo que el usuario prefiere Día/Mes/Año
              const attempt = parse(dateStr, 'dd/MM/yyyy', new Date());
              
              if (isValid(attempt)) {
                formattedDate = attempt;
              } else {
                // Si falla, intentamos que el navegador lo entienda (ISO o local)
                const fallback = new Date(dateStr);
                if (isValid(fallback)) formattedDate = fallback;
              }
            }
          }
          const fechaFinal = formattedDate.toISOString();

          return {
            pedidoId: getVal(['Pedido']) || `#ORD-${10000 + index}`,
            fecha: fechaFinal,
            montoTotal: Number(getVal(['Monto']) || 0),
            motorizadoId: getVal(['Motorizado']) || 'N/A',
            tiempoRetiro: getVal(['Retiro']) || '0',
            tiempoEntrega: getVal(['Entrega']) || '0',
            clienteName: getVal(['Cliente']) || 'Consumidor Final',
            status: getVal(['Estado']) || 'Pendiente',
          };
        });

        console.log( 'Datos normalizados:', normalizedData); // Debug: Ver los datos después de normalizar

        setData(normalizedData);
        setIsLoading(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError('Error al procesar el archivo Excel');
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, parseExcel, setData };
}

export function useDashboardFilters(data: DeliveryData[]) {
  const [selectedClient, setSelectedClient] = useState<string>('All');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const clients = useMemo(() => {
    const uniqueClients = Array.from(new Set(data.map((d) => d.clienteName)));
    return ['All', ...uniqueClients];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesClient = selectedClient === 'All' || item.clienteName === selectedClient;
      
      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        const itemDate = parseISO(item.fecha);
        matchesDate = isWithinInterval(itemDate, {
          start: startOfDay(parseISO(dateRange.start)),
          end: endOfDay(parseISO(dateRange.end)),
        });
      }
      
      return matchesClient && matchesDate;
    });
  }, [data, selectedClient, dateRange]);

  const stats = useMemo((): DashboardStats => {
    const total = filteredData.reduce((acc, curr) => acc + curr.montoTotal, 0);
    const count = filteredData.length;
    const cancelledCount = filteredData.filter(d => d.status === 'Cancelado').length;
    
    return {
      ingresosTotales: total,
      ticketPromedio: count > 0 ? total / count : 0,
      tasaCancelacion: count > 0 ? (cancelledCount / count) * 100 : 0,
      cargosExtra: total * 0.05, // Mocked cargo extra
      totalEntregas: count,
    };
  }, [filteredData]);

  return {
    filteredData,
    stats,
    clients,
    selectedClient,
    setSelectedClient,
    dateRange,
    setDateRange,
  };
}
