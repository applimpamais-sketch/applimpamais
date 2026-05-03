 import { useRef, useState } from 'react';
 import { QRCodeCanvas } from 'qrcode.react';
 import { Download, Copy, Check, QrCode } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { toast } from 'sonner';
 import { SITE_DOMAIN } from '@/lib/constants';
 
 interface QRCodeGeneratorProps {
   codigoReferencia: string;
   baseUrl?: string;
 }
 
export default function QRCodeGenerator({ 
  codigoReferencia, 
  baseUrl = SITE_DOMAIN 
}: QRCodeGeneratorProps) {
   const canvasRef = useRef<HTMLDivElement>(null);
   const [copied, setCopied] = useState(false);
   
   const fullUrl = `${baseUrl}/p/${codigoReferencia}`;
 
   const handleDownloadPNG = () => {
     const canvas = canvasRef.current?.querySelector('canvas');
     if (!canvas) return;
 
     const url = canvas.toDataURL('image/png');
     const link = document.createElement('a');
     link.href = url;
     link.download = `qrcode-${codigoReferencia}.png`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     toast.success('QR Code baixado!');
   };
 
   const handleCopyLink = async () => {
     try {
       await navigator.clipboard.writeText(fullUrl);
       setCopied(true);
       toast.success('Link copiado!');
       setTimeout(() => setCopied(false), 2000);
     } catch (err) {
       toast.error('Erro ao copiar');
     }
   };
 
   return (
     <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
           <QrCode className="h-5 w-5 text-primary" />
           Seu QR Code Exclusivo
         </CardTitle>
       </CardHeader>
      <CardContent className="space-y-4 px-3 sm:px-6">
         <p className="text-sm text-muted-foreground">
           Imprima e coloque no seu estabelecimento. Quando clientes escanearem e agendarem, vocÃª ganha comissÃ£o automaticamente!
         </p>
         
        <div className="flex flex-col items-center gap-4 sm:gap-6">
           {/* QR Code */}
           <div 
             ref={canvasRef}
             className="bg-white p-4 rounded-xl shadow-lg"
           >
             <QRCodeCanvas
               value={fullUrl}
              size={150}
               level="H"
               includeMargin={true}
               bgColor="#FFFFFF"
               fgColor="#000000"
             />
           </div>
           
           {/* Info e aÃ§Ãµes */}
          <div className="w-full space-y-4">
             <div className="space-y-2">
               <Label className="text-xs text-muted-foreground">Seu link de indicaÃ§Ã£o</Label>
               <div className="flex gap-2">
                 <Input 
                   value={fullUrl} 
                   readOnly 
                   className="text-xs bg-muted/30"
                 />
                 <Button 
                   size="icon" 
                   variant="secondary"
                   onClick={handleCopyLink}
                 >
                   {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                 </Button>
               </div>
             </div>
             
            <div>
              <Button onClick={handleDownloadPNG} className="w-full">
                 <Download className="h-4 w-4 mr-2" />
                 Baixar PNG
               </Button>
             </div>
             
             <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
               <p className="text-xs text-primary">
                 ðŸ’¡ <strong>Dica:</strong> Imprima em tamanho grande (mÃ­nimo 10x10cm) e coloque em local visÃ­vel para seus clientes.
               </p>
             </div>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }
