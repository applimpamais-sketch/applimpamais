import { motion } from 'framer-motion';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface Benefit {
  text: string;
}

interface LP12DBenefitsProps {
  title?: string;
  subtitle?: string;
  benefits?: Benefit[];
  ctaText?: string;
  ctaUrl?: string;
  theme?: LPTheme;
}

const LP12DBenefits = ({
  title = "E é exatamente por isso que eu decidi criar o",
  subtitle = "DESAFIO 12D",
  benefits = [
    { text: "Como arrancar as ervas daninhas, regar as plantas e dar atenção para as flores que você mais gosta..." },
    { text: "Como fortalecer a relação com sua família e passar a ser vista como uma mãe e uma esposa extraordinária" },
    { text: "Porque os resultados da vida que você mais deseja, depende da forma como você cuida de si mesma..." },
    { text: "Como transformar o \"Ciclo Negativo\" em um catalisador para sua melhor versão? (Módulo 2)" },
    { text: "Os \"11 pilares da vida\" que quando bem equilibrados te dão uma chuva de bençãos, realizações, prosperidade e harmonia..." },
    { text: "E muito mais!" }
  ],
  ctaText = "QUERO ENTRAR PARA O 12D",
  ctaUrl = "#preco",
  theme = 'midnight'
}: LP12DBenefitsProps) => {
  const t = getTheme(theme);
  
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  // Dynamic gradient bullet using theme colors
  const GradientBullet = () => (
    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${t.gradientPrimary} flex-shrink-0 flex items-center justify-center`}>
      <div className="w-3 h-3 rounded-full bg-white" />
    </div>
  );

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gray-50">
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-gray-600 text-lg md:text-xl mb-2">{title}</p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className={`bg-gradient-to-r ${t.gradientPrimary} bg-clip-text text-transparent`}>
              {subtitle}
            </span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl p-6 md:p-10 border border-gray-200 shadow-lg"
          >
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="flex items-start gap-4"
                >
                  <GradientBullet />
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    {benefit.text}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 text-center"
            >
              <button
                onClick={() => scrollToSection(ctaUrl)}
                className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${t.gradientButton} rounded-full text-black font-bold text-lg shadow-xl ${t.shadowCta} transition-all hover:scale-105`}
              >
                <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {ctaText}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LP12DBenefits;
