import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Heading1,
  List,
  MousePointerClick,
  HelpCircle,
  Clock,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ModuleGate } from '@/components/admin/ModuleGate';

type TipoCopy = 'headlines' | 'subheadlines' | 'bullets' | 'cta' | 'depoimentos' | 'faq' | 'urgencia';

const tiposConfig: { value: TipoCopy; label: string; icon: any; desc: string; quantidade: number }[] = [
  { value: 'headlines', label: 'Headlines', icon: Heading1, desc: 'Títulos impactantes', quantidade: 5 },
  { value: 'subheadlines', label: 'Subheadlines', icon: Lightbulb, desc: 'Subtítulos de suporte', quantidade: 3 },
  { value: 'bullets', label: 'Bullets', icon: List, desc: 'Lista de benefícios', quantidade: 6 },
  { value: 'cta', label: 'CTAs', icon: MousePointerClick, desc: 'Botões de ação', quantidade: 5 },
  { value: 'depoimentos', label: 'Depoimentos', icon: MessageSquare, desc: 'Templates de testemunhos', quantidade: 3 },
  { value: 'faq', label: 'FAQ', icon: HelpCircle, desc: 'Perguntas e respostas', quantidade: 4 },
  { value: 'urgencia', label: 'Urgência', icon: Clock, desc: 'Frases de escassez', quantidade: 5 }
];

export default function CopyGenerator() {
  const navigate = useNavigate();
  const [tipoCopy, setTipoCopy] = useState<TipoCopy>('headlines');
  const [servico, setServico] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');
  const [diferencial, setDiferencial] = useState('');
  const [preco, setPreco] = useState('');
  const [regiao, setRegiao] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copysGeradas, setCopysGeradas] = useState<{ texto: string; tipo: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!servico.trim()) {
      toast.error('Informe o serviço/produto');
      return;
    }

    setIsGenerating(true);
    setCopysGeradas([]);

    try {
      const tipoConfig = tiposConfig.find(t => t.value === tipoCopy);
      
      const { data, error } = await supabase.functions.invoke('iarc-generate-copy', {
        body: {
          tipo_copy: tipoCopy,
          contexto: {
            servico,
            publico_alvo: publicoAlvo,
            diferencial,
            preco: preco || undefined,
            regiao: regiao || undefined
          },
          quantidade: tipoConfig?.quantidade || 5
        }
      });

      if (error) throw error;

      if (data?.copys && data.copys.length > 0) {
        setCopysGeradas(data.copys);
        toast.success(`${data.copys.length} textos gerados!`);
      } else {
        toast.error('Nenhum texto foi gerado');
      }
    } catch (err: any) {
      console.error('Erro ao gerar copy:', err);
      toast.error(err.message || 'Erro ao gerar textos');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (texto: string, idx: number) => {
    navigator.clipboard.writeText(texto);
    setCopiedIdx(idx);
    toast.success('Copiado!');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <ModuleGate module="iarc_criativos" moduleName="IARC Studio">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/iarc')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-500" />
              Gerador de Copy
            </h1>
            <p className="text-muted-foreground">
              Crie textos persuasivos usando IA
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contexto do Negócio</CardTitle>
              <CardDescription>
                Quanto mais detalhes, melhores os resultados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de Copy */}
              <div className="space-y-3">
                <Label>Tipo de Texto</Label>
                <Tabs value={tipoCopy} onValueChange={(v) => setTipoCopy(v as TipoCopy)}>
                  <TabsList className="grid grid-cols-4 lg:grid-cols-7 h-auto gap-1">
                    {tiposConfig.map((tipo) => (
                      <TabsTrigger 
                        key={tipo.value} 
                        value={tipo.value}
                        className="flex flex-col py-2 px-2 text-xs"
                      >
                        <tipo.icon className="h-4 w-4 mb-1" />
                        {tipo.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <p className="text-xs text-muted-foreground">
                  {tiposConfig.find(t => t.value === tipoCopy)?.desc}
                </p>
              </div>

              {/* Campos */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="servico">Serviço/Produto *</Label>
                  <Input
                    id="servico"
                    placeholder="Ex: Limpeza de sofá profissional"
                    value={servico}
                    onChange={(e) => setServico(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publico">Público-Alvo</Label>
                  <Input
                    id="publico"
                    placeholder="Ex: Famílias com pets, alérgicos"
                    value={publicoAlvo}
                    onChange={(e) => setPublicoAlvo(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diferencial">Diferencial</Label>
                  <Textarea
                    id="diferencial"
                    placeholder="Ex: Produtos alemães, técnicos certificados, garantia de 7 dias"
                    value={diferencial}
                    onChange={(e) => setDiferencial(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (opcional)</Label>
                    <Input
                      id="preco"
                      placeholder="Ex: R$ 149"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regiao">Região (opcional)</Label>
                    <Input
                      id="regiao"
                      placeholder="Ex: São Paulo, SP"
                      value={regiao}
                      onChange={(e) => setRegiao(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleGenerate}
                disabled={isGenerating || !servico.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Textos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Textos Gerados
                {copysGeradas.length > 0 && (
                  <Badge variant="secondary">
                    {copysGeradas.length} textos
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Clique para copiar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {copysGeradas.length > 0 ? (
                <div className="space-y-3">
                  {copysGeradas.map((copy, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group relative"
                      onClick={() => handleCopy(copy.texto, idx)}
                    >
                      <p className="text-sm pr-8">{copy.texto}</p>
                      <div className="absolute top-3 right-3">
                        {copiedIdx === idx ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Seus textos aparecerão aqui</p>
                  <p className="text-sm">Preencha o contexto e clique em gerar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ModuleGate>
  );
}
