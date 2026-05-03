import jsPDF from 'jspdf';
import type { OrcamentoData, PdfTemplate } from './types';
import { generateClassicPdf } from './classicTemplate';
import { generateModernPdf } from './modernTemplate';

export { PDF_TEMPLATES } from './types';
export type { OrcamentoData, PdfTemplate, PdfTemplateInfo } from './types';

export const generateOrcamentoPdf = async (
  orcamento: OrcamentoData,
  template: PdfTemplate = 'classic'
): Promise<jsPDF> => {
  switch (template) {
    case 'modern':
      return generateModernPdf(orcamento);
    case 'classic':
    default:
      return generateClassicPdf(orcamento);
  }
};

export const downloadOrcamentoPdf = async (
  orcamento: OrcamentoData,
  template: PdfTemplate = 'classic'
): Promise<void> => {
  const doc = await generateOrcamentoPdf(orcamento, template);
  doc.save(`orcamento-${String(orcamento.numero).padStart(4, '0')}.pdf`);
};

export const getOrcamentoPdfBlob = async (
  orcamento: OrcamentoData,
  template: PdfTemplate = 'classic'
): Promise<Blob> => {
  const doc = await generateOrcamentoPdf(orcamento, template);
  return doc.output('blob');
};

export const getOrcamentoPdfBase64 = async (
  orcamento: OrcamentoData,
  template: PdfTemplate = 'classic'
): Promise<string> => {
  const doc = await generateOrcamentoPdf(orcamento, template);
  return doc.output('datauristring').split(',')[1];
};
