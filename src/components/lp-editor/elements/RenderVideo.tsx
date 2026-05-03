import { cn } from '@/lib/utils';
import type { ElementProps, ElementStyle } from '@/types/lp-document';
import { Play, Video } from 'lucide-react';

interface RenderVideoProps {
  props: ElementProps;
  style?: ElementStyle;
}

// Extrair ID do YouTube
function getYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Extrair ID do Vimeo
function getVimeoId(url: string): string | null {
  const regex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function RenderVideo({ props, style }: RenderVideoProps) {
  const { videoUrl, poster } = props;

  // Placeholder quando não tem URL
  if (!videoUrl) {
    return (
      <div 
        className={cn(
          'w-full aspect-video lp-surface flex items-center justify-center',
          'rounded-xl border-2 border-dashed lp-border',
          'bg-gradient-to-br from-primary/10 to-primary/5',
          style?.className,
        )}
      >
        <div className="text-center lp-text-muted">
          <div className="relative inline-flex">
            <Video className="w-16 h-16 mx-auto mb-3 opacity-40" />
            <Play className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60" />
          </div>
          <p className="text-sm font-medium">Clique para adicionar vídeo</p>
          <p className="text-xs opacity-60 mt-1">YouTube, Vimeo ou URL direta</p>
        </div>
      </div>
    );
  }

  // YouTube embed
  const youtubeId = getYouTubeId(videoUrl);
  if (youtubeId) {
    return (
      <div className={cn('w-full aspect-video rounded-xl overflow-hidden shadow-2xl', style?.className)}>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
          title="Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Vimeo embed
  const vimeoId = getVimeoId(videoUrl);
  if (vimeoId) {
    return (
      <div className={cn('w-full aspect-video rounded-xl overflow-hidden shadow-2xl', style?.className)}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title="Video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  // Video direto (MP4, etc)
  return (
    <div className={cn('w-full aspect-video rounded-xl overflow-hidden shadow-2xl', style?.className)}>
      <video
        src={videoUrl}
        poster={poster}
        controls
        className="w-full h-full object-cover"
      >
        Seu navegador não suporta vídeos.
      </video>
    </div>
  );
}
