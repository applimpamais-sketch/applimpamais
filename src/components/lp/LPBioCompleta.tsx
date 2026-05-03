import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface LPBioCompletaProps {
  badgeText?: string;
  titulo?: string;
  tituloDestaque?: string;
  nome?: string;
  bio?: string;
  credenciais?: string[];
  registro?: string;
  imagemUrl?: string;
  ctaText?: string;
  theme?: string;
  onCtaClick?: () => void;
}

const LPBioCompleta = ({
  badgeText = 'Entenda sua dor e cuide da vida',
  titulo = 'VOCÊ MERECE VIVER',
  tituloDestaque = 'COM CONFORTO E ALEGRIA',
  nome = 'Dr. Teodoro Bernardes',
  bio = `Me chamo Teodoro Bernardes, sou natural de Picos (PI), filhos de José e Jocileide, ambos professores, e irmão de Laís e Victor Daniel.

Escolhi fazer medicina ainda enquanto criança, pois sempre gostei de ajudar aos outros e via no médico essa figura da pessoa de bom coração. E decidi fazer ortopedia, por encontrar nela o ápice da gratificação enquanto médico, uma vez que não há para mim algo mais gratificante quanto o paciente agradece por ter aliviado aquela dor que tanto o incomodava.

Meu propósito de vida é ajudar a melhorar a saúde das pessoas através da medicina. E possuo o foco de atuação em ajudar aliviar aquelas dores de difícil controle e restaurar a qualidade de vida de quem convive com dores crônicas.

Para isso, utilizo novas técnicas baseada em ciência de ponta e tecnologias de alta performance.

Trato dores como artrose, tendinite, bursite, hérnia de disco, epicondilite lateral, síndrome do túnel do carpo, fascite plantar, esporão, entre outras.

Estou pronto para te ajudar a voltar a realizar tudo aquilo que você gosta de fazer mas que a dor permite!`,
  credenciais = [
    'Ortopedista e Traumatologista pelo Hosp. Municipal Prof. Dr. Alipio Correa Neto (SP)',
    'Membro da Sociedade Brasileira de Ortopedia e Traumatologia',
    'Fellowship em Cirurgia do Joelho pela Ortocity Serviços Médicos (SP)',
    'Membro da Sociedade Brasileira de Cirurgia do Joelho',
    'Membro da Sociedade Latino-Americana de Dor',
    'Membro da Associação Brasileira de Pesquisa em Medicina Regenerativa',
    'Membro da Sociedade Brasileira para Estudo da Dor',
    'Membro da Sociedade Brasileira de Regeneração Tecidual',
  ],
  registro = 'CRM-PI 6621                     RQE4330',
  imagemUrl = 'https://page.dsgnrafa.com/wp-content/uploads/2024/07/drteodorobernardes_420130363_18405826960013981_6204951090499063570_n-819x1024.jpg',
  ctaText = 'AGENDAR MINHA CONSULTA',
  onCtaClick,
}: LPBioCompletaProps) => {
  const paragrafos = bio.split('\n\n').filter(Boolean);

  return (
    <section id="esp" className="bg-[#080808] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Imagem Column with logo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Logo TB */}
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TB</span>
                </div>
                <div className="text-white text-xs">
                  <div className="font-light">Dr. Teodoro Bernardes</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden">
              <img 
                src={imagemUrl}
                alt={nome}
                className="w-full h-auto lg:h-[600px] object-cover object-top"
              />
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Badge */}
            {badgeText && (
              <span className="inline-block px-4 py-2 rounded-full border border-white/20 text-white/70 text-sm">
                {badgeText}
              </span>
            )}

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-normal text-white leading-tight">
              {titulo}
              <br />
              <span className="flex items-center gap-2 flex-wrap">
                <span className="inline-block w-8 h-8">🙌</span>
                <span className="text-[#FF6B35]">{tituloDestaque}</span>
                <span className="inline-block w-8 h-8">🙌</span>
              </span>
            </h2>

            {/* Bio paragraphs */}
            <div className="space-y-4 max-h-64 overflow-y-auto pr-4 custom-scrollbar">
              {paragrafos.map((p, index) => (
                <p key={index} className="text-sm text-white/70 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            {/* Credenciais */}
            <div className="space-y-1 pt-4 border-t border-white/10">
              {credenciais.map((cred, index) => (
                <p key={index} className="text-xs text-white/50">
                  {cred}{index < credenciais.length - 1 ? ';' : '.'}
                </p>
              ))}
            </div>

            {/* Registro */}
            {registro && (
              <p className="text-sm text-white font-medium pt-2">
                {registro}
              </p>
            )}

            {/* CTA */}
            {onCtaClick && (
              <Button
                onClick={onCtaClick}
                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-6 py-5 rounded-lg text-sm font-medium group"
              >
                {ctaText}
                <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LPBioCompleta;
