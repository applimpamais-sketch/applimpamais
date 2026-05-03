import { useTenantContext } from '@/hooks/useTenantContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SaasModulo {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  preco_base: number;
  categoria: string;
  icone: string | null;
  ativo: boolean;
}

interface TenantModulo {
  id: string;
  modulo_id: string;
  status: string;
  preco_negociado: number | null;
  saas_modulos: SaasModulo;
}

export default function ClienteModulos() {
  const { tenantId } = useTenantContext();

  // Buscar módulos do catálogo
  const { data: catalogoModulos, isLoading: loadingCatalogo } = useQuery({
    queryKey: ['catalogo-modulos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saas_modulos')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true });

      if (error) throw error;
      return data as SaasModulo[];
    },
  });

  // Buscar módulos ativos do tenant
  const { data: tenantModulos, isLoading: loadingTenant } = useQuery({
    queryKey: ['tenant-modulos', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('tenant_modulos')
        .select('*, saas_modulos(*)')
        .eq('tenant_id', tenantId);

      if (error) throw error;
      return data as TenantModulo[];
    },
    enabled: !!tenantId,
  });

  const isLoading = loadingCatalogo || loadingTenant;

  // Agrupar módulos por categoria
  const modulosPorCategoria = catalogoModulos?.reduce((acc, modulo) => {
    const categoria = modulo.categoria || 'Outros';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(modulo);
    return acc;
  }, {} as Record<string, SaasModulo[]>) || {};

  // Verificar se módulo está ativo para o tenant
  const isModuloAtivo = (moduloId: string) => {
    return tenantModulos?.some(tm => tm.modulo_id === moduloId && tm.status === 'ativo');
  };

  const modulosAtivos = tenantModulos?.filter(tm => tm.status === 'ativo').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Módulos</h1>
        <p className="text-muted-foreground">
          Gerencie os módulos disponíveis para sua empresa
        </p>
      </div>

      {/* Resumo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{modulosAtivos}</p>
                <p className="text-muted-foreground">módulos ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lista de módulos por categoria */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        Object.entries(modulosPorCategoria).map(([categoria, modulos], catIndex) => (
          <motion.div
            key={categoria}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {categoria}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {modulos.map((modulo, index) => {
                const ativo = isModuloAtivo(modulo.id);
                
                return (
                  <motion.div
                    key={modulo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={ativo ? 'border-primary/50 bg-primary/5' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-base">{modulo.nome}</CardTitle>
                          </div>
                          {ativo ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {modulo.descricao || 'Sem descrição'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold">
                            R$ {modulo.preco_base.toFixed(2)}
                            <span className="text-sm font-normal text-muted-foreground">/mês</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))
      )}

      {/* Estado vazio */}
      {!isLoading && Object.keys(modulosPorCategoria).length === 0 && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Nenhum módulo disponível</h3>
          <p className="text-muted-foreground">
            Entre em contato com o suporte para conhecer os módulos disponíveis
          </p>
        </Card>
      )}
    </div>
  );
}
