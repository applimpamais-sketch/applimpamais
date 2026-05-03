import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Calendar,
    step: '1',
    title: 'Agende Online',
    description: 'Preencha seus dados, escolha a data e o período preferido (manhã ou tarde)',
  },
  {
    icon: MessageSquare,
    step: '2',
    title: 'Confirmamos o Horário',
    description: 'Nossa equipe entra em contato pelo WhatsApp para combinar o horário exato',
  },
  {
    icon: Sparkles,
    step: '3',
    title: 'Sofá Renovado',
    description: 'O profissional vai até você e em poucas horas seu sofá estará como novo',
  },
];

const PromoHowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Como <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Funciona</span>?
          </h2>
          <p className="text-gray-400 text-lg">
            3 passos simples para seu sofá ficar como novo
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <item.icon className="w-8 h-8 text-white" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-black border-2 border-blue-500 flex items-center justify-center text-sm font-bold text-cyan-400">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoHowItWorks;
