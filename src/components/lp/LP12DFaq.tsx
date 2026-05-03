import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface FaqItem {
  question: string;
  answer: string;
}

interface LP12DFaqProps {
  title?: string;
  faqs?: FaqItem[];
  theme?: LPTheme;
}

const LP12DFaq = ({
  title = "Perguntas Frequentes",
  faqs = [
    {
      question: "Como funciona o Desafio?",
      answer: "O Desafio 12D é um programa de 12 dias onde você receberá conteúdos diários com exercícios práticos para fortalecer suas emoções e encontrar equilíbrio em todas as áreas da sua vida."
    },
    {
      question: "Preciso de algum conhecimento prévio para participar?",
      answer: "Não! O Desafio foi criado para mulheres de todos os níveis. Você só precisa ter disposição para aprender e aplicar os ensinamentos."
    },
    {
      question: "Qual é o formato do 12D?",
      answer: "O Desafio é 100% online, com videoaulas curtas e exercícios práticos que você pode fazer no seu tempo, de qualquer lugar."
    },
    {
      question: "Posso fazer o Desafio no meu ritmo?",
      answer: "Sim! Apesar de ser um desafio de 12 dias, você terá acesso ao conteúdo para fazer no seu tempo. Recomendamos seguir o cronograma para melhores resultados."
    },
    {
      question: "E se eu não conseguir fazer o desafio todos os dias?",
      answer: "Sem problemas! Você terá acesso ao conteúdo por tempo indeterminado e pode voltar sempre que precisar. O importante é começar!"
    },
    {
      question: "Quanto tempo preciso dedicar por dia?",
      answer: "Aproximadamente 15 a 20 minutos por dia são suficientes para assistir à aula e fazer os exercícios propostos."
    },
    {
      question: "Por quanto tempo terei acesso ao conteúdo?",
      answer: "Você terá acesso vitalício a todo o conteúdo do Desafio 12D, podendo revisitar as aulas sempre que desejar."
    }
  ],
  theme = 'midnight'
}: LP12DFaqProps) => {
  const t = getTheme(theme);

  return (
    <section id="Faq" className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 ${t.bgPrimary}`} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12"
        >
          <span className={`bg-gradient-to-r ${t.gradientHeadline} bg-clip-text text-transparent`}>
            {title}
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={`${t.bgCard} backdrop-blur-lg rounded-2xl border border-white/10 px-6 overflow-hidden`}
              >
                <AccordionTrigger className={`text-left text-white ${t.accentHover} text-base md:text-lg font-medium py-5 hover:no-underline [&[data-state=open]>svg]:${t.accent}`}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300 text-base leading-relaxed pb-5">
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

export default LP12DFaq;
