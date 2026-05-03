import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Essencial",
    price: "149",
    description: "Ideal para uma limpeza pontual do seu sofá.",
    features: [
      "Sofá até 3 lugares",
      "Aspiração profunda",
      "Higienização completa",
      "Desodorização",
      "Garantia de 7 dias",
    ],
    popular: false,
  },
  {
    name: "Completo",
    price: "249",
    description: "Sofá + colchão com tratamento completo.",
    features: [
      "Sofá até 4 lugares",
      "Colchão casal incluso",
      "Higienização + desodorização",
      "Tratamento anti-ácaro",
      "Garantia de 7 dias",
      "Suporte 24/7",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "399",
    description: "Casa completa com impermeabilização inclusa.",
    features: [
      "Sofá + 2 colchões + tapete",
      "Higienização completa",
      "Impermeabilização inclusa",
      "Tratamento anti-ácaro",
      "Garantia de 7 dias",
      "Suporte 24/7 prioritário",
    ],
    popular: false,
  },
];

const SitePricing = () => {
  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 text-primary border-primary/30">
            Planos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Escolha o Plano Ideal Para Você
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Preços transparentes, sem surpresas. Todos os planos incluem deslocamento grátis para BH.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-8 rounded-2xl border ${
                plan.popular
                  ? "bg-primary/5 border-primary/40 shadow-lg shadow-primary/10"
                  : "bg-gray-800/50 border-gray-700/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4">Popular</Badge>
                </div>
              )}

              <h3 className="text-xl font-semibold text-primary-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-400 mb-5">{plan.description}</p>

              <div className="mb-6">
                <span className="text-sm text-gray-400">R$</span>
                <span className="text-4xl font-bold text-primary-foreground ml-1">{plan.price}</span>
                <span className="text-gray-400 text-sm"> / serviço</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full rounded-full ${plan.popular ? "" : "variant-outline"}`}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link to="/agendamento">
                  Agendar <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SitePricing;
