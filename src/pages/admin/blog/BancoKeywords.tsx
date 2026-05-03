import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBlogKeywords, useBlogKeywordsCount, useBlogKeywordsStats } from '@/hooks/useBlogKeywords';
import { useBlogGeneration } from '@/hooks/useBlogGeneration';
import { CLUSTERS, FUNNEL_STAGES, CIDADES_ATENDIDAS } from '@/data/blog-templates';
import { Search, Loader2, Download, Wand2, CheckCircle, MapPin, TrendingUp, ArrowUpDown, Zap, HelpCircle, Target, Upload, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const INTENT_OPTIONS = [
  { value: 'info', label: 'Informacional' },
  { value: 'comparativo', label: 'Comparativo' },
  { value: 'transacional', label: 'Transacional' },
  { value: 'local', label: 'Local' },
  { value: 'question', label: 'Pergunta' },
  { value: 'trending', label: 'Trending' },
];

const SOURCE_OPTIONS = [
  { value: 'all', label: 'Todas as Fontes' },
  { value: 'generated', label: 'Geradas' },
  { value: 'google_planner', label: 'Google Planner' },
  { value: 'manual', label: 'Manuais' },
];

export default function BancoKeywords() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cluster, setCluster] = useState<string>('');
  const [funnelStage, setFunnelStage] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [bairro, setBairro] = useState<string>('');
  const [intent, setIntent] = useState<string>('');
  const [source, setSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUsed, setShowUsed] = useState<string>('unused');
  const [sortBy, setSortBy] = useState<'opportunity' | 'difficulty' | 'trend' | 'gap' | 'recent' | 'volume'>('opportunity');
  const [minOpportunity, setMinOpportunity] = useState<string>('');
  const [maxDifficulty, setMaxDifficulty] = useState<string>('');
  
  const { data: keywords, isLoading } = useBlogKeywords({
    cluster: cluster && cluster !== 'all' ? cluster : undefined,
    funnel_stage: funnelStage && funnelStage !== 'all' ? funnelStage : undefined,
    city: city && city !== 'all' ? city : undefined,
    bairro: bairro || undefined,
    intent: intent && intent !== 'all' ? intent : undefined,
    source: source && source !== 'all' ? source : undefined,
    used: showUsed === 'unused' ? false : showUsed === 'used' ? true : undefined,
    search: searchQuery || undefined,
    sortBy,
    minOpportunity: minOpportunity ? parseInt(minOpportunity) : undefined,
    maxDifficulty: maxDifficulty ? parseInt(maxDifficulty) : undefined,
  }, !!user);
  
  const { data: counts } = useBlogKeywordsCount(!!user);
  const { data: stats } = useBlogKeywordsStats(!!user);
  const { seedKeywords, isSeeding } = useBlogGeneration();
  
  const handleSeedKeywords = () => {
    seedKeywords.mutate(cluster || undefined);
  };
  
  const exportToCSV = () => {
    if (!keywords || keywords.length === 0) return;
    
    const headers = ['Keyword', 'Cluster', 'Funil', 'Intent', 'Cidade', 'Bairro', 'Dificuldade', 'Oportunidade', 'Status'];
    const rows = keywords.map(k => [
      `"${k.keyword}"`,
      k.cluster,
      k.funnel_stage,
      k.intent || '',
      k.city || '',
      k.bairro || '',
      k.difficulty_score.toString(),
      k.opportunity_score.toString(),
      k.used ? 'Usada' : 'Disponível',
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keywords-seo.csv';
    a.click();
  };
  
  const getDifficultyBadge = (score: number) => {
    if (score <= 25) return { label: 'Muito Fácil', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (score <= 40) return { label: 'Fácil', className: 'bg-green-100 text-green-700 border-green-200' };
    if (score <= 55) return { label: 'Médio', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    if (score <= 70) return { label: 'Difícil', className: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: 'Muito Difícil', className: 'bg-red-100 text-red-700 border-red-200' };
  };

  const getOpportunityBadge = (score: number) => {
    if (score >= 85) return { label: 'Excelente', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    if (score >= 70) return { label: 'Ótimo', className: 'bg-green-100 text-green-700 border-green-200' };
    if (score >= 55) return { label: 'Bom', className: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (score >= 40) return { label: 'Regular', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'Baixo', className: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const getIntentIcon = (intentType: string | null) => {
    switch (intentType) {
      case 'question': return <HelpCircle className="h-3 w-3" />;
      case 'local': return <MapPin className="h-3 w-3" />;
      case 'transacional': return <Target className="h-3 w-3" />;
      case 'trending': return <TrendingUp className="h-3 w-3" />;
      default: return null;
    }
  };
  
  if (authLoading || !user) {
    return (
      <AdminContainer>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminContainer>
    );
  }

  const usagePercent = counts?.total ? Math.round((counts.used / counts.total) * 100) : 0;

  return (
    <AdminContainer>
      <PageHeader
        title="Banco de Keywords SEO"
        description={`${counts?.total.toLocaleString() || 0} keywords mapeadas • ${counts?.unused?.toLocaleString() || 0} disponíveis`}
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{counts?.total.toLocaleString() || 0}</p>
              </div>
              <Search className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <Progress value={usagePercent} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">{usagePercent}% usadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alta Oportunidade</p>
                <p className="text-2xl font-bold text-emerald-600">{stats?.highOpportunity.toLocaleString() || 0}</p>
              </div>
              <Zap className="h-6 w-6 text-yellow-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Score ≥ 80</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Baixa Dificuldade</p>
                <p className="text-2xl font-bold text-green-600">{stats?.lowDifficulty.toLocaleString() || 0}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Score ≤ 30</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Perguntas</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.questions.toLocaleString() || 0}</p>
              </div>
              <HelpCircle className="h-6 w-6 text-purple-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">Featured Snippets</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Locais</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.localKeywords.toLocaleString() || 0}</p>
              </div>
              <MapPin className="h-6 w-6 text-blue-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-3">+ {stats?.withBairro || 0} c/ bairro</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros e Ações */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Row 1 - Main Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar keyword..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={cluster} onValueChange={setCluster}>
                <SelectTrigger>
                  <SelectValue placeholder="Cluster" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {CLUSTERS.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={funnelStage} onValueChange={setFunnelStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Funil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {FUNNEL_STAGES.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={intent} onValueChange={setIntent}>
                <SelectTrigger>
                  <SelectValue placeholder="Intenção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {INTENT_OPTIONS.map(i => (
                    <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {CIDADES_ATENDIDAS.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Row 2 - Advanced Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Input 
                placeholder="Filtrar bairro..."
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
              
              <Input 
                type="number"
                placeholder="Opp. mínima (ex: 70)"
                value={minOpportunity}
                onChange={(e) => setMinOpportunity(e.target.value)}
              />
              
              <Input 
                type="number"
                placeholder="Diff. máxima (ex: 40)"
                value={maxDifficulty}
                onChange={(e) => setMaxDifficulty(e.target.value)}
              />
              
              <Select value={showUsed} onValueChange={setShowUsed}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unused">Disponíveis</SelectItem>
                  <SelectItem value="used">Usadas</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <Database className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opportunity">Maior Oportunidade</SelectItem>
                  <SelectItem value="difficulty">Menor Dificuldade</SelectItem>
                  <SelectItem value="volume">Maior Volume</SelectItem>
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/admin/blog/importar')} className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Importar
                </Button>
                <Button variant="outline" onClick={exportToCSV} disabled={!keywords?.length}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button onClick={handleSeedKeywords} disabled={isSeeding}>
                  {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Gerar
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t pt-3">
              <p className="text-sm text-muted-foreground">
                {keywords?.length || 0} resultados {keywords?.length === 500 && '(limite de 500)'}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Média Opp: <strong>{stats?.avgOpportunity || 0}</strong></span>
                <span>Média Diff: <strong>{stats?.avgDifficulty || 0}</strong></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : keywords?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mb-4 opacity-50" />
              <p>Nenhuma keyword encontrada</p>
              <p className="text-sm">Tente ajustar os filtros ou gerar novas keywords</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%]">Keyword</TableHead>
                    <TableHead>Cluster</TableHead>
                    <TableHead>Funil</TableHead>
                    <TableHead>Intent</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-center">Dificuldade</TableHead>
                    <TableHead className="text-center">Oportunidade</TableHead>
                    <TableHead className="text-center">Fonte</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keywords?.map(keyword => {
                    const diffBadge = getDifficultyBadge(keyword.difficulty_score);
                    const oppBadge = getOpportunityBadge(keyword.opportunity_score);
                    return (
                      <TableRow key={keyword.id} className={keyword.used ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">
                          <span className="line-clamp-2">{keyword.keyword}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{keyword.cluster}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              keyword.funnel_stage === 'fundo' ? 'bg-green-100 text-green-700 border-green-200' :
                              keyword.funnel_stage === 'meio' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {keyword.funnel_stage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {keyword.intent ? (
                            <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                              {getIntentIcon(keyword.intent)}
                              {keyword.intent}
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {keyword.city && <span className="block text-xs">{keyword.city}</span>}
                            {keyword.bairro && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {keyword.bairro}
                              </span>
                            )}
                            {!keyword.city && !keyword.bairro && '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {keyword.search_volume ? (
                            <span className="text-sm font-mono">{keyword.search_volume.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`text-xs ${diffBadge.className}`}>
                            {keyword.difficulty_score}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`text-xs ${oppBadge.className}`}>
                            {keyword.opportunity_score}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {keyword.source === 'google_planner' ? (
                            <Badge variant="secondary" className="text-xs">Planner</Badge>
                          ) : keyword.source === 'generated' || !keyword.source ? (
                            <Badge variant="outline" className="text-xs">Gerada</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">{keyword.source}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminContainer>
  );
}
