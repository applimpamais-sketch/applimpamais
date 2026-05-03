import { ScheduleSlot, AvailabilityStatus } from '@/types/booking';
import { addDays, startOfToday } from 'date-fns';

// Simulando dados de agendamento - em produção viria de uma API
export const generateScheduleData = (): ScheduleSlot[] => {
  const today = startOfToday();
  const slots: ScheduleSlot[] = [];
  
  for (let i = 0; i < 60; i++) {
    const date = addDays(today, i);
    const maxSlots = 10; // máximo de vagas por dia
    const availableSlots = Math.floor(Math.random() * (maxSlots + 1)); // 0 a 10 vagas disponíveis
    
    slots.push({
      date,
      availableSlots,
      maxSlots,
    });
  }
  
  return slots;
};

export const getAvailabilityStatus = (availableSlots: number): AvailabilityStatus => {
  if (availableSlots === 0) return 'unavailable';
  if (availableSlots <= 3) return 'low';
  return 'high';
};

export const getAvailabilityColor = (status: AvailabilityStatus) => {
  switch (status) {
    case 'high':
      return 'hsl(var(--available-high))';
    case 'low':
      return 'hsl(var(--available-low))';
    case 'unavailable':
      return 'hsl(var(--unavailable))';
  }
};

export const getAvailabilityTextColor = (status: AvailabilityStatus) => {
  switch (status) {
    case 'high':
      return 'hsl(var(--available-high-foreground))';
    case 'low':
      return 'hsl(var(--available-low-foreground))';
    case 'unavailable':
      return 'hsl(var(--unavailable-foreground))';
  }
};

// Horários disponíveis
export const timeSlots = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
];