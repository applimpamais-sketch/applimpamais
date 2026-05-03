import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Briefcase,
  Wrench,
  Handshake,
  Copy,
  Check,
  Search,
  Calendar,
  DollarSign,
  HelpCircle,
  MapPin,
  Rocket,
  Megaphone,
  Trophy,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Comando = {
  cmd: string;
  desc: string;
  exemplo?: string;
};

type Grupo = {
  titulo: string;
  icon: React.ComponentType<{ className?: string }>;
  comandos: Comando[];
};

const FUNCIONARIO: Grupo[] = [
  {
    titulo: "Agendamentos",
    icon: Calendar,
    comandos: [
      { cmd: "@agendar", desc: "Abre uma sessão progressiva de agendamento. O bot vai perguntando os dados que faltam.", exemplo: "@agendar" },
      { cmd: "@agendar [texto]", desc: "Tenta criar agendamento direto extraindo nome, telefone, endereço, serviço e data via IA.", exemplo: "@agendar Maria 31999..." },
      { cmd: "@hoje", desc: "Lista todos os agendamentos do dia.", exemplo: "@hoje" },
      { cmd: "@semana", desc: "Próximos 7 dias da agenda.", exemplo: "@semana" },
      { cmd: "@pendentes", desc: "Agendamentos aguardando confirmação.", exemplo: "@pendentes" },
      { cmd: "@buscar [termo]", desc: "Busca cliente ou agendamento por nome, telefone ou código.", exemplo: "@buscar Maria" },
      { cmd: "@status [código]", desc: "Detalhes de um agendamento específico.", exemplo: "@status BOT-ABC123" },
      { cmd: "@pronto", desc: "Verifica se a sessão de agendamento aberta está completa.", exemplo: "@pronto" },
      { cmd: "@cancelar", desc: "Cancela a sessão de agendamento em aberto.", exemplo: "@cancelar" },
      { cmd: "SIM / NÃO", desc: "Confirma ou nega agendamento online pendente (fluxo automático SIM/NÃO).", exemplo: "SIM" },
      { cmd: "(encaminhar mensagem)", desc: "Durante uma sessão @agendar, qualquer texto encaminhado é processado pela IA, que extrai os campos e atualiza a sessão progressivamente." },
      { cmd: "(corrigir dados)", desc: "Antes de dar SIM/NÃO numa confirmação, mandar texto novo atualiza os campos da sessão." },
    ],
  },
  {
    titulo: "Financeiro — Lançamentos & Consultas",
    icon: DollarSign,
    comandos: [
      { cmd: "@resumo", desc: "Dashboard rápido: entradas, saídas e saldo do dia.", exemplo: "@resumo" },
      { cmd: "@pagos", desc: "Lista de pagamentos recebidos hoje.", exemplo: "@pagos" },
      { cmd: "@despesas / @gastos", desc: "Lista de despesas registradas hoje.", exemplo: "@despesas" },
      { cmd: "(texto livre)", desc: "Lança despesa ou receita por texto.", exemplo: "Gasolina 80 reais" },
      { cmd: "(foto de cupom/NF)", desc: "Bot processa via Gemini Vision, extrai valor e categoria, e pede confirmação." },
      { cmd: "(áudio)", desc: "Bot transcreve via OpenAI Whisper e processa o lançamento." },
      { cmd: "SIM", desc: "Confirma o lançamento financeiro pendente.", exemplo: "SIM" },
      { cmd: "CANCELAR / NÃO", desc: "Cancela o lançamento pendente.", exemplo: "CANCELAR" },
      { cmd: "EDITAR", desc: "Descarta o lançamento e pede para reenviar a versão correta.", exemplo: "EDITAR" },
    ],
  },
  {
    titulo: "Ajuda",
    icon: HelpCircle,
    comandos: [
      { cmd: "@ajuda", desc: "Mostra a lista completa de comandos do funcionário.", exemplo: "@ajuda" },
    ],
  },
];

const TECNICO: Grupo[] = [
  {
    titulo: "Agenda do Técnico",
    icon: Calendar,
    comandos: [
      { cmd: "@agenda", desc: "Mostra os serviços agendados para hoje.", exemplo: "@agenda" },
      { cmd: "@semana", desc: "Agenda completa dos próximos 7 dias.", exemplo: "@semana" },
      { cmd: "@proximo", desc: "Mostra o próximo serviço agendado. Aceita @próximo.", exemplo: "@proximo" },
      { cmd: "@rota", desc: "Rota otimizada do dia (ordem ideal de atendimento via OSRM).", exemplo: "@rota" },
      { cmd: "@historico", desc: "Histórico de serviços já realizados. Aceita @histórico.", exemplo: "@historico" },
    ],
  },
  {
    titulo: "Execução de Serviço",
    icon: Rocket,
    comandos: [
      { cmd: "@iniciar [código]", desc: "Inicia o trajeto e envia link de rastreamento em tempo real para o cliente.", exemplo: "@iniciar BOT-ABC123" },
      { cmd: "@cheguei", desc: "Registra a chegada no local. Use após @iniciar.", exemplo: "@cheguei" },
      { cmd: "@concluir [código]", desc: "Finaliza o serviço. Dispara fluxo de avaliação pós-venda (24h).", exemplo: "@concluir BOT-ABC123" },
      { cmd: "@mapa [código]", desc: "Recebe o link do mapa com endereço e rota até o cliente.", exemplo: "@mapa BOT-ABC123" },
    ],
  },
  {
    titulo: "Ajuda",
    icon: HelpCircle,
    comandos: [
      { cmd: "@ajuda", desc: "Mostra a lista completa de comandos do técnico.", exemplo: "@ajuda" },
    ],
  },
];

const PARCEIRO: Grupo[] = [
  {
    titulo: "Financeiro & Comissões",
    icon: DollarSign,
    comandos: [
      { cmd: "@saldo", desc: "Mostra o saldo disponível para saque e total acumulado.", exemplo: "@saldo" },
      { cmd: "@sacar [valor]", desc: "Solicita saque do valor informado. Mínimo: R$ 50,00.", exemplo: "@sacar 100" },
      { cmd: "@historico", desc: "Histórico de saques solicitados e pagos. Aceita @histórico.", exemplo: "@historico" },
      { cmd: "@conversoes", desc: "Lista conversões (clientes que compraram via seu link). Aceita @conversões.", exemplo: "@conversoes" },
    ],
  },
  {
    titulo: "Divulgação",
    icon: Megaphone,
    comandos: [
      { cmd: "@link", desc: "Mostra seu link único de afiliado para divulgação.", exemplo: "@link" },
      { cmd: "@qrcode / @qr", desc: "Gera o QR Code do seu link de afiliado.", exemplo: "@qrcode" },
      { cmd: "@materiais", desc: "Recebe material promocional (artes, textos, vídeos) prontos para compartilhar.", exemplo: "@materiais" },
    ],
  },
  {
    titulo: "Performance",
    icon: Trophy,
    comandos: [
      { cmd: "@ranking", desc: "Sua posição no ranking geral de parceiros do mês.", exemplo: "@ranking" },
    ],
  },
  {
    titulo: "Ajuda",
    icon: HelpCircle,
    comandos: [
      { cmd: "@ajuda", desc: "Mostra a lista completa de comandos do parceiro.", exemplo: "@ajuda" },
    ],
  },
];

function ComandoRow({ cmd, desc, exemplo, query }: Comando & { query: string }) {
  const [copied, setCopied] = useState(false);

  const matches = query
    ? `${cmd} ${desc} ${exemplo ?? ""}`.toLowerCase().includes(query.toLowerCase())
    : true;
  if (!matches) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(exemplo || cmd);
    setCopied(true);
    toast({ title: "Copiado!", description: exemplo || cmd });
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex flex-col sm:flex-row sm:items-start gap-3 p-3 rounded-lg border border-border/50 bg-card hover:border-primary/40 hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-2 sm:w-56 shrink-0">
        <code className="font-mono text-sm font-bold text-primary break-all">{cmd}</code>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-relaxed">{desc}</p>
        {exemplo && (
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Exemplo: <span className="text-foreground">{exemplo}</span>
          </p>
        )}
      </div>
      {(exemplo || cmd.startsWith("@")) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="shrink-0 opacity-60 group-hover:opacity-100"
          aria-label="Copiar comando"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}

function GrupoSection({ grupo, query }: { grupo: Grupo; query: string }) {
  const Icon = grupo.icon;
  const visiveis = grupo.comandos.filter((c) =>
    query ? `${c.cmd} ${c.desc} ${c.exemplo ?? ""}`.toLowerCase().includes(query.toLowerCase()) : true
  );
  if (visiveis.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold">{grupo.titulo}</h3>
        <Badge variant="secondary" className="text-xs">
          {visiveis.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {grupo.comandos.map((c, i) => (
          <ComandoRow key={i} {...c} query={query} />
        ))}
      </div>
    </div>
  );
}

const PROFILES = {
  funcionario: {
    label: "Funcionários",
    icon: Briefcase,
    color: "bg-sky-500/10 text-sky-600 border-sky-500/30",
    descricao: "Apenas números cadastrados em Equipe › Funcionários Bot conseguem usar.",
    grupos: FUNCIONARIO,
    naoPode: [
      "Iniciar/concluir serviços (exclusivo do Técnico).",
      "Sacar comissão (exclusivo do Parceiro).",
      "Editar agenda de outros funcionários.",
      "Excluir agendamentos já confirmados (precisa fazer no painel).",
    ],
  },
  tecnico: {
    label: "Técnicos",
    icon: Wrench,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    descricao: "Apenas técnicos cadastrados em Equipe › Técnicos com WhatsApp ativo.",
    grupos: TECNICO,
    naoPode: [
      "Lançar despesas/receitas (exclusivo do Funcionário).",
      "Criar agendamentos do zero (use o Funcionário ou painel).",
      "Sacar comissão (exclusivo do Parceiro).",
    ],
  },
  parceiro: {
    label: "Parceiros",
    icon: Handshake,
    color: "bg-violet-500/10 text-violet-600 border-violet-500/30",
    descricao: "Apenas parceiros aprovados no Programa de Parceiros com WhatsApp cadastrado.",
    grupos: PARCEIRO,
    naoPode: [
      "Criar agendamentos (exclusivo do Funcionário).",
      "Iniciar/concluir serviços (exclusivo do Técnico).",
      "Acessar dados financeiros internos da empresa.",
    ],
  },
} as const;

type ProfileKey = keyof typeof PROFILES;

export default function ComandosBot() {
  const [tab, setTab] = useState<ProfileKey>("funcionario");
  const [query, setQuery] = useState("");

  const totalComandos = (k: ProfileKey) =>
    PROFILES[k].grupos.reduce((acc, g) => acc + g.comandos.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Comandos do Bot WhatsApp
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tudo que Funcionários, Técnicos e Parceiros conseguem fazer pelo WhatsApp.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comando..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Aviso global */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <strong>Bot autônomo desligado para clientes.</strong> Apenas números cadastrados em
            Funcionários, Técnicos ou Parceiros recebem respostas automáticas. Mensagens de números
            desconhecidos são ignoradas silenciosamente.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as ProfileKey)} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          {(Object.keys(PROFILES) as ProfileKey[]).map((k) => {
            const P = PROFILES[k];
            const Icon = P.icon;
            return (
              <TabsTrigger key={k} value={k} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{P.label}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {totalComandos(k)}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(PROFILES) as ProfileKey[]).map((k) => {
          const P = PROFILES[k];
          const Icon = P.icon;
          return (
            <TabsContent key={k} value={k} className="space-y-6">
              {/* Card descritivo */}
              <Card className={`border ${P.color}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${P.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{P.label}</CardTitle>
                      <CardDescription>{P.descricao}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Grupos de comandos */}
              <div className="space-y-8">
                {P.grupos.map((g) => (
                  <GrupoSection key={g.titulo} grupo={g} query={query} />
                ))}
              </div>

              {/* Recursos automáticos (só funcionário) */}
              {k === "funcionario" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Recursos automáticos (nos bastidores)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li><strong className="text-foreground">Anti-loop / idempotência:</strong> ignora mensagens duplicadas e o próprio número do bot.</li>
                      <li><strong className="text-foreground">Atribuição de autoria:</strong> cada agendamento fica vinculado ao funcionário que lançou.</li>
                      <li><strong className="text-foreground">Multi-tenant:</strong> agendamento criado no tenant correto.</li>
                      <li><strong className="text-foreground">Order code:</strong> código único gerado por trigger no banco (BOT-XXX).</li>
                      <li><strong className="text-foreground">Sessão de 30 min:</strong> @agendar mantém contexto para encaminhar mensagens fragmentadas.</li>
                      <li><strong className="text-foreground">Locação detectada:</strong> ativa upsells, cobrança especial e link de rastreio.</li>
                      <li><strong className="text-foreground">Confirmação de agendamento online:</strong> SIM/NÃO no WhatsApp confirma vendas do site.</li>
                    </ul>
                  </CardContent>
                </Card>
              )}

              {k === "tecnico" && (
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                  <CardContent className="py-4">
                    <p className="text-sm">
                      <strong>Fluxo recomendado:</strong>{" "}
                      <code className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">@agenda</code> →{" "}
                      <code className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">@rota</code> →{" "}
                      <code className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">@iniciar</code> →{" "}
                      <code className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">@cheguei</code> →{" "}
                      <code className="font-mono text-xs bg-background px-1.5 py-0.5 rounded">@concluir</code>
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* O que NÃO pode fazer */}
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    O que NÃO pode fazer pelo bot
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    {P.naoPode.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-destructive mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
