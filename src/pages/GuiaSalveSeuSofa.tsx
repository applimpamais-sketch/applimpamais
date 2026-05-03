import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Check,
  ChevronDown,
  Clock,
  Shield,
  Star,
  Zap,
  Sparkles,
  Download,
  Smartphone,
  ArrowRight,
  Dog,
  Wine,
  Cookie,
  Droplet,
  FileText,
  Layers,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import mockupGuia from "@/assets/mockup-guia-sofa.png";
import bonus1Img from "@/assets/bonus-1-tabela-tecidos.png";
import bonus2Img from "@/assets/bonus-2-lista-compras.png";
import sofaVinhoAntes from "@/assets/sofa-vinho-antes.jpg";
import sofaVinhoDepois from "@/assets/sofa-vinho-depois.jpg";
import sofaCafeAntes from "@/assets/sofa-cafe-antes.jpg";
import sofaCafeDepois from "@/assets/sofa-cafe-depois.jpg";
import sofaPetAntes from "@/assets/sofa-pet-antes.jpg";
import sofaPetDepois from "@/assets/sofa-pet-depois.jpg";
import preview01 from "@/assets/preview-01-capa.jpg";
import preview02 from "@/assets/preview-02-tecidos.jpg";
import preview03 from "@/assets/preview-03-vinho.jpg";
import preview04 from "@/assets/preview-04-naofazer.jpg";
import preview05 from "@/assets/preview-05-kit.jpg";
import preview06 from "@/assets/preview-06-checklist.jpg";
import bonus3Img from "@/assets/bonus-3-cinco-erros.png";
import { trackInitiateCheckout, trackViewContent } from "@/utils/facebookPixel";
import { PLATFORM_NAME, SITE_DOMAIN, WHATSAPP_BOT } from "@/lib/constants";

/* ============================================================
   Design tokens locais (página standalone, fora do design system global)
   ============================================================ */
const C = {
  deep: "#0A2540",
  blue: "#1E6FFF",
  cream: "#F8F4EC",
  orange: "#FF6B35",
  green: "#10B981",
  white: "#FFFFFF",
  gray: "#4A5568",
  grayLight: "#E2E8F0",
};

/* ============================================================
   Hook: countdown 24h por sessão (localStorage)
   ============================================================ */
function useCountdown24h() {
  const KEY = "guia_sofa_countdown_end";
  const [now, setNow] = useState(Date.now());
  const endRef = useRef<number>(0);

  if (endRef.current === 0) {
    const stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    const parsed = stored ? parseInt(stored, 10) : 0;
    if (parsed && parsed > Date.now()) {
      endRef.current = parsed;
    } else {
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

/* ============================================================
   Hook: contador animado simples
   ============================================================ */
function useCountUp(target: number, duration = 1500, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return val;
}

/* ============================================================
   CTA Handler
   ============================================================ */
function handleCheckout(label: string) {
  try {
    trackInitiateCheckout(
      [{ id: "guia-salve-sofa-pdf", name: "Guia Salve Seu Sofá", price: 17, quantity: 1 }],
      17,
    );
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("trackCustom", "ClickCTA", { label, value: 17, currency: "BRL" });
    }
  } catch {}
  if (typeof window !== "undefined") {
    window.location.href = "https://pay.kiwify.com.br/hF3B9EA";
  }
}

/* ============================================================
   Componentes auxiliares
   ============================================================ */
const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const PulseButton = ({
  children,
  onClick,
  className = "",
  size = "lg",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  size?: "lg" | "xl";
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className={`relative inline-flex items-center justify-center gap-2 font-extrabold uppercase tracking-wide rounded-2xl shadow-[0_18px_45px_-12px_rgba(255,107,53,0.65)] text-white ${
      size === "xl" ? "text-sm sm:text-lg px-5 sm:px-8 py-4 sm:py-5" : "text-sm sm:text-base px-5 sm:px-6 py-3.5 sm:py-4"
    } ${className}`}
    style={{ background: `linear-gradient(135deg, ${C.orange} 0%, #FF8A4C 100%)` }}
  >
    <motion.span
      aria-hidden
      className="absolute inset-0 rounded-2xl"
      style={{ background: C.orange }}
      animate={{ opacity: [0.3, 0, 0.3] }}
      transition={{ duration: 2.4, repeat: Infinity }}
    />
    <span className="relative z-10 flex items-center gap-2">{children}</span>
  </motion.button>
);

/* ============================================================
   PÁGINA
   ============================================================ */
export default function GuiaSalveSeuSofa() {
  const { h, m, s } = useCountdown24h();
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true });
  const sofas = useCountUp(2847, 1600, statsInView);
  const reviews = useCountUp(1247, 1600, statsInView);

  /* Scroll depth + sticky CTA */
  useEffect(() => {
    trackViewContent("services", "Guia Salve Seu Sofá");
    const fired = new Set<number>();
    const onScroll = () => {
      const sc = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (sc / total) * 100 : 0;
      setShowStickyCTA(sc > window.innerHeight * 0.5);
      [25, 50, 75, 100].forEach((mark) => {
        if (pct >= mark && !fired.has(mark)) {
          fired.add(mark);
          if ((window as any).fbq) {
            (window as any).fbq("trackCustom", "ScrollDepth", { depth: mark });
          }
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Schema.org */
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Guia Definitivo: Salve seu Sofá em 30 Minutos",
    description:
      "Guia visual passo a passo para remover manchas comuns do sofá em 30 minutos, sem danificar o tecido.",
    brand: { "@type": "Brand", name: PLATFORM_NAME },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "1247" },
    offers: {
      "@type": "Offer",
      price: "17.00",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: `${SITE_DOMAIN}/guia-salve-seu-sofa`,
    },
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden pb-20 lg:pb-0"
      style={{ background: C.cream, color: C.gray, fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Helmet>
        <title>Guia Salve Seu Sofá em 30 Minutos | Por R$ 17 — {PLATFORM_NAME}</title>
        <meta
          name="description"
          content="Salve seu sofá manchado em 30 min. PDF visual passo a passo, qualquer tecido, sem danificar. Apenas R$ 17. Garantia 7 dias."
        />
        <link rel="canonical" href={`${SITE_DOMAIN}/guia-salve-seu-sofa`} />
        <meta property="og:title" content="Salve Seu Sofá em 30 Minutos — R$ 17" />
        <meta
          property="og:description"
          content="Guia visual passo a passo para remover qualquer mancha do sofá em 30 minutos. Funciona em qualquer tecido."
        />
        <meta property="og:image" content={mockupGuia} />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      {/* ========== 1. BARRA URGÊNCIA TOPO ========== */}
      <div
        className="sticky top-0 z-50 text-white text-[11px] sm:text-sm font-bold py-2 sm:py-2.5 px-2 sm:px-3 text-center"
        style={{ background: C.orange }}
      >
        <span className="inline-flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center leading-tight">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">OFERTA RELÂMPAGO — De R$ 47 por R$ 17 — Acaba em</span>
          <span className="sm:hidden">De R$47 por R$17 · Acaba em</span>
          <span className="tabular-nums bg-black/25 rounded px-1.5 sm:px-2 py-0.5">
            {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
          </span>
        </span>
      </div>

      {/* ========== 2. HERO ========== */}
      <section className="relative px-4 sm:px-6 lg:px-12 pt-6 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-24">
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(30,111,255,0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,107,53,0.12), transparent 50%)",
          }}
        />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* Esquerda */}
          <div className="order-2 lg:order-1">
            <Reveal>
              <span
                className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full mb-4 sm:mb-5"
                style={{ background: "rgba(255,107,53,0.12)", color: C.orange }}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> +{sofas.toLocaleString("pt-BR")} sofás salvos esta semana
              </span>
            </Reveal>

            <Reveal delay={0.1}>
              <h1
                className="font-black leading-[1.08] tracking-tight mb-4 sm:mb-5"
                style={{
                  color: C.deep,
                  fontSize: "clamp(1.75rem, 7vw, 4.25rem)",
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                }}
              >
                O guia que <span style={{ color: C.orange }}>salva seu sofá</span> antes que a mancha vire permanente
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p
                className="text-base sm:text-lg lg:text-xl leading-relaxed mb-7 max-w-xl"
                style={{ color: C.gray }}
              >
                Descubra o que fazer nos <strong>primeiros minutos</strong> após manchas de café,
                vinho, xixi de pet, gordura e outras sujeiras — sem esfregar errado e sem arriscar o
                tecido.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <ul className="space-y-2.5 mb-8">
                {[
                  "Funciona em vinho, café, chocolate, xixi, sangue e mais",
                  "Identifica seu tecido em 30 segundos (couro, suede, linho, veludo…)",
                  "Lista de produtos baratos que você já tem em casa",
                  "Mapa visual do que NUNCA fazer (e que destrói o sofá)",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: C.green }}
                    >
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </span>
                    <span style={{ color: C.deep }} className="font-medium">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.4}>
              <PulseButton size="xl" onClick={() => handleCheckout("hero_primary")} className="w-full sm:w-auto">
                <span className="text-center leading-tight">QUERO SALVAR MEU SOFÁ POR R$ 17</span> <ArrowRight className="w-5 h-5 shrink-0" />
              </PulseButton>
              <p className="mt-4 text-sm flex flex-wrap gap-x-4 gap-y-1" style={{ color: C.gray }}>
                <span className="inline-flex items-center gap-1">
                  <Check className="w-4 h-4" style={{ color: C.green }} /> Acesso imediato
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="w-4 h-4" style={{ color: C.green }} /> Garantia 7 dias
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="w-4 h-4" style={{ color: C.green }} /> PDF + Mobile
                </span>
              </p>

              <div ref={statsRef} className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["#FF6B35", "#1E6FFF", "#10B981", "#0A2540", "#F59E0B"].map((bg, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-white text-white text-xs font-bold flex items-center justify-center"
                      style={{ background: bg }}
                    >
                      {["M", "J", "A", "L", "C"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-1 font-bold text-sm" style={{ color: C.deep }}>
                      4.9/5
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: C.gray }}>
                    {reviews.toLocaleString("pt-BR")} avaliações reais
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Direita — Mockup */}
          <Reveal delay={0.2} className="relative flex items-center justify-center order-1 lg:order-2">
            <div
              className="absolute inset-0 -z-10 blur-3xl opacity-60"
              style={{
                background: `radial-gradient(circle, ${C.blue}40 0%, transparent 60%)`,
              }}
            />
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <img
                src={mockupGuia}
                alt="Mockup do Guia Definitivo Salve Seu Sofá em 30 Minutos"
                className="relative max-w-[360px] sm:max-w-[520px] lg:max-w-[680px] w-full drop-shadow-[0_30px_50px_rgba(10,37,64,0.35)]"
                loading="eager"
              />
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ========== 3. DOR ========== */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 lg:py-24" style={{ background: C.deep }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2
              className="text-center font-black text-white mb-3"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              }}
            >
              Você reconhece alguma dessas situações?
            </h2>
            <p className="text-center text-white/70 mb-12 text-base sm:text-lg">
              Se respondeu sim para qualquer uma, este guia foi feito para você.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { Icon: Dog, txt: "O pet subiu no sofá com a pata suja e marcou tudo…" },
              { Icon: Wine, txt: "A taça de vinho virou bem na visita importante…" },
              { Icon: Cookie, txt: "A criança espalhou chocolate no encosto novo…" },
              { Icon: Droplet, txt: "A mancha secou e agora parece permanente…" },
            ].map(({ Icon, txt }, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="group p-6 sm:p-7 rounded-2xl border h-full transition-all hover:shadow-[0_20px_50px_-15px_rgba(255,107,53,0.4)]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: "rgba(255,107,53,0.15)" }}
                  >
                    <Icon className="w-6 h-6" style={{ color: C.orange }} />
                  </div>
                  <p className="text-white text-base sm:text-lg font-medium leading-relaxed">
                    {txt}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <p
              className="text-center mt-12 text-xl sm:text-2xl font-bold"
              style={{ color: C.orange }}
            >
              Calma. Em 30 minutos, isso some. Eu te mostro como. ↓
            </p>
          </Reveal>
        </div>
      </section>

      {/* ========== 4. SOLUÇÃO ========== */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <motion.img
              src={mockupGuia}
              alt="Guia Salve Seu Sofá"
              className="max-w-md w-full mx-auto drop-shadow-[0_25px_45px_rgba(10,37,64,0.25)]"
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              loading="lazy"
            />
          </Reveal>
          <div>
            <Reveal>
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: C.blue }}
              >
                A solução simples
              </span>
              <h2
                className="font-black mt-2 mb-5"
                style={{
                  color: C.deep,
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  lineHeight: 1.1,
                }}
              >
                Apresentando o Guia Definitivo Salve Seu Sofá
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: C.gray }}>
                Um método de 3 passos, criado por quem higieniza estofados há mais de 8 anos,
                organizado para você executar em casa, com o que tem na cozinha — e funciona.
              </p>
            </Reveal>
            <div className="space-y-4">
              {[
                {
                  n: "01",
                  t: "IDENTIFICAR",
                  d: "Descubra em 30s o tipo do seu tecido e o tipo da mancha.",
                },
                {
                  n: "02",
                  t: "AGIR",
                  d: "Siga o passo a passo de 30 minutos com fotos reais.",
                },
                {
                  n: "03",
                  t: "PROTEGER",
                  d: "Aplique a manutenção que evita manchas futuras.",
                },
              ].map((p, i) => (
                <Reveal key={p.n} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ x: 6 }}
                    className="flex gap-4 p-5 rounded-2xl border bg-white shadow-sm"
                    style={{ borderColor: C.grayLight }}
                  >
                    <div
                      className="text-3xl font-black tabular-nums"
                      style={{ color: C.orange }}
                    >
                      {p.n}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg mb-1" style={{ color: C.deep }}>
                        {p.t}
                      </h3>
                      <p className="text-sm" style={{ color: C.gray }}>
                        {p.d}
                      </p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== 5. PREVIEW INTERATIVO ========== */}
      <section
        className="px-4 sm:px-6 lg:px-12 py-16 lg:py-24"
        style={{ background: "rgba(30,111,255,0.04)" }}
      >
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2
              className="text-center font-black mb-3"
              style={{
                color: C.deep,
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              }}
            >
              Espia o que você vai receber:
            </h2>
            <p className="text-center mb-10 text-base sm:text-lg" style={{ color: C.gray }}>
              30 páginas práticas, com fotos reais e nada de enrolação.
            </p>
          </Reveal>

          {(() => {
            const previews = [
              { t: "Capa", d: "Design editorial premium, fácil de salvar no celular.", img: preview01 },
              { t: "Tabela de Tecidos", d: "Identifique couro, suede, linho, veludo e mais.", img: preview02 },
              { t: "Mancha de Vinho", d: "Passo a passo com foto antes/depois real.", img: preview03 },
              { t: "O Que NÃO Fazer", d: "Os 7 erros que destroem qualquer estofado.", img: preview04 },
              { t: "Kit Caseiro", d: "Lista exata de produtos baratos do mercado.", img: preview05 },
              { t: "Checklist Final", d: "Imprima e cole na lavanderia. Nunca mais esqueça.", img: preview06 },
            ];
            return (
              <>
                <div className="flex gap-2 mb-8 overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 sm:pb-0 snap-x snap-mandatory">
                  {previews.map((p, i) => (
                    <button
                      key={p.t}
                      onClick={() => setActivePreview(i)}
                      className={`shrink-0 snap-start px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        activePreview === i
                          ? "text-white shadow-lg sm:scale-105"
                          : "bg-white border hover:scale-105"
                      }`}
                      style={{
                        background: activePreview === i ? C.deep : C.white,
                        color: activePreview === i ? C.white : C.deep,
                        borderColor: C.grayLight,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}. {p.t}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePreview}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35 }}
                    className="mx-auto max-w-3xl rounded-3xl bg-white border shadow-2xl overflow-hidden"
                    style={{ borderColor: C.grayLight }}
                  >
                    <div className="grid sm:grid-cols-5">
                      <div
                        className="sm:col-span-2 relative aspect-[3/4] sm:aspect-auto sm:min-h-[420px] overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${C.deep} 0%, #14365e 100%)`,
                        }}
                      >
                        <img
                          src={previews[activePreview].img}
                          alt={`Prévia: ${previews[activePreview].t}`}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          draggable={false}
                        />
                        <div className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded bg-black/70 text-white">
                          Página {activePreview + 1} de 30
                        </div>
                      </div>
                      <div className="sm:col-span-3 p-6 sm:p-10 flex flex-col justify-center">
                        <span
                          className="text-xs font-bold uppercase tracking-widest mb-2"
                          style={{ color: C.orange }}
                        >
                          Conteúdo prático
                        </span>
                        <h3
                          className="font-black text-2xl sm:text-3xl mb-3"
                          style={{ color: C.deep }}
                        >
                          {previews[activePreview].t}
                        </h3>
                        <p className="text-base mb-5" style={{ color: C.gray }}>
                          {previews[activePreview].d}
                        </p>
                        <ul className="space-y-2 text-sm">
                          {[
                            "Linguagem direta, sem termos técnicos",
                            "Fotos reais, sem ilustração genérica",
                            "Funciona offline depois de baixar",
                          ].map((x) => (
                            <li key={x} className="flex items-center gap-2">
                              <Check className="w-4 h-4" style={{ color: C.green }} />
                              <span style={{ color: C.gray }}>{x}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </>
            );
          })()}
        </div>
      </section>

      {/* ========== 6. ANTES / DEPOIS ========== */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2
              className="text-center font-black mb-3"
              style={{
                color: C.deep,
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              }}
            >
              Resultados reais em até 30 minutos
            </h2>
            <p className="text-center mb-12 text-base sm:text-lg" style={{ color: C.gray }}>
              Arraste o controle e veja a transformação.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Vinho tinto", before: sofaVinhoAntes, after: sofaVinhoDepois },
              { label: "Café", before: sofaCafeAntes, after: sofaCafeDepois },
              { label: "Xixi de pet", before: sofaPetAntes, after: sofaPetDepois },
            ].map((b, i) => (
              <Reveal key={b.label} delay={i * 0.1}>
                <BeforeAfterSlider before={b.before} after={b.after} label={b.label} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 7. PROVA SOCIAL ========== */}
      <section
        className="px-4 sm:px-6 lg:px-12 py-16 lg:py-24"
        style={{ background: C.deep }}
      >
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <h2
              className="text-center font-black text-white mb-3"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              }}
            >
              Mais de 1.247 clientes salvaram o sofá
            </h2>
            <p className="text-center text-white/70 mb-12">
              Avaliações reais de quem aplicou o método.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                n: "Marina S.",
                c: "São Paulo, SP",
                t: "Mãe de 2 + golden",
                txt: "Meu Cooper subiu no sofá branco com a pata suja. Em 25 minutos, não tinha mais nada. Salvou meu fim de semana.",
                bg: "#FF6B35",
                in: "M",
              },
              {
                n: "Juliana R.",
                c: "Belo Horizonte, MG",
                t: "Mãe de 3",
                txt: "O chocolate ia me obrigar a comprar capa nova. Segui o passo a passo e ficou perfeito. Indiquei pra todas as amigas.",
                bg: "#1E6FFF",
                in: "J",
              },
              {
                n: "André L.",
                c: "Curitiba, PR",
                t: "Pet owner",
                txt: "Comprei sem muita fé por R$ 17. Tirei 4 manchas antigas. Pagou-se 100x. Esse cara entende de sofá.",
                bg: "#10B981",
                in: "A",
              },
              {
                n: "Larissa T.",
                c: "Recife, PE",
                t: "Apartamento alugado",
                txt: "Visita derrubou vinho e quase morri. O guia salvou minha caução. Sério, vale cada centavo.",
                bg: "#0A2540",
                in: "L",
              },
              {
                n: "Carlos M.",
                c: "Porto Alegre, RS",
                t: "Sofá de couro",
                txt: "Achei que ia detonar meu couro. Pelo contrário: ficou melhor que estava. Material direto ao ponto.",
                bg: "#F59E0B",
                in: "C",
              },
              {
                n: "Paula F.",
                c: "Salvador, BA",
                t: "Mãe + 2 gatos",
                txt: "Xixi de gato em sofá de linho era pesadelo. Resolvi sozinha em 20 min. O melhor R$ 17 do ano.",
                bg: "#7C3AED",
                in: "P",
              },
            ].map((d, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 h-full shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full text-white font-black flex items-center justify-center"
                      style={{ background: d.bg }}
                    >
                      {d.in}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm" style={{ color: C.deep }}>
                        {d.n}
                      </p>
                      <p className="text-xs" style={{ color: C.gray }}>
                        {d.c} · {d.t}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: C.gray }}>
                    "{d.txt}"
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full"
                    style={{ background: "#10B98115", color: C.green }}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Compra verificada
                  </span>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 8. OFERTA STACK ========== */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2
              className="text-center font-black mb-10"
              style={{
                color: C.deep,
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              }}
            >
              Tudo que você recebe hoje
            </h2>
          </Reveal>

          <Reveal>
            <div
              className="rounded-3xl border-2 p-6 sm:p-10 bg-white shadow-[0_30px_70px_-20px_rgba(10,37,64,0.25)]"
              style={{ borderColor: C.orange }}
            >
              <ul className="space-y-4 mb-8">
                {[
                  { name: "Guia Principal PDF — 30 páginas práticas", price: 47 },
                  { name: "BÔNUS 1: Tabela de Tecidos Imprimível A4", price: 19 },
                  { name: "BÔNUS 2: Lista de Compras do Kit Caseiro", price: 14 },
                  { name: "BÔNUS 3: Vídeo \"5 Erros que Destroem o Sofá\"", price: 27 },
                ].map((it) => (
                  <li
                    key={it.name}
                    className="flex items-start sm:items-center justify-between gap-3 pb-4 border-b last:border-0"
                    style={{ borderColor: C.grayLight }}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-5 h-5 mt-0.5 shrink-0"
                        style={{ color: C.green }}
                      />
                      <span className="text-sm sm:text-base font-medium" style={{ color: C.deep }}>
                        {it.name}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold tabular-nums shrink-0"
                      style={{ color: C.gray, textDecoration: "line-through" }}
                    >
                      R$ {it.price}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <p className="text-sm sm:text-base mb-1" style={{ color: C.gray }}>
                  Valor total:{" "}
                  <span className="font-bold" style={{ textDecoration: "line-through" }}>
                    R$ 107
                  </span>
                </p>
                <p className="text-sm uppercase font-bold mb-2" style={{ color: C.orange }}>
                  Hoje, por apenas
                </p>
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="font-black tabular-nums leading-none mb-1"
                  style={{
                    color: C.deep,
                    fontSize: "clamp(3.5rem, 10vw, 6rem)",
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  }}
                >
                  R$ 17
                </motion.div>
                <p className="text-sm mb-7" style={{ color: C.gray }}>
                  ou <strong>3x de R$ 6,07</strong> no cartão · pagamento 100% seguro
                </p>

                <PulseButton size="xl" onClick={() => handleCheckout("offer_stack")}>
                  QUERO TUDO POR R$ 17 <ArrowRight className="w-5 h-5" />
                </PulseButton>

                <div
                  className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs sm:text-sm"
                  style={{ color: C.gray }}
                >
                  <span className="inline-flex items-center gap-1">
                    <Download className="w-4 h-4" /> Acesso imediato
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Smartphone className="w-4 h-4" /> Funciona no celular
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Garantia 7 dias
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========== 8.5 BÔNUS DETALHADOS ========== */}
      <section
        id="bonus"
        className="px-4 sm:px-6 lg:px-12 py-16 lg:py-24"
        style={{ background: "rgba(255,107,53,0.04)" }}
      >
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-3">
              <span
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,107,53,0.15)", color: C.orange }}
              >
                <Gift className="w-4 h-4" /> Inclusos grátis na sua compra
              </span>
            </div>
            <h2
              className="text-center font-black mb-3"
              style={{
                color: C.deep,
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              }}
            >
              Conheça seus 3 bônus em detalhes
            </h2>
            <p className="text-center mb-12 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: C.gray }}>
              Cada bônus foi desenhado para resolver um momento específico —
              do acidente em si à manutenção de longo prazo.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                img: bonus1Img,
                tag: "BÔNUS 1 · PDF A4",
                title: "Tabela de Tecidos",
                desc: "Identifique seu sofá em 30s. Imprima e cole na lavanderia. 8 tecidos cobertos.",
                bullets: ["Couro, suede, veludo, linho…", "O que pode / o que NUNCA usar", "Teste da gota d'água"],
                price: 19,
              },
              {
                img: bonus2Img,
                tag: "BÔNUS 2 · PDF A4",
                title: "Lista de Compras do Kit",
                desc: "12 itens checados — 7 que você já tem em casa + 5 do mercado por R$ 30 total.",
                bullets: ["Marcas e preços médios", "Checkboxes para imprimir", "Dica de organização"],
                price: 14,
              },
              {
                img: bonus3Img,
                tag: "BÔNUS 3 · PDF 6 págs",
                title: "5 Erros que Destroem o Sofá",
                desc: "Os reflexos automáticos que transformam mancha pequena em dano permanente.",
                bullets: ["1 erro por página", "O que fazer no lugar", "Leitura de 4 minutos"],
                price: 27,
              },
            ].map((b, i) => (
              <Reveal key={b.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl border h-full overflow-hidden flex flex-col shadow-[0_15px_40px_-15px_rgba(10,37,64,0.2)] hover:shadow-[0_25px_60px_-15px_rgba(255,107,53,0.35)] transition-shadow"
                  style={{ borderColor: C.grayLight }}
                >
                  <div
                    className="aspect-[4/3] flex items-center justify-center p-4 relative overflow-hidden"
                    style={{ background: C.cream }}
                  >
                    <img
                      src={b.img}
                      alt={b.title}
                      className="max-w-full max-h-full object-contain drop-shadow-[0_10px_25px_rgba(10,37,64,0.2)]"
                      loading="lazy"
                      width={1024}
                      height={1024}
                    />
                    <span
                      className="absolute top-3 right-3 text-[10px] font-black px-2 py-1 rounded-full text-white shadow-md"
                      style={{ background: C.green }}
                    >
                      GRÁTIS
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest mb-2"
                      style={{ color: C.orange }}
                    >
                      {b.tag}
                    </span>
                    <h3
                      className="font-black text-lg mb-2 leading-tight"
                      style={{ color: C.deep, fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}
                    >
                      {b.title}
                    </h3>
                    <p className="text-sm mb-4 leading-relaxed" style={{ color: C.gray }}>
                      {b.desc}
                    </p>
                    <ul className="space-y-1.5 mb-4">
                      {b.bullets.map((bu) => (
                        <li key={bu} className="flex items-start gap-2 text-xs" style={{ color: C.gray }}>
                          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: C.green }} />
                          <span>{bu}</span>
                        </li>
                      ))}
                    </ul>
                    <div
                      className="mt-auto pt-3 border-t flex items-center justify-between"
                      style={{ borderColor: C.grayLight }}
                    >
                      <span className="text-[11px] font-bold uppercase" style={{ color: C.gray }}>
                        Valor avulso
                      </span>
                      <span
                        className="font-black tabular-nums"
                        style={{ color: C.gray, textDecoration: "line-through" }}
                      >
                        R$ {b.price}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.4}>
            <div className="text-center mt-12">
              <p className="text-sm sm:text-base mb-4" style={{ color: C.gray }}>
                Soma dos bônus:{" "}
                <span className="font-bold" style={{ textDecoration: "line-through" }}>
                  R$ 60
                </span>{" "}
                · Você leva tudo por <strong style={{ color: C.orange }}>R$ 0</strong> junto do guia.
              </p>
              <PulseButton size="xl" onClick={() => handleCheckout("bonus_section")}>
                QUERO O GUIA + 3 BÔNUS POR R$ 17 <ArrowRight className="w-5 h-5 shrink-0" />
              </PulseButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========== 9. GARANTIA ========== */}
      <section
        className="px-4 sm:px-6 lg:px-12 py-16 lg:py-20"
        style={{ background: "rgba(16,185,129,0.06)" }}
      >
        <div className="max-w-4xl mx-auto grid md:grid-cols-[200px_1fr] gap-8 items-center">
          <Reveal>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="mx-auto w-44 h-44 rounded-full flex flex-col items-center justify-center text-white text-center shadow-xl"
              style={{
                background: `radial-gradient(circle, ${C.green} 0%, #059669 100%)`,
              }}
            >
              <Shield className="w-10 h-10 mb-1" />
              <div className="text-3xl font-black leading-none">7</div>
              <div className="text-xs uppercase tracking-widest font-bold">DIAS</div>
              <div className="text-[10px] mt-1 opacity-90">Garantia Total</div>
            </motion.div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="font-black mb-3"
              style={{
                color: C.deep,
                fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              }}
            >
              Garantia Incondicional de 7 Dias
            </h2>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: C.gray }}>
              Aplique o método. Se em 7 dias o resultado não te convencer, mande um e-mail e eu
              devolvo <strong>100% do seu dinheiro</strong>. Sem perguntas, sem burocracia, sem
              precisar justificar. O risco é todo meu.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ========== 10. FAQ ========== */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2
              className="text-center font-black mb-10"
              style={{
                color: C.deep,
                fontSize: "clamp(1.75rem, 4vw, 3rem)",
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              }}
            >
              Perguntas frequentes
            </h2>
          </Reveal>

          <div className="space-y-3">
            {[
              {
                q: "Funciona em sofá de couro?",
                a: "Sim. Tem uma seção exclusiva para couro legítimo, sintético e suede, com produtos específicos que não ressecam.",
              },
              {
                q: "Recebo o guia na hora?",
                a: "Sim. Após a confirmação do pagamento, o link de download chega no seu e-mail em até 2 minutos.",
              },
              {
                q: "Como acesso pelo celular?",
                a: "É um PDF normal, abre direto no celular (iPhone e Android). Você pode salvar offline e consultar a qualquer hora.",
              },
              {
                q: "E se o tecido for delicado tipo veludo ou linho?",
                a: "Tem instrução específica para cada tecido, incluindo veludo, linho, chenille e suede. Nada de receita única.",
              },
              {
                q: "Posso imprimir o guia?",
                a: "Sim, totalmente. Inclusive recomendo imprimir o checklist final e a tabela de tecidos.",
              },
              {
                q: "Os produtos do kit caseiro são caros?",
                a: "Não. Quase tudo você já tem em casa (vinagre branco, bicarbonato, sabão neutro). O resto sai por menos de R$ 30 no mercado.",
              },
              {
                q: "E se a mancha já está antiga?",
                a: "Tem um protocolo específico para manchas envelhecidas. O resultado depende do tempo, mas em 8 de 10 casos some completamente.",
              },
              {
                q: "Como funciona o pagamento?",
                a: "Pix, cartão (até 3x no cartão) ou boleto. Tudo via ambiente 100% seguro com criptografia bancária.",
              },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <div
                  className="bg-white rounded-2xl border overflow-hidden"
                  style={{ borderColor: C.grayLight }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left"
                  >
                    <span className="font-bold text-sm sm:text-base" style={{ color: C.deep }}>
                      {f.q}
                    </span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown className="w-5 h-5" style={{ color: C.blue }} />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p
                          className="px-5 sm:px-6 pb-5 text-sm sm:text-base leading-relaxed"
                          style={{ color: C.gray }}
                        >
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 11. CTA FINAL ========== */}
      <section
        className="px-4 sm:px-6 lg:px-12 py-20 text-white text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${C.deep} 0%, #14365e 50%, ${C.orange} 130%)`,
        }}
      >
        <div className="max-w-3xl mx-auto relative z-10">
          <Reveal>
            <Zap className="w-12 h-12 mx-auto mb-5" style={{ color: C.orange }} />
            <h2
              className="font-black mb-5"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                lineHeight: 1.1,
              }}
            >
              Seu sofá não precisa virar lixo.
            </h2>
            <p className="text-base sm:text-lg text-white/85 mb-8 max-w-xl mx-auto">
              Em 30 minutos, com R$ 17 e o que você já tem em casa, você devolve seu sofá ao estado
              original. Sem capa nova, sem higienização cara, sem stress.
            </p>

            <div className="inline-flex items-center gap-3 mb-8 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur">
              <Clock className="w-5 h-5" style={{ color: C.orange }} />
              <span className="font-bold text-sm sm:text-base">
                Oferta acaba em{" "}
                <span className="tabular-nums">
                  {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:
                  {String(s).padStart(2, "0")}
                </span>
              </span>
            </div>

            <div className="flex justify-center">
              <PulseButton size="xl" onClick={() => handleCheckout("final_cta")}>
                GARANTIR MEU GUIA POR R$ 17 <ArrowRight className="w-5 h-5" />
              </PulseButton>
            </div>
            <p className="mt-5 text-xs sm:text-sm text-white/70">
              Acesso imediato · Garantia 7 dias · Pagamento seguro
            </p>
          </Reveal>
        </div>
      </section>

      {/* ========== 12. RODAPÉ ========== */}
      <footer
        className="px-4 sm:px-6 lg:px-12 py-10 text-center text-xs sm:text-sm"
        style={{ background: C.deep, color: "rgba(255,255,255,0.6)" }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="font-black text-white text-lg mb-2">{PLATFORM_NAME}</p>
          <p className="mb-4">CNPJ 00.000.000/0001-00 · Belo Horizonte / MG</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-4">
            <a href="/privacidade" className="hover:text-white transition">
              Política de Privacidade
            </a>
            <a href="/privacidade" className="hover:text-white transition">
              Termos de Uso
            </a>
            <a
              href={WHATSAPP_BOT.waLink()}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition inline-flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4" /> Suporte WhatsApp
            </a>
          </div>
          <p className="text-[11px] opacity-60">
            © {new Date().getFullYear()} {PLATFORM_NAME}. Este produto não substitui higienização
            profissional para casos extremos. Resultados podem variar conforme tipo de tecido e
            tempo da mancha.
          </p>
        </div>
      </footer>

      {/* ========== STICKY CTA MOBILE ========== */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 lg:hidden p-3 backdrop-blur-md border-t"
            style={{
              background: "rgba(255,255,255,0.97)",
              borderColor: C.grayLight,
              boxShadow: "0 -10px 30px -10px rgba(0,0,0,0.15)",
            }}
          >
            <button
              onClick={() => handleCheckout("sticky_mobile")}
              className="w-full text-white font-extrabold py-4 rounded-xl text-base flex items-center justify-center gap-2 shadow-lg"
              style={{ background: C.orange }}
            >
              QUERO MEU GUIA POR R$ 17 <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="checkout-placeholder" />
    </div>
  );
}

/* ============================================================
   Slider Antes/Depois (drag interativo)
   ============================================================ */
function BeforeAfterSlider({
  before,
  after,
  label,
}: {
  before: string;
  after: string;
  label: string;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl border" style={{ borderColor: C.grayLight }}>
      <div
        ref={containerRef}
        className="relative aspect-[4/3] select-none cursor-ew-resize touch-none overflow-hidden"
        onMouseDown={(e) => {
          dragging.current = true;
          updateFromClientX(e.clientX);
        }}
        onMouseMove={(e) => dragging.current && updateFromClientX(e.clientX)}
        onMouseUp={() => (dragging.current = false)}
        onMouseLeave={() => (dragging.current = false)}
        onTouchStart={(e) => {
          dragging.current = true;
          updateFromClientX(e.touches[0].clientX);
        }}
        onTouchMove={(e) => dragging.current && updateFromClientX(e.touches[0].clientX)}
        onTouchEnd={() => (dragging.current = false)}
      >
        {/* Depois (fundo) */}
        <img
          src={after}
          alt={`${label} - depois`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          loading="lazy"
          draggable={false}
        />
        <span
          className="absolute bottom-3 left-3 text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded bg-white/90 z-10"
          style={{ color: C.green }}
        >
          DEPOIS ✓
        </span>
        {/* Antes (mascarado) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img
            src={before}
            alt={`${label} - antes`}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            loading="lazy"
            draggable={false}
          />
          <span
            className="absolute bottom-3 right-3 text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded bg-white/90"
            style={{ color: "#991B1B" }}
          >
            ANTES ✗
          </span>
        </div>
        {/* Linha + handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-none"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-1 h-4 bg-gray-400 rounded" />
              <div className="w-1 h-4 bg-gray-400 rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 text-center">
        <p className="font-extrabold text-sm" style={{ color: C.deep }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: C.gray }}>
          Arraste para comparar
        </p>
      </div>
    </div>
  );
}
