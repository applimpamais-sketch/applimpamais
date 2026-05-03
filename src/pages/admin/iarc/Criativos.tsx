import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Download, 
  RefreshCw, 
  Sparkles,
  ArrowLeft,
  Square,
  RectangleVertical,
  LayoutGrid,
  Loader2,
  Check,
  Wand2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ModuleGate } from '@/components/admin/ModuleGate';

type TipoCriativo = 'feed' | 'stories' | 'carrossel';
type EstiloCriativo = 'minimalista' | 'vibrante' | 'profissional' | 'moderno' | 'elegante';

const tiposConfig = {
  feed: { label: 'Feed', icon: Square, dimensao: '1080x1080', aspect: 'aspect-square' },
  stories: { label: 'Stories', icon: RectangleVertical, dimensao: '1080x1920', aspect: 'aspect-[9/16]' },
  carrossel: { label: 'Carrossel', icon: LayoutGrid, dimensao: '1080x1080 (x3-5)', aspect: 'aspect-square' }
};

const estilosConfig: { value: EstiloCriativo; label: string; desc: string }[] = [
  { value: 'minimalista', label: 'Minimalista', desc: 'Clean e elegante' },
  { value: 'vibrante', label: 'Vibrante', desc: 'Cores vivas e impactantes' },
  { value: 'profissional', label: 'Profissional', desc: 'Corporativo e confiável' },
  { value: 'moderno', label: 'Moderno', desc: 'Tendências atuais' },
  { value: 'elegante', label: 'Elegante', desc: 'Sofisticado e premium' }
];

export default function Criativos() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState<TipoCriativo>('feed');
  const [estilo, setEstilo] = useState<EstiloCriativo>('profissional');
  const [descricao, setDescricao] = useState('');
  const [textoOverlay, setTextoOverlay] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagensGeradas, setImagensGeradas] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!descricao.trim()) {
      toast.error('Descreva o que deseja gerar');
      return;
    }

    setIsGenerating(true);
    setImagensGeradas([]);

    try {
      const { data, error } = await supabase.functions.invoke('iarc-generate-creative', {
        body: {
          tipo,
          descricao,
          estilo,
          texto_overlay: textoOverlay || undefined,
          quantidade: tipo === 'carrossel' ? 3 : 1
        }
      });

      if (error) throw error;

      if (data?.imagens && data.imagens.length > 0) {
        setImagensGeradas(data.imagens.map((img: { url: string }) => img.url));
        toast.success(`${data.imagens.length} criativo(s) gerado(s)!`);
      } else {
        toast.error('Nenhuma imagem foi gerada');
      }
    } catch (err: any) {
      console.error('Erro ao gerar criativo:', err);
      toast.error(err.message || 'Erro ao gerar criativo');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `criativo-${tipo}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download iniciado!');
  };

  return (
    <ModuleGate module="iarc_criativos" moduleName="IARC Studio">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/iarc')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Image className="h-6 w-6 text-pink-500" />
                Gerador de Criativos
              </h1>
              <p className="text-muted-foreground">
                Crie imagens para seus anúncios usando IA
              </p>
            </div>
          </div>
          
          {/* Wizard Button */}
          <Button 
            onClick={() => navigate('/admin/iarc/criativos/wizard')}
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Modo Assistido
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Configurar Criativo</CardTitle>
              <CardDescription>
                Defina as características do seu anúncio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo */}
              <div className="space-y-3">
                <Label>Tipo de Criativo</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(tiposConfig) as [TipoCriativo, typeof tiposConfig.feed][]).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setTipo(key)}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        tipo === key 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <config.icon className={`h-6 w-6 mx-auto mb-2 ${tipo === key ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="font-medium text-sm">{config.label}</div>
                      <div className="text-xs text-muted-foreground">{config.dimensao}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descreva o criativo *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Ex: Anúncio de limpeza de sofá com preço promocional, ambiente moderno e cores quentes..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Texto Overlay */}
              <div className="space-y-2">
                <Label htmlFor="overlay">Texto no anúncio (opcional)</Label>
                <Input
                  id="overlay"
                  placeholder="Ex: 50% OFF • Ligue Agora!"
                  value={textoOverlay}
                  onChange={(e) => setTextoOverlay(e.target.value)}
                />
              </div>

              {/* Estilo */}
              <div className="space-y-3">
                <Label>Estilo Visual</Label>
                <RadioGroup value={estilo} onValueChange={(v) => setEstilo(v as EstiloCriativo)}>
                  <div className="grid grid-cols-2 gap-2">
                    {estilosConfig.map((e) => (
                      <div key={e.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={e.value} id={e.value} />
                        <Label htmlFor={e.value} className="flex-1 cursor-pointer">
                          <span className="font-medium">{e.label}</span>
                          <span className="text-xs text-muted-foreground block">{e.desc}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Generate Button */}
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleGenerate}
                disabled={isGenerating || !descricao.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Criativo
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Resultado gerado pela IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {imagensGeradas.length > 0 ? (
                <div className={`grid ${tipo === 'carrossel' ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
                  {imagensGeradas.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={img} 
                        alt={`Criativo ${idx + 1}`}
                        className={`w-full ${tiposConfig[tipo].aspect} object-cover rounded-lg border`}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => handleDownload(img, idx)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`${tiposConfig[tipo].aspect} bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground`}>
                  <Image className="h-12 w-12 mb-3" />
                  <p className="text-sm">Seu criativo aparecerá aqui</p>
                  <p className="text-xs">{tiposConfig[tipo].dimensao}</p>
                </div>
              )}

              {imagensGeradas.length > 0 && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" onClick={handleGenerate}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => imagensGeradas.forEach((img, idx) => handleDownload(img, idx))}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Todos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ModuleGate>
  );
}
