 import { useState } from 'react';
 import { Download, Play, Video } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import type { VideoData } from '@/data/parceiro-materiais';
 
 interface VideoCardProps {
   video: VideoData;
 }
 
 export default function VideoCard({ video }: VideoCardProps) {
   const [isPlaying, setIsPlaying] = useState(false);
 
   const handleDownload = () => {
     const link = document.createElement('a');
     link.href = video.download;
     link.download = `${video.id}.mp4`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };
 
   const tipoLabel = {
     reels: 'Reels',
     stories: 'Stories',
     tiktok: 'TikTok'
   };
 
   const tipoColor = {
     reels: 'bg-pink-500/20 text-pink-400',
     stories: 'bg-purple-500/20 text-purple-400',
     tiktok: 'bg-cyan-500/20 text-cyan-400'
   };
 
   return (
     <Card className="overflow-hidden bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
       <div className="aspect-[9/16] bg-muted/30 relative overflow-hidden">
         {isPlaying ? (
           <video
             src={video.preview}
             className="w-full h-full object-cover"
             controls
             autoPlay
             onEnded={() => setIsPlaying(false)}
           />
         ) : (
           <>
             <video
               src={video.preview}
               className="w-full h-full object-cover"
               muted
               preload="metadata"
             />
             <div 
               className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer hover:bg-black/40 transition-colors"
               onClick={() => setIsPlaying(true)}
             >
               <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                 <Play className="h-8 w-8 text-white fill-white" />
               </div>
             </div>
           </>
         )}
         <Badge 
           className={`absolute top-2 right-2 ${tipoColor[video.tipo]}`}
           variant="secondary"
         >
           {tipoLabel[video.tipo]}
         </Badge>
         <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
           <Video className="h-3 w-3 text-white" />
           <span className="text-xs text-white font-medium">{video.duracao}</span>
         </div>
       </div>
       <CardContent className="p-2 sm:p-3 space-y-2">
         <div>
           <h3 className="font-semibold text-xs sm:text-sm line-clamp-1">{video.nome}</h3>
           <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{video.descricao}</p>
         </div>
         <Button size="sm" variant="secondary" onClick={handleDownload} className="w-full h-7">
           <Download className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
           <span className="text-xs">Baixar Vídeo</span>
         </Button>
       </CardContent>
     </Card>
   );
 }