import { motion } from 'framer-motion';
import { User, Baby, PawPrint, Building, Sparkles } from 'lucide-react';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface PerfilIdeal {
  titulo: string;
  descricao: string;
  icon?: 'user' | 'baby' | 'pet' | 'building' | 'sparkle';
}

interface LPTargetAudienceProps {
  titulo?: string;
  subtitulo?: string;
  perfis: PerfilIdeal[];
  theme?: LPTheme;
}

const iconMap = {
  user: User,
  baby: Baby,
  pet: PawPrint,
  building: Building,
  sparkle: Sparkles,
};

const defaultPerfis: PerfilIdeal[] = [
  { titulo: 'Famílias com crianças', descricao: 'Ambiente saudável e livre de ácaros para os pequenos', icon: 'baby' },
  { titulo: 'Donos de pets', descricao: 'Eliminação de pelos, odores e alérgenos', icon: 'pet' },
  { titulo: 'Profissionais ocupados', descricao: 'Praticidade sem abrir mão da limpeza', icon: 'user' },
  { titulo: 'Quem busca qualidade', descricao: 'Resultado profissional que você pode ver', icon: 'sparkle' },
];

const LPTargetAudience = ({ 
  titulo = 'Para quem é este serviço?',
  subtitulo = 'Ideal para pessoas que valorizam limpeza profissional e um ambiente saudável',
  perfis = defaultPerfis,
  theme = 'midnight'
}: LPTargetAudienceProps) => {
  const t = getTheme(theme);
  
  return (
    <section className={`${t.bgPrimary} py-16 md:py-24`}>
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${t.textPrimary} mb-4`}>
            {titulo}
          </h2>
          <p className={`text-xl ${t.textMuted} max-w-2xl mx-auto`}>
            {subtitulo}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {perfis.map((perfil, index) => {
            const Icon = iconMap[perfil.icon || 'user'];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${t.bgCard} backdrop-blur-sm ${t.border} border ${t.bgCardHover} p-6 rounded-xl group hover:scale-105 transition-all duration-300`}
              >
                <div className={`bg-gradient-to-br ${t.gradientIcon} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-semibold ${t.textPrimary} mb-2`}>
                  {perfil.titulo}
                </h3>
                <p className={`${t.textMuted} text-sm`}>
                  {perfil.descricao}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LPTargetAudience;
