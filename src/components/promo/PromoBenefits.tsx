import { motion } from 'framer-motion';
import { Shield, Droplets, Wind, Bug, Clock, ThumbsUp } from 'lucide-react';
import { BorderBeam } from '@/components/ui/border-beam';
import { PLATFORM_NAME } from '@/lib/constants';

const benefits = [
  {
    icon: Shield,
    title: 'Equipamentos Profissionais',
    description: 'Extratoras de alta potência para limpeza profunda',
  },
  {
    icon: Droplets,
    title: 'Produtos Premium',
    description: 'Químicos seguros para sua família e pets',
  },
  {
    icon: Wind,
    title: 'Secagem Rápida',
    description: 'Sofá pronto para uso em até 4 horas',
  },
  {
    icon: Bug,
    title: 'Remove Ácaros',
    description: 'Elimina alérgenos e micro-organismos',
  },
  {
    icon: Clock,
    title: 'Atendimento Rápido',
    description: 'Agendamento para os próximos dias',
  },
  {
    icon: ThumbsUp,
    title: 'Satisfação Garantida',
    description: 'Se não gostar, refazemos gratuitamente',
  },
];

const PromoBenefits = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Por que escolher a <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{PLATFORM_NAME}</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Mais de 500 clientes satisfeitos em BH e região
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-blue-500/30 transition-all duration-300 overflow-hidden"
            >
              <BorderBeam 
                size={120} 
                duration={8} 
                colorFrom="hsl(210, 100%, 50%)" 
                colorTo="hsl(180, 100%, 50%)" 
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBenefits;
