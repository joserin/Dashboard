export interface DeliveryData {
  fecha: string;
  pedidoId: string;
  montoTotal: number;
  motorizadoId: string;
  tiempoRetiro: string;
  tiempoEntrega: string;
  clienteName: string; // Added for filtering/display
  status: 'Completado' | 'Pendiente' | 'Cancelado'; // Based on screenshot
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
  cargosExtra: number;
  totalEntregas: number;
}

export interface ChartData {
  name: string;
  value: number;
  secondary?: number;
}

//---DeliveryData---

export type DeliveryStatus = 'Completado' | 'En Tránsito' | 'Cancelado';


export interface DeliveryDataMoto {
  fecha: string; // ISO string or formatted date
  pedidoId: string;
  montoTotal: number;
  //motorizadoId: string;
  motorizadoNombre: string;
  cliente: string;
  tiempoRetiro: string;
  tiempoEntrega: string;
  estado: DeliveryStatus;
  zonaOrigen: string;
  zonaDestino: string;
  tarifa: number;
  montoFlete: number;
}

export interface DashboardStatsMoto {
  totalEntregas: number;
  zonasFrecuentes: { nombre: string; porcentaje: number; color: string }[];
  total: number;
  cliente: number;
  rider: number;
}

export interface DashboardFiltersMoto {
  motorizado: string;
  fechaInicio: string;
  fechaFin: string;
}
