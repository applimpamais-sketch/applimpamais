import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, User, DollarSign, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import type { CarrinhoAbandonado } from "@/hooks/useCarrinhosAbandonados";

export interface DadosRecuperacao {
  nome_cliente: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  data_agendamento: string; // YYYY-MM-DD
}

interface RecuperarCarrinhoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrinho: CarrinhoAbandonado | null;
  onConfirm: (dados: DadosRecuperacao) => void;
}

export function RecuperarCarrinhoModal({
  open,
  onOpenChange,
  carrinho,
  onConfirm,
}: RecuperarCarrinhoModalProps) {
  const [formData, setFormData] = useState({
    nome_cliente: "",
    telefone: "",
    endereco: "",
    bairro: "",
    cidade: "",
    cep: "",
  });
  const [dataAgendamento, setDataAgendamento] = useState<Date>();

  // Preencher formulário com dados do carrinho quando abrir
  useEffect(() => {
    if (carrinho && open) {
      setFormData({
        nome_cliente: carrinho.nome_cliente || "",
        telefone: carrinho.telefone || "",
        endereco: carrinho.endereco || "",
        bairro: carrinho.bairro || "",
        cidade: carrinho.cidade || "",
        cep: carrinho.cep || "",
      });
      setDataAgendamento(undefined);
    }
  }, [carrinho, open]);

  const validarWhatsApp = (telefone: string): boolean => {
    const cleaned = telefone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  };

  const validarCEP = (cep: string): boolean => {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.length === 8;
  };

  const isFormValid = (): boolean => {
    return (
      formData.nome_cliente.trim() !== '' &&
      formData.telefone.trim() !== '' &&
      validarWhatsApp(formData.telefone) &&
      formData.endereco.trim() !== '' &&
      formData.bairro.trim() !== '' &&
      formData.cidade.trim() !== '' &&
      formData.cep.trim() !== '' &&
      validarCEP(formData.cep) &&
      dataAgendamento !== undefined
    );
  };

  const handleConfirm = () => {
    if (!dataAgendamento || !isFormValid()) return;
    
    // Formatar data para YYYY-MM-DD
    const dataFormatada = format(dataAgendamento, "yyyy-MM-dd");
    
    onConfirm({
      ...formData,
      data_agendamento: dataFormatada,
    });
    
    // Resetar estado
    setFormData({
      nome_cliente: "",
      telefone: "",
      endereco: "",
      bairro: "",
      cidade: "",
      cep: "",
    });
    setDataAgendamento(undefined);
  };

  const handleCancel = () => {
    setFormData({
      nome_cliente: "",
      telefone: "",
      endereco: "",
      bairro: "",
      cidade: "",
      cep: "",
    });
    setDataAgendamento(undefined);
    onOpenChange(false);
  };

  if (!carrinho) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Recuperar Carrinho - Preencher Dados</DialogTitle>
          <DialogDescription>
            Complete as informações do cliente e selecione a data do agendamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Resumo do Carrinho */}
          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <h3 className="font-semibold text-sm">💰 Resumo do Carrinho</h3>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{carrinho.nome_cliente || "Cliente sem nome"}</span>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{formatCurrency(carrinho.valor_total)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {carrinho.itens_carrinho?.length || 0} itens no carrinho
              </span>
            </div>
          </div>

          {/* Formulário de Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">📝 Dados do Cliente</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nome_cliente">Nome Completo *</Label>
              <Input
                id="nome_cliente"
                value={formData.nome_cliente}
                onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                placeholder="Nome completo do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">WhatsApp * (com DDD)</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 98765-4321"
              />
              {formData.telefone && !validarWhatsApp(formData.telefone) && (
                <p className="text-xs text-destructive">WhatsApp inválido</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço *</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  placeholder="Bairro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Cidade"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                placeholder="00000-000"
              />
              {formData.cep && !validarCEP(formData.cep) && (
                <p className="text-xs text-destructive">CEP inválido</p>
              )}
            </div>
          </div>

          {/* Data do Agendamento */}
          <div className="space-y-2">
            <Label>📅 Data do Agendamento *</Label>
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
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Selecione a data que o cliente decidiu agendar o serviço
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!isFormValid()}
          >
            Confirmar Recuperação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}