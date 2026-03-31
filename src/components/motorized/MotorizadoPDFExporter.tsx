import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import type { DashboardStatsMoto, DeliveryDataMoto } from '../../env'; // Ajusta la ruta según tu proyecto

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
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
  // Columnas proporcionales
  colFecha: { width: '25%', fontSize: 8 },
  colId: { width: '15%', fontSize: 8 },
  colZonas: { width: '35%', fontSize: 8 },
  colEstado: { width: '15%', fontSize: 8 },
  colTarifa: { width: '10%', fontSize: 8, textAlign: 'right', fontWeight: 'bold' },
});

interface MotorizadoPDFProps {
  data: DeliveryDataMoto[];
  stats: DashboardStatsMoto;
  motorizadoNombre: string;
  receptorNombre?: string;
}

const MotorizadoDocument: React.FC<MotorizadoPDFProps> = ({ data, stats, motorizadoNombre, receptorNombre }) => {
    const nombreFactura = receptorNombre || motorizadoNombre;
    const esDiferente = receptorNombre && receptorNombre !== motorizadoNombre;

    return(
        <Document>
            <Page size="A4" style={styles.page}>
            {/* Header basado en pdfGenerator */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Borrador de Factura - Logística</Text>
                    <Text style={styles.infoText}>Motorizado: {motorizadoNombre}</Text>
                    {esDiferente && (
                    <Text style={[styles.infoText, { fontWeight: 'bold', color: '#1a1c1c' }]}>
                        Receptor/Empresa: {receptorNombre}
                    </Text>
                    )}
                </View>
                <View style={{ textAlign: 'right' }}>
                    <Text style={styles.infoText}>Fecha: {new Date().toLocaleDateString()}</Text>
                    <Text style={styles.infoText}>ID Reporte: {Math.random().toString(36).substr(2, 9).toUpperCase()}</Text>
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
                <Text style={{ fontSize: 9, paddingLeft: 5, width: '50%' }}>Monto Total Bruto</Text>
                <Text style={{ fontSize: 9 }}>${stats.total.toFixed(2)}</Text>
                </View>
                <View style={styles.statsRow}>
                <Text style={{ fontSize: 9, paddingLeft: 5, width: '50%' }}>Comisión Rider (Neto)</Text>
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
                <View key={item.pedidoId} style={styles.tableRow}>
                    <Text style={styles.colFecha}>
                    {new Date(item.fecha).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={[styles.colId, { color: '#9a4600' }]}>{item.pedidoId}</Text>
                    <Text style={styles.colZonas}>{`${item.zonaOrigen} -> ${item.zonaDestino}`}</Text>
                    <Text style={styles.colEstado}>{item.estado}</Text>
                    <Text style={styles.colTarifa}>${item.tarifa.toFixed(2)}</Text>
                </View>
                ))}
            </View>
            </Page>
        </Document>
    );
};

export const MotorizadoPDFExporter: React.FC<MotorizadoPDFProps> = ({ data, stats, motorizadoNombre, receptorNombre}) => {
  const fileName = `reporte-motorizados-${new Date().getTime()}.pdf`;

  return (
    <div className="flex justify-end my-4">
      <PDFDownloadLink
        document={<MotorizadoDocument 
            data={data} 
            stats={stats} 
            motorizadoNombre={motorizadoNombre} 
            receptorNombre={receptorNombre}/>
        }
        fileName={fileName}
        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
      >
        {({ loading }) => (
          loading ? 'Generando PDF...' : 'Exportar Reporte Motorizado'
        )}
      </PDFDownloadLink>
    </div>
  );
};