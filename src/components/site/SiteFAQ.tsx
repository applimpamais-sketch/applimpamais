import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quanto tempo demora a limpeza de um sofá?",
    answer: "Em média, a higienização de um sofá de 3 lugares leva de 1h30 a 2h. O tempo de secagem varia de 4 a 6 horas dependendo da ventilação do ambiente.",
  },
  {
    question: "Os produtos utilizados são seguros para crianças e pets?",
    answer: "Sim! Utilizamos produtos biodegradáveis e hipoalergênicos, seguros para crianças, idosos e animais de estimação.",
  },
  {
    question: "Vocês atendem em quais regiões?",
    answer: "Atendemos Belo Horizonte e toda a região metropolitana, incluindo Nova Lima, Contagem, Betim, Santa Luzia e Ribeirão das Neves.",
  },
  {
    question: "Como funciona a impermeabilização?",
    answer: "Após a higienização, aplicamos uma camada protetora que cria uma barreira contra líquidos e manchas. A proteção dura em média de 1 a 2 anos.",
  },
  {
    question: "Quais formas de pagamento são aceitas?",
    answer: "Aceitamos Pix, cartões de crédito e débito, e dinheiro. Parcelamos em até 3x sem juros no cartão.",
  },
  {
    question: "Posso agendar para sábado ou domingo?",
    answer: "Sim! Atendemos de segunda a sábado. Domingos sob consulta. Agende pelo site ou WhatsApp.",
  },
];

const SiteFAQ = () => {
  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            FAQ
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Perguntas Frequentes
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-gray-700/50 rounded-xl px-6 bg-gray-800/30"
              >
                <AccordionTrigger className="text-primary-foreground hover:text-primary text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400">
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

export default SiteFAQ;
