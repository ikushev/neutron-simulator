import React, { useMemo } from 'react';
import { useSim } from '../context/SimContext';
import { calculateFermiAgeDistribution } from '../utils/physics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BlockMath, InlineMath } from 'react-katex';
import { motion } from 'motion/react';
import { Clock, Waves } from 'lucide-react';
import 'katex/dist/katex.min.css';

export const ModuleC: React.FC = () => {
  const { state, updateState, role, isDetached } = useSim();
  const tau = state.fermiAge || 20;
  
  const data = useMemo(() => calculateFermiAgeDistribution(tau), [tau]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-8 pt-4">
      {/* Controls */}
      <div className="lg:col-span-4 space-y-10 border-r border-gray-100 pr-10">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <h2 className="text-[10px] uppercase tracking-widest font-bold">Забавяне</h2>
          </div>
          <h1 className="text-2xl font-light tracking-tight">Възрастово приближение на Ферми</h1>
        </header>

        <section className="p-6 bg-white border border-gray-100 shadow-sm rounded-sm space-y-4">
          <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest italic">Математически модел</h3>
          <div className="py-2">
            <BlockMath math="q(r, \tau) = \frac{e^{-r^2 / 4\tau}}{(4\pi\tau)^{3/2}}" />
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed font-medium italic">
            Този модел описва плътността на забавяне <InlineMath math="q" /> от точков източник в безкрайна среда. 
            Променливата <InlineMath math="\tau" /> замества реалното време.
          </p>
        </section>

        <section className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Ферми-възраст (<InlineMath math="\tau" />)</label>
              <span className="text-xl font-mono text-academic-fast font-light">{tau.toFixed(1)} cm²</span>
            </div>
            <input 
              type="range" min="5" max="500" step="1" 
              value={tau}
              disabled={role === 'student' && !isDetached}
              onChange={(e) => updateState({ fermiAge: Number(e.target.value) })}
              className="w-full accent-academic-fast"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-gray-50 bg-white/50 rounded-sm">
              <div className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">√τ (cm)</div>
              <div className="text-lg font-light tracking-tighter">{(Math.sqrt(tau)).toFixed(2)}</div>
            </div>
            <div className="p-4 border border-gray-50 bg-white/50 rounded-sm text-right">
              <div className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">Lₛ (cm)</div>
              <div className="text-lg font-light tracking-tighter">{(Math.sqrt(tau)).toFixed(2)}</div>
            </div>
          </div>
        </section>

        {role === 'student' && (
          <div className="p-4 bg-academic-bg border border-dashed border-academic-border text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center italic">
            {isDetached ? 'Режим „Студент“: Самостоятелно изследване' : 'Режим „Студент“: Преглед на живо'}
          </div>
        )}
      </div>

      {/* Visuals */}
      <div className="lg:col-span-8 flex flex-col items-center justify-center p-8 bg-white border border-gray-50 rounded-sm relative overflow-hidden min-h-[500px]">
        {/* Background Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
            className="w-[500px] h-[500px] bg-indigo-200 rounded-full blur-3xl"
          />
        </div>

        <div className="z-10 w-full mb-12">
          <div className="flex items-center gap-2 mb-4 text-gray-300">
            <Waves className="w-4 h-4" />
            <h3 className="text-[10px] uppercase tracking-widest font-bold font-mono italic">Radial Density Mapping</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3730A3" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3730A3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 6" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="r" hide />
                <YAxis hide domain={[0, 0.005]} />
                <Tooltip 
                   contentStyle={{ borderRadius: '0', border: '1px solid #E5E7EB', fontSize: '10px' }}
                   labelFormatter={(r) => `Разстояние: ${r} cm`}
                />
                <Area 
                  type="monotone" 
                  dataKey="q" 
                  stroke="#3730A3" 
                  fillOpacity={1} 
                  fill="url(#colorQ)" 
                  strokeWidth={2}
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2D Cloud representation */}
        <div className="relative flex flex-col items-center justify-center w-[300px] h-[300px] bg-academic-bg border border-dashed border-gray-100 rounded-full">
           <div className="z-20 w-1.5 h-1.5 bg-black rounded-full shadow-lg" />
           <div className="absolute z-10 text-[9px] uppercase tracking-[0.4em] font-bold text-gray-300 mt-12 italic">Source Point</div>
           
           <motion.div 
             animate={{ 
               scale: Math.sqrt(tau) / 6,
               opacity: 0.1 + (1 / (tau * 0.1 + 1)) 
             }}
             transition={{ type: "spring", stiffness: 40, damping: 20 }}
             className="absolute bg-academic-fast rounded-full blur-3xl opacity-20"
             style={{ width: '100px', height: '100px' }}
           />
           
           <motion.div 
             animate={{ 
               scale: Math.sqrt(tau) / 3,
               opacity: 0.05 
             }}
             transition={{ type: "spring", stiffness: 30, damping: 15 }}
             className="absolute border-2 border-academic-fast/20 rounded-full"
             style={{ width: '100px', height: '100px' }}
           />
        </div>
        
        <p className="text-[10px] text-gray-400 font-medium italic mt-8 uppercase tracking-widest text-center">
          Визуализация на „облака“ на забавяне • Гаусово разпределение
        </p>
      </div>
    </div>
  );
};
