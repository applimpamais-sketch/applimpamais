import { useState } from 'react';
import { useTecnicos } from '@/hooks/useTecnicos';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { UserCog } from 'lucide-react';

interface TecnicoSelectorProps {
  agendamentoId: string;
  tecnicoAtualId?: string | null;
  onUpdate?: () => void;
}

export default function TecnicoSelector({ 
  agendamentoId, 
  tecnicoAtualId,
  onUpdate 
}: TecnicoSelectorProps) {
  const [selectedTecnicoId, setSelectedTecnicoId] = useState<string>(tecnicoAtualId || '');
  const [isLoading, setIsLoading] = useState(false);
  const { data: tecnicos } = useTecnicos();

  const handleAtribuir = async () => {
    if (!selectedTecnicoId) {
      toast.error('Selecione um técnico');
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('agendamentos')
        .update({
          tecnico_id: selectedTecnicoId,
          data_atribuicao: new Date().toISOString(),
          atribuido_por: (await supabase.auth.getUser()).data.user?.id,
        } as any)
        .eq('id', agendamentoId);

      if (updateError) throw updateError;

      // Registrar no histórico
      const { error: historyError } = await supabase
        .from('historico_atribuicoes' as any)
        .insert({
          agendamento_id: agendamentoId,
          tecnico_novo_id: selectedTecnicoId,
          tecnico_anterior_id: tecnicoAtualId,
          atribuido_por: (await supabase.auth.getUser()).data.user?.id,
          motivo: tecnicoAtualId ? 'Reatribuição manual' : 'Atribuição inicial',
        } as any);

      if (historyError) console.error('Erro ao registrar histórico:', historyError);

      toast.success(tecnicoAtualId ? 'Técnico reatribuído com sucesso' : 'Técnico atribuído com sucesso');
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atribuir técnico:', error);
      toast.error('Erro ao atribuir técnico');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Select value={selectedTecnicoId} onValueChange={setSelectedTecnicoId}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Selecione um técnico" />
        </SelectTrigger>
        <SelectContent>
          {tecnicos?.map((tecnico) => (
            <SelectItem key={tecnico.id} value={tecnico.id}>
              <div className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                {tecnico.nome_completo}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        onClick={handleAtribuir} 
        disabled={isLoading || !selectedTecnicoId}
        size="default"
      >
        {tecnicoAtualId ? 'Reatribuir' : 'Atribuir'}
      </Button>
    </div>
  );
}
