import React from 'react';
import { AreaChart, BarChart, LineChart, Card, Title, Text, Flex, Badge } from '@tremor/react';
import MiCuadroPersonalizado from '../Tooltip';

interface TimeChartsProps {
  data: any[]; // El array procesado que creamos arriba
}

const valueFormatter = (number: number) => 
  `${Intl.NumberFormat('us').format(number).toString()} Ent`;

const currencyFormatter = (number: number) => 
  `$${Intl.NumberFormat('us').format(number).toString()}`;

const timeFormatter = (number: number) => {
    const hours = Math.floor(number / 60);
    const minutes = number % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
};

export const TimeCharts: React.FC<TimeChartsProps> = ({ data }) => {
  
    if (data.length === 0) {
        return (
            <Card className="h-80 flex items-center justify-center border-dashed border-2 border-slate-200 shadow-none bg-slate-50/50">
                <Text className="text-slate-400 font-medium">Sube un archivo Excel para visualizar tendencias</Text>
            </Card>
        );
    }

    const durationFormatter = (number: number) => {
        if (number === 0) return '0 min';
        const hours = Math.floor(number / 60);
        const minutes = number % 60;
        return hours > 0 ? `${hours}:${minutes} m` : `${minutes} m`;
    };

    // Para la gráfica de RELOJ (Hora exacta: 23:30)
    const clockFormatter = (number: number) => {
        if (number === 0) return '0';
        const hours = Math.floor(number / 60) % 24; // Asegura que no pase de 24
        const minutes = number % 60;
        // Agrega el 0 a la izquierda si es necesario (ej: 09:05)
        const hStr = hours.toString().padStart(2, '0');
        const mStr = minutes.toString().padStart(2, '0');
        return `${hStr}:${mStr}`;
    };

  return (
    <div id="charts-report-container">
        <style dangerouslySetInnerHTML={{ __html: `
            /* 2. GRÁFICA DE LÍNEAS: EFICIENCIA */
            /* Línea de Retiro (Indigo) */
            .recharts-line-curve[name="Retiro"],
            .recharts-line-curve[name="Prom. Retiro"] {
            stroke: #6366f1 !important;
            stroke-width: 3px;
            }
            /* Línea de Entrega (Rose) */
            .recharts-line-curve[name="Entrega"],
            .recharts-line-curve[name="Prom. Entrega"] {
            stroke: #f43f5e !important;
            stroke-width: 3px;
            }
            .recharts-cartesian-axis-tick text {
                font-size: 10px; /* Ajusta este valor a 8px o 9px si lo quieres más pequeño */
            }
        `}} />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico Principal con Tremor */}
        <Card className="ring-1 ring-slate-200 shadow-sm">
            <div className="mb-4">
                <Flex justifyContent="between" alignItems="center">
                    <Title className="text-slate-900 font-bold">Análisis de Entregas</Title>
                    <Badge color="red">En tiempo real</Badge>
                </Flex>
            </div>

            <BarChart
                className="h-72 mt-4"
                data={data}
                index="displayDate"
                stack={true}
                categories={["Pendientes", "Completas"]}
                colors={['green', 'blue']}
                valueFormatter={valueFormatter}
                showLegend={true}
                showGridLines={true}
                allowDecimals={false}
                customTooltip={MiCuadroPersonalizado}
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
                index="displayDate"
                categories={['Monto']} // Necesitas asegurarte que el useMemo del Manager envíe este campo
                colors={['indigo']}
                valueFormatter={currencyFormatter}
                showLegend={false}
                allowDecimals={true}
                customTooltip={MiCuadroPersonalizado}
            />
        </Card>

        {/* Rendimiento por Usuario */}
        <Card className="ring-1 ring-slate-200 shadow-sm">
            <div className="mb-4">
                <Flex justifyContent="between" alignItems="center">
                    <div>
                        <Title className="text-slate-900 font-bold">Rendimiento por Usuario</Title>
                        <Text className="text-slate-500 text-xs text-left">Tiempo promedio de entrega (Desde Retiro hasta Destino)</Text>
                    </div>
                    <Badge color="red">Horas</Badge>
                </Flex>
            </div>

            <AreaChart
                className="h-72 mt-4"
                data={data}
                index="displayDate"
                categories={['Tiempo']}
                colors={['orange']}
                valueFormatter={(number) => `${number} m`}
                showLegend={true}
                showGridLines={true}
                startEndOnly={false}
                curveType="monotone"
                tickGap={0}
                customTooltip={MiCuadroPersonalizado}
                intervalType="preserveStartEnd"
            />
        </Card>

        {/* Fila Inferior: Tiempos (Ocupa todo el ancho) */}
        <Card className="ring-1 ring-slate-200 shadow-sm">
            <div className="mb-4">
                <Flex justifyContent="between" alignItems="center">
                    <Title className="text-slate-900 font-bold">Eficiencia Horaria (Promedios)</Title>
                    <Badge color="red">Reloj</Badge>
                </Flex>
                <Text className="text-slate-500 text-xs text-left">Hora promedio en la que se realizan los procesos</Text>
            </div>
            <LineChart
                className="h-72 mt-4"
                data={data}
                index="displayDate"
                categories={['Retiro', 'Entrega']}
                colors={['indigo', 'amber']}
                valueFormatter={clockFormatter}
                showLegend={true}
                curveType="monotone"
                tickGap={0}
                startEndOnly={false}
                intervalType="preserveStartEnd"
            />
        </Card>

    </div>
    
    </div>
  );
};