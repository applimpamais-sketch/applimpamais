import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, ChevronDown, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/components/ui/use-toast';
import { AlertTitle } from '@/components/ui/alert';


const authSchema = z.object({
  email: z.string().email('Email invÃ¡lido'),
  password: z.string().min(6, 'Senha deve ter no mÃ­nimo 6 caracteres'),
});

type AuthFormValues = z.infer<typeof authSchema>;
 
 const classifyError = (error: any): { message: string; details: string; showRepair: boolean } => {
   const msg = error?.message?.toLowerCase() || '';
   const status = error?.status;
   const name = error?.name || '';
   
   if (msg.includes('failed to fetch') || msg.includes('networkerror') || name === 'FetchError') {
     return {
       message: 'Falha de conexÃ£o com o servidor. Verifique sua internet ou clique em "Limpar dados locais".',
       details: `Network: ${error?.message || 'Failed to fetch'}`,
       showRepair: true,
     };
   }
   
   if (msg.includes('refresh token') || msg.includes('invalid refresh') || msg.includes('token not found')) {
     return {
       message: 'SessÃ£o local corrompida. Clique em "Limpar dados locais" para resolver.',
       details: `Token: ${error?.message}`,
       showRepair: true,
     };
   }
   
   if (msg.includes('jwt') || msg.includes('token expired') || msg.includes('invalid token')) {
     return {
       message: 'SessÃ£o expirada. Clique em "Limpar dados locais" e tente novamente.',
       details: `JWT: ${error?.message}`,
       showRepair: true,
     };
   }
   
   if (status === 429 || msg.includes('rate limit') || msg.includes('too many')) {
     return {
       message: 'Muitas tentativas. Aguarde alguns segundos e tente novamente.',
       details: `Rate limit: ${error?.message}`,
       showRepair: false,
     };
   }
   
   if (msg.includes('email not confirmed') || msg.includes('confirm')) {
     return {
       message: 'Email nÃ£o confirmado. Verifique sua caixa de entrada.',
       details: `Confirmation: ${error?.message}`,
       showRepair: false,
     };
   }
   
   if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password') || status === 400) {
     return {
       message: 'Email ou senha incorretos',
       details: `Auth: ${error?.message}`,
       showRepair: false,
     };
   }
   
   return {
     message: 'Erro ao fazer login. Tente novamente.',
     details: `Unknown: ${error?.message || 'No details'} | Status: ${status || 'N/A'}`,
     showRepair: true,
   };
 };
 
export default function Auth() {
  const { signIn, user, hasRole, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showRepairButton, setShowRepairButton] = useState(false);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showExpiredLinkHelp, setShowExpiredLinkHelp] = useState(false);
  const [hasUrlError, setHasUrlError] = useState(false);
  const [showForceContinue, setShowForceContinue] = useState(false);

  // Mostrar botÃ£o "Continuar mesmo assim" se sessÃ£o demorar mais de 5s
  useEffect(() => {
    if (!isCheckingSession) {
      setShowForceContinue(false);
      return;
    }
    const t = setTimeout(() => setShowForceContinue(true), 5000);
    return () => clearTimeout(t);
  }, [isCheckingSession]);

  // Detectar tenant pelo hostname para branding dinÃ¢mico
  const { data: tenantBranding, isLoading: isLoadingBranding } = useQuery({
    queryKey: ['login-branding', typeof window !== 'undefined' ? window.location.hostname : ''],
    queryFn: async () => {
      const hostname = window.location.hostname;
      
      // DomÃ­nios principais da plataforma - usar branding padrÃ£o (RC Limpa Mais)
      const mainDomains = [\r\n        'localhost',
        '127.0.0.1'
      ];
      
      const isMainDomain = mainDomains.some(domain => hostname.includes(domain));
      
      if (isMainDomain) {
        return null;
      }
      
      // Tentar buscar tenant por domÃ­nio customizado
      const { data: tenantByDomain } = await supabase
        .from('saas_tenants')
        .select('nome_fantasia, nome_empresa, logo_url')
        .eq('dominio_customizado', hostname)
        .single();
      
      if (tenantByDomain) {
        return tenantByDomain;
      }
      
      // Fallback: sem tenant especÃ­fico, usar branding genÃ©rico
      return null;
    },
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error=access_denied')) {
      const isExpired = hash.includes('otp_expired');
      const errorMsg = isExpired 
        ? 'Link de convite expirado. Solicite um novo link ao administrador ou faÃ§a login com suas credenciais.'
        : 'Erro de autenticaÃ§Ã£o. Tente fazer login manualmente.';
      
      // Mark that we have a URL error to prevent checkAuth from redirecting
      setHasUrlError(true);
      
      // Clear any existing session to avoid conflicts with old sessions
      supabase.auth.signOut().then(() => {
        setError(errorMsg);
        setShowExpiredLinkHelp(isExpired);
        window.history.replaceState(null, '', window.location.pathname);
        setIsCheckingSession(false); // Force display of login form
      });
    }
  }, []);
 
   const form = useForm<AuthFormValues>({
     resolver: zodResolver(authSchema),
     defaultValues: { email: '', password: '' },
   });
 
  useEffect(() => {
    async function checkAuth() {
      // Se hÃ¡ erro de URL (magic link expirado), nÃ£o verificar sessÃ£o
      if (hasUrlError) return;
      
      // Aguardar loading do useAuth finalizar
      if (loading) return;
      
      if (!user) {
        setIsCheckingSession(false);
        return;
      }
      
      try {
        // Polling reduzido: 2 tentativas x 300ms (600ms mÃ¡x)
        let attempts = 0;
        let profileData = null;
        let lastError = null;
        
        while (attempts < 2) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('[Auth] Erro ao buscar profile (tentativa', attempts + 1, '):', profileError);
            lastError = profileError;
            if (profileError.code === 'PGRST116' || profileError.code === '42501') {
              break;
            }
          }
          
          profileData = profile;
          
          if (profile?.tenant_id) {
            console.log('[Auth] Tenant encontrado na tentativa', attempts + 1);
            break;
          }
          
          attempts++;
          if (attempts < 2) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
        
        if (profileData?.tenant_id) {
          console.log('[Auth] Redirecionando para /admin (tenant SaaS)');
          navigate('/admin', { replace: true });
          return;
        }
        
        // Se houve erro persistente buscando profile, redirecionar pra /admin mesmo assim
        if (lastError && !profileData) {
          console.warn('[Auth] Erro persistente buscando profile, redirecionando para /admin como fallback');
          navigate('/admin', { replace: true });
          return;
        }
        
        // NÃ£o Ã© SaaS - verificar roles master
        const isTecnico = await hasRole('tecnico');
        const isAdmin = await hasRole('admin');
        const isOperador = await hasRole('operador');
        
        if (isTecnico && !isAdmin && !isOperador) {
          navigate('/tecnico/servicos', { replace: true });
        } else if (isAdmin || isOperador) {
          navigate('/admin', { replace: true });
        } else {
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error('Erro ao verificar sessÃ£o:', error);
        setIsCheckingSession(false);
      }
    }
    
    checkAuth();
  }, [user, loading, hasRole, navigate, hasUrlError]);
 
   const repairConnection = async () => {
     try {
       try { await supabase.auth.signOut(); } catch { /* ignore */ }
 
       const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID;
       const sbPrefix = projectRef ? `sb-${projectRef}-` : 'sb-';
 
       for (let i = localStorage.length - 1; i >= 0; i--) {
         const key = localStorage.key(i);
         if (!key) continue;
         if (key.startsWith(sbPrefix) || key.includes('auth-token') || key.startsWith('supabase.') || key.includes('live_session')) {
           localStorage.removeItem(key);
         }
       }
 
       if ('caches' in window) {
         try {
           const cacheNames = await caches.keys();
           await Promise.all(cacheNames.map((name) => caches.delete(name)));
         } catch { /* ignore */ }
       }
 
       if ('serviceWorker' in navigator) {
         const regs = await navigator.serviceWorker.getRegistrations();
         await Promise.all(regs.map((r) => r.unregister()));
       }
 
       window.location.reload();
     } catch (e) {
       console.error('repairConnection error:', e);
       window.location.reload();
     }
   };
 
  const handleForgotPassword = async () => {
    const email = form.getValues('email');
    
    if (!email || !email.includes('@')) {
      toast({ variant: 'destructive', title: 'Email invÃ¡lido', description: 'Digite seu email no campo acima.' });
      return;
    }
    
    setIsSendingRecovery(true);
    
    try {
      // Use custom edge function for better email deliverability
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { 
          email: email.trim().toLowerCase(),
          redirectTo: `${window.location.origin}/reset-password`
        }
      });
      
      if (error) {
        console.error('[Auth] Erro ao chamar send-password-reset:', error);
        toast({ variant: 'destructive', title: 'Erro ao enviar email', description: 'Tente novamente mais tarde.' });
      } else if (data?.error) {
        toast({ variant: 'destructive', title: 'Erro', description: data.error });
      } else {
        toast({ 
          title: 'Verifique seu email!', 
          description: 'Se o email estiver cadastrado, vocÃª receberÃ¡ um link de recuperaÃ§Ã£o. Verifique tambÃ©m a pasta de spam.' 
        });
        setShowForgotPassword(false);
      }
    } catch (err) {
      console.error('[Auth] Erro inesperado:', err);
      toast({ variant: 'destructive', title: 'Erro inesperado', description: 'Tente novamente mais tarde.' });
    } finally {
      setIsSendingRecovery(false);
    }
  };
 
  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setShowRepairButton(false);

    try { await supabase.auth.signOut(); } catch { /* ignore */ }

    const { error: signInError } = await signIn(values.email, values.password);

    if (signInError) {
      const classified = classifyError(signInError);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Session exists despite error, proceeding...');
      } else {
        setError(classified.message);
        setErrorDetails(classified.details);
        setShowRepairButton(classified.showRepair);
        setIsLoading(false);
        return;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      setError('Erro ao carregar dados do usuÃ¡rio');
      setIsLoading(false);
      return;
    }
    
    const isFirstLogin = currentUser?.user_metadata?.is_first_login !== false;
    
    if (isFirstLogin) {
      // Marcar como nÃ£o-primeiro-login em background, sem bloquear navegaÃ§Ã£o
      supabase.auth.updateUser({ data: { is_first_login: false } }).catch((e) => {
        console.warn('[Auth.onSubmit] Falha ao atualizar is_first_login (nÃ£o-bloqueante):', e);
      });
      try {
        sessionStorage.setItem('show_welcome_banner', '1');
      } catch { /* ignore */ }
      console.log('[Auth.onSubmit] Primeiro login detectado, prosseguindo com navegaÃ§Ã£o');
    }

    // Verificar se o usuÃ¡rio pertence a um tenant SaaS
    console.log('[Auth.onSubmit] Buscando profile para user:', currentUser.id);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (profileError) {
      console.error('[Auth.onSubmit] Erro ao buscar profile:', profileError);
      navigate('/admin');
      return;
    }

    console.log('[Auth.onSubmit] Profile:', profile);

    // Se tem tenant_id, Ã© um cliente SaaS - redirecionar direto para /admin (layout unificado)
    if (profile?.tenant_id) {
      console.log('[Auth.onSubmit] Cliente SaaS, indo para /admin');
      navigate('/admin');
      return;
    }

    // Se nÃ£o tem tenant_id, verificar roles para acesso master
    const isTecnico = await hasRole('tecnico');
    const isAdmin = await hasRole('admin');
    const isOperador = await hasRole('operador');

    if (isTecnico && !isAdmin && !isOperador) {
      setError('TÃ©cnicos devem usar o portal em /tecnico/auth');
      setIsLoading(false);
      setTimeout(() => navigate('/tecnico/auth'), 2000);
      return;
    }

    if (isAdmin || isOperador) {
      navigate('/admin');
    } else {
      setError('VocÃª nÃ£o tem permissÃ£o para acessar o sistema');
      setIsLoading(false);
    }
  };
 
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-background to-muted p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {showForceContinue && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">EstÃ¡ demorando mais que o esperado...</p>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin', { replace: true })}>
              Continuar mesmo assim
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Branding dinÃ¢mico baseado no tenant detectado
  const logoUrl = tenantBranding?.logo_url;
  const nomeEmpresa = tenantBranding?.nome_fantasia || tenantBranding?.nome_empresa;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
         <CardHeader className="text-center space-y-4">
           <div className="flex justify-center">
             {logoUrl ? (
               <img src={logoUrl} alt={nomeEmpresa || 'Dashboard'} className="h-16 w-auto" />
             ) : (
               <div className="flex items-center gap-2">
                 <LayoutDashboard className="h-12 w-12 text-primary" />
               </div>
             )}
           </div>
           <CardTitle className="text-2xl">Dashboard Admin</CardTitle>
           <CardDescription>
             {nomeEmpresa ? `${nomeEmpresa} - Ãrea Administrativa` : 'Ãrea Administrativa'}
           </CardDescription>

           {showWelcomeBanner && (
             <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4 text-left">
               <p className="text-sm font-medium text-primary mb-2">ðŸŽ‰ Bem-vindo Ã  equipe!</p>
               <p className="text-xs text-muted-foreground mb-3">Por seguranÃ§a, recomendamos que vocÃª altere sua senha apÃ³s o primeiro acesso.</p>
               <Button variant="outline" size="sm" onClick={() => navigate('/change-password')} className="w-full">
                 Alterar Senha Agora
               </Button>
             </div>
           )}
         </CardHeader>
         <CardContent>
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                 control={form.control}
                 name="email"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Email</FormLabel>
                     <FormControl>
                       <Input type="email" placeholder="seu@email.com" {...field} />
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
                       <Input type="password" placeholder="******" {...field} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
 
               {error && (
                 <Alert variant="destructive">
                   <AlertDescription className="space-y-2">
                     <p>{error}</p>
                     {showRepairButton && (
                       <Button type="button" variant="outline" size="sm" onClick={repairConnection} className="w-full">
                         <RefreshCw className="mr-2 h-4 w-4" />
                         Limpar dados locais
                       </Button>
                     )}
                     {import.meta.env.DEV && errorDetails && (
                       <p className="text-xs opacity-70 font-mono">{errorDetails}</p>
                     )}
                    </AlertDescription>
                  </Alert>
                )}

                {showExpiredLinkHelp && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 ml-2">Seu link de acesso expirou</AlertTitle>
                    <AlertDescription className="text-amber-700 ml-6 mt-1">
                      <p className="text-sm">
                        Links sÃ£o vÃ¡lidos por apenas 1 hora. Entre em contato com 
                        o administrador para receber um novo link ou faÃ§a login 
                        com email e senha se jÃ¡ tiver credenciais cadastradas.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Entrando...</>) : 'Entrar'}
               </Button>
             </form>
           </Form>
 
           <div className="mt-3 text-center">
             <Button variant="link" type="button" className="text-sm text-muted-foreground hover:text-primary" onClick={() => setShowForgotPassword(!showForgotPassword)}>
               Esqueci minha senha
             </Button>
           </div>
 
           {showForgotPassword && (
             <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-2">
               <p className="text-xs text-muted-foreground">Digite seu email acima e clique no botÃ£o para receber um link de recuperaÃ§Ã£o.</p>
               <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleForgotPassword} disabled={isSendingRecovery}>
                 {isSendingRecovery ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>) : 'Enviar link de recuperaÃ§Ã£o'}
               </Button>
             </div>
           )}
 
           <Collapsible className="mt-4">
             <CollapsibleTrigger asChild>
               <Button variant="ghost" size="sm" className="w-full text-muted-foreground text-xs">
                 <RefreshCw className="mr-1 h-3 w-3" />
                 Problemas para entrar?
                 <ChevronDown className="ml-1 h-3 w-3" />
               </Button>
             </CollapsibleTrigger>
             <CollapsibleContent className="mt-2 space-y-2">
               <p className="text-xs text-muted-foreground text-center">Se o login nÃ£o funciona mesmo com dados corretos, limpe os dados locais do app.</p>
               <Button type="button" variant="outline" size="sm" onClick={repairConnection} className="w-full">
                 <RefreshCw className="mr-2 h-4 w-4" />
                 Limpar dados locais / Atualizar app
               </Button>
             </CollapsibleContent>
           </Collapsible>
 
           <div className="mt-4 text-center text-sm text-muted-foreground">
             <p>
               TÃ©cnico?{' '}
               <a href="/tecnico/auth" className="text-primary hover:underline">Acessar Ã¡rea do tÃ©cnico</a>
             </p>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }

