import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface LPAboutProblemProps {
  titulo?: string;
  tituloDestaque?: string;
  texto?: string;
  destaque?: string;
  ctaText?: string;
  imagemUrl?: string;
  imagens?: string[];
  theme?: string;
  onCtaClick?: () => void;
}

const LPAboutProblem = ({
  titulo = 'A Dor',
  tituloDestaque = 'Não Precisa Ser sua Companheira Diária',
  texto = 'Se você ou um ente querido sofre com dores crônicas nos joelhos, coluna, ombros ou mãos, sabe como isso pode tornar atividades simples em desafios insuportáveis.\n\nO envelhecimento, inflamações, sedentarismo e outras condições de saúde não precisam definir sua qualidade de vida.',
  destaque = 'O Dr. Teodoro Bernardes está aqui para oferecer uma solução.',
  ctaText = 'AGENDAR MINHA CONSULTA',
  imagemUrl = 'https://page.dsgnrafa.com/wp-content/uploads/2024/07/Group-1-1.png',
  imagens,
  onCtaClick,
}: LPAboutProblemProps) => {
  // Parse texto em parágrafos
  const paragrafos = texto.split('\n\n').filter(Boolean);

  // Default imagens grid (4 imagens do template)
  const defaultImagens = [
    'https://page.dsgnrafa.com/wp-content/uploads/2024/07/drteodorobernardes_415992851_18404019920013981_3082282117478082854_n-1024x1024.jpg',
    'https://page.dsgnrafa.com/wp-content/uploads/2024/07/drteodorobernardes_387127568_18393877355013981_1588671626399217016_n-1024x1024.jpg',
    'https://page.dsgnrafa.com/wp-content/uploads/2024/07/drteodorobernardes_387137618_18393877379013981_7199866666299859597_n-1024x1024.jpg',
    'https://page.dsgnrafa.com/wp-content/uploads/2024/07/drteodorobernardes_420130363_18405826960013981_6204951090499063570_n-819x1024.jpg',
  ];

  const imagensGrid = imagens || defaultImagens;

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Imagem Grid (2x2) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-3"
          >
            {imagensGrid.slice(0, 4).map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="aspect-square overflow-hidden rounded-lg"
              >
                <img 
                  src={img} 
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Conteúdo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-normal text-gray-900 leading-tight">
              <span className="text-[#FF6B35]">{titulo}</span>{' '}
              {tituloDestaque}
            </h2>

            <div className="space-y-4">
              {paragrafos.map((paragrafo, index) => (
                <p key={index} className="text-base text-gray-600 leading-relaxed">
                  {paragrafo}
                </p>
              ))}
            </div>

            {destaque && (
              <p className="text-base text-gray-900 font-medium">
                {destaque}
              </p>
            )}

            {onCtaClick && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={onCtaClick}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-6 py-5 rounded-lg text-sm font-medium group"
                >
                  {ctaText}
                  <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LPAboutProblem;
