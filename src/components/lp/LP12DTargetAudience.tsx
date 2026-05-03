import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface TargetItem {
  text: string;
}

interface LP12DTargetAudienceProps {
  title?: string;
  forYouTitle?: string;
  forYouItems?: TargetItem[];
  notForYouTitle?: string;
  notForYouItems?: TargetItem[];
  theme?: LPTheme;
}

const LP12DTargetAudience = ({
  title = "ESSE DESAFIO É PARA VOCÊ?",
  forYouTitle = "O 12D é para você se:",
  forYouItems = [
    { text: "Você é uma mulher que deseja fortalecer suas emoções" },
    { text: "Você quer ser uma mãe e esposa mais presente e amorosa" },
    { text: "Você busca equilíbrio entre vida pessoal e profissional" },
    { text: "Você quer encontrar sua melhor versão" },
    { text: "Você está disposta a dedicar 15 minutos por dia" }
  ],
  notForYouTitle = "O 12D NÃO é para você se:",
  notForYouItems = [
    { text: "Você não está disposta a se comprometer" },
    { text: "Você quer resultados sem esforço" },
    { text: "Você não acredita que pode mudar" },
    { text: "Você não tem 15 minutos por dia" }
  ],
  theme = 'midnight'
}: LP12DTargetAudienceProps) => {
  const t = getTheme(theme);

  return (
    <section id="Desafio" className="relative py-16 md:py-24 overflow-hidden bg-[#F5F5F5]">
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12"
        >
          <span className={`bg-gradient-to-r ${t.gradientHeadline} bg-clip-text text-transparent`}>
            {title}
          </span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* For You Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-green-500/30 shadow-lg"
          >
            <h3 className="text-xl md:text-2xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <Check className="w-6 h-6" />
              {forYouTitle}
            </h3>
            
            <div className="space-y-4">
              {forYouItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-gray-700 text-base">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Not For You Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl p-6 md:p-8 border border-red-500/30 shadow-lg"
          >
            <h3 className="text-xl md:text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
              <X className="w-6 h-6" />
              {notForYouTitle}
            </h3>
            
            <div className="space-y-4">
              {notForYouItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                  <p className="text-gray-700 text-base">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LP12DTargetAudience;
