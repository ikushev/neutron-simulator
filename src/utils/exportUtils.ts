import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Експортира масив от обекти в CSV файл с поддръжка на кирилица (BOM).
 */
export const downloadCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(v => {
      // Екраниране на кавички и запетаи за предотвратяване на грешки в CSV структурата
      const escaped = String(v).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  ).join('\n');

  // Добавяме BOM (\uFEFF), за да може Excel да разпознае UTF-8 кодирането и кирилицата
  const csvContent = `\uFEFF${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Генерира професионален лабораторен протокол в PDF формат.
 * Използва Snapshot техника за прецизен швейцарски дизайн и поддръжка на кирилица.
 */
export const generateLabReport = async (elementId: string, parameters: Record<string, any>) => {
  const chartElement = document.getElementById(elementId);
  if (!chartElement) {
    console.error('Елементът за диаграмата не е намерен:', elementId);
    return;
  }

  // Създаваме временен контейнер за протокола (A4 формат), който ще бъде заснет
  const reportContainer = document.createElement('div');
  Object.assign(reportContainer.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: '210mm',
    minHeight: '297mm',
    backgroundColor: '#FFFFFF', // High contrast white
    padding: '60px',
    fontFamily: '"Inter", sans-serif',
    color: '#0F172A', // Slate-900 for text regardless of theme
    boxSizing: 'border-box'
  });

  // Заглавна част (Header) с логото и заглавието на български
  const headerHtml = `
    <div style="border-bottom: 1px solid #E5E7EB; padding-bottom: 30px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div>
        <h1 style="font-size: 24px; font-weight: 300; letter-spacing: -0.04em; margin: 0; color: #111827;">
          Лабораторен Протокол: Неутронна Академия
        </h1>
        <p style="font-size: 9px; color: #3730A3; text-transform: uppercase; font-weight: 800; tracking-widest: 0.1em; margin-top: 8px;">
          Виртуална Ядрена Лаборатория v4.0
        </p>
      </div>
      <div style="text-align: right; font-size: 9px; color: #9CA3AF; font-weight: 600; text-transform: uppercase; font-family: monospace;">
        ${new Date().toLocaleString('bg-BG')}
      </div>
    </div>
  `;

  // Секция с физични параметри
  let paramsHtml = `
    <div style="margin-bottom: 50px;">
      <h2 style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #9CA3AF; margin-bottom: 20px;">
        Основни параметри на симулацията
      </h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 40px;">
  `;
  
  for (const [key, value] of Object.entries(parameters)) {
    paramsHtml += `
      <div style="border-bottom: 1px solid #F3F4F6; padding: 10px 0; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 10px; color: #6B7280; font-weight: 500;">${key}</span>
        <span style="font-size: 11px; font-weight: 600; font-family: monospace; color: #3730A3;">${value}</span>
      </div>
    `;
  }
  paramsHtml += '</div></div>';

  reportContainer.innerHTML = headerHtml + paramsHtml;
  
  // Добавяме заглавие за визуалните резултати
  const chartTitle = document.createElement('div');
  chartTitle.innerHTML = `
    <h2 style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #9CA3AF; margin-bottom: 20px; margin-top: 20px;">
      Графични резултати и визуализация
    </h2>
  `;
  reportContainer.appendChild(chartTitle);

  // Заснемане на Recharts компонента чрез html2canvas
  // Добавяме малко изчакване за пълно изчертаване на Canvas елементи
  await new Promise(r => setTimeout(r, 100));

  const chartCanvas = await html2canvas(chartElement, { 
    scale: 3, // По-висока резолюция
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });
  
  const chartImg = document.createElement('img');
  chartImg.src = chartCanvas.toDataURL('image/png');
  chartImg.style.width = '100%';
  chartImg.style.border = '1px solid #F3F4F6';
  chartImg.style.padding = '20px';
  chartImg.style.backgroundColor = '#ffffff';
  chartImg.style.marginBottom = '40px';
  reportContainer.appendChild(chartImg);

  // Футър (Footer) с български текст
  const footer = document.createElement('div');
  Object.assign(footer.style, {
    marginTop: 'auto',
    paddingTop: '40px',
    borderTop: '1px solid #F3F4F6',
    fontSize: '9px',
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center'
  });
  footer.innerHTML = 'Генерирано автоматично от системата на Неутронна Академия • Изчислителен отдел • София, България';
  reportContainer.appendChild(footer);

  document.body.appendChild(reportContainer);

  // Генерираме финалното изображение на целия протокол
  const finalCanvas = await html2canvas(reportContainer, { 
    scale: 2,
    useCORS: true,
    logging: false
  });
  
  const finalImgData = finalCanvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (finalCanvas.height * pdfWidth) / finalCanvas.width;

  pdf.addImage(finalImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`Протокол_НеутроннаАкадемия_${Date.now()}.pdf`);

  // Почистване на DOM
  document.body.removeChild(reportContainer);
};
