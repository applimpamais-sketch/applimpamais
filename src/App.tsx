import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { LGPDConsent } from "@/components/LGPDConsent";
import Index from "./pages/Index";
import Agendamento from "./pages/Agendamento";
import LimpezaSofa from "./pages/promo/LimpezaSofa";
import GuiaSalveSeuSofa from "./pages/GuiaSalveSeuSofa";
import ReceitasAntiAcaro from "./pages/ReceitasAntiAcaro";
import GuiaPet from "./pages/GuiaPet";
import KitAirbnb from "./pages/KitAirbnb";
import SejaParceiro from "./pages/SejaParceiro";
import Checkout from "./pages/Checkout";
import MonteLocacao from "./pages/MonteLocacao";

import Cupons from "./pages/Cupons";
import Avaliacoes from "./pages/Avaliacoes";
import SolucaoEmpresas from "./pages/SolucaoEmpresas";
import NotFound from "./pages/NotFound";
import Privacidade from "./pages/Privacidade";
import Auth from "./pages/Auth";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAgendamentos from "./pages/admin/Agendamentos";
import AdminRelatorios from "./pages/admin/Relatorios";
import AdminEquipe from "./pages/admin/Equipe";
import AdminCupons from "./pages/admin/Cupons";
import AdminCarrinhosAbandonados from "./pages/admin/CarrinhosAbandonados";
import AdminInstalarApp from "./pages/admin/InstalarApp";
import FinanceiroDashboard from "./pages/admin/financeiro/Dashboard";
import FinanceiroConsolidado from "./pages/admin/financeiro/DashboardConsolidado";
import FinanceiroReceitas from "./pages/admin/financeiro/Receitas";
import FinanceiroDespesas from "./pages/admin/financeiro/Despesas";
import FinanceiroFluxoCaixa from "./pages/admin/financeiro/FluxoCaixa";
import FinanceiroMetas from "./pages/admin/financeiro/Metas";
import IntegracoesAnuncios from "./pages/admin/integracoes/Anuncios";
import IntegracoesPixel from "./pages/admin/integracoes/Pixel";
import IntegracoesWebhook from "./pages/admin/integracoes/Webhook";
import IntegracoesUTMify from "./pages/admin/integracoes/UTMify";
import UTMifyDashboard from "./pages/admin/integracoes/UTMifyDashboard";
import IntegracoesWhatsApp from "./pages/admin/integracoes/WhatsApp";
import IntegracoesWhatsAppConfig from "./pages/admin/integracoes/WhatsAppConfig";
import IntegracoesWhatsAppDespesas from "./pages/admin/integracoes/WhatsAppDespesas";
import WhatsAppDashboard from "./pages/admin/WhatsAppDashboard";
import Perfil from "./pages/admin/Perfil";
import ChangePassword from "./pages/ChangePassword";
 import ResetPassword from "./pages/ResetPassword";
import LiveView from "./pages/admin/LiveView";
import Analytics from "./pages/admin/Analytics";
import AdminTecnicos from "./pages/admin/Tecnicos";
import AdminTemplates from './pages/admin/Templates';
import CentralMensagens from './pages/admin/CentralMensagens';
import PushNotifications from './pages/admin/PushNotifications';
import Marketing from './pages/admin/Marketing';
import CalendarioEditorial from './pages/admin/marketing/CalendarioEditorial';

// IARC Studio
import IARCIndex from './pages/admin/iarc/Index';
import IARCCriativos from './pages/admin/iarc/Criativos';
import IARCWizardCreativo from './pages/admin/iarc/WizardCreativo';
import IARCLandingPages from './pages/admin/iarc/LandingPages';
import IARCWizardLandingPage from './pages/admin/iarc/WizardLandingPage';
import IARCCopyGenerator from './pages/admin/iarc/CopyGenerator';
import LandingPageEditor from './pages/admin/lp/Editor';

// Landing Pages Públicas
import LandingPageView from './pages/LandingPageView';
import TeodoroTemplatePage from './pages/TeodoroTemplatePage';
import Desafio12DTemplatePage from './pages/Desafio12DTemplatePage';
import LandingPage2 from './pages/LandingPage2';

// Super Admin
import SuperAdminLayout from './components/super-admin/SuperAdminLayout';
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import SuperAdminTenants from './pages/super-admin/Tenants';
import SuperAdminTenantDetails from './pages/super-admin/TenantDetails';
import SuperAdminFinanceiro from './pages/super-admin/Financeiro';
import SuperAdminNovoTenant from './pages/super-admin/NovoTenant';
import SuperAdminRecursos from './pages/super-admin/Recursos';
import SuperAdminCatalogo from './pages/super-admin/CatalogoModulos';
import AvaliacoesConfig from './pages/admin/AvaliacoesConfig';

// Cliente SaaS (Ambiente Isolado)
import ClienteLayout from './components/cliente/ClienteLayout';
import ProtectedClienteRoute from './components/cliente/ProtectedClienteRoute';
import ClienteDashboard from './pages/cliente/Dashboard';
import ClienteModulos from './pages/cliente/Modulos';
import ClienteAssinatura from './pages/cliente/Assinatura';
import ClienteEquipe from './pages/cliente/Equipe';
import ClienteConfiguracoes from './pages/cliente/Configuracoes';
import ClienteAjuda from './pages/cliente/Ajuda';
 import BlogDashboard from './pages/admin/blog/Dashboard';
 import BlogGerarPosts from './pages/admin/blog/GerarPosts';
 import BlogFilaRevisao from './pages/admin/blog/FilaRevisao';
 import BlogBancoKeywords from './pages/admin/blog/BancoKeywords';
 import BlogConfiguracoes from './pages/admin/blog/Configuracoes';
 import BlogLogs from './pages/admin/blog/Logs';
 import BlogImportarKeywords from './pages/admin/blog/ImportarKeywords';
import TecnicoLayout from "./components/tecnico/TecnicoLayout";
import AdminParcerias from "./pages/admin/Parcerias";
import AdminNotasFiscais from "./pages/admin/NotasFiscais";
import AdminOrcamentos from "./pages/admin/Orcamentos";
import AdminServicos from "./pages/admin/Servicos";
 import AdminCanais from "./pages/admin/Canais";
import ScriptsAtendimento from "./pages/admin/ScriptsAtendimento";
import ComandosBot from "./pages/admin/ComandosBot";
import TecnicoServicos from "./pages/tecnico/Servicos";
import TecnicoPerfil from "./pages/tecnico/Perfil";
import TecnicoAuth from "./pages/tecnico/Auth";
import TecnicoTrajetoAtivo from "./pages/tecnico/TrajetoAtivo";
import HistoricoTracking from "./pages/admin/HistoricoTracking";
import AdminAjuda from "./pages/admin/Ajuda";

// Parceiro - Nova estrutura
import ParceiroIndex from "./pages/parceiro/Index";
import ParceiroAuth from "./pages/parceiro/Auth";
import ParceiroProtectedLayout from "./components/parceiro/ParceiroProtectedLayout";
import ParceiroDashboard from "./pages/parceiro/Dashboard";
import ParceiroLinks from "./pages/parceiro/Links";
import ParceiroConversoes from "./pages/parceiro/Conversoes";
import ParceiroSaques from "./pages/parceiro/Saques";
import ParceiroPerfil from "./pages/parceiro/Perfil";
import LinkRedirect from "./pages/parceiro/LinkRedirect";
import ParceiroMateriais from "./pages/parceiro/Materiais";
import Tracking from "./pages/Tracking";
import SitePage from "./pages/SitePage";

import { InitializeCalendar } from "./components/InitializeCalendar";
import { InitializeAdmin } from "./components/InitializeAdmin";
import { useSessionTracking } from "./hooks/useSessionTracking";
 import { CanalRedirect } from "./components/CanalRedirect";
import { trackPageView, persistUtmParams } from "./utils/facebookPixel";

const queryClient = new QueryClient();

// Global error handler para unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    event.preventDefault();
  });
}

// Hook para SPA PageView tracking
function useSpaPageTracking() {
  const location = useLocation();
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    // Persistir UTMs na entrada
    persistUtmParams();
  }, []);
  
  useEffect(() => {
    // Não disparar na primeira renderização (o HTML já faz PageView)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Disparar PageView em navegações SPA subsequentes
    trackPageView();
  }, [location.pathname]);
}

// Componente interno que usa hooks do Router
const AppRoutes = () => {
  useSessionTracking();
  useSpaPageTracking();
  
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<Index />} />
      <Route path="/site" element={<SitePage />} />
      <Route path="/promo/sofa" element={<LimpezaSofa />} />
      <Route path="/guia-salve-seu-sofa" element={<GuiaSalveSeuSofa />} />
      <Route path="/receitas-anti-acaro" element={<ReceitasAntiAcaro />} />
      <Route path="/guia-pet" element={<GuiaPet />} />
      <Route path="/kit-airbnb" element={<KitAirbnb />} />
      <Route path="/seja-parceiro" element={<SejaParceiro />} />
      <Route path="/cupons" element={<Cupons />} />
      <Route path="/avaliacoes" element={<Avaliacoes />} />
      <Route path="/agendamento" element={<Agendamento />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/monte-sua-locacao" element={<MonteLocacao />} />
      
      <Route path="/solucao-empresas" element={<SolucaoEmpresas />} />
      <Route path="/privacidade" element={<Privacidade />} />
      
      {/* Rotas de autenticação */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/tecnico/auth" element={<TecnicoAuth />} />
      <Route path="/tecnico/servico" element={<Navigate to="/tecnico/servicos" replace />} />
      <Route path="/admin/tecnico" element={<Navigate to="/admin/tecnicos" replace />} />
      <Route path="/change-password" element={<ChangePassword />} />
       <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Rotas Super Admin */}
      <Route path="/super-admin" element={
        <ProtectedRoute requiredRole="admin">
          <SuperAdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="tenants" element={<SuperAdminTenants />} />
        <Route path="tenants/:id" element={<SuperAdminTenantDetails />} />
        <Route path="financeiro" element={<SuperAdminFinanceiro />} />
        <Route path="novo-tenant" element={<SuperAdminNovoTenant />} />
        <Route path="catalogo" element={<SuperAdminCatalogo />} />
        <Route path="recursos" element={<SuperAdminRecursos />} />
      </Route>
      
      {/* Rotas Cliente SaaS - REDIRECIONAM para /admin (layout unificado) */}
      <Route path="/cliente" element={<Navigate to="/admin" replace />} />
      <Route path="/cliente/*" element={<Navigate to="/admin" replace />} />
      
      {/* Rotas admin protegidas */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="live-view" element={<Navigate to="/admin/analytics" replace />} />
        <Route path="agendamentos" element={<AdminAgendamentos />} />
        <Route path="cupons" element={<AdminCupons />} />
        <Route path="carrinhos-abandonados" element={<AdminCarrinhosAbandonados />} />
        <Route path="templates" element={<AdminTemplates />} />
        <Route path="central-mensagens" element={<CentralMensagens />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="marketing/calendario-editorial" element={<CalendarioEditorial />} />
        <Route path="avaliacoes-config" element={<AvaliacoesConfig />} />
         
         {/* Rotas Blog / SEO */}
         <Route path="blog" element={<BlogDashboard />} />
         <Route path="blog/gerar" element={<BlogGerarPosts />} />
         <Route path="blog/fila" element={<BlogFilaRevisao />} />
         <Route path="blog/keywords" element={<BlogBancoKeywords />} />
         <Route path="blog/importar" element={<BlogImportarKeywords />} />
         <Route path="blog/configuracoes" element={<BlogConfiguracoes />} />
         <Route path="blog/logs" element={<BlogLogs />} />
          
        <Route path="parcerias" element={<AdminParcerias />} />
        <Route path="notas-fiscais" element={<AdminNotasFiscais />} />
        <Route path="orcamentos" element={<AdminOrcamentos />} />
        <Route path="servicos" element={<AdminServicos />} />
        <Route path="relatorios" element={<AdminRelatorios />} />
        <Route path="equipe" element={<AdminEquipe />} />
        
        {/* IARC Studio */}
        <Route path="iarc" element={<IARCIndex />} />
        <Route path="iarc/criativos" element={<IARCCriativos />} />
        <Route path="iarc/criativos/wizard" element={<IARCWizardCreativo />} />
        <Route path="iarc/landing-pages" element={<IARCLandingPages />} />
        <Route path="iarc/landing-pages/wizard" element={<IARCWizardLandingPage />} />
        <Route path="iarc/copy-generator" element={<IARCCopyGenerator />} />
        <Route path="lp/:id/editor" element={<LandingPageEditor />} />
        
        {/* Rotas Financeiro */}
        <Route path="financeiro" element={<FinanceiroDashboard />} />
        <Route path="financeiro/consolidado" element={<FinanceiroConsolidado />} />
        <Route path="financeiro/receitas" element={<FinanceiroReceitas />} />
        <Route path="financeiro/despesas" element={<FinanceiroDespesas />} />
        <Route path="financeiro/fluxo-caixa" element={<FinanceiroFluxoCaixa />} />
        <Route path="financeiro/metas" element={<FinanceiroMetas />} />
        
        {/* Rotas Integrações */}
        <Route path="integracoes/anuncios" element={<IntegracoesAnuncios />} />
        <Route path="integracoes/pixel" element={<Navigate to="/admin/analytics?tab=marketing" replace />} />
        <Route path="integracoes/webhook" element={<IntegracoesWebhook />} />
        <Route path="integracoes/utmify" element={<IntegracoesUTMify />} />
        <Route path="integracoes/utmify-dashboard" element={<UTMifyDashboard />} />
         <Route path="integracoes/canais" element={<AdminCanais />} />
        <Route path="integracoes/whatsapp" element={<IntegracoesWhatsApp />} />
        <Route path="integracoes/whatsapp-config" element={<IntegracoesWhatsAppConfig />} />
        <Route path="integracoes/whatsapp-despesas" element={<IntegracoesWhatsAppDespesas />} />
        
        {/* Push Notifications */}
        <Route path="push-notifications" element={<PushNotifications />} />
        
        {/* WhatsApp Dashboards */}
        <Route path="whatsapp-dashboard" element={<WhatsAppDashboard />} />
        
        {/* Rotas Técnicos */}
        <Route path="tecnicos" element={<AdminTecnicos />} />
        <Route path="tracking" element={<HistoricoTracking />} />
        <Route path="scripts-atendimento" element={<ScriptsAtendimento />} />
        <Route path="comandos-bot" element={<ComandosBot />} />
        
        
        {/* Perfil */}
        <Route path="perfil" element={<Perfil />} />
        
        {/* Ajuda */}
        <Route path="ajuda" element={<AdminAjuda />} />
      </Route>
      
      {/* Área Técnico - SEPARADA da área admin */}
      <Route path="/tecnico" element={
        <ProtectedRoute requiredRole="tecnico">
          <TecnicoLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/tecnico/servicos" replace />} />
        <Route path="servicos" element={<TecnicoServicos />} />
        <Route path="perfil" element={<TecnicoPerfil />} />
      </Route>
      
      {/* Tela de trajeto ativo (fullscreen, fora do layout) */}
      <Route path="/tecnico/trajeto/:sessionId" element={
        <ProtectedRoute requiredRole="tecnico">
          <TecnicoTrajetoAtivo />
        </ProtectedRoute>
      } />
      
      {/* Área Parceiro - Nova estrutura limpa */}
      <Route path="/parceiro" element={<ParceiroIndex />} />
      <Route path="/parceiro/auth" element={<ParceiroAuth />} />
      
      {/* Rotas protegidas do parceiro com layout */}
      <Route element={<ParceiroProtectedLayout />}>
        <Route path="/parceiro/dashboard" element={<ParceiroDashboard />} />
        <Route path="/parceiro/links" element={<ParceiroLinks />} />
        <Route path="/parceiro/materiais" element={<ParceiroMateriais />} />
        <Route path="/parceiro/conversoes" element={<ParceiroConversoes />} />
        <Route path="/parceiro/saques" element={<ParceiroSaques />} />
        <Route path="/parceiro/perfil" element={<ParceiroPerfil />} />
      </Route>
      
      {/* Link Redirect para parceiros */}
      <Route path="/p/:codigo" element={<LinkRedirect />} />
      
      {/* Rastreamento em tempo real */}
      <Route path="/tracking/:token" element={<Tracking />} />
      
       {/* Rotas curtas para canais internos */}
       <Route path="/bio" element={<CanalRedirect codigo="bio" />} />
       <Route path="/stories" element={<CanalRedirect codigo="stories" />} />
       <Route path="/google" element={<CanalRedirect codigo="google-organico" />} />
       <Route path="/maps" element={<CanalRedirect codigo="google-maps" />} />
       <Route path="/blog" element={<CanalRedirect codigo="blog" />} />
       
       {/* Landing Pages Públicas */}
       <Route path="/lp/:slug" element={<LandingPageView />} />
       <Route path="/lp-teodoro" element={<TeodoroTemplatePage />} />
       <Route path="/lp-12d" element={<Desafio12DTemplatePage />} />
       <Route path="/lp2" element={<LandingPage2 />} />
        
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <InitializeCalendar />
        <InitializeAdmin />
        <Toaster />
        <Sonner />
        <LGPDConsent />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

