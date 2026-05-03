import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Marquee } from '@/components/ui/marquee';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface Depoimento {
  nome: string;
  texto: string;
  rating?: number;
  cidade?: string;
  servico?: string;
}

interface LPTestimonialsProps {
  titulo?: string;
  subtitulo?: string;
  depoimentos?: Depoimento[];
  theme?: LPTheme;
}

const defaultDepoimentos: Depoimento[] = [
  {
    nome: 'Maria Silva',
    texto: 'Meu sofá ficou como novo! Tinha manchas antigas que eu achava que nunca sairiam. Recomendo muito!',
    rating: 5,
    cidade: 'Belo Horizonte',
    servico: 'Limpeza de Sofá',
  },
  {
    nome: 'João Pedro',
    texto: 'Profissionais muito competentes e pontuais. O colchão ficou sem aquele cheiro de mofo. Excelente trabalho!',
    rating: 5,
    cidade: 'Contagem',
    servico: 'Limpeza de Colchão',
  },
  {
    nome: 'Ana Carolina',
    texto: 'Serviço rápido e resultado incrível. Minha filha é alérgica e depois da limpeza ela melhorou muito!',
    rating: 5,
    cidade: 'Betim',
    servico: 'Higienização Completa',
  },
  {
    nome: 'Carlos Eduardo',
    texto: 'Atendimento impecável do início ao fim. Preço justo e qualidade superior. Já agendei a próxima limpeza!',
    rating: 5,
    cidade: 'Nova Lima',
    servico: 'Limpeza de Estofados',
  },
  {
    nome: 'Fernanda Oliveira',
    texto: 'Tinha receio de contratar online, mas o resultado superou minhas expectativas. Nota 10!',
    rating: 5,
    cidade: 'Santa Luzia',
    servico: 'Limpeza de Sofá',
  },
];

const LPTestimonials = ({
  titulo = 'O que nossos clientes dizem',
  subtitulo = 'Mais de 5.000 clientes satisfeitos em Belo Horizonte e região',
  depoimentos = defaultDepoimentos,
  theme = 'midnight',
}: LPTestimonialsProps) => {
  const t = getTheme(theme);
  
  const TestimonialCard = ({ depoimento }: { depoimento: Depoimento }) => (
    <div className={`${t.bgCard} backdrop-blur-sm ${t.border} border rounded-2xl p-6 w-[350px] flex-shrink-0 mx-3 ${t.bgCardHover} transition-colors`}>
      <Quote className={`w-8 h-8 ${t.accentLight} mb-4`} />
      
      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: depoimento.rating || 5 }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        ))}
      </div>

      {/* Text */}
      <p className={`${t.textSecondary} mb-4 line-clamp-4`}>"{depoimento.texto}"</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradientIcon} flex items-center justify-center`}>
          <span className="text-white font-bold text-sm">
            {depoimento.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div>
          <p className={`${t.textPrimary} font-semibold text-sm`}>{depoimento.nome}</p>
          <p className={`${t.textMuted} text-xs`}>
            {depoimento.cidade} • {depoimento.servico}
          </p>
        </div>
      </div>
    </div>
  );
  
  return (
    <section className={`${t.bgPrimary} py-16 md:py-24 overflow-hidden`}>
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${t.textPrimary} mb-4`}>
            {titulo}
          </h2>
          <p className={`text-xl ${t.textMuted} max-w-2xl mx-auto`}>
            {subtitulo}
          </p>
        </motion.div>
      </div>

      {/* Marquee */}
      <Marquee className="[--duration:40s]" pauseOnHover>
        {depoimentos.map((depoimento, index) => (
          <TestimonialCard key={index} depoimento={depoimento} />
        ))}
      </Marquee>
    </section>
  );
};

export default LPTestimonials;
