import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getValidParceiroCupom } from '@/utils/parceiroRef';
import type { Cupom } from './useCupons';

interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: number;
}

export function useCupomValidation(cartItems: CartItem[]) {
  const [cupomAplicado, setCupomAplicado] = useState<Cupom | null>(null);
  const [inputCupom, setInputCupom] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [origemCupom, setOrigemCupom] = useState<'parceiro' | 'auto' | 'manual' | null>(null);
  const cupomParceiroVerificado = useRef(false);

  // Buscar cupons auto-aplicáveis
  const { data: cuponsAutoApply } = useQuery({
    queryKey: ['cupons-auto-apply'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cupons_desconto')
        .select('*')
        .eq('auto_aplicar', true)
        .eq('status', 'ativo');
      
      if (error) throw error;
      return data as Cupom[];
    }
  });

  // Função para aplicar cupom do parceiro
  const aplicarCupomParceiro = async (codigo: string) => {
    const { data: cupom, error } = await supabase
      .from('cupons_desconto')
      .select('*')
      .eq('codigo', codigo.toUpperCase())
      .eq('status', 'ativo')
      .maybeSingle();
    
    if (!error && cupom) {
      setCupomAplicado(cupom as Cupom);
      setOrigemCupom('parceiro');
      toast({
        title: `🎁 Cupom de parceiro aplicado!`,
        description: `${cupom.codigo}: ${cupom.desconto_percentual}% de desconto`
      });
      return true;
    } else {
      console.log('[Cupom] Cupom de parceiro inválido ou expirado:', codigo);
      return false;
    }
  };

  // 1. PRIORIDADE: Verificar cupom do parceiro
  useEffect(() => {
    if (cupomParceiroVerificado.current || cupomAplicado) return;
    
    const cupomParceiro = getValidParceiroCupom();
    
    if (cupomParceiro) {
      cupomParceiroVerificado.current = true;
      aplicarCupomParceiro(cupomParceiro);
    } else {
      cupomParceiroVerificado.current = true;
    }
  }, [cupomAplicado]);

  // 2. FALLBACK: Auto-aplicar cupons da loja quando carrinho muda
  useEffect(() => {
    if (!cuponsAutoApply?.length || cupomAplicado) return;
    
    // Aguardar verificação do cupom de parceiro
    if (!cupomParceiroVerificado.current) return;
    
    const cupomAplicavel = cuponsAutoApply.find(cupom => 
      isCupomAplicavel(cupom, cartItems)
    );
    
    if (cupomAplicavel) {
      setCupomAplicado(cupomAplicavel);
      setOrigemCupom('auto');
    }
  }, [cuponsAutoApply, cartItems, cupomAplicado]);

  const getItemCategory = (item: CartItem): string => {
    const nome = item.name.toLowerCase();
    
    if (nome.includes('-biz') || item.details.toLowerCase().includes('empresa')) {
      return 'business';
    }
    
    return 'home';
  };

  const getItemType = (item: CartItem): string => {
    const nome = item.name.toLowerCase();
    
    if (nome.includes('aluguel') || nome.includes('kit')) {
      return 'aluguel';
    }
    
    if (nome.includes('combo') || nome.includes('pacote')) {
      return 'combo';
    }
    
    return 'limpeza';
  };

  const isCupomAplicavel = (cupom: Cupom, items: CartItem[]): boolean => {
    const itensElegiveis = items.filter(item => {
      const categoria = getItemCategory(item);
      const tipo = getItemType(item);
      
      if (!cupom.categorias_aplicaveis.includes(categoria)) {
        return false;
      }
      
      if (cupom.tipo_aplicacao === 'todos') return true;
      if (cupom.tipo_aplicacao === 'servicos_limpeza' && tipo === 'limpeza') return true;
      if (cupom.tipo_aplicacao === 'combos' && tipo === 'combo') return true;
      if (cupom.tipo_aplicacao === 'alugueis' && tipo === 'aluguel') return true;
      
      return false;
    });
    
    return itensElegiveis.length > 0;
  };

  const validarCupom = async (codigo: string) => {
    setErro(null);
    
    if (!codigo.trim()) {
      setErro('Digite um código de cupom');
      return false;
    }

    const { data: cupom, error } = await supabase
      .from('cupons_desconto')
      .select('*')
      .eq('codigo', codigo.toUpperCase())
      .eq('status', 'ativo')
      .single();
    
    if (error || !cupom) {
      setErro('Cupom inválido ou expirado');
      return false;
    }

    // Validar validade
    if (cupom.data_validade_fim) {
      const hoje = new Date();
      const dataFim = new Date(cupom.data_validade_fim);
      if (hoje > dataFim) {
        setErro('Cupom expirado');
        return false;
      }
    }

    if (cupom.data_validade_inicio) {
      const hoje = new Date();
      const dataInicio = new Date(cupom.data_validade_inicio);
      if (hoje < dataInicio) {
        setErro('Cupom ainda não está disponível');
        return false;
      }
    }

    // Validar limite de uso
    if (cupom.uso_maximo && cupom.uso_atual >= cupom.uso_maximo) {
      setErro('Limite de uso do cupom atingido');
      return false;
    }

    // Validar se cupom é aplicável aos itens do carrinho
    if (!isCupomAplicavel(cupom, cartItems)) {
      setErro('Cupom não aplicável aos itens do carrinho');
      return false;
    }

    setCupomAplicado(cupom as Cupom);
    setOrigemCupom('manual');
    setInputCupom('');
    toast({ 
      title: `✅ Cupom ${cupom.codigo} aplicado!`, 
      description: `${cupom.desconto_percentual}% de desconto`
    });
    return true;
  };

  const calcularDesconto = (): number => {
    if (!cupomAplicado) return 0;
    
    const subtotal = cartItems
      .filter(item => {
        const categoria = getItemCategory(item);
        const tipo = getItemType(item);
        
        if (!cupomAplicado.categorias_aplicaveis.includes(categoria)) {
          return false;
        }
        
        if (cupomAplicado.tipo_aplicacao === 'todos') return true;
        if (cupomAplicado.tipo_aplicacao === 'servicos_limpeza' && tipo === 'limpeza') return true;
        if (cupomAplicado.tipo_aplicacao === 'combos' && tipo === 'combo') return true;
        if (cupomAplicado.tipo_aplicacao === 'alugueis' && tipo === 'aluguel') return true;
        
        return false;
      })
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return (subtotal * cupomAplicado.desconto_percentual) / 100;
  };

  const removerCupom = () => {
    setCupomAplicado(null);
    setOrigemCupom(null);
    setErro(null);
    setInputCupom('');
  };

  return {
    cupomAplicado,
    inputCupom,
    setInputCupom,
    erro,
    validarCupom,
    calcularDesconto,
    removerCupom,
    origemCupom,
    isParceiroCupom: origemCupom === 'parceiro',
  };
}
