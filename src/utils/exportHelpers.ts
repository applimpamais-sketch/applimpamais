import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportData {
  headers: string[];
  rows: any[][];
  fileName: string;
  title?: string;
}

export const exportToExcel = ({ headers, rows, fileName }: ExportData) => {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Ajustar largura das colunas
  const maxWidth = 30;
  const colWidths = headers.map((_, i) => {
    const maxLength = Math.max(
      headers[i].length,
      ...rows.map(row => String(row[i] || '').length)
    );
    return { wch: Math.min(maxLength + 2, maxWidth) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');
  
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = ({ headers, rows, fileName, title }: ExportData) => {
  const doc = new jsPDF('landscape');
  
  // Título
  if (title) {
    doc.setFontSize(18);
    doc.text(title, 14, 20);
  }
  
  // Adicionar data de exportação
  const dataExportacao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.setFontSize(10);
  doc.text(`Exportado em: ${dataExportacao}`, 14, title ? 28 : 20);
  
  // Tabela
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: title ? 35 : 28,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 'auto' }
    },
    margin: { top: 35 },
    didDrawPage: (data) => {
      // Rodapé com número de página
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });
  
  doc.save(`${fileName}.pdf`);
};

export const formatCurrencyForExport = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDateForExport = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

export const formatPhoneForExport = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};
