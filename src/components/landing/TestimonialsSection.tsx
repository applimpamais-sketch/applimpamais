import { Marquee } from '@/components/ui/marquee';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    name: 'Carlos Eduardo Silva',
    role: 'CEO - LimpaTech',
    location: 'São Paulo, SP',
    content: 'Revolucionou nossa operação! Antes tínhamos planilhas confusas, agora tudo está automatizado. Aumentamos 40% no faturamento em 3 meses.',
    rating: 5,
    result: '+40% faturamento',
  },
  {
    name: 'Mariana Costa',
    role: 'Proprietária - Clean Express',
    location: 'Rio de Janeiro, RJ',
    content: 'O agendamento online mudou tudo. Antes perdia 3h/dia no WhatsApp respondendo orçamentos. Agora o cliente agenda sozinho 24h.',
    rating: 5,
    result: '-3h/dia no WhatsApp',
  },
  {
    name: 'Ricardo Almeida',
    role: 'Diretor - HigiPro',
    location: 'Belo Horizonte, MG',
    content: 'Implementação super rápida e suporte excepcional. Em 48h já estávamos vendendo online. O ROI veio no primeiro mês!',
    rating: 5,
    result: 'ROI em 30 dias',
  },
  {
    name: 'Juliana Ferreira',
    role: 'Fundadora - Estofados BH',
    location: 'Belo Horizonte, MG',
    content: 'O controle financeiro integrado me deu visão total do negócio. Descobri que tinha serviços dando prejuízo e corrigi na hora.',
    rating: 5,
    result: '+25% lucro líquido',
  },
  {
    name: 'Paulo Santos',
    role: 'Gerente - LimpaMais',
    location: 'Curitiba, PR',
    content: 'A automação de WhatsApp trouxe muito mais profissionalismo. Recuperamos 30% dos carrinhos abandonados automaticamente.',
    rating: 5,
    result: '30% carrinhos recuperados',
  },
  {
    name: 'Ana Paula Rodrigues',
    role: 'Proprietária - Clean Home',
    location: 'Porto Alegre, RS',
    content: 'Mobile perfeito! Minha equipe de 8 técnicos gerencia tudo pelo celular. Os clientes elogiam o profissionalismo.',
    rating: 5,
    result: '8 técnicos organizados',
  },
];

interface TestimonialCardProps {
  name: string;
  role: string;
  location: string;
  content: string;
  rating: number;
  result: string;
}

const TestimonialCard = ({ name, role, location, content, rating, result }: TestimonialCardProps) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  
  return (
    <div className="relative w-[380px] overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6 hover:border-gray-700 transition-all duration-300">
      {/* Quote Icon */}
      <Quote className="absolute top-4 right-4 w-8 h-8 text-cyan-500/20" />
      
      {/* Result Badge */}
      <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
        <span className="text-cyan-400 text-sm font-medium">{result}</span>
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-300 text-sm leading-relaxed mb-6">
        "{content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
        <Avatar className="h-10 w-10 border border-gray-700">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-white font-medium">{name}</p>
          <p className="text-gray-400 text-sm">{role}</p>
          <p className="text-gray-500 text-xs">{location}</p>
        </div>
      </div>
    </div>
  );
};

export default function TestimonialsSection() {
  const firstRow = testimonials.slice(0, 3);
  const secondRow = testimonials.slice(3, 6);

  return (
    <section className="py-20 lg:py-32 bg-black relative overflow-hidden">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-black to-gray-950" />

      <div className="relative z-10">
        {/* Header */}
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Resultados Reais
              </span>
              <span className="text-white"> de Empresas Reais</span>
            </h2>
            <p className="text-xl text-gray-400">
              Veja como outras empresas de limpeza transformaram seus negócios
            </p>
          </div>
        </div>

        {/* Marquees - edge-to-edge */}
        <div className="space-y-6">
          <Marquee pauseOnHover className="[--duration:35s]">
            {firstRow.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </Marquee>

          <Marquee reverse pauseOnHover className="[--duration:35s]">
            {secondRow.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </Marquee>
        </div>

        {/* Bottom Stats */}
        <div className="container mx-auto px-4">
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                98%
              </p>
              <p className="text-gray-400 text-sm mt-1">Taxa de satisfação</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                +35%
              </p>
              <p className="text-gray-400 text-sm mt-1">Aumento médio em vendas</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                -50%
              </p>
              <p className="text-gray-400 text-sm mt-1">Tempo em tarefas manuais</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                30 dias
              </p>
              <p className="text-gray-400 text-sm mt-1">Tempo médio para ROI</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
