 import { Download } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import type { BannerData } from '@/data/parceiro-materiais';
 
 interface MaterialCardProps {
   material: BannerData;
 }
 
 export default function MaterialCard({ material }: MaterialCardProps) {
   const handleDownload = () => {
     const link = document.createElement('a');
     link.href = material.download;
     link.download = `${material.id}.png`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };
 
   const tipoLabel = {
     feed: 'Feed',
     stories: 'Stories',
     reels: 'Reels'
   };
 
   const tipoColor = {
     feed: 'bg-blue-500/20 text-blue-400',
     stories: 'bg-purple-500/20 text-purple-400',
     reels: 'bg-pink-500/20 text-pink-400'
   };
 
   return (
     <Card className="overflow-hidden bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
      <div className="aspect-[4/5] sm:aspect-square bg-muted/30 relative overflow-hidden">
         <img
           src={material.preview}
           alt={material.nome}
           className="w-full h-full object-cover"
           onError={(e) => {
             e.currentTarget.src = '/placeholder.svg';
           }}
         />
         <Badge 
           className={`absolute top-2 right-2 ${tipoColor[material.tipo]}`}
           variant="secondary"
         >
           {tipoLabel[material.tipo]}
         </Badge>
       </div>
      <CardContent className="p-2 sm:p-3 space-y-2">
         <div>
          <h3 className="font-semibold text-xs sm:text-sm line-clamp-1">{material.nome}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{material.descricao}</p>
         </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground shrink-0">{material.dimensao}</span>
          <Button size="sm" variant="secondary" onClick={handleDownload} className="h-7 px-2 sm:px-3">
            <Download className="h-3 sm:h-4 w-3 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Baixar</span>
           </Button>
         </div>
       </CardContent>
     </Card>
   );
 }