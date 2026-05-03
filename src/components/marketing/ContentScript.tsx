import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Copy, 
  Check, 
  Video, 
  Images, 
  MessageCircle,
  Clock,
  Hash,
  FileText,
  Clapperboard
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { EditorialDay, ContentType, ContentCategory } from "@/data/editorial-calendar";

interface ContentScriptProps {
  day: EditorialDay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkPublished?: (day: EditorialDay) => void;
}

const typeIcons: Record<ContentType, typeof Video> = {
  reel: Video,
  carrossel: Images,
  stories: MessageCircle,
};

const categoryColors: Record<ContentCategory, string> = {
  dor: 'bg-red-500/10 text-red-600',
  tutorial: 'bg-blue-500/10 text-blue-600',
  prova_social: 'bg-green-500/10 text-green-600',
  educativo: 'bg-purple-500/10 text-purple-600',
  meme: 'bg-yellow-500/10 text-yellow-700',
  oferta: 'bg-orange-500/10 text-orange-600',
  bastidores: 'bg-gray-500/10 text-gray-600',
};

const categoryLabels: Record<ContentCategory, string> = {
  dor: 'Dor/Problema',
  tutorial: 'Tutorial',
  prova_social: 'Prova Social',
  educativo: 'Educativo',
  meme: 'Meme/Humor',
  oferta: 'Oferta/CTA',
  bastidores: 'Bastidores',
};

export function ContentScript({ day, open, onOpenChange, onMarkPublished }: ContentScriptProps) {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  if (!day) return null;

  const TypeIcon = typeIcons[day.type];

  const copyToClipboard = async (text: string, type: 'caption' | 'hashtags') => {
    await navigator.clipboard.writeText(text);
    if (type === 'caption') {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
    toast.success('Copiado para a área de transferência!');
  };

  const hashtagsText = day.hashtags.map(h => `#${h}`).join(' ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
              <span className="text-xl font-bold text-primary">{day.day}</span>
            </div>
            <div>
              <DialogTitle className="text-xl">{day.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <TypeIcon className="h-3 w-3 mr-1" />
                  {day.type === 'reel' ? 'Reel' : day.type === 'carrossel' ? 'Carrossel' : 'Stories'}
                </Badge>
                <Badge className={cn("text-xs", categoryColors[day.category])}>
                  {categoryLabels[day.category]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Semana {day.week}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <Tabs defaultValue="roteiro" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="roteiro" className="text-xs">
                <Clapperboard className="h-4 w-4 mr-1" />
                Roteiro
              </TabsTrigger>
              <TabsTrigger value="legenda" className="text-xs">
                <FileText className="h-4 w-4 mr-1" />
                Legenda
              </TabsTrigger>
              <TabsTrigger value="info" className="text-xs">
                <Hash className="h-4 w-4 mr-1" />
                Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roteiro" className="space-y-4 mt-4">
              {/* Hook */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-sm text-primary mb-2">🎯 HOOK (0-3s)</h4>
                <p className="text-lg font-medium">"{day.hook}"</p>
              </div>

              {/* Format */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Video className="h-4 w-4" />
                <span>Formato: {day.format}</span>
              </div>

              <Separator />

              {/* Scenes (for Reels) */}
              {day.scenes && day.scenes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">📹 Roteiro por Cena</h4>
                  {day.scenes.map((scene, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-muted/50 rounded-lg border space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {scene.timing}
                        </Badge>
                        <span className="text-xs font-medium text-muted-foreground">
                          CENA {index + 1}
                        </span>
                      </div>
                      <p className="text-sm">{scene.description}</p>
                      {scene.text && (
                        <div className="p-2 bg-background rounded border-l-2 border-primary">
                          <p className="text-sm font-medium whitespace-pre-line">{scene.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Slides (for Carousels) */}
              {day.slides && day.slides.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">📄 Slides do Carrossel</h4>
                  {day.slides.map((slide, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-muted/50 rounded-lg border space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Slide {index + 1}
                        </Badge>
                        {slide.title && (
                          <span className="text-xs font-medium text-muted-foreground">
                            {slide.title}
                          </span>
                        )}
                      </div>
                      <div className="p-2 bg-background rounded border">
                        <p className="text-sm whitespace-pre-line">{slide.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="legenda" className="space-y-4 mt-4">
              {/* Caption */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">📝 Legenda para Instagram</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(day.caption, 'caption')}
                  >
                    {copiedCaption ? (
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copiar
                  </Button>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border whitespace-pre-line text-sm">
                  {day.caption}
                </div>
              </div>

              <Separator />

              {/* Hashtags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold"># Hashtags</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(hashtagsText, 'hashtags')}
                  >
                    {copiedHashtags ? (
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    Copiar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {day.hashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground">Dia</span>
                  <p className="font-medium">Dia {day.day} - {day.weekDay}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground">Semana</span>
                  <p className="font-medium">Semana {day.week}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground">Módulo/Tema</span>
                  <p className="font-medium">{day.module}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground">Tipo de Conteúdo</span>
                  <p className="font-medium capitalize">{day.type}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground">Categoria</span>
                  <p className="font-medium">{categoryLabels[day.category]}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <p className="font-medium">
                    {day.published ? '✅ Publicado' : '⏳ Pendente'}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          {onMarkPublished && !day.published && (
            <Button onClick={() => onMarkPublished(day)}>
              <Check className="h-4 w-4 mr-2" />
              Marcar como Publicado
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
