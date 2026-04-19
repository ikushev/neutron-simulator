import React, { memo } from 'react';
import { useSim } from '../context/SimContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Atom, 
  Layers, 
  Activity, 
  BookOpen, 
  Hand, 
  LogOut, 
  Bell,
  ChevronRight,
  RefreshCw,
  Unlink,
  Settings,
  Table as TableIcon,
  Zap,
  Thermometer,
  Grid,
  Beaker,
  Save,
  Upload,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SettingsModal } from './SettingsModal';
import { validatePhysicsRanges } from '../utils/physics';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarItem = memo(({ item, active, onClick }: { item: any, active: boolean, onClick: () => void }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-3.5 px-4 rounded-sm transition-all group relative overflow-hidden",
        active 
          ? "bg-sidebar-active-bg border border-sidebar-border dark:border-academic-fast/30 text-academic-fast shadow-sm" 
          : "text-sidebar-text hover:bg-sidebar-active-bg hover:text-academic-text"
      )}
    >
      <div className="flex items-center gap-3.5 relative z-10">
        <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", active ? "text-academic-fast" : "text-gray-300")} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
      </div>
      {active && (
        <motion.div 
          layoutId="active-nav"
          className="absolute left-0 top-0 bottom-0 w-1 bg-academic-fast"
        />
      )}
      <ChevronRight className={cn("w-3 h-3 opacity-0 transition-all", active ? "opacity-100 translate-x-0" : "group-hover:opacity-40 -translate-x-2")} />
    </button>
  );
});

export const Layout: React.FC<{ 
  children: React.ReactNode, 
  activeTab: string, 
  setActiveTab: (tab: string) => void 
}> = ({ children, activeTab, setActiveTab }) => {
  const { state, updateState, role, roomCode, leaveRoom, alerts, raiseHand, isDetached, setIsDetached } = useSim();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const saveScenario = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scenario_${roomCode || 'local'}_${new Date().toISOString().slice(0, 10)}.neutron`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast('Сценарият е експортиран успешно!');
  };

  const loadScenario = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        if (raw.includes('__proto__') || raw.includes('constructor') || raw.includes('prototype')) {
          alert('Сигурност: Файлът съдържа невалидни или опасни ключове.');
          return;
        }
        const parsed = JSON.parse(raw);
        const validated = validatePhysicsRanges(parsed);
        updateState(validated);
        triggerToast('Сценарият е зареден успешно!');
      } catch (err) {
        alert('Грешка при зареждане на сценария. Невалиден формат.');
      }
    };
    reader.readAsText(file);
  };

  const categories = [
    {
      title: 'Основи',
      items: [
        { id: 'transport', label: 'Пренос и Дифузия', icon: Layers },
        { id: 'fermi', label: 'Възрастово приближение', icon: BookOpen },
      ]
    },
    {
      title: 'Реакторна Статика',
      items: [
        { id: 'fdm', label: '1D Дифузия (FDM)', icon: Activity },
        { id: 'multigroup', label: 'Групови константи', icon: TableIcon },
      ]
    },
    {
      title: 'Ядрена Химия',
      items: [
        { id: 'compositor', label: 'Композитор на активната зона', icon: Beaker },
        { id: 'poisoning', label: 'Ядрени отрови (Xe/Sm)', icon: Grid },
      ]
    },
    {
      title: 'Реакторна Кинетика',
      items: [
        { id: 'kinetics', label: 'Точкова кинетика', icon: Zap },
      ]
    },
    {
      title: 'Термохидравлика',
      items: [
        { id: 'thermal', label: 'Термохидравличен анализ', icon: Thermometer },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-academic-bg overflow-hidden relative selection:bg-academic-fast/20 outline-none">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[100] bg-academic-text text-white px-6 py-3 rounded-sm shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
          >
             <CheckCircle className="w-4 h-4 text-green-400" />
             <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-sidebar-bg border-r border-sidebar-border flex flex-col z-50 transition-all duration-300 md:relative",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-academic-text md:hidden">
          <LogOut className="w-5 h-5 rotate-180" />
        </button>

        <header className="p-8 pb-12 space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-academic-fast rounded-lg shadow-lg shadow-indigo-100 dark:shadow-indigo-900/40">
               <Atom className="w-5 h-5 text-white" />
             </div>
             <div className="font-bold text-sm tracking-tighter uppercase italic text-academic-text dark:text-white">Neutron Academy</div>
          </div>

          <div className="p-4 bg-sidebar-active-bg border border-sidebar-border rounded-sm space-y-1">
             <div className="text-[9px] font-bold uppercase tracking-widest text-sidebar-text">Активна сесия</div>
             <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-bold tracking-widest text-academic-text dark:text-white">{roomCode}</div>
                <div className="flex items-center gap-1.5 font-bold text-[9px] uppercase tracking-widest text-green-500">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   НА ЖИВО
                </div>
             </div>
          </div>
        </header>

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pt-2">
          {categories.map((cat) => (
            <div key={cat.title} className="space-y-1.5">
              <h3 className="px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-sidebar-text/80 mb-3">{cat.title}</h3>
              {cat.items.map((item) => (
                <SidebarItem 
                  key={item.id} 
                  item={item} 
                  active={activeTab === item.id} 
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                />
              ))}
            </div>
          ))}
        </nav>

        <footer className="p-4 border-t border-sidebar-border space-y-2 pb-8">
           <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-academic-border/30 text-sidebar-text hover:text-academic-fast transition-all rounded-sm border border-transparent hover:border-academic-fast/20"
              >
                 <Upload className="w-3.5 h-3.5" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">Зареди</span>
              </button>
              <button 
                onClick={saveScenario}
                className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-academic-border/30 text-sidebar-text hover:text-academic-fast transition-all rounded-sm border border-transparent hover:border-academic-fast/20"
              >
                 <Save className="w-3.5 h-3.5" />
                 <span className="text-[9px] font-bold uppercase tracking-widest">Запиши</span>
              </button>
           </div>
           <input type="file" ref={fileInputRef} onChange={loadScenario} accept=".neutron" className="hidden" />
           
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="w-full flex items-center justify-center gap-2 p-3 text-sidebar-text hover:text-academic-fast hover:bg-gray-50 dark:hover:bg-academic-border/20 transition-all rounded-sm"
           >
              <Settings className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Системни Настройки</span>
           </button>
        </footer>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white dark:bg-academic-bg border-b border-sidebar-border flex items-center justify-between px-10 z-40">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-400 md:hidden"><Layers className="w-5 h-5" /></button>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-sidebar-text">Защитен Слой v4.0</span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Потребител</div>
                <div className="text-[11px] font-bold uppercase text-academic-text dark:text-gray-100">{role === 'teacher' ? 'Преподавател' : 'Студент'}</div>
              </div>

              {role === 'student' && (
                <button 
                  onClick={() => setIsDetached(!isDetached)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 border rounded-sm transition-all",
                    isDetached 
                      ? "bg-amber-50 border-amber-200 text-amber-600 shadow-lg shadow-amber-100 dark:shadow-none" 
                      : "bg-white dark:bg-academic-bg border-gray-100 dark:border-academic-border text-gray-400 hover:border-academic-fast hover:text-academic-fast"
                  )}
                >
                   {isDetached ? <Unlink className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                   <span className="text-[9px] font-bold uppercase tracking-widest">{isDetached ? 'Самостоятелен режим' : 'Синхронизиран'}</span>
                </button>
              )}

              <button 
                onClick={leaveRoom}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
           </div>
        </header>

        <section className="flex-1 overflow-y-auto custom-scrollbar relative">
           {children}
        </section>

        <AnimatePresence>
          {alerts.length > 0 && (
            <div className="fixed bottom-24 right-10 z-50 space-y-3 pointer-events-none">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-academic-bg p-4 border-l-4 border-academic-fast shadow-2xl flex items-center gap-4 w-72 pointer-events-auto"
                >
                   <div className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-full">
                      <Bell className="w-4 h-4 text-academic-fast" />
                   </div>
                   <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-academic-text dark:text-gray-200">{alert.message}</div>
                      <div className="text-[8px] text-gray-400 font-mono">{alert.timestamp}</div>
                   </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
