 import { motion } from 'framer-motion';
 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from '@/components/ui/accordion';
 
 const faqs = [
   {
     question: 'Quanto custa para me cadastrar?',
     answer: 'Nada! O cadastro é 100% gratuito. Você não paga nada para ser um parceiro.',
   },
   {
     question: 'Preciso vender algo?',
     answer: 'Não! Você só precisa compartilhar seu link exclusivo. Quando alguém agendar um serviço através do seu link, você ganha automaticamente.',
   },
   {
     question: 'Quando recebo minha comissão?',
     answer: 'A comissão é creditada na sua dashboard assim que o serviço for concluído e pago pelo cliente. Você acompanha tudo em tempo real.',
   },
   {
     question: 'Qual o valor mínimo para saque?',
     answer: 'O saque mínimo é de R$ 50. Você pode solicitar seu pagamento via PIX a qualquer momento após atingir esse valor.',
   },
   {
     question: 'Tem meta mínima de indicações?',
     answer: 'Não! Não existe meta mínima. Você indica quando quiser, no seu ritmo. Cada indicação que converter, você ganha.',
   },
   {
     question: 'Como funciona o link exclusivo?',
     answer: 'Ao se cadastrar, você recebe um link personalizado com seu código (ex: /p/SEUNOME). Todas as vendas através desse link são atribuídas a você automaticamente.',
   },
   {
     question: 'Posso indicar para qualquer cidade?',
     answer: 'Por enquanto atendemos apenas Belo Horizonte e região metropolitana. Indicações de outras cidades não serão convertidas.',
   },
   {
     question: 'Por quanto tempo o link fica válido?',
     answer: 'Seu link tem validade de 30 dias. Se alguém clicar no seu link e agendar dentro de 30 dias, você recebe a comissão.',
   },
 ];
 
 const SejaParceiroFAQ = () => {
   return (
     <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
       <div className="max-w-3xl mx-auto">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
         >
           <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
             Perguntas frequentes
           </h2>
           <p className="text-slate-400 text-lg">
             Tire suas dúvidas sobre o programa de parceiros
           </p>
         </motion.div>
 
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
         >
           <Accordion type="single" collapsible className="space-y-4">
             {faqs.map((faq, index) => (
               <AccordionItem 
                 key={index} 
                 value={`item-${index}`}
                 className="bg-slate-900 border border-slate-800 rounded-xl px-6 data-[state=open]:border-primary/50"
               >
                 <AccordionTrigger className="text-left text-white hover:text-primary hover:no-underline py-5">
                   {faq.question}
                 </AccordionTrigger>
                 <AccordionContent className="text-slate-400 pb-5">
                   {faq.answer}
                 </AccordionContent>
               </AccordionItem>
             ))}
           </Accordion>
         </motion.div>
       </div>
     </section>
   );
 };
 
 export default SejaParceiroFAQ;