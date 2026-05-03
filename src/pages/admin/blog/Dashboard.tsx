import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/admin/PageHeader';
import AdminContainer from '@/components/admin/AdminContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBlogPostsStats } from '@/hooks/useBlogPosts';
import { useBlogKeywordsCount, useBlogKeywordsStats, useTopOpportunityKeywords } from '@/hooks/useBlogKeywords';
import { useBlogGeneration } from '@/hooks/useBlogGeneration';
import { 
  FileText, Search, Clock, AlertCircle, TrendingUp, Wand2, Loader2, 
  MapPin, Target, BarChart3, Zap, HelpCircle, ArrowRight, Sparkles,
  TrendingDown, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModernBarChart } from '@/components/charts/ModernBarChart';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export default function BlogDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: postStats, isLoading: loadingPosts } = useBlogPostsStats(!!user);
  const { data: keywordStats, isLoading: loadingKeywords } = useBlogKeywordsCount(!!user);
  const { data: kwStats } = useBlogKeywordsStats(!!user);
  const { data: topKeywords } = useTopOpportunityKeywords(5, !!user);
  const { seedKeywords, isSeeding } = useBlogGeneration();
  
  const handleSeedKeywords = () => {
    seedKeywords.mutate(undefined);
  };
  
  const clusterChartData = postStats?.byCluster.map(item => ({
    name: item.cluster.charAt(0).toUpperCase() + item.cluster.slice(1),
    value: item.count,
  })) || [];

  const cityChartData = kwStats?.byCity.slice(0, 8).map(item => ({
    name: item.city,
    value: item.count,
  })) || [];

  const funnelChartData = kwStats?.byFunnel.map(item => ({
    name: item.stage === 'topo' ? 'Topo' : item.stage === 'meio' ? 'Meio' : 'Fundo',
    value: item.count,
  })) || [];

  const intentChartData = kwStats?.byIntent.slice(0, 6).map(item => ({
    name: item.intent.charAt(0).toUpperCase() + item.intent.slice(1),
    value: item.count,
  })) || [];
  
  if (authLoading || !user) {
    return (
      <AdminContainer>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminContainer>
    );
  }

  const publishRate = postStats?.total 
    ? Math.round((postStats.published / postStats.total) * 100) 
    : 0;

  return (
    <TooltipProvider>
    <AdminContainer>
      <PageHeader
        title="Blog / SEO Intelligence"
        description="Sistema avançado de geração de conteúdo otimizado para ranqueamento"
      />
      
      {/* SEO Intelligence KPIs - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Keywords Total
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Search className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Total de keywords mapeadas no banco, incluindo importadas do Google Planner e geradas automaticamente.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingKeywords ? '...' : keywordStats?.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {keywordStats?.unused.toLocaleString() || 0} disponíveis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alta Oportunidade
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Zap className="h-4 w-4 text-yellow-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Keywords com score de oportunidade ≥ 80. Alto potencial de ranqueamento por combinação de volume, baixa concorrência e intenção comercial.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {kwStats?.highOpportunity.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              score ≥ 80
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Baixa Dificuldade
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <TrendingDown className="h-4 w-4 text-green-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Keywords fáceis de ranquear (difficulty ≤ 30). Geralmente long-tail com baixa concorrência no Google.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {kwStats?.lowDifficulty.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              score ≤ 30
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Posts Publicados
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <FileText className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Artigos já publicados no WordPress. A barra mostra o percentual de publicação em relação ao total de posts gerados.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingPosts ? '...' : postStats?.published || 0}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={publishRate} className="h-1 flex-1" />
              <span className="text-xs text-muted-foreground">{publishRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 - Local SEO + Intent */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Keywords Locais
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <MapPin className="h-4 w-4 text-blue-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Keywords com intenção local (mencionam cidades, bairros ou termos como "perto de mim"). Essenciais para SEO local.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {kwStats?.localKeywords.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              + {kwStats?.withBairro.toLocaleString() || 0} com bairro
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Perguntas (FAQ)
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-purple-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Keywords em formato de pergunta (como, quanto, o que...). Potencial alto para Featured Snippets e "As pessoas também perguntam".</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {kwStats?.questions.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              featured snippets
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opportunity Médio
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <TrendingUp className="h-4 w-4 text-emerald-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Média do score de oportunidade de todas as keywords. Quanto maior, mais chances de ranquear bem. Ideal acima de 70.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kwStats?.avgOpportunity || 0}
            </div>
            <Progress value={kwStats?.avgOpportunity || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Difficulty Médio
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Award className="h-4 w-4 text-orange-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Média da dificuldade de ranqueamento. Quanto menor, mais fácil ranquear. Ideal abaixo de 40.</p>
              </TooltipContent>
            </Tooltip>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kwStats?.avgDifficulty || 0}
            </div>
            <Progress value={kwStats?.avgDifficulty || 0} className="h-2 mt-2 [&>div]:bg-orange-500" />
          </CardContent>
        </Card>
      </div>
      
      {/* Top Opportunity Keywords */}
      {topKeywords && topKeywords.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Top Keywords de Oportunidade
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/blog/keywords')}>
              Ver todas <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topKeywords.map((kw, i) => (
                <div key={kw.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{kw.keyword}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {kw.cluster}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {kw.funnel_stage}
                        </Badge>
                        {kw.city && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <MapPin className="h-3 w-3 mr-1" />
                            {kw.city}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        Opp: {kw.opportunity_score}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Diff: {kw.difficulty_score}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/admin/blog/gerar')}>
                      Gerar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/admin/blog/gerar')}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-full bg-primary/10">
              <Wand2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Gerar Posts</h3>
              <p className="text-sm text-muted-foreground">Criar conteúdo em lote</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/admin/blog/fila')}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-full bg-orange-500/10">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold">Fila & Revisão</h3>
              <p className="text-sm text-muted-foreground">
                {(postStats?.generated || 0) + (postStats?.reviewed || 0)} aguardando
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/admin/blog/keywords')}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-full bg-green-500/10">
              <Target className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold">Banco de Keywords</h3>
              <p className="text-sm text-muted-foreground">{keywordStats?.total.toLocaleString() || 0} mapeadas</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed border-2" onClick={() => navigate('/admin/blog/importar')}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-full bg-blue-500/10">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">Importar Keywords</h3>
              <p className="text-sm text-muted-foreground">CSV do Google Planner</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Seed Keywords Button */}
      {(keywordStats?.total || 0) < 2000 && (
        <Card className="border-dashed border-2 border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold">
                  {(keywordStats?.total || 0) === 0 
                    ? 'Banco de Keywords Vazio' 
                    : 'Expandir Banco de Keywords'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gere 5.000+ keywords SEO com expansão semântica, perguntas, trends e gaps de concorrentes
                </p>
              </div>
            </div>
            <Button onClick={handleSeedKeywords} disabled={isSeeding} size="lg" className="bg-yellow-600 hover:bg-yellow-700">
              {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Wand2 className="mr-2 h-4 w-4" />
              Gerar Keywords SEO
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Keywords por Cidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cityChartData.length > 0 ? (
              <ModernBarChart title="" data={cityChartData} height={200} />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Gere keywords para ver distribuição
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Keywords por Funil
            </CardTitle>
          </CardHeader>
          <CardContent>
            {funnelChartData.length > 0 ? (
              <div className="space-y-4 pt-4">
                {funnelChartData.map((item, i) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">{item.value.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={(item.value / Math.max(...funnelChartData.map(f => f.value))) * 100} 
                      className={`h-3 ${i === 0 ? '[&>div]:bg-blue-500' : i === 1 ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Gere keywords para ver distribuição
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Keywords por Intenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intentChartData.length > 0 ? (
              <ModernBarChart title="" data={intentChartData} height={200} />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Gere keywords para ver distribuição
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status dos Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Na Fila</span>
                </div>
                <span className="font-medium">{postStats?.queued || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Gerando</span>
                </div>
                <span className="font-medium">{postStats?.generating || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm">Aguardando Revisão</span>
                </div>
                <span className="font-medium">{(postStats?.generated || 0) + (postStats?.reviewed || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Publicados</span>
                </div>
                <span className="font-medium">{postStats?.published || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">Com Erro</span>
                </div>
                <span className="font-medium">{postStats?.failed || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cluster Distribution */}
      {clusterChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Posts por Cluster</CardTitle>
          </CardHeader>
          <CardContent>
            <ModernBarChart title="" data={clusterChartData} height={200} />
          </CardContent>
        </Card>
      )}
    </AdminContainer>
    </TooltipProvider>
  );
}
