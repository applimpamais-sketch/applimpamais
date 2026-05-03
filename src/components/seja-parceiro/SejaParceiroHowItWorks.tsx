 import { motion } from 'framer-motion';
 import { UserPlus, Share2, BadgeDollarSign } from 'lucide-react';
 
 const steps = [
   {
     icon: UserPlus,
     title: 'Cadastre-se',
     description: 'Crie sua conta gratuitamente em menos de 2 minutos.',
     color: 'text-primary',
     bgColor: 'bg-primary/20',
   },
   {
     icon: Share2,
     title: 'Compartilhe',
     description: 'Divulgue seu link exclusivo nas redes sociais ou para amigos.',
     color: 'text-cyan-400',
     bgColor: 'bg-cyan-400/20',
   },
   {
     icon: BadgeDollarSign,
     title: 'Ganhe',
     description: '10% de comissão em cada serviço fechado através do seu link.',
     color: 'text-green-400',
     bgColor: 'bg-green-400/20',
   },
 ];
 
 const SejaParceiroHowItWorks = () => {
   return (
     <section className="py-20 px-4 sm:px-6 lg:px-8">
       <div className="max-w-6xl mx-auto">
         {/* Section Header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-16"
         >
           <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
             Como funciona?
           </h2>
           <p className="text-slate-400 text-lg max-w-2xl mx-auto">
             Simples, rápido e sem complicação
           </p>
         </motion.div>
 
         {/* Steps */}
         <div className="grid md:grid-cols-3 gap-8">
           {steps.map((step, index) => (
             <motion.div
               key={step.title}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: index * 0.1 }}
               className="relative"
             >
               {/* Connector Line (desktop only) */}
               {index < steps.length - 1 && (
                 <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-slate-700 to-slate-800" />
               )}
               
               <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 text-center relative z-10">
                 {/* Step Number */}
                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-950 border-2 border-primary rounded-full flex items-center justify-center text-primary font-bold text-sm">
                   {index + 1}
                 </div>
                 
                 {/* Icon */}
                 <div className={`w-16 h-16 ${step.bgColor} rounded-xl flex items-center justify-center mx-auto mb-6`}>
                   <step.icon className={`w-8 h-8 ${step.color}`} />
                 </div>
                 
                 {/* Content */}
                 <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                 <p className="text-slate-400">{step.description}</p>
               </div>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 };
 
 export default SejaParceiroHowItWorks;