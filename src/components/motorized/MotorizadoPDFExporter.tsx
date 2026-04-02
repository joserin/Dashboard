import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import type { DashboardStatsMoto, DeliveryData } from '../../env'; // Ajusta la ruta según tu proyecto
import { domToPng } from 'modern-screenshot';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  chartImage: {
    width: '100%',
    height: 'auto',
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#9a4600',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9a4600',
  },
  subtitle: {
    fontSize: 10,
    color: '#574237',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoText: { 
    fontSize: 9, 
    color: '#574237', 
    marginTop: 2 
  },
  timestamp: {
    fontSize: 9,
    color: '#666666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#1a1c1c',
  },
  // Estilo para el Resumen Ejecutivo (Tabla pequeña)
  statsTable: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
    paddingVertical: 5,
  },
  statsHeader: {
    backgroundColor: '#9a4600',
    color: 'white',
    padding: 5,
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Estilo para la Tabla de Pedidos
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#9a4600',
    padding: 6,
    borderRadius: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9e9e9e',
    borderTop: 1,
    borderTopColor: '#f3f3f3',
    paddingTop: 10,
  },
  // Columnas proporcionales
  colFecha: { width: '25%', fontSize: 8 },
  colId: { width: '15%', fontSize: 8 },
  colZonas: { width: '35%', fontSize: 8 },
  colEstado: { width: '15%', fontSize: 8 },
  colTarifa: { width: '10%', fontSize: 8, textAlign: 'right', fontWeight: 'bold' },
});

interface PDFDocumentProps {
  data: DeliveryData[];
  stats: DashboardStatsMoto;
  motorizadoNombre: string;
  dateRange: { start: string; end: string };
  chartImage: string | null;
}

const MotorizadoDocument: React.FC<PDFDocumentProps> = ({ data, stats, motorizadoNombre, dateRange, chartImage }) => {

    return(
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Header basado en pdfGenerator */}
            <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Mobile</Text>
                  <Text style={styles.subtitle}>Reporte de Gestión Logística</Text>
                </View>
                <View style={{ textAlign: 'right' }}>
                  <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{motorizadoNombre}</Text>
                  <Text style={{ fontSize: 8, color: '#574237' }}>
                    Periodo: {dateRange.start || 'N/A'} - {dateRange.end || 'N/A'}
                  </Text>
                </View>
            </View>

            {/* Resumen Ejecutivo */}
            <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
            <View style={styles.statsTable}>
              <View style={[styles.statsRow, { backgroundColor: '#9a4600' }]}>
                <Text style={[styles.colZonas, { color: 'white', paddingLeft: 5 }]}>Métrica</Text>
                <Text style={[styles.colTarifa, { color: 'white', width: '65%', textAlign: 'left' }]}>Valor</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={[styles.colZonas, { paddingLeft: 5 }]}>Total Entregas</Text>
                <Text style={{ fontSize: 10 }}>{stats.totalEntregas}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={{ fontSize: 9, paddingLeft: 5, width: '50%' }}>Efectividad</Text>
                <Text style={{ fontSize: 9 }}>{stats.efectividad.toFixed(2)}%</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={{ fontSize: 9, paddingLeft: 5, width: '50%' }}>Monto (Neto)</Text>
                <Text style={{ fontSize: 9, fontWeight: 'bold' }}>${stats.rider.toFixed(2)}</Text>
              </View>
            </View>

            {/* Detalle de Pedidos */}
            <Text style={styles.sectionTitle}>Detalle de Pedidos</Text>
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                <Text style={[styles.colFecha, styles.headerText]}>Fecha</Text>
                <Text style={[styles.colId, styles.headerText]}>Pedido ID</Text>
                <Text style={[styles.colZonas, styles.headerText]}>Zonas</Text>
                <Text style={[styles.colEstado, styles.headerText]}>Estado</Text>
                <Text style={[styles.colTarifa, styles.headerText]}>Tarifa</Text>
                </View>

                {data.map((item) => (
                <View key={item.internalId} style={styles.tableRow}>
                    <Text style={styles.colFecha}>
                    {new Date(item.fecha).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={[styles.colId, { color: '#9a4600' }]}>{item.pedidoId}</Text>
                    <Text style={styles.colZonas}>{`${item.zonaOrigen} -> ${item.zonaDestino}`}</Text>
                    <Text style={styles.colEstado}>{item.status}</Text>
                    <Text style={styles.colTarifa}>${item.tarifaRider.toFixed(2)}</Text>
                </View>
                ))}
            </View>

            {chartImage && (
              <View break>
                <Text style={styles.sectionTitle}>Análisis de Tendencias</Text>
                <Image src={chartImage} style={styles.chartImage} />
              </View>
            )}
            <Text style={styles.footer}>
              Generado automáticamente por MOBILE - {new Date().toLocaleString()}
            </Text>
          </Page>
        </Document>
    );
};

interface PDFExporterProps {
  data: DeliveryData[];
  stats: DashboardStatsMoto;
  motorizadoNombre: string;
  dateRange: { start: string; end: string };
}

export const MotorizadoPDFExporter: React.FC<PDFExporterProps> = ({ data, stats, motorizadoNombre, dateRange}) => {
  
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasAttemptedCapture, setHasAttemptedCapture] = useState(false);

  useEffect(() => {
      setHasAttemptedCapture(false);
      setChartImage(null); // Limpiamos la imagen vieja para que no salga en el nuevo reporte
    }, [data, motorizadoNombre, dateRange]);

  const handleCaptureAndDownload = async () => {
      setIsCapturing(true);
      const element = document.getElementById('charts-report-container-moto');
  
      if (!element || data.length === 0) {
          setChartImage(null); 
          setIsCapturing(false);
          // Forzamos un estado que indique que ya puede descargar
          setHasAttemptedCapture(true); 
          return;
      }
      
      try {
        // 1. Capturamos el DOM como imagen
        const dataUrl = await domToPng(element, {
            quality: 1,
            scale: 2,
            backgroundColor: '#ffffff',
        });
          
        setChartImage(dataUrl);
      } catch (err) {
        console.error("Error capturando gráficas:", err);
      } finally {
        setIsCapturing(false);
        setHasAttemptedCapture(true);
      }
    };
  
  const fileName = `reporte-motorizados-${new Date().getTime()}.pdf`;

  return (
    <div className="flex justify-end">
      {!hasAttemptedCapture ? (
        <button
          onClick={handleCaptureAndDownload}
          disabled={isCapturing}
          className="bg-blue-600 px-2 py-4 rounded-xl font-black text-white text-lg shadow-xl"
        >
          {isCapturing ? 'Preparando Reporte...' : 'Generar Reporte PDF'}
        </button>
      ) : (
        <PDFDownloadLink
          document={
            <MotorizadoDocument 
              data={data} 
              stats={stats} 
              motorizadoNombre={motorizadoNombre} 
              dateRange={dateRange} 
              chartImage={chartImage} 
            />
          }
          fileName={fileName}
          className="bg-green-600 px-2 py-4 rounded-xl font-black text-white text-lg shadow-xl"
        >
          {({ loading }) => (loading ? 'Generando PDF...' : 'Exportar Reporte Motorizado')}
        </PDFDownloadLink>
      )}
    </div>
  );
};