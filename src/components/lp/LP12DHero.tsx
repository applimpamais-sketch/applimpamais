import { motion } from 'framer-motion';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LP12DHeroProps {
  preHeadline?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaUrl?: string;
  imageUrl?: string;
  theme?: LPTheme;
}

const LP12DHero = ({
  preHeadline = "Mãe, Esposa e Mulher...",
  headline = "Como fortalecer suas emoções sem abrir mão do autocuidado, autoestima e confiança?",
  subheadline = "Em 12 dias você será capaz de encontrar equilíbrio emocional, sentindo-se segura e confiante sobre suas decisões como mãe e esposa, sendo um exemplo positivo para sua família...",
  ctaText = "QUERO ENTRAR PARA O 12D",
  ctaUrl = "#preco",
  imageUrl = "https://catiaregiely.com.br/wp-content/uploads/2024/09/ft.jpg",
  theme = 'midnight'
}: LP12DHeroProps) => {
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

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
      {/* Decorative Gradient Orbs */}
      <div className={`absolute top-20 right-0 w-96 h-96 bg-gradient-to-br ${t.gradientPrimary} opacity-20 rounded-full blur-3xl`} />
      <div className={`absolute bottom-20 left-0 w-80 h-80 bg-gradient-to-br ${t.gradientPrimary} opacity-15 rounded-full blur-3xl`} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <p className={`${t.accent} text-lg md:text-xl font-medium mb-4`}>
              {preHeadline}
            </p>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              <span className={`bg-gradient-to-r ${t.gradientHeadline} bg-clip-text text-transparent`}>
                {headline}
              </span>
            </h1>
            
            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {subheadline}
            </p>
            
            <motion.button
              onClick={() => scrollToSection(ctaUrl)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${t.gradientButton} rounded-full text-black font-bold text-lg shadow-xl ${t.shadowCta} transition-all`}
            >
              <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {ctaText}
            </motion.button>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Glow effect behind image */}
              <div className={`absolute inset-0 bg-gradient-to-br ${t.gradientPrimary} opacity-40 rounded-3xl blur-2xl transform scale-95`} />
              
              <img
                src={imageUrl}
                alt="Hero"
                className="relative z-10 w-full h-auto rounded-3xl shadow-2xl"
              />
              
              {/* Decorative elements */}
              <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${t.gradientPrimary} rounded-full opacity-60 blur-xl`} />
              <div className={`absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br ${t.gradientPrimary} rounded-full opacity-60 blur-xl`} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LP12DHero;
