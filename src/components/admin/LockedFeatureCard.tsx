import { Lock, Sparkles, ArrowRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SaasPlano } from '@/hooks/useTenantLimits';

type FeatureKey = 'whatsapp_bot' | 'relatorios_avancados' | 'api_access' | 'white_label';

interface FeatureInfo {
  title: string;
  description: string;
  requiredPlan: SaasPlano;
  benefits: string[];
  icon: typeof Lock;
}

const FEATURE_INFO: Record<FeatureKey, FeatureInfo> = {
  whatsapp_bot: {
    title: 'Bot WhatsApp',
    description: 'Automação inteligente de atendimento e agendamento via WhatsApp',
    requiredPlan: 'professional',
    benefits: [
      'Atendimento 24/7 automático',
      'Confirmações de agendamento',
      'Recuperação de carrinhos',
      'Respostas personalizadas',
    ],
    icon: Sparkles,
  },
  relatorios_avancados: {
    title: 'Relatórios Avançados',
    description: 'DRE automático, fluxo de caixa e análises detalhadas',
    requiredPlan: 'professional',
    benefits: [
      'DRE mensal automático',
      'Fluxo de caixa projetado',
      'Análise de lucratividade',
      'Exportação em Excel/PDF',
    ],
    icon: Crown,
  },
  api_access: {
    title: 'Acesso à API',
    description: 'Integre seu sistema com outras plataformas via API REST',
    requiredPlan: 'enterprise',
    benefits: [
      'API REST completa',
      'Webhooks customizáveis',
      'Documentação completa',
      'Suporte dedicado',
    ],
    icon: Lock,
  },
  white_label: {
    title: 'White Label',
    description: 'Sistema 100% personalizado com sua marca e domínio próprio',
    requiredPlan: 'enterprise',
    benefits: [
      'Domínio customizado',
      'Logo e cores próprias',
      'Email corporativo',
      'Sem menção à plataforma',
    ],
    icon: Crown,
  },
};

const PLAN_NAMES: Record<SaasPlano, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

interface LockedFeatureCardProps {
  feature: FeatureKey;
  currentPlan?: SaasPlano | null;
  onUpgrade?: () => void;
}

export function LockedFeatureCard({ 
  feature, 
  currentPlan,
  onUpgrade 
}: LockedFeatureCardProps) {
  const info = FEATURE_INFO[feature];
  const Icon = info.icon;
  const requiredPlanName = PLAN_NAMES[info.requiredPlan];

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Redirecionar para página de upgrade ou WhatsApp
      window.open('https://wa.me/5531999999999?text=Olá! Gostaria de fazer upgrade do meu plano para acessar ' + info.title, '_blank');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-lg w-full border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-muted/30 to-muted/10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          
          <Badge variant="secondary" className="mx-auto mb-2">
            Disponível no plano {requiredPlanName}
          </Badge>
          
          <CardTitle className="text-xl">{info.title}</CardTitle>
          <CardDescription className="text-base">
            {info.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              O que você terá acesso:
            </p>
            <ul className="space-y-2">
              {info.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {currentPlan && (
            <div className="text-center text-sm text-muted-foreground">
              Seu plano atual: <span className="font-medium">{PLAN_NAMES[currentPlan]}</span>
            </div>
          )}

          <Button 
            onClick={handleUpgrade}
            className="w-full gap-2"
            size="lg"
          >
            <Sparkles className="w-4 h-4" />
            Fazer Upgrade para {requiredPlanName}
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Upgrade instantâneo • Sem tempo de espera • Suporte incluso
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente menor para uso inline
interface LockedFeatureBadgeProps {
  feature: FeatureKey;
  className?: string;
}

export function LockedFeatureBadge({ feature, className }: LockedFeatureBadgeProps) {
  const info = FEATURE_INFO[feature];
  const requiredPlanName = PLAN_NAMES[info.requiredPlan];

  return (
    <Badge 
      variant="outline" 
      className={`gap-1 bg-amber-50 text-amber-700 border-amber-200 ${className}`}
    >
      <Lock className="w-3 h-3" />
      {requiredPlanName}
    </Badge>
  );
}
