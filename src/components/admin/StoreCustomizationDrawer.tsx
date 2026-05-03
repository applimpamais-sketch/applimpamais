import { useRef, useState } from 'react';
import { Upload, X, Palette, Eye, Store, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface StoreCustomizationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customization: {
    logoUrl: string | null;
    corPrimaria: string;
    corSecundaria: string;
  };
  onCorPrimariaChange: (cor: string) => void;
  onCorSecundariaChange: (cor: string) => void;
  onLogoUpload: (file: File) => Promise<string | null>;
  onLogoRemove: () => void;
  onPublish: () => void;
  isPublishing: boolean;
  hasChanges: boolean;
}

export default function StoreCustomizationDrawer({
  open,
  onOpenChange,
  customization,
  onCorPrimariaChange,
  onCorSecundariaChange,
  onLogoUpload,
  onLogoRemove,
  onPublish,
  isPublishing,
  hasChanges,
}: StoreCustomizationDrawerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    await onLogoUpload(file);
    setIsUploading(false);
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalizar Loja
          </SheetTitle>
          <SheetDescription>
            Configure a identidade visual da sua loja online
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Logo da Empresa */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Store className="h-4 w-4" />
              Logo da Empresa
            </Label>
            
            <div className="flex flex-col items-center gap-3">
              {/* Preview do Logo */}
              <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden">
                {customization.logoUrl ? (
                  <img
                    src={customization.logoUrl}
                    alt="Logo da empresa"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Store className="h-10 w-10 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">Sem logo</span>
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? 'Enviando...' : 'Fazer Upload'}
                </Button>
                
                {customization.logoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogoRemove}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remover
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                PNG, JPG, WebP ou SVG. Máximo 5MB.
              </p>
            </div>
          </div>

          <Separator />

          {/* Cores da Marca */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Cores da Marca
            </Label>

            {/* Cor Primária */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cor Primária</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {customization.corPrimaria}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border shadow-sm cursor-pointer"
                  style={{ backgroundColor: customization.corPrimaria }}
                />
                <Input
                  type="color"
                  value={customization.corPrimaria}
                  onChange={(e) => onCorPrimariaChange(e.target.value)}
                  className="w-full h-10 cursor-pointer"
                />
              </div>
            </div>

            {/* Cor Secundária */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cor Secundária</span>
                <span className="text-xs font-mono text-muted-foreground">
                  {customization.corSecundaria}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg border shadow-sm cursor-pointer"
                  style={{ backgroundColor: customization.corSecundaria }}
                />
                <Input
                  type="color"
                  value={customization.corSecundaria}
                  onChange={(e) => onCorSecundariaChange(e.target.value)}
                  className="w-full h-10 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview da Loja */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Label>

            <div className="rounded-lg border bg-background p-4 space-y-3">
              {/* Header simulado */}
              <div 
                className="rounded-md p-3 flex items-center gap-3"
                style={{ backgroundColor: customization.corPrimaria }}
              >
                {customization.logoUrl ? (
                  <img
                    src={customization.logoUrl}
                    alt="Logo"
                    className="h-8 w-8 rounded object-contain bg-white"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center">
                    <Store className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="text-white font-medium text-sm">Sua Empresa</span>
              </div>

              {/* Botão simulado */}
              <div className="flex gap-2">
                <div
                  className="px-4 py-2 rounded-md text-white text-xs font-medium"
                  style={{ backgroundColor: customization.corPrimaria }}
                >
                  Botão Primário
                </div>
                <div
                  className="px-4 py-2 rounded-md text-white text-xs font-medium"
                  style={{ backgroundColor: customization.corSecundaria }}
                >
                  Botão Secundário
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Botão Publicar */}
          <Button
            onClick={onPublish}
            disabled={!hasChanges || isPublishing}
            className="w-full"
            size="lg"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>

          {!hasChanges && (
            <p className="text-xs text-muted-foreground text-center">
              Nenhuma alteração pendente
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
