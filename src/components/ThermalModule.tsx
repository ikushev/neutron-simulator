import React, { useMemo } from 'react';
import { useSim } from '../context/SimContext';
import { calculateThermalHydraulics } from '../utils/physics';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ScatterChart, Scatter, Cell, ZAxis
} from 'recharts';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { motion } from 'motion/react';
import { Thermometer, Beaker, Info, Wind } from 'lucide-react';
import { ExportToolbar } from './ExportToolbar';

const CustomTooltipThermal: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-academic-text text-white p-4 shadow-2xl rounded-sm border-none opacity-95 backdrop-blur-md">
        <p className="text-[9px] uppercase tracking-widest text-gray-400 border-b border-white/10 pb-2 mb-2">
          Радиус: {label} cm
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[11px] font-bold" style={{ color: entry.color }}>
               <InlineMath math="T(r)" />
               <span className="text-white">: {entry.value.toFixed(1)} °C</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ThermalModule: React.FC = () => {
  const { state, updateState, role, isDetached } = useSim();
  const power = state.linearPower ?? 200;
  const bulk = state.bulkCoolantTemp ?? 280;
  
  const data = useMemo(() => calculateThermalHydraulics(power, bulk), [power, bulk]);

  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-end border-b border-academic-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-academic-thermal">
             <Thermometer className="w-5 h-5" />
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Термохидравлика</h3>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-academic-text dark:text-gray-100">Термохидравличен анализ на ТВЕЛ</h1>
          <p className="text-xs text-secondary-text font-medium italic dark:text-gray-400">Профил на температурите в горивната таблетка, обвивката и охладителя</p>
        </div>
        
        <div className="flex items-center gap-12">
           <div className="flex flex-col items-end gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Лин. мощност (q') [W/cm]</span>
              <div className="flex items-center gap-4">
                 <span className="text-xl font-mono text-academic-thermal font-bold">{power}</span>
                 <input 
                   type="range" min="100" max="500" step="10" 
                   value={power} 
                   onChange={(e) => updateState({ linearPower: Number(e.target.value) })}
                   className="accent-academic-thermal w-32"
                   disabled={role === 'student' && !isDetached}
                 />
              </div>
           </div>
           <div className="flex flex-col items-end gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Темп. на водата [°C]</span>
              <div className="flex items-center gap-4">
                 <span className="text-xl font-mono text-academic-thermal font-bold">{bulk}</span>
                 <input 
                   type="range" min="200" max="320" step="5" 
                   value={bulk} 
                   onChange={(e) => updateState({ bulkCoolantTemp: Number(e.target.value) })}
                   className="accent-academic-thermal w-32"
                   disabled={role === 'student' && !isDetached}
                 />
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-6">
          <div className="flex items-center gap-2 text-gray-400">
             <Wind className="w-4 h-4" />
             <h2 className="text-[10px] uppercase tracking-widest font-bold">Радиален температурен профил</h2>
          </div>
          
          <div id="thermal-chart" className="h-[450px] academic-card p-10 relative overflow-hidden bg-white dark:bg-academic-bg">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                   <CartesianGrid strokeDasharray="1 6" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                   <XAxis 
                     dataKey="r" 
                     tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                     axisLine={false}
                     label={{ value: 'Радиус (cm)', position: 'insideBottom', offset: -5, fontSize: 9 }}
                   />
                   <YAxis 
                     tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                     axisLine={false}
                     domain={['auto', 'auto']}
                     label={{ value: 'Температура (°C)', angle: -90, position: 'insideLeft', fontSize: 9 }}
                   />
                   <Tooltip 
                      content={<CustomTooltipThermal />}
                    />
                   <Line 
                     type="monotone" 
                     dataKey="T" 
                     stroke="#BE123C" 
                     strokeWidth={3}
                     dot={false}
                     animationDuration={1000}
                   />
                </LineChart>
             </ResponsiveContainer>
          </div>

          <ExportToolbar 
            chartData={data}
            elementIdToCapture="thermal-chart"
            currentParameters={{
              'Линейна мощност': `${power} W/cm`,
              'Температура на охладителя': `${bulk} °C`,
              'Материал': 'UO₂ / Циркалой-4'
            }}
            filenameBase="Thermal_Analysis_Report"
          />
        </div>

        <div className="xl:col-span-4 space-y-8">
           <div className="academic-card p-8 space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-academic-thermal">Критични температури</h3>
              
              <div className="space-y-6">
                 <TempStat 
                   label="Център на таблетката" 
                   value={data[0]?.T} 
                   limit={2800} 
                   subLabel="Точка на топене UO₂: ~2800°C"
                 />
                 <TempStat 
                   label="Повърхност на горивото" 
                   value={data.find(d => d.r === 0.41)?.T || 0} 
                   limit={1200}
                   subLabel="Важно за отделяне на ГПД"
                 />
                 <TempStat 
                   label="Външна повърхност на обвивката" 
                   value={data.find(d => d.r === 0.475)?.T || 0} 
                   limit={350}
                   subLabel="Опасност от окисление > 400°C"
                 />
              </div>

              <div className="pt-6 border-t border-academic-border">
                 <div className="flex items-center gap-2 mb-3 text-secondary-text">
                    <Info className="w-4 h-4" />
                    <h4 className="text-[9px] font-bold uppercase tracking-widest">Бележки по безопасността</h4>
                 </div>
                 <p className="text-[10px] text-gray-500 italic leading-relaxed">
                    Основен ограничаващ фактор е температурата в центъра на таблетката. Тя не трябва да достига точка на топене, за да се предотврати загуба на херметичност и разрушаване на ТВЕЛ-а.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const TempStat: React.FC<{ label: string; value: number; limit: number; subLabel: string }> = ({ label, value, limit, subLabel }) => {
  const ratio = value / limit;
  const isDanger = ratio > 0.85;

  return (
    <div className="space-y-2">
       <div className="flex justify-between items-end">
          <span className="text-[9px] font-bold uppercase text-gray-400 max-w-[150px] leading-tight">{label}</span>
          <div className="flex items-baseline gap-1">
             <span className={`text-xl font-mono font-bold ${isDanger ? 'text-red-600' : 'text-academic-text dark:text-gray-200'}`}>
                {value.toFixed(0)}
              </span>
             <span className="text-[9px] font-bold text-gray-400">°C</span>
          </div>
       </div>
       <div className="h-1 bg-gray-100 dark:bg-academic-border rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(ratio * 100, 100)}%` }}
            className={`h-full ${isDanger ? 'bg-red-500' : 'bg-academic-thermal'}`}
          />
       </div>
       <p className="text-[8px] text-gray-400 italic">{subLabel}</p>
    </div>
  );
};
