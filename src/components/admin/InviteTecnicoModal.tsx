import { useState } from 'react';
import { Mail, Link as LinkIcon } from 'lucide-react';
import InviteSuccessModal from './InviteSuccessModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteTecnicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InviteTecnicoModal({ open, onOpenChange }: InviteTecnicoModalProps) {
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [inviteResult, setInviteResult] = useState<{
    nome: string;
    email: string;
    role: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const inviteTecnico = useMutation({
    mutationFn: async (data: {
      email: string;
      nome_completo: string;
      telefone: string;
      endereco: string;
      cidade: string;
    }) => {
      // Criar usuário + role via Edge Function (sem senha - usa magic link)
      const { data: createData, error: createError } = await supabase.functions.invoke(
        'create-team-member',
        {
          body: {
            email: data.email,
            nome_completo: data.nome_completo,
            role: 'tecnico',
          },
        }
      );

      if (createError || !createData?.success) {
        throw new Error(createError?.message || createData?.error || 'Erro ao criar técnico');
      }

      // Atualizar profile com dados adicionais
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          telefone: data.telefone,
          endereco: data.endereco,
          cidade: data.cidade,
        } as any)
        .eq('id', createData.userId);

      if (updateError) {
        console.error('Erro ao atualizar perfil:', updateError);
      }

      // Enviar email de convite com magic link
      await supabase.functions.invoke('send-team-invite', {
        body: {
          name: data.nome_completo,
          email: data.email,
          magicLink: createData.magicLink,
          role: 'tecnico',
        },
      });

      // Enviar boas-vindas via WhatsApp com comandos do bot
      if (data.telefone) {
        await supabase.functions.invoke('send-welcome-bot', {
          body: {
            tipo: 'tecnico',
            nome: data.nome_completo,
            telefone: data.telefone,
          },
        });
      }

      return { userId: createData.userId };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tecnicos'] });
      queryClient.invalidateQueries({ queryKey: ['team-stats'] });
      
      setInviteResult({
        nome: variables.nome_completo,
        email: variables.email,
        role: 'técnico',
      });

      // Reset form
      setEmail('');
      setNome('');
      setTelefone('');
      setEndereco('');
      setCidade('');
      onOpenChange(false);
      
      setSuccessModalOpen(true);
      toast.success('Técnico convidado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao convidar técnico:', error);
      if (error.message?.includes('already registered')) {
        toast.error('Este email já está cadastrado');
      } else {
        toast.error('Erro ao convidar técnico');
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !nome || !telefone) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    inviteTecnico.mutate({
      email,
      nome_completo: nome,
      telefone,
      endereco,
      cidade,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Técnico</DialogTitle>
            <DialogDescription>
              Convide um novo técnico para a equipe com informações de contato e localização.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="João Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joao@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(31) 98765-4321"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, Número, Bairro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                placeholder="Belo Horizonte"
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <LinkIcon className="h-4 w-4 text-primary" />
                <span className="font-medium">Link de acesso por email</span>
              </div>
              <p className="text-xs text-muted-foreground">
                O técnico receberá um link seguro por email para criar sua conta e definir sua senha.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={inviteTecnico.isPending}
                className="flex-1"
              >
                {inviteTecnico.isPending ? 'Convidando...' : 'Convidar Técnico'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {inviteResult && (
        <InviteSuccessModal
          open={successModalOpen}
          onOpenChange={setSuccessModalOpen}
          memberData={{
            nome: inviteResult.nome,
            email: inviteResult.email,
            role: 'tecnico' as any,
          }}
        />
      )}
    </>
  );
}
