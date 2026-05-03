import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Phone, Mail, MessageSquare, ArrowRight, Loader2, Shield, Clock, Headphones } from 'lucide-react';
import DOMPurify from 'dompurify';
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DIGITS, WHATSAPP_BOT } from '@/lib/constants';

export default function CTASection() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    tecnicos: '',
    mensagem: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, telefone: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Track conversion
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead', {
          content_name: 'Demo Request B2B',
          content_category: 'SaaS Lead',
          value: formData.tecnicos ? parseInt(formData.tecnicos) * 100 : 500,
          currency: 'BRL',
        });
      }

      // Sanitize inputs
      const sanitizedData = {
        nome: DOMPurify.sanitize(formData.nome.trim()),
        email: DOMPurify.sanitize(formData.email.trim().toLowerCase()),
        telefone: DOMPurify.sanitize(formData.telefone.replace(/\D/g, '')),
        empresa: DOMPurify.sanitize(formData.empresa.trim()),
        mensagem: DOMPurify.sanitize(`Técnicos: ${formData.tecnicos || 'Não informado'}\n${formData.mensagem.trim()}`),
        origem: 'landing_b2b',
        status: 'novo',
      };

      const { error } = await supabase
        .from('leads_white_label')
        .insert([sanitizedData]);

      if (error) throw error;

      setSubmitted(true);
      toast.success('Solicitação enviada com sucesso! Entraremos em contato em breve.');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Erro ao enviar. Tente novamente ou entre em contato via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section id="cta-form" className="py-20 lg:py-32 bg-gradient-to-b from-black via-blue-950/20 to-black relative">
        <div className="container mx-auto px-4">
          <Card className="max-w-xl mx-auto bg-gray-900/80 border-gray-800 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Solicitação Enviada!
              </h3>
              <p className="text-gray-400 mb-6">
                Nossa equipe entrará em contato em até 24 horas úteis para agendar sua demonstração gratuita.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  className="border-gray-700 text-white hover:bg-gray-800"
                  onClick={() => window.open(WHATSAPP_BOT.waLink(), '_blank')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  WhatsApp Direto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="cta-form" className="py-20 lg:py-32 bg-gradient-to-b from-black via-blue-950/20 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto px-1 sm:px-0">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                <span className="text-white">Pronto para </span>
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Transformar
                </span>
                <span className="text-white"> seu Negócio?</span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-400">
                Agende uma demonstração gratuita e veja como podemos ajudar sua empresa a crescer.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-medium">Demo personalizada de 30 min</h4>
                  <p className="text-gray-400 text-sm">Mostramos exatamente como o sistema se adapta ao seu negócio</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-medium">14 dias grátis para testar</h4>
                  <p className="text-gray-400 text-sm">Sem cartão de crédito, sem compromisso</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-5 h-5 text-green-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-medium">Suporte na implementação</h4>
                  <p className="text-gray-400 text-sm">Te ajudamos a configurar tudo do zero</p>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
              <a href={SUPPORT_PHONE_DIGITS ? `tel:+${SUPPORT_PHONE_DIGITS}` : '#'} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>{SUPPORT_PHONE || 'Telefone não configurado'}</span>
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span className="break-all">{SUPPORT_EMAIL}</span>
              </a>
            </div>
          </div>

          {/* Right - Form */}
          <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm shadow-2xl shadow-blue-500/5 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Agendar Demonstração</CardTitle>
              <CardDescription className="text-gray-400">
                Preencha seus dados e entraremos em contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-gray-300">Nome *</Label>
                    <Input
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      placeholder="Seu nome"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-gray-300">WhatsApp *</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handlePhoneChange}
                      required
                      placeholder="(00) 00000-0000"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com"
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="empresa" className="text-gray-300">Nome da Empresa *</Label>
                    <Input
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      required
                      placeholder="Sua empresa"
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tecnicos" className="text-gray-300">Qtd. Técnicos</Label>
                    <Select
                      value={formData.tecnicos}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tecnicos: value }))}
                    >
                      <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="1" className="text-gray-200 focus:bg-gray-700 focus:text-white">1 técnico</SelectItem>
                        <SelectItem value="2-5" className="text-gray-200 focus:bg-gray-700 focus:text-white">2 a 5 técnicos</SelectItem>
                        <SelectItem value="6-10" className="text-gray-200 focus:bg-gray-700 focus:text-white">6 a 10 técnicos</SelectItem>
                        <SelectItem value="10+" className="text-gray-200 focus:bg-gray-700 focus:text-white">Mais de 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagem" className="text-gray-300">Mensagem (opcional)</Label>
                  <Textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    placeholder="Conte-nos sobre sua empresa e seus desafios..."
                    rows={3}
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 text-base font-medium group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Agendar Minha Demonstração
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center pt-2">
                  🔒 Seus dados estão seguros. Não compartilhamos com terceiros.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
