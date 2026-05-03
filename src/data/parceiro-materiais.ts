 // Dados dos materiais de marketing para parceiros
 
 export interface ImagemData {
   id: string;
   nome: string;
   descricao: string;
   dimensao: string;
   tipo: 'feed' | 'stories';
   preview: string;
   download: string;
 }
 
 export interface VideoData {
   id: string;
   nome: string;
   descricao: string;
   duracao: string;
   tipo: 'reels' | 'stories' | 'tiktok';
   preview: string;
   download: string;
 }
 
 export interface TextoData {
   id: string;
   titulo: string;
   descricao: string;
   texto: string;
   categoria: 'whatsapp' | 'instagram' | 'status';
   icone: string;
 }
 
 export const imagensData: ImagemData[] = [
   {
    id: 'tutorial-3-passos',
    nome: 'Tutorial 3 Passos',
    descricao: 'Limpeza sem complicação - Selecione, escolha a data, pronto!',
     dimensao: '1080x1080',
     tipo: 'feed',
    preview: '/materiais/criativo-loja-01.png',
    download: '/materiais/criativo-loja-01.png'
   },
   {
    id: 'multi-dispositivo',
    nome: 'Agora Ficou Fácil Agendar',
    descricao: 'Mostra agendamento pelo celular ou computador',
    dimensao: '1080x1080',
     tipo: 'feed',
    preview: '/materiais/criativo-loja-02.png',
    download: '/materiais/criativo-loja-02.png'
   },
   {
    id: 'agende-minutos-20off',
    nome: 'Agende em Minutos - 10% OFF',
    descricao: 'Serviço sendo executado com celular mostrando agendamento',
    dimensao: '1080x1080',
    tipo: 'feed',
    preview: '/materiais/criativo-loja-04-variacao.png',
    download: '/materiais/criativo-loja-04-variacao.png'
  },
  {
    id: 'prova-social',
    nome: 'Quem Já Agendou Recomenda',
    descricao: 'Prova social com depoimento de cliente satisfeito',
    dimensao: '1080x1080',
    tipo: 'feed',
    preview: '/materiais/criativo-loja-05-variacao.png',
    download: '/materiais/criativo-loja-05-variacao.png'
  },
  {
    id: 'escolha-sua',
    nome: 'A Escolha é Sua',
    descricao: 'Comparativo entre Serviço e Aluguel lado a lado',
    dimensao: '1080x1080',
    tipo: 'feed',
    preview: '/materiais/criativo-loja-06.png',
    download: '/materiais/criativo-loja-06.png'
  },
  {
    id: 'desconto-20',
    nome: '10% de Desconto',
    descricao: 'Limpeza de estofados com cupom promocional',
    dimensao: '1080x1080',
    tipo: 'feed',
    preview: '/materiais/criativo-loja-07-variacao.png',
    download: '/materiais/criativo-loja-07-variacao.png'
  },
  {
    id: 'sofa-limpo-claro',
    nome: 'Sofá Limpo 10% OFF',
    descricao: 'Fundo verde claro com mockup do sistema',
    dimensao: '1080x1080',
    tipo: 'feed',
    preview: '/materiais/criativo-loja-08.png',
    download: '/materiais/criativo-loja-08.png'
  },
  {
    id: 'sofa-limpo-escuro',
    nome: 'Sofá Limpo 10% OFF - Variação',
    descricao: 'Fundo escuro com técnico realizando limpeza',
    dimensao: '1080x1080',
    tipo: 'feed',
    preview: '/materiais/criativo-loja-08-variacao.png',
    download: '/materiais/criativo-loja-08-variacao.png'
   }
 ];
 
 export const videosData: VideoData[] = [
   {
     id: 'video-01',
     nome: 'Limpeza Profissional',
     descricao: 'Demonstração de limpeza de estofados',
     duracao: '0:30',
     tipo: 'reels',
     preview: '/materiais/videos/video-01.mp4',
     download: '/materiais/videos/video-01.mp4'
   },
   {
     id: 'video-02',
     nome: 'Resultado Incrível',
     descricao: 'Antes e depois da limpeza',
     duracao: '0:30',
     tipo: 'reels',
     preview: '/materiais/videos/video-02.mp4',
     download: '/materiais/videos/video-02.mp4'
   },
   {
     id: 'video-03',
     nome: 'Técnica Especializada',
     descricao: 'Processo de limpeza profunda',
     duracao: '0:30',
     tipo: 'reels',
     preview: '/materiais/videos/video-03.mp4',
     download: '/materiais/videos/video-03.mp4'
   },
   {
     id: 'video-04',
     nome: 'Transformação Completa',
     descricao: 'Renovação de estofados',
     duracao: '0:30',
     tipo: 'reels',
     preview: '/materiais/videos/video-04.mp4',
     download: '/materiais/videos/video-04.mp4'
   },
   {
     id: 'video-05',
     nome: 'Higienização Profunda',
     descricao: 'Eliminação de ácaros e sujeira',
     duracao: '0:30',
     tipo: 'reels',
     preview: '/materiais/videos/video-05.mp4',
     download: '/materiais/videos/video-05.mp4'
   },
   {
     id: 'video-06',
     nome: 'Serviço Profissional',
     descricao: 'Equipe em ação',
     duracao: '0:30',
     tipo: 'reels',
     preview: '/materiais/videos/video-06.mp4',
     download: '/materiais/videos/video-06.mp4'
   },
   {
     id: 'video-07',
     nome: 'Cliente Satisfeito',
     descricao: 'Depoimento e resultado final',
     duracao: '0:30',
     tipo: 'reels',
     preview: '/materiais/videos/video-07.mp4',
     download: '/materiais/videos/video-07.mp4'
   },
   {
     id: 'video-08',
     nome: 'Qualidade Garantida',
     descricao: 'Limpeza com equipamento profissional',
     duracao: '0:30',
     tipo: 'reels',
     preview: '/materiais/videos/video-08.mp4',
     download: '/materiais/videos/video-08.mp4'
   }
 ];
 
 export const textosData: TextoData[] = [
   {
     id: 'whatsapp-geral',
     titulo: 'WhatsApp - Indicação Geral',
     descricao: 'Copy simples para enviar no WhatsApp',
     categoria: 'whatsapp',
     icone: 'MessageCircle',
     texto: `Oi! Precisa limpar sofá, colchão ou tapete?
 
 Agenda pelo meu link e ganha desconto especial!
 👉 {{LINK}}
 
 Serviço profissional com agendamento online. Super prático!`
   },
   {
     id: 'whatsapp-promo',
     titulo: 'WhatsApp - Promoção Urgente',
     descricao: 'Copy com urgência para promoções',
     categoria: 'whatsapp',
     icone: 'Flame',
     texto: `🔥 PROMOÇÃO por tempo limitado!
 
 Limpeza de sofá até 2,5m por R$ 149,90
 (Valor normal: R$ 200)
 
 Agenda aqui: {{LINK}}
 
 Corre que as vagas acabam rápido! 🏃‍♀️`
   },
   {
     id: 'status-whatsapp',
     titulo: 'Status WhatsApp',
     descricao: 'Texto curto para status do WhatsApp',
     categoria: 'status',
     icone: 'Phone',
     texto: `Limpeza de sofá e colchão com desconto! 
 Agenda online pelo meu link 👇
 {{LINK}}`
   },
   {
     id: 'instagram-bio',
     titulo: 'Instagram - Bio',
     descricao: 'Texto para colocar na bio do Instagram',
     categoria: 'instagram',
     icone: 'Instagram',
     texto: `🛋️ Desconto em limpeza de estofados
 👇 Agenda aqui
 {{LINK}}`
   },
   {
     id: 'instagram-post',
     titulo: 'Instagram - Legenda de Post',
     descricao: 'Legenda completa para posts no feed',
     categoria: 'instagram',
     icone: 'Image',
     texto: `Seu sofá está precisando de uma limpeza? 🛋️
 
 Conheço um serviço INCRÍVEL de limpeza profissional!
 ✅ Agendamento online
 ✅ Sem complicação
 ✅ Resultado garantido
 
 E pelo meu link você ganha desconto especial! 💚
 
 Link na bio 👆`
   },
   {
     id: 'whatsapp-estabelecimento',
     titulo: 'WhatsApp - Para Estabelecimentos',
     descricao: 'Copy para salões, pet shops, clínicas',
     categoria: 'whatsapp',
     icone: 'Building',
     texto: `Oi! Você sabia que pode oferecer um serviço extra pros seus clientes e ainda ganhar comissão?
 
 Limpeza profissional de sofá, colchão e estofados.
 
 É só colocar o QR Code no seu estabelecimento - quando o cliente agendar, você ganha 10%!
 
 Quer saber mais? {{LINK}}`
   }
 ];
 
 // Função para substituir o placeholder pelo link real
 export const replaceLinkPlaceholder = (texto: string, link: string): string => {
   return texto.replace(/\{\{LINK\}\}/g, link);
 };
 
 // Backwards compatibility aliases
 export const bannersData = imagensData;
 export const copiesData = textosData;
 export type BannerData = ImagemData;
 export type CopyData = TextoData;