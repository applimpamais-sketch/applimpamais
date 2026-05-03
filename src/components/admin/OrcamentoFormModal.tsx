import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Building2, User } from 'lucide-react';
import { useCreateOrcamento, OrcamentoItem, OrcamentoFormData } from '@/hooks/useOrcamentos';
import { homeMostScheduledServices, businessMostScheduledServices } from '@/data/services';
import { ScrollArea } from '@/components/ui/scroll-area';

// Lista combinada de serviços com preços estimados para orçamentos
const servicosOrcamento = [
  { id: 'sofa-2lug', name: 'Sofá 2 Lugares', price: 150 },
  { id: 'sofa-3lug', name: 'Sofá 3 Lugares', price: 180 },
  { id: 'sofa-4lug', name: 'Sofá 4 Lugares', price: 220 },
  { id: 'sofa-retratil', name: 'Sofá Retrátil', price: 250 },
  { id: 'sofa-canto', name: 'Sofá de Canto', price: 300 },
  { id: 'poltrona', name: 'Poltrona', price: 80 },
  { id: 'cadeira', name: 'Cadeira (unidade)', price: 25 },
  { id: 'cadeira-6', name: 'Cadeiras (6 unidades)', price: 120 },
  { id: 'colchao-solteiro', name: 'Colchão Solteiro', price: 100 },
  { id: 'colchao-casal', name: 'Colchão Casal', price: 150 },
  { id: 'colchao-queen', name: 'Colchão Queen', price: 180 },
  { id: 'colchao-king', name: 'Colchão King', price: 220 },
  { id: 'tapete-m2', name: 'Tapete (por m²)', price: 35 },
  { id: 'carpete-m2', name: 'Carpete (por m²)', price: 25 },
  { id: 'banco-carro', name: 'Bancos do Carro', price: 200 },
  { id: 'puff', name: 'Puff', price: 50 },
  { id: 'cabeceira', name: 'Cabeceira', price: 80 },
  { id: 'ar-condicionado', name: 'Ar Condicionado (limpeza)', price: 180 },
];

interface OrcamentoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrcamentoFormModal({ open, onOpenChange }: OrcamentoFormModalProps) {
  const createOrcamento = useCreateOrcamento();
  const [tipoCliente, setTipoCliente] = useState<'pessoa' | 'empresa'>('pessoa');
  
  const [formData, setFormData] = useState<OrcamentoFormData>({
    cliente_nome: '',
    cliente_email: '',
    cliente_telefone: '',
    cliente_documento: '',
    cliente_endereco: '',
    cliente_cidade: '',
    empresa_nome: '',
    itens: [],
    desconto_tipo: undefined,
    desconto_valor: 0,
    condicoes_pagamento: '',
    observacoes: '',
    validade_dias: 15,
  });

  const [novoItem, setNovoItem] = useState({
    descricao: '',
    quantidade: 1,
    valor_unitario: 0,
  });

  const handleAddItem = () => {
    if (!novoItem.descricao || novoItem.valor_unitario <= 0) return;

    const item: OrcamentoItem = {
      id: crypto.randomUUID(),
      descricao: novoItem.descricao,
      quantidade: novoItem.quantidade,
      valor_unitario: novoItem.valor_unitario,
      valor_total: novoItem.quantidade * novoItem.valor_unitario,
    };

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, item],
    }));

    setNovoItem({ descricao: '', quantidade: 1, valor_unitario: 0 });
  };

  const handleAddServico = (servicoId: string) => {
    const servico = servicosOrcamento.find(s => s.id === servicoId);
    if (!servico) return;

    const item: OrcamentoItem = {
      id: crypto.randomUUID(),
      descricao: servico.name,
      quantidade: 1,
      valor_unitario: servico.price,
      valor_total: servico.price,
    };

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, item],
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter(i => i.id !== itemId),
    }));
  };

  const handleUpdateItemQty = (itemId: string, qty: number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.map(item => 
        item.id === itemId 
          ? { ...item, quantidade: qty, valor_total: qty * item.valor_unitario }
          : item
      ),
    }));
  };

  const subtotal = formData.itens.reduce((sum, item) => sum + item.valor_total, 0);
  
  const calcularDesconto = () => {
    if (!formData.desconto_valor || formData.desconto_valor <= 0) return 0;
    if (formData.desconto_tipo === 'percentual') {
      return subtotal * (formData.desconto_valor / 100);
    }
    return formData.desconto_valor;
  };

  const valorTotal = subtotal - calcularDesconto();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_nome || formData.itens.length === 0) {
      return;
    }

    await createOrcamento.mutateAsync(formData);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cliente_nome: '',
      cliente_email: '',
      cliente_telefone: '',
      cliente_documento: '',
      cliente_endereco: '',
      cliente_cidade: '',
      empresa_nome: '',
      itens: [],
      desconto_tipo: undefined,
      desconto_valor: 0,
      condicoes_pagamento: '',
      observacoes: '',
      validade_dias: 15,
    });
    setNovoItem({ descricao: '', quantidade: 1, valor_unitario: 0 });
    setTipoCliente('pessoa');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Novo Orçamento</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Cliente */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={tipoCliente === 'pessoa' ? 'default' : 'outline'}
                onClick={() => setTipoCliente('pessoa')}
                className="flex-1"
              >
                <User className="w-4 h-4 mr-2" />
                Pessoa Física
              </Button>
              <Button
                type="button"
                variant={tipoCliente === 'empresa' ? 'default' : 'outline'}
                onClick={() => setTipoCliente('empresa')}
                className="flex-1"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Empresa
              </Button>
            </div>

            {/* Dados do Cliente */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Dados do Cliente
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tipoCliente === 'empresa' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="empresa_nome">Nome da Empresa *</Label>
                    <Input
                      id="empresa_nome"
                      value={formData.empresa_nome}
                      onChange={e => setFormData(prev => ({ ...prev, empresa_nome: e.target.value }))}
                      placeholder="Razão Social"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="cliente_nome">
                    {tipoCliente === 'empresa' ? 'Responsável *' : 'Nome Completo *'}
                  </Label>
                  <Input
                    id="cliente_nome"
                    value={formData.cliente_nome}
                    onChange={e => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                    placeholder={tipoCliente === 'empresa' ? 'Nome do responsável' : 'Nome do cliente'}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cliente_documento">
                    {tipoCliente === 'empresa' ? 'CNPJ' : 'CPF'}
                  </Label>
                  <Input
                    id="cliente_documento"
                    value={formData.cliente_documento}
                    onChange={e => setFormData(prev => ({ ...prev, cliente_documento: e.target.value }))}
                    placeholder={tipoCliente === 'empresa' ? '00.000.000/0001-00' : '000.000.000-00'}
                  />
                </div>

                <div>
                  <Label htmlFor="cliente_telefone">Telefone</Label>
                  <Input
                    id="cliente_telefone"
                    value={formData.cliente_telefone}
                    onChange={e => setFormData(prev => ({ ...prev, cliente_telefone: e.target.value }))}
                    placeholder="(31) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="cliente_email">E-mail</Label>
                  <Input
                    id="cliente_email"
                    type="email"
                    value={formData.cliente_email}
                    onChange={e => setFormData(prev => ({ ...prev, cliente_email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="cliente_endereco">Endereço</Label>
                  <Input
                    id="cliente_endereco"
                    value={formData.cliente_endereco}
                    onChange={e => setFormData(prev => ({ ...prev, cliente_endereco: e.target.value }))}
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div>
                  <Label htmlFor="cliente_cidade">Cidade</Label>
                  <Input
                    id="cliente_cidade"
                    value={formData.cliente_cidade}
                    onChange={e => setFormData(prev => ({ ...prev, cliente_cidade: e.target.value }))}
                    placeholder="Belo Horizonte - MG"
                  />
                </div>
              </div>
            </div>

            {/* Serviços */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Serviços / Itens
              </h3>

              {/* Adicionar do catálogo */}
              <div className="flex gap-2">
                <Select onValueChange={handleAddServico}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Adicionar serviço do catálogo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {servicosOrcamento.map(servico => (
                      <SelectItem key={servico.id} value={servico.id}>
                        {servico.name} - {formatCurrency(servico.price)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Adicionar item personalizado */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="item_descricao">Descrição</Label>
                  <Input
                    id="item_descricao"
                    value={novoItem.descricao}
                    onChange={e => setNovoItem(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Item personalizado..."
                  />
                </div>
                <div className="w-20">
                  <Label htmlFor="item_qty">Qtd</Label>
                  <Input
                    id="item_qty"
                    type="number"
                    min={1}
                    value={novoItem.quantidade}
                    onChange={e => setNovoItem(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor="item_valor">Valor Unit.</Label>
                  <Input
                    id="item_valor"
                    type="number"
                    step="0.01"
                    min={0}
                    value={novoItem.valor_unitario}
                    onChange={e => setNovoItem(prev => ({ ...prev, valor_unitario: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <Button type="button" onClick={handleAddItem} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Lista de itens */}
              {formData.itens.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2">Descrição</th>
                        <th className="text-center p-2 w-20">Qtd</th>
                        <th className="text-right p-2 w-28">Unit.</th>
                        <th className="text-right p-2 w-28">Total</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.itens.map(item => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2">{item.descricao}</td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min={1}
                              value={item.quantidade}
                              onChange={e => handleUpdateItemQty(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 h-8 text-center"
                            />
                          </td>
                          <td className="p-2 text-right">{formatCurrency(item.valor_unitario)}</td>
                          <td className="p-2 text-right font-medium">{formatCurrency(item.valor_total)}</td>
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Desconto e Valores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                  Desconto
                </h3>
                <div className="flex gap-2">
                  <Select
                    value={formData.desconto_tipo || ''}
                    onValueChange={v => setFormData(prev => ({ 
                      ...prev, 
                      desconto_tipo: v as 'percentual' | 'fixo' | undefined 
                    }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentual">%</SelectItem>
                      <SelectItem value="fixo">R$</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.desconto_valor || ''}
                    onChange={e => setFormData(prev => ({ ...prev, desconto_valor: parseFloat(e.target.value) || 0 }))}
                    placeholder="Valor"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2 p-4 bg-primary/5 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {calcularDesconto() > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Desconto:</span>
                    <span>- {formatCurrency(calcularDesconto())}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(valorTotal)}</span>
                </div>
              </div>
            </div>

            {/* Condições e Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validade_dias">Validade (dias)</Label>
                <Select
                  value={String(formData.validade_dias)}
                  onValueChange={v => setFormData(prev => ({ ...prev, validade_dias: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="condicoes_pagamento">Condições de Pagamento</Label>
                <Input
                  id="condicoes_pagamento"
                  value={formData.condicoes_pagamento}
                  onChange={e => setFormData(prev => ({ ...prev, condicoes_pagamento: e.target.value }))}
                  placeholder="Ex: 50% entrada + 50% na conclusão"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={e => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Informações adicionais, condições especiais..."
                rows={3}
              />
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createOrcamento.isPending || !formData.cliente_nome || formData.itens.length === 0}
              >
                {createOrcamento.isPending ? 'Salvando...' : 'Criar Orçamento'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
