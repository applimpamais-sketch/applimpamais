import { motion } from 'framer-motion';
import { CheckCircle2, MessageCircle, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WHATSAPP_BOT } from '@/lib/constants';

interface TrackingThankYouProps {
  tipoServico: 'locacao' | 'limpeza';
  nomeCliente?: string;
  tecnicoNome?: string | null;
}

export default function TrackingThankYou({
  tipoServico,
  nomeCliente,
  tecnicoNome,
}: TrackingThankYouProps) {
  const primeiroNome = nomeCliente?.split(' ')[0] || '';
  
  const handleWhatsAppSupport = () => {
    const texto = tipoServico === 'locacao'
      ? 'Olá! Acabei de receber a máquina de aluguel e tenho uma dúvida.'
      : 'Olá! O técnico acabou de realizar o serviço e tenho uma dúvida.';
    window.open(WHATSAPP_BOT.waLink(texto), '_blank');
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Ícone de sucesso */}
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/30 mb-4"
        >
          <CheckCircle2 className="h-12 w-12 text-white" />
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {tecnicoNome ? `${tecnicoNome} chegou!` : 'O técnico chegou!'}
        </motion.h2>
      </div>

      {/* Card de mensagem */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardContent className="pt-6 text-center space-y-4">
            {tipoServico === 'locacao' ? (
              <>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">
                    Obrigado por contratar o aluguel da máquina de limpar estofados{primeiroNome ? `, ${primeiroNome}` : ''}! 🎉
                  </p>
                  <p className="text-muted-foreground">
                    Qualquer dúvida sobre o uso da máquina é só chamar no WhatsApp do nosso suporte.
                  </p>
                </div>
                
                <div className="pt-2 space-y-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                  <p className="font-medium text-blue-600 dark:text-blue-400">💡 Dica:</p>
                  <p>Lembre-se de devolver a máquina no prazo combinado. Caso precise estender, avise-nos com antecedência!</p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">
                    Obrigado por contratar nossos serviços{primeiroNome ? `, ${primeiroNome}` : ''}! 🎉
                  </p>
                  <p className="text-muted-foreground">
                    Qualquer dúvida pode perguntar diretamente ao técnico{tecnicoNome ? ` ${tecnicoNome}` : ''}.
                  </p>
                </div>

                <div className="pt-2 space-y-2 text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                  <p className="font-medium text-amber-600 dark:text-amber-400">📝 Após o serviço:</p>
                  <p>Para dúvidas, elogios, reclamações ou feedback, chame no WhatsApp do nosso suporte.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Botão WhatsApp */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={handleWhatsAppSupport}
          className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Falar com Suporte
        </Button>
      </motion.div>

      {/* Footer com opções */}
      <motion.div
        className="flex justify-center gap-6 text-sm text-muted-foreground pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={handleWhatsAppSupport}
          className="flex items-center gap-1.5 hover:text-primary transition-colors"
        >
          <Star className="h-4 w-4" />
          Avaliar serviço
        </button>
        <a
          href="tel:+553194678382"
          className="flex items-center gap-1.5 hover:text-primary transition-colors"
        >
          <Phone className="h-4 w-4" />
          Ligar
        </a>
      </motion.div>
    </motion.div>
  );
}
