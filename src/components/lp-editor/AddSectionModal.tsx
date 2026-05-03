import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  LayoutGrid, 
  Star, 
  AlertCircle, 
  Lightbulb, 
  Gift, 
  MessageSquare,
  Users,
  CreditCard,
  User,
  HelpCircle,
  MousePointer2,
  Footprints,
  Sparkles,
  Search
} from 'lucide-react';
import { useEditorState } from './hooks/useEditorState';
import { sectionLibrary, createSectionFromTemplate } from './utils/sectionTemplates';
import { cn } from '@/lib/utils';

type SectionTemplateKey = keyof typeof sectionLibrary;

interface AddSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sectionCategories = [
  {
    name: 'Hero',
    icon: <Star className="h-4 w-4" />,
    templates: ['hero-2-col', 'hero-video-centered'] as SectionTemplateKey[],
  },
  {
    name: 'Conteúdo',
    icon: <LayoutGrid className="h-4 w-4" />,
    templates: ['problem', 'benefits-grid', 'solution-preview', 'timeline-days', 'bonus-grid'] as SectionTemplateKey[],
  },
  {
    name: 'Social Proof',
    icon: <MessageSquare className="h-4 w-4" />,
    templates: ['testimonials-grid', 'testimonials-6-grid'] as SectionTemplateKey[],
  },
  {
    name: 'Conversão',
    icon: <CreditCard className="h-4 w-4" />,
    templates: ['pricing-single', 'pricing-complete', 'cta-centered', 'cta-middle'] as SectionTemplateKey[],
  },
  {
    name: 'Outros',
    icon: <Sparkles className="h-4 w-4" />,
    templates: ['bio-horizontal', 'faq-accordion', 'marquee-animated', 'footer-simple', 'custom-empty'] as SectionTemplateKey[],
  },
];

const templateLabels: Record<SectionTemplateKey, { name: string; description: string }> = {
  'hero-2-col': { name: 'Hero 2 Colunas', description: 'Título à esquerda, imagem à direita' },
  'hero-video-centered': { name: 'Hero com Vídeo', description: 'Título + vídeo centralizado + CTA' },
  'problem': { name: 'Problema', description: 'Seção de dor/problema' },
  'benefits-grid': { name: 'Benefícios', description: 'Grid de benefícios com ícones' },
  'solution-preview': { name: 'O Que Vai Aprender', description: 'Imagem + lista de módulos' },
  'timeline-days': { name: 'Cronograma/Dias', description: 'Cards de dias com imagens' },
  'bonus-grid': { name: 'Bônus', description: 'Grid de 3 bônus' },
  'testimonials-grid': { name: 'Depoimentos 3x1', description: 'Grid de 3 testimonials' },
  'testimonials-6-grid': { name: 'Depoimentos 3x2', description: 'Grid de 6 testimonials' },
  'pricing-single': { name: 'Preço Simples', description: 'Card de preço único' },
  'pricing-complete': { name: 'Preço Completo', description: 'Mockup + lista + preço + CTA' },
  'cta-centered': { name: 'CTA Final', description: 'Call-to-action centralizado' },
  'cta-middle': { name: 'CTA Intermediário', description: 'Botão CTA simples' },
  'bio-horizontal': { name: 'Bio', description: 'Apresentação do especialista' },
  'faq-accordion': { name: 'FAQ', description: 'Perguntas frequentes' },
  'marquee-animated': { name: 'Marquee', description: 'Faixa de texto animada' },
  'footer-simple': { name: 'Footer', description: 'Rodapé simples' },
  'custom-empty': { name: 'Personalizado', description: 'Seção vazia para customizar' },
};

export function AddSectionModal({ open, onOpenChange }: AddSectionModalProps) {
  const { addSection } = useEditorState();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleAddSection = (templateKey: SectionTemplateKey) => {
    const section = createSectionFromTemplate(templateKey);
    if (section) {
      addSection(section);
      onOpenChange(false);
    }
  };

  const filteredCategories = selectedCategory
    ? sectionCategories.filter(c => c.name === selectedCategory)
    : sectionCategories;

  const searchLower = search.toLowerCase();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Adicionar Seção</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar seção..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Todas
          </Button>
          {sectionCategories.map((cat) => (
            <Button
              key={cat.name}
              variant={selectedCategory === cat.name ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.icon}
              <span className="ml-1">{cat.name}</span>
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {filteredCategories.map((category) => {
              const filteredTemplates = category.templates.filter((t) => {
                const info = templateLabels[t];
                return (
                  !search ||
                  info.name.toLowerCase().includes(searchLower) ||
                  info.description.toLowerCase().includes(searchLower)
                );
              });

              if (filteredTemplates.length === 0) return null;

              return (
                <div key={category.name}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    {category.icon}
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredTemplates.map((templateKey) => {
                      const info = templateLabels[templateKey];
                      return (
                        <button
                          key={templateKey}
                          onClick={() => handleAddSection(templateKey)}
                          className={cn(
                            'flex flex-col items-start p-4 rounded-lg border border-border',
                            'hover:border-primary hover:bg-primary/5 transition-colors text-left'
                          )}
                        >
                          <span className="font-medium text-sm">{info.name}</span>
                          <span className="text-xs text-muted-foreground mt-1">
                            {info.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
