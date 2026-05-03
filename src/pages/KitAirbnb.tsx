import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Check, Clock, Shield, Download, Star, TrendingUp, ChevronDown,
  CheckCircle2, XCircle, Sparkles, Building2, Timer, MessageSquare,
} from "lucide-react";
import { trackInitiateCheckout, trackViewContent } from "@/utils/facebookPixel";
import { PLATFORM_NAME, SITE_DOMAIN } from "@/lib/constants";

/* Identidade visual: premium dark hospitality (preto + dourado) */
const C = {
  bg: "#0A0A0A",
  surface: "#141414",
  card: "#1C1C1C",
  border: "#2A2A2A",
  gold: "#C9A659",
  goldSoft: "#E8D49A",
  text: "#F5F5F5",
  muted: "#9CA3AF",
  cream: "#FAF6EE",
};

const PDF_URL = "/materiais/kit-airbnb.pdf";
const CHECKOUT_URL = "#checkout";
const PRECO_DE = 97;
const PRECO_POR = 47;

function useCountdown24h() {
  const KEY = "kit_airbnb_end";
  const [now, setNow] = useState(Date.now());
  const endRef = useRef<number>(0);
  if (endRef.current === 0) {
    const stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    const parsed = stored ? parseInt(stored, 10) : 0;
    if (parsed && parsed > Date.now()) endRef.current = parsed;
    else {
      endRef.current = Date.now() + 24 * 60 * 60 * 1000;
      if (typeof window !== "undefined") localStorage.setItem(KEY, String(endRef.current));
    }
  }
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, endRef.current - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { h, m, s };
}

function handleCheckout(label: string) {
  try {
    trackInitiateCheckout(
      [{ id: "kit-airbnb-pdf", name: "Kit Anfitrião Airbnb", price: PRECO_POR, quantity: 1 }],
      PRECO_POR,
    );
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("trackCustom", "KitAirbnbCheckoutClick", { source: label });
    }
  } catch (_) {}
  if (typeof window !== "undefined") window.location.href = CHECKOUT_URL;
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any },
};

const KPIs = [
  { label: "Turnover-alvo", value: "30 min", sub: "checklist por cômodo" },
  { label: "Receitas express", value: "8", sub: "produtos do mercado" },
  { label: "Templates prontos", value: "5", sub: "WhatsApp + Airbnb" },
  { label: "Garantia", value: "7 dias", sub: "100% reembolso" },
];

const SUMARIO = [
  { num: "01", titulo: "Por que turnover de 30 min vale ouro" },
  { num: "02", titulo: "Kit-base de produtos e ferramentas" },
  { num: "03", titulo: "Checklist Suíte (8 min)" },
  { num: "04", titulo: "Checklist Banheiro (7 min)" },
  { num: "05", titulo: "Checklist Cozinha (8 min)" },
  { num: "06", titulo: "Checklist Sala + Varanda (5 min)" },
  { num: "07", titulo: "Checklist Final + Setup (2 min)" },
  { num: "08", titulo: "Receitas express (8)" },
  { num: "09", titulo: "Templates de comunicação" },
  { num: "10", titulo: "Cronograma de manutenção" },
];

const FAQS = [
  { q: "Funciona pra quem aluga só 1 imóvel?", a: "Funciona melhor ainda — você ganha consistência sem precisar treinar ninguém. Os checklists viram seu padrão pessoal." },
  { q: "Os produtos sugeridos são caros?", a: "Não. Tudo é encontrado em supermercado comum (Veja, Mr. Músculo, Vanish, bicarbonato, vinagre). O kit completo sai abaixo de R$ 150 e dura meses." },
  { q: "Recebo na hora?", a: "Sim. Após o pagamento o PDF é liberado imediatamente para download (versão para celular e impressão)." },
  { q: "Serve pra Booking, Decolar e aluguel por temporada?", a: "Sim. Os checklists e templates funcionam em qualquer plataforma de hospedagem por temporada." },
  { q: "Tem garantia?", a: "7 dias incondicional. Não gostou, devolvemos 100% sem perguntas." },
];

export default function KitAirbnb() {
  const { h, m, s } = useCountdown24h();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useEffect(() => {
    trackViewContent("services", "Kit Anfitrião Airbnb");
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "Inter, system-ui, sans-serif" }}>
      <Helmet>
        <title>Kit Anfitrião Airbnb — Sistema 5 Estrelas em 30 min | {PLATFORM_NAME}</title>
        <meta name="description" content="Sistema operacional para superhosts: checklists por cômodo (30 min), 8 receitas express, 5 templates de comunicação e cronograma de manutenção. PDF imediato R$ 47." />
        <link rel="canonical" href={`${SITE_DOMAIN}/kit-airbnb`} />
        <meta property="og:title" content={`Kit Anfitrião Airbnb — ${PLATFORM_NAME}`} />
        <meta property="og:description" content="O método dos superhosts em PDF. Checklists, receitas e templates por R$ 47." />
        <meta property="og:type" content="product" />
      </Helmet>

      {/* Top bar */}
      <div style={{ background: "#000", borderBottom: `1px solid ${C.gold}40` }}
           className="py-2.5 px-4 text-center text-xs sm:text-sm flex items-center justify-center gap-2 flex-wrap">
        <Timer className="w-4 h-4" style={{ color: C.gold }} />
        <span style={{ color: C.muted }}>Edição hospitality • lançamento expira em</span>
        <span className="font-mono font-bold tracking-[0.2em]" style={{ color: C.gold }}>
          {pad(h)}:{pad(m)}:{pad(s)}
        </span>
      </div>

      {/* HERO — dashboard premium */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: C.border }}>
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, rgba(201,166,89,0.15) 0px, transparent 40%), radial-gradient(circle at 90% 80%, rgba(201,166,89,0.08) 0px, transparent 50%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.div {...fadeUp} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-bold tracking-[0.2em] mb-6 uppercase"
                 style={{ background: "transparent", border: `1px solid ${C.gold}`, color: C.gold }}>
              <Building2 className="w-3 h-3" /> EDIÇÃO HOSPITALITY · v2026.1
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] mb-6 tracking-tight">
              O sistema operacional<br/>
              que mantém <span style={{ color: C.gold }}>5 estrelas</span><br/>
              em <span style={{ color: C.gold, fontStyle: "italic" }}>30 minutos</span>.
            </h1>
            <p className="text-base sm:text-lg mb-10 max-w-2xl" style={{ color: C.muted }}>
              Checklists por cômodo. Receitas express com produto de mercado.
              Templates de comunicação que blindam reviews. Tudo em um único PDF
              que você abre no celular durante o turnover.
            </p>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {KPIs.map((k, i) => (
                <div key={i} className="p-4 rounded-sm" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: C.muted }}>{k.label}</div>
                  <div className="text-2xl font-extrabold" style={{ color: C.gold }}>{k.value}</div>
                  <div className="text-xs mt-1" style={{ color: C.muted }}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-baseline gap-3 mb-6">
              <span className="line-through text-lg" style={{ color: C.muted }}>R$ {PRECO_DE}</span>
              <span className="text-5xl font-extrabold" style={{ color: C.gold }}>R$ {PRECO_POR}</span>
              <span className="text-sm" style={{ color: C.muted }}>à vista · PDF imediato</span>
            </div>

            <button
              onClick={() => handleCheckout("hero")}
              className="w-full sm:w-auto px-8 py-5 rounded-sm font-bold text-base tracking-wider uppercase transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-3"
              style={{ background: C.gold, color: "#000" }}
            >
              ATIVAR O SISTEMA · DOWNLOAD <Download className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-xs uppercase tracking-wider" style={{ color: C.muted }}>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" style={{ color: C.gold }} /> Compra segura</span>
              <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" style={{ color: C.gold }} /> Acesso imediato</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: C.gold }} /> Garantia 7 dias</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEMA / SOLUÇÃO em duas colunas */}
      <section className="py-20 sm:py-28 px-4 border-b" style={{ borderColor: C.border }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <motion.div {...fadeUp}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-4" style={{ color: "#EF4444" }}>SEM SISTEMA</div>
            <h3 className="text-2xl font-bold mb-6">O que destrói reviews 5★</h3>
            <ul className="space-y-3">
              {[
                "Cabelo no travesseiro porque a faxineira não trocou a fronha",
                "Mofo no rejunte do box — comentário 'apartamento sujo'",
                "Cheiro de gordura na cozinha — 1★ em limpeza",
                "Resposta 4h depois no chat — perda de Superhost",
                "Faltou papel higiênico — 'falta de atenção'",
              ].map((d, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-sm" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} />
                  <span className="text-sm" style={{ color: C.text }}>{d}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div {...fadeUp}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-4" style={{ color: C.gold }}>COM O KIT ATIVO</div>
            <h3 className="text-2xl font-bold mb-6">O que blinda reviews 5★</h3>
            <ul className="space-y-3">
              {[
                "Checklist suíte 8 min — fronha, lençol, edredom em sequência",
                "Spray antimofo aplicado no minuto 1 (age sozinho enquanto faz o resto)",
                "Receita desengordurante de cooktop em 30 segundos",
                "5 templates prontos: pré check-in, boas-vindas, problema, review",
                "Inventário semanal — nunca falta nada",
              ].map((d, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-sm" style={{ background: C.surface, border: `1px solid ${C.gold}40` }}>
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.gold }} />
                  <span className="text-sm" style={{ color: C.text }}>{d}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* SUMÁRIO DO SISTEMA */}
      <section className="py-20 sm:py-28 px-4 border-b" style={{ borderColor: C.border, background: C.surface }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="mb-12">
            <div className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.gold }}>O QUE TEM DENTRO</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">10 módulos. Um único PDF.</h2>
            <p className="text-base max-w-2xl" style={{ color: C.muted }}>
              Cada módulo abre em uma página com cabeçalho, tempo estimado e
              checklist marcável. Aberto no celular, riscado item por item.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-2">
            {SUMARIO.map((s, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                className="flex items-center gap-4 p-5 rounded-sm transition-colors hover:border-opacity-70"
                style={{ background: C.bg, border: `1px solid ${C.border}` }}
              >
                <span className="text-2xl font-extrabold tabular-nums" style={{ color: C.gold }}>{s.num}</span>
                <span className="text-sm font-semibold">{s.titulo}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVA — receita de exemplo */}
      <section className="py-20 sm:py-28 px-4 border-b" style={{ borderColor: C.border }}>
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.gold }}>EXEMPLO DE RECEITA EXPRESS</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-8">Anti-mofo de box em 5 minutos</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-sm" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.gold }}>INGREDIENTES</div>
                <ul className="text-sm space-y-1.5" style={{ color: C.text }}>
                  <li>• 100ml água</li>
                  <li>• 100ml vinagre branco</li>
                  <li>• 10 gotas óleo melaleuca</li>
                </ul>
              </div>
              <div className="p-6 rounded-sm" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.gold }}>MODO</div>
                <ol className="text-sm space-y-1.5" style={{ color: C.text }}>
                  <li>1. Borrife paredes do box</li>
                  <li>2. Aguarde 5 min</li>
                  <li>3. Enxágue e seque</li>
                </ol>
              </div>
              <div className="p-6 rounded-sm" style={{ background: C.bg, border: `1px solid ${C.gold}` }}>
                <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: C.gold }}>QUANDO</div>
                <p className="text-sm" style={{ color: C.text }}>Toda saída de hóspede. Reduz 90% do risco de comentário sobre mofo.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TEMPLATE DE COMUNICAÇÃO */}
      <section className="py-20 sm:py-28 px-4 border-b" style={{ borderColor: C.border, background: C.surface }}>
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.gold }}>EXEMPLO DE TEMPLATE</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-8">Mensagem de boas-vindas</h2>
            <div className="p-6 sm:p-8 rounded-sm" style={{ background: C.bg, border: `1px solid ${C.gold}40` }}>
              <div className="flex items-center gap-2 mb-4 pb-4 border-b" style={{ borderColor: C.border }}>
                <MessageSquare className="w-4 h-4" style={{ color: C.gold }} />
                <span className="text-xs uppercase tracking-wider" style={{ color: C.muted }}>WhatsApp · Pré check-in</span>
              </div>
              <p className="text-base italic leading-relaxed" style={{ color: C.text }}>
                "Apartamento liberado! Wi-Fi: <span style={{ color: C.gold }}>{`{wifi}`}</span> /
                senha: <span style={{ color: C.gold }}>{`{senha}`}</span>. Café e açúcar
                estão na bancada. Qualquer coisa, é só chamar por aqui. Boa estadia!"
              </p>
            </div>
            <p className="text-sm mt-4" style={{ color: C.muted }}>
              + 4 templates: pré check-in, check-out, pedido de avaliação e resolução de problema.
            </p>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 sm:py-28 px-4 border-b" style={{ borderColor: C.border }}>
        <div className="max-w-2xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.gold }}>INVESTIMENTO</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Menos que uma diária.</h2>
            <p className="text-base mb-10" style={{ color: C.muted }}>
              Em 1 turnover bem feito você paga o investimento. No próximo, é margem.
            </p>
            <div className="p-8 sm:p-10 rounded-sm" style={{ background: C.surface, border: `2px solid ${C.gold}` }}>
              <Star className="w-10 h-10 mx-auto mb-4" style={{ color: C.gold }} fill={C.gold} />
              <div className="text-sm uppercase tracking-wider mb-2" style={{ color: C.muted }}>De R$ {PRECO_DE} por</div>
              <div className="text-6xl font-extrabold mb-2" style={{ color: C.gold }}>R$ {PRECO_POR}</div>
              <div className="text-sm mb-8" style={{ color: C.muted }}>à vista · PDF imediato</div>

              <button
                onClick={() => handleCheckout("pricing")}
                className="w-full px-8 py-5 rounded-sm font-bold text-base tracking-wider uppercase transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-3"
                style={{ background: C.gold, color: "#000" }}
              >
                QUERO O KIT AGORA <Download className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center gap-2 mt-6 text-xs" style={{ color: C.muted }}>
                <Shield className="w-4 h-4" /> Garantia incondicional de 7 dias
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28 px-4 border-b" style={{ borderColor: C.border, background: C.surface }}>
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp}>
            <div className="text-[10px] uppercase tracking-[0.25em] mb-3 text-center" style={{ color: C.gold }}>FAQ</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-10 text-center">Perguntas frequentes</h2>
            <div className="space-y-3">
              {FAQS.map((f, i) => (
                <div key={i} className="rounded-sm overflow-hidden" style={{ background: C.bg, border: `1px solid ${C.border}` }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-5 flex items-center justify-between text-left"
                  >
                    <span className="font-semibold text-sm sm:text-base">{f.q}</span>
                    <ChevronDown
                      className="w-5 h-5 transition-transform flex-shrink-0 ml-4"
                      style={{ color: C.gold, transform: openFaq === i ? "rotate(180deg)" : "rotate(0)" }}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm" style={{ color: C.muted }}>{f.a}</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 sm:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <Sparkles className="w-12 h-12 mx-auto mb-6" style={{ color: C.gold }} />
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 leading-tight">
              Sua próxima diária<br/>começa em <span style={{ color: C.gold }}>30 minutos</span>.
            </h2>
            <p className="text-base sm:text-lg mb-10 max-w-xl mx-auto" style={{ color: C.muted }}>
              Baixe o kit, abra no celular durante o próximo turnover e sinta a diferença.
              Se não funcionar, devolvemos seu dinheiro em 7 dias.
            </p>
            <button
              onClick={() => handleCheckout("footer")}
              className="px-10 py-5 rounded-sm font-bold text-base tracking-wider uppercase transition-all hover:opacity-90 active:scale-[0.98] inline-flex items-center justify-center gap-3"
              style={{ background: C.gold, color: "#000" }}
            >
              ATIVAR O KIT POR R$ {PRECO_POR} <Download className="w-5 h-5" />
            </button>
            <div className="mt-8 text-xs uppercase tracking-wider" style={{ color: C.muted }}>
              Material de exemplo: <a href={PDF_URL} target="_blank" rel="noopener noreferrer" style={{ color: C.gold, textDecoration: "underline" }}>preview do PDF</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: C.border, background: "#000" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ color: C.muted }}>
          <div>© {new Date().getFullYear()} {PLATFORM_NAME} · Edição Hospitality</div>
          <div className="flex gap-6">
            <a href={SITE_DOMAIN} style={{ color: C.gold }}>{SITE_DOMAIN.replace(/^https?:\/\//, '')}</a>
            <a href="/privacidade">Privacidade</a>
          </div>
        </div>
      </footer>

      {/* Sticky CTA mobile */}
      <div
        className="fixed bottom-0 left-0 right-0 sm:hidden p-3 border-t z-50"
        style={{ background: "#000", borderColor: C.gold }}
      >
        <button
          onClick={() => handleCheckout("sticky")}
          className="w-full py-4 rounded-sm font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2"
          style={{ background: C.gold, color: "#000" }}
        >
          ATIVAR KIT · R$ {PRECO_POR} <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
