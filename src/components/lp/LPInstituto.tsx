import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Syringe, Droplets, Zap, Leaf, Sparkles, Activity } from 'lucide-react';

interface Procedimento {
  titulo: string;
  icone?: 'syringe' | 'droplets' | 'zap' | 'leaf' | 'sparkles' | 'activity';
}

interface LPInstitutoProps {
  badgeText?: string;
  titulo?: string;
  subtitulo?: string;
  texto?: string;
  procedimentos?: Procedimento[];
  ctaText?: string;
  imagemUrl?: string;
  theme?: string;
  onCtaClick?: () => void;
}

const iconMap = {
  syringe: Syringe,
  droplets: Droplets,
  zap: Zap,
  leaf: Leaf,
  sparkles: Sparkles,
  activity: Activity,
};

const LPInstituto = ({
  badgeText = 'Conheça o Instituto Bernardes',
  titulo = 'Tecnologia Avançada e',
  subtitulo = 'Atendimento Humanizado',
  texto = 'No Instituto Bernardes, sob a liderança do Dr. Teodoro Bernardes, oferecemos tratamentos inovadores e minimamente invasivos, guiados por ultrassom, para proporcionar alívio duradouro e melhorar sua qualidade de vida.',
  procedimentos = [
    { titulo: 'Infiltrações', icone: 'syringe' as const },
    { titulo: 'Viscossuplementação', icone: 'droplets' as const },
    { titulo: 'Bloqueios de Nervos', icone: 'zap' as const },
    { titulo: 'Ortobiológicos', icone: 'leaf' as const },
    { titulo: 'Fotocêuticos', icone: 'sparkles' as const },
    { titulo: 'SIS (Sistema Super Indutivo)', icone: 'activity' as const },
  ],
  ctaText = 'AGENDAR CONSULTA',
  imagemUrl = 'https://page.dsgnrafa.com/wp-content/uploads/2024/07/Captura-de-tela-2024-07-15-112809.png',
  onCtaClick,
}: LPInstitutoProps) => {
  return (
    <section id="clin" className="bg-[#080808] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Image with laptop mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Badge */}
            <span className="inline-block px-4 py-2 rounded-full border border-white/20 text-white/70 text-sm">
              {badgeText}
            </span>

            {/* Title */}
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-white mb-1">
                {titulo}
              </h2>
              <h3 className="text-3xl md:text-4xl font-normal text-[#FF6B35]">
                {subtitulo}
              </h3>
            </div>
            
            {/* Description */}
            <p className="text-base text-white/70 leading-relaxed">
              {texto}
            </p>

            {/* CTA */}
            {onCtaClick && (
              <Button
                onClick={onCtaClick}
                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-6 py-5 rounded-lg text-sm font-medium group"
              >
                {ctaText}
                <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            )}

            {/* Laptop Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative mt-8"
            >
              <img 
                src={imagemUrl}
                alt="Instituto Bernardes"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>

          {/* Right Column - Procedimentos */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4 lg:mt-20"
          >
            {procedimentos.map((proc, index) => {
              const IconComponent = iconMap[proc.icone || 'syringe'];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg bg-[#BFCED3]/10 hover:bg-[#BFCED3]/20 transition-all group cursor-pointer"
                >
                  {/* Ícone */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#BFCED3] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconComponent className="w-6 h-6 text-[#080808]" />
                  </div>
                  <span className="text-lg text-white font-medium">
                    {proc.titulo}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LPInstituto;
