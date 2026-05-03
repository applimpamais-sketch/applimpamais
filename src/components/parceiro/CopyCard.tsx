 import { useState } from 'react';
 import { Copy, Check, MessageCircle, Instagram, Flame, Phone, Image, Building } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { toast } from 'sonner';
 import type { CopyData } from '@/data/parceiro-materiais';
 import { replaceLinkPlaceholder } from '@/data/parceiro-materiais';
 
 interface CopyCardProps {
   copy: CopyData;
   parceiroLink: string;
 }
 
 const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
   MessageCircle,
   Instagram,
   Flame,
   Phone,
   Image,
   Building
 };
 
 export default function CopyCard({ copy, parceiroLink }: CopyCardProps) {
   const [copied, setCopied] = useState(false);
 
   const textoFinal = replaceLinkPlaceholder(copy.texto, parceiroLink);
   const IconComponent = iconMap[copy.icone] || MessageCircle;
 
   const handleCopy = async () => {
     try {
       await navigator.clipboard.writeText(textoFinal);
       setCopied(true);
       toast.success('Texto copiado!');
       setTimeout(() => setCopied(false), 2000);
     } catch (err) {
       toast.error('Erro ao copiar');
     }
   };
 
   const categoriaLabel = {
     whatsapp: 'WhatsApp',
     instagram: 'Instagram',
     status: 'Status'
   };
 
   const categoriaColor = {
     whatsapp: 'bg-green-500/20 text-green-400',
     instagram: 'bg-pink-500/20 text-pink-400',
     status: 'bg-blue-500/20 text-blue-400'
   };
 
   return (
     <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
      <CardContent className="p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
               <IconComponent className="h-4 w-4 text-primary" />
             </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{copy.titulo}</h3>
               <p className="text-xs text-muted-foreground">{copy.descricao}</p>
             </div>
           </div>
           <Badge 
             className={categoriaColor[copy.categoria]}
             variant="secondary"
           >
             {categoriaLabel[copy.categoria]}
           </Badge>
         </div>
         
         <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
          <pre className="text-xs whitespace-pre-wrap font-sans text-muted-foreground break-words">
             {textoFinal}
           </pre>
         </div>
         
         <Button 
           size="sm" 
           variant={copied ? "default" : "secondary"} 
           onClick={handleCopy}
           className="w-full"
         >
           {copied ? (
             <>
               <Check className="h-4 w-4 mr-1" />
               Copiado!
             </>
           ) : (
             <>
               <Copy className="h-4 w-4 mr-1" />
               Copiar texto
             </>
           )}
         </Button>
       </CardContent>
     </Card>
   );
 }