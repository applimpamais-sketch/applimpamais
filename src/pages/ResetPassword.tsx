import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, LayoutDashboard } from 'lucide-react';
import { useLoginBranding } from '@/hooks/useLoginBranding';
import { TenantLogo } from '@/components/branding/TenantLogo';
 
 const resetSchema = z.object({
   password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
   confirmPassword: z.string().min(6, 'Confirme sua senha'),
 }).refine((data) => data.password === data.confirmPassword, {
   message: 'As senhas não conferem',
   path: ['confirmPassword'],
 });
 
 type ResetFormValues = z.infer<typeof resetSchema>;
 
export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  
  // Branding dinâmico baseado no domínio
  const { logoUrl, companyName, isMasterBranding } = useLoginBranding();
  
  // Get redirect destination from query params
  const nextPath = searchParams.get('next');
  const redirectTo = nextPath && nextPath.startsWith('/') ? nextPath : '/auth';
   const form = useForm<ResetFormValues>({
     resolver: zodResolver(resetSchema),
     defaultValues: {
       password: '',
       confirmPassword: '',
     },
   });
 
   // Check if user has a valid recovery session
   useEffect(() => {
     const checkSession = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       
       // Check URL for recovery type
       const hash = window.location.hash;
       const isRecoveryFlow = hash.includes('type=recovery') || hash.includes('type=signup');
       
       if (session || isRecoveryFlow) {
         setIsValidSession(true);
       } else {
         setIsValidSession(false);
       }
     };
     
     // Listen for auth state changes (handles the recovery token automatically)
     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
         setIsValidSession(true);
       }
     });
     
     checkSession();
     
     return () => subscription.unsubscribe();
   }, []);
 
   const onSubmit = async (values: ResetFormValues) => {
     setIsLoading(true);
     setError(null);
 
     try {
       const { error } = await supabase.auth.updateUser({
         password: values.password,
       });
 
       if (error) {
         console.error('Reset password error:', error);
         
         if (error.message.includes('session')) {
           setError('Sessão expirada. Por favor, solicite um novo link de recuperação.');
         } else if (error.message.includes('same')) {
           setError('A nova senha não pode ser igual à senha anterior.');
         } else {
           setError(error.message || 'Erro ao atualizar senha');
         }
         setIsLoading(false);
         return;
       }
 
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate(redirectTo);
      }, 3000);
     } catch (err) {
       console.error('Unexpected error:', err);
       setError('Erro inesperado. Tente novamente.');
       setIsLoading(false);
     }
   };
 
   // Loading state while checking session
   if (isValidSession === null) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
         <Card className="w-full max-w-md">
           <CardContent className="flex items-center justify-center py-12">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </CardContent>
         </Card>
       </div>
     );
   }
 
   // Invalid session - show error
   if (!isValidSession) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
         <Card className="w-full max-w-md">
           <CardHeader className="text-center space-y-4">
             <div className="flex justify-center">
               <AlertCircle className="h-16 w-16 text-destructive" />
             </div>
             <CardTitle className="text-2xl">Link inválido ou expirado</CardTitle>
             <CardDescription>
               Este link de recuperação não é válido ou já expirou.
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <Button
               onClick={() => navigate('/auth')}
               className="w-full"
             >
               Voltar para o Login
             </Button>
             <p className="text-center text-sm text-muted-foreground">
               Solicite um novo link na página de login clicando em "Esqueci minha senha"
             </p>
           </CardContent>
         </Card>
       </div>
     );
   }
 
   // Success state
   if (success) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
         <Card className="w-full max-w-md">
           <CardHeader className="text-center space-y-4">
             <div className="flex justify-center">
               <CheckCircle className="h-16 w-16 text-primary" />
             </div>
             <CardTitle className="text-2xl">Senha atualizada!</CardTitle>
             <CardDescription>
               Sua senha foi alterada com sucesso. Você será redirecionado para o login...
             </CardDescription>
           </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate(redirectTo)}
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
         </Card>
       </div>
     );
   }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {isMasterBranding ? (
              <img 
                src="/logo-rc-limpa-mais.png" 
                alt="RC Limpa Mais" 
                className="h-16 w-auto"
              />
            ) : (
              <TenantLogo 
                logoUrl={logoUrl} 
                companyName={companyName} 
                className="h-16 w-auto"
                fallback={<LayoutDashboard className="h-16 w-16 text-primary" />}
              />
            )}
          </div>
          <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
           <CardDescription>Digite sua nova senha abaixo</CardDescription>
         </CardHeader>
         <CardContent>
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                 control={form.control}
                 name="password"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Nova Senha</FormLabel>
                     <FormControl>
                       <Input
                         type="password"
                         placeholder="******"
                         {...field}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
 
               <FormField
                 control={form.control}
                 name="confirmPassword"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Confirmar Senha</FormLabel>
                     <FormControl>
                       <Input
                         type="password"
                         placeholder="******"
                         {...field}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
 
               {error && (
                 <Alert variant="destructive">
                   <AlertDescription>{error}</AlertDescription>
                 </Alert>
               )}
 
               <Button
                 type="submit"
                 className="w-full"
                 disabled={isLoading}
               >
                 {isLoading ? (
                   <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Atualizando...
                   </>
                 ) : (
                   'Atualizar Senha'
                 )}
               </Button>
             </form>
           </Form>
 
           <div className="mt-4 text-center">
             <Button
               variant="link"
               onClick={() => navigate('/auth')}
               className="text-sm"
             >
               Voltar para o Login
             </Button>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 }