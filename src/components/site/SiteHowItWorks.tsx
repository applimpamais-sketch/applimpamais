import { motion } from "framer-motion";
import { CalendarPlus, Search, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: CalendarPlus,
    title: "Agendamento",
    description: "Escolha o serviço e a data pelo site ou WhatsApp. Simples e rápido.",
  },
  {
    icon: Search,
    title: "Avaliação",
    description: "Nosso técnico avalia o estofado no local e orienta o melhor tratamento.",
  },
  {
    icon: Sparkles,
    title: "Execução",
    description: "Limpeza profissional com equipamentos de alta performance e produtos premium.",
  },
  {
    icon: CheckCircle2,
    title: "Resultado",
    description: "Estofado renovado, higienizado e protegido. Satisfação garantida.",
  },
];

const SiteHowItWorks = () => {
  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            Como Funciona
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Processo Simples e Eficiente
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Em 4 passos, seu estofado fica como novo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                <step.icon className="w-9 h-9 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SiteHowItWorks;
