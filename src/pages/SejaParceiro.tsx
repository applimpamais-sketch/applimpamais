 import { useEffect } from 'react';
 import { useSearchParams } from 'react-router-dom';
 import { trackViewContent } from '@/utils/facebookPixel';
 import SejaParceiroHero from '@/components/seja-parceiro/SejaParceiroHero';
 import SejaParceiroHowItWorks from '@/components/seja-parceiro/SejaParceiroHowItWorks';
 import SejaParceiroCalculadora from '@/components/seja-parceiro/SejaParceiroCalculadora';
 import SejaParceiroTestimonials from '@/components/seja-parceiro/SejaParceiroTestimonials';
 import SejaParceiroFAQ from '@/components/seja-parceiro/SejaParceiroFAQ';
 import SejaParceiroCTA from '@/components/seja-parceiro/SejaParceiroCTA';
 import SejaParceiroFooter from '@/components/seja-parceiro/SejaParceiroFooter';
import SejaParceiroMateriais from '@/components/seja-parceiro/SejaParceiroMateriais';
 
 const SejaParceiro = () => {
   const [searchParams] = useSearchParams();
 
   useEffect(() => {
     // Track page view - Pixel ViewContent
     trackViewContent('services', 'LP Seja Parceiro');
     
     // Store UTM params for attribution
     const utmSource = searchParams.get('utm_source');
     const utmMedium = searchParams.get('utm_medium');
     const utmCampaign = searchParams.get('utm_campaign');
     
     if (utmSource || utmMedium || utmCampaign) {
       sessionStorage.setItem('parceiro_utm', JSON.stringify({
         utm_source: utmSource,
         utm_medium: utmMedium,
         utm_campaign: utmCampaign,
         utm_content: searchParams.get('utm_content'),
         utm_term: searchParams.get('utm_term'),
       }));
     }
   }, [searchParams]);
 
   return (
     <div className="min-h-screen bg-slate-950 relative overflow-hidden">
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
       
       {/* Gradient Blobs */}
       <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30" />
       <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-30" />
       
       {/* Content */}
       <div className="relative z-10">
         <SejaParceiroHero />
         <SejaParceiroHowItWorks />
         <SejaParceiroCalculadora />
          <SejaParceiroMateriais />
         <SejaParceiroTestimonials />
         <SejaParceiroFAQ />
         <SejaParceiroCTA />
         <SejaParceiroFooter />
       </div>
     </div>
   );
 };
 
 export default SejaParceiro;