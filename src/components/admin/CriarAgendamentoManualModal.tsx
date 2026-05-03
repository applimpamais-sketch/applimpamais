import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/format';
import { Loader2, User, Phone, MapPin, Calendar, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { useServicos } from '@/hooks/useServicos';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';

interface CriarAgendamentoManualModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

interface CartItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  price: number;
}

export default function CriarAgendamentoManualModal({
  open,
  onOpenChange,
  onSuccess,
}: CriarAgendamentoManualModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: servicos = [] } = useServicos();

  // Step 1: Dados do Cliente
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [genero, setGenero] = useState('nao_identificado');

  // Step 2: Endereço
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [cep, setCep] = useState('');

  // Step 3: Serviços
  const [itensCarrinho, setItensCarrinho] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  // Step 4: Data e Horário
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [horario, setHorario] = useState('');

  // Step 5: Revisão
  const [statusInicial, setStatusInicial] = useState('pendente');
  const [observacoes, setObservacoes] = useState('');

  const resetForm = () => {
    setStep(1);
    setNomeCliente('');
    setTelefone('');
    setGenero('nao_identificado');
    setEndereco('');
    setBairro('');
    setCidade('');
    setCep('');
    setItensCarrinho([]);
    setDataAgendamento('');
    setHorario('');
    setStatusInicial('pendente');
    setObservacoes('');
  };

  const validateStep1 = () => {
    if (!nomeCliente || nomeCliente.length < 3) {
      toast.error('Nome deve ter pelo menos 3 caracteres');
      return false;
    }
    if (!telefone || telefone.replace(/\D/g, '').length < 10) {
      toast.error('Telefone inválido');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!endereco || !bairro || !cidade) {
      toast.error('Preencha todos os campos de endereço obrigatórios');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (itensCarrinho.length === 0) {
      toast.error('Adicione pelo menos um serviço');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!dataAgendamento) {
      toast.error('Selecione a data do agendamento');
      return false;
    }
    const selectedDate = new Date(dataAgendamento);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error('Data não pode ser no passado');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4 && !validateStep4()) return;
    if (step < 5) setStep((step + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleAddToCart = (servico: any, serviceType: 'limpeza' | 'impermeabilizacao' | 'combo') => {
    const price = serviceType === 'limpeza' 
      ? servico.preco_limpeza 
      : serviceType === 'impermeabilizacao'
      ? servico.preco_impermeabilizacao
      : servico.preco_limpeza_impermeabilizacao;

    const details = serviceType === 'combo' 
      ? 'Limpeza + Impermeabilização'
      : serviceType === 'limpeza'
      ? 'Apenas Limpeza'
      : 'Apenas Impermeabilização';

    const newItem: CartItem = {
      id: `${servico.id}-${serviceType}-${Date.now()}`,
      name: `${servico.item} ${servico.tamanho || ''}`,
      details,
      quantity: 1,
      price: price || 0,
    };

    setItensCarrinho([...itensCarrinho, newItem]);
    toast.success('Item adicionado ao carrinho');
  };

  const handleRemoveFromCart = (itemId: string) => {
    setItensCarrinho(itensCarrinho.filter(item => item.id !== itemId));
    toast.success('Item removido');
  };

  const calcularTotal = () => {
    return itensCarrinho.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: agendamento, error } = await supabase
        .from('agendamentos')
        .insert([{
          nome_cliente: nomeCliente,
          telefone: telefone.replace(/\D/g, ''),
          genero_cliente: genero,
          endereco,
          bairro,
          cidade,
          cep: cep || null,
          data_agendamento: dataAgendamento,
          horario: horario || null,
          itens_carrinho: itensCarrinho as any,
          valor_total: calcularTotal(),
          valor_frete: 0,
          valor_desconto: 0,
          status: statusInicial,
          origem: 'admin_manual',
          criado_por: user.id,
          criado_manualmente: true,
        }])
        .select()
        .single();

      if (error) throw error;

      // Registrar criação no histórico
      if (agendamento) {
        await supabase.from('historico_agendamentos').insert({
          agendamento_id: agendamento.id,
          tipo_alteracao: 'agendamento_criado',
          valor_novo: 'Criado manualmente pelo administrador',
          alterado_por: user.id
        });
      }

      toast.success('Agendamento criado com sucesso!');
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      toast.error(error.message || 'Erro ao criar agendamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredServicos = selectedCategory === 'todos' 
    ? servicos 
    : servicos.filter(s => s.categoria === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            ➕ Criar Agendamento - Etapa {step} de 5
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Progress Bar */}
          <div className="flex gap-1 sm:gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 sm:h-2 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step 1: Dados do Cliente */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <User className="h-5 w-5" />
                Dados do Cliente
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">
                  Nome Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nome"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">
                  Telefone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label>Gênero</Label>
                <RadioGroup value={genero} onValueChange={setGenero}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="masculino" id="masculino" />
                    <Label htmlFor="masculino">Masculino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="feminino" id="feminino" />
                    <Label htmlFor="feminino">Feminino</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao_identificado" id="outro" />
                    <Label htmlFor="outro">Não identificado</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 2: Endereço */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <MapPin className="h-5 w-5" />
                Endereço
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">
                  Endereço Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="endereco"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro" className="text-sm">
                    Bairro <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Ex: Centro"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-sm">
                    Cidade <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP (opcional)</Label>
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          )}

          {/* Step 3: Serviços */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <ShoppingCart className="h-5 w-5" />
                Selecionar Serviços
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Categorias</SelectItem>
                    <SelectItem value="estofados">Estofados</SelectItem>
                    <SelectItem value="colchoes">Colchões</SelectItem>
                    <SelectItem value="tapetes">Tapetes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Carrinho */}
              {itensCarrinho.length > 0 && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="font-semibold">Carrinho ({itensCarrinho.length} itens)</div>
                  {itensCarrinho.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span>{item.name} - {item.details}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{formatCurrency(item.price)}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(calcularTotal())}</span>
                  </div>
                </div>
              )}

              {/* Lista de Serviços */}
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                {filteredServicos.map((servico) => (
                  <Card key={servico.id} className="p-4 space-y-2">
                    <div className="font-semibold">
                      {servico.item} {servico.tamanho && `- ${servico.tamanho}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {servico.categoria} • {servico.subcategoria}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {servico.preco_limpeza && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToCart(servico, 'limpeza')}
                        >
                          Limpeza - {formatCurrency(servico.preco_limpeza)}
                        </Button>
                      )}
                      {servico.preco_impermeabilizacao && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToCart(servico, 'impermeabilizacao')}
                        >
                          Impermeab. - {formatCurrency(servico.preco_impermeabilizacao)}
                        </Button>
                      )}
                      {servico.preco_limpeza_impermeabilizacao && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAddToCart(servico, 'combo')}
                        >
                          Combo - {formatCurrency(servico.preco_limpeza_impermeabilizacao)}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Data e Horário */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Calendar className="h-5 w-5" />
                Data e Horário
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">
                  Data do Agendamento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={dataAgendamento}
                  onChange={(e) => setDataAgendamento(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario">Horário (opcional)</Label>
                <Select value={horario} onValueChange={setHorario}>
                  <SelectTrigger id="horario">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="11:00">11:00</SelectItem>
                    <SelectItem value="13:00">13:00</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                    <SelectItem value="17:00">17:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 5: Revisão */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-lg font-semibold mb-4">📋 Revisão Final</div>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Cliente</div>
                  <div className="font-medium">{nomeCliente}</div>
                  <div className="text-sm">{telefone}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Endereço</div>
                  <div className="text-sm">{endereco}, {bairro} - {cidade}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Data</div>
                  <div className="text-sm">{new Date(dataAgendamento).toLocaleDateString('pt-BR')} {horario && `às ${horario}`}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Serviços ({itensCarrinho.length})</div>
                  {itensCarrinho.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      {item.name} - {formatCurrency(item.price)}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(calcularTotal())}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status Inicial</Label>
                <Select value={statusInicial} onValueChange={setStatusInicial}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="obs">Observações Internas (opcional)</Label>
                <Textarea
                  id="obs"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Anotações internas sobre este agendamento..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            
            {step < 5 ? (
              <Button onClick={handleNext} className="flex-1">
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  '✅ Criar Agendamento'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
