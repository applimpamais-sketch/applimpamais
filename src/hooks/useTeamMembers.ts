import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TeamMember {
  id: string;
  nome_completo: string;
  email: string;
  telefone_whatsapp?: string;
  role: 'admin' | 'operador' | 'visualizador';
  created_at: string;
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nome_completo, email, telefone_whatsapp, created_at');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const members: TeamMember[] = profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: (userRole?.role as 'admin' | 'operador' | 'visualizador') || 'visualizador',
        };
      });

      return members.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('Removendo membro via Edge Function:', userId);
      
      const { data, error } = await supabase.functions.invoke('delete-team-member', {
        body: { userId },
      });

      if (error) {
        console.error('Erro ao remover membro:', error);
        throw new Error(error.message || 'Erro ao remover membro');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Falha ao remover membro');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      toast.success('Membro removido completamente do sistema');
    },
    onError: (error: any) => {
      console.error('Erro ao remover membro:', error);
      toast.error(error.message || 'Erro ao remover membro');
    },
  });
}
