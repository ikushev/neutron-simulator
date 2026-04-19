import React, { useMemo, useState } from 'react';
import { useSim } from '../context/SimContext';
import { calculatePoisonTransients } from '../utils/physics';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Area, AreaChart 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Zap, ArrowRight, Dna, Info } from 'lucide-react';
import { ExportToolbar } from './ExportToolbar';
import { InlineMath } from 'react-katex';

export const PoisoningSim: React.FC = () => {
  const { state } = useSim();
  const [phi, setPhi] = useState(1e13); // Thermal neutron flux
  
  const data = useMemo(() => calculatePoisonTransients(phi), [phi]);

  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-end border-b border-gray-100 dark:border-academic-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-academic-thermal">
             <Clock className="w-5 h-5" />
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Преходни процеси</h3>
          </div>
          <h1 className="text-4xl font-light tracking-tight dark:text-white">Ядрени отрови и Трансмутация</h1>
          <p className="text-xs text-gray-400 font-medium italic">Динамика на Xe-135 и превръщане на U-238 в Pu-239</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Неутронен Поток (Ф)</span>
           <div className="flex items-center gap-4">
              <span className="text-xl font-mono text-academic-fast">10^{Math.log10(phi).toFixed(0)}</span>
              <input 
                type="range" min="11" max="15" step="0.1" 
                value={Math.log10(phi)} 
                onChange={(e) => setPhi(Math.pow(10, Number(e.target.value)))}
                className="accent-academic-fast w-32"
              />
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Xenon Chart */}
        <div className="xl:col-span-12 space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-gray-400">
                <Zap className="w-4 h-4" />
                <h2 className="text-[10px] uppercase tracking-widest font-bold">Ксенонова „яма“ след спиране (t=10h)</h2>
             </div>
          </div>
          
          <div id="poisoning-chart" className="h-[400px] bg-white dark:bg-academic-bg border border-gray-100 dark:border-academic-border p-10 rounded-sm shadow-sm relative overflow-hidden">
             <div className="absolute right-10 top-10 flex gap-4 text-[9px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 text-academic-thermal">
                   <div className="w-2 h-2 bg-academic-thermal rounded-full" /> Xe-135
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                   <div className="w-2 h-2 bg-gray-400 rounded-full" /> I-135
                </div>
             </div>

             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                   <CartesianGrid strokeDasharray="1 6" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                   <XAxis 
                     dataKey="t" 
                     tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                     axisLine={false}
                     label={{ value: 'Време (часове)', position: 'insideBottom', offset: -5, fontSize: 9 }}
                   />
                   <YAxis 
                     tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                     axisLine={false}
                     label={{ value: 'Концентрация (отн. ед.)', angle: -90, position: 'insideLeft', fontSize: 9 }}
                   />
                   <Tooltip 
                     contentStyle={{ borderRadius: '0', border: '1px solid #E5E7EB', fontSize: '10px' }}
                     labelFormatter={(t) => `Време: ${t} ч.`}
                   />
                   <ReferenceLine x={10} stroke="#3730A3" strokeDasharray="3 3" label={{ value: 'Спиране', position: 'top', fontSize: 8, fill: '#3730A3' }} />
                   
                   <Area 
                     type="monotone" 
                     dataKey="xenon" 
                     stroke="#BE123C" 
                     fill="#BE123C" 
                     fillOpacity={0.05} 
                     strokeWidth={2}
                     animationDuration={1000}
                   />
                   <Area 
                     type="monotone" 
                     dataKey="iodine" 
                     stroke="#9CA3AF" 
                     fill="transparent" 
                     strokeWidth={1.5} 
                     strokeDasharray="4 4"
                   />
                </AreaChart>
             </ResponsiveContainer>
          </div>

          <ExportToolbar 
            chartData={data}
            elementIdToCapture="poisoning-chart"
            currentParameters={{
              'Неутронен Поток (Ф)': `10^${Math.log10(phi).toFixed(1)} n/cm²s`,
              'Време на симулация': '72 часа',
              'Момент на спиране': '10 часа (t=10)'
            }}
            filenameBase="Xenon_Transient_Report"
          />
        </div>

        {/* Transmutation Visualizer */}
        <div className="xl:col-span-8 space-y-6">
           <header className="flex items-center gap-2 text-gray-400">
              <Dna className="w-4 h-4" />
              <h2 className="text-[10px] uppercase tracking-widest font-bold">Превръщане на U-238 в Pu-239</h2>
           </header>
           
           <div className="bg-white dark:bg-academic-bg border border-gray-100 dark:border-academic-border p-12 rounded-sm shadow-sm flex items-center justify-between relative overflow-hidden h-[300px]">
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                 <div className="absolute top-1/2 left-0 w-full h-px bg-academic-fast" />
              </div>

              <IsotopeNode name="U-238" mass="238" type="Гориво" />
              <div className="flex flex-col items-center gap-2 text-academic-fast">
                 <span className="text-[9px] font-bold uppercase tracking-widest">(n, γ)</span>
                 <ArrowRight className="w-5 h-5 animate-pulse" />
              </div>
              
              <IsotopeNode name="U-239" mass="239" type="Нестабилен" decay="β⁻" />
              <ArrowRight className="w-5 h-5 text-gray-200" />
              
              <IsotopeNode name="Np-239" mass="239" type="Нестабилен" decay="β⁻" />
              <ArrowRight className="w-5 h-5 text-gray-200" />
              
              <IsotopeNode name="Pu-239" mass="239" type="Делящ се" />
           </div>
        </div>

        {/* Fact Sidebar */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-academic-bg dark:bg-academic-border/20 border border-gray-100 dark:border-academic-border p-8 rounded-sm space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-academic-thermal">Знаехте ли че?</h3>
              <p className="text-xs text-gray-500 leading-relaxed italic font-medium">
                „Ксеноновата яма е причината за невъзможността за рестарт на реактор веднага след спиране. 
                Xe-135 достига своя пик около 10-12 часа след изключване, поглъщайки всички налични неутрони.“
              </p>
              <div className="pt-6 border-t border-gray-100 dark:border-academic-border">
                 <div className="flex items-start gap-3">
                    <div className="p-2 bg-white dark:bg-academic-border rounded-full">
                       <Info className="w-4 h-4 text-academic-fast" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-[9px] font-bold uppercase tracking-widest">Протокол 09-X</h4>
                       <p className="text-[10px] text-gray-400 font-medium italic">
                          Огромното сечение на Xe-135 (2.6 милиона барна) е резултат от „резонанс“ в структурата на ядрото.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const IsotopeNode: React.FC<{ name: string; mass: string; type: string; decay?: string }> = ({ name, mass, type, decay }) => (
  <motion.div 
    whileHover={{ scale: 1.05 }}
    className="flex flex-col items-center gap-4 relative z-10"
  >
    <div className="w-20 h-20 bg-white dark:bg-academic-border border border-gray-100 dark:border-white/5 shadow-xl rounded-full flex items-center justify-center flex-col relative overflow-hidden group">
       <div className="text-xs font-bold font-mono tracking-tighter">{name}</div>
       <div className="text-[8px] font-bold text-gray-400">{type}</div>
       {decay && (
         <div className="absolute top-0 right-0 p-1 bg-academic-thermal text-white text-[8px] font-bold">
            {decay}
         </div>
       )}
       <div className="absolute inset-0 bg-academic-fast/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="text-[11px] font-mono italic text-gray-300">A = {mass}</div>
  </motion.div>
);
