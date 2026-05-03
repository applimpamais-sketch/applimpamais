import { CheckCircle, Copy, Mail, Key, User, Shield, Link as LinkIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface InviteSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberData: {
    nome: string;
    email: string;
    role: 'admin' | 'operador' | 'visualizador' | 'tecnico';
    password?: string; // Now optional - if not provided, magic link was used
  };
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  operador: 'Operador',
  visualizador: 'Visualizador',
  tecnico: 'Técnico',
};

export default function InviteSuccessModal({
  open,
  onOpenChange,
  memberData,
}: InviteSuccessModalProps) {
  const hasMagicLink = !memberData.password;
  
  const copyPassword = () => {
    if (memberData.password) {
      navigator.clipboard.writeText(memberData.password);
      toast.success('Senha copiada para a área de transferência!');
    }
  };

  const copyCredentials = () => {
    if (memberData.password) {
      const credentials = `Email: ${memberData.email}\nSenha: ${memberData.password}`;
      navigator.clipboard.writeText(credentials);
      toast.success('Credenciais copiadas para a área de transferência!');
    } else {
      navigator.clipboard.writeText(memberData.email);
      toast.success('Email copiado para a área de transferência!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle>Convite Enviado com Sucesso!</DialogTitle>
              <DialogDescription>
                O membro foi adicionado à equipe
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do membro */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{memberData.nome}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{memberData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Permissão</p>
                <p className="font-medium">{roleLabels[memberData.role] || memberData.role}</p>
              </div>
            </div>
          </div>

          {/* Senha temporária (se disponível) ou info de magic link */}
          {hasMagicLink ? (
            <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
              <div className="flex items-start gap-3">
                <LinkIcon className="h-4 w-4 text-primary mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary mb-1">
                    Link de Acesso Enviado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    O membro receberá um link seguro para criar sua conta e definir sua senha.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
              <div className="flex items-start gap-3">
                <Key className="h-4 w-4 text-primary mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary mb-1">
                    Senha Temporária
                  </p>
                  <code className="block bg-background px-3 py-2 rounded border text-sm font-mono break-all">
                    {memberData.password}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyPassword}
                    className="mt-2 h-8 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar Senha
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Confirmação de email */}
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Email de convite enviado
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Um email foi enviado para <strong>{memberData.email}</strong> com
                  as instruções de acesso{hasMagicLink ? ' e link seguro' : ' e credenciais'}.
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={copyCredentials}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              {hasMagicLink ? 'Copiar Email' : 'Copiar Credenciais'}
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Fechar
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {hasMagicLink 
              ? '💡 O membro deverá clicar no link do email para acessar e definir sua senha'
              : '💡 O novo membro deverá alterar a senha no primeiro acesso'
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
