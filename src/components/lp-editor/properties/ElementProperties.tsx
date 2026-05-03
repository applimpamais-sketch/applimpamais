import { LPElement, ElementProps, ElementStyle } from '@/types/lp-document';
import { useEditorState } from '../hooks/useEditorState';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

interface ElementPropertiesProps {
  element: LPElement;
}

const fontSizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'md', label: 'MD' },
  { value: 'lg', label: 'LG' },
  { value: 'xl', label: 'XL' },
  { value: '2xl', label: '2XL' },
  { value: '3xl', label: '3XL' },
  { value: '4xl', label: '4XL' },
  { value: '5xl', label: '5XL' },
];

const fontWeightOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semibold' },
  { value: 'bold', label: 'Bold' },
];

const headingLevels = [
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'h4', label: 'H4' },
];

const buttonVariants = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'outline', label: 'Outline' },
];

const buttonSizes = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

const imageRoundedOptions = [
  { value: 'none', label: 'Nenhum' },
  { value: 'md', label: 'Médio' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'XL' },
  { value: 'full', label: 'Circular' },
];

export function ElementProperties({ element }: ElementPropertiesProps) {
  const { updateElement, updateElementStyle, removeElement } = useEditorState();

  const handlePropsUpdate = (updates: Partial<ElementProps>) => {
    updateElement(element.id, { props: { ...element.props, ...updates } });
  };

  const handleStyleUpdate = (updates: Partial<ElementStyle>) => {
    updateElementStyle(element.id, updates);
  };

  const renderPropsEditor = () => {
    switch (element.type) {
      case 'heading':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Texto</Label>
              <Textarea
                value={element.props.text || ''}
                onChange={(e) => handlePropsUpdate({ text: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Nível</Label>
              <Select
                value={element.props.level || 'h2'}
                onValueChange={(value) => handlePropsUpdate({ level: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {headingLevels.map((lvl) => (
                    <SelectItem key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Usar Gradiente</Label>
              <Switch
                checked={element.props.useGradient || false}
                onCheckedChange={(useGradient) => handlePropsUpdate({ useGradient })}
              />
            </div>
          </>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Label className="text-xs">Conteúdo</Label>
            <Textarea
              value={element.props.content || ''}
              onChange={(e) => handlePropsUpdate({ content: e.target.value })}
              rows={5}
            />
          </div>
        );

      case 'image':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">URL da Imagem</Label>
              <Input
                value={element.props.src || ''}
                onChange={(e) => handlePropsUpdate({ src: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Alt Text</Label>
              <Input
                value={element.props.alt || ''}
                onChange={(e) => handlePropsUpdate({ alt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Bordas Arredondadas</Label>
              <Select
                value={element.props.rounded || 'none'}
                onValueChange={(value) => handlePropsUpdate({ rounded: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageRoundedOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'button':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Label</Label>
              <Input
                value={element.props.label || ''}
                onChange={(e) => handlePropsUpdate({ label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Link</Label>
              <Input
                value={element.props.href || ''}
                onChange={(e) => handlePropsUpdate({ href: e.target.value })}
                placeholder="https://... ou #section"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Variante</Label>
              <Select
                value={element.props.variant || 'primary'}
                onValueChange={(value) => handlePropsUpdate({ variant: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buttonVariants.map((v) => (
                    <SelectItem key={v.value} value={v.value}>
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Tamanho</Label>
              <Select
                value={element.props.size || 'md'}
                onValueChange={(value) => handlePropsUpdate({ size: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buttonSizes.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'spacer':
        return (
          <div className="space-y-2">
            <Label className="text-xs">Altura</Label>
            <Select
              value={element.props.height || 'md'}
              onValueChange={(value) => handlePropsUpdate({ height: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Pequeno (16px)</SelectItem>
                <SelectItem value="md">Médio (32px)</SelectItem>
                <SelectItem value="lg">Grande (48px)</SelectItem>
                <SelectItem value="xl">Extra Grande (64px)</SelectItem>
              </SelectContent>
          </Select>
          </div>
        );

      case 'badge':
        return (
          <div className="space-y-2">
            <Label className="text-xs">Texto</Label>
            <Input
              value={element.props.badgeText || ''}
              onChange={(e) => handlePropsUpdate({ badgeText: e.target.value })}
            />
          </div>
        );

      case 'video':
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">URL do Vídeo</Label>
              <Input
                value={element.props.videoUrl || ''}
                onChange={(e) => handlePropsUpdate({ videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground">
                Suporta YouTube, Vimeo ou URL direta
              </p>
            </div>
            {element.props.videoUrl && !element.props.videoUrl.includes('youtube') && !element.props.videoUrl.includes('vimeo') && (
              <div className="space-y-2">
                <Label className="text-xs">Thumbnail</Label>
                <Input
                  value={element.props.poster || ''}
                  onChange={(e) => handlePropsUpdate({ poster: e.target.value })}
                  placeholder="URL da imagem de capa"
                />
              </div>
            )}
          </>
        );

      default:
        return (
          <p className="text-xs text-muted-foreground">
            Editor específico para "{element.type}" em desenvolvimento
          </p>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground capitalize">{element.type}</p>
          <p className="font-medium text-sm truncate max-w-[180px]">
            {element.props.text || element.props.label || element.props.content?.slice(0, 20) || element.type}
          </p>
        </div>
        <Switch
          checked={element.visible}
          onCheckedChange={(visible) => handlePropsUpdate({ visible } as any)}
        />
      </div>

      <Separator />

      <Accordion type="multiple" defaultValue={['props', 'style']} className="w-full">
        {/* Props */}
        <AccordionItem value="props">
          <AccordionTrigger className="text-sm py-2">Conteúdo</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {renderPropsEditor()}
          </AccordionContent>
        </AccordionItem>

        {/* Style */}
        <AccordionItem value="style">
          <AccordionTrigger className="text-sm py-2">Estilo</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Tamanho da Fonte</Label>
              <Select
                value={element.style?.fontSize || 'md'}
                onValueChange={(value) => handleStyleUpdate({ fontSize: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Peso da Fonte</Label>
              <Select
                value={element.style?.fontWeight || 'normal'}
                onValueChange={(value) => handleStyleUpdate({ fontWeight: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontWeightOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Alinhamento</Label>
              <ToggleGroup 
                type="single" 
                value={element.style?.textAlign || 'left'}
                onValueChange={(value) => value && handleStyleUpdate({ textAlign: value as any })}
                className="justify-start"
              >
                <ToggleGroupItem value="left" size="sm">
                  <AlignLeft className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" size="sm">
                  <AlignCenter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="right" size="sm">
                  <AlignRight className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={element.style?.color || '#ffffff'}
                  onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={element.style?.color || ''}
                  onChange={(e) => handleStyleUpdate({ color: e.target.value })}
                  placeholder="var(--lp-text)"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">Margin Top</Label>
                <Input
                  value={element.style?.marginTop || ''}
                  onChange={(e) => handleStyleUpdate({ marginTop: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Margin Bottom</Label>
                <Input
                  value={element.style?.marginBottom || ''}
                  onChange={(e) => handleStyleUpdate({ marginBottom: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Actions */}
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-destructive hover:text-destructive"
        onClick={() => removeElement(element.id)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Remover Elemento
      </Button>
    </div>
  );
}
