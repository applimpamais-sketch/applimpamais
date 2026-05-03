import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  MessageCircle, 
  Book, 
  Mail, 
  Phone,
  ExternalLink,
  Lightbulb,
  Shield,
  CreditCard,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const faqs = [
  {
    categoria: 'Geral',
    icon: Lightbulb,
    perguntas: [
      {
        pergunta: 'Como posso alterar meu plano?',
        resposta: 'Para alterar seu plano, acesse a seção "Assinatura" no menu lateral e clique em "Alterar Plano". Você pode fazer upgrade ou downgrade a qualquer momento, e a diferença será calculada proporcionalmente.',
      },
      {
        pergunta: 'Como adicionar novos membros à equipe?',
        resposta: 'Novos membros podem ser adicionados através da seção "Equipe". Clique em "Convidar Membro" e insira o email do novo usuário. Ele receberá um convite por email para criar sua conta.',
      },
      {
        pergunta: 'Posso personalizar as cores do sistema?',
        resposta: 'Sim! Acesse "Configurações" e na seção "Personalização Visual" você pode definir as cores primária e secundária que serão aplicadas em toda a interface.',
      },
    ],
  },
  {
    categoria: 'Pagamentos',
    icon: CreditCard,
    perguntas: [
      {
        pergunta: 'Quais formas de pagamento são aceitas?',
        resposta: 'Aceitamos pagamento via boleto bancário, PIX e cartão de crédito (Visa, Mastercard, Elo e American Express). Para planos anuais, oferecemos condições especiais.',
      },
      {
        pergunta: 'Como acessar minhas faturas?',
        resposta: 'Todas as suas faturas estão disponíveis na seção "Assinatura", onde você pode visualizar o histórico completo e baixar os comprovantes de pagamento.',
      },
      {
        pergunta: 'O que acontece se eu atrasar o pagamento?',
        resposta: 'Após o vencimento, você terá um período de tolerância de 5 dias. Após esse prazo, o acesso ao sistema poderá ser suspenso até a regularização do pagamento.',
      },
    ],
  },
  {
    categoria: 'Segurança',
    icon: Shield,
    perguntas: [
      {
        pergunta: 'Meus dados estão seguros?',
        resposta: 'Sim! Utilizamos criptografia de ponta a ponta, backups automáticos diários e seguimos todas as normas da LGPD para proteção de dados pessoais.',
      },
      {
        pergunta: 'Como alterar minha senha?',
        resposta: 'Para alterar sua senha, acesse seu perfil clicando no seu avatar e selecione "Alterar Senha". Você receberá um link por email para definir uma nova senha.',
      },
    ],
  },
  {
    categoria: 'Módulos',
    icon: Users,
    perguntas: [
      {
        pergunta: 'Posso contratar módulos adicionais?',
        resposta: 'Sim! Na seção "Módulos" você pode visualizar todos os módulos disponíveis e seus preços. Entre em contato conosco para ativar módulos adicionais.',
      },
      {
        pergunta: 'Como funciona a cobrança dos módulos?',
        resposta: 'Cada módulo tem um valor mensal que é somado ao valor do seu plano base. A cobrança é feita de forma unificada na data de vencimento da sua assinatura.',
      },
    ],
  },
];

export default function ClienteAjuda() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Central de Ajuda</h1>
        <p className="text-muted-foreground">
          Encontre respostas para suas dúvidas ou entre em contato conosco
        </p>
      </div>

      {/* Cards de contato */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Chat ao Vivo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Converse com nossa equipe em tempo real
            </p>
            <Button variant="outline" className="w-full">
              Iniciar Chat
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Envie sua dúvida por email
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:suporte@rclimpamais.com.br">
                suporte@rclimpamais.com.br
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Telefone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Segunda a sexta, 9h às 18h
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="tel:+5521999999999">
                (21) 99999-9999
              </a>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Perguntas Frequentes
            </CardTitle>
            <CardDescription>
              Respostas para as dúvidas mais comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((categoria, catIndex) => {
                const Icon = categoria.icon;
                
                return (
                  <motion.div
                    key={categoria.categoria}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: catIndex * 0.1 }}
                  >
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      {categoria.categoria}
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {categoria.perguntas.map((faq, faqIndex) => (
                        <AccordionItem 
                          key={faqIndex} 
                          value={`${catIndex}-${faqIndex}`}
                          className="border rounded-lg px-4 mb-2"
                        >
                          <AccordionTrigger className="text-left hover:no-underline">
                            {faq.pergunta}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.resposta}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Documentação */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Documentação Completa</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse guias detalhados e tutoriais passo a passo
                </p>
              </div>
              <Button>
                Acessar Documentação
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
