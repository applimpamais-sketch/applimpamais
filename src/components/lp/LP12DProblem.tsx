import { motion } from 'framer-motion';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LP12DProblemProps {
  sealUrl?: string;
  title?: string;
  paragraphs?: string[];
  highlightText?: string;
  theme?: LPTheme;
}

const LP12DProblem = ({
  sealUrl = "https://catiaregiely.com.br/wp-content/uploads/2024/09/SELO2.png",
  title = "Você precisa dar conta de tudo?",
  paragraphs = [
    "A pressão constante de ter que exercer esses múltiplos papéis— Mãe, esposa, amiga, empresária, funcionária, dona de casa, — faz com que nosso emocional vire uma bagunça...",
    "E isso nos deixa sobrecarregadas, estressadas, inseguras e com aquela sensação de estagnação...",
    "De sempre estar vivenciando o mesmo ciclo negativo.",
    "O que nos afasta da nossa melhor versão!"
  ],
  highlightText = "Hoje, convido você a participar de um Desafio de 12 dias, no qual terá a oportunidade de...",
  theme = 'midnight'
}: LP12DProblemProps) => {
  const t = getTheme(theme);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gray-50">
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Rotating Seal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center lg:justify-start"
          >
            <motion.img
              src={sealUrl}
              alt="Selo"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
              <span className={`bg-gradient-to-r ${t.gradientHeadline} bg-clip-text text-transparent`}>
                {title}
              </span>
            </h2>
            
            <div className="space-y-4">
              {paragraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-gray-600 text-base md:text-lg leading-relaxed"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
            
            {highlightText && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className={`mt-8 text-lg md:text-xl font-semibold bg-gradient-to-r ${t.gradientPrimary} bg-clip-text text-transparent`}
              >
                {highlightText}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LP12DProblem;
