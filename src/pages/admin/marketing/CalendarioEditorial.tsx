import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Video, 
  Images, 
  CheckCircle2, 
  Clock,
  Filter,
  LayoutGrid,
  List
} from "lucide-react";
import { CalendarDay } from "@/components/marketing/CalendarDay";
import { ContentScript } from "@/components/marketing/ContentScript";
import { 
  editorialCalendar, 
  calendarStats,
  type EditorialDay,
  type ContentType,
  type ContentCategory 
} from "@/data/editorial-calendar";

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | ContentType;
type FilterCategory = 'all' | ContentCategory;

export default function CalendarioEditorial() {
  const [selectedDay, setSelectedDay] = useState<EditorialDay | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');

  // Local state for published status (in real app, this would be from database)
  const [publishedDays, setPublishedDays] = useState<Set<number>>(new Set());

  const filteredPosts = useMemo(() => {
    return editorialCalendar.filter(post => {
      if (filterType !== 'all' && post.type !== filterType) return false;
      if (filterCategory !== 'all' && post.category !== filterCategory) return false;
      if (selectedWeek !== 'all' && post.week !== selectedWeek) return false;
      return true;
    });
  }, [filterType, filterCategory, selectedWeek]);

  const publishedCount = publishedDays.size;
  const progressPercent = (publishedCount / calendarStats.total) * 100;

  const handleDayClick = (day: EditorialDay) => {
    setSelectedDay({
      ...day,
      published: publishedDays.has(day.day)
    });
    setDialogOpen(true);
  };

  const handleMarkPublished = (day: EditorialDay) => {
    setPublishedDays(prev => {
      const next = new Set(prev);
      next.add(day.day);
      return next;
    });
    setDialogOpen(false);
  };

  const weeks = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Calendário Editorial - 30 Dias
          </h1>
          <p className="text-muted-foreground">
            Estratégia de conteúdo para Instagram - Higienização de Estofados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress & Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso</span>
              <span className="text-sm text-muted-foreground">
                {publishedCount}/{calendarStats.total}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {progressPercent.toFixed(0)}% publicado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Video className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{calendarStats.reels}</p>
              <p className="text-xs text-muted-foreground">Reels</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Images className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{calendarStats.carrosseis}</p>
              <p className="text-xs text-muted-foreground">Carrosséis</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{publishedCount}</p>
              <p className="text-xs text-muted-foreground">Publicados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Week Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedWeek === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedWeek('all')}
            >
              Todas
            </Button>
            {weeks.map(week => (
              <Button
                key={week}
                variant={selectedWeek === week ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedWeek(week)}
              >
                Semana {week}
              </Button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={filterType === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterType('all')}
            >
              Todos os Tipos
            </Badge>
            <Badge 
              variant={filterType === 'reel' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterType('reel')}
            >
              <Video className="h-3 w-3 mr-1" />
              Reels
            </Badge>
            <Badge 
              variant={filterType === 'carrossel' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterType('carrossel')}
            >
              <Images className="h-3 w-3 mr-1" />
              Carrosséis
            </Badge>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={filterCategory === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterCategory('all')}
            >
              Todas Categorias
            </Badge>
            <Badge 
              variant={filterCategory === 'dor' ? 'default' : 'outline'}
              className="cursor-pointer bg-red-50 text-red-600 hover:bg-red-100"
              onClick={() => setFilterCategory('dor')}
            >
              Dor
            </Badge>
            <Badge 
              variant={filterCategory === 'tutorial' ? 'default' : 'outline'}
              className="cursor-pointer bg-blue-50 text-blue-600 hover:bg-blue-100"
              onClick={() => setFilterCategory('tutorial')}
            >
              Tutorial
            </Badge>
            <Badge 
              variant={filterCategory === 'prova_social' ? 'default' : 'outline'}
              className="cursor-pointer bg-green-50 text-green-600 hover:bg-green-100"
              onClick={() => setFilterCategory('prova_social')}
            >
              Prova Social
            </Badge>
            <Badge 
              variant={filterCategory === 'educativo' ? 'default' : 'outline'}
              className="cursor-pointer bg-purple-50 text-purple-600 hover:bg-purple-100"
              onClick={() => setFilterCategory('educativo')}
            >
              Educativo
            </Badge>
            <Badge 
              variant={filterCategory === 'meme' ? 'default' : 'outline'}
              className="cursor-pointer bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
              onClick={() => setFilterCategory('meme')}
            >
              Meme
            </Badge>
            <Badge 
              variant={filterCategory === 'oferta' ? 'default' : 'outline'}
              className="cursor-pointer bg-orange-50 text-orange-600 hover:bg-orange-100"
              onClick={() => setFilterCategory('oferta')}
            >
              Oferta
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredPosts.map(day => (
            <CalendarDay
              key={day.day}
              day={{
                ...day,
                published: publishedDays.has(day.day)
              }}
              onClick={handleDayClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPosts.map(day => (
            <Card 
              key={day.day}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleDayClick(day)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <span className="font-bold text-primary">{day.day}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{day.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {day.weekDay} - Semana {day.week} - {day.module}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {day.type === 'reel' ? 'Reel' : 'Carrossel'}
                  </Badge>
                  {publishedDays.has(day.day) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhum conteúdo encontrado com os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Content Script Dialog */}
      <ContentScript
        day={selectedDay}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onMarkPublished={handleMarkPublished}
      />
    </div>
  );
}
