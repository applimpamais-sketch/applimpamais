import { motion } from 'framer-motion';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LP12DBioProps {
  name?: string;
  imageUrl?: string;
  bio?: string[];
  ctaText?: string;
  ctaUrl?: string;
  theme?: LPTheme;
}

const LP12DBio = ({
  name = "Catia Regiely",
  imageUrl = "https://catiaregiely.com.br/wp-content/uploads/2024/09/Untitled1.png",
  bio = [
    "Sou cristã, casada e mãe de três.",
    "Escritora, palestrante e mentora de mulheres.",
    "Ativo o desenvolvimento feminino através de ensinos que promovem o encontro do seu valor e posicionamento nas 11 áreas da vida.",
    "Líder do PDM clube (Papo de Mulher) um ambiente que promove um ecossistema de fortalecimento e ativação.",
    "Autora do devocional \"Papo com Deus\", um dos livros mais vendidos do Brasil.",
    "Minha missão de vida é fazer com que mulheres vençam o que eu já venci!",
    "Alinhando a tríade do corpo, alma e espírito você vai finalmente encontrar o seu propósito e alcançar uma vida próspera."
  ],
  ctaText = "QUERO APRENDER COM A CATIA",
  ctaUrl = "#preco",
  theme = 'midnight'
}: LP12DBioProps) => {
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
    <section id="Mentora" className="relative py-16 md:py-24 overflow-hidden bg-white">
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${t.gradientPrimary} opacity-30 rounded-3xl blur-2xl transform scale-110`} />
              <img
                src={imageUrl}
                alt={name}
                className="relative z-10 w-full max-w-md h-auto rounded-3xl"
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            <span className={`inline-block ${t.accent} text-sm font-medium uppercase tracking-wider mb-3`}>
              Seu Especialista
            </span>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
              <span className={`bg-gradient-to-r ${t.gradientHeadline} bg-clip-text text-transparent`}>
                {name}
              </span>
            </h2>
            
            <div className="space-y-4 mb-8">
              {bio.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="text-gray-600 text-base md:text-lg leading-relaxed"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

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
        </div>
      </div>
    </section>
  );
};

export default LP12DBio;
