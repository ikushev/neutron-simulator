import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, GraduationCap, ArrowRight, Atom } from 'lucide-react';
import { useSim } from '../context/SimContext';

export const EntryScreen: React.FC = () => {
  const { setRoomData } = useSim();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = (role: 'teacher' | 'student', roomCode: string) => {
    if (role === 'student' && !roomCode) {
      setError('Моля, въведете код на стаята');
      return;
    }
    setRoomData(role, roomCode || 'ROOM-' + Math.random().toString(36).substr(2, 4).toUpperCase());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-academic-bg relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-50 rounded-full filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md space-y-12 text-center z-10"
      >
        <header className="space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-white border border-academic-border shadow-sm rounded-xl">
              <Atom className="w-8 h-8 text-academic-fast" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-light tracking-tighter text-academic-text uppercase italic">
              Неутронна Академия
            </h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-[0.4em] uppercase">
              Neutron Academy • Теория на преноса
            </p>
          </div>
        </header>

        <div className="grid gap-6">
          {/* Teacher Button */}
          <button
            onClick={() => handleJoin('teacher', '')}
            className="group flex items-center justify-between p-6 border border-academic-border bg-white hover:border-academic-fast hover:shadow-xl transition-all duration-500 rounded-sm"
          >
            <div className="flex items-center gap-5 text-left">
              <div className="p-3 bg-gray-50 group-hover:bg-indigo-50 transition-colors rounded-lg">
                <Users className="w-6 h-6 text-academic-fast" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">Преподавател</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Създайте нова стая</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-academic-fast transition-all group-hover:translate-x-1" />
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-academic-bg px-4 text-gray-300">или влезете като</span>
            </div>
          </div>

          {/* Student Area */}
          <div className="space-y-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="КОД НА СТАЯТА"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError('');
                }}
                className="w-full p-5 border border-academic-border bg-white focus:outline-none focus:border-academic-fast focus:ring-4 focus:ring-indigo-100 text-center tracking-[0.3em] font-mono text-lg transition-all rounded-sm uppercase"
              />
              {error && <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-wider">{error}</p>}
            </div>
            
            <button
              onClick={() => handleJoin('student', code)}
              className="w-full p-5 bg-academic-text text-white font-medium hover:bg-gray-800 transition-all rounded-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-academic-text/20 uppercase tracking-widest text-sm"
            >
              <GraduationCap className="w-5 h-5" />
              Влез в час
            </button>
          </div>
        </div>

        <footer className="text-[9px] text-gray-300 uppercase tracking-[0.3em] leading-relaxed pt-8 font-medium">
          Курс по Реакторна Физика • Управление и безопасност<br/>
          © 2026 Неутронна Академия
        </footer>
      </motion.div>
    </div>
  );
};
