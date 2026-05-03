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
import { themes, LPThemeId } from '@/styles/lp-css-themes';

const themeOptions: { value: LPThemeId; label: string }[] = [
  { value: 'midnight_pro', label: 'Midnight Pro' },
  { value: 'warm_sunset', label: 'Warm Sunset' },
  { value: 'nature_clean', label: 'Nature Clean' },
  { value: 'royal_purple', label: 'Royal Purple' },
  { value: 'ocean_deep', label: 'Ocean Deep' },
  { value: 'feminine_purple', label: 'Feminine Purple' },
];

const ctaDestinations = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'formulario', label: 'Formulário' },
];

export function GlobalProperties() {
  const { document, setDocument } = useEditorState();

  const handleMetaUpdate = (updates: Partial<typeof document.meta>) => {
    setDocument({
      ...document,
      meta: { ...document.meta, ...updates }
    });
  };

  const handleSettingsUpdate = (updates: Partial<typeof document.settings>) => {
    setDocument({
      ...document,
      settings: { ...document.settings, ...updates }
    });
  };

  return (
    <Accordion type="multiple" defaultValue={['theme', 'meta', 'settings']} className="w-full">
      {/* Theme */}
      <AccordionItem value="theme">
        <AccordionTrigger className="text-sm py-2">Tema</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs">Tema Global</Label>
            <Select
              value={document.theme_id}
              onValueChange={(value) => setDocument({ ...document, theme_id: value as LPThemeId })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ 
                          background: `linear-gradient(135deg, ${themes[theme.value]['--lp-primary']}, ${themes[theme.value]['--lp-primary-end']})`
                        }}
                      />
                      {theme.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Preview */}
          <div className="p-3 rounded-lg border" style={{ 
            background: themes[document.theme_id]['--lp-bg'],
            color: themes[document.theme_id]['--lp-text']
          }}>
            <p className="text-xs mb-2">Preview do tema:</p>
            <div 
              className="text-sm font-bold mb-1"
              style={{ 
                background: `linear-gradient(to right, ${themes[document.theme_id]['--lp-primary']}, ${themes[document.theme_id]['--lp-primary-end']})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Texto Gradiente
            </div>
            <div 
              className="text-xs px-3 py-1.5 rounded-full inline-block"
              style={{ 
                background: `linear-gradient(to right, ${themes[document.theme_id]['--lp-primary']}, ${themes[document.theme_id]['--lp-primary-end']})`,
                color: themes[document.theme_id]['--lp-primary-contrast']
              }}
            >
              Botão
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Meta */}
      <AccordionItem value="meta">
        <AccordionTrigger className="text-sm py-2">SEO</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className="text-xs">Título da Página</Label>
            <Input
              value={document.meta.title}
              onChange={(e) => handleMetaUpdate({ title: e.target.value })}
              placeholder="Título para SEO"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Descrição</Label>
            <Input
              value={document.meta.description}
              onChange={(e) => handleMetaUpdate({ description: e.target.value })}
              placeholder="Meta description"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Favicon (URL)</Label>
            <Input
              value={document.meta.favicon || ''}
              onChange={(e) => handleMetaUpdate({ favicon: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Settings */}
      <AccordionItem value="settings">
        <AccordionTrigger className="text-sm py-2">Configurações</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Animações</Label>
            <Switch
              checked={document.settings.animations_enabled}
              onCheckedChange={(animations_enabled) => 
                handleSettingsUpdate({ animations_enabled })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Empilhar colunas no mobile</Label>
            <Switch
              checked={document.settings.mobile_stack_columns}
              onCheckedChange={(mobile_stack_columns) => 
                handleSettingsUpdate({ mobile_stack_columns })
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs">Destino do CTA</Label>
            <Select
              value={document.settings.cta_destination}
              onValueChange={(value) => 
                handleSettingsUpdate({ cta_destination: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ctaDestinations.map((dest) => (
                  <SelectItem key={dest.value} value={dest.value}>
                    {dest.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {document.settings.cta_destination === 'whatsapp' && (
            <div className="space-y-2">
              <Label className="text-xs">Número WhatsApp</Label>
              <Input
                value={document.settings.whatsapp_number || ''}
                onChange={(e) => handleSettingsUpdate({ whatsapp_number: e.target.value })}
                placeholder="5511999999999"
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
