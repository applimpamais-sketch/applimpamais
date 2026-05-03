import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Layout, Sparkles, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ModuleGate } from '@/components/admin/ModuleGate';
import { WizardStep } from '@/components/iarc/WizardStep';
import { ServiceSelector } from '@/components/iarc/ServiceSelector';
import { PricingSelector, PrecosConfig } from '@/components/iarc/PricingSelector';
import { CtaSelector, DestinoCta } from '@/components/iarc/CtaSelector';
import { ElementsSelector, ElementosConfig } from '@/components/iarc/ElementsSelector';
import { ThemeSelector } from '@/components/iarc/ThemeSelector';
import { TemplateSelector, TemplateReal } from '@/components/iarc/TemplateSelector';
import { ServicoIARC } from '@/hooks/useServicosParaIARC';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LPTheme, themes } from '@/styles/lp-themes';

interface WizardState {
  servico: ServicoIARC | null;
  precos: PrecosConfig;
  destinoCta: DestinoCta;
  elementos: ElementosConfig;
  templateReal: TemplateReal;
  theme: LPTheme;
  nomeLP: string;
  headline: string;
  subheadline: string;
}

const templateNames: Record<TemplateReal, string> = {
  'lp-12d': 'Desafio 12D',
  'lp-teodoro': 'Teodoro',
};

const initialState: WizardState = {
  servico: null,
  precos: { estrategia: 'promocional' },
  destinoCta: 'whatsapp',
  elementos: {
    timer: true,
    depoimentos: true,
    garantia: true,
    antesDepois: true,
    urgencia: true,
    prova_social: true,
  },
  templateReal: 'lp-teodoro',
  theme: 'midnight',
  nomeLP: '',
  headline: '',
  subheadline: '',
};

export default function WizardLandingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(initialState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lpGerada, setLpGerada] = useState<{
    id: string;
    slug: string;
    url: string;
    copy: any;
  } | null>(null);
  
  const totalSteps = 6;
  
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
      case 6: return state.nomeLP.trim().length > 0;
      default: return false;
    }
  };
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('iarc-generate-landing', {
        body: {
          servico: state.servico,
          precos: state.precos,
          destino_cta: state.destinoCta,
          elementos: state.elementos,
          template_real: state.templateReal,
          theme: state.theme,
          nome: state.nomeLP,
          headline: state.headline || undefined,
          subheadline: state.subheadline || undefined,
        }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        setLpGerada({
          id: data.landing_page.id,
          slug: data.landing_page.slug,
          url: `/lp/${data.landing_page.slug}`,
          copy: data.landing_page.copy_gerada,
        });
        toast.success('Landing Page criada com sucesso!');
      } else {
        toast.error(data?.error || 'Erro ao gerar landing page');
      }
    } catch (err: any) {
      console.error('Erro ao gerar LP:', err);
      toast.error(err.message || 'Erro ao gerar landing page');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <WizardStep
            title="Para qual serviço deseja criar a Landing Page?"
            description="Selecione um serviço do seu catálogo"
            icon={<Sparkles className="h-6 w-6" />}
            step={1}
            totalSteps={totalSteps}
            onNext={handleNext}
            canGoNext={canGoNext()}
          >
            <ServiceSelector
              selected={state.servico}
              onSelect={(servico) => setState({ 
                ...state, 
                servico,
                nomeLP: `LP ${servico.subcategoria}`,
              })}
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
            title="Para onde o lead será direcionado?"
            description="Defina o destino do botão de ação"
            step={3}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            canGoNext={canGoNext()}
          >
            <CtaSelector
              value={state.destinoCta}
              onChange={(destinoCta) => setState({ ...state, destinoCta })}
            />
          </WizardStep>
        );
        
      case 4:
        return (
          <WizardStep
            title="Qual template deseja usar?"
            description="Escolha o layout da sua landing page"
            step={4}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            canGoNext={canGoNext()}
          >
            <div className="space-y-6">
              <TemplateSelector
                value={state.templateReal}
                onChange={(templateReal) => setState({ ...state, templateReal })}
              />
              
              <div className="space-y-3">
                <Label className="text-base font-semibold">Elementos Adicionais</Label>
                <ElementsSelector
                  value={state.elementos}
                  onChange={(elementos) => setState({ ...state, elementos })}
                  mode="landing_page"
                />
              </div>
            </div>
          </WizardStep>
        );
        
      case 5:
        return (
          <WizardStep
            title="Qual estilo visual combina mais?"
            description="Escolha o tema de cores da landing page"
            step={5}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            canGoNext={canGoNext()}
          >
            <ThemeSelector
              value={state.theme}
              onChange={(theme) => setState({ ...state, theme })}
            />
          </WizardStep>
        );
        
      case 6:
        return (
          <WizardStep
            title="Detalhes da Landing Page"
            description="Configure o nome e textos principais"
            step={6}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            canGoNext={canGoNext()}
            isLoading={isGenerating}
            loadingText="Gerando LP..."
            nextLabel="Criar Landing Page"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Landing Page *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Promoção Sofá Março"
                  value={state.nomeLP}
                  onChange={(e) => setState({ ...state, nomeLP: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="headline">Headline (opcional - IA gera se vazio)</Label>
                <Input
                  id="headline"
                  placeholder="Ex: Sofá Limpo em 24h ou Seu Dinheiro de Volta"
                  value={state.headline}
                  onChange={(e) => setState({ ...state, headline: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subheadline">Subheadline (opcional)</Label>
                <Textarea
                  id="subheadline"
                  placeholder="Ex: Eliminamos 100% dos ácaros e devolvemos seu sofá como novo"
                  value={state.subheadline}
                  onChange={(e) => setState({ ...state, subheadline: e.target.value })}
                  rows={2}
                />
              </div>
              
              {/* Resumo */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Resumo da LP:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Serviço: <span className="text-foreground">{state.servico?.subcategoria}</span></li>
                  <li>• Template: <span className="text-foreground">{templateNames[state.templateReal]}</span></li>
                  <li>• Tema: <span className="text-foreground">{themes[state.theme].name}</span></li>
                  <li>• CTA: <span className="text-foreground capitalize">{state.destinoCta}</span></li>
                  <li>• Preço: <span className="text-foreground">
                    {state.precos.estrategia === 'sem_preco' ? 'Não exibir' :
                     state.precos.estrategia === 'promocional' ? 
                       `De R$ ${state.precos.precoOriginal} por R$ ${state.precos.precoFinal}` :
                       `R$ ${state.precos.precoFinal}`}
                  </span></li>
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
              <Layout className="h-6 w-6 text-blue-500" />
              Construtor de Landing Pages
            </h1>
            <p className="text-muted-foreground">
              Crie páginas de conversão com IA
            </p>
          </div>
        </div>
        
        {/* Wizard or Results */}
        {!lpGerada ? (
          renderStepContent()
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Landing Page Criada!
              </CardTitle>
              <CardDescription>
                Sua página está pronta para receber tráfego
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URL */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <Label className="text-xs text-muted-foreground">URL da Landing Page</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-sm bg-background p-2 rounded border">
                    {window.location.origin}{lpGerada.url}
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(`${window.location.origin}${lpGerada.url}`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Preview */}
              {lpGerada.copy && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Copy Gerada:</Label>
                  <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Headline:</span>
                      <p className="font-semibold">{lpGerada.copy.headline}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Subheadline:</span>
                      <p className="text-sm text-muted-foreground">{lpGerada.copy.subheadline}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">CTA:</span>
                      <Badge>{lpGerada.copy.cta_text}</Badge>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => {
                  setLpGerada(null);
                  setStep(1);
                  setState(initialState);
                }}>
                  Criar Nova LP
                </Button>
                <Button onClick={() => window.open(lpGerada.url, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visualizar LP
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleGate>
  );
}
