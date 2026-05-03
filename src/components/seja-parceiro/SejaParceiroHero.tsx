 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { ArrowRight, TrendingUp, Users, Wallet } from 'lucide-react';
 import { motion } from 'framer-motion';
 
 const SejaParceiroHero = () => {
   const scrollToForm = () => {
     document.getElementById('cadastro-parceiro')?.scrollIntoView({ behavior: 'smooth' });
   };
 
   return (
     <section className="relative py-20 px-4 sm:px-6 lg:px-8">
       <div className="max-w-6xl mx-auto text-center">
         {/* Badge */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
         >
           <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2 text-sm">
             🚀 Programa de Parceiros RC Limpa Mais
           </Badge>
         </motion.div>
 
         {/* Headline */}
         <motion.h1
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.1 }}
           className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
         >
           Ganhe <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">10% de comissão</span>
           <br />indicando serviços
         </motion.h1>
 
         {/* Subheadline */}
         <motion.p
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
         >
           Cadastre-se gratuitamente, compartilhe seu link exclusivo e ganhe comissão em cada serviço de limpeza fechado.
         </motion.p>
 
         {/* Stats Row */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
           className="flex flex-wrap justify-center gap-8 mb-10"
         >
           <div className="flex items-center gap-2 text-slate-300">
             <Wallet className="w-5 h-5 text-cyan-400" />
             <span>Ticket médio: <strong className="text-white">R$ 170</strong></span>
           </div>
           <div className="flex items-center gap-2 text-slate-300">
             <TrendingUp className="w-5 h-5 text-green-400" />
             <span>Comissão média: <strong className="text-white">R$ 17</strong></span>
           </div>
           <div className="flex items-center gap-2 text-slate-300">
             <Users className="w-5 h-5 text-primary" />
             <span>Saque mínimo: <strong className="text-white">R$ 50</strong></span>
           </div>
         </motion.div>
 
         {/* CTA Button */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.4 }}
         >
           <Button 
             size="lg" 
             onClick={scrollToForm}
             className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/25"
           >
             Quero ser parceiro
             <ArrowRight className="ml-2 w-5 h-5" />
           </Button>
         </motion.div>
 
         {/* Trust Badges */}
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.5, delay: 0.5 }}
           className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-400"
         >
           <span>✅ Cadastro gratuito</span>
           <span>✅ Sem metas obrigatórias</span>
           <span>✅ Saque via PIX</span>
         </motion.div>
       </div>
     </section>
   );
 };
 
 export default SejaParceiroHero;