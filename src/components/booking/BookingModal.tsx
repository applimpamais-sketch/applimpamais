import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileFriendlyInput } from "@/components/ui/mobile-friendly-input";
import { ScheduleCalendar } from "./ScheduleCalendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookingData } from "@/types/booking";
import { timeSlots } from "@/data/schedule";
import { Calendar, Clock, User, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Array<{
    id: string;
    name: string;
    details: string;
    quantity: number;
    price: number;
  }>;
  onBookingComplete: (bookingData: BookingData) => void;
}

export function BookingModal({ isOpen, onClose, cartItems, onBookingComplete }: BookingModalProps) {
  const { toast } = useToast();
  const [step, setStep] = React.useState<'calendar' | 'form'>('calendar');
  const [selectedDate, setSelectedDate] = React.useState<Date>();
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    cep: '',
    timeSlot: '',
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('form');
  };

  const handleBackToCalendar = () => {
    setStep('calendar');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) return;
    
    if (!formData.name || !formData.phone || !formData.address || !formData.cep || !formData.timeSlot) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const bookingData: BookingData = {
      selectedDate,
      selectedItems: cartItems,
      customerInfo: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        bairro: '',
        cidade: '',
        cep: formData.cep,
        observacoes: '',
      },
      timeSlot: formData.timeSlot,
    };

    onBookingComplete(bookingData);
    onClose();
    
    // Reset form
    setStep('calendar');
    setSelectedDate(undefined);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      cep: '',
      timeSlot: '',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-background rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl h-[95vh] sm:max-h-[90vh] flex flex-col shadow-elegant">
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-border">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary"></div>
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-muted"></div>
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-muted"></div>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground text-center sm:text-left">Agendamento</h2>
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">Preencha seus dados e selecione a data para a visita</p>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6">
          {step === 'calendar' && (
            <div className="animate-in slide-in-from-right-5 duration-300">
              <ScheduleCalendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
            </div>
          )}

          {step === 'form' && selectedDate && (
            <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-left-5 duration-300">
            <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
              {/* Seus Dados */}
              <Card className="p-4 sm:p-6 bg-background">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">Seus Dados</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Obrigatórios</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm text-muted-foreground">Nome</Label>
                    <MobileFriendlyInput
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Digite seu nome"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="surname" className="text-sm text-muted-foreground">Sobrenome</Label>
                    <MobileFriendlyInput
                      id="surname"
                      placeholder="Digite seu sobrenome"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm text-muted-foreground">Telefone/WhatsApp</Label>
                    <MobileFriendlyInput
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(DD) 90000-0000"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cep" className="text-sm text-muted-foreground">CEP</Label>
                    <MobileFriendlyInput
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      placeholder="00000-000"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </Card>

              {/* Endereço Completo */}
              <Card className="p-4 sm:p-6 bg-background">
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-4">Endereço Completo</h3>
                <div className="space-y-3 sm:space-y-4">
                  <MobileFriendlyInput
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rua, número"
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <MobileFriendlyInput placeholder="Complemento (apto, bloco)" />
                    <MobileFriendlyInput placeholder="Bairro" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <MobileFriendlyInput placeholder="Cidade" />
                    <MobileFriendlyInput placeholder="Estado" />
                  </div>
                  <MobileFriendlyInput placeholder="Ponto de referência (opcional)" />
                </div>
              </Card>

              {/* Escolha a Data */}
              <Card className="p-6 bg-background">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-foreground">Escolha a Data</h3>
                  <div className="flex gap-2 ml-auto">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-xs text-muted-foreground">Disponível</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs text-muted-foreground">Limitado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-muted"></div>
                      <span className="text-xs text-muted-foreground">Indisponível</span>
                    </div>
                  </div>
                </div>
                <ScheduleCalendar
                  selectedDate={selectedDate}
                  onDateSelect={(date) => setSelectedDate(date)}
                />
              </Card>

              {/* Resumo do Pedido */}
              {selectedDate && (
                <Card className="p-4 sm:p-6 bg-muted/30">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 sm:mb-3">Resumo do Pedido</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">{cartItems.map(i => i.name).join(' + ')} • Quantidade 1</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    Data: {selectedDate ? '—' : 'Selecione'} • Endereço: a definir
                  </p>
                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border">
                    <span className="text-sm sm:text-base font-semibold text-foreground">Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      R$ {cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-11 sm:h-10 text-sm sm:text-base"
                >
                  Voltar
                </Button>
                <Button type="submit" className="flex-1 h-11 sm:h-10 text-sm sm:text-base">
                  Concluir Agendamento
                </Button>
              </div>
            </form>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;
}