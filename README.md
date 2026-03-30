# 🛵 Dashboard Motorizado

Panel de análisis de entregas de alto rendimiento construido con **Astro**, **React** y **TypeScript**. Esta herramienta permite procesar archivos de logística (Excel), visualizar métricas clave en tiempo real y exportar reportes detallados.

---

## 🚀 Funcionalidades Principales

* **Carga Inteligente de Datos:** Procesamiento de archivos `.xlsx` (primera hoja) con normalización automática de fechas (ISO, strings `dd/MM/yyyy` y números de serie de Excel).
* **Filtrado Dinámico:** Filtros por cliente (generados automáticamente) y rangos de fecha específicos.
* **Panel de Estadísticas (StatsGrid):**
    * Ingresos totales.
    * Ticket promedio.
    * Tasa de cancelación.
    * Cargos extra (cálculo del 5% mock).
    * Total de entregas.
* **Visualización (TimeCharts):** Gráficos que agrupan estados (Completado/Pendiente/Cancelado) y calculan promedios de tiempo de retiro/entrega en minutos.
* **Exportación:** Generación de reportes en PDF basados en los resultados filtrados.
* **UX:** Overlay de carga durante el procesamiento del Excel.

---

## 🧭 Estructura del Proyecto

El proyecto utiliza una arquitectura de componentes modulares:

```text
src/
├── pages/
│   └── index.astro           # Monta el componente <MotorizedManager />
├── components/
│   ├── MotorizedManager.tsx  # Lógica principal del dashboard
│   ├── FileUpload.tsx        # Carga de archivos
│   ├── FiltersBar.tsx        # Filtros por cliente y fecha
│   ├── StatsGrid.tsx         # Tarjetas de métricas
│   ├── TimeCharts.tsx        # Gráficos de tiempo y estado
│   ├── DataTable.tsx         # Tabla de datos detallada
│   └── PDFExporter.tsx       # Lógica de exportación a PDF
└── hooks/
    ├── useDashboardMoto.ts    # Hook orquestador
    ├── useExcelParser.ts      # Parseo y normalización de XLSX
    └── useDashboardFilters.ts # Lógica de filtrado y estadísticas

🛠️ Instalación y Desarrollo
Instalar dependencias:

npm install

Iniciar entorno de desarrollo:

npm run dev

Abre: http://localhost:4321

Build para producción:

npm run build

🪝 Guía de Uso
Abrir la aplicación.

*Cargar un archivo Excel que contenga la primera hoja con las siguientes columnas mínimas:
*Fecha, Monto, Motorizado, Retiro, Entrega, Cliente, Estado.
*Aplicar filtros por cliente o rango de fechas según sea necesario.
*Visualizar el panel de estadísticas y los gráficos de evolución.
*Exportar a PDF si se requiere un reporte físico.

🧪 Formatos Admitidos

Tipo	Formatos Aceptados
Fechas	dd/MM/yyyy (10/03/2026), ISO, Número de serie Excel (45350)
Horas	String 09:15:00, Decimal de día (0.5 → 12:00)

📦 Dependencias Clave
--Framework: Astro + React
--Excel: xlsx (SheetJS)
--Fechas: date-fns
--Estilos: Tailwind CSS
--Lenguaje: TypeScript

💡 Próximas Mejoras
[ ] Validación de esquema con Zod.
[ ] Feedback de error visual en useExcelParser.
[ ] Opción de descarga en CSV.
[ ] Paginación en la tabla de datos.
[ ] Cache en localStorage para persistencia de datos cargados.