import { useState } from 'react';
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
import { Gift, X, Check, ChevronsUpDown } from 'lucide-react';
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

interface CupomLeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  cupomCodigo: string;
}

export function CupomLeadCaptureModal({ isOpen, onClose, cupomCodigo }: CupomLeadCaptureModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    cidade: '',
    bairro: '',
  });
  const [openBairro, setOpenBairro] = useState(false);
  const [searchBairro, setSearchBairro] = useState('');

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

    try {
      // Copiar código do cupom
      await navigator.clipboard.writeText(cupomCodigo);
      
      // Salvar no localStorage
      localStorage.setItem('lead_cupom', JSON.stringify({
        nome: formData.nome.trim(),
        whatsapp: formData.whatsapp,
        bairro: formData.bairro,
        cidade: formData.cidade,
        cupomCodigo,
        timestamp: new Date().toISOString()
      }));
      
      // Toast de sucesso
      toast({
        title: '✨ Cupom copiado!',
        description: (
          <div className="space-y-1">
            <p className="font-semibold">Código: {cupomCodigo}</p>
            <p className="text-xs">Redirecionando para escolher seus serviços...</p>
          </div>
        ),
        duration: 5000,
      });
      
      // Fechar modal
      onClose();
      
      // Redirecionar após delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao processar cupom:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o cupom. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        {/* Header e formulário */}
        <div className="p-6">
          <DialogHeader className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute -right-1 -top-1 h-9 w-9 rounded-full hover:bg-muted-foreground/10 transition-colors z-10"
              aria-label="Fechar modal"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-600/10 p-4 rounded-full">
                <Gift className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">
              Quase lá! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              Preencha seus dados para desbloquear seu desconto
            </DialogDescription>
          </DialogHeader>

          <form id="cupom-form" onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium">
                Nome completo *
              </Label>
              <MobileFriendlyInput
                id="nome"
                placeholder="Digite seu nome completo"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                required
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp *
              </Label>
              <MobileFriendlyInput
                id="whatsapp"
                placeholder="(31) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                required
              />
            </div>

            {/* Cidade */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cidade *</Label>
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
                  {CIDADES.map(cidade => (
                    <SelectItem key={cidade} value={cidade}>
                      {cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bairro com Autocomplete */}
            {formData.cidade && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Bairro *</Label>
                <Popover open={openBairro} onOpenChange={setOpenBairro}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openBairro}
                      className="w-full justify-between h-12 font-normal"
                    >
                      {formData.bairro || "Digite ou selecione seu bairro"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Digite para buscar..." 
                        value={searchBairro}
                        onValueChange={setSearchBairro}
                      />
                      <CommandList>
                        <CommandEmpty>Nenhum bairro encontrado.</CommandEmpty>
                        <CommandGroup>
                          {bairros
                            .filter(bairro => 
                              bairro.toLowerCase().includes(searchBairro.toLowerCase())
                            )
                            .map((bairro) => (
                              <CommandItem
                                key={bairro}
                                value={bairro}
                                onSelect={(currentValue) => {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    bairro: currentValue === formData.bairro ? '' : currentValue 
                                  }));
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
          </form>
        </div>

        {/* NOVO: Rodapé fixo com código do cupom */}
        <div className="border-t bg-muted/30 p-6 space-y-3">
          <p className="text-xs text-center text-muted-foreground">
            Copie e cole o código no carrinho de compras
          </p>
          
          <div className="flex items-center gap-3">
            {/* Box do código */}
            <div className="flex-1 bg-background border-2 border-dashed border-border rounded-lg p-3 text-center">
              <p className="text-2xl font-bold font-mono tracking-wider text-foreground">
                {cupomCodigo}
              </p>
            </div>
            
            {/* Botão copiar */}
            <Button
              type="submit"
              form="cupom-form"
              disabled={!formData.nome || !formData.whatsapp || !formData.cidade || !formData.bairro}
              className="bg-[#00A859] hover:bg-[#008F4D] text-white px-6 h-auto py-3 font-semibold shadow-md hover:shadow-lg transition-all text-sm leading-tight"
            >
              Copiar e ir<br />pra loja
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
