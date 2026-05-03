import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CheckCircle, Star } from 'lucide-react';
import { motion, Transition } from 'framer-motion';

type FREQUENCY = 'monthly' | 'yearly';
const frequencies: FREQUENCY[] = ['monthly', 'yearly'];

interface Plan {
  name: string;
  info: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    text: string;
    tooltip?: string;
  }[];
  btn: {
    text: string;
    action: () => void;
  };
  highlighted?: boolean;
}

interface PricingSectionProps extends React.ComponentProps<'div'> {
  plans: Plan[];
  heading: string;
  description?: string;
}

export function ModernPricingSection({
  plans,
  heading,
  description,
  ...props
}: PricingSectionProps) {
  const [frequency, setFrequency] = React.useState<'monthly' | 'yearly'>(
    'monthly',
  );

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center space-y-8 p-4',
        props.className,
      )}
      {...props}
    >
      <div className="mx-auto max-w-xl space-y-3">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl bg-gradient-to-r from-white via-blue-400 to-cyan-400 bg-clip-text text-transparent">
          {heading}
        </h2>
        {description && (
          <p className="text-gray-400 text-center text-base md:text-lg">
            {description}
          </p>
        )}
      </div>
      <PricingFrequencyToggle
        frequency={frequency}
        setFrequency={setFrequency}
      />
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard plan={plan} key={plan.name} frequency={frequency} />
        ))}
      </div>
    </div>
  );
}

type PricingFrequencyToggleProps = React.ComponentProps<'div'> & {
  frequency: FREQUENCY;
  setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
};

export function PricingFrequencyToggle({
  frequency,
  setFrequency,
  ...props
}: PricingFrequencyToggleProps) {
  return (
    <div
      className={cn(
        'bg-gray-800/50 backdrop-blur-sm mx-auto flex w-fit rounded-full border border-gray-700 p-1',
        props.className,
      )}
      {...props}
    >
      {frequencies.map((freq) => (
        <button
          key={freq}
          onClick={() => setFrequency(freq)}
          className="relative px-6 py-2 text-sm font-medium capitalize text-gray-300 transition-colors hover:text-white"
        >
          <span className="relative z-10">{freq === 'monthly' ? 'Mensal' : 'Anual'}</span>
          {frequency === freq && (
            <motion.span
              layoutId="frequency"
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 absolute inset-0 z-0 rounded-full"
            />
          )}
        </button>
      ))}
    </div>
  );
}

type PricingCardProps = React.ComponentProps<'div'> & {
  plan: Plan;
  frequency?: FREQUENCY;
};

export function PricingCard({
  plan,
  className,
  frequency = frequencies[0],
  ...props
}: PricingCardProps) {
  const discount = frequency === 'yearly' 
    ? Math.round(((plan.price.monthly * 12 - plan.price.yearly) / plan.price.monthly / 12) * 100)
    : 0;

  return (
    <div
      key={plan.name}
      className={cn(
        'relative flex w-full flex-col rounded-xl border bg-black/40 backdrop-blur-sm',
        plan.highlighted 
          ? 'border-blue-500/50 ring-2 ring-blue-500/20 shadow-[0_0_50px_rgba(7,79,213,0.15)]' 
          : 'border-gray-800 hover:border-blue-500/30',
        'transition-all duration-300',
        className,
      )}
      {...props}
    >
      {plan.highlighted && (
        <BorderTrail
          style={{
            boxShadow:
              '0px 0px 40px 20px rgb(7 79 213 / 30%), 0 0 80px 40px rgb(34 211 238 / 20%)',
          }}
          size={100}
        />
      )}
      <div
        className={cn(
          'rounded-t-xl border-b p-6',
          plan.highlighted 
            ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20' 
            : 'bg-gray-900/50 border-gray-800',
        )}
      >
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {plan.highlighted && (
            <p className="bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-white">
              <Star className="h-3 w-3 fill-current" />
              Popular
            </p>
          )}
          {frequency === 'yearly' && discount > 0 && (
            <p className="bg-cyan-400 text-black flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold">
              {discount}% off
            </p>
          )}
        </div>

        <div className="text-xl font-bold text-white">{plan.name}</div>
        <p className="text-gray-400 text-sm font-normal mt-1">{plan.info}</p>
        <h3 className="mt-4 flex items-end gap-1.5">
          <span className="text-4xl font-bold text-white">R$ {plan.price[frequency]}</span>
          <span className="text-gray-400 text-base mb-1">
            /{frequency === 'monthly' ? 'mês' : 'ano'}
          </span>
        </h3>
      </div>
      <div
        className={cn(
          'space-y-4 px-6 py-8 text-sm flex-1',
          plan.highlighted && 'bg-gradient-to-b from-blue-500/5 to-transparent',
        )}
      >
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <CheckCircle className="text-cyan-400 h-5 w-5 flex-shrink-0 mt-0.5" />
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <p
                    className={cn(
                      'text-gray-300 leading-relaxed',
                      feature.tooltip &&
                        'cursor-pointer border-b border-dashed border-gray-600 hover:border-cyan-400 transition-colors',
                    )}
                  >
                    {feature.text}
                  </p>
                </TooltipTrigger>
                {feature.tooltip && (
                  <TooltipContent className="bg-gray-900 border-gray-700 text-gray-200 max-w-xs">
                    <p>{feature.tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
      <div
        className={cn(
          'mt-auto w-full border-t p-4',
          plan.highlighted 
            ? 'bg-gray-900/50 border-blue-500/20' 
            : 'bg-gray-900/30 border-gray-800',
        )}
      >
        <Button
          className={cn(
            'w-full font-semibold',
            plan.highlighted
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0'
              : 'bg-white/5 hover:bg-white/10 text-white border border-gray-700 hover:border-blue-500/50',
          )}
          onClick={plan.btn.action}
        >
          {plan.btn.text}
        </Button>
      </div>
    </div>
  );
}

type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export function BorderTrail({
  className,
  size = 80,
  transition,
  delay,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const BASE_TRANSITION: Transition = {
    repeat: Infinity,
    duration: 4,
    ease: 'linear' as const,
  };

  return (
    <div className='pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]'>
      <motion.div
        className={cn('absolute aspect-square', className)}
        style={{
          width: size,
          background: 'linear-gradient(90deg, #074FD5 0%, #22D3EE 50%, #074FD5 100%)',
          filter: 'blur(2px)',
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={transition ?? { ...BASE_TRANSITION, delay: delay }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}

// Planos pré-configurados
const defaultPlans: Plan[] = [
  {
    name: "Starter",
    info: "Para começar a digitalizar",
    price: {
      monthly: 297,
      yearly: 2970
    },
    features: [
      { text: "Até 100 agendamentos/mês" },
      { text: "1 técnico incluído" },
      { text: "Financeiro básico", tooltip: "Receitas, despesas e relatórios simples" },
      { text: "WhatsApp automático", tooltip: "Mensagens automáticas de confirmação" },
      { text: "Suporte por email", tooltip: "Resposta em até 24h" }
    ],
    btn: {
      text: "Começar Agora",
      action: () => {
        const element = document.getElementById('cta-form');
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  },
  {
    name: "Professional",
    info: "Solução completa para crescimento",
    price: {
      monthly: 497,
      yearly: 4970
    },
    features: [
      { text: "Agendamentos ilimitados" },
      { text: "Até 5 técnicos" },
      { text: "Financeiro completo", tooltip: "DRE, fluxo de caixa, metas e projeções" },
      { text: "Todas as integrações", tooltip: "WhatsApp, Facebook Pixel, Google Analytics" },
      { text: "App mobile para técnicos", tooltip: "iOS e Android" },
      { text: "Suporte prioritário", tooltip: "WhatsApp direto, resposta em 2h" }
    ],
    btn: {
      text: "Mais Popular",
      action: () => {
        const element = document.getElementById('cta-form');
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    highlighted: true
  },
  {
    name: "Enterprise",
    info: "White label completo",
    price: {
      monthly: 997,
      yearly: 9970
    },
    features: [
      { text: "Tudo do Professional" },
      { text: "Técnicos ilimitados" },
      { text: "White label 100%", tooltip: "Sistema completamente com sua marca" },
      { text: "Domínio customizado", tooltip: "seunegocio.com.br" },
      { text: "Suporte 24/7", tooltip: "Telefone, WhatsApp e email" },
      { text: "Customizações exclusivas", tooltip: "Desenvolvemos features sob demanda" }
    ],
    btn: {
      text: "Falar com Vendas",
      action: () => {
        window.open('https://wa.me/5531999999999?text=Olá! Gostaria de saber mais sobre o plano Enterprise.', '_blank');
      }
    }
  }
];

export default function PricingSection() {
  return (
    <section className="py-20 lg:py-32 bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(7,79,213,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative">
        <ModernPricingSection
          plans={defaultPlans}
          heading="Planos Transparentes e Escaláveis"
          description="Escolha o plano ideal para o momento do seu negócio. Upgrade ou downgrade quando quiser, sem burocracia."
        />
      </div>
    </section>
  );
}
