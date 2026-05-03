import { Helmet } from 'react-helmet-async';
import { LPTheme, getTheme } from '@/styles/lp-themes';
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
} from '@/components/lp';

interface LandingPageData {
  id: string;
  nome: string;
  slug: string;
  config: {
    servico?: {
      subcategoria: string;
      preco_limpeza?: number | null;
    };
    precos?: {
      estrategia: string;
      precoOriginal?: number;
      precoFinal?: number;
      descontoPercent?: number;
    };
    destino_cta?: string;
    elementos?: {
      timer?: boolean;
      depoimentos?: boolean;
      garantia?: boolean;
      urgencia?: boolean;
      prova_social?: boolean;
    };
    theme?: LPTheme;
  };
  copy_gerada: {
    headline?: string;
    subheadline?: string;
    badge_urgencia?: string;
    sobre_titulo?: string;
    sobre_texto?: string;
    sobre_destaque?: string;
    perfis_ideais?: Array<{ titulo: string; descricao: string }>;
    dores?: Array<{ titulo: string; problema: string; solucao: string }>;
    beneficios?: string[] | Array<{ titulo: string; descricao: string }>;
    especialista_titulo?: string;
    especialista_subtitulo?: string;
    especialista_texto?: string;
    especialista_credenciais?: string[];
    garantia_titulo?: string;
    garantia_texto?: string;
    garantia_prazo?: string;
    faqs?: Array<{ pergunta: string; resposta: string }>;
    headline_final?: string;
    cta_text?: string;
    cta_subtext?: string;
    urgencia_text?: string;
    prova_social_text?: string;
    meta_title?: string;
    meta_description?: string;
  };
}

interface LandingPageTeodoroRendererProps {
  data: LandingPageData;
}

export default function LandingPageTeodoroRenderer({ data }: LandingPageTeodoroRendererProps) {
  const copy = data.copy_gerada || {};
  const config = data.config || {};
  const elementos = config.elementos || {};
  const precos = config.precos;

  // Get theme
  const theme: LPTheme = config.theme || 'midnight';
  const t = getTheme(theme);

  // Handle CTA click based on config
  const handleCTA = () => {
    if (config.destino_cta === 'whatsapp') {
      const message = encodeURIComponent(`Olá! Tenho interesse em ${config.servico?.subcategoria || 'seu serviço'}`);
      window.open(`https://wa.me/5531999999999?text=${message}`, '_blank');
    } else if (config.destino_cta === 'checkout') {
      window.location.href = '/agendamento';
    } else {
      document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Transform beneficios to the expected format
  const transformedBeneficios = Array.isArray(copy.beneficios) 
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
  const precoFinal = precos?.precoFinal || config.servico?.preco_limpeza || undefined;
  const descontoPercent = precos?.descontoPercent;

  return (
    <>
      <Helmet>
        <title>{copy.meta_title || data.nome}</title>
        <meta 
          name="description" 
          content={copy.meta_description || copy.subheadline || ''} 
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className={`min-h-screen ${t.bgPrimary}`}>
        {/* Header */}
        <LPHeader
          showTimer={elementos.timer}
          ctaText={copy.cta_text || 'Agendar Agora'}
          theme={theme}
          onCtaClick={handleCTA}
        />

        {/* Hero Section */}
        <LPHero
          headline={copy.headline || `Limpeza de ${config.servico?.subcategoria}`}
          subheadline={copy.subheadline}
          badgeUrgencia={elementos.urgencia ? (copy.badge_urgencia || copy.urgencia_text) : undefined}
          precoOriginal={precoOriginal}
          precoFinal={precoFinal}
          descontoPercent={descontoPercent}
          mostrarPreco={mostrarPreco}
          ctaText={copy.cta_text || 'Agendar Agora'}
          ctaSubtext={copy.cta_subtext || 'Pagamento 100% seguro'}
          provaSocialText={elementos.prova_social ? copy.prova_social_text : undefined}
          showTimer={elementos.timer}
          theme={theme}
          onCtaClick={handleCTA}
        />

        {/* Trust Bar */}
        <LPTrustBar theme={theme} />

        {/* About Problem */}
        <LPAboutProblem
          titulo={copy.sobre_titulo}
          texto={copy.sobre_texto}
          destaque={copy.sobre_destaque}
          ctaText={copy.cta_text || 'Agendar Agora'}
          theme={theme}
          onCtaClick={handleCTA}
        />

        {/* Target Audience */}
        {copy.perfis_ideais && copy.perfis_ideais.length > 0 && (
          <LPTargetAudience perfis={copy.perfis_ideais} theme={theme} />
        )}

        {/* Pain & Solution */}
        {copy.dores && copy.dores.length > 0 && (
          <LPPainSolution dores={copy.dores} theme={theme} />
        )}

        {/* Benefits */}
        {transformedBeneficios.length > 0 && (
          <LPBenefits beneficios={transformedBeneficios} theme={theme} />
        )}

        {/* Specialist */}
        <LPSpecialist
          titulo={copy.especialista_titulo}
          subtitulo={copy.especialista_subtitulo}
          texto={copy.especialista_texto}
          credenciais={copy.especialista_credenciais}
          theme={theme}
        />

        {/* Pricing */}
        {mostrarPreco && precoFinal && (
          <LPPricing
            precoOriginal={precoOriginal}
            precoFinal={precoFinal}
            descontoPercent={descontoPercent}
            mostrarPreco={mostrarPreco}
            garantiaTexto={copy.garantia_texto}
            garantiaPrazo={copy.garantia_prazo || '7 dias'}
            ctaText={copy.cta_text || 'Agendar Agora'}
            theme={theme}
            onCtaClick={handleCTA}
          />
        )}

        {/* Testimonials */}
        {elementos.depoimentos && <LPTestimonials theme={theme} />}

        {/* Guarantee */}
        {elementos.garantia && (
          <LPGuarantee
            titulo={copy.garantia_titulo}
            texto={copy.garantia_texto}
            prazo={copy.garantia_prazo || '7 dias'}
            theme={theme}
          />
        )}

        {/* FAQ */}
        {copy.faqs && copy.faqs.length > 0 && <LPFaq faqs={copy.faqs} theme={theme} />}

        {/* Final CTA */}
        <LPFinalCta
          headline={copy.headline_final || 'Pronto para transformar seu ambiente?'}
          ctaText={copy.cta_text || 'Agendar Agora'}
          showTimer={elementos.timer}
          theme={theme}
          onCtaClick={handleCTA}
        />

        {/* Footer */}
        <LPFooter theme={theme} />

        {/* Floating CTA */}
        <LPFloatingCta
          ctaText={copy.cta_text || 'Agendar Agora'}
          preco={precoFinal}
          theme={theme}
          onCtaClick={handleCTA}
        />
      </div>
    </>
  );
}
