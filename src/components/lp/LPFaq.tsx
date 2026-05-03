import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface FaqItem {
  pergunta: string;
  resposta: string;
}

interface LPFaqProps {
  titulo?: string;
  subtitulo?: string;
  faqs?: FaqItem[];
  theme?: LPTheme;
}

const defaultFaqs: FaqItem[] = [
  {
    pergunta: 'Quanto tempo leva a limpeza?',
    resposta: 'Em média, a limpeza de um sofá de 3 lugares leva de 40 minutos a 1 hora. Colchões levam cerca de 30 a 40 minutos. O tempo pode variar de acordo com o tamanho e condição do estofado.',
  },
  {
    pergunta: 'Qual o tempo de secagem?',
    resposta: 'O tempo de secagem varia de 2 a 4 horas, dependendo da ventilação do ambiente. Usamos técnicas que minimizam a umidade residual, permitindo o uso do móvel no mesmo dia.',
  },
  {
    pergunta: 'Os produtos são seguros para crianças e pets?',
    resposta: 'Sim! Utilizamos apenas produtos biodegradáveis e atóxicos, seguros para toda a família, incluindo bebês e animais de estimação.',
  },
  {
    pergunta: 'Vocês atendem em qual região?',
    resposta: 'Atendemos Belo Horizonte e toda a região metropolitana, incluindo Contagem, Betim, Nova Lima, Santa Luzia, Ribeirão das Neves e demais cidades.',
  },
  {
    pergunta: 'Como funciona a garantia?',
    resposta: 'Oferecemos garantia de 7 dias. Se você não ficar satisfeito com o resultado, voltamos para refazer o serviço gratuitamente ou devolvemos seu dinheiro.',
  },
  {
    pergunta: 'Posso agendar para final de semana?',
    resposta: 'Sim, atendemos de segunda a sábado, das 8h às 18h. Aos domingos e feriados, consulte disponibilidade pelo WhatsApp.',
  },
];

const LPFaq = ({
  titulo = 'Perguntas Frequentes',
  subtitulo = 'Tire suas dúvidas sobre nosso serviço',
  faqs = defaultFaqs,
  theme = 'midnight',
}: LPFaqProps) => {
  const t = getTheme(theme);
  
  return (
    <section className={`${t.bgSection} py-16 md:py-24`}>
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${t.textPrimary} mb-4`}>
            {titulo}
          </h2>
          <p className={`text-xl ${t.textMuted}`}>
            {subtitulo}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={`${t.bgCard} ${t.border} border rounded-xl px-6 overflow-hidden data-[state=open]:${t.borderHover}`}
              >
                <AccordionTrigger className={`text-left ${t.textPrimary} ${t.accentHover} hover:no-underline py-5`}>
                  {faq.pergunta}
                </AccordionTrigger>
                <AccordionContent className={`${t.textMuted} pb-5`}>
                  {faq.resposta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default LPFaq;
