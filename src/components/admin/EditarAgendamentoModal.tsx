import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Agendamento } from '@/hooks/useAgendamentos';
import { useUpdateAgendamento } from '@/hooks/useUpdateAgendamento';
import { useServicos } from '@/hooks/useServicos';
import { formatCurrency, formatPhone } from '@/utils/format';

// Helper to remove formatting from phone
const unformatPhone = (phone: string) => phone.replace(/\D/g, '');
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, Minus, Trash2, Save, Loader2, User, MapPin, Package, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getServiceIcon } from '@/utils/dashboardHelpers';

interface EditarAgendamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: Agendamento;
  onSuccess: () => void;
}

interface CartItem {
  name: string;
  details?: string;
  price: number;
  quantity: number;
}

export default function EditarAgendamentoModal({
  open,
  onOpenChange,
  agendamento,
  onSuccess
}: EditarAgendamentoModalProps) {
  const { mutate: updateAgendamento, isPending } = useUpdateAgendamento();
  const { data: servicos } = useServicos();
  
  // Form state
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [genero, setGenero] = useState<string>('nao_identificado');
  
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [cep, setCep] = useState('');
  
  const [dataAgendamento, setDataAgendamento] = useState<Date | undefined>();
  const [horario, setHorario] = useState('');
  
  const [itensCarrinho, setItensCarrinho] = useState<CartItem[]>([]);
  const [valorFrete, setValorFrete] = useState(0);
  const [valorDesconto, setValorDesconto] = useState(0);
  
  const [showAddService, setShowAddService] = useState(false);

  // Initialize form with agendamento data
  useEffect(() => {
    if (agendamento && open) {
      setNome(agendamento.nome_cliente);
      setTelefone(formatPhone(agendamento.telefone));
      setGenero(agendamento.genero_cliente || 'nao_identificado');
      
      setEndereco(agendamento.endereco);
      setBairro(agendamento.bairro || '');
      setCidade(agendamento.cidade || '');
      setCep(agendamento.cep || '');
      
      setDataAgendamento(new Date(agendamento.data_agendamento + 'T12:00:00'));
      setHorario(agendamento.horario || '');
      
      setItensCarrinho(agendamento.itens_carrinho.map((item: any) => ({
        name: item.name,
        details: item.details,
        price: item.price || 0,
        quantity: item.quantity || 1
      })));
      
      setValorFrete(agendamento.valor_frete || 0);
      setValorDesconto(agendamento.valor_desconto || 0);
    }
  }, [agendamento, open]);

  // Calculate totals
  const subtotal = itensCarrinho.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + valorFrete - valorDesconto;

  // Update item quantity
  const updateItemQuantity = (index: number, delta: number) => {
    const newItems = [...itensCarrinho];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setItensCarrinho(newItems);
  };

  // Update item price
  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...itensCarrinho];
    newItems[index].price = Math.max(0, price);
    setItensCarrinho(newItems);
  };

  // Remove item
  const removeItem = (index: number) => {
    if (itensCarrinho.length > 1) {
      setItensCarrinho(itensCarrinho.filter((_, i) => i !== index));
    }
  };

  // Add service from catalog
  const addServiceFromCatalog = (servico: any) => {
    const newItem: CartItem = {
      name: `${servico.subcategoria} - ${servico.item}`,
      details: servico.tamanho || undefined,
      price: servico.preco_limpeza || servico.preco_impermeabilizacao || 0,
      quantity: 1
    };
    setItensCarrinho([...itensCarrinho, newItem]);
    setShowAddService(false);
  };

  // Validate form
  const isValid = () => {
    return nome.trim().length >= 3 &&
           telefone.replace(/\D/g, '').length >= 10 &&
           endereco.trim().length > 0 &&
           dataAgendamento &&
           itensCarrinho.length > 0;
  };

  // Handle save
  const handleSave = () => {
    if (!isValid() || !dataAgendamento) return;

    const originalData = {
      nome_cliente: agendamento.nome_cliente,
      telefone: agendamento.telefone,
      genero_cliente: agendamento.genero_cliente,
      endereco: agendamento.endereco,
      bairro: agendamento.bairro,
      cidade: agendamento.cidade,
      cep: agendamento.cep,
      data_agendamento: agendamento.data_agendamento,
      horario: agendamento.horario,
      itens_carrinho: agendamento.itens_carrinho,
      valor_total: agendamento.valor_total,
      valor_frete: agendamento.valor_frete,
      valor_desconto: agendamento.valor_desconto
    };

    const updatedData = {
      nome_cliente: nome.trim(),
      telefone: unformatPhone(telefone),
      genero_cliente: genero === 'nao_identificado' ? null : genero,
      endereco: endereco.trim(),
      bairro: bairro.trim() || null,
      cidade: cidade.trim() || null,
      cep: cep.trim() || null,
      data_agendamento: format(dataAgendamento, 'yyyy-MM-dd'),
      horario: horario || null,
      itens_carrinho: itensCarrinho,
      valor_total: Math.max(0, total),
      valor_frete: valorFrete,
      valor_desconto: valorDesconto
    };

    updateAgendamento(
      { id: agendamento.id, data: updatedData, originalData },
      {
        onSuccess: () => {
          onSuccess();
        }
      }
    );
  };

  const horariosDisponiveis = [
    'Manhã (08h - 12h)',
    'Tarde (13h - 18h)',
    'Dia Inteiro (08h - 18h)'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>✏️ Editar Agendamento</span>
            <span className="font-mono text-sm text-muted-foreground">
              #{agendamento.id.slice(0, 8).toUpperCase()}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="cliente" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="cliente" className="text-xs md:text-sm">
              <User className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden sm:inline">Cliente</span>
            </TabsTrigger>
            <TabsTrigger value="endereco" className="text-xs md:text-sm">
              <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden sm:inline">Endereço</span>
            </TabsTrigger>
            <TabsTrigger value="servicos" className="text-xs md:text-sm">
              <Package className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden sm:inline">Serviços</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs md:text-sm">
              <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
            <TabsTrigger value="valores" className="text-xs md:text-sm">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden sm:inline">Valores</span>
            </TabsTrigger>
          </TabsList>

          {/* Cliente Tab */}
          <TabsContent value="cliente" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setTelefone(formatPhone(value));
                }}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gênero</Label>
              <RadioGroup value={genero} onValueChange={setGenero} className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="masculino" id="masculino" />
                  <Label htmlFor="masculino" className="font-normal">Masculino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="feminino" id="feminino" />
                  <Label htmlFor="feminino" className="font-normal">Feminino</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_identificado" id="nao_identificado" />
                  <Label htmlFor="nao_identificado" className="font-normal">Não informado</Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          {/* Endereço Tab */}
          <TabsContent value="endereco" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo *</Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, complemento"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  placeholder="Bairro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
          </TabsContent>

          {/* Serviços Tab */}
          <TabsContent value="servicos" className="space-y-4">
            <div className="space-y-3">
              {itensCarrinho.map((item, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getServiceIcon(item.name)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.details && (
                        <p className="text-xs text-muted-foreground">{item.details}</p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateItemQuantity(index, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateItemQuantity(index, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">R$</span>
                          <Input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                            className="w-20 h-7 text-sm"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeItem(index)}
                      disabled={itensCarrinho.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {showAddService ? (
              <Card className="p-3">
                <Label className="text-sm mb-2 block">Selecionar Serviço</Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {servicos?.map((servico) => (
                    <Button
                      key={servico.id}
                      type="button"
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => addServiceFromCatalog(servico)}
                    >
                      <div>
                        <p className="font-medium text-sm">{servico.subcategoria} - {servico.item}</p>
                        <p className="text-xs text-muted-foreground">
                          {servico.tamanho} • {formatCurrency(servico.preco_limpeza || servico.preco_impermeabilizacao || 0)}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowAddService(false)}
                >
                  Cancelar
                </Button>
              </Card>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowAddService(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Serviço
              </Button>
            )}

            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <div className="space-y-2">
              <Label>Data do Agendamento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataAgendamento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataAgendamento ? (
                      format(dataAgendamento, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataAgendamento}
                    onSelect={setDataAgendamento}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Período/Horário</Label>
              <Select value={horario} onValueChange={setHorario}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  {horariosDisponiveis.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Valores Tab */}
          <TabsContent value="valores" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="frete">Valor do Frete (R$)</Label>
              <Input
                id="frete"
                type="number"
                value={valorFrete}
                onChange={(e) => setValorFrete(parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="desconto">Valor do Desconto (R$)</Label>
              <Input
                id="desconto"
                type="number"
                value={valorDesconto}
                onChange={(e) => setValorDesconto(parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
              />
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal dos serviços:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frete:</span>
                <span>+ {formatCurrency(valorFrete)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto:</span>
                <span className="text-destructive">- {formatCurrency(valorDesconto)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(Math.max(0, total))}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid() || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
