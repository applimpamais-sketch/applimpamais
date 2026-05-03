import { useState } from 'react';
import { UserPlus, Mail } from 'lucide-react';
import InviteSuccessModal from './InviteSuccessModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInviteMember } from '@/hooks/useInviteMember';

export default function InviteMemberModal() {
  const [open, setOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState<'admin' | 'operador' | 'visualizador'>('visualizador');
  const [inviteResult, setInviteResult] = useState<{
    nome: string;
    email: string;
    role: 'admin' | 'operador' | 'visualizador';
  } | null>(null);

  const inviteMember = useInviteMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !nome) {
      return;
    }

    try {
      const result = await inviteMember.mutateAsync({
        email,
        nome_completo: nome,
        role,
      });

      // Armazenar resultado para mostrar no modal de sucesso (sem password, usa magic link)
      setInviteResult({
        nome,
        email,
        role,
      });

      // Reset form
      setEmail('');
      setNome('');
      setRole('visualizador');
      setOpen(false);
      
      // Mostrar modal de sucesso
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Erro ao convidar membro:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar Membro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Novo Membro</DialogTitle>
          <DialogDescription>
            Adicione um novo membro à equipe e defina suas permissões.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="João Silva"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@exemplo.com"
              required
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-medium">Link de acesso por email</span>
            </div>
            <p className="text-xs text-muted-foreground">
              O membro receberá um link seguro por email para criar sua conta e definir sua senha.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Permissão</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visualizador">
                  <div>
                    <p className="font-medium">Visualizador</p>
                    <p className="text-xs text-muted-foreground">
                      Apenas visualizar dados
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="operador">
                  <div>
                    <p className="font-medium">Operador</p>
                    <p className="text-xs text-muted-foreground">
                      Gerenciar agendamentos e cupons
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div>
                    <p className="font-medium">Administrador</p>
                    <p className="text-xs text-muted-foreground">
                      Acesso total ao sistema
                    </p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={inviteMember.isPending}>
              {inviteMember.isPending ? 'Convidando...' : 'Convidar'}
            </Button>
          </div>
        </form>
      </DialogContent>

      {inviteResult && (
        <InviteSuccessModal
          open={successModalOpen}
          onOpenChange={setSuccessModalOpen}
          memberData={inviteResult}
        />
      )}
    </Dialog>
  );
}
