import { motion } from "framer-motion";
import { Users, Award, CalendarCheck } from "lucide-react";

const badges = [
  {
    icon: Users,
    title: "500+ Clientes Satisfeitos",
    description: "Atendemos residências, empresas e frotas em toda BH e região.",
  },
  {
    icon: Award,
    title: "8 Anos de Experiência",
    description: "Desde 2017 transformando estofados com técnicas profissionais.",
  },
  {
    icon: CalendarCheck,
    title: "Atendimento 7 Dias",
    description: "Agenda flexível, inclusive sábados. Horários que cabem na sua rotina.",
  },
];

const SiteTrustBadges = () => {
  return (
    <section className="py-16 bg-gray-900 border-y border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <badge.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-primary-foreground mb-1">{badge.title}</h3>
                <p className="text-gray-400 text-sm">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SiteTrustBadges;
