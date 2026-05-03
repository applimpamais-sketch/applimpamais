import { useState } from 'react';
import { useScriptsAtendimento } from '@/hooks/useScriptsAtendimento';
import { ScriptABComparison } from '@/components/admin/ScriptABComparison';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MessageSquareText } from 'lucide-react';

const categorias = [
  { value: 'todos', label: '📂 Todas as categorias' },
  { value: 'servico', label: '🧹 Serviço (Limpeza)' },
  { value: 'locacao', label: '🔧 Locação (Extratora)' },
  { value: 'followup', label: '📲 Follow-up' },
  { value: 'quebra_objecao', label: '💪 Quebra de Objeções' },
  { value: 'pos_venda', label: '💙 Pós-Venda' },
  { value: 'recuperacao', label: '🔄 Recuperação' },
];

export default function ScriptsAtendimento() {
  const [categoria, setCategoria] = useState('todos');
  const { scripts, isLoading, abGroups, incrementUso, incrementConversao, updateScript } = useScriptsAtendimento({ categoria });

  const handleCopy = (id: string) => incrementUso.mutate(id);
  const handleConversao = (id: string) => incrementConversao.mutate(id);
  const handleUpdate = (id: string, conteudo: string) => updateScript.mutate({ id, conteudo });

  // Sort groups by category order then etapa
  const sortedGroups = Object.entries(abGroups).sort(([, a], [, b]) => {
    const catOrder = categorias.findIndex(c => c.value === a[0]?.categoria) - categorias.findIndex(c => c.value === b[0]?.categoria);
    if (catOrder !== 0) return catOrder;
    return (a[0]?.etapa || '').localeCompare(b[0]?.etapa || '');
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquareText className="h-6 w-6 text-primary" />
            Scripts de Atendimento
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {scripts.length} scripts • Teste A/B • Copie e use no WhatsApp
          </p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categorias.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sortedGroups.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Nenhum script encontrado para este filtro.
        </div>
      ) : (
        <div className="space-y-8">
          {sortedGroups.map(([groupName, groupScripts]) => (
            <ScriptABComparison
              key={groupName}
              groupName={groupName}
              scripts={groupScripts}
              onCopy={handleCopy}
              onConversao={handleConversao}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
