export interface DeliveryData {
  fecha: string;
  pedidoId: string;
  motorizadoName: string;
  clienteName: string; // Added for filtering/display
  clienteRecibe: string;
  status: 'Completado' | 'Pendiente' | 'Cancelado'; // Based on screenshot
  observaciones: string;
  zonaOrigen: string;
  zonaDestino: string;
  tarifaClient: number;
  tarifaRider: number;
  timeRetiro: string;
  timeEntrega: string;
  internalId: string;
}

export interface FinancialSplit {
  total: number;
  motorizado: number;
  mobile: number;
}

export interface DashboardStats {
  ingresosTotales: number;
  ticketPromedio: number;
  tasaCancelacion: number;
  totalEntregas: number;
}

export interface ChartData {
  name: string;
  value: number;
  secondary?: number;
}

//---DeliveryData---

export type DeliveryStatus = 'Completado' | 'Pendiente' | 'Cancelado';


export interface DashboardStatsMoto {
  totalEntregas: number;
  zonasFrecuentes: { nombre: string; porcentaje: number; color: string }[];
  ganancia: number;
  efectividad: number;
  rider: number;
}

export interface DashboardFiltersMoto {
  motorizado: string;
  fechaInicio: string;
  fechaFin: string;
}
