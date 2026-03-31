const MiCuadroPersonalizado = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 shadow-lg border rounded-lg z-10">
        {/* El label suele ser la fecha del eje X */}
        <p className="text-sm font-bold">{label}</p>
        
        {/* Recorremos el payload para mostrar cada categoría */}
        {payload.map((item: any, index: number) => (
          <p key={index} style={{ color: item.color }}>
            {item.name}: {item.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default MiCuadroPersonalizado;