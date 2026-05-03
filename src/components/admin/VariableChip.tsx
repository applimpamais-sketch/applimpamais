import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VariableChipProps {
  variable: string;
}

const variableDescriptions: Record<string, string> = {
  'nome': 'Nome do cliente',
  'nome_cliente': 'Nome completo do cliente',
  'data': 'Data do agendamento',
  'horario': 'Horário do agendamento',
  'servicos': 'Descrição dos serviços',
  'endereco': 'Endereço completo',
  'bairro': 'Bairro',
  'cidade': 'Cidade',
  'cep': 'CEP',
  'telefone': 'Telefone do cliente',
  'valor_total': 'Valor total do serviço',
  'observacoes': 'Observações do agendamento',
  'link_carrinho': 'Link para recuperar carrinho',
  'cupom': 'Código do cupom de desconto',
  'desconto': 'Valor/percentual do desconto'
};

export default function VariableChip({ variable }: VariableChipProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(`{${variable}}`);
    toast({
      title: 'Copiado!',
      description: `Variável {${variable}} copiada para área de transferência.`
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className="cursor-pointer hover:bg-accent/50 transition-colors group"
          onClick={handleCopy}
        >
          <span className="font-mono text-xs">{`{${variable}}`}</span>
          <Copy className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">
          {variableDescriptions[variable] || 'Variável personalizada'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Clique para copiar</p>
      </TooltipContent>
    </Tooltip>
  );
}
