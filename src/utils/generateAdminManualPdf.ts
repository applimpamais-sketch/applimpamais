import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  MANUAL_INTRO, 
  MANUAL_SECTIONS, 
  MANUAL_BEST_PRACTICES, 
  MANUAL_COMMON_ERRORS 
} from './adminManualContent';

const COLORS = {
  primary: [7, 79, 213] as [number, number, number],      // #074FD5
  secondary: [31, 231, 133] as [number, number, number],  // #1FE785
  dark: [30, 30, 30] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
  lightGray: [240, 240, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

export const generateAdminManualPdf = async (): Promise<jsPDF> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let currentY = margin;

  const addNewPage = () => {
    doc.addPage();
    currentY = margin;
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (currentY + requiredSpace > pageHeight - margin) {
      addNewPage();
      return true;
    }
    return false;
  };

  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.gray);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(
        'RC Limpa Mais - Manual do Administrador',
        margin,
        pageHeight - 10
      );
      doc.text(
        `Versão ${MANUAL_INTRO.version}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }
  };

  // ========== CAPA ==========
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Logo placeholder
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(pageWidth / 2 - 40, 40, 80, 30, 5, 5, 'F');
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RC LIMPA MAIS', pageWidth / 2, 58, { align: 'center' });

  // Título principal
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Manual do', pageWidth / 2, 100, { align: 'center' });
  doc.text('Administrador', pageWidth / 2, 115, { align: 'center' });

  // Linha decorativa
  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(2);
  doc.line(pageWidth / 2 - 50, 125, pageWidth / 2 + 50, 125);

  // Subtítulo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Guia Completo de Treinamento', pageWidth / 2, 140, { align: 'center' });
  doc.text('para Administradores da Plataforma', pageWidth / 2, 150, { align: 'center' });

  // Informações da versão
  doc.setFontSize(12);
  doc.text(`Versão ${MANUAL_INTRO.version}`, pageWidth / 2, 200, { align: 'center' });
  doc.text(MANUAL_INTRO.date, pageWidth / 2, 210, { align: 'center' });

  // Classificação
  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(pageWidth / 2 - 30, 240, 60, 15, 3, 3, 'F');
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('USO INTERNO', pageWidth / 2, 250, { align: 'center' });

  // ========== ÍNDICE ==========
  addNewPage();
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Índice', margin, currentY);
  currentY += 15;

  doc.setDrawColor(...COLORS.secondary);
  doc.setLineWidth(1);
  doc.line(margin, currentY, margin + 40, currentY);
  currentY += 10;

  let pageNum = 3; // Índice começa na página 2, conteúdo na 3
  
  // Introdução
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Introdução', margin, currentY);
  doc.text(String(pageNum), pageWidth - margin, currentY, { align: 'right' });
  currentY += 8;
  pageNum++;

  // Módulos
  MANUAL_SECTIONS.forEach((section, sectionIndex) => {
    checkPageBreak(20);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(`${sectionIndex + 1}. ${section.title}`, margin, currentY);
    doc.text(String(pageNum), pageWidth - margin, currentY, { align: 'right' });
    currentY += 7;

    section.content.forEach((item, itemIndex) => {
      checkPageBreak(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.gray);
      doc.text(`  ${sectionIndex + 1}.${itemIndex + 1} ${item.title}`, margin + 5, currentY);
      currentY += 6;
    });

    currentY += 4;
    pageNum += Math.ceil(section.content.length / 2);
  });

  // Apêndices
  checkPageBreak(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.text('Apêndice A: Boas Práticas', margin, currentY);
  currentY += 7;
  doc.text('Apêndice B: Erros Comuns e Soluções', margin, currentY);
  currentY += 7;

  // ========== INTRODUÇÃO ==========
  addNewPage();
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Introdução', margin, currentY);
  currentY += 10;

  doc.setDrawColor(...COLORS.secondary);
  doc.line(margin, currentY, margin + 40, currentY);
  currentY += 15;

  // Descrição
  doc.setTextColor(...COLORS.dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const introLines = doc.splitTextToSize(MANUAL_INTRO.description, contentWidth);
  introLines.forEach((line: string) => {
    checkPageBreak(8);
    doc.text(line, margin, currentY);
    currentY += 6;
  });

  currentY += 10;

  // Tabela de papéis
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(14);
  doc.text('Níveis de Permissão', margin, currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    head: [['Papel', 'Descrição']],
    body: MANUAL_INTRO.roles.map(r => [r.role, r.description]),
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // ========== MÓDULOS ==========
  MANUAL_SECTIONS.forEach((section, sectionIndex) => {
    // Título da seção
    addNewPage();
    
    // Header da seção
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(`Módulo ${sectionIndex + 1}`, margin, 25);
    doc.setFontSize(18);
    doc.text(section.title, margin, 38);

    currentY = 70;

    // Conteúdo de cada tela
    section.content.forEach((item, itemIndex) => {
      checkPageBreak(80);

      // Título da funcionalidade
      doc.setFillColor(...COLORS.lightGray);
      doc.roundedRect(margin, currentY - 5, contentWidth, 15, 3, 3, 'F');
      
      doc.setTextColor(...COLORS.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${sectionIndex + 1}.${itemIndex + 1} ${item.title}`, margin + 5, currentY + 5);
      
      if (item.route) {
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.gray);
        doc.text(item.route, pageWidth - margin - 5, currentY + 5, { align: 'right' });
      }
      
      currentY += 18;

      // O que é
      checkPageBreak(30);
      doc.setTextColor(...COLORS.secondary);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('1. O que é essa tela?', margin, currentY);
      currentY += 7;

      doc.setTextColor(...COLORS.dark);
      doc.setFont('helvetica', 'normal');
      const whatIsLines = doc.splitTextToSize(item.whatIs, contentWidth - 5);
      whatIsLines.forEach((line: string) => {
        checkPageBreak(8);
        doc.text(line, margin + 5, currentY);
        currentY += 6;
      });
      currentY += 5;

      // Para que serve
      checkPageBreak(30);
      doc.setTextColor(...COLORS.secondary);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Para que serve?', margin, currentY);
      currentY += 7;

      doc.setTextColor(...COLORS.dark);
      doc.setFont('helvetica', 'normal');
      item.purpose.forEach(purpose => {
        checkPageBreak(8);
        doc.text(`• ${purpose}`, margin + 5, currentY);
        currentY += 6;
      });
      currentY += 5;

      // Quando usar
      checkPageBreak(30);
      doc.setTextColor(...COLORS.secondary);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Quando usar?', margin, currentY);
      currentY += 7;

      doc.setTextColor(...COLORS.dark);
      doc.setFont('helvetica', 'normal');
      item.whenToUse.forEach(when => {
        checkPageBreak(8);
        doc.text(`• ${when}`, margin + 5, currentY);
        currentY += 6;
      });
      currentY += 5;

      // Como usar
      checkPageBreak(40);
      doc.setTextColor(...COLORS.secondary);
      doc.setFont('helvetica', 'bold');
      doc.text('4. Como usar? (Passo a passo)', margin, currentY);
      currentY += 7;

      item.howToUse.forEach((step, stepIndex) => {
        checkPageBreak(15);
        doc.setTextColor(...COLORS.primary);
        doc.setFont('helvetica', 'bold');
        doc.text(`Passo ${stepIndex + 1}: ${step.step}`, margin + 5, currentY);
        currentY += 6;

        doc.setTextColor(...COLORS.dark);
        doc.setFont('helvetica', 'normal');
        const stepLines = doc.splitTextToSize(step.description, contentWidth - 15);
        stepLines.forEach((line: string) => {
          checkPageBreak(8);
          doc.text(line, margin + 10, currentY);
          currentY += 6;
        });
        currentY += 2;
      });
      currentY += 5;

      // O que acontece depois
      checkPageBreak(30);
      doc.setTextColor(...COLORS.secondary);
      doc.setFont('helvetica', 'bold');
      doc.text('5. O que acontece depois?', margin, currentY);
      currentY += 7;

      doc.setTextColor(...COLORS.dark);
      doc.setFont('helvetica', 'normal');
      item.whatHappensAfter.forEach(after => {
        checkPageBreak(8);
        doc.text(`• ${after}`, margin + 5, currentY);
        currentY += 6;
      });
      currentY += 5;

      // Avisos
      if (item.warnings.length > 0) {
        checkPageBreak(40);
        
        doc.setFillColor(255, 243, 205);
        doc.roundedRect(margin, currentY - 3, contentWidth, 8 + (item.warnings.length * 7), 3, 3, 'F');
        
        doc.setTextColor(133, 100, 4);
        doc.setFont('helvetica', 'bold');
        doc.text('⚠️ O que evitar', margin + 5, currentY + 3);
        currentY += 10;

        doc.setFont('helvetica', 'normal');
        item.warnings.forEach(warning => {
          checkPageBreak(8);
          doc.text(`• ${warning}`, margin + 10, currentY);
          currentY += 6;
        });
        currentY += 5;
      }

      currentY += 15;
    });
  });

  // ========== APÊNDICE A: BOAS PRÁTICAS ==========
  addNewPage();
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Apêndice A: Boas Práticas', margin, currentY);
  currentY += 10;

  doc.setDrawColor(...COLORS.secondary);
  doc.line(margin, currentY, margin + 60, currentY);
  currentY += 15;

  MANUAL_BEST_PRACTICES.forEach(practice => {
    checkPageBreak(50);
    
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(margin, currentY - 5, contentWidth, 12, 3, 3, 'F');
    
    doc.setTextColor(...COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(practice.category, margin + 5, currentY + 3);
    currentY += 15;

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    practice.items.forEach(item => {
      checkPageBreak(8);
      doc.text(`✓ ${item}`, margin + 5, currentY);
      currentY += 7;
    });
    currentY += 10;
  });

  // ========== APÊNDICE B: ERROS COMUNS ==========
  addNewPage();
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Apêndice B: Erros Comuns e Soluções', margin, currentY);
  currentY += 10;

  doc.setDrawColor(...COLORS.secondary);
  doc.line(margin, currentY, margin + 80, currentY);
  currentY += 15;

  MANUAL_COMMON_ERRORS.forEach(error => {
    checkPageBreak(60);

    doc.setFillColor(254, 226, 226);
    doc.roundedRect(margin, currentY - 5, contentWidth, 12, 3, 3, 'F');
    
    doc.setTextColor(153, 27, 27);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`❌ ${error.error}`, margin + 5, currentY + 3);
    currentY += 15;

    doc.setTextColor(...COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.setFont('helvetica', 'bold');
    doc.text('Causa:', margin + 5, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(error.cause, margin + 25, currentY);
    currentY += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Solução:', margin + 5, currentY);
    doc.setFont('helvetica', 'normal');
    const solutionLines = doc.splitTextToSize(error.solution, contentWidth - 35);
    solutionLines.forEach((line: string, index: number) => {
      doc.text(line, index === 0 ? margin + 28 : margin + 5, currentY);
      currentY += 6;
    });
    currentY += 2;

    doc.setFont('helvetica', 'bold');
    doc.text('Prevenção:', margin + 5, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(error.prevention, margin + 35, currentY);
    currentY += 15;
  });

  // ========== CONTRACAPA ==========
  addNewPage();
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RC Limpa Mais', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestão para Serviços de Limpeza', pageWidth / 2, pageHeight / 2, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Versão ${MANUAL_INTRO.version} - ${MANUAL_INTRO.date}`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
  doc.text('Documento de uso interno', pageWidth / 2, pageHeight / 2 + 30, { align: 'center' });

  // Adicionar rodapé em todas as páginas
  addFooter();

  return doc;
};

export const downloadAdminManualPdf = async (): Promise<void> => {
  const doc = await generateAdminManualPdf();
  doc.save(`manual-administrador-rc-limpa-mais-v${MANUAL_INTRO.version}.pdf`);
};
