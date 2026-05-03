import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Check, Clock, Shield, Sparkles, Download, ShoppingBag,
  CheckCircle2, XCircle, Gift, FlaskConical, Leaf, Baby, PawPrint, AlertTriangle,
} from "lucide-react";
import mockupReceitas from "@/assets/mockup-receitas-acaro.png";
import { trackInitiateCheckout, trackViewContent } from "@/utils/facebookPixel";
import { PLATFORM_NAME, SITE_DOMAIN, SUPPORT_PHONE } from "@/lib/constants";

/* Design tokens locais (fora do design system global) */
const C = {
  navy: "#2F3C7E",
  coral: "#F96167",
  gold: "#F2A65A",
  cream: "#FFF6F1",
  dark: "#1A1A2E",
  soft: "#5C5C70",
  light: "#F2F2F7",
};

const PDF_URL = "/materiais/30-receitas-anti-acaro.pdf";
const CHECKOUT_URL = "#checkout"; // TODO: substituir pelo link Kiwify quando disponível
const PRECO_DE = 47;
const PRECO_POR = 19;

/* Countdown 24h */
function useCountdown24h() {
  const KEY = "receitas_acaro_end";
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
      [{ id: "receitas-anti-acaro-pdf", name: "30 Receitas Anti-Ácaro", price: PRECO_POR, quantity: 1 }],
      PRECO_POR,
    );
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("trackCustom", "GuiaCheckoutClick", { source: label });
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

export default function ReceitasAntiAcaro() {
  const { h, m, s } = useCountdown24h();
  useEffect(() => {
    trackViewContent("services", "30 Receitas Anti-Ácaro");
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div style={{ background: C.cream, color: C.dark, fontFamily: "Inter, system-ui, sans-serif" }}>
      <Helmet>
        <title>30 Receitas Anti-Ácaro Caseiras — Pets, Crianças e Alérgicos | {PLATFORM_NAME}</title>
        <meta name="description" content="Elimine ácaros do colchão, sofá, cortinas e tapete com 30 receitas testadas. Seguras pra crianças e pets, custo médio de R$ 5 por receita. PDF + lista de compras." />
        <link rel="canonical" href={`${SITE_DOMAIN}/receitas-anti-acaro`} />
        <meta property="og:title" content={`30 Receitas Anti-Ácaro Caseiras — ${PLATFORM_NAME}`} />
        <meta property="og:description" content="PDF prático com 30 receitas testadas para eliminar ácaro de forma natural, barata e segura. R$ 19." />
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
              <Sparkles className="w-3.5 h-3.5" /> NOVO • Edição Anti-Ácaro
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.05] mb-5" style={{ color: "white" }}>
              30 receitas <span style={{ color: C.coral }}>anti-ácaro</span> que sua casa precisa hoje
            </h1>
            <p className="text-base sm:text-lg mb-6" style={{ color: "#CBD2EE" }}>
              Pare de gastar fortuna em remédio. Aprenda a eliminar ácaros do colchão, sofá, cortinas e travesseiros
              com receitas caseiras testadas, <b>seguras pra crianças e pets</b>, por menos de R$ 5 cada.
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
              QUERO AS 30 RECEITAS <Download className="w-5 h-5" />
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
              src={mockupReceitas}
              alt="Capa do PDF 30 Receitas Anti-Ácaro"
              width={520}
              height={520}
              className="w-full max-w-md drop-shadow-2xl"
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
                style={{ background: `${C.coral}1f`, color: C.coral }}>O PROBLEMA</span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: C.navy }}>
                Você troca o lençol toda semana e ainda assim acorda com o nariz entupido?
              </h2>
              <p className="text-lg" style={{ color: C.soft }}>
                Não é falta de limpeza. São <b>milhões de ácaros invisíveis</b> que vivem dentro do
                colchão, sofá, travesseiro e cortinas — e os produtos comuns não chegam neles.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Criança que coça o nariz e espirra ao deitar",
                "Pet sempre se coçando, mesmo sem pulga",
                "Você gastando fortuna em antialérgico todo mês",
                "Casa cheirando 'limpo' mas alguém sempre com rinite",
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

      {/* SOLUÇÃO */}
      <section className="py-16 sm:py-24 px-4" style={{ background: "white" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: `${C.navy}14`, color: C.navy }}>A SOLUÇÃO</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: C.navy }}>
              30 receitas testadas, com ingredientes que custam menos de R$ 5
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: C.soft }}>
              Tudo o que você compra no mercado ou no Mercado Livre. Versões específicas pra cada
              superfície da casa — e versões pet-safe para quem tem cachorro ou gato.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { n: 6, t: "Sprays para Colchão", c: C.coral },
              { n: 6, t: "Sprays para Sofá", c: C.navy },
              { n: 4, t: "Sprays para Cortina", c: C.gold },
              { n: 4, t: "Sprays para Tapete", c: C.coral },
              { n: 4, t: "Sprays para Travesseiro", c: C.navy },
              { n: 6, t: "Pó pra aspirador + Bônus", c: C.gold },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp}
                className="p-6 rounded-2xl border-2 bg-white shadow-sm"
                style={{ borderColor: `${item.c}33` }}
              >
                <div className="text-5xl font-extrabold mb-2" style={{ color: item.c }}>{item.n}</div>
                <div className="font-bold text-lg" style={{ color: C.navy }}>{item.t}</div>
                <div className="text-sm mt-1" style={{ color: C.soft }}>Receitas testadas com proporções exatas</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* O QUE VEM DENTRO */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: C.navy }}>O que tem dentro do PDF</h2>
            <p className="text-lg" style={{ color: C.soft }}>19 páginas, layout limpo, abre no celular e imprime fácil</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: FlaskConical, t: "30 receitas com proporções exatas", d: "Ingredientes, modo de preparo, como usar e rendimento de cada uma." },
              { icon: ShoppingBag, t: "Lista única de compras", d: "Tudo o que você precisa em uma página só, com link para Mercado Livre." },
              { icon: Leaf, t: "7 erros que pioram o problema", d: "O que você está fazendo errado e como corrigir hoje." },
              { icon: Baby, t: "Versão antialérgica sem cheiro", d: "Pra bebês menores de 6 meses e pessoas com asma severa." },
              { icon: PawPrint, t: "Versões pet-safe (cachorro e gato)", d: "Sem lavanda nem melaleuca — usa óleo de cedro, seguro pra felinos." },
              { icon: AlertTriangle, t: "Protocolo semanal pra colar na geladeira", d: "Que receita usar em qual dia, sem complicação." },
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
              Que sozinhos valem mais que o preço do guia
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { t: "Saquinhos Repelentes", d: "Para armário, gaveta e baú de roupa de cama. Recipe inclusa." },
              { t: "Difusor Anti-Ácaro", d: "Pra deixar o quarto protegido o dia inteiro com varetas de bambu." },
              { t: "Sabão de Lavar Fronha", d: "Lavagem que mata 100% dos ácaros — o segredo da rotina." },
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
                "PDF '30 Receitas Anti-Ácaro' (19 páginas)",
                "Lista única de compras",
                "Protocolo semanal de manutenção",
                "Versões pet-safe e infantis",
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
              QUERO AS RECEITAS AGORA <Download className="w-5 h-5" />
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
              { q: "É seguro pra crianças e pets?", a: "Sim. Existem versões específicas: receitas pet-safe sem lavanda/melaleuca (uso seguro em casa com gatos), receitas infantis sem óleos essenciais e versões antialérgicas sem fragrância." },
              { q: "Quanto tempo leva pra fazer cada receita?", a: "De 2 a 5 minutos. Você só precisa de um borrifador e os ingredientes da lista de compras." },
              { q: "Onde encontro os ingredientes?", a: "Tudo no mercado, farmácia ou Mercado Livre. O guia traz uma lista única com onde achar e custo médio." },
              { q: "Quanto tempo dura cada receita pronta?", a: "A maioria dura de 25 a 30 dias guardada em borrifador escuro. Receitas com limão ou suco fresco duram 7 dias na geladeira." },
              { q: "Funciona mesmo? Tem prova?", a: "Eucalipto, melaleuca e cravo têm eficácia comprovada contra ácaros em estudos clínicos. O guia é fruto de uma equipe que higieniza estofados profissionalmente todo dia em BH." },
              { q: "Como recebo o PDF?", a: "Por e-mail, em até 5 minutos após o pagamento. Acesso vitalício, baixa quantas vezes quiser." },
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
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
          style={{ background: C.coral, color: "white" }}
        >
          QUERO AS 30 RECEITAS — R$ {PRECO_POR} <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <footer className="py-10 px-4 text-center text-sm" style={{ background: C.dark, color: "#9aa0c5" }}>
        <p className="mb-2"><b style={{ color: "white" }}>{PLATFORM_NAME}</b> • Higienização profissional em BH e região</p>
        <p>WhatsApp {SUPPORT_PHONE || 'não configurado'} • {SITE_DOMAIN.replace(/^https?:\/\//, '')}</p>
        <p className="mt-3 text-xs">© {new Date().getFullYear()} {PLATFORM_NAME} — Todos os direitos reservados</p>
      </footer>
    </div>
  );
}
