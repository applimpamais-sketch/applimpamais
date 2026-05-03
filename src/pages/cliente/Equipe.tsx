import { useTenantContext } from '@/hooks/useTenantContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Shield, UserCheck, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface ProfileMembro {
  id: string;
  nome_completo: string | null;
  email: string | null;
  telefone: string | null;
  avatar_url: string | null;
  tenant_id: string | null;
  created_at: string | null;
  role: string;
}


const roleConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  admin: { label: 'Administrador', variant: 'default' },
  operador: { label: 'Operador', variant: 'secondary' },
  tecnico: { label: 'Técnico', variant: 'outline' },
};

export default function ClienteEquipe() {
  const { tenantId, tenant } = useTenantContext();

  // Buscar membros da equipe (profiles com mesmo tenant_id)
  const { data: membros, isLoading } = useQuery({
    queryKey: ['equipe-tenant', tenantId],
    queryFn: async (): Promise<ProfileMembro[]> => {
      if (!tenantId) return [];
      
      // Buscar profiles do tenant com campos específicos
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome_completo, email, telefone, avatar_url, tenant_id, created_at')
        .eq('tenant_id', tenantId);

      if (profilesError) throw profilesError;

      // Buscar roles dos usuários
      const userIds = profiles?.map(p => p.id) || [];
      
      if (userIds.length === 0) return [];

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Combinar dados
      return profiles?.map(profile => ({
        id: profile.id,
        nome_completo: profile.nome_completo,
        email: profile.email,
        telefone: profile.telefone,
        avatar_url: profile.avatar_url,
        tenant_id: profile.tenant_id,
        created_at: profile.created_at,
        role: roles?.find(r => r.user_id === profile.id)?.role || 'membro',
      })) || [];
    },
    enabled: !!tenantId,
  });

  const getInitials = (nome_completo: string | null, email: string | null) => {
    if (nome_completo) {
      return nome_completo.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return '??';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Equipe</h1>
        <p className="text-muted-foreground">
          Gerencie os membros da sua equipe
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
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{membros?.length || 0}</p>
                <p className="text-muted-foreground">membros na equipe</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Responsável */}
      {tenant?.responsavel_nome && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Responsável pela Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(tenant.responsavel_nome, tenant.responsavel_email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-lg">{tenant.responsavel_nome}</p>
                  {tenant.responsavel_email && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {tenant.responsavel_email}
                    </p>
                  )}
                </div>
                <Badge variant="default">
                  <Shield className="h-3 w-3 mr-1" />
                  Proprietário
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lista de membros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Membros
            </CardTitle>
            <CardDescription>
              Todos os usuários com acesso ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : membros && membros.length > 0 ? (
              <div className="space-y-3">
                {membros.map((membro, index) => {
                  const role = roleConfig[membro.role] || { label: 'Membro', variant: 'outline' as const };
                  
                  return (
                    <motion.div
                      key={membro.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={membro.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(membro.nome_completo, membro.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {membro.nome_completo || membro.email?.split('@')[0] || 'Usuário'}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {membro.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {membro.email}
                              </span>
                            )}
                            {membro.telefone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {membro.telefone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant={role.variant}>
                        {role.label}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhum membro encontrado</h3>
                <p className="text-muted-foreground">
                  Os membros da equipe aparecerão aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
