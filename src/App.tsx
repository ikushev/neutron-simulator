/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSim } from './context/SimContext';
import { EntryScreen } from './components/EntryScreen';
import { Layout } from './components/Layout';
import { ModuleA } from './components/ModuleA';
import { ModuleB } from './components/ModuleB';
import { ModuleC } from './components/ModuleC';
import { MaterialCompositor } from './components/MaterialCompositor';
import { PoisoningSim } from './components/PoisoningSim';
import { ConstantsTable } from './components/ConstantsTable';
import { KineticsModule } from './components/KineticsModule';
import { ThermalModule } from './components/ThermalModule';
import { QuizPanel } from './components/Quiz.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CheckCircle } from 'lucide-react';

const WaitingScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400 font-medium italic p-20 text-center bg-gray-50/30 dark:bg-academic-bg">
    <motion.div 
      animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="mb-8"
    >
      <ShieldAlert className="w-16 h-16 text-academic-fast/20" />
    </motion.div>
    <div className="text-[10px] uppercase tracking-[0.3em] mb-4 bg-gray-100 dark:bg-white/5 py-1 px-3 rounded-full inline-block text-gray-400">Свързване...</div>
    <h1 className="text-3xl font-light tracking-tight text-academic-text dark:text-gray-200">Очаква се старт от преподавател</h1>
    <p className="mt-4 text-[11px] max-w-xs mx-auto leading-relaxed text-gray-400">
      Вашата сесия е активна. Симулацията ще започне веднага щом преподавателят извърши конфигурация.
    </p>
  </div>
);

export default function App() {
  const { role, state } = useSim();
  const [activeTab, setActiveTab] = useState('transport');
  const [toast, setToast] = useState<string | null>(null);

  // Success Toast Logic
  useEffect(() => {
    // We can expose a trigger for this via props or context in a real app, 
    // but for simplicity we'll just check for state changes that imply "Loaded/Saved"
  }, [state]);

  if (!role) {
    return <EntryScreen />;
  }

  // Simple waiting logic: if the list of materials is zeroed or initial, and student is waiting
  const isWaiting = role === 'student' && state.materials && state.materials.length === 0;

  const renderContent = () => {
    if (isWaiting) return <WaitingScreen />;
    switch (activeTab) {
      case 'transport': return <ModuleA />;
      case 'fdm': return <ModuleB />;
      case 'fermi': return <ModuleC />;
      case 'compositor': return <MaterialCompositor />;
      case 'poisoning': return <PoisoningSim />;
      case 'multigroup': return <ConstantsTable />;
      case 'kinetics': return <KineticsModule />;
      case 'thermal': return <ThermalModule />;
      default: return <ModuleA />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {renderContent()}
        </div>
        <QuizPanel />
      </div>
    </Layout>
  );
}

