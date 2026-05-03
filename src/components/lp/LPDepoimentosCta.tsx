import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Play } from 'lucide-react';

interface LPDepoimentosCtaProps {
  titulo?: string;
  tituloDestaque?: string;
  subtitulo?: string;
  ctaText?: string;
  videoPlaceholders?: number;
  imagemPrincipalUrl?: string;
  imagemBadgeUrl?: string;
  theme?: string;
  onCtaClick?: () => void;
}

const LPDepoimentosCta = ({
  titulo = 'O Que Nossos',
  tituloDestaque = 'Pacientes Dizem',
  subtitulo = 'Veja os depoimentos no Google e nas redes sociais que comprovam nossa dedicação em oferecer tratamentos eficazes e um atendimento humano.',
  ctaText = 'AGENDAR MINHA CONSULTA',
  videoPlaceholders = 6,
  imagemPrincipalUrl = 'https://page.dsgnrafa.com/wp-content/uploads/2024/07/WhatsApp-Image-2024-07-15-at-11.04.20.jpeg',
  imagemBadgeUrl = 'https://page.dsgnrafa.com/wp-content/uploads/2024/07/Teodoro-Bernardes-Teodoro-Bernardes-Teodoro-Bernardes-copiar.png',
  onCtaClick,
}: LPDepoimentosCtaProps) => {
  return (
    <section id="dep" className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Row */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
              {titulo}
              <br />
              <span className="text-[#FF6B35] font-normal">{tituloDestaque}</span>
            </h2>
          </motion.div>

          {/* Subtitle with image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-start gap-4"
          >
            {/* Badge Image */}
            {imagemPrincipalUrl && (
              <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden">
                <img 
                  src={imagemPrincipalUrl}
                  alt="Depoimentos"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="text-sm text-gray-600 leading-relaxed">
              {subtitulo}
            </p>
          </motion.div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {Array.from({ length: videoPlaceholders }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer hover:shadow-lg transition-shadow"
            >
              {/* Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 group-hover:bg-gray-300 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-gray-600 ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        {onCtaClick && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button
              onClick={onCtaClick}
              className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-8 py-5 rounded-lg text-sm font-medium group"
            >
              {ctaText}
              <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default LPDepoimentosCta;
