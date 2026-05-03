import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import {
  LPHeader,
  LPHero,
  LPTrustBar,
  LPAboutProblem,
  LPTargetAudience,
  LPPainSolution,
  LPBenefits,
  LPSpecialist,
  LPPricing,
  LPGuarantee,
  LPTestimonials,
  LPFaq,
  LPFinalCta,
  LPFloatingCta,
  LPFooter,
} from "@/components/lp";
import { LPTheme, getTheme } from "@/styles/lp-themes";
import LandingPage12DRenderer from "@/components/lp/LandingPage12DRenderer";
import LandingPageTeodoroRenderer from "@/components/lp/LandingPageTeodoroRenderer";
import { LandingRenderer } from "@/components/lp-editor/LandingRenderer";
import type { LandingPageDocument } from "@/types/lp-document";

interface ElementosConfig {
  timer?: boolean;
  depoimentos?: boolean;
  garantia?: boolean;
  antesDepois?: boolean;
  urgencia?: boolean;
  prova_social?: boolean;
}

interface LandingPageData {
  id: string;
  nome: string;
  slug: string;
  template_tipo: string;
  status: string;
  config: {
    servico: {
      id: string;
      categoria: string;
      subcategoria: string;
      preco_limpeza: number | null;
    };
    precos: {
      estrategia: 'sem_preco' | 'com_preco' | 'promocional';
      precoOriginal?: number;
      precoFinal?: number;
      descontoPercent?: number;
    };
    destino_cta: 'whatsapp' | 'checkout' | 'formulario';
    elementos: ElementosConfig;
    template: string;
    theme?: LPTheme;
    // Novo formato de documento com sections
    sections?: LandingPageDocument['sections'];
    template_id?: LandingPageDocument['template_id'];
    theme_id?: LandingPageDocument['theme_id'];
    meta?: LandingPageDocument['meta'];
    settings?: LandingPageDocument['settings'];
  };
  copy_gerada: {
    headline: string;
    subheadline: string;
    badge_urgencia?: string;
    beneficios: string[] | Array<{ titulo: string; descricao: string }>;
    cta_text: string;
    cta_subtext?: string;
    urgencia_text?: string;
    garantia_text?: string;
    garantia_titulo?: string;
    garantia_prazo?: string;
    prova_social_text?: string;
    perfis_ideais?: Array<{ titulo: string; descricao: string }>;
    dores?: Array<{ titulo: string; problema: string; solucao: string }>;
    faqs?: Array<{ pergunta: string; resposta: string }>;
    headline_final?: string;
    // Novas seções do template Teodoro
    sobre_titulo?: string;
    sobre_texto?: string;
    sobre_destaque?: string;
    especialista_titulo?: string;
    especialista_subtitulo?: string;
    especialista_texto?: string;
    especialista_credenciais?: string[];
    // SEO
    meta_title?: string;
    meta_description?: string;
  };
}

// Detecta se o config contém o novo formato de documento com sections
function isNewDocumentFormat(config: unknown): boolean {
  if (!config || typeof config !== 'object') return false;
  const doc = config as Record<string, unknown>;
  return 'sections' in doc && Array.isArray(doc.sections) && doc.sections.length > 0;
}

const LandingPageView = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: landingPage, isLoading, error } = useQuery({
    queryKey: ['landing-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iarc_landing_pages')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as unknown as LandingPageData;
    },
    enabled: !!slug,
  });

  // Get theme from config or default
  const theme: LPTheme = landingPage?.config?.theme || 'midnight';
  const t = getTheme(theme);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.bgPrimary}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${t.gradientPrimary} animate-pulse`} />
          <span className={t.textMuted}>Carregando...</span>
        </div>
      </div>
    );
  }

  if (error || !landingPage) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${t.bgPrimary} text-center p-4`}>
        <h1 className={`text-2xl font-bold ${t.textPrimary} mb-2`}>Página não encontrada</h1>
        <p className={t.textMuted}>A landing page que você está procurando não existe ou foi removida.</p>
      </div>
    );
  }

  // ============================================
  // NOVO FORMATO: Documento com sections (Editor Visual)
  // ============================================
  if (isNewDocumentFormat(landingPage.config)) {
    const doc = landingPage.config as LandingPageDocument;
    return (
      <>
        <Helmet>
          <title>{doc.meta?.title || landingPage.nome}</title>
          {doc.meta?.description && <meta name="description" content={doc.meta.description} />}
          {doc.meta?.favicon && <link rel="icon" href={doc.meta.favicon} />}
        </Helmet>
        <LandingRenderer document={doc} mode="view" />
      </>
    );
  }

  // ============================================
  // FORMATO LEGADO: Templates específicos
  // ============================================
  if (landingPage.template_tipo === 'lp-12d') {
    return <LandingPage12DRenderer data={landingPage as any} />;
  }

  if (landingPage.template_tipo === 'lp-teodoro') {
    return <LandingPageTeodoroRenderer data={landingPage as any} />;
  }

  // Fallback to generic template (for backward compatibility)
  const copy = landingPage.copy_gerada;
  const config = landingPage.config;
  const elementos: ElementosConfig = config?.elementos || {};
  const precos = config?.precos;

  // Update document title
  if (copy?.meta_title) {
    document.title = copy.meta_title;
  }

  const handleCTA = () => {
    if (config?.destino_cta === 'whatsapp') {
      const message = encodeURIComponent(`Olá! Tenho interesse em ${config.servico?.subcategoria}`);
      window.open(`https://wa.me/5531999999999?text=${message}`, '_blank');
    } else if (config?.destino_cta === 'checkout') {
      window.location.href = '/agendamento';
    } else {
      document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Transform beneficios to the expected format
  const transformedBeneficios = Array.isArray(copy?.beneficios) 
    ? copy.beneficios.map((b) => {
        if (typeof b === 'string') {
          return { titulo: b, descricao: '', icon: 'check' as const };
        }
        return { ...b, icon: 'check' as const };
      })
    : [];

  // Price configuration
  const mostrarPreco = precos?.estrategia !== 'sem_preco';
  const precoOriginal = precos?.estrategia === 'promocional' ? precos?.precoOriginal : undefined;
  const precoFinal = precos?.precoFinal || config?.servico?.preco_limpeza || undefined;
  const descontoPercent = precos?.descontoPercent;

  return (
    <div className={`min-h-screen ${t.bgPrimary}`}>
      {/* 1. Fixed Header */}
      <LPHeader
        showTimer={elementos.timer}
        ctaText={copy?.cta_text || 'Agendar Agora'}
        theme={theme}
        onCtaClick={handleCTA}
      />

      {/* 2. Hero Section */}
      <LPHero
        headline={copy?.headline || `Limpeza de ${config?.servico?.subcategoria}`}
        subheadline={copy?.subheadline}
        badgeUrgencia={elementos.urgencia ? (copy?.badge_urgencia || copy?.urgencia_text) : undefined}
        precoOriginal={precoOriginal}
        precoFinal={precoFinal}
        descontoPercent={descontoPercent}
        mostrarPreco={mostrarPreco}
        ctaText={copy?.cta_text || 'Agendar Agora'}
        ctaSubtext={copy?.cta_subtext || 'Pagamento 100% seguro'}
        provaSocialText={elementos.prova_social ? copy?.prova_social_text : undefined}
        showTimer={elementos.timer}
        theme={theme}
        onCtaClick={handleCTA}
      />

      {/* 3. Trust Bar (Marquee) */}
      <LPTrustBar theme={theme} />

      {/* 4. Sobre o Problema (Template Teodoro) */}
      <LPAboutProblem
        titulo={copy?.sobre_titulo}
        texto={copy?.sobre_texto}
        destaque={copy?.sobre_destaque}
        ctaText={copy?.cta_text || 'Agendar Agora'}
        theme={theme}
        onCtaClick={handleCTA}
      />

      {/* 5. Para Quem É (Perfis Ideais) */}
      {copy?.perfis_ideais && copy.perfis_ideais.length > 0 && (
        <LPTargetAudience perfis={copy.perfis_ideais} theme={theme} />
      )}

      {/* 6. Dores e Soluções */}
      {copy?.dores && copy.dores.length > 0 && (
        <LPPainSolution dores={copy.dores} theme={theme} />
      )}

      {/* 7. Benefícios/Diferenciais */}
      {transformedBeneficios.length > 0 && (
        <LPBenefits beneficios={transformedBeneficios} theme={theme} />
      )}

      {/* 8. Sobre a Empresa/Especialista (Template Teodoro) */}
      <LPSpecialist
        titulo={copy?.especialista_titulo}
        subtitulo={copy?.especialista_subtitulo}
        texto={copy?.especialista_texto}
        credenciais={copy?.especialista_credenciais}
        theme={theme}
      />

      {/* 9. Pricing (se mostrar preço) */}
      {mostrarPreco && precoFinal && (
        <LPPricing
          precoOriginal={precoOriginal}
          precoFinal={precoFinal}
          descontoPercent={descontoPercent}
          mostrarPreco={mostrarPreco}
          garantiaTexto={copy?.garantia_text}
          garantiaPrazo={copy?.garantia_prazo || '7 dias'}
          ctaText={copy?.cta_text || 'Agendar Agora'}
          theme={theme}
          onCtaClick={handleCTA}
        />
      )}

      {/* 10. Depoimentos */}
      {elementos.depoimentos && <LPTestimonials theme={theme} />}

      {/* 11. Garantia */}
      {elementos.garantia && (
        <LPGuarantee
          titulo={copy?.garantia_titulo}
          texto={copy?.garantia_text}
          prazo={copy?.garantia_prazo || '7 dias'}
          theme={theme}
        />
      )}

      {/* 12. FAQ */}
      {copy?.faqs && copy.faqs.length > 0 && <LPFaq faqs={copy.faqs} theme={theme} />}

      {/* 13. CTA Final */}
      <LPFinalCta
        headline={copy?.headline_final || 'Pronto para transformar seu ambiente?'}
        ctaText={copy?.cta_text || 'Agendar Agora'}
        showTimer={elementos.timer}
        theme={theme}
        onCtaClick={handleCTA}
      />

      {/* 14. Footer */}
      <LPFooter theme={theme} />

      {/* Lead Form (for formulario CTA) */}
      {config?.destino_cta === 'formulario' && (
        <section id="lead-form" className={`py-16 px-4 ${t.bgSection}`}>
          <div className={`max-w-md mx-auto ${t.bgCard} backdrop-blur-sm ${t.border} border p-8 rounded-2xl`}>
            <h2 className={`text-2xl font-bold text-center ${t.textPrimary} mb-6`}>Solicite um orçamento</h2>
            <form className="space-y-4">
              <input 
                type="text" 
                placeholder="Seu nome"
                className={`w-full px-4 py-3 rounded-lg ${t.border} border ${t.bgSection} ${t.textPrimary} placeholder-gray-500 focus:${t.borderHover} focus:outline-none`}
              />
              <input 
                type="tel" 
                placeholder="WhatsApp"
                className={`w-full px-4 py-3 rounded-lg ${t.border} border ${t.bgSection} ${t.textPrimary} placeholder-gray-500 focus:${t.borderHover} focus:outline-none`}
              />
              <button 
                type="submit" 
                className={`w-full py-4 bg-gradient-to-r ${t.gradientButton} text-white font-semibold rounded-lg transition-colors`}
              >
                Enviar
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Mobile Floating CTA */}
      <LPFloatingCta
        ctaText={copy?.cta_text || 'Agendar Agora'}
        preco={precoFinal}
        theme={theme}
        onCtaClick={handleCTA}
      />
    </div>
  );
};

export default LandingPageView;
