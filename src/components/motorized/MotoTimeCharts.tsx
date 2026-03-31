import { Card, Title, AreaChart, DonutChart, Flex, Text, BarChart } from "@tremor/react";

interface MotoPerformanceChartsProps {
  data: any[]; // El chartData procesado
  zonas: any[]; // stats.zonasFrecuentes
}

export const MotoPerformanceCharts = ({ data, zonas }: MotoPerformanceChartsProps) => {
    if (data.length === 0) {
        return (
            <Card className="h-80 flex items-center justify-center border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
                <Text className="text-slate-400 font-medium">Sube un archivo Excel para visualizar tendencias</Text>
            </Card>
        );
    }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfica de Zonas (Donut) */}
      <Card>
        <Title>Zonas más Concurridas</Title>
        <DonutChart
          className="mt-6"
          data={zonas}
          category="porcentaje"
          index="nombre"
          colors={["orange", "blue", "slate", "amber"]}
          variant="pie"
          valueFormatter={(number) => `${number}%`}
        />
      </Card>

      {/* Gráfica de Ingresos (Tendencia) */}
      <Card>
        <Title>Evolución de Comisiones ($)</Title>
        <AreaChart
          className="h-72 mt-4"
          data={data}
          index="fecha"
          categories={["montoFlete", "tarifa"]}
          colors={["orange", "cyan"]}
        />
      </Card>
      {/* Gráfica de Eficiencia de Tiempos (BarChart) */}
      <Card className="ring-1 ring-slate-200">
        <Title>Tiempo Promedio de Retiro por Día</Title>
        <BarChart
          className="h-72 mt-4"
          data={data}
          index="date"
          categories={["Prom. Retiro"]}
          colors={["indigo"]}
          valueFormatter={(number) => `${number} min`}
        />
      </Card>
    </div>
  );
};