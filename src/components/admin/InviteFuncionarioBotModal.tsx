import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus } from 'lucide-react';
import { useAddFuncionarioBot } from '@/hooks/useAddFuncionarioBot';
import { FuncionarioBot } from '@/hooks/useFuncionariosBot';
import { useUpdateFuncionarioBot } from '@/hooks/useUpdateFuncionarioBot';
import { normalizePhone, formatPhone } from '@/utils/format';
import { toast } from '@/hooks/use-toast';

interface InviteFuncionarioBotModalProps {
  editingFuncionario?: FuncionarioBot | null;
  onClose?: () => void;
}

export default function InviteFuncionarioBotModal({ 
  editingFuncionario,
  onClose 
}: InviteFuncionarioBotModalProps) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(editingFuncionario?.nome || '');
  const [telefone, setTelefone] = useState(editingFuncionario?.telefone_whatsapp || '');
  const [observacoes, setObservacoes] = useState(editingFuncionario?.observacoes || '');
  
  const addFuncionario = useAddFuncionarioBot();
  const updateFuncionario = useUpdateFuncionarioBot();

  const isEditing = !!editingFuncionario;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalizar telefone
    const telefoneNormalizado = normalizePhone(telefone);
    
    // Validar formato
    if (telefoneNormalizado.com9.length < 12) {
      toast({
        title: 'Erro',
        description: 'Telefone inválido. Use formato: (31) 99999-9999',
        variant: 'destructive'
      });
      return;
    }
    
    if (isEditing && editingFuncionario) {
      await updateFuncionario.mutateAsync({
        id: editingFuncionario.id,
        nome,
        telefone_whatsapp: telefoneNormalizado.com9,
        observacoes: observacoes || undefined,
      });
    } else {
      await addFuncionario.mutateAsync({
        nome,
        telefone_whatsapp: telefoneNormalizado.com9,
        observacoes: observacoes || undefined,
      });
    }
    
    setNome('');
    setTelefone('');
    setObservacoes('');
    setOpen(false);
    onClose?.();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setNome(editingFuncionario?.nome || '');
      setTelefone(editingFuncionario?.telefone_whatsapp || '');
      setObservacoes(editingFuncionario?.observacoes || '');
      onClose?.();
    }
    setOpen(newOpen);
  };

  // Se estiver editando, controlar o open externamente
  const dialogOpen = isEditing ? !!editingFuncionario : open;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Funcionário Bot
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Funcionário Bot' : 'Adicionar Funcionário Bot'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os dados do funcionário que recebe notificações via WhatsApp.'
              : 'Adicione um funcionário que receberá notificações via WhatsApp (sem acesso ao dashboard).'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="João da Silva"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">WhatsApp *</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(31) 99999-9999"
                required
                type="tel"
              />
              {telefone && telefone.length > 8 && (
                <p className="text-xs text-muted-foreground">
                  Será salvo como: {formatPhone(normalizePhone(telefone).com9)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais sobre o funcionário..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={addFuncionario.isPending || updateFuncionario.isPending}
            >
              {isEditing ? 'Salvar Alterações' : 'Adicionar Funcionário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
