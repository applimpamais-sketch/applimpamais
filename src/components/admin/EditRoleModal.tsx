import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TeamMember } from '@/hooks/useTeamMembers';
import { useUpdateRole } from '@/hooks/useUpdateRole';
import { useProfile } from '@/hooks/useProfile';
import { Smartphone } from 'lucide-react';

interface EditRoleModalProps {
  member: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditRoleModal({ member, open, onOpenChange }: EditRoleModalProps) {
  const [role, setRole] = useState<'admin' | 'operador' | 'visualizador'>('visualizador');
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState('');
  const updateRole = useUpdateRole();
  const { updateProfileById, isUpdating } = useProfile();

  useEffect(() => {
    if (member) {
      setRole(member.role);
      setTelefoneWhatsapp(member.telefone_whatsapp || '');
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    // Atualizar role
    await updateRole.mutateAsync({
      userId: member.id,
      newRole: role,
    });

    // Atualizar telefone WhatsApp se foi modificado
    if (telefoneWhatsapp !== member.telefone_whatsapp) {
      await updateProfileById({ 
        userId: member.id,
        updates: { telefone_whatsapp: telefoneWhatsapp || null }
      });
    }

    onOpenChange(false);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Permissão</DialogTitle>
          <DialogDescription>
            Altere o nível de acesso de {member.nome_completo}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="telefone" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Telefone WhatsApp
            </Label>
            <Input
              id="telefone"
              type="text"
              placeholder="+5531999999999"
              value={telefoneWhatsapp}
              onChange={(e) => setTelefoneWhatsapp(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Formato aceito: +5531999999999 ou 5531999999999
            </p>
            <p className="text-xs text-muted-foreground">
              Este número será autorizado a registrar despesas via WhatsApp Bot Financeiro
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateRole.isPending || isUpdating}>
              {(updateRole.isPending || isUpdating) ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
