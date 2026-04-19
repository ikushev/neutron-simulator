import React, { useMemo, useEffect } from 'react';
import { useSim } from '../context/SimContext';
import { calculatePointKinetics, checkSafetyLimits } from '../utils/physics';
import { 
  AreaChart, Area, XAxis as RechartsXAxis, YAxis as RechartsYAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Activity, Info, TrendingUp, ShieldAlert, Thermometer, Gauge } from 'lucide-react';
import { ExportToolbar } from './ExportToolbar';

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-academic-text text-white p-4 shadow-2xl rounded-sm border-none opacity-95 backdrop-blur-md">
        <p className="text-[9px] uppercase tracking-widest text-gray-400 border-b border-white/10 pb-2 mb-2">
          Време: {label} s
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[11px] font-bold" style={{ color: entry.color }}>
               {entry.name.includes('%') ? <InlineMath math="P(t) [%]" /> : <InlineMath math="\rho_{fb}" />}
               <span className="text-white">: {entry.value.toFixed(entry.name.includes('%') ? 1 : 5)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const KineticsModule: React.FC = () => {
  const { state, updateState, role, isDetached } = useSim();
  const rhoControl = state.rhoControl ?? 0.0005;
  
  const kineticsFeedback = useMemo(() => ({
    alphaF: state.dopplerAlpha || -0.00003,
    alphaC: state.moderatorAlpha || -0.0002,
    scram: state.scram
  }), [state.dopplerAlpha, state.moderatorAlpha, state.scram]);

  const data = useMemo(() => 
    calculatePointKinetics(rhoControl, 30, kineticsFeedback), 
    [rhoControl, kineticsFeedback]
  );

  const lastPoint = data[data.length - 1] || { power: 100, tf: 500, tc: 280, fbRho: 0 };
  
  // Real-time safety check
  useEffect(() => {
    const safety = checkSafetyLimits(lastPoint.power, lastPoint.tf);
    if (safety.scram && !state.scram) {
      updateState({ scram: true });
    }
  }, [lastPoint.power, lastPoint.tf, state.scram]);

  const totalRho = (rhoControl) + lastPoint.fbRho + (state.scram ? -0.05 : 0);

  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto">
      {/* Аварийна защита (АЗ) HUD */}
      <AnimatePresence>
        {state.scram && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 p-4 bg-red-600 text-white rounded-sm shadow-2xl border-2 border-red-400 animate-pulse"
          >
             <ShieldAlert className="w-8 h-8 fill-white/20" />
             <div>
                <h2 className="text-sm font-black uppercase tracking-tighter">АВАРИЙНА ЗАЩИТА (АЗ) АКТИВИРАНА</h2>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest whitespace-nowrap">Автоматично прекъсване на верижната реакция</p>
             </div>
             <button 
               onClick={() => updateState({ scram: false, rhoControl: 0.0005 })}
               className="ml-4 px-4 py-2 bg-white text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors rounded-sm"
             >
               НУЛИРАНЕ
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-end border-b border-academic-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-academic-fast">
             <Zap className="w-5 h-5" />
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Реакторна Кинетика v4.0</h3>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-academic-text dark:text-gray-100">Свързана Динамика и Обратни връзки</h1>
          <p className="text-xs text-secondary-text font-medium italic dark:text-gray-400">Симулация на мощността с отчитане на Доплеров ефект и температурен коефициент на забавителя</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Реактивност на СУЗ (ρ_ext)</span>
           <div className="flex items-center gap-4">
              <span className="text-xl font-mono text-academic-fast font-bold">{rhoControl >= 0 ? '+' : ''}{rhoControl.toFixed(4)}</span>
              <input 
                type="range" min="-0.005" max="0.005" step="0.0001" 
                value={rhoControl} 
                onChange={(e) => updateState({ rhoControl: Number(e.target.value) })}
                className="accent-academic-fast w-32"
                disabled={state.scram || (role === 'student' && !isDetached)}
              />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-8">
          {/* Chart Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                 <Activity className="w-4 h-4" />
                 <h2 className="text-[10px] uppercase tracking-widest font-bold">Относителна мощност и Обратна връзка</h2>
              </div>
              {state.scram && <span className="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-950/20 px-3 py-1 rounded-full animate-pulse border border-red-200 dark:border-red-900/50">АЗ АКТИВИРАНА</span>}
            </div>
            
            <div id="kinetics-chart" className="h-[450px] academic-card p-10 relative overflow-hidden bg-white dark:bg-academic-bg">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                     <defs>
                        <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3730A3" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3730A3" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="1 6" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                     <RechartsXAxis 
                       dataKey="t" 
                       tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                       axisLine={false}
                       label={{ value: 'Време (сек)', position: 'insideBottom', offset: -5, fontSize: 9 }}
                     />
                     <RechartsYAxis 
                       tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                       axisLine={false}
                       label={{ value: 'Мощност [%]', angle: -90, position: 'insideLeft', fontSize: 9 }}
                     />
                     <Tooltip 
                       content={<CustomTooltip />}
                     />
                     <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                     <Area 
                       name="Мощност [%]"
                       type="monotone" 
                       dataKey="power" 
                       stroke="#3730A3" 
                       fill="url(#colorPower)"
                       strokeWidth={2.5}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>

          <ExportToolbar 
            chartData={data}
            elementIdToCapture="kinetics-chart"
            currentParameters={{
              'Внесена реактивност': rhoControl.toFixed(5),
              'Доплеров коеф.': state.dopplerAlpha,
              'Коеф. забавител': state.moderatorAlpha,
              'АЗ Статус': state.scram ? 'АКТИВНА' : 'НОРМАЛЕН'
            }}
            filenameBase="Reactor_Dynamics_V4_Report"
          />
        </div>

        <div className="xl:col-span-4 space-y-8">
           {/* Reactivity Balance Meter */}
           <div className="academic-card p-8 space-y-8">
              <div className="flex items-center gap-2">
                 <Gauge className="w-5 h-5 text-academic-fast" />
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-academic-text dark:text-gray-100">Баланс на реактивността</h3>
              </div>

              <div className="space-y-6">
                 <ReactivityBar label="Управляващи органи (СУЗ)" value={rhoControl} max={0.005} color="bg-indigo-500" />
                 <ReactivityBar label="Доплеров ефект (Гориво)" value={lastPoint.fbRho * 0.3} max={0.005} color="bg-amber-500" />
                 <ReactivityBar label="Забавител (Температура)" value={lastPoint.fbRho * 0.7} max={0.005} color="bg-blue-500" />
                 {state.scram && <ReactivityBar label="АЗ (Стержени за безопасност)" value={-0.05} max={0.05} color="bg-red-600" />}
                 
                 <div className="pt-6 border-t border-academic-border">
                    <div className="flex justify-between items-baseline mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-academic-text dark:text-gray-200">СУМАРНА РЕАКТИВНОСТ</span>
                       <span className={`text-lg font-mono font-bold ${totalRho >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {totalRho >= 0 ? '+' : ''}{totalRho.toFixed(5)}
                       </span>
                    </div>
                    <p className="text-[9px] text-gray-400 italic font-medium leading-relaxed">
                       Когато сумарната реактивност е 0, реакторът е в стационарно състояние (критичен).
                    </p>
                 </div>
              </div>
           </div>

           {/* Thermal Stats Overlay */}
           <div className="academic-card p-8 bg-gray-50 dark:bg-academic-border/20 border-none space-y-6">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-academic-thermal" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-academic-text dark:text-gray-200">Термични показатели</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">T_гориво</span>
                    <div className="text-xl font-mono text-academic-text dark:text-gray-100">{lastPoint.tf.toFixed(0)}°C</div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">T_охладител</span>
                    <div className="text-xl font-mono text-academic-text dark:text-gray-100">{lastPoint.tc.toFixed(0)}°C</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ReactivityBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => {
  const width = Math.min((Math.abs(value) / max) * 100, 100);
  return (
    <div className="space-y-2">
       <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
          <span>{label}</span>
          <span className="font-mono">{value >= 0 ? '+' : ''}{value.toFixed(5)}</span>
       </div>
       <div className="h-1.5 bg-gray-100 dark:bg-academic-border rounded-full overflow-hidden flex">
          {value < 0 && <div className="flex-1" />}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${width / 2}%` }}
            className={`h-full ${color} rounded-full`}
          />
          {value >= 0 && <div className="flex-1" />}
       </div>
    </div>
  );
};
