/**
 * Página de demonstração do template Teodoro
 * Réplica fiel da estrutura de https://page.dsgnrafa.com/lp-teodoro/
 */

import LPHeaderTeodoro from '@/components/lp/LPHeaderTeodoro';
import LPHeroTeodoro from '@/components/lp/LPHeroTeodoro';
import LPMarqueeTeodoro from '@/components/lp/LPMarqueeTeodoro';
import LPAboutProblem from '@/components/lp/LPAboutProblem';
import LPInstituto from '@/components/lp/LPInstituto';
import LPDiferenciais from '@/components/lp/LPDiferenciais';
import LPDepoimentosCta from '@/components/lp/LPDepoimentosCta';
import LPBioCompleta from '@/components/lp/LPBioCompleta';
import LPFinalSectionTeodoro from '@/components/lp/LPFinalSectionTeodoro';
import LPFooterTeodoro from '@/components/lp/LPFooterTeodoro';

const TeodoroTemplatePage = () => {
  const whatsappUrl = 'http://wa.me/558999851484';

  const handleCTA = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* 1. Header com navegação */}
      <LPHeaderTeodoro 
        logoUrl="https://page.dsgnrafa.com/wp-content/uploads/2024/07/03-1.svg"
        onCtaClick={handleCTA}
      />

      {/* 2. Hero Section */}
      <LPHeroTeodoro 
        badge="Melhore sua Qualidade de Vida:"
        headline="O Tratamento que está Melhorando a Saúde de quem"
        highlightText="convive com dores crônicas!"
        subheadline="Alívio Seguro e Eficaz com Procedimentos Minimamente Invasivos e com Tecnologia de Alta Performance"
        onCtaClick={handleCTA}
      />

      {/* 3. Marquee "Teodoro Bernardes" */}
      <LPMarqueeTeodoro texto="Teodoro Bernardes" />

      {/* 4. Seção "A Dor Não Precisa Ser sua Companheira" */}
      <LPAboutProblem 
        titulo="A Dor"
        tituloDestaque="Não Precisa Ser sua Companheira Diária"
        texto="Se você ou um ente querido sofre com dores crônicas nos joelhos, coluna, ombros ou mãos, sabe como isso pode tornar atividades simples em desafios insuportáveis.

O envelhecimento, inflamações, sedentarismo e outras condições de saúde não precisam definir sua qualidade de vida."
        destaque="O Dr. Teodoro Bernardes está aqui para oferecer uma solução."
        ctaText="AGENDAR MINHA CONSULTA"
        onCtaClick={handleCTA}
      />

      {/* 5. Instituto Bernardes + Lista de Procedimentos */}
      <LPInstituto 
        badgeText="Conheça o Instituto Bernardes"
        titulo="Tecnologia Avançada e"
        subtitulo="Atendimento Humanizado"
        texto="No Instituto Bernardes, sob a liderança do Dr. Teodoro Bernardes, oferecemos tratamentos inovadores e minimamente invasivos, guiados por ultrassom, para proporcionar alívio duradouro e melhorar sua qualidade de vida."
        procedimentos={[
          { titulo: 'Infiltrações', icone: 'syringe' },
          { titulo: 'Viscossuplementação', icone: 'droplets' },
          { titulo: 'Bloqueios de Nervos', icone: 'zap' },
          { titulo: 'Ortobiológicos', icone: 'leaf' },
          { titulo: 'Fotocêuticos', icone: 'sparkles' },
          { titulo: 'SIS (Sistema Super Indutivo)', icone: 'activity' },
        ]}
        onCtaClick={handleCTA}
      />

      {/* 6. Cards de Diferenciais */}
      <LPDiferenciais 
        badgeText="Escolha certa:"
        titulo="Por Que o Instituto Bernardes é a Escolha Certa para Você?"
        diferenciais={[
          {
            titulo: 'Atendimento Sem filas:',
            descricao: 'Agendamento eficiente para seu conforto.',
            icone: 'clock',
          },
          {
            titulo: 'Pioneirismo em Tecnologia:',
            descricao: 'Primeiro a realizar tratamento com fotocêuticos fora do eixo Rio-SP, oferecer tratamento com células mesenquimais (células-tronco) e realizar tratamento de dor com campo magnético de alta intensidade no Piauí.',
            icone: 'lightbulb',
          },
          {
            titulo: 'Consultas Detalhadas:',
            descricao: 'Avaliamos todos os aspectos da sua saúde, incluindo atendimento em Picos e Teresina.',
            icone: 'clipboard',
          },
          {
            titulo: 'Acompanhamento Pós-Consulta:',
            descricao: 'Garantimos que você tenha suporte contínuo após o tratamento.',
            icone: 'headphones',
          },
        ]}
      />

      {/* 7. Depoimentos com grid de vídeos */}
      <LPDepoimentosCta 
        titulo="O Que Nossos"
        tituloDestaque="Pacientes Dizem"
        subtitulo="Veja os depoimentos no Google e nas redes sociais que comprovam nossa dedicação em oferecer tratamentos eficazes e um atendimento humano."
        videoPlaceholders={6}
        onCtaClick={handleCTA}
      />

      {/* 8. CTA com laptop */}
      <LPFinalSectionTeodoro 
        badgeText="Você não precisa viver com dor"
        titulo="Cuide da Sua"
        tituloDestaque="Saúde Agora"
        onCtaClick={handleCTA}
      />

      {/* 9. Bio completa do Dr. Teodoro */}
      <LPBioCompleta 
        badgeText="Entenda sua dor e cuide da vida"
        titulo="VOCÊ MERECE VIVER"
        tituloDestaque="COM CONFORTO E ALEGRIA"
        nome="Dr. Teodoro Bernardes"
        bio={`Me chamo Teodoro Bernardes, sou natural de Picos (PI), filhos de José e Jocileide, ambos professores, e irmão de Laís e Victor Daniel.

Escolhi fazer medicina ainda enquanto criança, pois sempre gostei de ajudar aos outros e via no médico essa figura da pessoa de bom coração. E decidi fazer ortopedia, por encontrar nela o ápice da gratificação enquanto médico, uma vez que não há para mim algo mais gratificante quanto o paciente agradece por ter aliviado aquela dor que tanto o incomodava.

Meu propósito de vida é ajudar a melhorar a saúde das pessoas através da medicina. E possuo o foco de atuação em ajudar aliviar aquelas dores de difícil controle e restaurar a qualidade de vida de quem convive com dores crônicas.

Para isso, utilizo novas técnicas baseada em ciência de ponta e tecnologias de alta performance.

Trato dores como artrose, tendinite, bursite, hérnia de disco, epicondilite lateral, síndrome do túnel do carpo, fascite plantar, esporão, entre outras.

Estou pronto para te ajudar a voltar a realizar tudo aquilo que você gosta de fazer mas que a dor permite!`}
        credenciais={[
          'Ortopedista e Traumatologista pelo Hosp. Municipal Prof. Dr. Alipio Correa Neto (SP)',
          'Membro da Sociedade Brasileira de Ortopedia e Traumatologia',
          'Fellowship em Cirurgia do Joelho pela Ortocity Serviços Médicos (SP)',
          'Membro da Sociedade Brasileira de Cirurgia do Joelho',
          'Membro da Sociedade Latino-Americana de Dor',
          'Membro da Associação Brasileira de Pesquisa em Medicina Regenerativa',
          'Membro da Sociedade Brasileira para Estudo da Dor',
          'Membro da Sociedade Brasileira de Regeneração Tecidual',
        ]}
        registro="CRM-PI 6621                     RQE4330"
        imagemUrl="https://page.dsgnrafa.com/wp-content/uploads/2024/07/drteodorobernardes_420130363_18405826960013981_6204951090499063570_n-819x1024.jpg"
        onCtaClick={handleCTA}
      />

      {/* 10. Footer */}
      <LPFooterTeodoro ano="2024" />
    </div>
  );
};

export default TeodoroTemplatePage;
