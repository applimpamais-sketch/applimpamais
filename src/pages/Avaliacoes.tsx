import { useState, useMemo } from "react";
import { Star, Quote, MapPin, Filter, X, Sparkles, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvaliacaoForm } from "@/components/avaliacoes/AvaliacaoForm";

const avaliacoes = [
  // 2025
  {
    id: 1,
    nome: "Carolina Machado",
    cidade: "Belo Horizonte",
    bairro: "Savassi",
    rating: 5,
    comentario: "Atendimento espetacular em 2025! Continuo cliente fiel da RC Limpa Mais. Limparam todo o sofá em menos de 2 horas.",
    servico: "Limpeza de Sofá",
    data: "Dezembro 2025"
  },
  {
    id: 2,
    nome: "Rodrigo Alves",
    cidade: "Nova Lima",
    bairro: "Vila da Serra",
    rating: 5,
    comentario: "Impermeabilização perfeita! Meu cachorro derrubou água no sofá e não manchou nada. Investimento que vale a pena.",
    servico: "Impermeabilização de Sofá",
    data: "Novembro 2025"
  },
  {
    id: 3,
    nome: "Beatriz Fernandes",
    cidade: "Contagem",
    bairro: "Eldorado",
    rating: 5,
    comentario: "Terceira vez que contrato e sempre superam as expectativas. Colchão ficou sem nenhum ácaro!",
    servico: "Limpeza de Colchão",
    data: "Outubro 2025"
  },
  {
    id: 4,
    nome: "Lucas Pimentel",
    cidade: "Betim",
    bairro: "Centro",
    rating: 5,
    comentario: "Aluguei a máquina para fazer a limpeza pós-obra. Funcionou perfeitamente e economizei muito!",
    servico: "Aluguel de Máquina",
    data: "Setembro 2025"
  },
  {
    id: 5,
    nome: "Amanda Rocha",
    cidade: "Belo Horizonte",
    bairro: "Funcionários",
    rating: 5,
    comentario: "Limpeza e impermeabilização juntas foi a melhor decisão. Equipe super cuidadosa com meus móveis novos.",
    servico: "Limpeza + Impermeabilização",
    data: "Agosto 2025"
  },
  {
    id: 6,
    nome: "Pedro Henrique",
    cidade: "Belo Horizonte",
    bairro: "Pampulha",
    rating: 5,
    comentario: "Limparam todas as 12 cadeiras do meu escritório. Trabalho rápido e resultado incrível!",
    servico: "Limpeza de Cadeiras",
    data: "Julho 2025"
  },
  {
    id: 7,
    nome: "Isabela Costa",
    cidade: "Nova Lima",
    bairro: "Belvedere",
    rating: 5,
    comentario: "Poltronas da sala de TV ficaram impecáveis. Recomendo para quem tem pets em casa!",
    servico: "Limpeza de Poltrona",
    data: "Junho 2025"
  },
  {
    id: 8,
    nome: "Gabriel Santos",
    cidade: "Contagem",
    bairro: "Industrial",
    rating: 5,
    comentario: "Cama box tinha manchas de anos. Saiu tudo! Estou dormindo muito melhor agora.",
    servico: "Limpeza de Cama Box",
    data: "Maio 2025"
  },
  {
    id: 9,
    nome: "Mariana Duarte",
    cidade: "Belo Horizonte",
    bairro: "Santo Antônio",
    rating: 5,
    comentario: "Sempre pontual e profissional. A RC Limpa Mais cuida dos meus estofados há 3 anos.",
    servico: "Limpeza de Sofá",
    data: "Abril 2025"
  },
  {
    id: 10,
    nome: "Thiago Moreira",
    cidade: "Betim",
    bairro: "Alterosas",
    rating: 5,
    comentario: "Excelente custo-benefício! Limpeza completa do colchão king size por um preço justo.",
    servico: "Limpeza de Colchão",
    data: "Março 2025"
  },
  {
    id: 11,
    nome: "Juliana Vieira",
    cidade: "Belo Horizonte",
    bairro: "Lourdes",
    rating: 5,
    comentario: "Equipe muito educada e trabalho impecável. Meu sofá de veludo ficou como novo!",
    servico: "Limpeza de Sofá",
    data: "Fevereiro 2025"
  },
  {
    id: 12,
    nome: "Rafael Mendonça",
    cidade: "Nova Lima",
    bairro: "Jardim Canadá",
    rating: 5,
    comentario: "Comecei o ano com sofá limpo! Atendimento pelo WhatsApp super rápido.",
    servico: "Limpeza de Sofá",
    data: "Janeiro 2025"
  },
  // 2024
  {
    id: 13,
    nome: "Maria Silva",
    cidade: "Belo Horizonte",
    bairro: "Savassi",
    rating: 5,
    comentario: "Serviço impecável! Meu sofá ficou como novo. A equipe foi super profissional e pontual. Recomendo demais!",
    servico: "Limpeza de Sofá",
    data: "Novembro 2024"
  },
  {
    id: 14,
    nome: "João Pedro",
    cidade: "Contagem",
    bairro: "Eldorado",
    rating: 5,
    comentario: "Excelente trabalho na limpeza do colchão. Removeram todas as manchas e o cheiro ficou muito agradável. Vale cada centavo!",
    servico: "Limpeza de Colchão",
    data: "Outubro 2024"
  },
  {
    id: 15,
    nome: "Ana Carolina",
    cidade: "Betim",
    bairro: "Centro",
    rating: 5,
    comentario: "Contratei para limpar as poltronas do escritório. Ficaram perfeitas! O atendimento pelo WhatsApp foi muito rápido.",
    servico: "Limpeza de Poltrona",
    data: "Setembro 2024"
  },
  {
    id: 16,
    nome: "Carlos Eduardo",
    cidade: "Nova Lima",
    bairro: "Vila da Serra",
    rating: 5,
    comentario: "Impermeabilização do sofá ficou excelente. A equipe explicou todo o processo e cuidou muito bem dos móveis.",
    servico: "Impermeabilização de Sofá",
    data: "Agosto 2024"
  },
  {
    id: 17,
    nome: "Fernanda Oliveira",
    cidade: "Belo Horizonte",
    bairro: "Funcionários",
    rating: 5,
    comentario: "Aluguei a máquina para limpar o tapete em casa. Muito fácil de usar e o resultado foi incrível! Economizei muito.",
    servico: "Aluguel de Máquina",
    data: "Julho 2024"
  },
  {
    id: 18,
    nome: "Roberto Mendes",
    cidade: "Belo Horizonte",
    bairro: "Pampulha",
    rating: 5,
    comentario: "Limpeza profunda nas cadeiras de jantar. Removeram manchas que eu achava que nunca sairiam. Trabalho nota 10!",
    servico: "Limpeza de Cadeiras",
    data: "Junho 2024"
  },
  {
    id: 19,
    nome: "Luciana Santos",
    cidade: "Contagem",
    bairro: "Ressaca",
    rating: 5,
    comentario: "Minha cama box estava com ácaros e a limpeza resolveu completamente. Estou dormindo muito melhor agora!",
    servico: "Limpeza de Cama Box",
    data: "Maio 2024"
  },
  {
    id: 20,
    nome: "Marcelo Ferreira",
    cidade: "Belo Horizonte",
    bairro: "Santa Efigênia",
    rating: 5,
    comentario: "Atendimento excepcional desde o agendamento até a finalização. Equipe educada e muito competente.",
    servico: "Limpeza + Impermeabilização",
    data: "Abril 2024"
  },
  {
    id: 21,
    nome: "Patricia Lima",
    cidade: "Belo Horizonte",
    bairro: "Buritis",
    rating: 5,
    comentario: "Fizeram a limpeza do meu sofá de 5 lugares. Ficou impecável! Super recomendo.",
    servico: "Limpeza de Sofá",
    data: "Março 2024"
  },
  {
    id: 22,
    nome: "Ricardo Almeida",
    cidade: "Contagem",
    bairro: "Industrial",
    rating: 5,
    comentario: "Ótimo custo-benefício. Limparam todas as cadeiras do meu restaurante rapidamente.",
    servico: "Limpeza de Cadeiras",
    data: "Fevereiro 2024"
  },
  {
    id: 23,
    nome: "Cristiane Barbosa",
    cidade: "Nova Lima",
    bairro: "Alphaville",
    rating: 5,
    comentario: "Começamos o ano com tudo limpo! Serviço impecável como sempre.",
    servico: "Limpeza de Colchão",
    data: "Janeiro 2024"
  },
  // 2023
  {
    id: 24,
    nome: "Paula Ribeiro",
    cidade: "Belo Horizonte",
    bairro: "Lourdes",
    rating: 5,
    comentario: "Melhor serviço de limpeza que já contratei! O sofá ficou sem nenhuma mancha, parece novo de loja.",
    servico: "Limpeza de Sofá",
    data: "Dezembro 2023"
  },
  {
    id: 25,
    nome: "Gustavo Henrique",
    cidade: "Nova Lima",
    bairro: "Jardim Canadá",
    rating: 5,
    comentario: "Impermeabilizaram todo o estofado do meu home theater. Trabalho excepcional e muito cuidadoso.",
    servico: "Impermeabilização de Sofá",
    data: "Outubro 2023"
  },
  {
    id: 26,
    nome: "Camila Rodrigues",
    cidade: "Betim",
    bairro: "Alterosas",
    rating: 5,
    comentario: "Aluguei a máquina para fazer a limpeza geral da casa. Muito prática e eficiente!",
    servico: "Aluguel de Máquina",
    data: "Agosto 2023"
  },
  {
    id: 27,
    nome: "Fernando Costa",
    cidade: "Belo Horizonte",
    bairro: "Cidade Nova",
    rating: 5,
    comentario: "Limpeza do colchão king size ficou perfeita. Removeram todas as manchas antigas.",
    servico: "Limpeza de Colchão",
    data: "Junho 2023"
  },
  {
    id: 28,
    nome: "Juliana Martins",
    cidade: "Contagem",
    bairro: "Água Branca",
    rating: 5,
    comentario: "Fizeram limpeza e impermeabilização juntos. O resultado superou minhas expectativas!",
    servico: "Limpeza + Impermeabilização",
    data: "Abril 2023"
  },
  {
    id: 29,
    nome: "Henrique Campos",
    cidade: "Belo Horizonte",
    bairro: "Serra",
    rating: 5,
    comentario: "Poltronas do consultório ficaram como novas. Pacientes elogiaram a diferença!",
    servico: "Limpeza de Poltrona",
    data: "Fevereiro 2023"
  },
  // 2022
  {
    id: 30,
    nome: "André Luiz",
    cidade: "Belo Horizonte",
    bairro: "Serra",
    rating: 5,
    comentario: "Serviço de primeira qualidade. Meu sofá de couro ficou renovado completamente.",
    servico: "Limpeza de Sofá",
    data: "Novembro 2022"
  },
  {
    id: 31,
    nome: "Renata Souza",
    cidade: "Nova Lima",
    bairro: "Alphaville",
    rating: 5,
    comentario: "Limparam todas as poltronas da sala. Equipe muito profissional e pontual.",
    servico: "Limpeza de Poltrona",
    data: "Setembro 2022"
  },
  {
    id: 32,
    nome: "Bruno Carvalho",
    cidade: "Betim",
    bairro: "PTB",
    rating: 5,
    comentario: "Excelente atendimento! A cama box ficou completamente higienizada.",
    servico: "Limpeza de Cama Box",
    data: "Julho 2022"
  },
  {
    id: 33,
    nome: "Mariana Pereira",
    cidade: "Belo Horizonte",
    bairro: "Santo Antônio",
    rating: 5,
    comentario: "Recomendo muito! Trabalho impecável na limpeza das cadeiras.",
    servico: "Limpeza de Cadeiras",
    data: "Maio 2022"
  },
  {
    id: 34,
    nome: "Eduardo Gomes",
    cidade: "Contagem",
    bairro: "Centro",
    rating: 5,
    comentario: "Impermeabilização durou mais de um ano sem problemas. Vale o investimento!",
    servico: "Impermeabilização de Sofá",
    data: "Março 2022"
  },
  {
    id: 35,
    nome: "Tatiana Lopes",
    cidade: "Belo Horizonte",
    bairro: "Gutierrez",
    rating: 5,
    comentario: "Máquina de aluguel é top! Fiz toda a limpeza da casa num fim de semana.",
    servico: "Aluguel de Máquina",
    data: "Janeiro 2022"
  },
  // 2021
  {
    id: 36,
    nome: "Thiago Moura",
    cidade: "Contagem",
    bairro: "Centro",
    rating: 5,
    comentario: "Desde 2021 só contrato a RC Limpa Mais. Serviço sempre perfeito!",
    servico: "Limpeza de Sofá",
    data: "Outubro 2021"
  },
  {
    id: 37,
    nome: "Isabela Fernandes",
    cidade: "Belo Horizonte",
    bairro: "Gutierrez",
    rating: 5,
    comentario: "Fizeram a impermeabilização do sofá novo. Excelente investimento!",
    servico: "Impermeabilização de Sofá",
    data: "Julho 2021"
  },
  {
    id: 38,
    nome: "Diego Nascimento",
    cidade: "Nova Lima",
    bairro: "Belvedere",
    rating: 5,
    comentario: "Aluguel de máquina foi a melhor opção. Limpei toda a casa!",
    servico: "Aluguel de Máquina",
    data: "Abril 2021"
  },
  {
    id: 39,
    nome: "Vanessa Ribeiro",
    cidade: "Betim",
    bairro: "Imbiruçu",
    rating: 5,
    comentario: "Colchão estava com mofo e saiu tudo. Trabalho perfeito!",
    servico: "Limpeza de Colchão",
    data: "Janeiro 2021"
  },
  // 2020
  {
    id: 40,
    nome: "Amanda Costa",
    cidade: "Belo Horizonte",
    bairro: "Floresta",
    rating: 5,
    comentario: "Cliente desde o início! Sempre satisfeita com o serviço de limpeza.",
    servico: "Limpeza de Colchão",
    data: "Outubro 2020"
  },
  {
    id: 41,
    nome: "Rafael Gomes",
    cidade: "Betim",
    bairro: "Imbiruçu",
    rating: 5,
    comentario: "Um dos primeiros clientes e até hoje recomendo para todos os amigos!",
    servico: "Limpeza de Sofá",
    data: "Julho 2020"
  },
  {
    id: 42,
    nome: "Letícia Barbosa",
    cidade: "Contagem",
    bairro: "Cinco",
    rating: 5,
    comentario: "Empresa séria e competente. Fazem um trabalho impecável desde o começo.",
    servico: "Limpeza + Impermeabilização",
    data: "Abril 2020"
  },
  {
    id: 43,
    nome: "Marcos Vinícius",
    cidade: "Belo Horizonte",
    bairro: "Prado",
    rating: 5,
    comentario: "Descobri a RC Limpa Mais no início e nunca mais troquei. Qualidade garantida!",
    servico: "Limpeza de Sofá",
    data: "Janeiro 2020"
  }
];

// Extrair tipos de serviço e períodos únicos
const tiposServico = [...new Set(avaliacoes.map(a => a.servico))].sort();
const periodos = [...new Set(avaliacoes.map(a => a.data))].sort((a, b) => {
  const meses: Record<string, number> = {
    "Janeiro": 1, "Fevereiro": 2, "Março": 3, "Abril": 4,
    "Maio": 5, "Junho": 6, "Julho": 7, "Agosto": 8,
    "Setembro": 9, "Outubro": 10, "Novembro": 11, "Dezembro": 12
  };
  const [mesA, anoA] = a.split(" ");
  const [mesB, anoB] = b.split(" ");
  const dateA = parseInt(anoA) * 12 + (meses[mesA] || 0);
  const dateB = parseInt(anoB) * 12 + (meses[mesB] || 0);
  return dateB - dateA; // Mais recente primeiro
});

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
        }`}
      />
    ))}
  </div>
);

const AvaliacaoCard = ({ avaliacao }: { avaliacao: typeof avaliacoes[0] }) => (
  <div className="group relative bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/30">
    <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
    
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">
              {avaliacao.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{avaliacao.nome}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{avaliacao.bairro}, {avaliacao.cidade}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <StarRating rating={avaliacao.rating} />
        <span className="text-xs text-muted-foreground">{avaliacao.data}</span>
      </div>

      {/* Comentário */}
      <p className="text-muted-foreground leading-relaxed">
        "{avaliacao.comentario}"
      </p>

      {/* Serviço */}
      <div className="pt-2 border-t border-border/50">
        <span className="text-xs font-medium text-primary/80 bg-primary/5 px-2.5 py-1 rounded-full">
          {avaliacao.servico}
        </span>
      </div>
    </div>
  </div>
);

const Avaliacoes = () => {
  const [filtroServico, setFiltroServico] = useState<string>("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("todos");

  const avaliacoesFiltradas = useMemo(() => {
    return avaliacoes.filter(avaliacao => {
      const matchServico = filtroServico === "todos" || avaliacao.servico === filtroServico;
      const matchPeriodo = filtroPeriodo === "todos" || avaliacao.data === filtroPeriodo;
      return matchServico && matchPeriodo;
    });
  }, [filtroServico, filtroPeriodo]);

  const temFiltrosAtivos = filtroServico !== "todos" || filtroPeriodo !== "todos";

  const limparFiltros = () => {
    setFiltroServico("todos");
    setFiltroPeriodo("todos");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header simples */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo-rc-limpa-mais.png" 
              alt="RC Limpa Mais" 
              className="h-10 w-auto"
            />
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm">
              Voltar ao Site
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            O Que Nossos Clientes Dizem
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A satisfação dos nossos clientes é nossa maior recompensa. Veja os depoimentos de quem já experimentou nossos serviços.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-16 mt-10">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Clientes Atendidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">4.9</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                Avaliação Média
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Recomendariam</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-6 border-b border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtrar avaliações</span>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Filtro por Serviço */}
              <Select value={filtroServico} onValueChange={setFiltroServico}>
                <SelectTrigger className="w-full sm:w-[220px] bg-background">
                  <Sparkles className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Tipo de Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Serviços</SelectItem>
                  {tiposServico.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por Período */}
              <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                <SelectTrigger className="w-full sm:w-[180px] bg-background">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Períodos</SelectItem>
                  {periodos.map(periodo => (
                    <SelectItem key={periodo} value={periodo}>{periodo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Botão Limpar Filtros */}
              {temFiltrosAtivos && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={limparFiltros}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{avaliacoesFiltradas.length}</span> de <span className="font-semibold text-foreground">{avaliacoes.length}</span> avaliações
          </div>
        </div>
      </section>

      {/* Grid de Avaliações */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          {avaliacoesFiltradas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {avaliacoesFiltradas.map((avaliacao) => (
                <AvaliacaoCard key={avaliacao.id} avaliacao={avaliacao} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma avaliação encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros para ver mais resultados.
              </p>
              <Button variant="outline" onClick={limparFiltros}>
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Formulário de Avaliação */}
      <AvaliacaoForm />

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Faça Parte dos Nossos Clientes Satisfeitos
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Agende seu serviço agora e descubra por que somos a escolha número 1 em limpeza de estofados na região.
          </p>
          <Link to="/">
            <Button size="lg" className="font-semibold">
              Agendar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer simples */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} RC Limpa Mais. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Avaliacoes;
