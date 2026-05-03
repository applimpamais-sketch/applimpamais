 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { ArrowRight, Loader2, CheckCircle } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 
 const SejaParceiroCTA = () => {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
     nome: '',
     whatsapp: '',
     instagram: '',
   });
 
   const formatPhone = (value: string) => {
     const digits = value.replace(/\D/g, '');
     if (digits.length <= 2) return digits;
     if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
     return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!formData.nome || !formData.whatsapp) {
       toast.error('Preencha nome e WhatsApp');
       return;
     }
 
     setLoading(true);
 
     try {
       // Track Lead event
       if (typeof window !== 'undefined' && window.fbq) {
         window.fbq('track', 'Lead', {
           content_name: 'Cadastro Parceiro',
           content_category: 'parceiro',
         });
       }
 
       // Store form data in session for registration page
       sessionStorage.setItem('parceiro_lead', JSON.stringify({
         nome: formData.nome,
         telefone: formData.whatsapp.replace(/\D/g, ''),
         instagram: formData.instagram,
         utm: sessionStorage.getItem('parceiro_utm'),
       }));
 
       // Navigate to registration page
       navigate('/parceiro/auth?tab=register');
       
     } catch (error) {
       console.error('Erro ao processar lead:', error);
       toast.error('Erro ao processar. Tente novamente.');
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <section id="cadastro-parceiro" className="py-20 px-4 sm:px-6 lg:px-8">
       <div className="max-w-4xl mx-auto">
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-gradient-to-br from-slate-900 via-slate-900 to-primary/10 border border-slate-800 rounded-3xl p-8 md:p-12"
         >
           <div className="grid md:grid-cols-2 gap-10 items-center">
             {/* Left - Text */}
             <div>
               <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                 Comece a ganhar hoje!
               </h2>
               <p className="text-slate-300 text-lg mb-6">
                 Preencha seus dados e crie sua conta de parceiro em menos de 2 minutos.
               </p>
               
               <div className="space-y-3">
                 <div className="flex items-center gap-3 text-slate-300">
                   <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                   <span>Cadastro 100% gratuito</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-300">
                   <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                   <span>Link exclusivo personalizado</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-300">
                   <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                   <span>Dashboard para acompanhar ganhos</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-300">
                   <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                   <span>Saque via PIX</span>
                 </div>
               </div>
             </div>
 
             {/* Right - Form */}
             <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <Label htmlFor="nome" className="text-slate-300">
                     Seu nome
                   </Label>
                   <Input
                     id="nome"
                     type="text"
                     placeholder="Como você quer ser chamado(a)"
                     value={formData.nome}
                     onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                     className="mt-1.5 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                   />
                 </div>
 
                 <div>
                   <Label htmlFor="whatsapp" className="text-slate-300">
                     WhatsApp
                   </Label>
                   <Input
                     id="whatsapp"
                     type="tel"
                     placeholder="(31) 99999-9999"
                     value={formData.whatsapp}
                     onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                     className="mt-1.5 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                   />
                 </div>
 
                 <div>
                   <Label htmlFor="instagram" className="text-slate-300">
                     Instagram <span className="text-slate-500">(opcional)</span>
                   </Label>
                   <Input
                     id="instagram"
                     type="text"
                     placeholder="@seuinstagram"
                     value={formData.instagram}
                     onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                     className="mt-1.5 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
                   />
                 </div>
 
                 <Button
                   type="submit"
                   disabled={loading}
                   className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 text-white py-6 text-lg rounded-xl"
                 >
                   {loading ? (
                     <>
                       <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                       Processando...
                     </>
                   ) : (
                     <>
                       Cadastrar agora
                       <ArrowRight className="w-5 h-5 ml-2" />
                     </>
                   )}
                 </Button>
 
                 <p className="text-center text-slate-500 text-sm">
                   Ao cadastrar, você concorda com nossos termos de uso
                 </p>
               </form>
             </div>
           </div>
         </motion.div>
       </div>
     </section>
   );
 };
 
 export default SejaParceiroCTA;