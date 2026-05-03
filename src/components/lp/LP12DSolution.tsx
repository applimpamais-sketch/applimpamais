import { motion } from 'framer-motion';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LP12DSolutionProps {
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  imageUrl?: string;
  theme?: LPTheme;
}

const LP12DSolution = ({
  title = "Acessar sua melhor versão",
  subtitle = "A metáfora do jardim",
  paragraphs = [
    "Imagine que sua vida é um jardim. Cada área — saúde, relacionamentos, carreira, espiritualidade — é uma planta diferente.",
    "Quando não cuidamos adequadamente desse jardim, as ervas daninhas (estresse, ansiedade, inseguranças) começam a tomar conta.",
    "É hora de arrancar as ervas daninhas, regar as plantas certas e dar atenção às flores que você mais gosta...",
    "E para isso, você precisa chamar o melhor jardineiro!"
  ],
  imageUrl = "https://catiaregiely.com.br/wp-content/uploads/2024/09/Group-1171275310-e1727711269626.png",
  theme = 'midnight'
}: LP12DSolutionProps) => {
  const t = getTheme(theme);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-white">
      {/* Decorative gradient */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-1 bg-gradient-to-r from-transparent via-current ${t.accent} opacity-50 to-transparent`} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <span className={`inline-block ${t.accent} text-sm font-medium uppercase tracking-wider mb-3`}>
              {subtitle}
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
              <span className={`bg-gradient-to-r ${t.gradientHeadline} bg-clip-text text-transparent`}>
                {title}
              </span>
            </h2>
            
            <div className="space-y-4">
              {paragraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-gray-600 text-base md:text-lg leading-relaxed"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${t.gradientPrimary} opacity-30 rounded-3xl blur-2xl transform scale-110`} />
              
              <img
                src={imageUrl}
                alt="Solução"
                className="relative z-10 w-full max-w-md h-auto rounded-3xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LP12DSolution;
