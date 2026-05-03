import { motion } from 'framer-motion';
import { Shield, Clock, Award } from 'lucide-react';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LP12DPricingProps {
  guaranteeDays?: number;
  originalPrice?: string;
  installmentPrice?: string;
  installments?: number;
  cashPrice?: string;
  mockupUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  theme?: LPTheme;
}

const LP12DPricing = ({
  guaranteeDays = 14,
  originalPrice = "R$ 297",
  installmentPrice = "R$ 15,26",
  installments = 10,
  cashPrice = "R$ 127,00",
  mockupUrl = "https://catiaregiely.com.br/wp-content/uploads/2024/10/TODOS-Mockups-1024x664.png",
  ctaText = "QUERO ENTRAR PARA O 12D",
  ctaUrl = "https://pay.kiwify.com.br",
  theme = 'midnight'
}: LP12DPricingProps) => {
  const t = getTheme(theme);

  return (
    <section id="preco" className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 ${t.bgPrimary}`} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Guarantee Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-full">
            <Shield className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-bold text-lg">
              GARANTIA DE {guaranteeDays} DIAS
            </span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Mockup */}
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
                src={mockupUrl}
                alt="Mockup do Curso"
                className="relative z-10 w-full max-w-lg h-auto"
              />
            </div>
          </motion.div>

          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`${t.bgCard} backdrop-blur-lg rounded-3xl p-8 md:p-10 border border-white/10`}
          >
            <div className="text-center">
              {/* Original Price */}
              {originalPrice && (
                <p className="text-gray-400 text-lg mb-2">
                  De: <span className="line-through">{originalPrice}</span>
                </p>
              )}
              
              {/* Installment Price */}
              <div className="mb-4">
                <p className="text-gray-300 text-xl mb-1">Por apenas</p>
                <p className="text-5xl md:text-6xl font-bold">
                  <span className={`bg-gradient-to-r ${t.gradientPrimary} bg-clip-text text-transparent`}>
                    {installments}x de {installmentPrice}
                  </span>
                </p>
              </div>
              
              {/* Cash Price */}
              {cashPrice && (
                <p className="text-gray-300 text-lg mb-8">
                  ou {cashPrice} à vista
                </p>
              )}

              {/* Features */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className={`w-5 h-5 ${t.accent}`} />
                  <span>Acesso Imediato</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Award className={`w-5 h-5 ${t.accent}`} />
                  <span>Certificado</span>
                </div>
              </div>

              {/* CTA Button */}
              <motion.a
                href={ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r ${t.gradientButton} rounded-full text-black font-bold text-xl shadow-xl ${t.shadowCta} transition-all w-full justify-center`}
              >
                <span className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {ctaText}
              </motion.a>

              {/* Payment Methods */}
              <p className="text-gray-400 text-sm mt-6">
                Pagamento 100% seguro via cartão ou PIX
              </p>
            </div>
          </motion.div>
        </div>

        {/* Guarantee Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto mt-16 text-center"
        >
          <div className={`${t.bgCard} backdrop-blur-lg rounded-3xl p-8 border border-green-500/30`}>
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-400 mb-4">
              Garantia Incondicional de {guaranteeDays} Dias
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Se dentro de {guaranteeDays} dias você não ficar satisfeito(a), 
              basta enviar um e-mail e devolveremos 100% do seu investimento. 
              Sem perguntas, sem burocracia. O risco é todo nosso.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LP12DPricing;
