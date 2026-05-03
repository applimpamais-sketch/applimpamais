import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLimitValidation } from './useLimitValidation';

interface InviteMemberData {
  email: string;
  nome_completo: string;
  role: 'admin' | 'operador' | 'visualizador';
}

interface InviteMemberResult {
  user: any;
  password: string;
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  const { validateLimit } = useLimitValidation();

  return useMutation({
    mutationFn: async (data: InviteMemberData): Promise<InviteMemberResult> => {
      // Validar limite de membros antes de convidar
      const validation = validateLimit('membros_dashboard');
      
      if (!validation.canProceed) {
        validation.showError();
        throw new Error('Limite de membros atingido');
      }

      validation.showWarning();

      console.log('1. Criando membro via Edge Function com Magic Link...');
      
      // 🔒 SECURITY: Não gerar senha, usar Magic Link
      const { data: createData, error: createError } = await supabase.functions.invoke(
        'create-team-member',
        {
          body: {
            email: data.email,
            nome_completo: data.nome_completo,
            role: data.role,
          },
        }
      );

      if (createError) {
        console.error('Erro ao criar membro:', createError);
        throw new Error(createError.message || 'Erro ao criar membro');
      }

      if (!createData?.success) {
        throw new Error(createData?.error || 'Falha ao criar membro');
      }

      console.log('2. Membro criado com sucesso. ID:', createData.userId);
      console.log('3. Enviando email com Magic Link...');

      // 3. Enviar email com Magic Link
      const { error: emailError } = await supabase.functions.invoke(
        'send-team-invite',
        {
          body: {
            name: data.nome_completo,
            email: data.email,
            magicLink: createData.magicLink,
            role: data.role,
          },
        }
      );

      if (emailError) {
        console.error('Erro ao enviar email:', emailError);
        toast.warning('Membro criado, mas email não foi enviado');
      } else {
        console.log('4. Email com Magic Link enviado com sucesso!');
      }

      return { 
        user: { id: createData.userId },
        password: '(Magic Link enviado por email)' // Apenas para compatibilidade
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-usage'] });
      toast.success('Membro convidado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao convidar membro:', error);
      if (error.message?.includes('Limite')) return;
      if (error.message?.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao convidar membro');
      }
    },
  });
}
