import type { ScriptAtendimento } from '@/hooks/useScriptsAtendimento';
import { ScriptCard } from './ScriptCard';

interface ScriptABComparisonProps {
  groupName: string;
  scripts: ScriptAtendimento[];
  onCopy: (id: string) => void;
  onConversao: (id: string) => void;
  onUpdate: (id: string, conteudo: string) => void;
}

const etapaLabels: Record<string, string> = {
  abertura: '👋 Abertura',
  qualificacao: '📋 Qualificação',
  apresentacao: '💰 Apresentação',
  fechamento: '🎯 Fechamento',
  objecao_preco: '💸 Objeção: Preço',
  objecao_tempo: '⏰ Objeção: Tempo',
  objecao_confianca: '🛡️ Objeção: Confiança',
  objecao_concorrencia: '🏷️ Objeção: Concorrência',
  objecao_pensar: '🤔 Objeção: Vou Pensar',
  objecao_tempo_sem: '⏰ Objeção: Sem Tempo',
  followup_2h: '⏱️ Follow-up 2h',
  followup_24h: '📅 Follow-up 24h',
  followup_72h: '🔥 Follow-up 72h',
  pos_servico: '💙 Pós-Serviço',
  reativacao: '🔄 Reativação',
  reativacao_30d: '📅 Reativação 30 dias',
  reativacao_90d: '🕐 Reativação 90 dias',
  reativacao_sazonal: '🎄 Reativação Sazonal',
  win_back: '🎯 Win-back',
  reativacao_lead: '🔍 Reativação Lead Perdido',
};

const categoriaLabels: Record<string, string> = {
  servico: '🧹 Serviço',
  locacao: '🔧 Locação',
  followup: '📲 Follow-up',
  quebra_objecao: '💪 Quebra de Objeção',
  pos_venda: '💙 Pós-Venda',
  recuperacao: '🔄 Recuperação',
};

export function ScriptABComparison({ groupName, scripts, onCopy, onConversao, onUpdate }: ScriptABComparisonProps) {
  if (scripts.length === 0) return null;

  const sorted = [...scripts].sort((a, b) => a.variante.localeCompare(b.variante));
  const first = sorted[0];

  // Determine winner by conversion rate
  let winnerId: string | null = null;
  if (sorted.length >= 2) {
    const rates = sorted.map(s => ({
      id: s.id,
      rate: s.uso_count > 0 ? s.conversoes / s.uso_count : 0,
      usos: s.uso_count,
    }));
    const minUsos = 5;
    const withEnoughData = rates.filter(r => r.usos >= minUsos);
    if (withEnoughData.length >= 2) {
      const best = withEnoughData.reduce((a, b) => a.rate > b.rate ? a : b);
      winnerId = best.id;
    }
  }

  const catLabel = categoriaLabels[first.categoria] || first.categoria;
  const etapaLabel = etapaLabels[first.etapa] || first.etapa;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-muted-foreground">{catLabel} → {etapaLabel}</h3>
        {sorted.length >= 2 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Teste A/B
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map(script => (
          <ScriptCard
            key={script.id}
            script={script}
            onCopy={onCopy}
            onConversao={onConversao}
            onUpdate={onUpdate}
            isWinner={script.id === winnerId}
          />
        ))}
      </div>
    </div>
  );
}
