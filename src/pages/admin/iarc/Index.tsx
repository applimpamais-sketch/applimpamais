import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  FileText, 
  Layout, 
  Sparkles, 
  ArrowRight,
  Wand2,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModuleGate } from '@/components/admin/ModuleGate';

const tools = [
  {
    id: 'criativos',
    title: 'Gerador de Criativos',
    description: 'Crie imagens para Feed, Stories e Carrossel usando IA. Perfeito para anúncios no Instagram e Facebook.',
    icon: Image,
    path: '/admin/iarc/criativos',
    color: 'from-pink-500 to-rose-600',
    features: ['Feed 1080x1080', 'Stories 1080x1920', 'Carrossel 3-5 slides'],
    badge: 'IA Generativa'
  },
  {
    id: 'landing-pages',
    title: 'Landing Pages',
    description: 'Crie páginas de conversão com templates validados. A IA gera todo o texto persuasivo para você.',
    icon: Layout,
    path: '/admin/iarc/landing-pages',
    color: 'from-blue-500 to-indigo-600',
    features: ['5 templates prontos', 'Copy gerada por IA', 'Publicação rápida'],
    badge: 'Templates Validados'
  },
  {
    id: 'copy-generator',
    title: 'Gerador de Copy',
    description: 'Gere textos persuasivos para suas landing pages, anúncios e campanhas de marketing.',
    icon: FileText,
    path: '/admin/iarc/copy-generator',
    color: 'from-emerald-500 to-teal-600',
    features: ['Headlines', 'CTAs', 'Bullets', 'FAQs'],
    badge: 'Copywriting IA'
  }
];

export default function IARCIndex() {
  const navigate = useNavigate();

  return (
    <ModuleGate module="iarc_criativos" moduleName="IARC Studio">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Powered by AI</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            IARC Studio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Crie criativos, landing pages e copies persuasivas usando inteligência artificial.
            Tudo que você precisa para suas campanhas de marketing.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card 
              key={tool.id} 
              className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 cursor-pointer"
              onClick={() => navigate(tool.path)}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} text-white`}>
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {tool.badge}
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-xl">{tool.title}</CardTitle>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                {/* CTA Button */}
                <Button 
                  variant="ghost" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Acessar
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-primary">∞</div>
            <div className="text-sm text-muted-foreground">Criativos por Mês</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-primary">5</div>
            <div className="text-sm text-muted-foreground">Templates LP</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-3xl font-bold text-primary">7</div>
            <div className="text-sm text-muted-foreground">Tipos de Copy</div>
          </Card>
          <Card className="text-center p-4">
            <div className="flex items-center justify-center gap-1">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground">Geração Instantânea</div>
          </Card>
        </div>
      </div>
    </ModuleGate>
  );
}
