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