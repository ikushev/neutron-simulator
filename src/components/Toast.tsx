import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string | null;
  type?: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-10 left-1/2 z-[100] bg-academic-text text-white px-6 py-3 rounded-sm shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md"
        >
           {type === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
           {type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
           {type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
           <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
