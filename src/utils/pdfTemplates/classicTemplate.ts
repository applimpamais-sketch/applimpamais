import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { OrcamentoData } from './types';
import { formatCurrency, formatDate, loadLogoAsBase64 } from './helpers';
import { PLATFORM_NAME, SITE_DOMAIN, SUPPORT_EMAIL, SUPPORT_PHONE } from '@/lib/constants';

// Constants
const MARGIN = 14;
const PRIMARY_COLOR: [number, number, number] = [7, 79, 213];
const GRAY_TEXT: [number, number, number] = [80, 80, 80];
const LIGHT_GRAY: [number, number, number] = [245, 247, 250];

export const generateClassicPdf = async (orcamento: OrcamentoData): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN * 2;
  
  let yPos = 15;

  // Load logo
  const logoBase64 = await loadLogoAsBase64();

  // ========== HEADER ==========
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', MARGIN, yPos, 50, 16);
    } catch {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text(PLATFORM_NAME.toUpperCase(), MARGIN, yPos + 10);
    }
  } else {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(PLATFORM_NAME.toUpperCase(), MARGIN, yPos + 10);
  }

  // Quotation number and dates (right side)
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORÇAMENTO #${String(orcamento.numero).padStart(4, '0')}`, pageWidth - MARGIN, yPos + 5, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_TEXT);
  doc.text(`Emissão: ${formatDate(orcamento.created_at)}`, pageWidth - MARGIN, yPos + 12, { align: 'right' });
  
  if (orcamento.data_validade) {
    doc.setTextColor(220, 38, 38);
    doc.text(`Válido até: ${formatDate(orcamento.data_validade)}`, pageWidth - MARGIN, yPos + 18, { align: 'right' });
  }

  yPos += 28;

  // Simple separator line
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, yPos, pageWidth - MARGIN, yPos);

  yPos += 12;

  // ========== COMPANY INFO ==========
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(MARGIN, yPos, contentWidth, 32, 'F');
  
  doc.setTextColor(...GRAY_TEXT);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESTADOR DE SERVIÇOS', MARGIN + 6, yPos + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`${PLATFORM_NAME} - Higienização Profissional`, MARGIN + 6, yPos + 15);
  
  doc.setFontSize(9);
  doc.setTextColor(...GRAY_TEXT);
  doc.text('CNPJ: 00.000.000/0001-00 | Belo Horizonte - MG', MARGIN + 6, yPos + 22);
  doc.text(`${SUPPORT_PHONE || 'Telefone não configurado'} | ${SUPPORT_EMAIL}`, MARGIN + 6, yPos + 28);

  yPos += 42;

  // ========== CLIENT INFO ==========
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(MARGIN, yPos, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', MARGIN + 4, yPos + 5.5);
  
  yPos += 12;

  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
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
    doc.text(info, MARGIN + 4, yPos + (index * 6));
  });

  yPos += clienteInfo.length * 6 + 10;

  // ========== SERVICES TABLE ==========
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(MARGIN, yPos, contentWidth, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVIÇOS ORÇADOS', MARGIN + 4, yPos + 5.5);
  
  yPos += 10;

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
      fillColor: [100, 100, 100],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
    },
    margin: { left: MARGIN, right: MARGIN },
    alternateRowStyles: {
      fillColor: LIGHT_GRAY,
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // ========== FINANCIAL SUMMARY ==========
  const summaryWidth = 80;
  const summaryX = pageWidth - MARGIN - summaryWidth;
  
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(summaryX, yPos, summaryWidth, 35, 'F');
  
  let summaryY = yPos + 10;
  
  // Subtotal
  doc.setTextColor(...GRAY_TEXT);
  doc.setFontSize(9);
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
  
  // Total
  doc.setTextColor(...PRIMARY_COLOR);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', summaryX + 6, summaryY + 2);
  doc.text(formatCurrency(orcamento.valor_total), summaryX + summaryWidth - 6, summaryY + 2, { align: 'right' });

  yPos += 45;

  // ========== TERMS AND NOTES ==========
  if (orcamento.condicoes_pagamento) {
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Condições de Pagamento:', MARGIN, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_TEXT);
    const termsLines = doc.splitTextToSize(orcamento.condicoes_pagamento, contentWidth - 10);
    doc.text(termsLines, MARGIN, yPos + 6);
    yPos += 6 + (termsLines.length * 4) + 8;
  }
  
  if (orcamento.observacoes) {
    doc.setTextColor(...PRIMARY_COLOR);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', MARGIN, yPos);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_TEXT);
    const obsLines = doc.splitTextToSize(orcamento.observacoes, contentWidth - 10);
    doc.text(obsLines, MARGIN, yPos + 6);
    yPos += 6 + (obsLines.length * 4) + 8;
  }

  // ========== SIGNATURES ==========
  const signatureY = Math.min(yPos + 25, pageHeight - 35);
  
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  
  const signatureWidth = (contentWidth - 30) / 2;
  doc.line(MARGIN, signatureY, MARGIN + signatureWidth, signatureY);
  doc.setTextColor(...GRAY_TEXT);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Assinatura do Cliente', MARGIN + signatureWidth / 2, signatureY + 5, { align: 'center' });
  
  const rightSignatureX = pageWidth - MARGIN - signatureWidth;
  doc.line(rightSignatureX, signatureY, pageWidth - MARGIN, signatureY);
  doc.text(PLATFORM_NAME, rightSignatureX + signatureWidth / 2, signatureY + 5, { align: 'center' });

  // ========== FOOTER ==========
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${PLATFORM_NAME} - Higienização Profissional | ${SITE_DOMAIN.replace(/^https?:\/\//, '')} | ${SUPPORT_PHONE || 'Telefone não configurado'}`,
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );

  return doc;
};
