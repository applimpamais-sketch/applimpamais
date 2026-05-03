import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TESTIMONIALS = [
  {
    nome: 'Fernanda S.',
    bairro: 'Jardim América',
    texto: 'Aluguei por 2 dias e limpei sofá, colchão e tapete. Saiu uma sujeira absurda! Valeu cada centavo.',
    rating: 5,
  },
  {
    nome: 'Ricardo M.',
    bairro: 'Centro',
    texto: 'Máquina super fácil de usar. Minha esposa ficou impressionada com o resultado do colchão.',
    rating: 5,
  },
  {
    nome: 'Ana Paula L.',
    bairro: 'Vila Nova',
    texto: 'Já é a terceira vez que alugo. Muito mais barato que contratar serviço e o resultado é profissional.',
    rating: 5,
  },
  {
    nome: 'Carlos H.',
    bairro: 'Santa Mônica',
    texto: 'Entregaram na minha casa no horário certinho. Devolvi no dia seguinte, praticidade total.',
    rating: 5,
  },
];

const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < count ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"
        )}
      />
    ))}
  </div>
);

const SocialProof = () => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <h2 className="text-xl font-bold text-foreground">Quem Alugou, Aprovou</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        +200 locações realizadas com nota máxima
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TESTIMONIALS.map((t, idx) => (
          <Card
            key={idx}
            className="p-4 border-border bg-card relative overflow-hidden"
          >
            <Quote className="absolute top-3 right-3 h-8 w-8 text-primary/10" />
            <Stars count={t.rating} />
            <p className="text-sm text-foreground/80 mt-2 leading-relaxed">
              "{t.texto}"
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                {t.nome.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.nome}</p>
                <p className="text-xs text-muted-foreground">{t.bairro}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SocialProof;
