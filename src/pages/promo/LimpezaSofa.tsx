import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackViewContent } from '@/utils/facebookPixel';
import PromoHero from '@/components/promo/PromoHero';
import PromoMarquee from '@/components/promo/PromoMarquee';
import PromoBenefits from '@/components/promo/PromoBenefits';
import PromoHowItWorks from '@/components/promo/PromoHowItWorks';
import PromoTestimonials from '@/components/promo/PromoTestimonials';
import PromoFooter from '@/components/promo/PromoFooter';

const LimpezaSofa = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Track page view with UTM params
    trackViewContent('services', 'Promo Limpeza Sofá 149,90');
    
    // Store UTM params for lead attribution
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');
    
    if (utmSource || utmMedium || utmCampaign) {
      sessionStorage.setItem('promo_utm', JSON.stringify({
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: searchParams.get('utm_content'),
        utm_term: searchParams.get('utm_term'),
      }));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(hsl(210 100% 50% / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(210 100% 50% / 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} 
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <PromoMarquee />
        <PromoHero />
        <PromoBenefits />
        <PromoHowItWorks />
        <PromoTestimonials />
        <PromoFooter />
      </div>
    </div>
  );
};

export default LimpezaSofa;
