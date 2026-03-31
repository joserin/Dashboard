import React from 'react';

interface FiltersProps {
  motorizados: string[];
  selectedMotorizado: string;
  onMotorizadoChange: (motorizado: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onRefresh?: () => void;
}

export function Filters({ motorizados, selectedMotorizado, onMotorizadoChange, dateRange, onDateRangeChange }: FiltersProps) {
  return (
    <div className="sticky top-20 z-30 bg-white/70 backdrop-blur-xl p-2 md:flex-row justify-between items-center
      rounded-xl shadow-sm border border-slate-200/50 flex flex-col gap-6">
      <section className="flex items-center gap-3">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
          Motorizado
        </label>
        <select
          value={selectedMotorizado}
          onChange={(e) => onMotorizadoChange(e.target.value)}
          className="bg-transparent border-none text-sm font-semibold focus:ring-0 p-0 text-orange-700 cursor-pointer"
        >
          {motorizados.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </section>
      
      <section className="flex flex-col md:flex-row items-center gap-1">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Periodo</label>
        <div className="flex items-center  rounded-lg px-3 gap-5">
            <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                className="bg-transparent border text-sm py-2 focus:ring-0 cursor-pointer"
            />
            <span className="text-slate-400">→</span>
            <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                className="bg-transparent border text-sm py-2 focus:ring-0 cursor-pointer"
            />
        </div>
      </section>
    </div>
  );
}
