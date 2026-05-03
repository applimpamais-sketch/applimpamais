import { LPSection } from '@/types/lp-document';
import { useEditorState } from '../hooks/useEditorState';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface SectionPropertiesProps {
  section: LPSection;
}

const sectionTypes = [
  { value: 'hero', label: 'Hero' },
  { value: 'problem', label: 'Problema' },
  { value: 'solution', label: 'Solução' },
  { value: 'benefits', label: 'Benefícios' },
  { value: 'testimonials', label: 'Depoimentos' },
  { value: 'target-audience', label: 'Para Quem' },
  { value: 'pricing', label: 'Preços' },
  { value: 'bio', label: 'Bio' },
  { value: 'faq', label: 'FAQ' },
  { value: 'cta-final', label: 'CTA Final' },
  { value: 'footer', label: 'Footer' },
  { value: 'marquee', label: 'Marquee' },
  { value: 'custom', label: 'Custom' },
];

const paddingOptions = [
  { value: 'none', label: 'Nenhum' },
  { value: 'sm', label: 'Pequeno' },
  { value: 'md', label: 'Médio' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Extra Grande' },
];

const maxWidthOptions = [
  { value: 'sm', label: 'Pequeno (640px)' },
  { value: 'md', label: 'Médio (768px)' },
  { value: 'lg', label: 'Grande (1024px)' },
  { value: 'xl', label: 'Extra Grande (1280px)' },
  { value: 'full', label: 'Largura Total' },
];

export function SectionProperties({ section }: SectionPropertiesProps) {
  const { updateSection } = useEditorState();

  const handleUpdate = (updates: Partial<LPSection>) => {
    updateSection(section.id, updates);
  };

  const handleStyleUpdate = (styleUpdates: Partial<LPSection['style']>) => {
    updateSection(section.id, {
      style: { ...section.style, ...styleUpdates }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Seção</p>
          <p className="font-medium text-sm">
            {section.name || section.type}
          </p>
        </div>
        <Switch
          checked={section.visible}
          onCheckedChange={(visible) => handleUpdate({ visible })}
        />
      </div>

      <Separator />

      <Accordion type="multiple" defaultValue={['general', 'style']} className="w-full">
        {/* General */}
        <AccordionItem value="general">
          <AccordionTrigger className="text-sm py-2">Geral</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Nome (opcional)</Label>
              <Input
                value={section.name || ''}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                placeholder="Ex: Hero Principal"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={section.type}
                onValueChange={(value) => handleUpdate({ type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Style */}
        <AccordionItem value="style">
          <AccordionTrigger className="text-sm py-2">Estilo</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Padding Vertical</Label>
              <Select
                value={section.style?.paddingY || 'lg'}
                onValueChange={(value) => handleStyleUpdate({ paddingY: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paddingOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Largura Máxima</Label>
              <Select
                value={section.style?.maxWidth || 'xl'}
                onValueChange={(value) => handleStyleUpdate({ maxWidth: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maxWidthOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Cor de Fundo</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={section.style?.background || '#000000'}
                  onChange={(e) => handleStyleUpdate({ background: e.target.value })}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={section.style?.background || ''}
                  onChange={(e) => handleStyleUpdate({ background: e.target.value })}
                  placeholder="var(--lp-bg)"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Imagem de Fundo (URL)</Label>
              <Input
                value={section.style?.backgroundImage || ''}
                onChange={(e) => handleStyleUpdate({ backgroundImage: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Classes CSS Extras</Label>
              <Input
                value={section.style?.className || ''}
                onChange={(e) => handleStyleUpdate({ className: e.target.value })}
                placeholder="class-name another-class"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
