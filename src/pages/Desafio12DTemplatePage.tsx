import { Helmet } from 'react-helmet-async';
import LP12DHeader from '@/components/lp/LP12DHeader';
import LP12DHero from '@/components/lp/LP12DHero';
import LP12DProblem from '@/components/lp/LP12DProblem';
import LP12DSolution from '@/components/lp/LP12DSolution';
import LP12DBenefits from '@/components/lp/LP12DBenefits';
import LP12DMarquee from '@/components/lp/LP12DMarquee';
import LP12DTestimonials from '@/components/lp/LP12DTestimonials';
import LP12DTargetAudience from '@/components/lp/LP12DTargetAudience';
import LP12DPricing from '@/components/lp/LP12DPricing';
import LP12DBio from '@/components/lp/LP12DBio';
import LP12DFaq from '@/components/lp/LP12DFaq';
import LP12DFooter from '@/components/lp/LP12DFooter';
import { SITE_DOMAIN } from '@/lib/constants';

const Desafio12DTemplatePage = () => {
  return (
    <>
      <Helmet>
        <title>Desafio 12D - Fortaleça suas emoções em 12 dias</title>
        <meta 
          name="description" 
          content="Em 12 dias você será capaz de encontrar equilíbrio emocional, sentindo-se segura e confiante sobre suas decisões como mãe e esposa." 
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${SITE_DOMAIN}/lp-12d`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Desafio 12D - Fortaleça suas emoções em 12 dias" />
        <meta property="og:description" content="Em 12 dias você será capaz de encontrar equilíbrio emocional, sentindo-se segura e confiante." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_DOMAIN}/lp-12d`} />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#1a1a2e" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <LP12DHeader />
        <LP12DHero />
        <LP12DProblem />
        <LP12DSolution />
        <LP12DBenefits />
        <LP12DMarquee />
        <LP12DTestimonials />
        <LP12DTargetAudience />
        <LP12DPricing />
        <LP12DBio />
        <LP12DFaq />
        <LP12DFooter />
      </div>
    </>
  );
};

export default Desafio12DTemplatePage;
