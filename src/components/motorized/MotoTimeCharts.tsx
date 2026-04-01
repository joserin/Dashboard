import { Card, Title, AreaChart, DonutChart, Flex, Text, BarChart, Legend } from "@tremor/react";
import MiCuadroPersonalizado from "../Tooltip";

interface MotoPerformanceChartsProps {
  data: any[]; // El chartData procesado
  zonas: any[]; // stats.zonasFrecuentes
  hourlyData: any[]; // Datos para la gráfica de horas
}

const valueFormatter = (number: number) => 
  `${Intl.NumberFormat('us').format(number).toString()} Ent`;

const currencyFormatter = (number: number) => 
  `$${Intl.NumberFormat('us').format(number).toString()}`;

export const MotoPerformanceCharts = ({ data, zonas, hourlyData }: MotoPerformanceChartsProps) => {
  if (data.length === 0) {
    return (
      <Card className="h-80 flex items-center justify-center border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
        <Text className="text-slate-400 font-medium">Sube un archivo Excel para visualizar tendencias</Text>
      </Card>
    );
  }
  
  return (
    <div id="charts-report-container-moto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de Eficiencia de Tiempos (BarChart) */}
        <Card className="ring-1 ring-slate-200">
          <Title>Tiempo Promedio de entregas por Día</Title>
          <BarChart
            className="h-72 mt-4"
            data={data}
            index="date"
            categories={["Tiempo"]}
            colors={["indigo"]}
            valueFormatter={(number) => `${number} m`}
            customTooltip={MiCuadroPersonalizado}
          />
        </Card>

        {/* Gráfica de Zonas (Donut) */}
        <Card>
          <Title>Zonas más Concurridas</Title>
          <DonutChart
            className="mt-6"
            data={zonas}
            category="porcentaje"
            index="nombre"
            colors={["orange", "blue", "green", "amber"]}
            variant="pie"
            valueFormatter={(number) => `${number}%`}
            customTooltip={MiCuadroPersonalizado}
          />
          {/* LEYENDA VISIBLE PARA EL PDF */}
          <span className="font-bold text-2xl">Leyenda</span>
          <Legend
            className="mt-6 justify-center"
            categories={zonas.map((z: any) => z.nombre)}
            colors={["orange", "blue", "green", "amber"]}
          />
        </Card>

        {/* Gráfica de Ingresos (Tendencia) */}
        <Card>
          <Title>Evolución de Ganancias ($)</Title>
          <AreaChart
            className="h-72 mt-4"
            data={data}
            index="date"
            categories={["tarifa"]}
            colors={["orange", "cyan"]}
            valueFormatter={currencyFormatter}
            customTooltip={MiCuadroPersonalizado}
          />
        </Card>
        
        {/* Gráfica de Pedidos por Hora (BarChart) */}
        <Card>
          <Title>Volumen de Pedidos por Hora</Title>
          <BarChart
            className="h-72 mt-4"
            data={hourlyData} // Pásalo por props desde el Manager
            index="hora"
            categories={["pedidos"]}
            colors={["amber"]}
            valueFormatter={(number) => `${number}`}
            customTooltip={MiCuadroPersonalizado}
            allowDecimals={false}
          />
        </Card>
      </div>
    </div>
  );
};