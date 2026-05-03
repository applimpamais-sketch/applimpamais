import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar, DollarSign, Users, MessageSquare, BarChart, Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BorderBeam } from '@/components/ui/border-beam';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Calendar,
    title: 'Gestão de Agendamentos',
    description: 'Calendário inteligente com agendamento online 24/7',
    benefits: ['Agendamento online', 'Confirmações automáticas', 'Calendário inteligente', 'Gestão de vagas'],
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: DollarSign,
    title: 'Financeiro Profissional',
    description: 'Controle total de receitas, despesas e fluxo de caixa',
    benefits: ['Receitas e despesas', 'Fluxo de caixa', 'DRE automático', 'Metas e projeções'],
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    icon: Users,
    title: 'Equipe e Técnicos',
    description: 'App exclusivo para técnicos com gestão completa',
    benefits: ['App para técnicos', 'Serviços do dia', 'Histórico completo', 'Gestão de rotas'],
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: MessageSquare,
    title: 'Marketing Automático',
    description: 'WhatsApp integrado com automações poderosas',
    benefits: ['WhatsApp integrado', 'Templates customizáveis', 'Recuperação automática', 'Cupons inteligentes'],
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: BarChart,
    title: 'Analytics e Métricas',
    description: 'Dashboard em tempo real com todos os KPIs',
    benefits: ['Dashboard real-time', 'Pixel Facebook', 'Relatórios completos', 'KPIs automáticos'],
    gradient: 'from-orange-500 to-amber-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Otimizado para celular, funciona em qualquer lugar',
    benefits: ['Responsivo total', 'App instalável (PWA)', 'Funciona offline', 'Notificações push'],
    gradient: 'from-cyan-500 to-blue-500'
  },
];

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  gradient: string;
}

const FeatureCard = ({ icon: Icon, title, description, benefits, gradient, index }: FeatureCardProps & { index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 relative overflow-hidden bg-black/40 backdrop-blur-sm border-gray-800">
        {/* BorderBeam effect */}
        <BorderBeam 
          size={250} 
          duration={12} 
          delay={index * 2}
          colorFrom="#3b82f6" 
          colorTo="#06b6d4"
        />
        
        <CardHeader>
          {/* Ícone com gradiente e glow effect */}
          <motion.div 
            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 relative`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon className="w-6 h-6 text-white relative z-10" strokeWidth={2} />
            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
          </motion.div>
          
          <CardTitle className="text-xl text-white group-hover:text-cyan-400 transition-colors duration-300">{title}</CardTitle>
          <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <ul className="space-y-2">
            {benefits.map((benefit, i) => (
              <motion.li 
                key={i} 
                className="flex items-center gap-2 text-sm"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="size-1.5 rounded-full bg-cyan-400 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                <span className="text-gray-300 group-hover:text-white transition-colors duration-300">{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
        
        {/* Shimmer effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </Card>
    </motion.div>
  );
};

export default function FeaturesGrid() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-black via-gray-950 to-gray-950 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(hsl(210 100% 50% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(210 100% 50% / 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} 
        />
      </div>
      
      {/* Radial glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header com animação */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            <span className="text-white">Tudo Que </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Sua Empresa</span>
            <span className="text-white"> Precisa</span>
          </h2>
          <p className="text-xl text-gray-400">
            Solução completa para gestão profissional do seu negócio
          </p>
        </motion.div>

        {/* Grid de Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
