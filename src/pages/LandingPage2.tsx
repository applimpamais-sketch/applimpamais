import { Helmet } from 'react-helmet-async';
import HeroModules from '@/components/lp2/HeroModules';
import ProblemSolutionSplit from '@/components/lp2/ProblemSolutionSplit';
import ModulesShowcase from '@/components/lp2/ModulesShowcase';
import BentoGrid from '@/components/lp2/BentoGrid';
import SavingsCalculator from '@/components/lp2/SavingsCalculator';
import ModularPricing from '@/components/lp2/ModularPricing';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';
import LandingFooter from '@/components/landing/LandingFooter';
import { useEffect } from 'react';

export default function LandingPage2() {
  // Track ViewContent on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: 'LP2 - Plataforma SaaS Modular',
        content_category: 'Landing Page',
      });
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Plataforma SaaS para Empresas de Limpeza | 12 Módulos Integrados</title>
        <meta 
          name="description" 
          content="Sistema completo com dashboard, financeiro, WhatsApp bot, marketing e mais. Monte seu plano ideal e transforme sua operação." 
        />
        <meta property="og:title" content="Plataforma SaaS para Empresas de Limpeza" />
        <meta property="og:description" content="12 módulos integrados para transformar sua operação em uma máquina de vendas." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://rclimpamais.lovable.app/lp2" />
      </Helmet>

      <main className="bg-black min-h-screen">
        <HeroModules />
        <ProblemSolutionSplit />
        <ModulesShowcase />
        <BentoGrid />
        <SavingsCalculator />
        <TestimonialsSection />
        <ModularPricing />
        <FAQSection />
        <CTASection />
        <LandingFooter />
      </main>
    </>
  );
}
