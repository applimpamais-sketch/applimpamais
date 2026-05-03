import { useEffect } from 'react';
import HeroSection from '@/components/landing/HeroSection';
import PainPointsSection from '@/components/landing/PainPointsSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import PricingComparisonTable from '@/components/landing/PricingComparisonTable';
import FAQSection from '@/components/landing/FAQSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import DiferenciaisSection from '@/components/landing/DiferenciaisSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';
import { PLATFORM_NAME } from '@/lib/constants';

export default function SolucaoEmpresas() {
  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: 'Landing Page B2B SaaS',
        content_category: 'B2B Solution',
      });
    }

    // SEO
    document.title = `Sistema de Gestão para Empresas de Limpeza de Estofados | ${PLATFORM_NAME}`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Sistema completo de gestão para empresas de limpeza de estofados. Agendamento online, financeiro integrado, WhatsApp automatizado e muito mais. Teste 14 dias grátis.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <HeroSection />
      <PainPointsSection />
      <FeaturesGrid />
      <DiferenciaisSection />
      <HowItWorksSection />
      <PricingComparisonTable />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
