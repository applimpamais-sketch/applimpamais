import { Card } from "@/components/ui/card";
import { CreditCard, Smartphone, Banknote, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodCardProps {
  selected: string;
  onSelect: (method: string) => void;
  temAluguel: boolean;
  temServico: boolean;
  touched: boolean;
}

const paymentOptions = [
  { id: 'cartao', label: 'Cartão Crédito/Débito', icon: CreditCard },
  { id: 'pix', label: 'PIX', icon: Smartphone },
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
];

export function PaymentMethodCard({ selected, onSelect, temAluguel, temServico, touched }: PaymentMethodCardProps) {
  return (
    <Card className={cn("p-4 sm:p-6", touched && !selected && "border-destructive")}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          Forma de Pagamento <span className="text-destructive">*</span>
        </h3>
      </div>

      {/* Mensagens destacadas */}
      <div className="space-y-2 mb-4">
        {temServico && (
          <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Serviços: o pagamento será realizado após a conclusão do serviço
            </p>
          </div>
        )}
        {temAluguel && (
          <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2.5">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Locação: o pagamento será realizado no ato da entrega do equipamento
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selected === option.id;
          return (
            <Card
              key={option.id}
              className={cn(
                "p-4 cursor-pointer transition-all border-2 hover:shadow-lg",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onSelect(option.id)}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-medium flex-1", isSelected && "text-primary")}>
                  {option.label}
                </span>
                {isSelected && <Check className="text-primary w-4 h-4" />}
              </div>
            </Card>
          );
        })}
      </div>

      {touched && !selected && (
        <p className="text-xs text-destructive mt-2">Selecione uma forma de pagamento</p>
      )}
    </Card>
  );
}
