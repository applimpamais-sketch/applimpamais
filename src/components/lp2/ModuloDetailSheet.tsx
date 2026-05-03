import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, ShoppingCart, Wallet, MessageCircle, MapPin, 
  TrendingUp, FileText, Users, BarChart3, Plug, Star, Palette,
  MessageSquare, Info, Target, Clock, Zap, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODULOS_CONTENT, type ModuloContent } from '@/data/modulosContent';

interface SaasModulo {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  preco_base: number | null;
  categoria: string | null;
  icone: string | null;
  ativo: boolean | null;
}

interface ModuloDetailSheetProps {
  modulo: SaasModulo | null;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  dashboard_gestao: LayoutDashboard,
  loja_online: ShoppingCart,
  financeiro: Wallet,
  whatsapp_bot: MessageCircle,
  rastreamento_rota: MapPin,
  marketing_tools: TrendingUp,
  blog_seo: FileText,
  parcerias: Users,
  relatorios_avancados: BarChart3,
  api_access: Plug,
  white_label: Star,
  iarc_criativos: Palette,
};

const categoryConfig: Record<string, { label: string; color: string; gradient: string }> = {
  core: { label: 'Core', color: 'text-blue-400 border-blue-400/30', gradient: 'from-blue-500 to-blue-600' },
  gestao: { label: 'Gestão', color: 'text-purple-400 border-purple-400/30', gradient: 'from-purple-500 to-purple-600' },
  automacao: { label: 'Automação', color: 'text-amber-400 border-amber-400/30', gradient: 'from-amber-500 to-amber-600' },
  operacao: { label: 'Operação', color: 'text-green-400 border-green-400/30', gradient: 'from-green-500 to-green-600' },
  marketing: { label: 'Marketing', color: 'text-pink-400 border-pink-400/30', gradient: 'from-pink-500 to-pink-600' },
  vendas: { label: 'Vendas', color: 'text-orange-400 border-orange-400/30', gradient: 'from-orange-500 to-orange-600' },
  integracao: { label: 'Integração', color: 'text-cyan-400 border-cyan-400/30', gradient: 'from-cyan-500 to-cyan-600' },
  premium: { label: 'Premium', color: 'text-yellow-400 border-yellow-400/30', gradient: 'from-yellow-500 to-yellow-600' },
};

const sectionIcons = {
  whatIs: Info,
  purpose: Target,
  whenToUse: Clock,
  howToUse: Zap,
  whatHappensAfter: CheckCircle2,
};

export default function ModuloDetailSheet({ modulo, isOpen, onClose }: ModuloDetailSheetProps) {
  if (!modulo) return null;

  const IconComponent = iconMap[modulo.codigo] || LayoutDashboard;
  const catConfig = categoryConfig[modulo.categoria || 'core'] || categoryConfig.core;
  const content: ModuloContent | undefined = MODULOS_CONTENT[modulo.codigo];

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no módulo "${modulo.nome}" da plataforma. Gostaria de saber mais detalhes.`
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-gray-950 border-gray-800 p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-gray-800">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
              catConfig.gradient
            )}>
              <IconComponent className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold text-white mb-2">
                {modulo.nome}
              </SheetTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className={cn('text-xs', catConfig.color)}>
                  {catConfig.label}
                </Badge>
                <span className="text-primary font-bold">
                  {modulo.preco_base ? `R$ ${modulo.preco_base}` : 'Incluído'}
                  {modulo.preco_base && <span className="text-xs text-gray-500">/mês</span>}
                </span>
              </div>
            </div>
          </div>
          <SheetDescription className="text-gray-400 mt-4 text-base leading-relaxed">
            {modulo.descricao || 'Módulo poderoso para sua operação.'}
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <ScrollArea className="flex-1 px-6">
          {content ? (
            <div className="py-6 space-y-8">
              {/* 1. O que é */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-400">1</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                    <sectionIcons.whatIs className="w-4 h-4 text-blue-400" />
                    O que é?
                  </h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed pl-8">
                  {content.whatIs}
                </p>
              </section>

              <Separator className="bg-gray-800" />

              {/* 2. Para que serve */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-400">2</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                    <sectionIcons.purpose className="w-4 h-4 text-purple-400" />
                    Para que serve?
                  </h3>
                </div>
                <ul className="space-y-2 pl-8">
                  {content.purpose.map((item, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <Separator className="bg-gray-800" />

              {/* 3. Quando usar */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-400">3</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                    <sectionIcons.whenToUse className="w-4 h-4 text-amber-400" />
                    Quando usar?
                  </h3>
                </div>
                <ul className="space-y-2 pl-8">
                  {content.whenToUse.map((item, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <Separator className="bg-gray-800" />

              {/* 4. Como usar */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-400">4</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                    <sectionIcons.howToUse className="w-4 h-4 text-green-400" />
                    Como usar?
                  </h3>
                </div>
                <div className="space-y-3 pl-8">
                  {content.howToUse.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-green-400">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{item.step}</p>
                        <p className="text-gray-500 text-xs">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <Separator className="bg-gray-800" />

              {/* 5. O que acontece depois */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-cyan-400">5</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                    <sectionIcons.whatHappensAfter className="w-4 h-4 text-cyan-400" />
                    O que acontece depois?
                  </h3>
                </div>
                <ul className="space-y-2 pl-8">
                  {content.whatHappensAfter.map((item, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-500">
              <p>Conteúdo detalhado em breve.</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="p-6 pt-4 border-t border-gray-800 flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
          >
            Fechar
          </Button>
          <Button
            onClick={handleWhatsAppClick}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Quero Este Módulo
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
