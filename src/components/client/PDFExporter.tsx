import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer';
import type { DashboardStats, DeliveryData } from '../../env';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
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
  col1: { width: '20%', fontSize: 9 },
  col2: { width: '40%', fontSize: 9 },
  col3: { width: '15%', fontSize: 9 },
  col4: { width: '15%', fontSize: 9 },
  col5: { width: '10%', fontSize: 9, textAlign: 'right' },
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
}

const MyPDFDocument: React.FC<PDFDocumentProps> = ({ data, stats, clientName, dateRange }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Borrador de Factura</Text>
          <Text style={styles.subtitle}>Reporte de Gestión Logística - Listogo</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{clientName}</Text>
          <Text style={{ fontSize: 8, color: '#574237' }}>
            Periodo: {dateRange.start || 'N/A'} - {dateRange.end || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Ingresos Totales</Text>
          <Text style={styles.statValue}>${stats.ingresosTotales.toLocaleString()}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Ticket Promedio</Text>
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
          <Text style={[styles.col1, styles.headerText]}>Pedido ID</Text>
          <Text style={[styles.col2, styles.headerText]}>Cliente/Detalle</Text>
          <Text style={[styles.col3, styles.headerText]}>Estado</Text>
          <Text style={[styles.col4, styles.headerText]}>Fecha</Text>
          <Text style={[styles.col5, styles.headerText]}>Monto</Text>
        </View>
        {data.slice(0, 50).map((item) => (
          <View key={item.pedidoId} style={styles.tableRow}>
            <Text style={[styles.col1, { color: '#9a4600', fontWeight: 'bold' }]}>{item.pedidoId}</Text>
            <Text style={styles.col2}>{item.clienteName}</Text>
            <Text style={styles.col3}>{item.status}</Text>
            <Text style={styles.col4}>{new Date(item.fecha).toLocaleDateString()}</Text>
            <Text style={[styles.col5, { fontWeight: 'bold' }]}>${item.montoTotal.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Generado automáticamente por Listogo Reporting Hub - {new Date().toLocaleString()}
      </Text>
    </Page>
  </Document>
);

interface PDFExporterProps {
  data: DeliveryData[];
  stats: DashboardStats;
  clientName: string;
  dateRange: { start: string; end: string };
}

export const PDFExporter: React.FC<PDFExporterProps> = ({ data, stats, clientName, dateRange }) => {
  const fileName = `reporte_${clientName.replace(/\s+/g, '_').toLowerCase()}_${dateRange.start}_al_${dateRange.end}.pdf`;

  return (
    <div className="flex justify-end">
      <PDFDownloadLink
        document={<MyPDFDocument data={data} stats={stats} clientName={clientName} dateRange={dateRange} />}
        fileName={fileName}
        className="bg-blue-300 px-10 py-5 rounded-xl font-black text-lg flex items-center gap-4 cloud-shadow hover:scale-[1.02] transition-transform active:scale-95 cursor-pointer"
      >
        {({ loading }) => (
          <>
            {loading ? 'Preparando PDF...' : 'Generar Borrador Factura PDF'}
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
};
