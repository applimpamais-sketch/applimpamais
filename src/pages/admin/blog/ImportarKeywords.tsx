import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBlogImport, PreviewKeyword, parseCSVPreview, ImportResult } from '@/hooks/useBlogImport';
import { 
  Upload, FileText, Loader2, CheckCircle, XCircle, AlertCircle, 
  ArrowRight, Sparkles, Download, MapPin, Target, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

export default function ImportarKeywords() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { importKeywords, isImporting } = useBlogImport();
  
  const [isDragging, setIsDragging] = useState(false);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    keywords: PreviewKeyword[];
    columnsDetected: {
      keyword: number;
      volume: number;
      competition: number;
      cpc: number;
    };
  } | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [ignoreDuplicates, setIgnoreDuplicates] = useState(true);
  
  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Por favor, selecione um arquivo CSV');
      return;
    }
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      const preview = parseCSVPreview(content);
      setPreviewData(preview);
      setImportResult(null);
    };
    reader.readAsText(file);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);
  
  const handleImport = async () => {
    if (!csvContent) return;
    
    try {
      const result = await importKeywords.mutateAsync(csvContent);
      setImportResult(result);
    } catch (error) {
      console.error('Import error:', error);
    }
  };
  
  const handleReset = () => {
    setCsvContent(null);
    setPreviewData(null);
    setImportResult(null);
    setFileName('');
  };
  
  const getStatusBadge = (status: PreviewKeyword['status']) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> OK</Badge>;
      case 'duplicate':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertCircle className="h-3 w-3 mr-1" /> Duplicada</Badge>;
      case 'invalid':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Inválida</Badge>;
    }
  };
  
  const getIntentBadge = (intent: string) => {
    const colors: Record<string, string> = {
      transacional: 'bg-green-100 text-green-700',
      local: 'bg-blue-100 text-blue-700',
      question: 'bg-purple-100 text-purple-700',
      comparativo: 'bg-orange-100 text-orange-700',
      info: 'bg-gray-100 text-gray-700',
    };
    return <Badge className={colors[intent] || colors.info}>{intent}</Badge>;
  };
  
  const getCompetitionBadge = (competition: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta' };
    return <Badge variant="outline" className={colors[competition]}>{labels[competition]}</Badge>;
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
  
  // Resultado da importação
  if (importResult) {
    return (
      <AdminContainer>
        <PageHeader
          title="Importação Concluída"
          description="Keywords importadas com sucesso do Google Keyword Planner"
        />
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Importadas</p>
                  <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Duplicadas</p>
                  <p className="text-2xl font-bold text-yellow-600">{importResult.duplicates}</p>
                </div>
                <AlertCircle className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inválidas</p>
                  <p className="text-2xl font-bold text-red-600">{importResult.invalid}</p>
                </div>
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Processado</p>
                  <p className="text-2xl font-bold">{importResult.total_processed}</p>
                </div>
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Cluster Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Clusters Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(importResult.cluster_summary)
                .sort((a, b) => b[1] - a[1])
                .map(([cluster, count]) => (
                  <Badge key={cluster} variant="outline" className="text-sm px-3 py-1">
                    {cluster}: {count}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Top Opportunities */}
        {importResult.top_opportunities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Top 10 Keywords de Oportunidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {importResult.top_opportunities.map((kw, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                      <div>
                        <p className="font-medium text-sm">{kw.keyword}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{kw.cluster}</Badge>
                          {getCompetitionBadge(kw.competition)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">Opp: {kw.opportunity}</p>
                      <p className="text-xs text-muted-foreground">{kw.volume.toLocaleString()} buscas/mês</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleReset} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar Outro Arquivo
          </Button>
          <Button onClick={() => navigate('/admin/blog/keywords')}>
            Ver Banco de Keywords
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button onClick={() => navigate('/admin/blog/gerar')} variant="secondary">
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar Posts
          </Button>
        </div>
      </AdminContainer>
    );
  }
  
  return (
    <AdminContainer>
      <PageHeader
        title="Importar Keywords"
        description="Importe keywords do Google Keyword Planner para análise e geração de posts"
      />
      
      {/* Upload Area */}
      {!previewData && (
        <Card>
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Arraste o arquivo CSV aqui
              </h3>
              <p className="text-muted-foreground mb-4">
                ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground">
                Formatos aceitos: CSV exportado do Google Keyword Planner
              </p>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            
            {/* Instructions */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Como exportar do Google Keyword Planner:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Acesse o Google Ads e abra o Planejador de Palavras-chave</li>
                <li>Busque por suas palavras-chave ou veja ideias</li>
                <li>Clique em "Baixar ideias de palavras-chave" (ícone de download)</li>
                <li>Selecione o formato CSV</li>
                <li>Faça upload do arquivo aqui</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Preview */}
      {previewData && (
        <>
          {/* File Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{fileName}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span>Colunas detectadas:</span>
                      <Badge variant={previewData.columnsDetected.keyword !== -1 ? 'default' : 'destructive'}>
                        Keyword {previewData.columnsDetected.keyword !== -1 ? '✓' : '✗'}
                      </Badge>
                      <Badge variant={previewData.columnsDetected.volume !== -1 ? 'secondary' : 'outline'}>
                        Volume {previewData.columnsDetected.volume !== -1 ? '✓' : '?'}
                      </Badge>
                      <Badge variant={previewData.columnsDetected.competition !== -1 ? 'secondary' : 'outline'}>
                        Competition {previewData.columnsDetected.competition !== -1 ? '✓' : '?'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" onClick={handleReset}>
                  Trocar arquivo
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {previewData.keywords.filter(k => k.status === 'ok').length}
                </p>
                <p className="text-sm text-muted-foreground">Válidas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {previewData.keywords.filter(k => k.status === 'duplicate').length}
                </p>
                <p className="text-sm text-muted-foreground">Duplicadas (no arquivo)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {previewData.keywords.filter(k => k.status === 'invalid').length}
                </p>
                <p className="text-sm text-muted-foreground">Inválidas</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Preview Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Pré-visualização (primeiras 100 linhas)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-[30%]">Keyword</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead>Competição</TableHead>
                      <TableHead>Intent</TableHead>
                      <TableHead>Cluster</TableHead>
                      <TableHead>Funil</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.keywords.map((kw, i) => (
                      <TableRow key={i} className={kw.status !== 'ok' ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {kw.keyword}
                            {kw.city && (
                              <Badge variant="outline" className="text-xs bg-blue-50">
                                <MapPin className="h-3 w-3 mr-1" />
                                {kw.city}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {kw.volume > 0 ? kw.volume.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>{getCompetitionBadge(kw.competition)}</TableCell>
                        <TableCell>{getIntentBadge(kw.intent)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{kw.cluster}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={
                              kw.funnelStage === 'fundo' ? 'bg-green-100 text-green-700' :
                              kw.funnelStage === 'meio' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }
                          >
                            {kw.funnelStage}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(kw.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Options & Import */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="ignore-duplicates" 
                      checked={ignoreDuplicates}
                      onCheckedChange={(checked) => setIgnoreDuplicates(!!checked)}
                    />
                    <label htmlFor="ignore-duplicates" className="text-sm">
                      Ignorar duplicadas automaticamente
                    </label>
                  </div>
                  <Badge variant="secondary">
                    Fonte: Google Planner
                  </Badge>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleReset}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={isImporting || previewData.columnsDetected.keyword === -1}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Importar Tudo ({previewData.keywords.filter(k => k.status === 'ok').length})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </AdminContainer>
  );
}
