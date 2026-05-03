import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Dúvidas Gerais
  {
    id: '1',
    question: 'Como funciona o agendamento?',
    answer: 'O agendamento é feito online através do nosso sistema. Após escolher os serviços, você seleciona data e horário disponíveis.',
    category: 'geral'
  },
  {
    id: '2',
    question: 'Vocês atendem qual região?',
    answer: 'Atendemos toda a região metropolitana. Consulte disponibilidade para sua localidade no momento do agendamento.',
    category: 'geral'
  },
  {
    id: '3',
    question: 'Qual a forma de pagamento?',
    answer: 'Aceitamos cartão de crédito, débito, PIX e dinheiro. O pagamento pode ser feito online ou na hora do serviço.',
    category: 'geral'
  },
  {
    id: '4',
    question: 'Vocês emitem nota fiscal?',
    answer: 'Sim, emitimos nota fiscal para todos os serviços prestados, tanto para pessoas físicas quanto jurídicas.',
    category: 'geral'
  },

  // Limpeza de Estofados
  {
    id: '5',
    question: 'Qual o tempo de secagem dos estofados?',
    answer: 'O tempo de secagem varia entre 2 a 6 horas, dependendo do tecido, umidade do ambiente e tipo de limpeza realizada.',
    category: 'limpeza'
  },
  {
    id: '6',
    question: 'Quais tipos de tecido vocês limpam?',
    answer: 'Limpamos todos os tipos de tecido: couro, veludo, linho, algodão, sintéticos, microfibra e tecidos especiais.',
    category: 'limpeza'
  },
  {
    id: '7',
    question: 'A limpeza remove todos os tipos de manchas?',
    answer: 'A maioria das manchas é removida com sucesso. Manchas muito antigas ou específicas são avaliadas caso a caso.',
    category: 'limpeza'
  },
  {
    id: '8',
    question: 'É seguro para crianças e pets?',
    answer: 'Sim, todos nossos produtos são atóxicos e seguros para crianças e animais de estimação após a secagem.',
    category: 'limpeza'
  },

  // Impermeabilização
  {
    id: '9',
    question: 'A impermeabilização é permanente?',
    answer: 'A impermeabilização dura entre 6 a 12 meses, dependendo do uso e exposição do móvel. Recomendamos renovação anual.',
    category: 'impermeabilizacao'
  },
  {
    id: '10',
    question: 'Posso impermeabilizar qualquer tecido?',
    answer: 'A maioria dos tecidos pode ser impermeabilizada. Alguns tecidos especiais requerem avaliação prévia.',
    category: 'impermeabilizacao'
  },
  {
    id: '11',
    question: 'A impermeabilização altera a textura?',
    answer: 'Não, nossa impermeabilização mantém a textura e aparência original do tecido, apenas criando uma barreira protetora.',
    category: 'impermeabilizacao'
  },

  // Aluguel de Máquinas
  {
    id: '12',
    question: 'Preciso de treinamento para usar a máquina?',
    answer: 'Sim, oferecemos treinamento gratuito de 30 minutos para você aprender a usar a máquina corretamente e com segurança.',
    category: 'aluguel'
  },
  {
    id: '13',
    question: 'O que está incluído no aluguel?',
    answer: 'Incluímos a máquina, mangueiras, bicos, produtos de limpeza básicos e manual de instruções.',
    category: 'aluguel'
  },
  {
    id: '14',
    question: 'Posso cancelar o aluguel?',
    answer: 'Sim, cancelamentos com até 24h de antecedência não têm custo. Cancelamentos em menor prazo têm taxa de 50%.',
    category: 'aluguel'
  },
  {
    id: '15',
    question: 'E se a máquina apresentar defeito?',
    answer: 'Temos suporte 24h e substituição imediata em caso de defeito. Você não fica sem a máquina durante o período alugado.',
    category: 'aluguel'
  },

  // Produtos
  {
    id: '16',
    question: 'Os produtos são seguros para pets?',
    answer: 'Sim, todos nossos produtos são atóxicos e seguros para animais de estimação e crianças após a aplicação.',
    category: 'produtos'
  },
  {
    id: '17',
    question: 'Vocês vendem produtos avulsos?',
    answer: 'Sim, vendemos shampoos, perfumes e outros produtos separadamente. Consulte disponibilidade e preços.',
    category: 'produtos'
  },
  {
    id: '18',
    question: 'Os produtos têm garantia?',
    answer: 'Sim, todos os produtos têm garantia de qualidade. Se não ficar satisfeito, fazemos a troca ou devolução.',
    category: 'produtos'
  },

  // Suporte
  {
    id: '19',
    question: 'Como entrar em contato com o suporte?',
    answer: 'Você pode entrar em contato pelo WhatsApp (11) 99999-9999, telefone (11) 3333-3333 ou email suporte@empresa.com.',
    category: 'suporte'
  },
  {
    id: '20',
    question: 'Qual o horário de atendimento?',
    answer: 'Atendemos de segunda a sexta das 8h às 18h, e sábados das 8h às 14h. WhatsApp funciona 24h para emergências.',
    category: 'suporte'
  },
  {
    id: '21',
    question: 'Vocês fazem orçamento gratuito?',
    answer: 'Sim, fazemos orçamento gratuito e sem compromisso. Você pode solicitar pelo site, WhatsApp ou telefone.',
    category: 'suporte'
  }
];

const tabCategories = [
  { id: 'geral', label: 'Dúvidas Frequentes' },
  { id: 'limpeza', label: 'Limpeza de Estofados' },
  { id: 'impermeabilizacao', label: 'Impermeabilização' },
  { id: 'aluguel', label: 'Aluguel de Máquinas' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'suporte', label: 'Suporte' }
];

const Footer = () => {
  const [activeTab, setActiveTab] = useState('geral');

  const filteredFAQs = faqData.filter(faq => faq.category === activeTab);

  return (
    <footer className="bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-heading text-foreground mb-4">
            Dúvidas Frequentes
          </h2>
          <p className="text-body text-muted-foreground">
            Encontre respostas para as principais dúvidas sobre nossos serviços
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabCategories.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {filteredFAQs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={faq.id}
                className="bg-background border border-border rounded-lg px-1"
              >
                <AccordionTrigger className="px-4 py-3 text-left hover:no-underline hover:bg-muted/50 rounded-lg transition-colors">
                  <span className="font-medium text-foreground text-sm sm:text-base">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom Info */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Limpeza de Estofados. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;