import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenants } from '@/hooks/useTenants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, User, Mail, Phone, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ModuloSelector } from '@/components/super-admin/ModuloSelector';

interface ModuloSelecionado {
  modulo_id: string;
  codigo: string;
  preco_negociado: number | null;
}

export default function NovoTenant() {
  const navigate = useNavigate();
  const { createTenant } = useTenants();

  const [formData, setFormData] = useState({
    nome_empresa: '',
    nome_fantasia: '',
    cnpj: '',
    email_contato: '',
    telefone: '',
    responsavel_nome: '',
    responsavel_email: '',
  });

  const [modulosSelecionados, setModulosSelecionados] = useState<ModuloSelecionado[]>([]);
  const [step, setStep] = useState(1);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const valorMensal = modulosSelecionados.reduce((sum, modulo) => {
    return sum + (modulo.preco_negociado ?? 0);
  }, 0);

  const validateStep1 = () => {
    if (!formData.nome_empresa) {
      toast.error('Nome da empresa é obrigatório');
      return false;
    }
    if (!formData.email_contato) {
      toast.error('Email de contato é obrigatório');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.responsavel_nome) {
      toast.error('Nome do responsável é obrigatório');
      return false;
    }
    if (!formData.responsavel_email) {
      toast.error('Email do responsável é obrigatório');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (modulosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um módulo');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    try {
      await createTenant.mutateAsync({
        nome_empresa: formData.nome_empresa,
        nome_fantasia: formData.nome_fantasia || undefined,
        cnpj: formData.cnpj || undefined,
        email_contato: formData.email_contato,
        telefone: formData.telefone || undefined,
        responsavel_nome: formData.responsavel_nome,
        responsavel_email: formData.responsavel_email,
        plano: 'starter',
        valor_mensal: valorMensal,
        modulos: modulosSelecionados,
      });

      navigate('/super-admin/tenants');
    } catch {
      // Erro já tratado no hook
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Cliente</h1>
          <p className="text-muted-foreground">Adicione uma nova empresa à plataforma</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>Informações básicas da empresa cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome_empresa">Razão Social *</Label>
                <Input
                  id="nome_empresa"
                  value={formData.nome_empresa}
                  onChange={(e) => handleChange('nome_empresa', e.target.value)}
                  placeholder="Nome oficial da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  value={formData.nome_fantasia}
                  onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                  placeholder="Nome comercial"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email_contato">Email de Contato *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email_contato"
                  type="email"
                  value={formData.email_contato}
                  onChange={(e) => handleChange('email_contato', e.target.value)}
                  placeholder="contato@empresa.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => validateStep1() && setStep(2)}>Próximo</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Responsável
            </CardTitle>
            <CardDescription>Quem será o administrador principal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel_nome">Nome Completo *</Label>
              <Input
                id="responsavel_nome"
                value={formData.responsavel_nome}
                onChange={(e) => handleChange('responsavel_nome', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel_email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="responsavel_email"
                  type="email"
                  value={formData.responsavel_email}
                  onChange={(e) => handleChange('responsavel_email', e.target.value)}
                  placeholder="responsavel@empresa.com"
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Este email será usado para criar o acesso ao painel administrativo
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={() => validateStep2() && setStep(3)}>Próximo</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Módulos Contratados
            </CardTitle>
            <CardDescription>Selecione quais funcionalidades o cliente terá acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ModuloSelector selected={modulosSelecionados} onChange={setModulosSelecionados} />

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button onClick={() => validateStep3() && setStep(4)}>Próximo</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>Confira os dados antes de criar o cliente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Empresa:</span>
                  <span className="font-medium">{formData.nome_fantasia || formData.nome_empresa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Responsável:</span>
                  <span className="font-medium">{formData.responsavel_nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{formData.responsavel_email}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <p className="text-muted-foreground mb-1">Módulos contratados:</p>
                  <div className="space-y-1">
                    {modulosSelecionados.map((modulo) => (
                      <div key={modulo.modulo_id} className="flex justify-between text-sm">
                        <span>{modulo.codigo}</span>
                        <span>{formatCurrency(modulo.preco_negociado ?? 0)}/mês</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Valor mensal:</span>
                  <span className="text-primary">{formatCurrency(valorMensal)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(3)}>
                Voltar
              </Button>
              <Button onClick={handleSubmit} disabled={createTenant.isPending}>
                {createTenant.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Cliente'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
