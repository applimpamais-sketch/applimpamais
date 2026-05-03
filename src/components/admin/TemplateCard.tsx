import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Pencil, Copy, Trash2, MoreVertical, Send, BarChart3 } from 'lucide-react';
import VariableChip from './VariableChip';
import { Template } from '@/hooks/useTemplates';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: Template;
  onToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTest: () => void;
  onView: () => void;
}

const categoryColors: Record<string, string> = {
  'agendamento': 'bg-blue-500 hover:bg-blue-600',
  'carrinho': 'bg-orange-500 hover:bg-orange-600',
  'pos-venda': 'bg-green-500 hover:bg-green-600',
  'promocao': 'bg-pink-500 hover:bg-pink-600',
  'suporte': 'bg-purple-500 hover:bg-purple-600',
};

const categoryLabels: Record<string, string> = {
  'agendamento': 'Agendamento',
  'carrinho': 'Carrinho',
  'pos-venda': 'Pós-Venda',
  'promocao': 'Promoção',
  'suporte': 'Suporte',
};

export default function TemplateCard({
  template,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
  onTest,
  onView
}: TemplateCardProps) {
  return (
    <Card className="backdrop-blur-md bg-background/60 border-border/50 hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-base truncate">{template.nome}</h3>
              <Badge 
                className={cn(
                  'text-white border-0 text-xs',
                  categoryColors[template.categoria] || 'bg-gray-500'
                )}
              >
                {categoryLabels[template.categoria] || template.categoria}
              </Badge>
            </div>
            {template.titulo && (
              <p className="text-sm text-muted-foreground truncate">{template.titulo}</p>
            )}
          </div>
          
          {/* Status Toggle */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'flex items-center gap-2 px-2 py-1 rounded-full transition-colors',
              template.ativo ? 'bg-green-500/10' : 'bg-gray-500/10'
            )}>
              <div className={cn(
                'w-2 h-2 rounded-full',
                template.ativo ? 'bg-green-500' : 'bg-gray-400'
              )} />
              <span className="text-xs font-medium">
                {template.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <Switch 
              checked={template.ativo} 
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>

        {/* Content Preview */}
        <div className="mb-3 p-3 rounded-lg bg-muted/30 border border-border/30">
          <p className="text-sm text-foreground/80 line-clamp-3 whitespace-pre-wrap">
            {template.conteudo}
          </p>
        </div>

        {/* Variables */}
        {template.variaveis && template.variaveis.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">Variáveis disponíveis:</p>
            <div className="flex flex-wrap gap-1.5">
              {template.variaveis.map((variable) => (
                <VariableChip key={variable} variable={variable} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{template.uso_count} usos</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              className="h-8 px-2"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 px-2"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onTest}>
                  <Send className="h-4 w-4 mr-2" />
                  Testar Envio
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
