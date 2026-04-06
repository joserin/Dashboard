import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import type { DashboardStats, DeliveryData } from '../../env';
import { domToPng } from 'modern-screenshot';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginTop: 20, 
    marginBottom: 10, 
    color: '#1e293b' 
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: '#f3f3f3',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  statCard: {
    width: '23%',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 8,
    color: '#574237',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1c1c',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f3f3',
    padding: 8,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
    padding: 8,
    alignItems: 'center',
  },
  col1: { width: '30%', fontSize: 9 },
  col2: { width: '30%', fontSize: 7 },
  col3: { width: '15%', fontSize: 9 },
  col4: { width: '15%', fontSize: 9 },
  col5: { width: '10%', fontSize: 9, textAlign: 'right' },
  tableCellGroup: {
    flexDirection: 'column',
    width: '30%', // coincide con col2
  },
  obsText: {
    fontSize: 7,
    color: '#dc2626', // Rojo para resaltar la observación
    marginTop: 2,
    fontStyle: 'italic',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#574237',
    fontSize: 8,
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
  }
});

interface PDFDocumentProps {
  data: DeliveryData[];
  stats: DashboardStats;
  clientName: string;
  dateRange: { start: string; end: string };
  chartImage: string | null;
  receptor?: string | null;
}

const MyPDFDocument: React.FC<PDFDocumentProps> = ({ data, stats, clientName, dateRange, chartImage, receptor }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mobile</Text>
          <Text style={styles.subtitle}>Reporte de Gestión Logística</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{clientName}</Text>
          <Text style={{ fontSize: 8, color: '#574237' }}>
            Periodo: {dateRange.start || 'N/A'} - {dateRange.end || 'N/A'}
          </Text>
          {/*
          receptor && <Text style={{ fontSize: 8, color: '#574237' }}>Recibió: {receptor}</Text>
          */}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Monto Total</Text>
          <Text style={styles.statValue}>${stats.ingresosTotales.toLocaleString()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Costo Promedio</Text>
          <Text style={styles.statValue}>${stats.ticketPromedio.toFixed(2)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tasa Cancelación</Text>
          <Text style={styles.statValue}>{stats.tasaCancelacion.toFixed(1)}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Entregas</Text>
          <Text style={styles.statValue}>{stats.totalEntregas}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.col4, styles.headerText]}>Fecha</Text>
          <Text style={[styles.col1, styles.headerText]}>Cliente/Detalle</Text>
          <Text style={[styles.col2, styles.headerText]}>Zona</Text>
          <Text style={[styles.col3, styles.headerText]}>Estado</Text>
          <Text style={[styles.col5, styles.headerText]}>Monto</Text>
        </View>
        {data.map((item) => (
          <View key={item.internalId} style={styles.tableRow} wrap={false}>
            <Text style={styles.col4}>{new Date(item.fecha).toLocaleDateString()}</Text>
            <View style={styles.tableCellGroup}>
              <Text style={{ fontSize: 9 }}>{item.clienteName}</Text>
              {item.observaciones ? (
                <Text style={styles.obsText}>Obs: {item.observaciones}</Text>
              ) : <Text style={styles.obsText}>Rec: {item.clienteRecibe}</Text>}
            </View>
            <Text style={styles.col2}>{`${item.zonaOrigen} -> ${item.zonaDestino}`}</Text>
            <Text style={styles.col3}>{item.status}</Text>
            <Text style={[styles.col5, { fontWeight: 'bold' }]}>${item.tarifaClient.toFixed(2)}</Text>
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

interface PDFExporterProps {
  data: DeliveryData[];
  stats: DashboardStats;
  clientName: string;
  receptor?: string | null;
  dateRange: { start: string; end: string };
}

export const PDFExporter: React.FC<PDFExporterProps> = ({ data, stats, clientName, dateRange, receptor }) => {

  const [chartImage, setChartImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasAttemptedCapture, setHasAttemptedCapture] = useState(false);

  useEffect(() => {
    setHasAttemptedCapture(false);
    setChartImage(null); // Limpiamos la imagen vieja para que no salga en el nuevo reporte
  }, [data, clientName, dateRange, receptor]);

  const handleCaptureAndDownload = async () => {
    setIsCapturing(true);
    const element = document.getElementById('charts-report-container');

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

  const fileName = `reporte_${clientName.replace(/\s+/g, '_').toLowerCase()}_${dateRange.start}_al_${dateRange.end}.pdf`;

  return (
    <div className="flex justify-end">
      {!hasAttemptedCapture ? (
        <button
          onClick={handleCaptureAndDownload}
          disabled={isCapturing}
          className="bg-blue-600 px-4 py-2 rounded-xl text-white text-lg shadow-xl"
        >
          {isCapturing ? 'Preparando Reporte...' : 'Generar Reporte PDF'}
        </button>
      ) : (
        <PDFDownloadLink
          document={
            <MyPDFDocument 
              data={data} 
              stats={stats} 
              clientName={clientName}
              receptor={receptor}
              dateRange={dateRange} 
              chartImage={chartImage} 
            />
          }
          fileName={fileName}
          className="bg-green-600 px-2 py-1 rounded-xl font-black text-white text-lg shadow-xl"
        >
          {({ loading }) => (loading ? 'Creando Archivo...' : 'Descargar Ahora')}
        </PDFDownloadLink>
      )}
    </div>
  );
};
