import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "João Pedro",
    location: "Savassi, BH",
    service: "Higienização de Sofá",
    text: "Já testei vários serviços de limpeza, mas nenhum se compara à RC Limpa Mais. A equipe é pontual, educada e o resultado é impecável. Meu sofá ficou irreconhecível!",
  },
  {
    name: "Ana Carolina",
    location: "Buritis, BH",
    text: "Agendei pelo WhatsApp e no dia seguinte já estava tudo pronto. Praticidade total! Meu colchão nunca esteve tão limpo.",
    service: "Higienização de Colchão",
  },
  {
    name: "Roberto Almeida",
    location: "Funcionários, BH",
    text: "Tenho um escritório e contrato a RC Limpa Mais mensalmente. As cadeiras e sofás ficam sempre impecáveis. Recomendo para qualquer empresa.",
    service: "Limpeza Comercial",
  },
  {
    name: "Patrícia Souza",
    location: "Nova Lima, MG",
    text: "Com crianças e cachorro em casa, a impermeabilização foi a melhor decisão. Já derrubaram suco no sofá e saiu tudo sem mancha!",
    service: "Impermeabilização",
  },
  {
    name: "Carlos Eduardo",
    location: "Contagem, MG",
    text: "Mandei limpar os bancos do meu carro que estavam com cheiro forte. Ficou perfeito, cheiro de novo! Preço justo e atendimento nota 10.",
    service: "Higienização Automotiva",
  },
  {
    name: "Fernanda Lima",
    location: "Pampulha, BH",
    text: "Estava com receio, mas a equipe me explicou todo o processo. Resultado incrível no meu tapete persa. Super cuidadosos!",
    service: "Limpeza de Tapete",
  },
];

const SiteTestimonials = () => {
  return (
    <section className="py-20 bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            Depoimentos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            O Que Nossos Clientes Dizem
          </h2>
        </div>
      </div>

      {/* Marquee row */}
      <div className="flex gap-6 animate-marquee" style={{ "--duration": "40s" } as React.CSSProperties}>
        {[...testimonials, ...testimonials].map((t, i) => (
          <motion.div
            key={i}
            className="flex-shrink-0 w-[350px] p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50"
          >
            <div className="flex items-center gap-0.5 mb-3">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-primary-foreground text-sm">{t.name}</p>
                <p className="text-xs text-gray-500">{t.location} · {t.service}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SiteTestimonials;
