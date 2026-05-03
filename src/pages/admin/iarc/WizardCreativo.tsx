import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Image, Sparkles, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ModuleGate } from '@/components/admin/ModuleGate';
import { WizardStep } from '@/components/iarc/WizardStep';
import { ServiceSelector } from '@/components/iarc/ServiceSelector';
import { PricingSelector, PrecosConfig } from '@/components/iarc/PricingSelector';
import { ElementsSelector, ElementosConfig } from '@/components/iarc/ElementsSelector';
import { StyleSelector, EstiloCriativo } from '@/components/iarc/StyleSelector';
import { FormatSelector, TipoCriativo } from '@/components/iarc/FormatSelector';
import { ServicoIARC } from '@/hooks/useServicosParaIARC';

interface WizardState {
  servico: ServicoIARC | null;
  precos: PrecosConfig;
  elementos: ElementosConfig;
  estilo: EstiloCriativo;
  formato: TipoCriativo;
  textoOverlay: string;
}

const initialState: WizardState = {
  servico: null,
  precos: { estrategia: 'promocional' },
  elementos: {
    timer: false,
    depoimentos: false,
    garantia: false,
    antesDepois: true,
    urgencia: true,
    prova_social: false,
  },
  estilo: 'profissional',
  formato: 'feed',
  textoOverlay: '',
};

export default function WizardCreativo() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(initialState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagensGeradas, setImagensGeradas] = useState<string[]>([]);
  
  const totalSteps = 5;
  
  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleGenerate();
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const canGoNext = (): boolean => {
    switch (step) {
      case 1: return state.servico !== null;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };
  
  const buildPrompt = (): string => {
    const { servico, precos, elementos, estilo } = state;
    
    let prompt = `Crie um anúncio profissional para "${servico?.subcategoria}" (${servico?.categoria}).`;
    
    // Preço
    if (precos.estrategia === 'promocional' && precos.precoOriginal && precos.precoFinal) {
      prompt += ` Destaque a promoção: DE R$ ${precos.precoOriginal} POR APENAS R$ ${precos.precoFinal} (${precos.descontoPercent}% OFF).`;
    } else if (precos.estrategia === 'com_preco' && precos.precoFinal) {
      prompt += ` Preço: R$ ${precos.precoFinal}.`;
    } else {
      prompt += ` Não mostrar preço, focar nos benefícios.`;
    }
    
    // Elementos
    const elementosAtivos: string[] = [];
    if (elementos.timer) elementosAtivos.push('contagem regressiva');
    if (elementos.garantia) elementosAtivos.push('selo de garantia de satisfação');
    if (elementos.antesDepois) elementosAtivos.push('comparação antes/depois visual');
    if (elementos.urgencia) elementosAtivos.push('texto de urgência como "Últimas vagas" ou "Oferta limitada"');
    if (elementos.prova_social) elementosAtivos.push('quantidade de clientes atendidos');
    
    if (elementosAtivos.length > 0) {
      prompt += ` Incluir elementos: ${elementosAtivos.join(', ')}.`;
    }
    
    // Estilo
    const estiloMap: Record<EstiloCriativo, string> = {
      minimalista: 'design limpo, muito espaço em branco, tipografia moderna',
      vibrante: 'cores vivas e impactantes, alto contraste, dinâmico',
      profissional: 'corporativo e confiável, linhas limpas, polido',
      moderno: 'tendências atuais de design, contemporâneo, elegante',
      elegante: 'sofisticado e premium, luxuoso, refinado',
    };
    prompt += ` Estilo visual: ${estiloMap[estilo]}.`;
    
    // Texto overlay
    if (state.textoOverlay) {
      prompt += ` Incluir o texto "${state.textoOverlay}" de forma proeminente.`;
    }
    
    prompt += ` Ultra high resolution, ready for Facebook/Instagram ads.`;
    
    return prompt;
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setImagensGeradas([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('iarc-generate-creative', {
        body: {
          tipo: state.formato,
          descricao: buildPrompt(),
          estilo: state.estilo,
          texto_overlay: state.textoOverlay || undefined,
          quantidade: state.formato === 'carrossel' ? 3 : 1,
          // Dados estruturados do wizard
          wizard_data: {
            servico: state.servico,
            precos: state.precos,
            elementos: state.elementos,
          }
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
    link.download = `criativo-${state.formato}-${state.servico?.subcategoria || 'iarc'}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download iniciado!');
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <WizardStep
            title="Para qual serviço deseja criar o anúncio?"
            description="Selecione um serviço do seu catálogo"
            icon={<Sparkles className="h-6 w-6" />}
            step={1}
            totalSteps={totalSteps}
            onNext={handleNext}
            canGoNext={canGoNext()}
          >
            <ServiceSelector
              selected={state.servico}
              onSelect={(servico) => setState({ ...state, servico })}
            />
          </WizardStep>
        );
        
      case 2:
        return (
          <WizardStep
            title="Como deseja apresentar o preço?"
            description="Escolha a estratégia de precificação"
            step={2}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            canGoNext={canGoNext()}
          >
            <PricingSelector
              precoBase={state.servico?.preco_limpeza || null}
              value={state.precos}
              onChange={(precos) => setState({ ...state, precos })}
            />
          </WizardStep>
        );
        
      case 3:
        return (
          <WizardStep
            title="Quais elementos incluir?"
            description="Selecione os elementos visuais do anúncio"
            step={3}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            canGoNext={canGoNext()}
          >
            <ElementsSelector
              value={state.elementos}
              onChange={(elementos) => setState({ ...state, elementos })}
              mode="criativo"
            />
          </WizardStep>
        );
        
      case 4:
        return (
          <WizardStep
            title="Formato e Estilo"
            description="Defina o formato e estilo visual do criativo"
            step={4}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            canGoNext={canGoNext()}
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Formato</Label>
                <FormatSelector
                  value={state.formato}
                  onChange={(formato) => setState({ ...state, formato })}
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-semibold">Estilo Visual</Label>
                <StyleSelector
                  value={state.estilo}
                  onChange={(estilo) => setState({ ...state, estilo })}
                />
              </div>
            </div>
          </WizardStep>
        );
        
      case 5:
        return (
          <WizardStep
            title="Texto no Anúncio"
            description="Adicione um texto de destaque (opcional)"
            step={5}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            canGoNext={canGoNext()}
            isLoading={isGenerating}
            loadingText="Gerando criativo..."
            nextLabel="Gerar Criativo"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="overlay">Texto Overlay (opcional)</Label>
                <Input
                  id="overlay"
                  placeholder="Ex: 50% OFF • Agende Agora!"
                  value={state.textoOverlay}
                  onChange={(e) => setState({ ...state, textoOverlay: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Este texto aparecerá em destaque no anúncio
                </p>
              </div>
              
              {/* Resumo */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Resumo do Criativo:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Serviço: <span className="text-foreground">{state.servico?.subcategoria}</span></li>
                  <li>• Preço: <span className="text-foreground">
                    {state.precos.estrategia === 'sem_preco' ? 'Não exibir' :
                     state.precos.estrategia === 'promocional' ? 
                       `De R$ ${state.precos.precoOriginal} por R$ ${state.precos.precoFinal}` :
                       `R$ ${state.precos.precoFinal}`}
                  </span></li>
                  <li>• Formato: <span className="text-foreground">{state.formato}</span></li>
                  <li>• Estilo: <span className="text-foreground">{state.estilo}</span></li>
                </ul>
              </div>
            </div>
          </WizardStep>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <ModuleGate module="iarc_criativos" moduleName="IARC Studio">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
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
              Crie anúncios personalizados com IA
            </p>
          </div>
        </div>
        
        {/* Wizard or Results */}
        {imagensGeradas.length === 0 ? (
          renderStepContent()
        ) : (
          <div className="space-y-6">
            {/* Results */}
            <div className={`grid ${state.formato === 'carrossel' ? 'grid-cols-3' : 'grid-cols-1 max-w-md mx-auto'} gap-4`}>
              {imagensGeradas.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img 
                    src={img} 
                    alt={`Criativo ${idx + 1}`}
                    className={`w-full ${state.formato === 'stories' ? 'aspect-[9/16]' : 'aspect-square'} object-cover rounded-lg border`}
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
            
            {/* Actions */}
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => {
                setImagensGeradas([]);
                setStep(1);
                setState(initialState);
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Novo Criativo
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                <Sparkles className="h-4 w-4 mr-2" />
                Regenerar
              </Button>
              <Button 
                variant="default"
                onClick={() => imagensGeradas.forEach((img, idx) => handleDownload(img, idx))}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Todos
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModuleGate>
  );
}
