import React, { useMemo } from 'react';
import { useSim } from '../context/SimContext';
import { solveSteadyStateDiffusion, solve2DDiffusion, solveTwoGroupDiffusion } from '../utils/physics';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, ScatterChart, Scatter, ZAxis, Legend, Cell 
} from 'recharts';
import { InlineMath, BlockMath } from 'react-katex';
import { Settings2, AreaChart as ChartIcon, Box, Maximize2 } from 'lucide-react';
import { ExportToolbar } from './ExportToolbar';
import 'katex/dist/katex.min.css';

const CustomTooltip1D: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-academic-text text-white p-4 shadow-2xl rounded-sm border-none opacity-95 backdrop-blur-md">
        <p className="text-[9px] uppercase tracking-widest text-gray-400 border-b border-white/10 pb-2 mb-2">
          Позиция: {label} cm
        </p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[11px] font-bold" style={{ color: entry.color }}>
               <InlineMath math={entry.name.includes('Бързи') ? '\\Phi_1(x)' : entry.name.includes('Топлинни') ? '\\Phi_2(x)' : '\\Phi(x)'} />
               <span className="text-white">: {entry.value.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ModuleB: React.FC = () => {
  const { state, updateState, role, isDetached } = useSim();
  
  const is2D = state.geometry === '2D';
  const isMulti = state.constants && state.constants.length >= 2;

  const data1D = useMemo(() => 
    (!is2D && !isMulti) ? solveSteadyStateDiffusion(state.L, state.D, state.sigmaA, state.source) : [],
    [is2D, isMulti, state.L, state.D, state.sigmaA, state.source]
  );

  const dataMulti = useMemo(() => {
    if (isMulti && !is2D) {
      const g1 = state.constants![0];
      const g2 = state.constants![1];
      return solveTwoGroupDiffusion(
        state.L, 
        g1.D, g2.D, 
        g1.sigmaA, g2.sigmaA, 
        0.02, // SigmaR1 estimate
        g1.nuSigmaF, g2.nuSigmaF,
        1.0, 60
      );
    }
    return [];
  }, [is2D, isMulti, state.L, state.constants]);

  const data2D = useMemo(() => 
    is2D ? solve2DDiffusion(state.L, state.L, state.D, state.sigmaA, state.source) : [],
    [is2D, state.L, state.D, state.sigmaA, state.source]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 p-8 pt-4">
      {/* Parameters Panel */}
      <div className="lg:col-span-4 space-y-10 border-r border-gray-100 pr-10">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-gray-400">
            <Settings2 className="w-4 h-4" />
            <h2 className="text-[10px] uppercase tracking-widest font-bold">Параметри</h2>
          </div>
          <h1 className="text-2xl font-light tracking-tight">{is2D ? '2D Симулатор на дифузия' : '1D Симулатор на дифузия'}</h1>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-academic-border/20 rounded-sm">
             <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-academic-fast" />
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Геометрия</span>
             </div>
             <div className="flex bg-white dark:bg-academic-bg p-1 rounded-sm border border-gray-100 dark:border-academic-border">
                <button 
                  onClick={() => updateState({ geometry: '1D' })}
                  disabled={role === 'student' && !isDetached}
                  className={`px-3 py-1 text-[9px] font-bold tracking-widest uppercase transition-all ${!is2D ? 'bg-academic-fast text-white shadow-sm' : 'text-gray-400'}`}
                >
                  1D (Slab)
                </button>
                <button 
                  onClick={() => updateState({ geometry: '2D' })}
                  disabled={role === 'student' && !isDetached}
                  className={`px-3 py-1 text-[9px] font-bold tracking-widest uppercase transition-all ${is2D ? 'bg-academic-fast text-white shadow-sm' : 'text-gray-400'}`}
                >
                  2D (Cyl)
                </button>
             </div>
          </div>
        </section>

        <div className="math-block">
          {is2D ? (
            <BlockMath math="-D(\frac{\partial^2\Phi}{\partial x^2} + \frac{\partial^2\Phi}{\partial y^2}) + \Sigma_a\Phi = S" />
          ) : (
            <BlockMath math="-D\nabla^2\Phi + \Sigma_a\Phi = S" />
          )}
        </div>

        <section className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group flex items-center gap-2">
                Ширина (L)
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-0.5 rounded text-[8px] font-normal">cm</span>
              </label>
              <span className="text-xl font-mono text-academic-text font-light">{state.L}</span>
            </div>
            <input 
              type="range" min="10" max="300" step="1" 
              value={state.L}
              disabled={role === 'student' && !isDetached}
              onChange={(e) => updateState({ L: Number(e.target.value) })}
              className="w-full accent-academic-fast"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group flex items-center gap-2">
                Поглъщане (<InlineMath math="\Sigma_a" />)
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-0.5 rounded text-[8px] font-normal">cm⁻¹</span>
              </label>
              <span className="text-xl font-mono text-academic-thermal font-light">{state.sigmaA.toFixed(3)}</span>
            </div>
            <input 
              type="range" min="0.001" max="0.5" step="0.001" 
              value={state.sigmaA}
              disabled={role === 'student' && !isDetached}
              onChange={(e) => updateState({ sigmaA: Number(e.target.value) })}
              className="w-full accent-academic-thermal"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Коеф. Дифузия (D)</label>
              <span className="text-xl font-mono text-academic-fast font-light">{state.D.toFixed(2)}</span>
            </div>
            <input 
              type="range" min="0.1" max="2.0" step="0.01" 
              value={state.D}
              disabled={role === 'student' && !isDetached}
              onChange={(e) => updateState({ D: Number(e.target.value) })}
              className="w-full accent-academic-fast"
            />
          </div>
        </section>

        {role === 'student' && (
          <div className="p-4 bg-academic-bg border border-dashed border-academic-border text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center italic">
            {isDetached ? 'Режим „Студент“: Самостоятелно изследване' : 'Режим „Студент“: Преглед на живо'}
          </div>
        )}
      </div>

      {/* Main Plot Area */}
      <div className="lg:col-span-8 space-y-6">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-400">
            <ChartIcon className="w-4 h-4" />
            <h2 className="text-[10px] uppercase tracking-widest font-bold">Разпределение на Потока (\Phi)</h2>
          </div>
          <div className="text-[10px] tracking-widest text-gray-300 uppercase italic font-bold">
            {is2D ? '2D Rectangular Mesh' : '1D Slab Geometry'}
          </div>
        </header>

        <div id="fdm-chart" className="h-[450px] w-full bg-white dark:bg-academic-bg border border-gray-50 dark:border-academic-border p-8 shadow-sm rounded-sm relative">
          <ResponsiveContainer width="100%" height="100%">
            {is2D ? (
              <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="1 6" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                <XAxis 
                   dataKey="x" name="x" unit="cm" type="number"
                   tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                   axisLine={false}
                />
                <YAxis 
                   dataKey="y" name="y" unit="cm" type="number"
                   tick={{ fontSize: 9, fill: '#9CA3AF' }} 
                   axisLine={false}
                />
                <ZAxis dataKey="phi" range={[20, 400]} name="Flux" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ borderRadius: 0, border: 'none', fontSize: '10px' }}
                />
                <Scatter data={data2D} fill="#3730A3" opacity={0.6}>
                  {data2D.map((entry, index) => (
                    <Cell 
                       key={`cell-${index}`} 
                       fill={`rgba(55, 48, 163, ${Math.min(0.2 + entry.phi * 0.5, 1)})`} 
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            ) : isMulti ? (
              <LineChart data={dataMulti} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="1 6" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="x" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false}
                  label={{ value: 'x [cm]', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#9CA3AF' }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} />
                <Tooltip content={<CustomTooltip1D />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="phiFast" name="Бързи неутрони" stroke="#3730A3" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="phiThermal" name="Топлинни неутрони" stroke="#BE123C" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <LineChart data={data1D} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="1 6" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="x" 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                  axisLine={{ stroke: '#F3F4F6' }}
                  label={{ value: 'x [cm]', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#9CA3AF', fontStyle: 'italic' }}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  axisLine={{ stroke: '#F3F4F6' }}
                  label={{ value: 'Φ(x)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9CA3AF', fontStyle: 'italic' }}
                  domain={[0, 'auto']}
                />
                <Tooltip 
                  content={<CustomTooltip1D />}
                />
                <ReferenceLine y={0} stroke="#F3F4F6" />
                <Line 
                  type="monotone" 
                  dataKey="phi" 
                  stroke="#3730A3" 
                  strokeWidth={2.5} 
                  dot={false}
                  animationDuration={0}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <ExportToolbar 
          chartData={is2D ? data2D : data1D}
          elementIdToCapture="fdm-chart"
          currentParameters={{
            'Геометрия': is2D ? '2D Rectangular' : '1D Slab',
            'Ширина (L)': `${state.L} cm`,
            'Коеф. Дифузия (D)': state.D.toFixed(3),
            'Поглъщане (Σa)': state.sigmaA.toFixed(4)
          }}
          filenameBase={is2D ? "FDM_2D_Analysis" : "FDM_1D_Analysis"}
        />

        <footer className="grid grid-cols-2 gap-8 text-[10px] text-gray-400 font-medium leading-relaxed italic border-t border-gray-50 pt-8">
          <p>
            Наблюдавайте физическият ефект на „изпъкване“ към центъра. 
            Колкото по-висок е <InlineMath math="\Sigma_a" />, толкова по-бързо затихва потокът към границите.
          </p>
          <p className="text-right">
            Метод на крайните разлики (FDM)<br/>
            Уравнение на дифузията в стационарно състояние
          </p>
        </footer>
      </div>
    </div>
  );
};
