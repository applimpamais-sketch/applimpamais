import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Video, Youtube, ExternalLink } from 'lucide-react';
import type { ElementProps } from '@/types/lp-document';

interface VideoPropertiesProps {
  props: ElementProps;
  onUpdate: (props: Partial<ElementProps>) => void;
}

export function VideoProperties({ props, onUpdate }: VideoPropertiesProps) {
  const isYouTube = props.videoUrl?.includes('youtube') || props.videoUrl?.includes('youtu.be');
  const isVimeo = props.videoUrl?.includes('vimeo');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Video className="h-4 w-4" />
        Configurações de Vídeo
      </div>

      {/* URL do Vídeo */}
      <div className="space-y-2">
        <Label htmlFor="videoUrl">URL do Vídeo</Label>
        <Input
          id="videoUrl"
          value={props.videoUrl || ''}
          onChange={(e) => onUpdate({ videoUrl: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground">
          Suporta YouTube, Vimeo ou URL direta de vídeo (MP4)
        </p>
      </div>

      {/* Status do Vídeo */}
      {props.videoUrl && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
          {isYouTube && (
            <>
              <Youtube className="h-4 w-4 text-destructive" />
              <span className="text-sm">YouTube detectado</span>
            </>
          )}
          {isVimeo && (
            <>
              <Video className="h-4 w-4 text-primary" />
              <span className="text-sm">Vimeo detectado</span>
            </>
          )}
          {!isYouTube && !isVimeo && (
            <>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Vídeo direto</span>
            </>
          )}
        </div>
      )}

      {/* Poster (thumbnail) para vídeos diretos */}
      {!isYouTube && !isVimeo && (
        <div className="space-y-2">
          <Label htmlFor="poster">Thumbnail (opcional)</Label>
          <Input
            id="poster"
            value={props.poster || ''}
            onChange={(e) => onUpdate({ poster: e.target.value })}
            placeholder="URL da imagem de capa"
          />
        </div>
      )}

      {/* Ação rápida */}
      {!props.videoUrl && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Exemplos de URL:</p>
          <div className="grid gap-1 text-xs text-muted-foreground">
            <code className="bg-muted px-2 py-1 rounded">https://youtube.com/watch?v=XXXXX</code>
            <code className="bg-muted px-2 py-1 rounded">https://youtu.be/XXXXX</code>
            <code className="bg-muted px-2 py-1 rounded">https://vimeo.com/123456789</code>
          </div>
        </div>
      )}

      {/* Limpar vídeo */}
      {props.videoUrl && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onUpdate({ videoUrl: '', poster: '' })}
        >
          Remover Vídeo
        </Button>
      )}
    </div>
  );
}
