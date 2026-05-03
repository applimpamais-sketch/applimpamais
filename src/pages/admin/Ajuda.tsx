import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Download, 
  Search, 
  ChevronRight,
  LayoutDashboard,
  Megaphone,
  Users2,
  DollarSign,
  Plug,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import AdminContainer from '@/components/admin/AdminContainer';
import PageHeader from '@/components/admin/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { downloadAdminManualPdf } from '@/utils/generateAdminManualPdf';
import { MANUAL_SECTIONS, MANUAL_BEST_PRACTICES, MANUAL_COMMON_ERRORS } from '@/utils/adminManualContent';

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Megaphone,
  Users2,
  DollarSign,
  Plug,
};

export default function Ajuda() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      await downloadAdminManualPdf();
      toast.success('Manual do Administrador baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar o manual. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredSections = MANUAL_SECTIONS.map(section => ({
    ...section,
    content: section.content.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.whatIs.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.purpose.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(section => section.content.length > 0);

  return (
    <AdminContainer>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader
          title="Central de Ajuda"
          subtitle="Manual completo do administrador e guias de uso da plataforma"
        />
        
        <Button 
          onClick={handleDownloadPdf} 
          disabled={isGenerating}
          className="bg-primary hover:bg-primary/90"
          data-tour="ajuda-download"
        >
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? 'Gerando PDF...' : 'Baixar Manual PDF'}
        </Button>
      </div>

      {/* Busca */}
      <div className="relative mb-6" data-tour="ajuda-search">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar no manual... (ex: agendamentos, cupons, financeiro)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3" data-tour="ajuda-tabs">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Manual Completo</span>
            <span className="sm:hidden">Manual</span>
          </TabsTrigger>
          <TabsTrigger value="praticas" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Boas Práticas</span>
            <span className="sm:hidden">Práticas</span>
          </TabsTrigger>
          <TabsTrigger value="erros" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Erros Comuns</span>
            <span className="sm:hidden">Erros</span>
          </TabsTrigger>
        </TabsList>

        {/* Manual Completo */}
        <TabsContent value="manual" className="space-y-6">
          {(searchTerm ? filteredSections : MANUAL_SECTIONS).map((section) => {
            const IconComponent = iconMap[section.icon || ''] || BookOpen;
            
            return (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <CardDescription>
                        {section.content.length} funcionalidade{section.content.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {section.content.map((item) => (
                      <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-medium">{item.title}</span>
                            {item.route && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {item.route}
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 space-y-4">
                          {/* O que é */}
                          <div>
                            <h4 className="font-semibold text-sm text-primary mb-2">
                              1. O que é essa tela?
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {item.whatIs}
                            </p>
                          </div>

                          {/* Para que serve */}
                          <div>
                            <h4 className="font-semibold text-sm text-primary mb-2">
                              2. Para que serve?
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {item.purpose.map((p, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Quando usar */}
                          <div>
                            <h4 className="font-semibold text-sm text-primary mb-2">
                              3. Quando usar?
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {item.whenToUse.map((w, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <ChevronRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Como usar */}
                          <div>
                            <h4 className="font-semibold text-sm text-primary mb-2">
                              4. Como usar? (Passo a passo)
                            </h4>
                            <div className="space-y-3">
                              {item.howToUse.map((step, i) => (
                                <div key={i} className="flex gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">
                                    {i + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{step.step}</p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* O que acontece depois */}
                          <div>
                            <h4 className="font-semibold text-sm text-primary mb-2">
                              5. O que acontece depois?
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {item.whatHappensAfter.map((a, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-accent-foreground flex-shrink-0" />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Avisos */}
                          {item.warnings.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-lg p-4">
                              <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                O que evitar
                              </h4>
                              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                                {item.warnings.map((w, i) => (
                                  <li key={i}>• {w}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Botão para acessar a tela */}
                          {item.route && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(item.route!)}
                              className="mt-4"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Acessar {item.title}
                            </Button>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}

          {searchTerm && filteredSections.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum resultado encontrado para "{searchTerm}"
                </p>
                <Button 
                  variant="link" 
                  onClick={() => setSearchTerm('')}
                  className="mt-2"
                >
                  Limpar busca
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Boas Práticas */}
        <TabsContent value="praticas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {MANUAL_BEST_PRACTICES.map((practice) => (
              <Card key={practice.category}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {practice.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {practice.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Erros Comuns */}
        <TabsContent value="erros" className="space-y-4">
          {MANUAL_COMMON_ERRORS.map((error, index) => (
            <Card key={index} className="border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  {error.error}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Causa:</p>
                  <p className="text-sm">{error.cause}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Solução:</p>
                  <p className="text-sm">{error.solution}</p>
                </div>
                <div className="bg-accent/50 border border-accent rounded-lg p-3">
                  <p className="text-sm font-medium text-accent-foreground">💡 Prevenção:</p>
                  <p className="text-sm text-accent-foreground/80">{error.prevention}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </AdminContainer>
  );
}
