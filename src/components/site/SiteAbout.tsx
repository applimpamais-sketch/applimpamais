import { motion } from 'framer-motion';
import { Zap, Users, DollarSign, ShieldCheck, CalendarCheck, ThumbsUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PLATFORM_NAME } from '@/lib/constants';

const features = [
  { icon: Zap, label: 'Resposta Rápida' },
  { icon: Users, label: 'Equipe Treinada' },
  { icon: DollarSign, label: 'Preço Justo' },
  { icon: ShieldCheck, label: 'Certificados' },
  { icon: CalendarCheck, label: 'Agendamento Fácil' },
  { icon: ThumbsUp, label: 'Garantia de Serviço' },
];

const SiteAbout = () => {
  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-blue-400/5 border border-primary/20">
              <span className="text-6xl text-primary/30 absolute top-4 left-6">"</span>
              <blockquote className="text-xl text-gray-300 italic mt-8 mb-6">
                Meu sofá estava com manchas de anos. A equipe da {PLATFORM_NAME} fez um trabalho incrível — ficou como novo!
                Recomendo para todo mundo.
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">M</div>
                <div>
                  <p className="font-semibold text-primary-foreground">Mariana Silva</p>
                  <p className="text-sm text-gray-400">Moradora do Buritis, BH</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Badge variant="outline" className="mb-4 text-primary border-primary/30">
              Sobre Nós
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              O Guia Completo para Higienização Profissional de Estofados
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              A {PLATFORM_NAME} é referência em limpeza e higienização de estofados em Belo Horizonte. Utilizamos equipamentos
              profissionais e produtos biodegradáveis para garantir o melhor resultado com segurança para sua família e pets.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-2 p-3 rounded-xl bg-gray-800/50 border border-gray-700/50">
                  <f.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-gray-300">{f.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SiteAbout;
