import { motion } from 'framer-motion';
import { Phone, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TrackingActionButtonsProps {
  telefoneEmpresa?: string;
  nomeCliente?: string;
}

export default function TrackingActionButtons({
  telefoneEmpresa = '5531991356855', // Número padrão RC Limpa Mais
  nomeCliente,
}: TrackingActionButtonsProps) {
  const handleLigar = () => {
    window.open(`tel:+${telefoneEmpresa}`, '_self');
  };

  const handleWhatsApp = () => {
    const mensagem = nomeCliente
      ? `Olá! Sou ${nomeCliente} e estou acompanhando o trajeto do técnico.`
      : 'Olá! Estou acompanhando o trajeto do técnico.';
    
    window.open(
      `https://wa.me/${telefoneEmpresa}?text=${encodeURIComponent(mensagem)}`,
      '_blank'
    );
  };

  const handleCompartilhar = async () => {
    const url = window.location.href;
    const texto = 'Acompanhe a chegada do técnico da RC Limpa Mais';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RC Limpa Mais - Rastreamento',
          text: texto,
          url: url,
        });
      } catch (error) {
        // Usuário cancelou ou erro - fallback para copiar
        await navigator.clipboard.writeText(url);
        toast.success('Link copiado!');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  };

  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Button
        variant="outline"
        onClick={handleLigar}
        className="flex-1 h-12"
      >
        <Phone className="mr-2 h-4 w-4" />
        Ligar
      </Button>
      
      <Button
        onClick={handleWhatsApp}
        className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>

      <Button
        variant="outline"
        onClick={handleCompartilhar}
        size="icon"
        className="h-12 w-12 shrink-0"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
