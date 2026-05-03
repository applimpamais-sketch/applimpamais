export interface ScheduleSlot {
  date: Date;
  availableSlots: number;
  maxSlots: number;
}

export interface BookingData {
  selectedDate: Date;
  selectedItems: Array<{
    id: string;
    name: string;
    details: string;
    quantity: number;
    price: number;
  }>;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    bairro: string;
    cidade: string;
    cep: string;
    observacoes?: string;
  };
  timeSlot: string;
  periodo?: 'Manhã' | 'Tarde';
  orderCode?: string;
  formaPagamento?: string;
  valorTotal?: number; // Valor líquido final (com desconto e frete)
}

export type AvailabilityStatus = 'high' | 'low' | 'unavailable';