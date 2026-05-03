import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MobileFriendlyInput } from "@/components/ui/mobile-friendly-input";
import { ScheduleCalendar } from "@/components/booking/ScheduleCalendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CheckCircle, ChevronsUpDown, Check, X, AlertCircle, CreditCard } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { cidadesMG } from "@/data/cidades-mg";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { createAgendamento } from "@/services/api";
import { useCarrinhoAbandonado } from "@/hooks/useCarrinhoAbandonado";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { normalizePhone } from "@/utils/phoneNormalizer";
import { trackInitiateCheckout } from "@/utils/facebookPixel";
import { clearLiveSessionId } from "@/utils/liveSession";
import { getValidParceiroRef, clearParceiroRef } from "@/utils/parceiroRef";
import { getValidCanalRef, clearCanalRef } from "@/utils/canalRef";
import { PaymentMethodCard } from "@/components/booking/PaymentMethodCard";
import { usePublicTenantId } from "@/hooks/usePublicTenantId";

interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: number;
}

const Agendamento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { updateSession } = useSessionTracking();
  const { data: publicTenantId } = usePublicTenantId();
  const hasTrackedCheckout = useRef(false);
  const supabaseForPublicCoupons = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    return createClient<Database>(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          "x-tenant-id": publicTenantId || "",
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }, [publicTenantId]);
  
  // Correção #1: Cart Persistence - Salvar/recuperar do localStorage
  const getCartFromStorage = (): CartItem[] => {
    try {
      const saved = localStorage.getItem('checkout_cart_backup');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const cartItemsFromState = (location.state?.cartItems || []) as CartItem[];
  const cartItems = cartItemsFromState.length > 0 ? cartItemsFromState : getCartFromStorage();
  const cupomAplicado = location.state?.cupomAplicado || null;

  // Salvar carrinho no localStorage quando entrar na página
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('checkout_cart_backup', JSON.stringify(cartItems));
    }
  }, []);

  // Atualizar sessão para checkout ao entrar na página
  useEffect(() => {
    updateSession({ etapa: 'checkout' });
  }, [updateSession]);
  
  useEffect(() => {
    if (cartItems.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens antes de agendar.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [cartItems, navigate, toast]);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [openCidades, setOpenCidades] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'Manhã' | 'Tarde' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<string>('');
  const [hasSavedData, setHasSavedData] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<string>('');
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    telefone: '',
    cep: '',
    rua: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    referencia: '',
  });

  // Calcular desconto antes do hook para evitar erros de ordem
  // Função para detectar se há aluguel no carrinho
  const temEquipamentoAluguel = (items: CartItem[]): boolean => {
    return items.some(item => {
      const nameAndDetails = `${item.name} ${item.details}`.toLowerCase();
      return (
        nameAndDetails.includes('aluguel') || 
        nameAndDetails.includes('máquina') ||
        nameAndDetails.includes('equipamento') ||
        nameAndDetails.includes('diária') ||
        nameAndDetails.includes('semanal') ||
        nameAndDetails.includes('mensal')
      );
    });
  };

  // Função para detectar se há serviços residenciais no carrinho
  const temServicoResidencial = (items: CartItem[]): boolean => {
    return items.some(item => {
      // Verificar se é aluguel (não precisa de período)
      const isAluguel = item.name.toLowerCase().includes('aluguel') || 
                        item.details.toLowerCase().includes('aluguel');
      if (isAluguel) return false;
      
      // Verificar se é combo de casa
      const isHomeCombo = item.id.includes('combo-sofa') || 
                          item.id.includes('combo-mattress');
      
      // Verificar se é serviço residencial (categoria home)
      const nameAndDetails = `${item.name} ${item.details}`.toLowerCase();
      const isHomeService = [
        'sofá', 'tapete', 'poltrona', 'cadeira', 'colchão', 'ar condicionado',
        'automóvel', 'puff', 'bebê conforto', 'carpete', 'carrinho', 'almofada'
      ].some(termo => nameAndDetails.includes(termo));
      
      return isHomeCombo || isHomeService;
    });
  };

  // Função para calcular frete baseado na cidade
  const calcularFrete = (cidade: string, temAluguel: boolean): number => {
    if (!temAluguel) return 0;
    
    const cidadeNormalizada = cidade.toLowerCase().trim();
    
    // R$ 30 para BH e Contagem
    if (cidadeNormalizada === 'belo horizonte' || cidadeNormalizada === 'contagem') {
      return 30;
    }
    
    // R$ 40 para demais cidades
    return 40;
  };

  const calcularValorDesconto = () => {
    if (!cupomAplicado) return 0;
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return (subtotal * cupomAplicado.desconto_percentual) / 100;
  };

  // Calcular valores de forma reativa
  const valorDesconto = useMemo(() => 
    calcularValorDesconto(),
    [cupomAplicado, cartItems]
  );
  
  const temAluguel = useMemo(() => 
    temEquipamentoAluguel(cartItems), 
    [cartItems]
  );

  const valorFrete = useMemo(() => 
    calcularFrete(formData.cidade, temAluguel),
    [formData.cidade, temAluguel]
  );

  // Tracking de carrinho abandonado
  const { limparCarrinhoAbandonado } = useCarrinhoAbandonado({
    cartItems,
    etapa: 'agendamento',
    customerInfo: {
      name: formData.nome ? `${formData.nome} ${formData.sobrenome}` : undefined,
      phone: formData.telefone || undefined,
      address: formData.rua || undefined,
      bairro: formData.bairro || undefined,
      cidade: formData.cidade || undefined,
      cep: formData.cep || undefined,
    },
    selectedDate,
    cupomCodigo: cupomAplicado?.codigo,
    cupomDesconto: cupomAplicado?.desconto_percentual,
    valorDesconto,
    valorFrete,
  });

  // Disparar evento InitiateCheckout quando página carregar
  useEffect(() => {
    if (cartItems.length > 0 && !hasTrackedCheckout.current) {
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const total = subtotal - valorDesconto + valorFrete;
      
      trackInitiateCheckout(cartItems, total);
      hasTrackedCheckout.current = true;
      
      // InitiateCheckout tracked
    }
  }, [cartItems, valorDesconto]);

  // Recuperar dados salvos do localStorage na inicialização
  useEffect(() => {
    const savedFormData = localStorage.getItem('agendamento_form_autosave');
    const savedDate = localStorage.getItem('agendamento_date_autosave');
    const savedPeriodo = localStorage.getItem('agendamento_periodo_autosave');
    
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        // Verificar se os dados salvos não estão muito antigos (7 dias)
        const savedTimestamp = localStorage.getItem('agendamento_autosave_timestamp');
        if (savedTimestamp) {
          const daysSinceLastSave = (Date.now() - parseInt(savedTimestamp)) / (1000 * 60 * 60 * 24);
          if (daysSinceLastSave > 7) {
            // Dados muito antigos, limpar
            localStorage.removeItem('agendamento_form_autosave');
            localStorage.removeItem('agendamento_date_autosave');
            localStorage.removeItem('agendamento_periodo_autosave');
            localStorage.removeItem('agendamento_autosave_timestamp');
            return;
          }
        }
        
        setFormData(parsed);
        setHasSavedData(true);
        
        if (savedDate) {
          setSelectedDate(new Date(savedDate));
        }
        
        if (savedPeriodo) {
          setPeriodoSelecionado(savedPeriodo as 'Manhã' | 'Tarde');
        }
        
        // Autosave data recovered
      } catch {
        // Autosave recovery failed
      }
    }
  }, []);

  // Pré-preencher dados do lead de cupom (tem prioridade sobre autosave)
  useEffect(() => {
    const leadData = localStorage.getItem('lead_cupom');
    
    if (leadData) {
      try {
        const { nome, whatsapp, bairro, cidade } = JSON.parse(leadData);
        
        // Separar nome em nome e sobrenome
        const nomeCompleto = nome.split(' ');
        const primeiroNome = nomeCompleto[0];
        const sobrenome = nomeCompleto.slice(1).join(' ') || '';
        
        setFormData(prev => ({
          ...prev,
          nome: primeiroNome,
          sobrenome: sobrenome,
          telefone: whatsapp,
          bairro: bairro,
          cidade: cidade,
          estado: 'MG'
        }));
        
        // Limpar depois de usar
        localStorage.removeItem('lead_cupom');
        setHasSavedData(false); // Reset pois dados do lead têm prioridade
        
        // Toast informativo
        toast({
          title: "Dados preenchidos! ✨",
          description: "Seus dados foram carregados automaticamente.",
        });
        
      } catch (error) {
        console.error('Erro ao carregar dados do lead:', error);
      }
    }
  }, [toast]);

  // Auto-save do formulário com debounce
  useEffect(() => {
    // Não salvar se o formulário estiver vazio
    const isFormEmpty = !formData.nome && !formData.sobrenome && !formData.telefone;
    if (isFormEmpty) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem('agendamento_form_autosave', JSON.stringify(formData));
        localStorage.setItem('agendamento_autosave_timestamp', Date.now().toString());
        
        if (selectedDate) {
          localStorage.setItem('agendamento_date_autosave', selectedDate.toISOString());
        }
        
        if (periodoSelecionado) {
          localStorage.setItem('agendamento_periodo_autosave', periodoSelecionado);
        }
        
        // Autosave successful
      } catch {
        // Autosave failed
      }
    }, 2000); // Debounce de 2 segundos

    return () => clearTimeout(timer);
  }, [formData, selectedDate, periodoSelecionado]);

  // Função para limpar dados salvos
  const limparDadosSalvos = () => {
    localStorage.removeItem('agendamento_form_autosave');
    localStorage.removeItem('agendamento_date_autosave');
    localStorage.removeItem('agendamento_periodo_autosave');
    localStorage.removeItem('agendamento_autosave_timestamp');
    setHasSavedData(false);
    
    toast({
      title: "Dados limpos",
      description: "Os dados salvos foram removidos.",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'telefone') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
    }
    
    if (field === 'cep') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .slice(0, 9);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleBlur = (field: string) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const isFieldError = (field: string, value: string) => {
    return (touchedFields[field] || showErrors) && !value;
  };

  // Validação robusta de dados
  const sanitizeString = (str: string): string => {
    return str.trim().replace(/\s+/g, ' ');
  };

  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length === 10 || digitsOnly.length === 11;
  };

  const validateCEP = (cep: string): boolean => {
    const digitsOnly = cep.replace(/\D/g, '');
    return digitsOnly.length === 8;
  };

  const isFormValid = () => {
    const basico = formData.nome && formData.sobrenome && formData.telefone && 
           formData.cep && formData.rua && formData.bairro && 
           formData.cidade && formData.estado && selectedDate && formaPagamento;
    
    // Se tem serviço residencial, período é obrigatório
    if (temServicoResidencial(cartItems)) {
      return basico && periodoSelecionado !== null;
    }
    
    return basico;
  };

  // Correção #3: Função para obter campos faltando
  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!formData.nome) missing.push('Nome');
    if (!formData.sobrenome) missing.push('Sobrenome');
    if (!formData.telefone) missing.push('Telefone');
    if (!formData.rua) missing.push('Rua');
    if (!formData.bairro) missing.push('Bairro');
    if (!formData.cidade) missing.push('Cidade');
    if (!formData.cep) missing.push('CEP');
    if (!selectedDate) missing.push('Data do agendamento');
    if (temServicoResidencial(cartItems) && !periodoSelecionado) missing.push('Período (Manhã/Tarde)');
    if (!formaPagamento) missing.push('Forma de pagamento');
    return missing;
  };

  const handleScheduleComplete = async () => {
    if (isSubmitting) return;
    
    if (!isFormValid()) {
      setShowErrors(true);
      // Mark all fields as touched
      setTouchedFields({
        nome: true, sobrenome: true, telefone: true, cep: true,
        rua: true, bairro: true, cidade: true, formaPagamento: true,
      });
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    setShowErrors(false);

    // Validação adicional de formato
    if (!validatePhone(formData.telefone)) {
      toast({
        title: "Telefone inválido",
        description: "Digite um telefone válido com DDD.",
        variant: "destructive",
      });
      return;
    }

    if (!validateCEP(formData.cep)) {
      toast({
        title: "CEP inválido",
        description: "Digite um CEP válido com 8 dígitos.",
        variant: "destructive",
      });
      return;
    }

    let agendamentoCriado = false;
    let agendamentoId = '';
    let orderCode = ''; // Correção #2: Declarar orderCode no escopo da função

    setIsSubmitting(true);
    setSubmitProgress('Validando dados...');

    // Revalidar cupom antes de processar
    if (cupomAplicado) {
      if (!publicTenantId) {
        toast({
          title: 'Loja não identificada',
          description: 'Não foi possível validar o cupom para este domínio.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        setSubmitProgress('');
        return;
      }

      const { data: cupomAtual, error: cupomError } = await supabaseForPublicCoupons
        .from('cupons_desconto')
        .select('*')
        .eq('tenant_id', publicTenantId)
        .eq('codigo', cupomAplicado.codigo)
        .eq('status', 'ativo')
        .single();
      
      if (cupomError || !cupomAtual) {
        toast({
          title: 'Cupom inválido',
          description: 'O cupom não está mais disponível.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        setSubmitProgress('');
        return;
      }
      
      // Validar data de validade
      if (cupomAtual.data_validade_fim) {
        const hoje = new Date();
        const dataFim = new Date(cupomAtual.data_validade_fim);
        if (hoje > dataFim) {
          toast({
            title: 'Cupom expirado',
            description: 'Este cupom não está mais válido.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          setSubmitProgress('');
          return;
        }
      }
      
      if (cupomAtual.data_validade_inicio) {
        const hoje = new Date();
        const dataInicio = new Date(cupomAtual.data_validade_inicio);
        if (hoje < dataInicio) {
          toast({
            title: 'Cupom não disponível',
            description: 'Este cupom ainda não está disponível.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          setSubmitProgress('');
          return;
        }
      }
      
      // Validar limite de uso
      if (cupomAtual.uso_maximo && cupomAtual.uso_atual >= cupomAtual.uso_maximo) {
        toast({
          title: 'Cupom esgotado',
          description: 'O limite de uso deste cupom foi atingido.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        setSubmitProgress('');
        return;
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal - valorDesconto + valorFrete;

    // Sanitizar e validar dados antes de enviar
    const nomeCompleto = `${sanitizeString(formData.nome)} ${sanitizeString(formData.sobrenome)}`;
    // 🔧 CORREÇÃO CRÍTICA: Remover formatação de telefone e CEP (edge function espera apenas números)
    const telefoneFormatado = sanitizeString(formData.telefone).replace(/\D/g, ''); // Remove tudo exceto dígitos
    const enderecoCompleto = `${sanitizeString(formData.rua)}${formData.complemento ? ', ' + sanitizeString(formData.complemento) : ''}`;
    const bairroFormatado = sanitizeString(formData.bairro);
    const cidadeCompleta = `${sanitizeString(formData.cidade)} - ${formData.estado}`;
    const cepFormatado = sanitizeString(formData.cep).replace(/\D/g, ''); // Remove hífen

    // Validação final para garantir que não há campos vazios
    if (!nomeCompleto || nomeCompleto === ' ' || !telefoneFormatado || !enderecoCompleto || !bairroFormatado || !cidadeCompleta || !cepFormatado) {
      toast({
        title: "Dados inválidos",
        description: "Preencha todos os campos corretamente.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setSubmitProgress('');
      return;
    }

    // Creating appointment with validated data

    try {
      // === CRÍTICO: Criar o agendamento ===
      setSubmitProgress('Criando agendamento...');
      
      // Obter código de parceiro válido (se existir)
      const parceiroRef = getValidParceiroRef();
       
       // Obter canal de origem válido (se existir)
       const canalRef = getValidCanalRef();
      
      const agendamento = await createAgendamento({
        nome_cliente: nomeCompleto,
        telefone: telefoneFormatado,
        endereco: enderecoCompleto,
        bairro: bairroFormatado,
        cidade: cidadeCompleta,
        cep: cepFormatado,
        data_agendamento: format(selectedDate!, 'yyyy-MM-dd'),
        itens_carrinho: cartItems,
        valor_total: total,
        cupom_codigo: cupomAplicado?.codigo || null,
        cupom_desconto_percentual: cupomAplicado?.desconto_percentual || null,
        valor_desconto: valorDesconto,
        valor_frete: valorFrete,
        horario: periodoSelecionado || "14:00 - 16:00",
        parceiro_codigo: parceiroRef,
        canal_origem: canalRef,
        forma_pagamento: formaPagamento,
        tenant_id: publicTenantId ?? null,
      });
      
      agendamentoCriado = true;
      agendamentoId = agendamento.id;
      // 🔧 CORREÇÃO: Garantir fallback seguro para orderCode
      orderCode = agendamento.order_code 
        ?? agendamento.orderCode 
        ?? `LS-${Math.floor(Math.random() * 900000) + 100000}`;
      // Appointment created successfully

      // === NÃO-CRÍTICO: Atualizar lead se existir ===
      try {
        if (!publicTenantId) {
          throw new Error('tenant-publico-ausente');
        }

        const { data: leadExistente, error: leadError } = await supabaseForPublicCoupons
          .from('leads_cupom')
          .select('id')
          .eq('tenant_id', publicTenantId)
          .eq('whatsapp', telefoneFormatado)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // 🔧 CORREÇÃO: usar maybeSingle() ao invés de single() para evitar erro se não existir
        
        if (leadError) {
          // Silenciar erro 406 (Not Acceptable) - não é crítico
          // Non-critical: Lead lookup failed
        } else if (leadExistente) {
          await supabaseForPublicCoupons
            .from('leads_cupom')
            .update({
              converteu_em_agendamento: true,
              agendamento_id: agendamento.id
            })
            .eq('tenant_id', publicTenantId)
            .eq('id', leadExistente.id);
          // Lead marked as converted
        }
      } catch (leadErr) {
        // Silenciar completamente erros de lead - não deve quebrar o fluxo
        // Non-critical: Lead update exception ignored
      }

      setSubmitProgress('Enviando notificações...');

      // Formatar lista de serviços
      const servicosTexto = cartItems
        .map(item => `${item.name} - ${item.details} (${item.quantity}x)`)
        .join(', ');

      // === NÃO-CRÍTICO: Enviar mensagens WhatsApp ===
      try {
        const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
          body: {
            clienteNome: `${formData.nome} ${formData.sobrenome}`,
            clienteTelefone: formData.telefone,
            servicos: servicosTexto,
            data: format(selectedDate!, "dd/MM/yyyy"),
            periodo: periodoSelecionado || null,
            valorTotal: `R$ ${total.toFixed(2).replace('.', ',')}`,
            endereco: `${formData.rua}${formData.complemento ? ', ' + formData.complemento : ''}`,
            bairro: formData.bairro,
            cidade: `${formData.cidade} - ${formData.estado}`,
            cep: formData.cep,
            observacoes: formData.referencia || 'Nenhuma',
            agendamento_id: agendamentoId, // ID para confirmação interativa do funcionário
          }
        });

        if (whatsappError) {
          console.error('⚠️ [Checkout] Erro ao enviar WhatsApp (não-crítico):', whatsappError);
        }
      } catch (whatsappErr) {
        console.error('⚠️ [Checkout] Erro ao chamar edge function (não-crítico):', whatsappErr);
      }

      // === NÃO-CRÍTICO: Limpar carrinho abandonado e atualizar sessão ===
      try {
        setSubmitProgress('Finalizando...');
        limparCarrinhoAbandonado();
        updateSession({ etapa: 'concluido' });
        clearLiveSessionId();
        
        // Limpar dados do autosave
        localStorage.removeItem('agendamento_form_autosave');
        localStorage.removeItem('agendamento_date_autosave');
        localStorage.removeItem('agendamento_periodo_autosave');
        localStorage.removeItem('agendamento_autosave_timestamp');
         
         // Limpar referências de parceiro e canal após sucesso
         clearParceiroRef();
         clearCanalRef();
      } catch (trackingErr) {
        console.error('⚠️ [Checkout] Erro ao atualizar tracking (não-crítico):', trackingErr);
      }

      // Sucesso: navegar para checkout com valor líquido
      navigate('/checkout', {
        state: {
          bookingData: {
            selectedDate: selectedDate!,
            selectedItems: cartItems,
            customerInfo: {
              name: `${formData.nome} ${formData.sobrenome}`,
              phone: normalizePhone(formData.telefone),
              address: `${formData.rua}${formData.complemento ? ', ' + formData.complemento : ''}`,
              bairro: formData.bairro,
              cidade: `${formData.cidade} - ${formData.estado}`,
              cep: formData.cep,
              observacoes: formData.referencia,
            },
            timeSlot: periodoSelecionado || "14:00 - 16:00",
            periodo: periodoSelecionado || undefined,
            orderCode,
            formaPagamento,
            valorTotal: total, // Valor líquido (subtotal - desconto + frete)
          }
        }
      });

      toast({
        title: "Agendamento realizado!",
        description: `Seu pedido foi registrado com o código ${orderCode}`,
      });

    } catch (error: any) {
      // Se o agendamento foi criado mas houve erro em etapas secundárias
      if (agendamentoCriado) {
        console.error('⚠️ [Checkout] Agendamento criado mas houve erro secundário:', error);
        
        // Limpar dados do autosave pois o agendamento foi criado
        localStorage.removeItem('agendamento_form_autosave');
        localStorage.removeItem('agendamento_date_autosave');
        localStorage.removeItem('agendamento_periodo_autosave');
        localStorage.removeItem('agendamento_autosave_timestamp');
        
        toast({
          title: "Agendamento criado com sucesso",
          description: `Seu pedido foi registrado com código ${orderCode}. Nossa equipe foi notificada.`,
          variant: "default",
        });

        // Navegar para checkout mesmo assim com valor líquido
        navigate('/checkout', {
          state: {
            bookingData: {
              selectedDate: selectedDate!,
              selectedItems: cartItems,
              customerInfo: {
                name: `${formData.nome} ${formData.sobrenome}`,
                phone: normalizePhone(formData.telefone),
                address: `${formData.rua}${formData.complemento ? ', ' + formData.complemento : ''}`,
                bairro: formData.bairro,
                cidade: `${formData.cidade} - ${formData.estado}`,
                cep: formData.cep,
                observacoes: formData.referencia,
              },
              timeSlot: periodoSelecionado || "14:00 - 16:00",
              periodo: periodoSelecionado || undefined,
              orderCode,
              formaPagamento,
              valorTotal: total,
            }
          }
        });
        
        setIsSubmitting(false);
        setSubmitProgress('');
        return;
      }

      // Se o agendamento NÃO foi criado, tratamos como erro crítico
      console.error('❌ [Checkout] Erro ao criar agendamento:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        source: error?.source,
        status: error?.status,
        timestamp: new Date().toISOString(),
      });
      
      // Tratamento de erro simplificado e user-friendly
      let errorTitle = "Erro ao agendar";
      let errorDescription = "Não foi possível criar seu agendamento. Por favor, tente novamente em alguns instantes.";
      let errorVariant: "destructive" | "default" = "destructive";
      
      // 🔧 CORREÇÃO: Mostrar detalhes do erro quando disponível
      if (error?.missing_fields && error.missing_fields.length > 0) {
        errorTitle = "Campos inválidos";
        errorDescription = `Verifique: ${error.missing_fields.join(', ')}`;
      } else if (error?.hint) {
        errorDescription = `${error.message || 'Erro ao processar'}. ${error.hint}`;
      }
      
      // Log request_id para suporte
      if (error?.request_id) {
        console.error(`🔍 [Checkout] Request ID para suporte: ${error.request_id}`);
      }
      
      // Log detalhado para debug, mas mensagem genérica para o usuário
      if (error?.message?.toLowerCase().includes('row-level security') || 
          error?.message?.toLowerCase().includes('permission')) {
        console.error('🚨 [Checkout] Erro de permissão detectado:', {
          error,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
          source: error?.source
        });
        
        // Mensagem genérica para o usuário (não expor detalhes técnicos)
        errorTitle = "Erro ao agendar";
        errorDescription = "Não foi possível processar seu agendamento. Por favor, tente novamente em alguns instantes.";
      }
      // Erro de conexão/timeout
      else if (
        error?.code === 'PGRST116' || 
        error?.code === '503' || 
        error?.code === '504' ||
        error?.message?.toLowerCase().includes('network') ||
        error?.message?.toLowerCase().includes('timeout')
      ) {
        errorTitle = "Erro de conexão";
        errorDescription = "Verifique sua conexão com a internet e tente novamente.";
      }
      // Erro de validação de dados
      else if (
        error?.code?.startsWith('23') || // Postgres constraint errors
        error?.message?.toLowerCase().includes('constraint') ||
        error?.message?.toLowerCase().includes('invalid')
      ) {
        errorTitle = "Dados inválidos";
        errorDescription = "Alguns dados estão incorretos. Verifique e tente novamente.";
      }
      // Erro desconhecido
      else {
        errorDescription = error?.message || "Erro desconhecido. Por favor, entre em contato conosco.";
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: errorVariant,
      });
    } finally {
      setIsSubmitting(false);
      setSubmitProgress('');
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary" />
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary" />
          <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-muted" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Agendamento</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Preencha seus dados e escolha a data</p>
          </div>
        </div>

        {/* Banner de dados salvos */}
        {hasSavedData && (
          <div className="mb-4 sm:mb-6 bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4 flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-foreground">Dados recuperados</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Seus dados foram salvos automaticamente. Continue de onde parou!
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={limparDadosSalvos}
              className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive"
              title="Limpar dados salvos"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          {/* Seus Dados */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Seus Dados
              </h3>
              <span className="text-xs sm:text-sm text-muted-foreground">Obrigatórios</span>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Nome <span className="text-destructive">*</span></Label>
                  <MobileFriendlyInput
                    placeholder="Digite seu nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    onBlur={() => handleBlur('nome')}
                    className={cn("mt-1.5", isFieldError('nome', formData.nome) && "border-destructive")}
                  />
                  {isFieldError('nome', formData.nome) && <p className="text-xs text-destructive mt-1">Nome é obrigatório</p>}
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Sobrenome <span className="text-destructive">*</span></Label>
                  <MobileFriendlyInput
                    placeholder="Digite seu sobrenome"
                    value={formData.sobrenome}
                    onChange={(e) => handleInputChange('sobrenome', e.target.value)}
                    onBlur={() => handleBlur('sobrenome')}
                    className={cn("mt-1.5", isFieldError('sobrenome', formData.sobrenome) && "border-destructive")}
                  />
                  {isFieldError('sobrenome', formData.sobrenome) && <p className="text-xs text-destructive mt-1">Sobrenome é obrigatório</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Telefone/WhatsApp <span className="text-destructive">*</span></Label>
                  <MobileFriendlyInput
                    placeholder="(DD) 90000-0000"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    onBlur={() => handleBlur('telefone')}
                    className={cn("mt-1.5", isFieldError('telefone', formData.telefone) && "border-destructive")}
                  />
                  {isFieldError('telefone', formData.telefone) && <p className="text-xs text-destructive mt-1">Telefone é obrigatório</p>}
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">CEP <span className="text-destructive">*</span></Label>
                  <MobileFriendlyInput
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => handleInputChange('cep', e.target.value)}
                    onBlur={() => handleBlur('cep')}
                    className={cn("mt-1.5", isFieldError('cep', formData.cep) && "border-destructive")}
                  />
                  {isFieldError('cep', formData.cep) && <p className="text-xs text-destructive mt-1">CEP é obrigatório</p>}
                </div>
              </div>
            </div>
          </Card>

          {/* Endereço Completo */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Endereço Completo
              </h3>
              <span className="text-xs sm:text-sm text-muted-foreground">Obrigatórios</span>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-xs sm:text-sm text-muted-foreground">Rua e Número <span className="text-destructive">*</span></Label>
                <MobileFriendlyInput
                  placeholder="Ex: Rua das Flores, 123"
                  value={formData.rua}
                  onChange={(e) => handleInputChange('rua', e.target.value)}
                  onBlur={() => handleBlur('rua')}
                  className={cn("mt-1.5", isFieldError('rua', formData.rua) && "border-destructive")}
                />
                {isFieldError('rua', formData.rua) && <p className="text-xs text-destructive mt-1">Rua é obrigatório</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Complemento</Label>
                  <MobileFriendlyInput
                    placeholder="Apto, bloco (opcional)"
                    value={formData.complemento}
                    onChange={(e) => handleInputChange('complemento', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Bairro <span className="text-destructive">*</span></Label>
                  <MobileFriendlyInput
                    placeholder="Digite o bairro"
                    value={formData.bairro}
                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                    onBlur={() => handleBlur('bairro')}
                    className={cn("mt-1.5", isFieldError('bairro', formData.bairro) && "border-destructive")}
                  />
                  {isFieldError('bairro', formData.bairro) && <p className="text-xs text-destructive mt-1">Bairro é obrigatório</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">
                    Cidade <span className="text-destructive">*</span> {temAluguel && <span className="text-primary">(frete calculado automaticamente)</span>}
                  </Label>
                  <Popover open={openCidades} onOpenChange={setOpenCidades}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCidades}
                        className={cn("w-full justify-between mt-1.5 font-normal", isFieldError('cidade', formData.cidade) && "border-destructive")}
                      >
                        {formData.cidade || "Selecione a cidade..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar cidade..." />
                        <CommandList>
                          <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                          <CommandGroup>
                            {cidadesMG.map((cidade) => (
                              <CommandItem
                                key={cidade}
                                value={cidade}
                                onSelect={(currentValue) => {
                                  handleInputChange('cidade', currentValue);
                                  handleInputChange('estado', 'MG');
                                  setOpenCidades(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.cidade === cidade ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {cidade}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm text-muted-foreground">Estado</Label>
                  <MobileFriendlyInput
                    placeholder="MG"
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="mt-1.5"
                    disabled
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs sm:text-sm text-muted-foreground">Ponto de Referência (Opcional)</Label>
                <MobileFriendlyInput
                  placeholder="Ex: Próximo ao mercado"
                  value={formData.referencia}
                  onChange={(e) => handleInputChange('referencia', e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </Card>

          {/* Escolha a Data */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Escolha a Data
              </h3>
              
              <div className="hidden sm:flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span>Disponível</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span>Limitado</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                  <span>Indisponível</span>
                </div>
              </div>
            </div>

            <ScheduleCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />

            {selectedDate && (
              <div className="mt-4 p-3 lg:p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground">
                    Data selecionada: {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Seleção de Período - só aparece para serviços residenciais */}
          {temServicoResidencial(cartItems) && selectedDate && (
            <Card className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Escolha o Período
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Card 
                  className={cn(
                    "p-4 cursor-pointer transition-all border-2 hover:shadow-lg",
                    periodoSelecionado === 'Manhã' 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setPeriodoSelecionado('Manhã')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🌅</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base sm:text-lg">Manhã</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">08:00 - 12:00</p>
                    </div>
                    {periodoSelecionado === 'Manhã' && (
                      <Check className="text-primary" size={20} />
                    )}
                  </div>
                </Card>

                <Card 
                  className={cn(
                    "p-4 cursor-pointer transition-all border-2 hover:shadow-lg",
                    periodoSelecionado === 'Tarde' 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setPeriodoSelecionado('Tarde')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">☀️</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base sm:text-lg">Tarde</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">13:00 - 18:00</p>
                    </div>
                    {periodoSelecionado === 'Tarde' && (
                      <Check className="text-primary" size={20} />
                    )}
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {/* Forma de Pagamento */}
          <PaymentMethodCard
            selected={formaPagamento}
            onSelect={setFormaPagamento}
            temAluguel={temAluguel}
            temServico={temServicoResidencial(cartItems)}
            touched={touchedFields['formaPagamento'] || showErrors}
          />

          {/* Resumo do Pedido */}
          <Card className="p-4 sm:p-6 bg-muted/30">
            <h3 className="text-base sm:text-lg font-semibold mb-3">Resumo do Pedido</h3>
            
            <div className="space-y-2 text-xs sm:text-sm mb-4">
              {cartItems.map((item, idx) => (
                <p key={idx} className="text-foreground">
                  {item.name} • {item.details} • Qtd: {item.quantity}
                </p>
              ))}
            </div>
            
            <div className="space-y-2 border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2).replace('.', ',')}</span>
              </div>
              
              {valorDesconto > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Desconto ({cupomAplicado?.codigo})
                  </span>
                  <span className="text-green-600">
                    -R$ {valorDesconto.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}
              
              {valorFrete > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete (Entrega do Equipamento)</span>
                  <span>R$ {valorFrete.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-primary">
                  R$ {(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) - valorDesconto + valorFrete).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            
            {selectedDate && (
              <p className="text-muted-foreground text-xs sm:text-sm mt-3 pt-3 border-t">
                📅 Data: {format(selectedDate, "dd/MM/yyyy")}
              </p>
            )}
            
            {formData.rua && formData.cidade && (
              <p className="text-muted-foreground text-xs sm:text-sm">
                📍 Endereço: {formData.rua}, {formData.cidade} - {formData.estado}
              </p>
            )}
          </Card>

          {/* Botões de Ação */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-md p-4 -mx-4 border-t sm:static sm:bg-transparent sm:backdrop-blur-none sm:p-0 sm:border-t-0">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Lista de erros visível (mobile-friendly) */}
              {showErrors && !isFormValid() && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-destructive mb-1">Campos obrigatórios faltando:</p>
                      <ul className="text-xs text-destructive/80 space-y-0.5">
                        {getMissingFields().map((field) => (
                          <li key={field}>• {field}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
              >
                Voltar
              </Button>
              
              <Button
                onClick={handleScheduleComplete}
                disabled={isSubmitting}
                className="flex-1 h-11 sm:h-12 text-sm sm:text-base relative"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs sm:text-sm">{submitProgress}</span>
                  </div>
                ) : (
                  <>
                    {!isFormValid() && <AlertCircle className="w-4 h-4 mr-2" />}
                    Concluir Agendamento
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agendamento;
