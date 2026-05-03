import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { OrcamentoData } from './types';
import { formatCurrency, formatDate, loadLogoAsBase64 } from './helpers';

// Constants - Optimized for single page
const MARGIN = 15;
const PRIMARY_COLOR: [number, number, number] = [7, 79, 213];
const GREEN_COLOR: [number, number, number] = [31, 231, 133];
const GRAY_TEXT: [number, number, number] = [80, 80, 80];
const LIGHT_GRAY: [number, number, number] = [245, 247, 250];

// Draw a section header with colored accent bar (compact)
const drawSectionHeader = (
  doc: jsPDF,
  text: string,
  yPos: number,
  pageWidth: number
): number => {
  // Background bar
  doc.setFillColor(...PRIMARY_COLOR);
  doc.roundedRect(MARGIN, yPos, pageWidth - MARGIN * 2, 8, 1, 1, 'F');
  
  // Accent stripe
  doc.setFillColor(...GREEN_COLOR);
  doc.rect(MARGIN, yPos, 3, 8, 'F');
  
  // Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(text, MARGIN + 8, yPos + 5.5);
  
  return yPos + 11;
};

export const generateModernPdf = async (orcamento: OrcamentoData): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  
  let yPos = 12;

  // Load logo
  const logoBase64 = await loadLogoAsBase64();

  // ========== HEADER ==========
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', MARGIN, yPos - 5, 55, 18);
    } catch {
      doc.setFillColor(...PRIMARY_COLOR);
      doc.roundedRect(MARGIN, yPos - 5, 55, 18, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('RC LIMPA MAIS', MARGIN + 6, yPos + 6);
    }
  } else {
    doc.setFillColor(...PRIMARY_COLOR);
    doc.roundedRect(MARGIN, yPos - 5, 55, 18, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RC LIMPA MAIS', MARGIN + 6, yPos + 6);
  }

  // Quotation number and dates (right side)
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORÇAMENTO #${String(orcamento.numero).padStart(4, '0')}`, pageWidth - MARGIN, yPos, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_TEXT);
  doc.text(`Emissão: ${formatDate(orcamento.created_at)}`, pageWidth - MARGIN, yPos + 8, { align: 'right' });
  
  if (orcamento.data_validade) {
    doc.setTextColor(220, 38, 38);
    doc.text(`Válido até: ${formatDate(orcamento.data_validade)}`, pageWidth - MARGIN, yPos + 14, { align: 'right' });
  }

  yPos += 22;

  // Decorative separator line
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, yPos, pageWidth - MARGIN, yPos);
  doc.setDrawColor(...GREEN_COLOR);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, yPos + 1.5, pageWidth - MARGIN, yPos + 1.5);

  yPos += 8;

  // ========== COMPANY INFO BLOCK (Compact) ==========
  const companyBlockHeight = 32;
  
  // Background with subtle border
  doc.setFillColor(...LIGHT_GRAY);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, yPos, contentWidth, companyBlockHeight, 3, 3, 'FD');
  
  // Accent bar
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(MARGIN, yPos, 3, companyBlockHeight, 'F');
  
  doc.setTextColor(...GRAY_TEXT);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESTADOR DE SERVIÇOS', MARGIN + 10, yPos + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text('RC Limpa Mais - Higienização Profissional', MARGIN + 10, yPos + 14);
  
  doc.setFontSize(8);
  doc.setTextColor(...GRAY_TEXT);
  doc.text('CNPJ: 00.000.000/0001-00 | Belo Horizonte - MG', MARGIN + 10, yPos + 21);
  doc.text('(31) 99999-9999 | contato@rclimpamais.com.br', MARGIN + 10, yPos + 28);

  yPos += companyBlockHeight + 8;

  // ========== CLIENT INFO (Compact) ==========
  yPos = drawSectionHeader(doc, 'DADOS DO CLIENTE', yPos, pageWidth);

  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const clienteNome = orcamento.empresa_nome 
    ? `${orcamento.empresa_nome} (${orcamento.cliente_nome})`
    : orcamento.cliente_nome;
  
  const clienteInfo: string[] = [];
  clienteInfo.push(`Nome: ${clienteNome}`);
  
  if (orcamento.cliente_documento) {
    clienteInfo.push(`Documento: ${orcamento.cliente_documento}`);
  }
  if (orcamento.cliente_endereco) {
    clienteInfo.push(`Endereço: ${orcamento.cliente_endereco}`);
  }
  if (orcamento.cliente_cidade) {
    clienteInfo.push(`Cidade: ${orcamento.cliente_cidade}`);
  }
  
  const contatos = [orcamento.cliente_telefone, orcamento.cliente_email].filter(Boolean).join(' | ');
  if (contatos) {
    clienteInfo.push(`Contato: ${contatos}`);
  }

  clienteInfo.forEach((info, index) => {
    doc.text(info, MARGIN + 3, yPos + (index * 5));
  });

  yPos += clienteInfo.length * 5 + 6;

  // ========== SERVICES TABLE (Compact) ==========
  yPos = drawSectionHeader(doc, 'SERVIÇOS ORÇADOS', yPos, pageWidth);

  const tableData = orcamento.itens.map((item, index) => [
    String(index + 1),
    item.descricao,
    String(item.quantidade),
    formatCurrency(item.valor_unitario),
    formatCurrency(item.valor_total),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Descrição do Serviço', 'Qtd', 'Valor Unit.', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
    },
    margin: { left: MARGIN, right: MARGIN },
    alternateRowStyles: {
      fillColor: LIGHT_GRAY,
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  // ========== FINANCIAL SUMMARY (Compact) ==========
  const summaryWidth = 80;
  const summaryX = pageWidth - MARGIN - summaryWidth;
  let summaryHeight = 38;
  
  if (orcamento.desconto_valor && orcamento.desconto_valor > 0) {
    summaryHeight = 48;
  }
  
  // Summary box with border
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.4);
  doc.roundedRect(summaryX, yPos, summaryWidth, summaryHeight, 3, 3, 'FD');
  
  let summaryY = yPos + 10;
  
  // Subtotal
  doc.setTextColor(...GRAY_TEXT);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', summaryX + 6, summaryY);
  doc.text(formatCurrency(orcamento.subtotal), summaryX + summaryWidth - 6, summaryY, { align: 'right' });
  
  summaryY += 8;
  
  // Discount (if any)
  if (orcamento.desconto_valor && orcamento.desconto_valor > 0) {
    const descontoLabel = orcamento.desconto_tipo === 'percentual' 
      ? `Desconto (${orcamento.desconto_valor}%):` 
      : 'Desconto:';
    const valorDesconto = orcamento.desconto_tipo === 'percentual'
      ? orcamento.subtotal * (orcamento.desconto_valor / 100)
      : orcamento.desconto_valor;
    
    doc.setTextColor(220, 38, 38);
    doc.text(descontoLabel, summaryX + 6, summaryY);
    doc.text(`- ${formatCurrency(valorDesconto)}`, summaryX + summaryWidth - 6, summaryY, { align: 'right' });
    
    summaryY += 8;
  }
  
  // Separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(summaryX + 4, summaryY, summaryX + summaryWidth - 4, summaryY);
  
  summaryY += 6;
  
  // Total with green highlight
  doc.setFillColor(...GREEN_COLOR);
  doc.roundedRect(summaryX + 2, summaryY - 4, summaryWidth - 4, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', summaryX + 8, summaryY + 4);
  doc.text(formatCurrency(orcamento.valor_total), summaryX + summaryWidth - 8, summaryY + 4, { align: 'right' });

  yPos += summaryHeight + 8;

  // ========== TERMS AND NOTES (Compact) ==========
  if (orcamento.condicoes_pagamento) {
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Condições de Pagamento:', MARGIN, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_TEXT);
    doc.setFontSize(8);
    const termsLines = doc.splitTextToSize(orcamento.condicoes_pagamento, contentWidth - 10);
    doc.text(termsLines, MARGIN, yPos + 5);
    yPos += 5 + (termsLines.length * 3.5) + 5;
  }
  
  if (orcamento.observacoes) {
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', MARGIN, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_TEXT);
    doc.setFontSize(8);
    const obsLines = doc.splitTextToSize(orcamento.observacoes, contentWidth - 10);
    doc.text(obsLines, MARGIN, yPos + 5);
    yPos += 5 + (obsLines.length * 3.5) + 5;
  }

  // ========== SIGNATURES (Compact, always on same page) ==========
  const footerHeight = 14;
  const signatureAreaHeight = 25;
  const minSpaceFromBottom = signatureAreaHeight + footerHeight + 5;
  
  // Position signatures to fit before footer
  const signatureY = Math.min(yPos + 10, pageHeight - minSpaceFromBottom);
  
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  
  // Client signature
  const signatureWidth = (contentWidth - 20) / 2;
  doc.line(MARGIN, signatureY, MARGIN + signatureWidth, signatureY);
  doc.setTextColor(...GRAY_TEXT);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Assinatura do Cliente', MARGIN + signatureWidth / 2, signatureY + 5, { align: 'center' });
  
  // Company signature
  const rightSignatureX = pageWidth - MARGIN - signatureWidth;
  doc.line(rightSignatureX, signatureY, pageWidth - MARGIN, signatureY);
  doc.text('RC Limpa Mais', rightSignatureX + signatureWidth / 2, signatureY + 5, { align: 'center' });

  // ========== FOOTER (Compact) ==========
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
  
  // Green accent line
  doc.setFillColor(...GREEN_COLOR);
  doc.rect(0, pageHeight - footerHeight, pageWidth, 1.5, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'RC Limpa Mais - Higienização Profissional | www.rclimpamais.com.br | (31) 99999-9999',
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );

  return doc;
};
