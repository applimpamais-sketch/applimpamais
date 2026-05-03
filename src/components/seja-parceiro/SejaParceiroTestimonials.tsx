 import { motion } from 'framer-motion';
 import { Star, Quote } from 'lucide-react';
 
 const testimonials = [
   {
     name: 'Maria Silva',
     role: 'Influencer de Casa',
     avatar: '👩',
     content: 'Já ganhei mais de R$ 500 só indicando limpeza de sofá! O melhor é que não preciso fazer nada além de compartilhar meu link.',
     earnings: 'R$ 500+',
   },
   {
     name: 'João Santos',
     role: 'Criador de Conteúdo',
     avatar: '👨',
     content: 'Meus seguidores adoram as dicas de limpeza e eu ganho 10% em cada serviço. Renda extra sem esforço!',
     earnings: 'R$ 340',
   },
   {
     name: 'Ana Costa',
     role: 'Manicure',
     avatar: '💅',
     content: 'Indico para minhas clientes enquanto faço as unhas. Já fiz vários saques, super recomendo!',
     earnings: 'R$ 255',
   },
 ];
 
 const SejaParceiroTestimonials = () => {
   return (
     <section className="py-20 px-4 sm:px-6 lg:px-8">
       <div className="max-w-6xl mx-auto">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-16"
         >
           <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
             O que nossos parceiros dizem
           </h2>
           <p className="text-slate-400 text-lg">
             Depoimentos reais de quem já está ganhando
           </p>
         </motion.div>
 
         <div className="grid md:grid-cols-3 gap-8">
           {testimonials.map((testimonial, index) => (
             <motion.div
               key={testimonial.name}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: index * 0.1 }}
               className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 relative"
             >
               {/* Quote Icon */}
               <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
               
               {/* Stars */}
               <div className="flex gap-1 mb-4">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                 ))}
               </div>
 
               {/* Content */}
               <p className="text-slate-300 mb-6 leading-relaxed">
                 "{testimonial.content}"
               </p>
 
               {/* Earnings Badge */}
               <div className="mb-4">
                 <span className="inline-block bg-green-500/20 text-green-400 text-sm font-medium px-3 py-1 rounded-full">
                   💰 Ganhou {testimonial.earnings}
                 </span>
               </div>
 
               {/* Author */}
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xl">
                   {testimonial.avatar}
                 </div>
                 <div>
                   <div className="font-medium text-white">{testimonial.name}</div>
                   <div className="text-sm text-slate-400">{testimonial.role}</div>
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 };
 
 export default SejaParceiroTestimonials;