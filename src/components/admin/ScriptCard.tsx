import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, TrendingUp, Edit2, Save, X, Mic, Camera, Video, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ScriptAtendimento } from '@/hooks/useScriptsAtendimento';

interface ScriptCardProps {
  script: ScriptAtendimento;
  onCopy: (id: string) => void;
  onConversao: (id: string) => void;
  onUpdate: (id: string, conteudo: string) => void;
  isWinner?: boolean;
}

const variantColors: Record<string, string> = {
  A: 'bg-blue-500/10 text-blue-700 border-blue-200',
  B: 'bg-amber-500/10 text-amber-700 border-amber-200',
  C: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
};

function parseScriptContent(conteudo: string) {
  const separator = '---';
  const parts = conteudo.split(separator);
  
  if (parts.length < 2) return { mensagem: conteudo.trim(), midia: null, instrucaoInterna: null };

  const mensagem = parts[0].trim();
  let midia: string | null = null;
  let instrucaoInterna: string | null = null;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    if (part.startsWith('📎 MÍDIA RECOMENDADA:')) {
      midia = part;
    } else if (part.includes('INSTRUÇÃO INTERNA:')) {
      instrucaoInterna = part;
    }
  }

  return { mensagem, midia, instrucaoInterna };
}

function MediaBlock({ content }: { content: string }) {
  const lines = content.split('\n').filter(l => l.trim());
  
  return (
    <div className="mt-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 space-y-2">
      <p className="text-xs font-semibold text-primary flex items-center gap-1">
        📎 MÍDIA RECOMENDADA
      </p>
      {lines.slice(1).map((line, i) => {
        const trimmed = line.trim();
        let icon = null;
        let colorClass = '';
        
        if (trimmed.startsWith('🎤')) {
          icon = <Mic className="h-3.5 w-3.5 shrink-0" />;
          colorClass = 'text-rose-600 bg-rose-50 border-rose-200';
        } else if (trimmed.startsWith('📸')) {
          icon = <Camera className="h-3.5 w-3.5 shrink-0" />;
          colorClass = 'text-sky-600 bg-sky-50 border-sky-200';
        } else if (trimmed.startsWith('🎬')) {
          icon = <Video className="h-3.5 w-3.5 shrink-0" />;
          colorClass = 'text-violet-600 bg-violet-50 border-violet-200';
        } else if (trimmed.startsWith('💬')) {
          icon = <MessageCircle className="h-3.5 w-3.5 shrink-0" />;
          colorClass = 'text-emerald-600 bg-emerald-50 border-emerald-200';
        }
        
        if (!icon) return <p key={i} className="text-xs text-muted-foreground pl-2">{trimmed}</p>;
        
        return (
          <div key={i} className={`text-xs rounded-md border p-2 ${colorClass}`}>
            <div className="flex items-start gap-1.5">
              {icon}
              <span className="whitespace-pre-wrap leading-relaxed">{trimmed}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ScriptCard({ script, onCopy, onConversao, onUpdate, isWinner }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(script.conteudo);

  const { mensagem, midia, instrucaoInterna } = useMemo(() => parseScriptContent(script.conteudo), [script.conteudo]);

  const taxaConversao = script.uso_count > 0
    ? ((script.conversoes / script.uso_count) * 100).toFixed(1)
    : '0.0';

  const handleCopy = () => {
    // Copy only the message part (without media instructions)
    navigator.clipboard.writeText(mensagem);
    setCopied(true);
    onCopy(script.id);
    toast.success('Script copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onUpdate(script.id, editContent);
    setEditing(false);
  };

  return (
    <Card className={`relative transition-all ${isWinner ? 'ring-2 ring-green-500/50 shadow-green-100' : ''}`}>
      {isWinner && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> Vencendo
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium truncate">{script.nome}</CardTitle>
          <Badge className={`text-xs shrink-0 ${variantColors[script.variante] || ''}`}>
            {script.variante}
          </Badge>
        </div>
        {script.contexto && (
          <p className="text-xs text-muted-foreground mt-1 italic">{script.contexto}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              rows={10}
              className="text-sm font-mono"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}><Save className="h-3 w-3 mr-1" />Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setEditContent(script.conteudo); }}><X className="h-3 w-3" /></Button>
            </div>
          </div>
        ) : (
          <>
            <div
              className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => setEditing(true)}
            >
              {mensagem}
            </div>
            
            {midia && <MediaBlock content={midia} />}
            
            {instrucaoInterna && (
              <div className="text-xs bg-amber-50 border border-amber-200 rounded-md p-2 text-amber-700">
                💡 {instrucaoInterna}
              </div>
            )}
          </>
        )}

        {script.variaveis && script.variaveis.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {script.variaveis.map(v => (
              <span key={v} className="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5">{`{${v}}`}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span>📋 {script.uso_count} usos</span>
            <span>✅ {script.conversoes} conv.</span>
            <span className="font-semibold text-foreground">{taxaConversao}%</span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onConversao(script.id)}>
              <TrendingUp className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span className="ml-1 hidden sm:inline">Copiar</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
