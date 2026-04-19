import React, { useMemo } from 'react';
import { useSim } from '../context/SimContext';
import { Material, MaterialType } from '../types';
import { calculateMixtureProperties } from '../utils/physics';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Info, Lightbulb, Beaker } from 'lucide-react';
import { InlineMath } from 'react-katex';

export const MaterialCompositor: React.FC = () => {
  const { state, updateState, role, isDetached } = useSim();
  const materials = state.materials || [];

  const { totalSigmaA, totalSigmaF, totalSigmaS } = useMemo(() => 
    calculateMixtureProperties(materials), 
    [materials]
  );

  const addMaterial = () => {
    const newMat: Material = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'Охладител',
      name: 'Нов материал',
      density: 1.0,
      atomicMass: 1.0,
      sigmaA: 0,
      sigmaF: 0,
      sigmaS: 0,
      fraction: 0
    };
    updateState({ materials: [...materials, newMat] });
  };

  const removeMaterial = (id: string) => {
    updateState({ materials: materials.filter(m => m.id !== id) });
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    updateState({
      materials: materials.map(m => m.id === id ? { ...m, ...updates } : m)
    });
  };

  const isDisabled = role === 'student' && !isDetached;

  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-end border-b border-gray-100 pb-8 transition-colors duration-300">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-academic-fast">
             <Beaker className="w-5 h-5" />
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Ядрена Химия</h3>
          </div>
          <h1 className="text-4xl font-light tracking-tight dark:text-white">Композитор на активната зона</h1>
          <p className="text-xs text-gray-400 font-medium italic">Дефинирайте хомогенна смес от изотопи и материали</p>
        </div>
        
        {!isDisabled && (
          <button 
            onClick={addMaterial}
            className="flex items-center gap-2 px-6 py-3 bg-academic-fast text-white text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all rounded-sm shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            <Plus className="w-4 h-4" />
            Добави материал
          </button>
        )}
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Materials List */}
        <div className="xl:col-span-8 space-y-6">
          <AnimatePresence>
            {materials.map((mat, index) => (
              <motion.div
                key={mat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="academic-card p-8 relative group"
              >
                {!isDisabled && (
                  <button 
                    onClick={() => removeMaterial(mat.id)}
                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Тип и Име</label>
                    <select 
                      value={mat.type}
                      disabled={isDisabled}
                      onChange={(e) => updateMaterial(mat.id, { type: e.target.value as MaterialType })}
                      className="w-full academic-input p-3 text-xs font-bold uppercase tracking-widest"
                    >
                      <option className="bg-white dark:bg-academic-bg">Гориво</option>
                      <option className="bg-white dark:bg-academic-bg">Забавител</option>
                      <option className="bg-white dark:bg-academic-bg">Охладител</option>
                      <option className="bg-white dark:bg-academic-bg">Поглътител</option>
                    </select>
                    <input 
                      type="text"
                      value={mat.name}
                      disabled={isDisabled}
                      onChange={(e) => updateMaterial(mat.id, { name: e.target.value })}
                      placeholder="Изотоп / Елемент"
                      className="w-full border-b border-academic-border bg-transparent py-2 text-lg font-light focus:border-academic-fast focus:ring-0 outline-none text-academic-text"
                    />
                  </div>

                  <div className="space-y-6">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Физични параметри</label>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-medium">ρ (g/cm³)</span>
                          <input 
                             type="number" step="0.1" value={mat.density}
                             disabled={isDisabled}
                             onChange={(e) => updateMaterial(mat.id, { density: Number(e.target.value) })}
                             className="w-full academic-input p-2 text-xs font-mono"
                          />
                       </div>
                       <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-medium">A (ат. маса)</span>
                          <input 
                             type="number" step="0.1" value={mat.atomicMass}
                             disabled={isDisabled}
                             onChange={(e) => updateMaterial(mat.id, { atomicMass: Number(e.target.value) })}
                             className="w-full academic-input p-2 text-xs font-mono"
                          />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <div className="flex justify-between">
                         <span className="text-[10px] text-gray-400 font-medium">Дял в сместа (%)</span>
                         <span className="text-[10px] font-bold text-academic-fast">{mat.fraction}%</span>
                       </div>
                       <input 
                          type="range" min="0" max="100" step="1" value={mat.fraction}
                          disabled={isDisabled}
                          onChange={(e) => updateMaterial(mat.id, { fraction: Number(e.target.value) })}
                          className="w-full accent-academic-fast"
                       />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block">Микро сечения (barns)</label>
                    <div className="space-y-3">
                       <InputWithTooltip 
                         label="σₐ (Поглъщане)" 
                         value={mat.sigmaA}
                         onChange={(val) => updateMaterial(mat.id, { sigmaA: val })}
                         disabled={isDisabled}
                         tooltip={{
                           math: "\\sigma_a",
                           simple: "Вероятността ядрото да погълне неутрон и да спре неговото движение.",
                           expert: "Микроскопично сечение на поглъщане (n,γ). Единица: 1 barn = 10⁻²⁴ cm²."
                         }}
                       />
                       <InputWithTooltip 
                         label="σf (Делене)" 
                         value={mat.sigmaF}
                         onChange={(val) => updateMaterial(mat.id, { sigmaF: val })}
                         disabled={isDisabled}
                         tooltip={{
                           math: "\\sigma_f",
                           simple: "Вероятност за предизвикване на ядрено делене и освобождаване на енергия.",
                           expert: "Микроскопично сечение за ядрено делене ( fission )."
                         }}
                       />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Totals & Dashboard */}
        <div className="xl:col-span-4 space-y-8">
           <div className="academic-card p-8 space-y-8 sticky top-10">
              <header>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Резултантни свойства</h3>
                <p className="text-xl font-light tracking-tight">Макроскопични сечения</p>
              </header>

              <div className="space-y-6">
                 <ResultCard 
                    label="Σₐ (Общо поглъщане)" 
                    value={totalSigmaA.toFixed(4)} 
                    unit="cm⁻¹" 
                    color="text-academic-thermal"
                 />
                 <ResultCard 
                    label="Σf (Общо делене)" 
                    value={totalSigmaF.toFixed(4)} 
                    unit="cm⁻¹" 
                    color="text-academic-fast"
                 />
                 <ResultCard 
                    label="Σₛ (Общо разсейване)" 
                    value={totalSigmaS.toFixed(3)} 
                    unit="cm⁻¹" 
                    color="text-gray-500"
                 />
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-academic-border">
                 <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Знаете ли че?</h4>
                 </div>
                 <AnimatePresence mode="wait">
                    <DidYouKnow materials={materials} />
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

const InputWithTooltip: React.FC<{
  label: string;
  value: number;
  disabled: boolean;
  onChange: (val: number) => void;
  tooltip: { math: string; simple: string; expert: string };
}> = ({ label, value, disabled, onChange, tooltip }) => {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-gray-400 font-medium group flex items-center gap-1">
          {label}
          <button 
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            className="text-gray-300 hover:text-academic-fast transition-colors"
          >
            <Info className="w-3 h-3" />
          </button>
        </span>
      </div>
      <input 
        type="number" step="0.1" value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full academic-input p-2 text-xs font-mono"
      />

      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 bottom-full mb-4 w-64 p-4 bg-academic-text text-white text-[10px] rounded-sm shadow-2xl z-50 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
               <InlineMath math={tooltip.math} />
               <span className="text-[8px] uppercase tracking-tighter opacity-50">Физична карта</span>
            </div>
            <div className="space-y-2 leading-relaxed">
               <p><strong className="text-academic-fast">Просто казано:</strong> {tooltip.simple}</p>
               <p className="opacity-70 font-light italic">{tooltip.expert}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResultCard: React.FC<{ label: string; value: string; unit: string; color: string }> = ({ label, value, unit, color }) => (
  <div className="space-y-1">
    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className={`text-4xl font-mono tracking-tighter ${color}`}>{value}</span>
      <span className="text-[10px] text-gray-400 font-bold uppercase">{unit}</span>
    </div>
  </div>
);

const DidYouKnow: React.FC<{ materials: Material[] }> = ({ materials }) => {
  const fact = useMemo(() => {
    if (materials.some(m => m.name.toLowerCase().includes('бор') || m.name.toLowerCase().includes('b-10'))) {
      return "Бор-10 е като „черна дупка“ за топлинни неутрони поради огромното си сечение на поглъщане от 3840 барна!";
    }
    if (materials.some(m => m.name.toLowerCase().includes('u-235'))) {
      return "Уран-235 е единственото естествено делящо се ядро, което поддържа верижна реакция с топлинни неутрони.";
    }
    if (materials.some(m => m.name.toLowerCase().includes('вода') || m.name.toLowerCase().includes('h2o'))) {
      return "Обикновената вода е отличен забавител, но също така поглъща част от неутроните чрез реакцията H(n,γ)D.";
    }
    if (materials.some(m => m.name.toLowerCase().includes('ксенон') || m.name.toLowerCase().includes('xe-135'))) {
      return "Ксенон-135 е най-мощната ядрена отрова с микроскопично сечение от над 2.6 милиона барна!";
    }
    return "Колкото по-висока е плътността на материала, толкова повече ядра има в единица обем, увеличавайки шанса за сблъсък.";
  }, [materials]);

  return (
    <motion.p 
      key={fact}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="text-[11px] text-gray-500 leading-relaxed font-medium italic"
    >
      „{fact}“
    </motion.p>
  );
};
