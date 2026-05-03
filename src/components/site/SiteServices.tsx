import { motion } from "framer-motion";
import { Sofa, BedDouble, Droplets, Layers, Car, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    icon: Sofa,
    title: "Higienização de Sofá",
    description: "Limpeza profunda com extração de sujeira, ácaros e bactérias. Seu sofá como novo em poucas horas.",
  },
  {
    icon: BedDouble,
    title: "Higienização de Colchão",
    description: "Eliminamos ácaros, fungos e odores do seu colchão. Noites mais saudáveis para toda a família.",
  },
  {
    icon: Droplets,
    title: "Impermeabilização",
    description: "Proteção duradoura contra líquidos e manchas. Ideal para famílias com crianças e pets.",
  },
  {
    icon: Layers,
    title: "Limpeza de Tapete",
    description: "Tapetes e carpetes higienizados com técnicas que preservam as fibras e cores originais.",
  },
  {
    icon: Car,
    title: "Higienização Automotiva",
    description: "Bancos, forros e carpetes do carro limpos e desodorizados. Interior renovado.",
  },
  {
    icon: Building2,
    title: "Limpeza Comercial",
    description: "Soluções para escritórios, clínicas e empresas. Ambiente profissional sempre impecável.",
  },
];

const SiteServices = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            Nossos Serviços
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Limpeza Profissional Completa
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Oferecemos soluções especializadas para cada tipo de estofado, sempre com produtos de alta qualidade e equipe treinada.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary-foreground mb-2">{service.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SiteServices;
