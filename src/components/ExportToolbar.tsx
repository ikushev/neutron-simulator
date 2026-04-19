import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { downloadCSV, generateLabReport } from '../utils/exportUtils';
import { motion } from 'motion/react';

interface ExportToolbarProps {
  chartData: any[];
  elementIdToCapture: string;
  currentParameters: Record<string, any>;
  filenameBase?: string;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({ 
  chartData, 
  elementIdToCapture, 
  currentParameters,
  filenameBase = 'NeutronAcademy_Lab'
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handlePdfExport = async () => {
    setIsExportingPdf(true);
    try {
      await generateLabReport(elementIdToCapture, currentParameters);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="flex items-center gap-4 py-4 px-6 bg-gray-50/50 dark:bg-academic-border/10 border border-gray-100 dark:border-white/5 rounded-sm">
      <div className="flex items-center gap-2 mr-auto">
        <div className="w-1.5 h-1.5 bg-academic-fast rounded-full" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
          Инструменти за експорт
        </span>
      </div>

      <button
        onClick={() => downloadCSV(chartData, `${filenameBase}_Data`)}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-white dark:bg-academic-bg border border-gray-100 dark:border-academic-border text-[9px] font-bold uppercase tracking-widest hover:border-academic-fast hover:text-academic-fast transition-all rounded-sm shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        Експорт (CSV)
      </button>

      <button
        onClick={handlePdfExport}
        disabled={isExportingPdf}
        className="flex items-center gap-2.5 px-5 py-2.5 bg-academic-text dark:bg-academic-fast text-white text-[9px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-sm shadow-lg shadow-indigo-100 dark:shadow-none"
      >
        {isExportingPdf ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileText className="w-3.5 h-3.5" />
        )}
        {isExportingPdf ? 'Генериране...' : 'Генерирай Протокол (PDF)'}
      </button>

      {isExportingPdf && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[9px] font-bold uppercase tracking-widest text-academic-fast italic animate-pulse"
        >
          Заснемане на данни...
        </motion.div>
      )}
    </div>
  );
};
