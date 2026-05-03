import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function InvestimentoAdsCard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [valorManual, setValorManual] = useState('');
  const [mesReferencia, setMesReferencia] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [plataforma, setPlataforma] = useState('meta_ads');
  const [observacoes, setObservacoes] = useState('');
  const [despesasMarketing, setDespesasMarketing] = useState(0);

  useEffect(() => {
    loadDespesasMarketing();
    loadInvestimentoConfig();
  }, [mesReferencia]);

  const loadDespesasMarketing = async () => {
    const mesInicio = mesReferencia;
    const mesFim = format(new Date(mesReferencia + '-01'), 'yyyy-MM-') + '31';

    const { data } = await supabase
      .from('despesas')
      .select('valor')
      .eq('categoria', 'marketing')
      .gte('data_despesa', mesInicio)
      .lte('data_despesa', mesFim);

    const total = data?.reduce((sum, d) => sum + Number(d.valor), 0) || 0;
    setDespesasMarketing(total);
  };

  const loadInvestimentoConfig = async () => {
    const { data } = await supabase
      .from('marketing_investimentos')
      .select('*')
      .eq('mes_referencia', mesReferencia)
      .eq('plataforma', plataforma)
      .maybeSingle();

    if (data) {
      setMode(data.usar_despesas_automatico ? 'auto' : 'manual');
      setValorManual(data.valor_investido?.toString() || '');
      setObservacoes(data.observacoes || '');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const config = {
        mes_referencia: mesReferencia,
        plataforma,
        usar_despesas_automatico: mode === 'auto',
        valor_investido: mode === 'manual' ? Number(valorManual) : 0,
        observacoes,
      };

      const { error } = await supabase
        .from('marketing_investimentos')
        .upsert(config, {
          onConflict: 'mes_referencia,plataforma',
        });

      if (error) throw error;

      toast({
        title: 'Investimento salvo',
        description: 'Configuração de investimento atualizada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a configuração',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="backdrop-blur-md bg-background/60 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          💰 Configurar Investimento em Ads
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seletor de Mês */}
        <div className="space-y-2">
          <Label>Mês de Referência</Label>
          <Input
            type="month"
            value={mesReferencia.substring(0, 7)}
            onChange={(e) => setMesReferencia(e.target.value + '-01')}
          />
        </div>

        {/* Seletor de Plataforma */}
        <div className="space-y-2">
          <Label>Plataforma</Label>
          <Select value={plataforma} onValueChange={setPlataforma}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meta_ads">Meta Ads (Facebook/Instagram)</SelectItem>
              <SelectItem value="google_ads">Google Ads</SelectItem>
              <SelectItem value="tiktok_ads">TikTok Ads</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Modo de Cálculo */}
        <div className="space-y-4">
          <Label>Modo de Cálculo</Label>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'auto' | 'manual')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="auto" id="auto" />
              <Label htmlFor="auto" className="font-normal cursor-pointer">
                Usar despesas de Marketing: R$ {despesasMarketing.toFixed(2)} (automático)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual" className="font-normal cursor-pointer">
                Informar manualmente
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Input Manual */}
        {mode === 'manual' && (
          <div className="space-y-2">
            <Label>Valor Investido</Label>
            <Input
              type="number"
              placeholder="R$ 0,00"
              value={valorManual}
              onChange={(e) => setValorManual(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        )}

        {/* Observações */}
        <div className="space-y-2">
          <Label>Observações (opcional)</Label>
          <Textarea
            placeholder="Ex: Campanha de Black Friday, Teste de criativo..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Botão Salvar */}
        <Button
          onClick={handleSave}
          disabled={loading || (mode === 'manual' && !valorManual)}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Investimento'}
        </Button>
      </CardContent>
    </Card>
  );
}
