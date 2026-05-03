 import { Package, Image, FileText, QrCode, ArrowRight } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 
 export default function SejaParceiroMateriais() {
   const scrollToTop = () => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
   };
 
   const materiais = [
     {
       icon: Image,
       titulo: 'Banners Prontos',
       descricao: 'Stories e Feed otimizados para redes sociais',
       cor: 'from-blue-500/20 to-cyan-500/20'
     },
     {
       icon: FileText,
       titulo: 'Copies Prontas',
       descricao: 'Textos para WhatsApp e Instagram com seu link',
       cor: 'from-green-500/20 to-emerald-500/20'
     },
     {
       icon: QrCode,
       titulo: 'QR Code Exclusivo',
       descricao: 'Imprima e coloque no seu estabelecimento',
       cor: 'from-purple-500/20 to-pink-500/20'
     }
   ];
 
   return (
     <section className="py-20 relative">
       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
         {/* Header */}
         <div className="text-center mb-12">
           <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
             <Package className="h-4 w-4 text-primary" />
             <span className="text-sm font-medium text-primary">Kit Exclusivo</span>
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
             Materiais Prontos para Divulgar
           </h2>
           <p className="text-lg text-slate-400 max-w-2xl mx-auto">
             Receba banners, textos e QR Code personalizados para promover seu link de indicação
           </p>
         </div>
 
         {/* Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           {materiais.map((item, index) => (
             <Card 
               key={index}
               className="bg-card/30 border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
             >
               <CardContent className="p-6 text-center">
                 <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                   <item.icon className="h-7 w-7 text-primary" />
                 </div>
                 <h3 className="text-lg font-semibold text-foreground mb-2">{item.titulo}</h3>
                 <p className="text-sm text-muted-foreground">{item.descricao}</p>
               </CardContent>
             </Card>
           ))}
         </div>
 
         {/* CTA */}
         <div className="text-center">
           <div className="inline-flex items-center gap-2 bg-muted/30 rounded-full px-4 py-2 mb-4">
             <span className="text-sm text-muted-foreground">
               ✨ Disponível após o cadastro gratuito
             </span>
           </div>
           <div>
             <Button 
               size="lg" 
               onClick={scrollToTop}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
             >
               Quero ser parceiro
               <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
           </div>
         </div>
       </div>
     </section>
   );
 }