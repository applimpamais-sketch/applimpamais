import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MobileFriendlyInput } from '@/components/ui/mobile-friendly-input';
import { Badge } from '@/components/ui/badge';
import { Gift, PartyPopper, Sparkles, Check, ChevronsUpDown, ShoppingCart } from 'lucide-react';
import { 
  CIDADES, 
  BAIRROS_BH, 
  BAIRROS_CONTAGEM,
  BAIRROS_BETIM,
  BAIRROS_NOVA_LIMA,
  BAIRROS_SARZEDO,
  BAIRROS_IBIRITE,
  BAIRROS_LAGOA_SANTA,
  BAIRROS_VESPASIANO
} from '@/data/localizacao';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface WelcomeCupomModalProps {
  isOpen: boolean;
  onClose: () => void;
  cupomCodigo?: string;
}

type ModalStep = 'form' | 'success';

export function WelcomeCupomModal({ isOpen, onClose, cupomCodigo = 'LIMPA10' }: WelcomeCupomModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<ModalStep>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    cidade: '',
    bairro: '',
  });
  const [openBairro, setOpenBairro] = useState(false);
  const [searchBairro, setSearchBairro] = useState('');

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setFormData({ nome: '', whatsapp: '', cidade: '', bairro: '' });
      setSearchBairro('');
    }
  }, [isOpen]);

  const getBairros = (cidade: string) => {
    switch(cidade) {
      case 'Belo Horizonte': return BAIRROS_BH;
      case 'Betim': return BAIRROS_BETIM;
      case 'Contagem': return BAIRROS_CONTAGEM;
      case 'Ibirité': return BAIRROS_IBIRITE;
      case 'Lagoa Santa': return BAIRROS_LAGOA_SANTA;
      case 'Nova Lima': return BAIRROS_NOVA_LIMA;
      case 'Sarzedo': return BAIRROS_SARZEDO;
      case 'Vespasiano': return BAIRROS_VESPASIANO;
      default: return [];
    }
  };

  const bairros = getBairros(formData.cidade);

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'whatsapp') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
    }
    
    if (field === 'nome') {
      formattedValue = value
        .replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
        .replace(/\s+/g, ' ');
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const validarWhatsApp = (numero: string): boolean => {
    const cleaned = numero.replace(/\D/g, '');
    return cleaned.length === 11;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.whatsapp || !formData.bairro || !formData.cidade) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos para continuar',
        variant: 'destructive',
      });
      return;
    }

    if (!validarWhatsApp(formData.whatsapp)) {
      toast({
        title: 'WhatsApp inválido',
        description: 'Digite um número de WhatsApp válido com DDD',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Salvar no banco de dados
      const { error } = await supabase
        .from('leads_cupom')
        .insert({
          nome_completo: formData.nome.trim(),
          whatsapp: formData.whatsapp,
          cidade: formData.cidade,
          bairro: formData.bairro,
          cupom_codigo: cupomCodigo,
          origem: 'popup_homepage'
        });

      if (error) {
        console.error('Erro ao salvar lead:', error);
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar seus dados. Tente novamente.',
          variant: 'destructive',
        });
        return;
      }

      // Salvar no localStorage para pré-popular checkout
      localStorage.setItem('lead_cupom', JSON.stringify({
        nome: formData.nome.trim(),
        whatsapp: formData.whatsapp,
        bairro: formData.bairro,
        cidade: formData.cidade,
        cupomCodigo,
        timestamp: Date.now()
      }));
      
      // Ir para tela de sucesso
      setStep('success');
      
    } catch (error) {
      console.error('Erro ao processar lead:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComecarEscolher = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 'form' ? (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-full">
                    <Gift className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
              
              <DialogTitle className="text-3xl font-bold text-center">
                Ganhe{' '}
                <span className="text-primary">10% OFF</span>
                {' '}em Serviços de Limpeza!
              </DialogTitle>
              
              <DialogDescription className="text-center text-base">
                Preencha seus dados para resgatar seu desconto exclusivo
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <MobileFriendlyInput
                  id="nome"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp *</Label>
                <MobileFriendlyInput
                  id="whatsapp"
                  type="tel"
                  placeholder="(31) 99999-9999"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Select 
                  value={formData.cidade} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, cidade: value, bairro: '' }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {CIDADES.map((cidade) => (
                      <SelectItem key={cidade} value={cidade}>
                        {cidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.cidade && (
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Popover open={openBairro} onOpenChange={setOpenBairro}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openBairro}
                        className="w-full justify-between"
                      >
                        {formData.bairro || "Selecione seu bairro"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Buscar bairro..." 
                          value={searchBairro}
                          onValueChange={setSearchBairro}
                        />
                        <CommandList>
                          <CommandEmpty>Nenhum bairro encontrado.</CommandEmpty>
                          <CommandGroup>
                            {bairros.map((bairro) => (
                              <CommandItem
                                key={bairro}
                                value={bairro}
                                onSelect={(currentValue) => {
                                  setFormData(prev => ({ ...prev, bairro: currentValue }));
                                  setOpenBairro(false);
                                  setSearchBairro('');
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.bairro === bairro ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {bairro}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : (
                  <>
                    <Gift className="mr-2 h-5 w-5" />
                    Resgatar Meu Desconto
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-6 pt-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-full blur-2xl opacity-50 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-primary to-blue-600 p-5 rounded-full">
                    <PartyPopper className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <DialogTitle className="text-4xl font-bold">
                  🎉 Parabéns!
                </DialogTitle>
                
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-foreground">
                    Você Ganhou 10% de Desconto!
                  </p>
                  
                  <Badge 
                    className="text-lg px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {cupomCodigo}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <p className="text-center text-muted-foreground font-medium">
                  Como usar seu desconto:
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-1.5 mt-0.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground flex-1">
                      Escolha os itens que deseja limpar
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 rounded-full p-1.5 mt-0.5">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground flex-1">
                      Adicione ao carrinho
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-full p-1.5 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm text-foreground flex-1">
                      O cupom <strong>{cupomCodigo}</strong> será aplicado automaticamente
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleComecarEscolher}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-lg py-6"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Começar a Escolher
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
