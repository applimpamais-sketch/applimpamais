import { Badge } from '@/components/ui/badge';
import { Bot, User, Globe, UserCheck, Users, Megaphone, Instagram, Search, FileText, ShoppingBag, Mail, Link2, Youtube, Music2 } from 'lucide-react';
import { useFuncionarioBotNome } from '@/hooks/useFuncionarioBotNome';
import { cn } from '@/lib/utils';

interface OrigemAgendamentoBadgeProps {
  origem: string | null | undefined;
  criadoPorFuncionarioBotId?: string | null;
  criadoManualmente?: boolean | null;
  parceiroCodigo?: string | null;
  canalOrigem?: string | null;
  className?: string;
  compact?: boolean;
}

// Mapeamento de tipos de canal para ícones
const canalIcons: Record<string, any> = {
  instagram: Instagram,
  google: Search,
  blog: FileText,
  marketplace: ShoppingBag,
  email: Mail,
  tiktok: Music2,
  youtube: Youtube,
  outro: Link2,
};

// Cores por tipo de canal
const canalColors: Record<string, string> = {
  instagram: 'bg-pink-500/10 text-pink-600 border-pink-300 dark:text-pink-400',
  google: 'bg-blue-500/10 text-blue-600 border-blue-300 dark:text-blue-400',
  blog: 'bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:text-emerald-400',
  marketplace: 'bg-orange-500/10 text-orange-600 border-orange-300 dark:text-orange-400',
  email: 'bg-violet-500/10 text-violet-600 border-violet-300 dark:text-violet-400',
  tiktok: 'bg-slate-800/10 text-slate-800 border-slate-400 dark:text-slate-200',
  youtube: 'bg-red-500/10 text-red-600 border-red-300 dark:text-red-400',
  outro: 'bg-slate-500/10 text-slate-600 border-slate-300 dark:text-slate-400',
};

// Mapeamento de códigos de canal para tipos
const canalTipoMap: Record<string, string> = {
  bio: 'instagram',
  stories: 'instagram',
  'google-organico': 'google',
  'google-maps': 'google',
  blog: 'blog',
  mercadolivre: 'marketplace',
  olx: 'marketplace',
  email: 'email',
  indicacao: 'outro',
  tiktok: 'tiktok',
  youtube: 'youtube',
};

export function OrigemAgendamentoBadge({
  origem,
  criadoPorFuncionarioBotId,
  criadoManualmente,
  parceiroCodigo,
  canalOrigem,
  className,
  compact = false,
}: OrigemAgendamentoBadgeProps) {
  const { data: nomeFuncionario } = useFuncionarioBotNome(criadoPorFuncionarioBotId);

  // 1. Parceiro (maior prioridade visual - gera comissão)
  if (parceiroCodigo) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-amber-500/10 text-amber-700 border-amber-300 dark:text-amber-300",
          className
        )}
      >
        <Users className="h-3 w-3 mr-1" />
        {compact ? 'Parceiro' : `Parceiro: ${parceiroCodigo}`}
      </Badge>
    );
  }

  // 2. Canal orgânico da empresa
  if (canalOrigem) {
    const tipo = canalTipoMap[canalOrigem] || 'outro';
    const Icon = canalIcons[tipo] || Link2;
    const colors = canalColors[tipo] || canalColors.outro;
    
    // Nomes amigáveis
    const nomeAmigavel: Record<string, string> = {
      bio: 'Bio Instagram',
      stories: 'Stories',
      'google-organico': 'Google',
      'google-maps': 'Maps',
      blog: 'Blog',
      mercadolivre: 'ML',
      olx: 'OLX',
      email: 'E-mail',
      indicacao: 'Indicação',
      tiktok: 'TikTok',
      youtube: 'YouTube',
    };
    
    return (
      <Badge 
        variant="outline" 
        className={cn(colors, className)}
      >
        <Icon className="h-3 w-3 mr-1" />
        {compact ? nomeAmigavel[canalOrigem] || canalOrigem : `Via ${nomeAmigavel[canalOrigem] || canalOrigem}`}
      </Badge>
    );
  }

  // 3. Atendente WhatsApp
  if (origem === 'atendente_whatsapp' && criadoPorFuncionarioBotId) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-purple-500/10 text-purple-700 border-purple-300 dark:text-purple-300",
          className
        )}
      >
        <UserCheck className="h-3 w-3 mr-1" />
        {compact ? 'Atendente' : `Via Atendente${nomeFuncionario ? `: ${nomeFuncionario}` : ''}`}
      </Badge>
    );
  }

  // 4. Bot WhatsApp
  if (origem === 'whatsapp_bot') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-green-500/10 text-green-700 border-green-300 dark:text-green-300",
          className
        )}
      >
        <Bot className="h-3 w-3 mr-1" />
        {compact ? 'Bot' : 'Via Bot WhatsApp'}
      </Badge>
    );
  }

  // 5. Tráfego pago (quando implementado, origem será 'ads' ou similar)
  if (origem === 'ads' || origem === 'trafego_pago') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-red-500/10 text-red-700 border-red-300 dark:text-red-300",
          className
        )}
      >
        <Megaphone className="h-3 w-3 mr-1" />
        {compact ? 'Ads' : 'Via Tráfego Pago'}
      </Badge>
    );
  }

  // 6. Criado manualmente
  if (criadoManualmente) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-300",
          className
        )}
      >
        <User className="h-3 w-3 mr-1" />
        {compact ? 'Manual' : 'Criado Manualmente'}
      </Badge>
    );
  }

  // 7. Origem padrão (site/checkout direto)
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "bg-muted text-muted-foreground border-muted-foreground/30",
        className
      )}
    >
      <Globe className="h-3 w-3 mr-1" />
      {compact ? 'Site' : 'Via Site'}
    </Badge>
  );
}
