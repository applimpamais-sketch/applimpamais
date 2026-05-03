import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wrench, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useLoginBranding } from '@/hooks/useLoginBranding';
import { TenantLogo } from '@/components/branding/TenantLogo';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function TecnicoAuth() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  // Branding dinâmico baseado no domínio
  const { logoUrl, companyName, isMasterBranding } = useLoginBranding();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated as tecnico (but not during login submission)
  useEffect(() => {
    // Não verificar enquanto está submetendo o formulário ou carregando
    if (isSubmitting || isLoading) {
      return;
    }
    
    async function checkAuth() {
      if (user) {
        try {
          // Buscar roles diretamente para evitar race conditions
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
          
          const userRoles = roles?.map(r => r.role) || [];
          const isTecnico = userRoles.includes('tecnico');
          const isAdmin = userRoles.includes('admin');
          const isOperador = userRoles.includes('operador');
          
          if (isTecnico) {
            navigate('/tecnico/servicos', { replace: true });
          } else if (isAdmin || isOperador) {
            navigate('/admin', { replace: true });
          }
        } catch (error) {
          console.error('Erro ao verificar roles:', error);
        }
      }
    }
    checkAuth();
  }, [user, navigate, isSubmitting, isLoading]);

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Digite seu email');
      return;
    }

    setIsSendingReset(true);
    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: { 
          email: forgotEmail,
          redirectTo: `${window.location.origin}/reset-password?next=/tecnico/auth`
        },
      });

      if (error) throw error;

      toast.success('Email enviado!', {
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (err: any) {
      console.error('Erro ao enviar email:', err);
      toast.error('Erro ao enviar email de recuperação');
    } finally {
      setIsSendingReset(false);
    }
  };

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    setIsSubmitting(true);
    setError(null);

    // Sign out first to clear any stale session
    await supabase.auth.signOut();

    const { error: signInError } = await signIn(values.email, values.password);

    if (signInError) {
      // Classificar erros de forma mais clara
      if (signInError.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else if (signInError.message?.includes('Email not confirmed')) {
        setError('Email não confirmado. Verifique sua caixa de entrada.');
      } else if (signInError.message?.includes('User not found')) {
        setError('Usuário não encontrado');
      } else {
        setError('Erro ao entrar. Tente novamente.');
      }
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    // Aguardar mais tempo para garantir que a sessão seja estabelecida
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Buscar usuário diretamente
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      setError('Erro ao carregar dados do usuário');
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    // Verificar role DIRETAMENTE na tabela (mais confiável durante login)
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', currentUser.id);

    if (roleError) {
      console.error('Erro ao buscar roles:', roleError);
      setError('Erro ao verificar permissões. Tente novamente.');
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    const userRoles = (roles?.map(r => r.role) || []) as string[];
    const isTecnico = userRoles.includes('tecnico');
    const isAdmin = userRoles.includes('admin');
    const isOperador = userRoles.includes('operador');

    // Validar acesso
    if (!isTecnico && (isAdmin || isOperador)) {
      setError('Administradores devem usar o portal em /auth');
      setIsLoading(false);
      setIsSubmitting(false);
      setTimeout(() => navigate('/auth'), 2000);
      return;
    }

    if (!isTecnico) {
      setError('Acesso restrito a técnicos. Entre em contato com o administrador.');
      setIsLoading(false);
      setIsSubmitting(false);
      await supabase.auth.signOut();
      return;
    }

    // Verificar primeiro login
    const isFirstLogin = currentUser?.user_metadata?.is_first_login !== false;
    
    if (isFirstLogin) {
      await supabase.auth.updateUser({
        data: { is_first_login: false }
      });
    }

    // Redirecionar com sucesso
    navigate('/tecnico/servicos', { 
      state: { showWelcomeMessage: isFirstLogin } 
    });
  };

  // Forgot password view
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto">
              {isMasterBranding ? (
                <img 
                  src="/logo-rc-limpa-mais.png" 
                  alt="RC Limpa Mais" 
                  className="h-16 mx-auto object-contain mb-2" 
                />
              ) : (
                <TenantLogo 
                  logoUrl={logoUrl} 
                  companyName={companyName} 
                  className="h-16 mx-auto object-contain mb-2"
                  fallback={<Wrench className="h-16 w-16 text-primary" />}
                />
              )}
            </div>
            <div className="flex items-center justify-center gap-2">
              <KeyRound className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
            </div>
            <CardDescription>
              Digite seu email para receber um link de recuperação
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleForgotPassword}
              className="w-full"
              disabled={isSendingReset}
            >
              {isSendingReset ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Link de Recuperação'
              )}
            </Button>

            <Button 
              variant="link" 
              className="w-full"
              onClick={() => setShowForgotPassword(false)}
            >
              Voltar para login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto">
            {isMasterBranding ? (
              <img 
                src="/logo-rc-limpa-mais.png" 
                alt="RC Limpa Mais" 
                className="h-16 mx-auto object-contain mb-2" 
              />
            ) : (
              <TenantLogo 
                logoUrl={logoUrl} 
                companyName={companyName} 
                className="h-16 mx-auto object-contain mb-2"
                fallback={<Wrench className="h-16 w-16 text-primary" />}
              />
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Dashboard Técnico</CardTitle>
          </div>
          <CardDescription>
            {companyName || 'Dashboard'} - Área do Técnico
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="seu@email.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <Button 
                type="button"
                variant="link" 
                className="w-full text-sm"
                onClick={() => {
                  setShowForgotPassword(true);
                  setForgotEmail(form.getValues('email'));
                }}
              >
                Esqueci minha senha / Primeiro acesso
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
