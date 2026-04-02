import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';

// Función auxiliar compartida para búsqueda de llaves (case-insensitive)
export const getExcelVal = (row: any, targetKeys: string[]) => {
  const rowKeys = Object.keys(row);
  const foundKey = rowKeys.find(key => 
    targetKeys.some(target => target.toLowerCase() === key.trim().toLowerCase())
  );
  return foundKey ? row[foundKey] : undefined;
};

export function useExcelParser<T>() {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseExcel = useCallback(async (file: File, sheetName: string, mapper: (row: any, index: number) => T) => {
    setIsLoading(true);
    setError(null);

    return new Promise<T[]>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const buffer = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(buffer, { type: 'array' });
          
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            throw new Error(`No se encontró la hoja: ${sheetName}`);
          }

          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          const normalizedData = jsonData.map(mapper);

          setData(normalizedData);
          setIsLoading(false);
          resolve(normalizedData);
        } catch (err) {
          setIsLoading(false);
          setError('Error al procesar el archivo Excel.');
          reject(err);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  return { data, setData, parseExcel, isLoading, error };
}

export const convertTo24h = (val: string): string => {
  if (val === undefined || val === null || val === "") return "00:00:00";

  // Si Excel lo sigue mandando como número decimal (0.5833 -> 2 PM)
  if (typeof val === 'number') {
    const totalSeconds = Math.round(val * 24 * 60 * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Si es un String (ej: "2:30 PM" o "14:30")
  let timeStr = String(val).toUpperCase().trim();
  const isPM = timeStr.includes('PM');
  const isAM = timeStr.includes('AM');

  // Extraemos solo los números
  const cleanTime = timeStr.replace(/[A-Z\s]/g, '');
  const parts = cleanTime.split(':');
  if (parts.length < 2) return "00:00:00";

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].padStart(2, '0');
  const seconds = parts[2] ? parts[2].padStart(2, '0') : "00";

  // Lógica de conversión
  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;
  
  if (!isPM && !isAM && hours >= 1 && hours <= 7) {
    hours += 12;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
};