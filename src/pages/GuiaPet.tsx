import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Check, Clock, Shield, Sparkles, Download, ShoppingBag,
  CheckCircle2, XCircle, Gift, FlaskConical, Leaf, PawPrint, AlertTriangle,
  Wind, Home,
} from "lucide-react";
import capaGuiaPet from "@/assets/guia-pet-capa.jpg";
import antesDepoisPet from "@/assets/guia-pet-antes-depois.jpg";
import previewReceitas from "@/assets/guia-pet-preview-receitas.jpg";
import previewManchas from "@/assets/guia-pet-preview-manchas.jpg";
import previewCronograma from "@/assets/guia-pet-preview-cronograma.jpg";
import { trackInitiateCheckout, trackViewContent } from "@/utils/facebookPixel";
import { PLATFORM_NAME, SITE_DOMAIN } from "@/lib/constants";

const C = {
  navy: "#2F3C7E",
  coral: "#F96167",
  gold: "#F2A65A",
  cream: "#FFF6F1",
  dark: "#1A1A2E",
  soft: "#5C5C70",
  light: "#F2F2F7",
};

const PDF_URL = "/materiais/guia-pet.pdf";
const CHECKOUT_URL = "#checkout"; // TODO: substituir pelo link Kiwify quando disponível
const PRECO_DE = 47;
const PRECO_POR = 17;

function useCountdown24h() {
  const KEY = "guia_pet_end";
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
      [{ id: "guia-pet-pdf", name: "Guia Pet — Higienização da Casa com Pet", price: PRECO_POR, quantity: 1 }],
      PRECO_POR,
    );
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("trackCustom", "GuiaPetCheckoutClick", { source: label });
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

const previews = [
  { t: "Capa", d: "Design editorial, abre no celular e imprime fácil.", img: capaGuiaPet },
  { t: "Receitas Anti-Cheiro", d: "8 receitas seguras pra cães e gatos.", img: previewReceitas },
  { t: "Manchas por Tecido", d: "Protocolo de xixi e vômito por tipo de tecido.", img: previewManchas },
  { t: "Cronograma + Compras", d: "Lista de produtos com preço e rotina semanal.", img: previewCronograma },
];

export default function GuiaPet() {
  const { h, m, s } = useCountdown24h();
  const [activePreview, setActivePreview] = useState(0);
  useEffect(() => {
    trackViewContent("services", "Guia Pet - Higienização da Casa com Cachorro e Gato");
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ background: C.cream, color: C.dark, fontFamily: "Inter, system-ui, sans-serif" }}>
      <Helmet>
        <title>Guia Pet — Higienização da Casa com Cachorro e Gato | {PLATFORM_NAME}</title>
        <meta name="description" content="Tenha pet sem ter casa que cheira a pet. PDF prático com produtos seguros, 8 receitas anti-cheiro, técnicas de remoção de pelo e protocolo de xixi/vômito por tecido. R$ 17." />
        <link rel="canonical" href={`${SITE_DOMAIN}/guia-pet`} />
        <meta property="og:title" content={`Guia Pet — Higienização da Casa com Pet | ${PLATFORM_NAME}`} />
        <meta property="og:description" content="O guia completo de higienização para quem ama animal. PDF imediato por R$ 17." />
        <meta property="og:type" content="product" />
      </Helmet>

      {/* Top bar urgência */}
      <div style={{ background: C.dark, color: "white" }} className="py-2 px-4 text-center text-xs sm:text-sm flex items-center justify-center gap-2 flex-wrap">
        <Clock className="w-4 h-4" style={{ color: C.gold }} />
        <span>Oferta de lançamento expira em</span>
        <span className="font-mono font-bold tracking-wider" style={{ color: C.gold }}>
          {pad(h)}:{pad(m)}:{pad(s)}
        </span>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1c2658 100%)` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 grid md:grid-cols-2 gap-10 items-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
              style={{ background: "rgba(249,97,103,0.18)", color: C.coral, border: `1px solid ${C.coral}55` }}>
              <PawPrint className="w-3.5 h-3.5" /> NOVO • Edição Pet (Cães & Gatos)
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] mb-5" style={{ color: "white" }}>
              Tenha pet <span style={{ color: C.coral }}>sem ter casa</span> que cheira a pet.
            </h1>
            <p className="text-base sm:text-lg mb-6" style={{ color: "#CBD2EE" }}>
              Pelo no sofá, cheiro de cachorro molhado, marcação de gato, mancha de xixi… <b>Todos os produtos
              que você usa hoje ou são tóxicos pro seu pet ou simplesmente não funcionam.</b> Aqui tem o passo a passo testado.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-7">
              <span className="line-through text-lg" style={{ color: "#9aa0c5" }}>R$ {PRECO_DE}</span>
              <span className="text-4xl sm:text-5xl font-extrabold" style={{ color: C.gold }}>R$ {PRECO_POR}</span>
              <span className="text-sm" style={{ color: "#CBD2EE" }}>à vista, PDF imediato</span>
            </div>

            <button
              onClick={() => handleCheckout("hero")}
              className="w-full sm:w-auto px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              style={{ background: C.coral, color: "white" }}
            >
              QUERO O GUIA PET <Download className="w-5 h-5" />
            </button>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-sm" style={{ color: "#CBD2EE" }}>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" style={{ color: C.gold }} /> Compra segura</span>
              <span className="flex items-center gap-1.5"><Download className="w-4 h-4" style={{ color: C.gold }} /> Acesso imediato</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4" style={{ color: C.gold }} /> Garantia 7 dias</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as any }}
            className="flex justify-center"
          >
            <img
              src={capaGuiaPet}
              alt="Capa do Guia Pet — Higienização da casa com cachorro e gato"
              width={520}
              height={693}
              className="w-full max-w-sm rounded-xl drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* DOR */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp}>
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{ background: `${C.coral}1f`, color: C.coral }}>VOCÊ JÁ PASSOU POR ISSO?</span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: C.navy }}>
                Visita chega em casa e a primeira coisa que sente é o cheiro do seu pet?
              </h2>
              <p className="text-lg" style={{ color: C.soft }}>
                Você ama seu animal — mas não dá mais pra fingir que está tudo bem.
                Não é falta de carinho. É <b>falta do método certo</b>.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Pelo grudado no sofá que aspirador não tira",
                "Cheiro de cachorro molhado que dura 3 dias",
                "Mancha de xixi que voltou mesmo depois de limpar",
                "Marcação de gato que sempre volta no mesmo lugar",
                "Vergonha quando alguém se senta no seu sofá",
                "Medo de usar produto e fazer mal pro pet",
              ].map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white border" style={{ borderColor: C.light }}>
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.coral }} />
                  <span style={{ color: C.dark }}>{d}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ANTES / DEPOIS */}
      <section className="py-12 sm:py-16 px-4" style={{ background: "white" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: `${C.gold}22`, color: C.gold }}>RESULTADO REAL</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: C.navy }}>
              Mesmo sofá, mesmo pet — antes e depois do método
            </h2>
          </motion.div>
          <motion.img {...fadeUp}
            src={antesDepoisPet}
            alt="Sofá com pelo de pet (antes) e sofá limpo (depois)"
            width={1280}
            height={768}
            loading="lazy"
            className="w-full rounded-2xl shadow-xl"
          />
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: `${C.navy}14`, color: C.navy }}>O QUE VEM DENTRO</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: C.navy }}>
              Um guia de 25 páginas, 100% prático, 100% seguro pra pet
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: C.soft }}>
              Do produto que você pode usar (e o que JAMAIS pode), passando por receitas anti-cheiro,
              remoção de pelo e protocolo de mancha por tecido. Tudo testado em casas reais.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: 8, t: "Produtos Seguros", c: C.coral, d: "Pra cães e gatos" },
              { n: 6, t: "Produtos Proibidos", c: C.dark, d: "Que você precisa tirar de casa" },
              { n: 8, t: "Receitas Anti-Cheiro", c: C.navy, d: "Caseiras, baratas, eficazes" },
              { n: 6, t: "Técnicas Remoção Pelo", c: C.gold, d: "O que aspirador não faz" },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp}
                className="p-6 rounded-2xl border-2 bg-white shadow-sm"
                style={{ borderColor: `${item.c}33` }}
              >
                <div className="text-5xl font-extrabold mb-2" style={{ color: item.c }}>{item.n}</div>
                <div className="font-bold text-lg" style={{ color: C.navy }}>{item.t}</div>
                <div className="text-sm mt-1" style={{ color: C.soft }}>{item.d}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PREVIEW INTERATIVO */}
      <section className="py-16 sm:py-24 px-4" style={{ background: "white" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: C.navy }}>
              Veja por dentro do guia
            </h2>
            <p className="text-lg" style={{ color: C.soft }}>4 das 25 páginas — clique para visualizar</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-3">
              {previews.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePreview(i)}
                  className="w-full text-left p-4 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: activePreview === i ? C.coral : C.light,
                    background: activePreview === i ? `${C.coral}08` : "white",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0"
                      style={{ background: activePreview === i ? C.coral : C.light, color: activePreview === i ? "white" : C.soft }}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: C.navy }}>{p.t}</div>
                      <div className="text-sm" style={{ color: C.soft }}>{p.d}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <motion.div
              key={activePreview}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2"
              style={{ borderColor: C.light }}
            >
              <img
                src={previews[activePreview].img}
                alt={`Prévia: ${previews[activePreview].t}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                style={{ background: "rgba(47,60,126,0.85)", color: "white" }}>
                Página {activePreview === 0 ? 1 : (activePreview === 1 ? 7 : (activePreview === 2 ? 13 : 16))} de 25
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* O QUE VOCÊ APRENDE */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: C.navy }}>
              O método da {PLATFORM_NAME} — agora na sua mão
            </h2>
            <p className="text-lg" style={{ color: C.soft }}>
              Anos de experiência higienizando estofados de quem ama pet, condensados em um PDF
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: Shield, t: "Lista de produtos PROIBIDOS", d: "6 produtos comuns (até alguns vendidos como 'pet friendly') que são tóxicos pra cão e gato." },
              { icon: FlaskConical, t: "8 receitas anti-cheiro caseiras", d: "Spray neutralizador de sofá, pó pra tapete, eliminador de cheiro de cachorro molhado e mais." },
              { icon: Wind, t: "Protocolo de xixi por tecido", d: "Suede, linho, couro, courino, veludo — cada um com tratamento específico." },
              { icon: PawPrint, t: "6 técnicas de remoção de pelo", d: "Luva de borracha, balão estático, bucha verde — o que aspirador comum não faz." },
              { icon: ShoppingBag, t: "Lista de compras com preços", d: "12 itens com link de onde comprar e custo médio. Monta seu kit completo por menos de R$ 100." },
              { icon: Home, t: "Cronograma + checklist visitas", d: "O que fazer todo dia, semana, mês — e o checklist de 12 itens pra fazer 2h antes de receber visita." },
            ].map((it, i) => (
              <motion.div key={i} {...fadeUp}
                className="p-6 rounded-2xl bg-white border flex gap-4"
                style={{ borderColor: C.light }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${C.coral}15` }}>
                  <it.icon className="w-6 h-6" style={{ color: C.coral }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1" style={{ color: C.navy }}>{it.t}</h3>
                  <p style={{ color: C.soft }}>{it.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BÔNUS */}
      <section className="py-16 sm:py-24 px-4" style={{ background: C.navy, color: "white" }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <Gift className="w-12 h-12 mx-auto mb-4" style={{ color: C.gold }} />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">+ 3 bônus inclusos</h2>
            <p className="text-lg mb-10" style={{ color: "#CBD2EE" }}>
              Que sozinhos valem o triplo do preço do guia
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { t: "Checklist 2h Antes da Visita", d: "12 itens objetivos pra casa não cheirar a pet quando alguém chegar." },
              { t: "Lista de Produtos no Mercado Livre", d: "Links diretos pra cada item da lista de compras (sem comissão, só praticidade)." },
              { t: "7 Erros Que Pioram o Cheiro", d: "Coisas que parecem certo, mas estão sabotando seu esforço todo dia." },
            ].map((b, i) => (
              <motion.div key={i} {...fadeUp}
                className="p-6 rounded-2xl text-left"
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.12)` }}
              >
                <div className="text-xs font-bold mb-2" style={{ color: C.gold }}>BÔNUS {i + 1}</div>
                <h3 className="font-bold text-lg mb-1">{b.t}</h3>
                <p className="text-sm" style={{ color: "#CBD2EE" }}>{b.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OFERTA / CTA */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp}
            className="rounded-3xl p-8 sm:p-12 text-center shadow-2xl"
            style={{ background: "white", border: `2px solid ${C.coral}` }}
          >
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5"
              style={{ background: `${C.coral}15`, color: C.coral }}>OFERTA DE LANÇAMENTO</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: C.navy }}>
              Tudo que você leva hoje
            </h2>

            <div className="text-left max-w-md mx-auto space-y-3 mb-8">
              {[
                "Guia Pet em PDF (25 páginas)",
                "8 receitas anti-cheiro testadas",
                "Protocolo de xixi por tipo de tecido",
                "Lista de compras + cronograma",
                "Checklist 2h antes da visita",
                "3 bônus exclusivos",
                "Garantia incondicional de 7 dias",
              ].map((it, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: C.coral }} />
                  <span style={{ color: C.dark }}>{it}</span>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="text-sm mb-1" style={{ color: C.soft }}>de R$ {PRECO_DE} por apenas</div>
              <div className="text-6xl sm:text-7xl font-extrabold" style={{ color: C.coral }}>
                R$ {PRECO_POR}
              </div>
              <div className="text-sm mt-1" style={{ color: C.soft }}>pagamento único, acesso imediato</div>
            </div>

            <button
              onClick={() => handleCheckout("oferta-final")}
              className="w-full px-8 py-5 rounded-2xl font-bold text-lg shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              style={{ background: C.coral, color: "white" }}
            >
              QUERO O GUIA PET <Download className="w-5 h-5" />
            </button>

            <div className="mt-5 text-xs flex items-center justify-center gap-4 flex-wrap" style={{ color: C.soft }}>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Compra 100% segura</span>
              <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> PDF entregue no e-mail</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="py-12 px-4" style={{ background: C.cream }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}
            className="p-8 rounded-2xl bg-white border"
            style={{ borderColor: C.light }}
          >
            <Shield className="w-14 h-14 mx-auto mb-4" style={{ color: C.gold }} />
            <h3 className="text-2xl font-bold mb-3" style={{ color: C.navy }}>Garantia incondicional de 7 dias</h3>
            <p style={{ color: C.soft }}>
              Se em 7 dias você achar que o conteúdo não vale o que pagou, devolvemos 100%
              do seu dinheiro. Sem perguntas. É só responder o e-mail de boas-vindas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h2 {...fadeUp} className="text-3xl sm:text-4xl font-bold mb-10 text-center" style={{ color: C.navy }}>
            Perguntas frequentes
          </motion.h2>
          <div className="space-y-3">
            {[
              { q: "É realmente seguro pra cachorro e gato?", a: "Sim. Todas as receitas usam apenas produtos com segurança comprovada para ambas as espécies. O guia tem uma seção inteira só de produtos PROIBIDOS — incluindo óleos essenciais que muita gente acha que pode usar (tea tree e eucalipto são tóxicos pra gato)." },
              { q: "Funciona pra qualquer raça e tipo de pelo?", a: "Sim. As técnicas funcionam tanto pra pelo curto (vira-lata, dálmata, gato siamês) quanto pra pelo longo (golden, persa, husky). O guia explica como adaptar a frequência por tipo." },
              { q: "Quanto custa montar o kit completo?", a: "Entre R$ 80 e R$ 130, dependendo de onde você compra. A maioria são produtos de mercado (vinagre, bicarbonato, sabão neutro). O único item que pode pesar é o aspirador com bocal pet — mas tem opção a partir de R$ 200." },
              { q: "Em quanto tempo vejo resultado?", a: "O cheiro melhora drasticamente em 3-5 dias seguindo a rotina diária. O sofá fica sem pelo enraizado em 2-3 sessões. Manchas antigas saem 70-90% (manchas de meses são mais resistentes)." },
              { q: "Eu tenho gato. Funciona pra marcação de território?", a: "Sim. Tem uma receita específica de neutralizador enzimático caseiro que quebra a molécula que sinaliza 'banheiro' pro gato — assim ele para de marcar no mesmo lugar. É a receita mais pedida pelos tutores de gato." },
              { q: "Como recebo o guia?", a: "Por e-mail, em até 5 minutos após o pagamento. PDF de 25 páginas, abre no celular, tablet ou computador. Acesso vitalício, baixa quantas vezes quiser." },
              { q: "E se mesmo assim eu precisar de ajuda profissional?", a: "O guia é pra manutenção em casa. Se o sofá tiver mancha antiga ou cheiro impregnado no enchimento, a higienização profissional resolve. Atendemos em São Paulo e região — todo cliente do guia ganha 10% de desconto na primeira higienização." },
            ].map((f, i) => (
              <details key={i} className="group rounded-2xl bg-white border p-5" style={{ borderColor: C.light }}>
                <summary className="cursor-pointer font-bold list-none flex justify-between items-center" style={{ color: C.navy }}>
                  {f.q}
                  <span className="text-2xl transition-transform group-open:rotate-45" style={{ color: C.coral }}>+</span>
                </summary>
                <p className="mt-3 leading-relaxed" style={{ color: C.soft }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL FIXO MOBILE */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 z-50 backdrop-blur-md"
        style={{ background: "rgba(26,26,46,0.95)", borderTop: `1px solid ${C.coral}55` }}>
        <button
          onClick={() => handleCheckout("sticky-mobile")}
          className="w-full px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
          style={{ background: C.coral, color: "white" }}
        >
          QUERO O GUIA PET — R$ {PRECO_POR} <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Espaço inferior pra não cobrir conteúdo no mobile */}
      <div className="md:hidden h-24" />

      {/* RODAPÉ */}
      <footer className="py-8 px-4 text-center text-xs" style={{ background: C.dark, color: "#9aa0c5" }}>
        © {new Date().getFullYear()} {PLATFORM_NAME} — Higienização profissional de estofados.
        <div className="mt-2">
          <a href="/privacidade" className="hover:underline" style={{ color: C.gold }}>Política de Privacidade</a>
        </div>
      </footer>
    </div>
  );
}
