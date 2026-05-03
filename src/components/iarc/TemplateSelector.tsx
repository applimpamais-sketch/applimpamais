import { Check, Flower2, Stethoscope } from 'lucide-react';

export type TemplateReal = 'lp-12d' | 'lp-teodoro';

interface TemplateSelectorProps {
  value: TemplateReal;
  onChange: (template: TemplateReal) => void;
}

const templates = [
  {
    id: 'lp-12d' as const,
    nome: 'Desafio 12D',
    nicho: 'Feminino & Empoderamento',
    descricao: 'Template feminino e empoderador, ideal para coaches, mentoras e produtos digitais',
    icon: Flower2,
    gradient: 'from-[#9F56CB] to-[#F988E7]',
    bgPreview: 'bg-gradient-to-br from-[#9F56CB]/20 to-[#F988E7]/20',
    secoes: [
      'Hero com imagem lateral',
      'Seção problema (selo rotativo)',
      'Metáfora do jardim',
      'Timeline de benefícios',
      'Carousel de depoimentos',
      'Para quem é / não é',
      'Pricing com mockup',
      'FAQ accordion',
    ],
    idealPara: 'Coaches femininas, mentoras, produtos digitais, cursos de desenvolvimento pessoal',
  },
  {
    id: 'lp-teodoro' as const,
    nome: 'Teodoro',
    nicho: 'Profissional & Serviços',
    descricao: 'Template profissional para serviços de saúde, clínicas e profissionais liberais',
    icon: Stethoscope,
    gradient: 'from-orange-500 to-red-500',
    bgPreview: 'bg-gradient-to-br from-orange-500/20 to-red-500/20',
    secoes: [
      'Hero com badge e CTA',
      'Marquee animado',
      'Sobre o problema',
      'Cards de diferenciais',
      'Grid de depoimentos',
      'Bio do profissional',
      'CTA final com laptop',
      'FAQ accordion',
    ],
    idealPara: 'Médicos, dentistas, clínicas, serviços locais, profissionais liberais',
  },
];

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {templates.map((template) => {
        const isSelected = value === template.id;
        const Icon = template.icon;
        
        return (
          <button
            key={template.id}
            onClick={() => onChange(template.id)}
            className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
              isSelected 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-border hover:border-primary/50 bg-card'
            }`}
          >
            {/* Selection badge */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            
            {/* Preview mockup */}
            <div className={`w-full h-28 rounded-xl ${template.bgPreview} flex items-center justify-center mb-4 border border-border/50`}>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${template.gradient} text-white shadow-lg`}>
                <Icon className="h-8 w-8" />
              </div>
            </div>
            
            {/* Template info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{template.nome}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${template.gradient} text-white`}>
                  {template.nicho}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {template.descricao}
              </p>
              
              {/* Seções incluídas */}
              <div className="pt-2 border-t border-border/50 mt-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Seções incluídas:</p>
                <div className="grid grid-cols-2 gap-1">
                  {template.secoes.slice(0, 6).map((secao, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="truncate">{secao}</span>
                    </div>
                  ))}
                </div>
                {template.secoes.length > 6 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    +{template.secoes.length - 6} mais...
                  </p>
                )}
              </div>
              
              {/* Ideal para */}
              <p className="text-xs text-muted-foreground pt-2">
                <strong>Ideal para:</strong> {template.idealPara}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
