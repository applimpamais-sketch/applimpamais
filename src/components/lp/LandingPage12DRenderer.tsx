import { Helmet } from 'react-helmet-async';
import LP12DHeader from './LP12DHeader';
import LP12DHero from './LP12DHero';
import LP12DProblem from './LP12DProblem';
import LP12DSolution from './LP12DSolution';
import LP12DBenefits from './LP12DBenefits';
import LP12DMarquee from './LP12DMarquee';
import LP12DTestimonials from './LP12DTestimonials';
import LP12DTargetAudience from './LP12DTargetAudience';
import LP12DPricing from './LP12DPricing';
import LP12DBio from './LP12DBio';
import LP12DFaq from './LP12DFaq';
import LP12DFooter from './LP12DFooter';
import { LPTheme, getTheme } from '@/styles/lp-themes';
import { LPThemeId, getThemeStyle, getThemeTokens, resolveThemeId } from '@/styles/lp-css-themes';
import '@/styles/lp-theme.css';
import { LP12DCopy, isSlotBasedCopy } from '@/types/lp-slots';

interface LandingPageData {
  id: string;
  nome: string;
  slug: string;
  config: {
    servico?: {
      subcategoria: string;
    };
    precos?: {
      estrategia: string;
      precoOriginal?: number;
      precoFinal?: number;
    };
    destino_cta?: string;
    elementos?: {
      timer?: boolean;
      depoimentos?: boolean;
      garantia?: boolean;
      urgencia?: boolean;
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
    beneficios?: Array<{ titulo: string; descricao: string }>;
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
    meta_title?: string;
    meta_description?: string;
  };
}

interface LandingPage12DRendererProps {
  data: LandingPageData;
}

export default function LandingPage12DRenderer({ data }: LandingPage12DRendererProps) {
  const copy = data.copy_gerada || {};
  const config = data.config || {};
  const elementos = config.elementos || {};
  
  // Resolve theme - supports both legacy and new format
  const themeId = resolveThemeId(config.theme as string);
  const themeStyle = getThemeStyle(themeId);
  const themeTokens = getThemeTokens(themeId);
  
  // Legacy theme for backward compatibility with components
  const theme: LPTheme = (config.theme as LPTheme) || 'midnight';
  const t = getTheme(theme);
  
  // Check if copy is new slot-based format
  const isNewFormat = isSlotBasedCopy(copy);
  const slotCopy = isNewFormat ? (copy as unknown as LP12DCopy) : null;

  // Prepare pricing data
  const precoOriginal = config.precos?.estrategia === 'promocional' 
    ? `R$ ${config.precos?.precoOriginal}` 
    : undefined;
  const precoFinal = config.precos?.precoFinal 
    ? `R$ ${config.precos?.precoFinal}` 
    : undefined;

  // Transform benefits to expected format { text: string }
  const transformedBenefits = copy.beneficios?.map(b => ({
    text: b.descricao || b.titulo
  }));

  // Transform perfis_ideais to target audience format { text: string }
  const forYouItems = copy.perfis_ideais?.map(p => ({
    text: p.descricao || p.titulo
  }));

  // Transform dores to "not for you" items
  const notForYouItems = copy.dores?.slice(0, 4).map(d => ({
    text: d.problema
  }));

  // Transform FAQs to expected format
  const transformedFaqs = copy.faqs?.map(f => ({
    question: f.pergunta,
    answer: f.resposta
  }));

  // Split bio text into paragraphs
  const bioParagraphs = copy.especialista_texto?.split('\n\n').filter(Boolean) || [];

  // Solution paragraphs from dores/solucoes
  const solutionParagraphs = copy.dores?.slice(0, 4).map(d => d.solucao).filter(Boolean) || [];

  // Get dynamic theme color for meta from CSS vars
  const themeColor = themeTokens['--lp-primary'];

  // Extract meta from new or legacy format
  const metaTitle = slotCopy?.meta?.title || copy.meta_title || data.nome;
  const metaDescription = slotCopy?.meta?.description || copy.meta_description || copy.subheadline || '';

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content={themeColor} />
      </Helmet>

      <div style={themeStyle} className="min-h-screen lp-bg lp-text">
        <LP12DHeader 
          ctaText={copy.cta_text || 'SABER MAIS'}
          theme={theme}
        />
        
        <LP12DHero
          preHeadline={copy.badge_urgencia}
          headline={copy.headline}
          subheadline={copy.subheadline}
          ctaText={copy.cta_text || 'QUERO SABER MAIS'}
          ctaUrl="#preco"
          theme={theme}
        />
        
        <LP12DProblem
          title={copy.sobre_titulo}
          paragraphs={copy.sobre_texto?.split('\n\n').filter(Boolean)}
          highlightText={copy.sobre_destaque}
          theme={theme}
        />
        
        <LP12DSolution
          title={copy.headline_final || 'A solução ideal para você'}
          subtitle={config.servico?.subcategoria || 'Nossa solução'}
          paragraphs={solutionParagraphs.length > 0 ? solutionParagraphs : undefined}
          theme={theme}
        />
        
        {transformedBenefits && transformedBenefits.length > 0 && (
          <LP12DBenefits
            title="O que você vai receber"
            subtitle={data.nome}
            benefits={transformedBenefits}
            ctaText={copy.cta_text}
            theme={theme}
          />
        )}
        
        <LP12DMarquee 
          text={data.nome || config.servico?.subcategoria || 'Serviço Profissional'}
          theme={theme}
        />
        
        {elementos.depoimentos !== false && (
          <LP12DTestimonials 
            title="O que nossos clientes dizem"
            theme={theme}
          />
        )}
        
        <LP12DTargetAudience
          title="ESSE SERVIÇO É PARA VOCÊ?"
          forYouTitle={`${data.nome} é para você se:`}
          forYouItems={forYouItems}
          notForYouTitle={`${data.nome} NÃO é para você se:`}
          notForYouItems={notForYouItems}
          theme={theme}
        />
        
        <LP12DPricing
          originalPrice={precoOriginal}
          cashPrice={precoFinal}
          ctaText={copy.cta_text}
          theme={theme}
        />
        
        <LP12DBio
          name={copy.especialista_titulo}
          bio={bioParagraphs.length > 0 ? bioParagraphs : undefined}
          ctaText={copy.cta_text ? `QUERO CONTRATAR COM ${copy.especialista_titulo?.split(' ')[0]?.toUpperCase() || 'ESPECIALISTA'}` : undefined}
          theme={theme}
        />
        
        {transformedFaqs && transformedFaqs.length > 0 && (
          <LP12DFaq 
            faqs={transformedFaqs} 
            theme={theme}
          />
        )}
        
        <LP12DFooter 
          copyrightText={`© ${new Date().getFullYear()} ${data.nome}. Todos os direitos reservados.`}
          theme={theme}
        />
      </div>
    </>
  );
}
