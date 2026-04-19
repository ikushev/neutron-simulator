import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun, Ruler } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { theme, toggleTheme, units, setUnits } = useSettings();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-academic-bg border border-gray-100 dark:border-academic-border shadow-2xl overflow-hidden"
          >
            <header className="p-6 border-b border-gray-50 dark:border-academic-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest">Настройки</h2>
                <p className="text-[10px] text-gray-400 font-medium italic">Персонализиране на лабораторията</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 dark:hover:bg-academic-border rounded-full transition-colors text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="p-8 space-y-10">
              {/* Theme Toggle */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest block">Тема на интерфейса</label>
                    <span className="text-[11px] text-gray-400 italic font-medium">
                      {theme === 'light' ? 'Академична Хартия' : 'Кибер Лаборатория'}
                    </span>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className="flex items-center gap-2 p-3 px-6 bg-gray-50 dark:bg-academic-border border border-gray-100 dark:border-white/5 rounded-sm hover:border-academic-fast transition-all"
                  >
                    {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    <span className="text-[10px] font-bold uppercase tracking-widest">Превключи</span>
                  </button>
                </div>
              </section>

              {/* Units Toggle */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest block">Мерни единици</label>
                    <span className="text-[11px] text-gray-400 italic font-medium">
                      {units === 'standard' ? 'Стандартни (cm, eV)' : 'SI Система (m, MeV)'}
                    </span>
                  </div>
                  <div className="flex bg-gray-50 dark:bg-academic-border p-1 rounded-sm border border-gray-100 dark:border-white/5">
                    <button 
                      onClick={() => setUnits('standard')}
                      className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded-sm transition-all ${units === 'standard' ? 'bg-white dark:bg-academic-bg shadow-sm text-academic-fast' : 'text-gray-400'}`}
                    >
                      cm/eV
                    </button>
                    <button 
                      onClick={() => setUnits('si')}
                      className={`px-4 py-2 text-[9px] font-bold uppercase tracking-widest rounded-sm transition-all ${units === 'si' ? 'bg-white dark:bg-academic-bg shadow-sm text-academic-fast' : 'text-gray-400'}`}
                    >
                      m/MeV
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <footer className="p-6 bg-gray-50/50 dark:bg-academic-border/20 border-t border-gray-50 dark:border-academic-border">
              <p className="text-[9px] text-gray-400 text-center font-medium italic leading-relaxed">
                Всички настройки се запазват локално за Вашата текуща сесия.
              </p>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
