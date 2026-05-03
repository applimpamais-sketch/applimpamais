import { motion } from "framer-motion";
import { Star, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_NAME, WHATSAPP_BOT } from "@/lib/constants";
import { Link } from "react-router-dom";

const SiteHero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gray-900">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-primary/20" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Rating badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 mb-6">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-primary-foreground/80">
                Excelente 4.9/5 — 500+ avaliações
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-primary-foreground">{PLATFORM_NAME}</span>
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Especialistas em Estofados
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl">
              Serviço profissional de higienização e impermeabilização de sofás, colchões, tapetes e bancos de carro em Belo Horizonte e região metropolitana.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-base px-8 py-6 rounded-full">
                <Link to="/agendamento">
                  Agendar Agora <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base px-8 py-6 rounded-full border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                <a href={WHATSAPP_BOT.waLink("Olá! Gostaria de agendar uma limpeza.")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 w-5 h-5" /> Fale pelo WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-blue-400/20 border border-primary/20 flex items-center justify-center">
                <div className="text-center p-12">
                  <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-5xl">🛋️</span>
                  </div>
                  <p className="text-2xl font-semibold text-primary-foreground">Sofá como novo</p>
                  <p className="text-gray-400 mt-2">Resultado garantido em cada limpeza</p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-gray-800 border border-primary/30 rounded-2xl px-6 py-4 shadow-xl">
                <p className="text-2xl font-bold text-primary">500+</p>
                <p className="text-sm text-gray-400">Clientes satisfeitos</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SiteHero;
