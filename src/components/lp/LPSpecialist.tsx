import { motion } from 'framer-motion';
import { LPTheme, getTheme, getAnimationVariants } from '@/styles/lp-themes';
import { Check, Award, Shield, Users, Star } from 'lucide-react';

interface LPSpecialistProps {
  titulo?: string;
  subtitulo?: string;
  texto?: string;
  credenciais?: string[];
  imagemUrl?: string;
  theme?: LPTheme;
}

const credencialIcons = [Award, Shield, Users, Star, Check];

const LPSpecialist = ({
  titulo = 'Conheça a RC Limpa Mais',
  subtitulo = 'Referência em Higienização de Estofados em BH',
  texto = 'Desde 2018, a RC Limpa Mais tem transformado ambientes em toda Belo Horizonte e região metropolitana. Nossa missão é simples: entregar resultados que superam expectativas.\n\nCom uma equipe treinada e equipamentos de última geração, garantimos uma higienização profunda que você pode ver e sentir. Cada serviço é executado com carinho e profissionalismo, porque sabemos que seu lar merece o melhor.',
  credenciais = [
    '+5.000 clientes atendidos',
    'Equipe certificada e treinada',
    'Produtos biodegradáveis e seguros',
    'Garantia de satisfação ou dinheiro de volta',
    'Atendimento em toda região metropolitana',
  ],
  imagemUrl,
  theme = 'midnight',
}: LPSpecialistProps) => {
  const t = getTheme(theme);
  const variants = getAnimationVariants(theme);

  // Parse texto em parágrafos
  const paragrafos = texto.split('\n\n').filter(Boolean);

  return (
    <section className={`${t.bgPrimary} py-16 md:py-24`}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={variants}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${t.textPrimary} mb-4`}>
            {titulo}
          </h2>
          <p className={`text-xl ${t.accent}`}>
            {subtitulo}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={variants}
            className="space-y-6"
          >
            <div className="space-y-4">
              {paragrafos.map((paragrafo, index) => (
                <p key={index} className={`text-lg ${t.textMuted} leading-relaxed`}>
                  {paragrafo}
                </p>
              ))}
            </div>

            {/* Credenciais */}
            <div className="space-y-3 pt-4">
              {credenciais.map((credencial, index) => {
                const Icon = credencialIcons[index % credencialIcons.length];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${t.gradientIcon} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-lg ${t.textPrimary}`}>
                      {credencial}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Imagem */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={variants}
            className="relative"
          >
            <div className={`relative rounded-2xl overflow-hidden ${t.border} border`}>
              {imagemUrl ? (
                <img 
                  src={imagemUrl} 
                  alt="Equipe profissional" 
                  className="w-full h-80 lg:h-[450px] object-cover"
                />
              ) : (
                <div className={`w-full h-80 lg:h-[450px] bg-gradient-to-br ${t.gradientIcon} flex items-center justify-center`}>
                  <div className="text-center text-white/80">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                      <Users className="w-12 h-12" />
                    </div>
                    <p className="text-sm">Foto da equipe</p>
                  </div>
                </div>
              )}

              {/* Badge flutuante */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring' }}
                className={`absolute -bottom-4 -left-4 bg-gradient-to-r ${t.gradientButton} text-white px-6 py-3 rounded-xl shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  <div>
                    <p className="text-sm font-medium opacity-90">Desde</p>
                    <p className="text-2xl font-bold">2018</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <div className={`absolute -top-6 -right-6 w-40 h-40 bg-gradient-to-br ${t.gradientPrimary} rounded-full opacity-10 blur-3xl`} />
            <div className={`absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br ${t.gradientPrimary} rounded-full opacity-10 blur-3xl`} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LPSpecialist;
