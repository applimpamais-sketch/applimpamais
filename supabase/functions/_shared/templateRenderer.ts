/**
 * Template Renderer - Centraliza busca e renderização de templates do banco
 * Usado por todas as edge functions que enviam mensagens WhatsApp
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

interface Template {
  id: string;
  nome: string;
  titulo: string;
  categoria: string;
  conteudo: string;
  variaveis: string[];
  ativo: boolean;
  uso_count: number;
}

interface RenderResult {
  success: boolean;
  mensagem: string | null;
  titulo: string | null;
  templateId: string | null;
  error?: string;
}

/**
 * Busca um template ativo pelo nome
 */
export async function getTemplate(
  supabase: SupabaseClient,
  templateNome: string
): Promise<Template | null> {
  const { data, error } = await supabase
    .from('templates_mensagens')
    .select('*')
    .eq('nome', templateNome)
    .eq('ativo', true)
    .single();

  if (error) {
    console.error(`[templateRenderer] Erro ao buscar template "${templateNome}":`, error);
    return null;
  }

  return data as Template;
}

/**
 * Substitui variáveis no formato {variavel} pelos valores fornecidos
 */
export function substituirVariaveis(
  conteudo: string,
  variaveis: Record<string, string | number | null | undefined>
): string {
  let resultado = conteudo;

  for (const [chave, valor] of Object.entries(variaveis)) {
    const regex = new RegExp(`\\{${chave}\\}`, 'gi');
    resultado = resultado.replace(regex, String(valor ?? ''));
  }

  // Remover variáveis não substituídas (ficam como {variavel})
  resultado = resultado.replace(/\{[a-zA-Z_]+\}/g, '');

  return resultado.trim();
}

/**
 * Busca template e renderiza com variáveis
 */
export async function renderTemplate(
  supabase: SupabaseClient,
  templateNome: string,
  variaveis: Record<string, string | number | null | undefined>
): Promise<RenderResult> {
  try {
    const template = await getTemplate(supabase, templateNome);

    if (!template) {
      console.warn(`[templateRenderer] Template "${templateNome}" não encontrado ou inativo`);
      return {
        success: false,
        mensagem: null,
        titulo: null,
        templateId: null,
        error: `Template "${templateNome}" não encontrado ou inativo`
      };
    }

    const mensagemRenderizada = substituirVariaveis(template.conteudo, variaveis);

    // Incrementar contador de uso (fire and forget)
    supabase
      .from('templates_mensagens')
      .update({ uso_count: template.uso_count + 1 })
      .eq('id', template.id)
      .then(() => {
        console.log(`[templateRenderer] uso_count incrementado para template ${template.id}`);
      })
      .catch((err: Error) => {
        console.warn(`[templateRenderer] Erro ao incrementar uso_count:`, err);
      });

    return {
      success: true,
      mensagem: mensagemRenderizada,
      titulo: template.titulo,
      templateId: template.id
    };
  } catch (error) {
    console.error(`[templateRenderer] Erro ao renderizar template:`, error);
    return {
      success: false,
      mensagem: null,
      titulo: null,
      templateId: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Renderiza template com fallback para mensagem hardcoded
 */
export async function renderTemplateWithFallback(
  supabase: SupabaseClient,
  templateNome: string,
  variaveis: Record<string, string | number | null | undefined>,
  fallbackMensagem: string
): Promise<string> {
  const result = await renderTemplate(supabase, templateNome, variaveis);

  if (result.success && result.mensagem) {
    return result.mensagem;
  }

  console.warn(`[templateRenderer] Usando fallback para template "${templateNome}"`);
  return substituirVariaveis(fallbackMensagem, variaveis);
}

/**
 * Busca todos os templates ativos de uma categoria
 */
export async function getTemplatesByCategory(
  supabase: SupabaseClient,
  categoria: string
): Promise<Template[]> {
  const { data, error } = await supabase
    .from('templates_mensagens')
    .select('*')
    .eq('categoria', categoria)
    .eq('ativo', true)
    .order('nome');

  if (error) {
    console.error(`[templateRenderer] Erro ao buscar templates da categoria "${categoria}":`, error);
    return [];
  }

  return (data as Template[]) || [];
}

/**
 * Formata valor monetário para exibição
 */
export function formatarValor(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

/**
 * Formata data para exibição
 */
export function formatarData(data: string | Date): string {
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formata data com dia da semana
 */
export function formatarDataCompleta(data: string | Date): string {
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Cria cliente Supabase para uso nas edge functions
 */
export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseServiceKey);
}
