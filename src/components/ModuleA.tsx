import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import { motion } from 'motion/react';
import { Info, ArrowRight } from 'lucide-react';
import 'katex/dist/katex.min.css';

export const ModuleA: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 pt-4">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8"
      >
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Info className="w-4 h-4" />
            <h2 className="text-[10px] uppercase tracking-widest font-bold">Основи</h2>
          </div>
          <h1 className="text-3xl font-light tracking-tight">Уравнение на преноса и Закон на Фик</h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
            Уравнението на преноса описва баланса на неутроните в 6-измерно фазово пространство. 
            Тъй като е трудно за решаване, често преминаваме към дифузионно приближение.
          </p>
        </section>

        <section className="space-y-6">
          <div className="math-block">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 font-bold italic">Закон на Фик (Fick's Law)</div>
            <BlockMath math="\mathbf{J}(\mathbf{r}, t) = -D \nabla \Phi(\mathbf{r}, t)" />
            <p className="text-xs text-gray-400 mt-4 italic border-l-2 border-gray-100 pl-4">
              Неутроните текат от области с висока плътност към области с ниска плътност.
            </p>
          </div>

          <div className="math-block">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-4 font-bold italic">Дифузионно уравнение</div>
            <BlockMath math="\frac{1}{v}\frac{\partial \Phi}{\partial t} - D\nabla^2\Phi + \Sigma_a\Phi = S" />
          </div>
        </section>
      </motion.div>

      <div className="relative flex items-center justify-center bg-white border border-gray-50 rounded-sm p-12 overflow-hidden min-h-[400px]">
        {/* Visualization of Fick's Law */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl" />
          </div>
        </div>

        <div className="relative z-10 space-y-8 w-full">
          <div className="flex justify-between items-center px-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-academic-fast/10 rounded-full flex items-center justify-center shadow-inner">
                <div className="w-4 h-4 bg-academic-fast rounded-full animate-pulse" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-academic-fast">Висок поток</div>
            </div>

            <div className="flex-1 flex justify-center px-8">
              <div className="w-full h-[2px] bg-gray-100 relative overflow-hidden">
                <motion.div 
                  animate={{ x: [0, 200] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute top-0 left-0 w-8 h-full bg-academic-fast/30 blur-sm"
                />
                <div className="absolute -right-1 -top-1">
                  <ArrowRight className="w-3 h-3 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 border border-dashed border-gray-200 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-200 rounded-full" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Нисък поток</div>
            </div>
          </div>

          <div className="bg-academic-bg border border-academic-border p-6 rounded-sm">
            <h4 className="text-[10px] uppercase font-bold tracking-widest mb-4">Физическа интуиция</h4>
            <ul className="text-xs text-gray-500 space-y-3">
              <li className="flex gap-3">
                <span className="text-academic-fast font-bold italic">01</span>
                Дифузията е възможна само при слабо поглъщане.
              </li>
              <li className="flex gap-3">
                <span className="text-academic-fast font-bold italic">02</span>
                <InlineMath math="\mathbf{J}" /> е вектор, сочещ по посока на най-бързото намаляване на потока.
              </li>
              <li className="flex gap-3">
                <span className="text-academic-fast font-bold italic">03</span>
                Коефициентът <InlineMath math="D" /> зависи от макроскопичното транспортно сечение.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
