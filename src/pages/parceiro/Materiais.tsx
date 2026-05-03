 import { Package, Image, Video, FileText, QrCode } from 'lucide-react';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useParceiro } from '@/hooks/useParceiro';
 import { imagensData, videosData, textosData } from '@/data/parceiro-materiais';
 import MaterialCard from '@/components/parceiro/MaterialCard';
 import VideoCard from '@/components/parceiro/VideoCard';
 import CopyCard from '@/components/parceiro/CopyCard';
 import QRCodeGenerator from '@/components/parceiro/QRCodeGenerator';
 import { Skeleton } from '@/components/ui/skeleton';
 
 export default function Materiais() {
   const { parceiro, loading } = useParceiro();
   
   const baseUrl = window.location.origin;
   const parceiroLink = parceiro 
     ? `${baseUrl}/p/${parceiro.codigo_referencia}`
     : '';
 
   if (loading) {
     return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
         <Skeleton className="h-8 w-48" />
         <Skeleton className="h-4 w-96" />
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Skeleton className="h-64" />
           <Skeleton className="h-64" />
           <Skeleton className="h-64" />
         </div>
       </div>
     );
   }
 
   return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
       {/* Header */}
       <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Package className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
           Kit de Materiais
         </h1>
         <p className="text-muted-foreground mt-1">
           Baixe e compartilhe para aumentar suas indicações e comissões
         </p>
       </div>
 
       {/* Tabs */}
       <Tabs defaultValue="imagens" className="space-y-4 sm:space-y-6">
        <TabsList className="bg-muted/50 w-full sm:w-auto overflow-x-auto flex-nowrap justify-start">
           <TabsTrigger value="imagens" className="flex items-center gap-1 sm:gap-2 min-w-fit">
             <Image className="h-4 w-4" />
             <span className="hidden xs:inline">Imagens</span>
             <span className="xs:hidden">Img</span>
           </TabsTrigger>
           <TabsTrigger value="videos" className="flex items-center gap-1 sm:gap-2 min-w-fit">
             <Video className="h-4 w-4" />
             <span className="hidden xs:inline">Vídeos</span>
             <span className="xs:hidden">Vid</span>
           </TabsTrigger>
           <TabsTrigger value="textos" className="flex items-center gap-1 sm:gap-2 min-w-fit">
             <FileText className="h-4 w-4" />
             <span className="hidden xs:inline">Textos Prontos</span>
             <span className="xs:hidden">Textos</span>
           </TabsTrigger>
          <TabsTrigger value="qrcode" className="flex items-center gap-1 sm:gap-2 min-w-fit">
             <QrCode className="h-4 w-4" />
             QR Code
           </TabsTrigger>
         </TabsList>
 
          {/* Imagens */}
          <TabsContent value="imagens" className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50">
            <p className="text-xs sm:text-sm text-muted-foreground">
               🖼️ Imagens prontas para postar no Instagram, Facebook e WhatsApp Status
             </p>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {imagensData.map((imagem) => (
                <MaterialCard key={imagem.id} material={imagem} />
             ))}
           </div>
         </TabsContent>
 
          {/* Vídeos */}
          <TabsContent value="videos" className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50">
            <p className="text-xs sm:text-sm text-muted-foreground">
               🎬 Vídeos prontos para Reels, Stories e TikTok
             </p>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {videosData.map((video) => (
                <VideoCard key={video.id} video={video} />
             ))}
           </div>
         </TabsContent>
 
          {/* Textos Prontos */}
          <TabsContent value="textos" className="space-y-4">
           <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50">
             <p className="text-xs sm:text-sm text-muted-foreground">
               📝 Textos prontos com seu link de indicação. Basta copiar e enviar!
             </p>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
             {textosData.map((texto) => (
               <CopyCard 
                 key={texto.id} 
                 copy={texto} 
                 parceiroLink={parceiroLink}
               />
             ))}
           </div>
         </TabsContent>
 
         {/* QR Code */}
         <TabsContent value="qrcode" className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-3 sm:p-4 border border-border/50">
            <p className="text-xs sm:text-sm text-muted-foreground">
               📱 Ideal para estabelecimentos: salões, pet shops, clínicas e lojas
             </p>
           </div>
           {parceiro && (
             <QRCodeGenerator 
               codigoReferencia={parceiro.codigo_referencia}
               baseUrl={baseUrl}
             />
           )}
         </TabsContent>
       </Tabs>
     </div>
   );
 }