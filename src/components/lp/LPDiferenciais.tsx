import { motion } from 'framer-motion';
import { Clock, Lightbulb, ClipboardList, HeadphonesIcon } from 'lucide-react';

interface Diferencial {
  titulo: string;
  descricao: string;
  icone?: 'clock' | 'lightbulb' | 'clipboard' | 'headphones';
}

interface LPDiferenciaisProps {
  badgeText?: string;
  titulo?: string;
  diferenciais?: Diferencial[];
  backgroundUrl?: string;
  theme?: string;
}

const iconMap = {
  clock: Clock,
  lightbulb: Lightbulb,
  clipboard: ClipboardList,
  headphones: HeadphonesIcon,
};

const defaultDiferenciais: Diferencial[] = [
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
];

const LPDiferenciais = ({
  badgeText = 'Escolha certa:',
  titulo = 'Por Que o Instituto Bernardes é a Escolha Certa para Você?',
  diferenciais = defaultDiferenciais,
  backgroundUrl = 'https://page.dsgnrafa.com/wp-content/uploads/2024/07/Captura-de-tela-2024-07-15-112809.png',
}: LPDiferenciaisProps) => {
  return (
    <section 
      className="relative py-20 md:py-28"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(8,8,8,0.85), rgba(8,8,8,0.95)), url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {badgeText && (
            <span className="inline-block px-4 py-2 rounded-full border border-white/20 text-white/70 text-sm mb-6">
              {badgeText}
            </span>
          )}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-white leading-tight max-w-3xl mx-auto">
            {titulo}
          </h2>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {diferenciais.map((dif, index) => {
            const IconComponent = iconMap[dif.icone || 'clock'];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group"
              >
                {/* Ícone */}
                <div className="w-14 h-14 rounded-xl bg-[#BFCED3]/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <IconComponent className="w-7 h-7 text-[#BFCED3]" />
                </div>

                <h3 className="text-lg font-medium text-white mb-2">
                  {dif.titulo}
                </h3>
                
                <p className="text-white/60 text-sm leading-relaxed">
                  {dif.descricao}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LPDiferenciais;
