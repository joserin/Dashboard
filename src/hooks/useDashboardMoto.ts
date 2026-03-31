import { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import type { DeliveryDataMoto, DeliveryStatus,  DashboardFiltersMoto, DashboardStatsMoto  } from '../env'; 
import { isWithinInterval, parseISO, startOfDay, endOfDay, parse, isValid } from 'date-fns';

export function useExcelParser() {
  const [data, setData] = useState<DeliveryDataMoto[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseExcel = useCallback(async (file: File) => {
    setIsParsing(true);
    setError(null);

    return new Promise<DeliveryDataMoto[]>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const targetSheetName = "moto";
          const worksheet = workbook.Sheets[targetSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          // Normalize data structure
          const normalizedData: DeliveryDataMoto[] = jsonData.map((row, index) => {
            // Función auxiliar idéntica a la de Client para buscar keys sin importar formato
            const getVal = (targetKeys: string[]) => {
              const rowKeys = Object.keys(row);
              const foundKey = rowKeys.find(key => 
                targetKeys.some(target => target.toLowerCase() === key.trim().toLowerCase())
              );
              return foundKey ? row[foundKey] : undefined;
            };

            // Manejo robusto de la fecha (String, Date objeto o Serial de Excel)
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
              fecha: fechaFinal,
              pedidoId: String(getVal(['Pedido']) || `#ORD-${10000 + index}`),
              motorizadoNombre: String(getVal(['Motorizado']) || 'Desconocido'),
              //motorizadoId: String(getVal(['motorizadoId', 'id motorizado', 'cedula']) || '0'),
              cliente: String(getVal(['Cliente']) || 'Sin Cliente'),
              zonaOrigen: String(getVal(['zona Origen']) || 'N/A'),
              zonaDestino: String(getVal(['zona Destino']) || 'N/A'),
              estado: (getVal(['Estado']) || 'Completado') as DeliveryStatus,
              tarifa: Number(getVal(['Tarifa']) || 0),
              montoFlete: Number(getVal(['Flete']) || 0),
              tiempoRetiro: String(getVal(['Retiro']) || '00:00:00'),
              tiempoEntrega: String(getVal(['Entrega']) || '00:00:00'),
              // Campos adicionales si existen en tu env.d.ts
              montoTotal: Number(getVal(['Monto']) || 0), 
            };
          });

          setData(normalizedData);
          setIsParsing(false);
          resolve(normalizedData);
        } catch (err) {
          setIsParsing(false);
          setError('Error al procesar el archivo Excel. Asegúrese de que el formato sea correcto.');
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);
  return { data, setData, parseExcel, isParsing, error };
}

export function useDashboardDelivery(data: DeliveryDataMoto[]) {

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [selectedMotorizado, setSelectedMotorizado] = useState<string>('Todos');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesMoto = selectedMotorizado === 'Todos' || item.motorizadoNombre === selectedMotorizado;
      
      let matchesDate = true;
      
      if (dateRange.start && dateRange.end) {
        
        const itemDate = parseISO(item.fecha);
        matchesDate = isWithinInterval(itemDate, {
          start: startOfDay(parseISO(dateRange.start)),
          end: endOfDay(parseISO(dateRange.end)),
        });
      }
      
      return matchesMoto && matchesDate;
    });

  }, [data, selectedMotorizado, dateRange]);

  const stats = useMemo<DashboardStatsMoto>(() => {
    const totalEntregas = filteredData.length;
    const totalMonto = filteredData.reduce((acc, curr) => acc + curr.montoTotal, 0);
    const clienteMonto = filteredData.reduce((acc, curr) => acc + curr.tarifa, 0);
    const riderMonto = filteredData.reduce((acc, curr) => acc + curr.montoFlete, 0);

    // Zonas Frecuentes
    const zones: { [key: string]: number } = {};
    filteredData.forEach((item) => {
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
      total: totalMonto,
      cliente: clienteMonto,
      rider: riderMonto,
    };
  }, [filteredData]);

  const motorizados = useMemo(() => {
    const names = Array.from(new Set(data.map((item) => item.motorizadoNombre)));
    return ['Todos', ...names];
  }, [data]);

  return {
    filteredData,
    stats,
    motorizados,
    selectedMotorizado,
    setSelectedMotorizado,
    dateRange,
    setDateRange,
  };
}
