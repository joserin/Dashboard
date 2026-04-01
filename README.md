# 🛵 Dashboard Motorizado y Cliente

Proyecto Astro + React + TypeScript para análisis de entregas y clientes con Excel. Incluye:
- módulo **Motorizado** (`delivery.astro`) con métricas de rider, zonas, ganancia y tiempos;
- módulo **Cliente** (`client.astro`) con métricas de clientes, ingresos, tiempos y receptor;
- parser XLSX reutilizable (`useExcelParser`);
- exportación PDF, tablas y gráficas por componente.

---

## 🔧 Nuevos módulos agregados (2026)

- `src/pages/delivery.astro` -> `MotorizedManager`
- `src/pages/client.astro` -> `ClientManager`
- `src/components/dashboard/MotorizedManager.tsx`, `ClientManager.tsx`
- `src/components/motorized/`:
  - `DataTableMoto.tsx`, `Filters.tsx`, `MotorizadoPDFExporter.tsx`, `MotoTimeCharts.tsx`, `StatsGridMoto.tsx`
- `src/components/client/`:
  - `DataTable.tsx`, `FiltersBar.tsx`, `PDFExporter.tsx`, `TimeCharts.tsx`, `statsGrid.tsx`
- `src/hooks/`:
  - `useDashboardMoto.ts` (hooks de motorizado)
  - `useDashboardClient.ts` (hooks de clientes)
  - `useExcelParser.ts` (parser + helper `getExcelVal`)
- `src/components/file/FileUpload.tsx` (carga de archivos común)

---

## 🚀 Funcionalidades Principales

1. Carga de Excel (.xlsx) en ambas secciones.
2. Normalización de fecha:
   - `dd/MM/yyyy`
   - ISO
   - número de serie Excel (e.g. 45350)
3. Filtrado:
   - Cliente / Motorizado (dropdown con "Todos")
   - Rango de fechas
4. Estadísticas generadas en hooks:
   - Ingresos totales
   - Ticket promedio (clientes)
   - Tasa de cancelación
   - Total de entregas
   - Ganancia rider y efectividad (motorizado)
   - Zonas frecuentes
5. Tablas detalladas con estado de cada registro.
6. Gráficos de línea y barras (`TimeCharts` y `MotoTimeCharts`) con datos agregados.
7. Exportación a PDF (`PDFExporter`, `MotorizadoPDFExporter`).
8. UI de carga: overlay mientras `isLoading` es true.

---

## 🗂 Estructura del proyecto

```text
src/
├─ components/
│  ├─ dashboard/
│  │  ├─ ClientManager.tsx
│  │  └─ MotorizedManager.tsx
│  ├─ client/
│  │  ├─ DataTable.tsx
│  │  ├─ FiltersBar.tsx
│  │  ├─ PDFExporter.tsx
│  │  ├─ TimeCharts.tsx
│  │  └─ statsGrid.tsx
│  ├─ motorized/
│  │  ├─ DataTableMoto.tsx
│  │  ├─ Filters.tsx
│  │  ├─ MotorizadoPDFExporter.tsx
│  │  ├─ MotoTimeCharts.tsx
│  │  └─ StatsGridMoto.tsx
│  └─ file/
│     └─ FileUpload.tsx
├─ hooks/
│  ├─ useDashboardClient.ts
│  ├─ useDashboardMoto.ts
│  └─ useExcelParser.ts
├─ pages/
│  ├─ index.astro      # redirige o muestra /delivery por defecto
│  ├─ delivery.astro   # Motorizados
│  └─ client.astro     # Clientes
└─ env.d.ts            # Tipos de datos y estados
```

---

## 🧾 Esquema de datos (`src/env.d.ts`)

- `DeliveryData`:
   - `fecha`, `pedidoId`, `motorizadoName`, `clienteName`, `clienteRecibe`, `zonaOrigen`, `zonaDestino`, `status`, `tarifaClient`, `tarifaRider`, `timeRetiro`, `timeEntrega`
- `DashboardStats` (clientes)
- `DashboardStatsMoto` (motorizado)

---

## ⚙️ Instalación y ejecución

1. Instalar dependencias
   - `npm install` (o `pnpm install`) 
2. Iniciar servidor dev
   - `npm run dev`
3. Build producción
   - `npm run build`
4. Acceder en `http://localhost:4321`

---

## 📦 Requisitos / Dependencias

- `astro`, `react`, `react-dom`
- `typescript`
- `date-fns`
- `xlsx` (SheetJS)
- `@types/node`, si aplica

---

## 🧩 Carga de datos sugeridos

La hoja Excel debe incluir como mínimo las columnas:
- `Fecha`, `Pedido`, `Motorizado`, `Cliente`, `Receptor`, `zona Origen`, `zona Destino`, `Estado`, `Tarifa Cliente`, `Tarifa Moto`, `Retiro`, `Entrega`

Notas:
- Las fechas en hojas numéricas se balancean con fecha serial Excel.
- Los valores de tiempo en `HH:mm:ss` o decimal se transforman a minutos.

---

## 🛠️ Quickstart de desarrollo

- Cambia entre módulos:
  - `/delivery` para motorizados
  - `/client` para clientes
- El parser común generará un estado consistente con `DeliveryData`.
- Si quieres agregar validación, añade `zod` y un `schema` en `useExcelParser`.

---

## 💡 Mejores prácticas y próximos pasos

- Añadir validación de columnas y alertas de filas inválidas en `useExcelParser`.
- Guardar la última carga en `localStorage` para restaurar selección.
- Añadir paginación / ordenación en `DataTable` y `DataTableMoto`.
- Compartir componentes comunes de gráficos si la lógica coincide.
- Soporte CSV/JSON adicional.
