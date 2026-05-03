import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Edit, Power, Trash2, Mail } from 'lucide-react';
import { FuncionarioBot } from '@/hooks/useFuncionariosBot';
import { useUpdateFuncionarioBot } from '@/hooks/useUpdateFuncionarioBot';
import { useRemoveFuncionarioBot } from '@/hooks/useRemoveFuncionarioBot';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FuncionarioBotCardProps {
  funcionario: FuncionarioBot;
  onEdit: (funcionario: FuncionarioBot) => void;
}

export default function FuncionarioBotCard({ funcionario, onEdit }: FuncionarioBotCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const updateFuncionario = useUpdateFuncionarioBot();
  const removeFuncionario = useRemoveFuncionarioBot();

  const handleToggleAtivo = async () => {
    await updateFuncionario.mutateAsync({
      id: funcionario.id,
      ativo: !funcionario.ativo,
    });
  };

  const handleDelete = async () => {
    await removeFuncionario.mutateAsync(funcionario.id);
    setShowDeleteDialog(false);
  };

  const handleResendWelcome = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-welcome-bot', {
        body: {
          funcionario_id: funcionario.id,
          nome: funcionario.nome,
          telefone: funcionario.telefone_whatsapp,
        },
      });

      if (error) throw error;

      toast({
        title: 'Enviado!',
        description: 'Mensagem de boas-vindas reenviada com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar mensagem',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{funcionario.nome}</h3>
                  {funcionario.ativo && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      ✓ WhatsApp Autorizado
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{funcionario.telefone_whatsapp}</p>
                {funcionario.observacoes && (
                  <p className="text-xs text-muted-foreground mt-1">{funcionario.observacoes}</p>
                )}
              </div>
            </div>
            <Badge variant={funcionario.ativo ? 'default' : 'secondary'}>
              {funcionario.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendWelcome}
              title="Reenviar mensagem de boas-vindas"
            >
              <Mail className="h-4 w-4 mr-1" />
              Boas-vindas
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(funcionario)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleAtivo}
              disabled={updateFuncionario.isPending}
            >
              <Power className="h-4 w-4 mr-1" />
              {funcionario.ativo ? 'Desativar' : 'Ativar'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remover
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover funcionário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{funcionario.nome}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
