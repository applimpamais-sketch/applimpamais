import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { saveParceiroRef } from '@/utils/parceiroRef';
import { Loader2 } from 'lucide-react';
import Index from '@/pages/Index';

export default function LinkRedirect() {
  const { codigo } = useParams<{ codigo: string }>();
  const [processado, setProcessado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processarCodigo() {
      if (!codigo || processado) return;

      const codigoUpper = codigo.toUpperCase();

      try {
        // 1. Registrar clique via edge function (fire and forget)
        supabase.functions.invoke('track-parceiro-click', {
          body: { codigo: codigoUpper },
        }).catch(err => {
          console.warn('Erro ao registrar clique:', err);
        });

        // 2. Buscar link específico para obter cupom vinculado
        const { data: link } = await supabase
          .from('parceiro_links')
          .select('url_destino, cupom_vinculado, status')
          .eq('codigo', codigoUpper)
          .maybeSingle();

        // Se link específico existe e está ativo
        if (link && link.status === 'ativo') {
          saveParceiroRef(codigoUpper, link.cupom_vinculado || undefined);
          console.log(`[LinkRedirect] Referência salva: ${codigoUpper}, cupom: ${link.cupom_vinculado}`);
          setProcessado(true);
          return;
        }

        // 3. Se não encontrou link específico, tentar buscar parceiro pelo código
        const { data: parceiro } = await supabase
          .from('parceiros')
          .select('id, status, codigo_referencia')
          .eq('codigo_referencia', codigoUpper)
          .maybeSingle();

        if (parceiro && parceiro.status === 'ativo') {
          saveParceiroRef(codigoUpper);
          console.log(`[LinkRedirect] Referência de parceiro salva: ${codigoUpper}`);
          setProcessado(true);
          return;
        }

        // 4. Também verificar se o código é um código de link (ex: MARIA10-SOFA)
        const codigoParts = codigoUpper.split('-');
        if (codigoParts.length > 1) {
          const codigoParceiro = codigoParts[0];
          const { data: parceiroByCode } = await supabase
            .from('parceiros')
            .select('id, status')
            .eq('codigo_referencia', codigoParceiro)
            .maybeSingle();

          if (parceiroByCode && parceiroByCode.status === 'ativo') {
            saveParceiroRef(codigoUpper);
            console.log(`[LinkRedirect] Referência de link salva: ${codigoUpper}`);
            setProcessado(true);
            return;
          }
        }

        // 5. Código inválido ou parceiro inativo
        console.warn(`Link de parceiro inválido: ${codigoUpper}`);
        setError('Link de parceiro inválido ou expirado');

      } catch (err) {
        console.error('Erro ao processar link de parceiro:', err);
        // Em caso de erro, tentar salvar e continuar mesmo assim
        saveParceiroRef(codigoUpper);
        setProcessado(true);
      }
    }

    processarCodigo();
  }, [codigo, processado]);

  // Erro - mostrar mensagem temporária
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive mb-2">{error}</p>
          <p className="text-sm text-muted-foreground">
            Você será redirecionado para a loja...
          </p>
        </div>
      </div>
    );
  }

  // Carregando - mostrar spinner
  if (!processado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Processado - renderiza a loja diretamente, mantendo a URL /p/:codigo
  return <Index />;
}
