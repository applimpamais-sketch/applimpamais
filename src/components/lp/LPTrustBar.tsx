import { Marquee } from '@/components/ui/marquee';
import { Shield, Award, Users, Clock, CheckCircle, Star } from 'lucide-react';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LPTrustBarProps {
  items?: Array<{
    icon: 'shield' | 'award' | 'users' | 'clock' | 'check' | 'star';
    text: string;
  }>;
  theme?: LPTheme;
}

const defaultItems = [
  { icon: 'users' as const, text: '+5.000 clientes satisfeitos' },
  { icon: 'star' as const, text: '4.9 estrelas no Google' },
  { icon: 'shield' as const, text: 'Garantia de 7 dias' },
  { icon: 'award' as const, text: 'Profissionais certificados' },
  { icon: 'clock' as const, text: 'Atendimento em até 24h' },
  { icon: 'check' as const, text: 'Equipamentos profissionais' },
];

const iconMap = {
  shield: Shield,
  award: Award,
  users: Users,
  clock: Clock,
  check: CheckCircle,
  star: Star,
};

const LPTrustBar = ({ items = defaultItems, theme = 'midnight' }: LPTrustBarProps) => {
  const t = getTheme(theme);
  
  return (
    <section className={`${t.bgSection} ${t.border} border-y py-6 overflow-hidden`}>
      <Marquee className="[--duration:30s]" pauseOnHover>
        <div className="flex items-center gap-12 px-4">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon];
            return (
              <div key={index} className={`flex items-center gap-3 ${t.textMuted}`}>
                <Icon className={`w-5 h-5 ${t.accent}`} />
                <span className="text-sm font-medium whitespace-nowrap">{item.text}</span>
              </div>
            );
          })}
        </div>
      </Marquee>
    </section>
  );
};

export default LPTrustBar;
