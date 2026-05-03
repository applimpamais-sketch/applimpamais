import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Download, FileText, Sparkles } from 'lucide-react';
import { PDF_TEMPLATES, PdfTemplate } from '@/utils/pdfTemplates';

interface PdfTemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (template: PdfTemplate) => void;
  isDownloading?: boolean;
}

const templateIcons: Record<PdfTemplate, typeof FileText> = {
  classic: FileText,
  modern: Sparkles,
};

export function PdfTemplateSelector({
  open,
  onOpenChange,
  onDownload,
  isDownloading,
}: PdfTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<PdfTemplate>('classic');

  const handleDownload = () => {
    onDownload(selectedTemplate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Escolha o Modelo do PDF
          </DialogTitle>
          <DialogDescription>
            Selecione o layout que melhor se adequa ao seu orçamento
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedTemplate}
          onValueChange={(value) => setSelectedTemplate(value as PdfTemplate)}
          className="space-y-3 py-4"
        >
          {PDF_TEMPLATES.map((template) => {
            const Icon = templateIcons[template.id];
            const isSelected = selectedTemplate === template.id;
            
            return (
              <div
                key={template.id}
                className={`relative flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <RadioGroupItem value={template.id} id={template.id} className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={template.id}
                    className="flex items-center gap-2 text-base font-semibold cursor-pointer"
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    {template.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <p className="text-xs text-muted-foreground/70 italic mt-1">{template.preview}</p>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDownload} disabled={isDownloading}>
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Gerando...' : 'Baixar PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
