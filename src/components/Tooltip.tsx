const MiCuadroPersonalizado = ({ active, payload, label, labelFormatter }: any) => {

  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 shadow-lg border rounded-lg z-10">
        {/* El label suele ser la fecha del eje X */}
        <p className="text-sm font-bold">{label}</p>
        
        {/* Recorremos el payload para mostrar cada categoría */}
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex justify-between gap-4 py-0.5">
            <span className="text-xs font-medium" style={{ color: item.color }}>
              {item.name}:
            </span>
            <span className="text-xs font-bold text-slate-600">
              {labelFormatter ? labelFormatter(item.value) : item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default MiCuadroPersonalizado;