import React from 'react';
import { useSim } from '../context/SimContext';
import { GroupConstant } from '../types';
import { Plus, Trash2, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ConstantsTable: React.FC = () => {
  const { state, updateConstants, role } = useSim();
  const constants = state.constants || [];
  const isTeacher = role === 'teacher';

  const addRow = () => {
    const newRow: GroupConstant = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Група ${constants.length + 1}`,
      sigmaA: 0.1,
      nuSigmaF: 0.05,
      D: 1.0,
    };
    updateConstants([...constants, newRow]);
  };

  const removeRow = (id: string) => {
    updateConstants(constants.filter((c) => c.id !== id));
  };

  const updateCell = (id: string, field: keyof GroupConstant, value: string | number) => {
    updateConstants(
      constants.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-academic-fast/10 rounded-sm">
            <Hash className="w-4 h-4 text-academic-fast" />
          </div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
            Таблица на груповите константи
          </h2>
        </div>
        
        {isTeacher && (
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-academic-bg border border-gray-100 dark:border-academic-border text-[9px] font-bold uppercase tracking-widest hover:border-academic-fast hover:text-academic-fast transition-all rounded-sm shadow-sm"
          >
            <Plus className="w-3 h-3" />
            Добави група/зона
          </button>
        )}
      </header>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-academic-border">
              <th className="py-4 px-6 text-left text-[9px] font-bold uppercase tracking-widest text-gray-400 w-1/4">Зона / Енергийна Група</th>
              <th className="py-4 px-6 text-left text-[9px] font-bold uppercase tracking-widest text-gray-400">Σa [cm⁻¹]</th>
              <th className="py-4 px-6 text-left text-[9px] font-bold uppercase tracking-widest text-gray-400">νΣf [cm⁻¹]</th>
              <th className="py-4 px-6 text-left text-[9px] font-bold uppercase tracking-widest text-gray-400">D [cm]</th>
              {isTeacher && <th className="w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-academic-border/30">
            <AnimatePresence initial={false}>
              {constants.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group hover:bg-gray-50/50 dark:hover:bg-academic-border/10 transition-colors"
                >
                  <td className="py-4 px-6">
                    <input
                      type="text"
                      value={row.name}
                      readOnly={!isTeacher}
                      disabled={!isTeacher}
                      onChange={(e) => updateCell(row.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-none text-xs font-bold uppercase tracking-widest focus:ring-0 outline-none placeholder:text-gray-300 disabled:text-gray-500 text-academic-text"
                      placeholder="Име на група..."
                    />
                  </td>
                  <td className="py-4 px-6">
                    <input
                      type="number"
                      step="0.001"
                      value={row.sigmaA}
                      readOnly={!isTeacher}
                      disabled={!isTeacher}
                      onChange={(e) => updateCell(row.id, 'sigmaA', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-xs font-mono focus:ring-0 outline-none placeholder:text-gray-300 disabled:text-gray-500 text-academic-text"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <input
                      type="number"
                      step="0.001"
                      value={row.nuSigmaF}
                      readOnly={!isTeacher}
                      disabled={!isTeacher}
                      onChange={(e) => updateCell(row.id, 'nuSigmaF', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-xs font-mono focus:ring-0 outline-none placeholder:text-gray-300 disabled:text-gray-500 text-academic-text"
                    />
                  </td>
                  <td className="py-4 px-6">
                    <input
                      type="number"
                      step="0.01"
                      value={row.D}
                      readOnly={!isTeacher}
                      disabled={!isTeacher}
                      onChange={(e) => updateCell(row.id, 'D', parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent border-none text-xs font-mono focus:ring-0 outline-none placeholder:text-gray-300 disabled:text-gray-500 text-academic-text"
                    />
                  </td>
                  {isTeacher && (
                    <td className="py-4 px-6">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="p-2 text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {constants.length === 0 && (
        <div className="py-20 text-center space-y-3 bg-gray-50/30 dark:bg-academic-border/10 rounded-sm border border-dashed border-gray-100 dark:border-academic-border">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
            Няма дефинирани константи
          </p>
          {isTeacher && (
            <button onClick={addRow} className="text-[9px] font-bold uppercase text-academic-fast hover:underline">
              Добавете първия ред
            </button>
          )}
        </div>
      )}
    </div>
  );
};
