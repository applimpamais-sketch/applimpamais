import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Como funciona o White Label?",
    answer: "Você recebe o sistema completo com sua marca (logo, cores, nome da empresa). Seus clientes veem apenas sua empresa, não há nenhuma menção à nossa plataforma. É como se você tivesse desenvolvido o sistema do zero."
  },
  {
    question: "Quanto tempo leva a implementação?",
    answer: "Em média 48 horas após a contratação. Você nos envia seu logo, cores da marca e informações básicas, e nós configuramos tudo. Você recebe acesso ao sistema pronto para usar, com treinamento incluído."
  },
  {
    question: "Preciso de conhecimento técnico?",
    answer: "Não! O sistema foi desenvolvido para ser extremamente intuitivo. Qualquer pessoa consegue usar sem dificuldades. Além disso, oferecemos treinamento completo na implantação e suporte contínuo."
  },
  {
    question: "E se eu já tenho um site?",
    answer: "Perfeito! O sistema pode ser integrado ao seu site existente ou funcionar de forma independente. Podemos adicionar um botão de agendamento no seu site atual que direciona para o sistema."
  },
  {
    question: "Os dados são seguros?",
    answer: "Totalmente! Utilizamos a infraestrutura da Supabase, que oferece criptografia de ponta a ponta, backups automáticos diários e conformidade com LGPD. Seus dados e de seus clientes estão 100% protegidos."
  },
  {
    question: "Posso personalizar as funcionalidades?",
    answer: "Sim! No plano Enterprise oferecemos customizações exclusivas para atender necessidades específicas do seu negócio. Além disso, todos os planos incluem templates personalizáveis de mensagens e configurações flexíveis."
  },
  {
    question: "Como funciona o suporte?",
    answer: "Oferecemos suporte via WhatsApp e email. No plano Starter, o suporte é por email com resposta em até 24h. Nos planos Professional e Enterprise, temos suporte prioritário via WhatsApp com tempo de resposta muito mais rápido."
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento, sem burocracia. As mudanças entram em vigor no próximo ciclo de cobrança. Seus dados são preservados em qualquer mudança."
  },
  {
    question: "Existe contrato de fidelidade?",
    answer: "Não! Trabalhamos com mensalidade, sem contrato de fidelidade. Você pode cancelar quando quiser. Acreditamos que a qualidade do nosso serviço é o que mantém nossos clientes conosco, não contratos."
  },
  {
    question: "Há limite de clientes ou agendamentos?",
    answer: "No plano Starter há limite de 100 agendamentos/mês. Nos planos Professional e Enterprise não há limites! Você pode ter quantos clientes e agendamentos quiser, o sistema escala automaticamente."
  }
];

export default function FAQSection() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(hsl(210 100% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(210 100% 50% / 0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} 
        />
      </div>

      {/* Blue Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-400">Perguntas Frequentes</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              <span className="text-white">Dúvidas? </span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Temos as Respostas
              </span>
            </h2>
            
            <p className="text-xl text-gray-400">
              Tudo que você precisa saber sobre o sistema
            </p>
          </div>
          
          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gray-800 rounded-2xl px-6 overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300"
              >
                <AccordionTrigger className="text-white text-left hover:text-blue-400 py-6 text-lg font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 pb-6 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Bottom CTA */}
          <div className="mt-16 text-center p-8 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-3">
              Ainda tem dúvidas?
            </h3>
            <p className="text-gray-400 mb-6">
              Nossa equipe está pronta para te ajudar! Entre em contato via WhatsApp.
            </p>
            <a
              href="https://wa.me/5531999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              Falar com Especialista
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
