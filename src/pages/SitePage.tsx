import { Helmet } from "react-helmet-async";
import SiteHero from "@/components/site/SiteHero";
import SiteTrustBadges from "@/components/site/SiteTrustBadges";
import SiteAbout from "@/components/site/SiteAbout";
import SiteServices from "@/components/site/SiteServices";
import SiteHowItWorks from "@/components/site/SiteHowItWorks";
import SiteTestimonials from "@/components/site/SiteTestimonials";
import SitePricing from "@/components/site/SitePricing";
import SiteNewsletter from "@/components/site/SiteNewsletter";
import SiteFAQ from "@/components/site/SiteFAQ";
import SiteFooter from "@/components/site/SiteFooter";

const SitePage = () => {
  return (
    <>
      <Helmet>
        <title>RC Limpa Mais | Limpeza de Estofados em BH</title>
        <meta
          name="description"
          content="Higienização e impermeabilização profissional de sofás, colchões, tapetes e bancos de carro em Belo Horizonte. 500+ clientes satisfeitos. Agende agora!"
        />
      </Helmet>
      <main className="min-h-screen">
        <SiteHero />
        <SiteTrustBadges />
        <SiteAbout />
        <SiteServices />
        <SiteHowItWorks />
        <SiteTestimonials />
        <SitePricing />
        <SiteNewsletter />
        <SiteFAQ />
        <SiteFooter />
      </main>
    </>
  );
};

export default SitePage;
