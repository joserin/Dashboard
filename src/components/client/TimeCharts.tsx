import React from 'react';
import { AreaChart, BarChart, LineChart, Card, Title, Text, Flex, Badge } from '@tremor/react';

interface TimeChartsProps {
  data: any[]; // El array procesado que creamos arriba
}

const valueFormatter = (number: number) => 
  `${Intl.NumberFormat('us').format(number).toString()} Ent`;

const currencyFormatter = (number: number) => 
  `$${Intl.NumberFormat('us').format(number).toString()} $`;

const timeFormatter = (number: number) => {
    const hours = Math.floor(number / 60);
    const minutes = number % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
};

export const TimeCharts: React.FC<TimeChartsProps> = ({ data }) => {
    console.log('Datos para gráficos:', data); // Debug: Ver los datos que llegan a los gráficos
    if (data.length === 0) {
        return (
            <Card className="h-80 flex items-center justify-center border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
                <Text className="text-slate-400 font-medium">Sube un archivo Excel para visualizar tendencias</Text>
            </Card>
        );
    }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico Principal con Tremor */}
        <Card className="ring-1 ring-slate-200 shadow-sm">
            <div className="mb-4">
                <Flex justifyContent="between" alignItems="center">
                    <Title className="text-slate-900 font-bold">Análisis de Entregas</Title>
                    <Badge color="blue">En tiempo real</Badge>
                </Flex>
            </div>
            
            
            <AreaChart
                className="h-72 mt-4"
                data={data}
                index="date"
                categories={['Completas', 'Pendientes']}
                colors={['orange', 'blue']}
                valueFormatter={valueFormatter}
                showLegend={true}
                showGridLines={true}
                curveType="monotone"
                allowDecimals={false}
            />
        </Card>
        {/* Gráfico 2: Montos Económicos */}
        <Card className="ring-1 ring-slate-200 shadow-sm">
            <div className="mb-4">
                <Flex justifyContent="between" alignItems="center">
                    <Title className="text-slate-900 font-bold">Ingresos por Día</Title>
                    <Badge color="emerald">Financiero</Badge>
                </Flex>
                <Text className="text-slate-500 text-xs text-left">Monto total facturado</Text>
            </div>
            
            <BarChart
                className="h-72 mt-4"
                data={data}
                index="date"
                categories={['Monto']} // Necesitas asegurarte que el useMemo del Manager envíe este campo
                colors={['emerald']}
                valueFormatter={currencyFormatter}
                showLegend={false}
                allowDecimals={true} 
            />
        </Card>
        {/* Fila Inferior: Tiempos (Ocupa todo el ancho) */}
        <Card className="ring-1 ring-slate-200 shadow-sm">
            <div className="mb-4">
                <Flex justifyContent="between" alignItems="center">
                    <Title className="text-slate-900 font-bold">Eficiencia Horaria (Promedios)</Title>
                    <Badge color="amber">Reloj</Badge>
                </Flex>
                <Text className="text-slate-500 text-xs text-left">Hora promedio en la que se realizan los procesos</Text>
            </div>
            <LineChart
                className="h-80 mt-4"
                data={data}
                index="date"
                categories={['Prom. Retiro', 'Prom. Entrega']}
                colors={['indigo', 'rose']}
                valueFormatter={timeFormatter}
                showLegend={true}
                curveType="monotone"
            />
        </Card>
    </div>
  );
};