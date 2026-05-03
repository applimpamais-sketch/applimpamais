import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Save, 
  CreditCard, 
  Instagram, 
  Youtube, 
  Facebook
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useParceiro } from '@/hooks/useParceiro';

const perfilSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  nome_exibicao: z.string().optional(),
  telefone: z.string().min(10, 'Telefone inválido'),
  documento: z.string().optional(),
});

const bancoSchema = z.object({
  tipo_chave_pix: z.string().optional(),
  chave_pix: z.string().optional(),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  tipo_conta: z.string().optional(),
});

const redesSchema = z.object({
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  facebook: z.string().optional(),
});

type PerfilFormData = z.infer<typeof perfilSchema>;
type BancoFormData = z.infer<typeof bancoSchema>;
type RedesFormData = z.infer<typeof redesSchema>;

export default function ParceiroPerfil() {
  const { parceiro, updateParceiro, refetch } = useParceiro();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('dados');

  const perfilForm = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: parceiro?.nome || '',
      nome_exibicao: parceiro?.nome_exibicao || '',
      telefone: parceiro?.telefone || '',
      documento: parceiro?.documento || '',
    },
  });

  const bancoForm = useForm<BancoFormData>({
    resolver: zodResolver(bancoSchema),
    defaultValues: {
      tipo_chave_pix: parceiro?.dados_bancarios?.tipo_chave_pix || '',
      chave_pix: parceiro?.dados_bancarios?.chave_pix || '',
      banco: parceiro?.dados_bancarios?.banco || '',
      agencia: parceiro?.dados_bancarios?.agencia || '',
      conta: parceiro?.dados_bancarios?.conta || '',
      tipo_conta: parceiro?.dados_bancarios?.tipo_conta || '',
    },
  });

  const redesForm = useForm<RedesFormData>({
    resolver: zodResolver(redesSchema),
    defaultValues: {
      instagram: parceiro?.redes_sociais?.instagram || '',
      tiktok: parceiro?.redes_sociais?.tiktok || '',
      youtube: parceiro?.redes_sociais?.youtube || '',
      facebook: parceiro?.redes_sociais?.facebook || '',
    },
  });

  // Sincronizar formulários quando parceiro carregar
  useEffect(() => {
    if (parceiro) {
      perfilForm.reset({
        nome: parceiro.nome || '',
        nome_exibicao: parceiro.nome_exibicao || '',
        telefone: parceiro.telefone || '',
        documento: parceiro.documento || '',
      });
      
      bancoForm.reset({
        tipo_chave_pix: parceiro.dados_bancarios?.tipo_chave_pix || '',
        chave_pix: parceiro.dados_bancarios?.chave_pix || '',
        banco: parceiro.dados_bancarios?.banco || '',
        agencia: parceiro.dados_bancarios?.agencia || '',
        conta: parceiro.dados_bancarios?.conta || '',
        tipo_conta: parceiro.dados_bancarios?.tipo_conta || '',
      });
      
      redesForm.reset({
        instagram: parceiro.redes_sociais?.instagram || '',
        tiktok: parceiro.redes_sociais?.tiktok || '',
        youtube: parceiro.redes_sociais?.youtube || '',
        facebook: parceiro.redes_sociais?.facebook || '',
      });
    }
  }, [parceiro]);

  const handleSavePerfil = async (data: PerfilFormData) => {
    setSaving(true);
    const { error } = await updateParceiro(data);
    if (error) {
      toast.error('Erro ao salvar dados');
    } else {
      toast.success('Dados salvos com sucesso!');
      await refetch();
    }
    setSaving(false);
  };

  const handleSaveBanco = async (data: BancoFormData) => {
    setSaving(true);
    const { error } = await updateParceiro({
      dados_bancarios: data,
    } as any);
    if (error) {
      toast.error('Erro ao salvar dados bancários');
    } else {
      toast.success('Dados bancários salvos!');
      await refetch();
    }
    setSaving(false);
  };

  const handleSaveRedes = async (data: RedesFormData) => {
    setSaving(true);
    const { error } = await updateParceiro({
      redes_sociais: data,
    } as any);
    if (error) {
      toast.error('Erro ao salvar redes sociais');
    } else {
      toast.success('Redes sociais salvas!');
      await refetch();
    }
    setSaving(false);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie seus dados pessoais e bancários
        </p>
      </div>

      {/* Profile Summary */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">{parceiro?.nome_exibicao || parceiro?.nome}</h2>
              <p className="text-sm text-muted-foreground">{parceiro?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {parceiro?.codigo_referencia}
                </span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full capitalize">
                  {parceiro?.tipo}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto flex-nowrap justify-start">
          <TabsTrigger value="dados" className="min-w-fit text-xs sm:text-sm">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="banco" className="min-w-fit text-xs sm:text-sm">Dados Bancários</TabsTrigger>
          <TabsTrigger value="redes" className="min-w-fit text-xs sm:text-sm">Redes Sociais</TabsTrigger>
        </TabsList>

        {/* Dados Pessoais */}
        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informações básicas do seu perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={perfilForm.handleSubmit(handleSavePerfil)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input
                      id="nome"
                      {...perfilForm.register('nome')}
                    />
                    {perfilForm.formState.errors.nome && (
                      <p className="text-xs text-destructive">
                        {perfilForm.formState.errors.nome.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome_exibicao">Nome artístico / Exibição</Label>
                    <Input
                      id="nome_exibicao"
                      placeholder="@seuperfil"
                      {...perfilForm.register('nome_exibicao')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">WhatsApp *</Label>
                    <Input
                      id="telefone"
                      {...perfilForm.register('telefone')}
                    />
                    {perfilForm.formState.errors.telefone && (
                      <p className="text-xs text-destructive">
                        {perfilForm.formState.errors.telefone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documento">CPF/CNPJ</Label>
                    <Input
                      id="documento"
                      placeholder="000.000.000-00"
                      {...perfilForm.register('documento')}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dados Bancários */}
        <TabsContent value="banco">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Dados Bancários
              </CardTitle>
              <CardDescription>
                Configure seus dados para receber saques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={bancoForm.handleSubmit(handleSaveBanco)} className="space-y-6">
                {/* PIX */}
                <div className="space-y-4">
                  <h4 className="font-medium">Chave PIX</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo da chave</Label>
                      <Select
                        value={bancoForm.watch('tipo_chave_pix')}
                        onValueChange={(value) => bancoForm.setValue('tipo_chave_pix', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="telefone">Telefone</SelectItem>
                          <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Chave PIX</Label>
                      <Input
                        placeholder="Sua chave PIX"
                        {...bancoForm.register('chave_pix')}
                      />
                    </div>
                  </div>
                </div>

                {/* Conta Bancária */}
                <div className="space-y-4">
                  <h4 className="font-medium">Conta Bancária (opcional)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Banco</Label>
                      <Input
                        placeholder="Ex: Nubank, Itaú"
                        {...bancoForm.register('banco')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo de conta</Label>
                      <Select
                        value={bancoForm.watch('tipo_conta')}
                        onValueChange={(value) => bancoForm.setValue('tipo_conta', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corrente">Conta Corrente</SelectItem>
                          <SelectItem value="poupanca">Poupança</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Agência</Label>
                      <Input
                        placeholder="0000"
                        {...bancoForm.register('agencia')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Conta</Label>
                      <Input
                        placeholder="00000-0"
                        {...bancoForm.register('conta')}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Redes Sociais */}
        <TabsContent value="redes">
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
              <CardDescription>
                Informe seus perfis nas redes sociais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={redesForm.handleSubmit(handleSaveRedes)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Label>
                    <Input
                      placeholder="@seuperfil"
                      {...redesForm.register('instagram')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      TikTok
                    </Label>
                    <Input
                      placeholder="@seuperfil"
                      {...redesForm.register('tiktok')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Youtube className="h-4 w-4" />
                      YouTube
                    </Label>
                    <Input
                      placeholder="Link do canal"
                      {...redesForm.register('youtube')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Label>
                    <Input
                      placeholder="Link da página"
                      {...redesForm.register('facebook')}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
