import React from 'react';
import { useSim } from '../context/SimContext';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, YAxis } from 'recharts';
import { HelpCircle, Send, CheckCircle2 } from 'lucide-react';

export const QuizPanel: React.FC = () => {
  const { role, quiz, quizResults, startQuiz, submitAnswer, closeQuiz } = useSim();

  const SAMPLE_QUESTIONS = [
    {
      text: "Как се променя Ферми-възрастта (τ) при по-чести сблъсъци в модератора?",
      options: ["Намалява (неутроните се забавят по-бързо в пространство)", "Увеличва се", "Остава непроменена", "Зависи само от масовото число"],
      correct: 0
    },
    {
      text: "Кое от следните е условие за валидност на дифузионното приближение?",
      options: ["Силно поглъщаща среда", "Слабо поглъщаща среда (Σa << Σs)", "Близост до неутронен източник", "Вакуумни граници"],
      correct: 1
    }
  ];

  if (role === 'teacher') {
    const chartData = quizResults.map((count, i) => ({
      name: `Отг. ${i + 1}`,
      votes: count
    }));

    return (
      <div className="border-t border-gray-100 bg-white p-8 space-y-8">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-400">
            <HelpCircle className="w-4 h-4" />
            <h2 className="text-[10px] uppercase tracking-widest font-bold">Бърз тест в реално време</h2>
          </div>
          {quiz && (
            <button 
              onClick={closeQuiz}
              className="text-[10px] uppercase tracking-widest text-red-500 font-bold border border-red-500 px-4 py-1.5 hover:bg-red-50 transition-colors"
            >
              Затвори теста
            </button>
          )}
        </header>

        {!quiz ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => startQuiz(q)}
                className="group flex items-center justify-between p-6 border border-gray-100 hover:border-academic-fast transition-all text-left bg-gray-50/30"
              >
                <div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Въпрос {i + 1}</div>
                  <div className="text-sm font-medium pr-8">{q.text}</div>
                </div>
                <Send className="w-4 h-4 text-gray-300 group-hover:text-academic-fast transition-all group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
             <div className="text-center space-y-2">
                <span className="text-[9px] uppercase tracking-[0.4em] text-academic-fast font-bold italic">Активен въпрос</span>
                <h3 className="text-xl font-light tracking-tight">{quiz.text}</h3>
             </div>

             <div className="h-48 w-full max-w-2xl mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={[0, 'dataMax + 2']} />
                    <Bar dataKey="votes" radius={[4, 4, 0, 0]} barSize={40}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === quiz.correct ? '#3730A3' : '#E5E7EB'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {quiz.options.map((opt, i) => (
                  <div key={i} className={`p-4 border ${i === quiz.correct ? 'border-academic-fast bg-indigo-50/30' : 'border-gray-50'} text-center space-y-2`}>
                    <div className="text-[18px] font-mono font-light">{quizResults[i] || 0}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">Гласа</div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {quiz && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-academic-text/20 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="bg-white border border-academic-border shadow-2xl max-w-lg w-full p-10 space-y-10 rounded-sm"
          >
            <div className="space-y-3 text-center">
              <div className="flex justify-center mb-4">
                 <div className="p-3 bg-indigo-50 rounded-full">
                    <HelpCircle className="w-6 h-6 text-academic-fast" />
                 </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.4em] text-academic-fast font-bold">Въпрос от преподавателя</span>
              <h2 className="text-2xl font-light leading-snug tracking-tight text-academic-text">{quiz.text}</h2>
            </div>

            <div className="grid gap-3">
              {quiz.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => submitAnswer(i)}
                  className="group flex items-center justify-between p-5 border border-gray-100 hover:border-academic-fast hover:bg-indigo-50/10 transition-all text-left rounded-sm"
                >
                  <span className="text-sm font-medium text-gray-600 group-hover:text-academic-fast transition-colors">{opt}</span>
                  <CheckCircle2 className="w-4 h-4 text-gray-100 group-hover:text-academic-fast transition-all" />
                </button>
              ))}
            </div>
            
            <p className="text-[9px] text-gray-300 uppercase tracking-widest text-center italic">
              Веднъж изпратен, отговорът не може да бъде променен.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
