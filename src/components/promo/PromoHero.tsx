import { motion } from 'framer-motion';
import { Sparkles, Clock, BadgePercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PromoHero = () => {
  const navigate = useNavigate();

  const handleAgendar = () => {
    const promoItem = {
      id: 'promo-sofa-149',
      name: 'Limpeza de Sofá',
      details: 'Sofá até 2,5m - Promoção',
      quantity: 1,
      price: 149.90
    };
    
    navigate('/agendamento', {
      state: {
        cartItems: [promoItem],
        cupomAplicado: null
      }
    });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 py-16 bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-black to-black" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Urgency Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-6"
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 text-sm font-medium">⚡ Oferta por Tempo Limitado</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
        >
          <span className="text-white">Limpeza Profissional</span>
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            de Sofá
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-300 mb-8"
        >
          Sofás até 2,5 metros com desconto especial
        </motion.p>

        {/* Price Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-block bg-gray-900/90 backdrop-blur-md rounded-2xl p-8 border border-gray-700 mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-gray-400 line-through text-2xl">R$ 339,00</span>
            <BadgePercent className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-gray-400 text-xl">por apenas</span>
          </div>
          <div className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            R$ 149,90
          </div>
          <p className="text-gray-300 text-lg mt-2">
            ou em até <span className="text-green-400 font-semibold">12x de R$ 14,90</span>
          </p>
          <p className="text-cyan-400 text-sm mt-2 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            Economia de R$ 189,10
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            onClick={handleAgendar}
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300"
          >
            Agendar Agora com Desconto
          </Button>
          <p className="text-gray-400 text-sm mt-4">
            🏠 Atendimento em BH e Região Metropolitana
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PromoHero;
