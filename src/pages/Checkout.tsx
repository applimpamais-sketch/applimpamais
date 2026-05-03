import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookingData } from "@/types/booking";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { trackPurchase } from "@/utils/facebookPixel";
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { normalizePhone } from "@/utils/phoneNormalizer";

// Schema de validação para prevenir state injection (PERMISSIVO)
const bookingDataSchema = z.object({
  selectedDate: z.string().or(z.coerce.date()),
  selectedItems: z.array(z.object({
    id: z.string().min(1),
    name: z.string().max(100).transform(s => DOMPurify.sanitize(s.trim())),
    details: z.string().max(200).transform(s => DOMPurify.sanitize(s.trim())),
    quantity: z.number().int().min(1).max(100),
    price: z.number().positive().max(100000)
  })).min(1).max(50),
  customerInfo: z.object({
    name: z.string().max(100).transform(s => DOMPurify.sanitize(s.trim())),
    phone: z.string()
      .transform(normalizePhone) // 🔧 Normalizar antes de validar
      .refine(val => /^\d{10,11}$/.test(val), {
        message: 'Telefone inválido. Use formato: 11987654321 (10-11 dígitos)'
      }),
    address: z.string().max(500).transform(s => DOMPurify.sanitize(s.trim())),
    cidade: z.string().max(100).optional(),
    bairro: z.string().max(100).optional(),
    cep: z.string().optional(),
    observacoes: z.string().max(500).optional().transform(s => s ? DOMPurify.sanitize(s.trim()) : undefined) // 🔧 Campo opcional
  }),
  periodo: z.string().optional(),
  timeSlot: z.string().optional(),
  orderCode: z.string().optional(),
  formaPagamento: z.string().optional(),
  valorTotal: z.number().optional(),
}).passthrough();

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const hasTrackedPurchase = React.useRef(false);
  
  // Validar bookingData com Zod (PERMISSIVO - não bloqueia fluxo crítico)
  const validatedData = React.useMemo(() => {
    try {
      const rawData = location.state?.bookingData;
      if (!rawData) {
        return null;
      }
      
      const result = bookingDataSchema.safeParse(rawData);
      
      if (!result.success) {
        if (import.meta.env.DEV) {
          console.error('Validation failed:', result.error.format());
        }
        return null;
      }
      
      return result.data;
    } catch (error) {
      return null;
    }
  }, [location.state]);
  
  const bookingData = validatedData as BookingData | null;

  // Gerar código único do pedido (uma vez) com FALLBACK garantido
  const [orderCode] = React.useState(() => {
    const code = bookingData?.orderCode 
      || location.state?.bookingData?.orderCode
      || `LS-${Math.floor(Math.random() * 900000) + 100000}`;
    return code;
  });

  React.useEffect(() => {
    if (!bookingData || !bookingData.selectedItems || bookingData.selectedItems.length === 0) {
      navigate('/', { replace: true });
      return;
    }
    
    // 🔒 Guard de deduplicação — dispara Purchase apenas 1x
    if (hasTrackedPurchase.current) return;
    
    try {
      // Usar valorTotal líquido se disponível, senão calcular bruto como fallback
      const total = bookingData.valorTotal ?? bookingData.selectedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      trackPurchase(orderCode, total, bookingData.selectedItems);
      hasTrackedPurchase.current = true;
    } catch {
      // Silent fail for tracking - non-critical
    }
  }, [bookingData, navigate, orderCode]);

  if (!bookingData || !bookingData.selectedItems || bookingData.selectedItems.length === 0) {
    return null;
  }

  const total = bookingData.selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatCurrency = (value: number): string => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const totalQuantity = bookingData.selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Função para determinar a categoria do serviço
  const getServiceCategory = (item: { name: string; details: string }): string => {
    const nameAndDetails = `${item.name} ${item.details}`.toLowerCase();
    
    // Verificar se é aluguel
    if (nameAndDetails.includes('aluguel') || 
        nameAndDetails.includes('máquina') || 
        nameAndDetails.includes('equipamento') ||
        nameAndDetails.includes('lavadora') ||
        nameAndDetails.includes('aspirador')) {
      return 'ALUGUEL';
    }
    
    // Verificar se tem limpeza e impermeabilização
    const hasLimpeza = nameAndDetails.includes('limpeza');
    const hasImpermeabilizacao = nameAndDetails.includes('impermeabilização') || 
                                  nameAndDetails.includes('impermeabilizacao');
    
    if (hasLimpeza && hasImpermeabilizacao) {
      return 'LIMPEZA E IMPERMEABILIZAÇÃO';
    }
    
    if (hasImpermeabilizacao) {
      return 'IMPERMEABILIZAÇÃO';
    }
    
    if (hasLimpeza) {
      return 'LIMPEZA';
    }
    
    return 'SERVIÇO';
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Cupom Fiscal Container */}
        <div className="bg-background border border-border shadow-lg rounded-sm p-6 space-y-4 relative overflow-hidden">
          
          {/* Efeito de Papel Rasgado - Topo */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-background" 
               style={{
                 backgroundImage: 'radial-gradient(circle at 6px 0, transparent 6px, hsl(var(--background)) 6px)',
                 backgroundSize: '12px 12px',
                 backgroundPosition: '0 0'
               }} 
          />
          
          {/* Efeito de Papel Rasgado - Rodapé */}
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-background" 
               style={{
                 backgroundImage: 'radial-gradient(circle at 6px 12px, transparent 6px, hsl(var(--background)) 6px)',
                 backgroundSize: '12px 12px',
                 backgroundPosition: '0 0'
               }} 
          />
          
          {/* Cabeçalho - Info do Cliente */}
          <div className="text-center space-y-1 border-b border-dashed border-border pb-4">
            <h1 className="text-xl font-bold text-foreground uppercase tracking-wide">
              {bookingData.customerInfo.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {bookingData.customerInfo.address}
            </p>
            <p className="text-sm text-muted-foreground">
              {bookingData.customerInfo.bairro} - {bookingData.customerInfo.cidade}
            </p>
            <p className="text-sm text-muted-foreground">
              CEP: {bookingData.customerInfo.cep}
            </p>
            <p className="text-sm text-muted-foreground">
              Tel: {bookingData.customerInfo.phone}
            </p>
            <p className="text-base font-bold text-foreground">
              {format(bookingData.selectedDate, "dd/MM/yyyy", { locale: ptBR })}
            </p>
            {bookingData.periodo && (
              <p className="text-sm font-medium text-primary">
                {bookingData.periodo === 'Manhã' ? '🌅 Manhã' : '☀️ Tarde'}
              </p>
            )}
          </div>

          {/* Título Central */}
          <div className="text-center py-2">
            <div className="inline-flex items-center justify-center gap-2 bg-green-500/10 px-4 py-2 rounded">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-foreground uppercase">
                Agendamento Confirmado
              </h2>
            </div>
          </div>

          {/* Separador */}
          <div className="border-b border-dashed border-border"></div>

          {/* Lista de Itens */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase">
              <span>Descrição</span>
              <span>Preço</span>
            </div>
            {bookingData.selectedItems.map((item, index) => (
              <div key={index} className="space-y-1">
                {/* Categoria do Serviço */}
                <div className="bg-muted/30 px-2 py-1 rounded inline-block">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    {getServiceCategory(item)}
                  </p>
                </div>
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.details}</p>
                    <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Separador */}
          <div className="border-b border-dashed border-border"></div>

          {/* Total */}
          <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded">
            <span className="text-lg font-bold text-foreground uppercase">Total</span>
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Separador */}
          <div className="border-b border-dashed border-border"></div>

          {/* Info de Pagamento */}
          <div className="text-center text-sm text-muted-foreground px-2">
            <p>Enviamos os detalhes no seu WhatsApp.</p>
            {bookingData.formaPagamento && (
              <p className="font-medium text-foreground mt-1">
                Pagamento via {bookingData.formaPagamento === 'cartao' ? 'Cartão' : bookingData.formaPagamento === 'pix' ? 'PIX' : 'Dinheiro'}
                {bookingData.selectedItems.some(i => `${i.name} ${i.details}`.toLowerCase().match(/aluguel|máquina|equipamento/))
                  ? ' no ato da entrega'
                  : ' após o serviço'}
              </p>
            )}
            {!bookingData.formaPagamento && (
              <p>Pagamento será realizado na hora do serviço.</p>
            )}
          </div>

          {/* Separador */}
          <div className="border-b border-dashed border-border"></div>

          {/* Rodapé - Obrigado */}
          <div className="text-center space-y-2 pt-2">
            <h3 className="text-2xl font-bold text-foreground uppercase tracking-wider">
              Obrigado!
            </h3>
            <p className="text-lg font-bold text-foreground">
              #{orderCode}
            </p>
            <p className="text-xs text-muted-foreground">
              Guarde este código para referência
            </p>
          </div>
        </div>

        {/* Botão de navegação */}
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="px-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para início
          </Button>
        </div>
      </div>
    </div>
  );
}