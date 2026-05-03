import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus, LogIn, ArrowLeft, Eye, EyeOff, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/admin/LoadingSpinner';
import { useLoginBranding } from '@/hooks/useLoginBranding';
import { TenantLogo } from '@/components/branding/TenantLogo';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  nome_exibicao: z.string().optional(),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  tipo: z.enum(['afiliado', 'influencer', 'empresa']),
  codigo_referencia: z.string()
    .min(3, 'Código deve ter no mínimo 3 caracteres')
    .max(20, 'Código deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Código só pode conter letras, números, - e _'),
  instagram: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function ParceiroAuth() {
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedInWithoutProfile, setIsLoggedInWithoutProfile] = useState(false);
  
  // Branding dinâmico baseado no domínio
  const { logoUrl, companyName, isMasterBranding } = useLoginBranding();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      nome_exibicao: '',
      email: '',
      telefone: '',
      password: '',
      confirmPassword: '',
      tipo: 'afiliado',
      codigo_referencia: '',
      instagram: '',
    },
  });

  // Verificar sessão existente UMA VEZ ao montar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: parceiro } = await supabase
            .from('parceiros')
            .select('id, status')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (parceiro) {
            navigate('/parceiro/dashboard', { replace: true });
            return;
          } else {
            // Logado mas sem perfil de parceiro
            setActiveTab('register');
            setIsLoggedInWithoutProfile(true);
            registerForm.setValue('email', session.user.email || '');
          }
        }
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate, registerForm]);

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.success('Login realizado com sucesso!');

      // Verificar diretamente no banco
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Erro ao obter usuário');
      }

      const { data: parceiro } = await supabase
        .from('parceiros')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (parceiro) {
        navigate('/parceiro/dashboard', { replace: true });
      } else {
        setActiveTab('register');
        setIsLoggedInWithoutProfile(true);
        registerForm.setValue('email', user.email || '');
        toast.info('Complete seu cadastro como parceiro');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      // Verificar código único
      const { data: existingCode } = await supabase
        .from('parceiros')
        .select('id')
        .eq('codigo_referencia', data.codigo_referencia.toUpperCase())
        .maybeSingle();

      if (existingCode) {
        toast.error('Este código já está em uso. Escolha outro.');
        return;
      }

      let userId: string;
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Já logado - usar user existente
        userId = session.user.id;
      } else {
        // Criar nova conta
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { emailRedirectTo: `${window.location.origin}/parceiro/dashboard` },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Erro ao criar usuário');

        userId = authData.user.id;
      }

      // Criar perfil de parceiro
      const { error: parceiroError } = await supabase
        .from('parceiros')
        .insert({
          user_id: userId,
          nome: data.nome,
          nome_exibicao: data.nome_exibicao || null,
          email: data.email,
          telefone: data.telefone,
          tipo: data.tipo,
          codigo_referencia: data.codigo_referencia.toUpperCase(),
          redes_sociais: data.instagram ? { instagram: data.instagram } : {},
          status: 'ativo',
        });

      if (parceiroError) throw parceiroError;

      toast.success('Cadastro realizado com sucesso!');
      navigate('/parceiro/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error(error.message || 'Erro ao fazer cadastro');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSession) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-muted/20 p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao site
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            {isMasterBranding ? (
              <img
                src="/logo-rc-limpa-mais.png"
                alt="RC Limpa Mais"
                className="h-16 mx-auto mb-4"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="flex justify-center mb-4">
                <TenantLogo 
                  logoUrl={logoUrl} 
                  companyName={companyName} 
                  className="h-16"
                  fallback={<Users className="h-16 w-16 text-primary" />}
                />
              </div>
            )}
            <CardTitle className="text-2xl">Área do Parceiro</CardTitle>
            <CardDescription>
              Ganhe comissões indicando nossos serviços
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...loginForm.register('email')}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...loginForm.register('password')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-nome">Nome completo *</Label>
                      <Input
                        id="reg-nome"
                        placeholder="Seu nome"
                        {...registerForm.register('nome')}
                      />
                      {registerForm.formState.errors.nome && (
                        <p className="text-xs text-destructive">{registerForm.formState.errors.nome.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-nome-exibicao">Nome artístico</Label>
                      <Input
                        id="reg-nome-exibicao"
                        placeholder="@seuperfil"
                        {...registerForm.register('nome_exibicao')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email *</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="seu@email.com"
                      disabled={isLoggedInWithoutProfile}
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-telefone">WhatsApp *</Label>
                      <Input
                        id="reg-telefone"
                        placeholder="(31) 99999-9999"
                        {...registerForm.register('telefone')}
                      />
                      {registerForm.formState.errors.telefone && (
                        <p className="text-xs text-destructive">{registerForm.formState.errors.telefone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-tipo">Tipo *</Label>
                      <Select
                        onValueChange={(value) => registerForm.setValue('tipo', value as any)}
                        defaultValue="afiliado"
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="influencer">Influencer</SelectItem>
                          <SelectItem value="empresa">Empresa</SelectItem>
                          <SelectItem value="afiliado">Afiliado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-codigo">Seu código *</Label>
                      <Input
                        id="reg-codigo"
                        placeholder="SEUNOME10"
                        className="uppercase"
                        {...registerForm.register('codigo_referencia')}
                      />
                      {registerForm.formState.errors.codigo_referencia && (
                        <p className="text-xs text-destructive">{registerForm.formState.errors.codigo_referencia.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Este será seu link: /p/SEUNOME10
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-instagram">Instagram</Label>
                      <Input
                        id="reg-instagram"
                        placeholder="@seuperfil"
                        {...registerForm.register('instagram')}
                      />
                    </div>
                  </div>

                  {!isLoggedInWithoutProfile && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Senha *</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="••••••••"
                          {...registerForm.register('password')}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm">Confirmar *</Label>
                        <Input
                          id="reg-confirm"
                          type="password"
                          placeholder="••••••••"
                          {...registerForm.register('confirmPassword')}
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-xs text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isLoggedInWithoutProfile ? 'Completar cadastro' : 'Criar conta de parceiro'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Info */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Como funciona?</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Compartilhe seu link personalizado</li>
                <li>• Ganhe comissão por cada serviço fechado</li>
                <li>• Acompanhe tudo pelo dashboard</li>
                <li>• Saque quando quiser (mínimo R$ 50)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
