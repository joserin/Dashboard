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
