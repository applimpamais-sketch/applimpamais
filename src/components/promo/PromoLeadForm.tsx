import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, MessageCircle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { usePublicTenantId } from '@/hooks/usePublicTenantId';

const cidades = [
  'Belo Horizonte',
  'Contagem',
  'Betim',
  'Nova Lima',
  'Santa Luzia',
  'Sabará',
  'Ribeirão das Neves',
  'Vespasiano',
  'Lagoa Santa',
  'Pedro Leopoldo',
];

const PromoLeadForm = () => {
  const { data: tenantId } = usePublicTenantId();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabaseForPublicLeads = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    return createClient<Database>(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          'x-tenant-id': tenantId || '',
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }, [tenantId]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !telefone.trim() || !cidade) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const phoneNumbers = telefone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      toast.error('Telefone inválido');
      return;
    }

    setLoading(true);

    try {
      if (!tenantId) {
        toast.error('Não foi possível identificar a loja para registrar seu lead');
        return;
      }

      // Get UTM params from session storage
      const utmData = sessionStorage.getItem('promo_utm');
      const utm = utmData ? JSON.parse(utmData) : {};

      const { error } = await supabaseForPublicLeads.from('leads_cupom').insert({
        nome_completo: DOMPurify.sanitize(nome.trim()),
        whatsapp: phoneNumbers,
        cidade: DOMPurify.sanitize(cidade),
        bairro: DOMPurify.sanitize(bairro.trim() || 'Não informado'),
        cupom_codigo: 'SOFA149',
        origem: utm.utm_source ? `promo-sofa|${utm.utm_source}|${utm.utm_campaign || ''}` : 'promo-sofa-landing',
        tenant_id: tenantId,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Solicitação enviada! Entraremos em contato em breve.');
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error('Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Vi a promoção de limpeza de sofá por R$ 149,90 e gostaria de agendar.`
  );
  const whatsappLink = `https://wa.me/5531999999999?text=${whatsappMessage}`;

  if (submitted) {
    return (
      <section id="lead-form" className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-green-500/30"
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Solicitação Enviada!</h3>
          <p className="text-gray-400 mb-6">
            Nossa equipe entrará em contato pelo WhatsApp em até 2 horas para confirmar seu agendamento.
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Prefere falar agora? Clique aqui
          </a>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="lead-form" className="py-20 px-4 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Garanta seu <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Desconto</span>
          </h2>
          <p className="text-gray-400">
            Preencha o formulário e entraremos em contato para agendar
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="p-6 md:p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-gray-800"
        >
          <div className="space-y-5">
            <div>
              <Label htmlFor="nome" className="text-white">Nome completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="mt-1.5 bg-background/50 border-gray-800 focus:border-blue-500/50"
                required
              />
            </div>

            <div>
              <Label htmlFor="telefone" className="text-white">WhatsApp *</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(formatPhone(e.target.value))}
                placeholder="(31) 99999-9999"
                className="mt-1.5 bg-background/50 border-gray-800 focus:border-blue-500/50"
                required
              />
            </div>

            <div>
              <Label htmlFor="cidade" className="text-white">Cidade *</Label>
              <Select value={cidade} onValueChange={setCidade} required>
                <SelectTrigger className="mt-1.5 bg-background/50 border-gray-800 focus:border-blue-500/50">
                  <SelectValue placeholder="Selecione sua cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cidades.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bairro" className="text-white">Bairro</Label>
              <Input
                id="bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Seu bairro (opcional)"
                className="mt-1.5 bg-background/50 border-gray-800 focus:border-blue-500/50"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-6 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Quero Agendar por R$ 149,90
              </>
            )}
          </Button>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-500 mb-3">Ou entre em contato diretamente:</p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              <Phone className="w-4 h-4" />
              WhatsApp: (31) 99999-9999
            </a>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default PromoLeadForm;
