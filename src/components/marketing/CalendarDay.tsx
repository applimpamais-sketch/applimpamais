import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  Images, 
  MessageCircle, 
  Eye, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorialDay, ContentType, ContentCategory } from "@/data/editorial-calendar";

interface CalendarDayProps {
  day: EditorialDay;
  onClick: (day: EditorialDay) => void;
}

const typeIcons: Record<ContentType, typeof Video> = {
  reel: Video,
  carrossel: Images,
  stories: MessageCircle,
};

const typeLabels: Record<ContentType, string> = {
  reel: 'Reel',
  carrossel: 'Carrossel',
  stories: 'Stories',
};

const categoryColors: Record<ContentCategory, string> = {
  dor: 'bg-red-500/10 text-red-600 border-red-200',
  tutorial: 'bg-blue-500/10 text-blue-600 border-blue-200',
  prova_social: 'bg-green-500/10 text-green-600 border-green-200',
  educativo: 'bg-purple-500/10 text-purple-600 border-purple-200',
  meme: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  oferta: 'bg-orange-500/10 text-orange-600 border-orange-200',
  bastidores: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

const categoryLabels: Record<ContentCategory, string> = {
  dor: 'Dor',
  tutorial: 'Tutorial',
  prova_social: 'Prova Social',
  educativo: 'Educativo',
  meme: 'Meme',
  oferta: 'Oferta',
  bastidores: 'Bastidores',
};

export function CalendarDay({ day, onClick }: CalendarDayProps) {
  const TypeIcon = typeIcons[day.type];

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
        day.published && "bg-muted/50 border-green-300"
      )}
      onClick={() => onClick(day)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{day.day}</span>
            <span className="text-sm text-muted-foreground">{day.weekDay}</span>
          </div>
          {day.published ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Clock className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2">{day.title}</h3>

        {/* Type & Category */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <TypeIcon className="h-3 w-3" />
            {typeLabels[day.type]}
          </Badge>
          <Badge 
            variant="outline" 
            className={cn("text-xs", categoryColors[day.category])}
          >
            {categoryLabels[day.category]}
          </Badge>
        </div>

        {/* Hook preview */}
        <p className="text-xs text-muted-foreground line-clamp-2 italic">
          "{day.hook}"
        </p>

        {/* Module */}
        <div className="pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            📦 {day.module}
          </span>
        </div>

        {/* Action */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onClick(day);
          }}
        >
          <Eye className="h-3 w-3 mr-1" />
          Ver Roteiro Completo
        </Button>
      </CardContent>
    </Card>
  );
}
