import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { WHATSAPP_BOT } from "@/lib/constants";

const SiteNewsletter = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary/10 to-blue-400/5 border border-primary/20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Pronto para Renovar Seus Estofados?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Agende agora pelo site ou WhatsApp e ganhe um orçamento sem compromisso. Atendemos em toda BH e região metropolitana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full px-8">
              <a href={WHATSAPP_BOT.waLink("Olá! Quero um orçamento para limpeza de estofados.")} target="_blank" rel="noopener noreferrer">
                Solicitar Orçamento <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SiteNewsletter;
