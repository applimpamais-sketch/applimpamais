import { useState } from 'react';
import { useTenantContext } from '@/hooks/useTenantContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Palette,
  Save,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClienteConfiguracoes() {
  const { tenant, tenantId } = useTenantContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome_fantasia: tenant?.nome_fantasia || '',
    email_contato: tenant?.email_contato || '',
    telefone: tenant?.telefone || '',
    dominio_customizado: tenant?.dominio_customizado || '',
    cor_primaria: tenant?.cores_personalizadas?.primaria || '#3b82f6',
    cor_secundaria: tenant?.cores_personalizadas?.secundaria || '#1e40af',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!tenantId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('saas_tenants')
        .update({
          nome_fantasia: formData.nome_fantasia || null,
          email_contato: formData.email_contato || null,
          telefone: formData.telefone || null,
          dominio_customizado: formData.dominio_customizado || null,
          cores_personalizadas: {
            primaria: formData.cor_primaria,
            secundaria: formData.cor_secundaria,
          },
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', tenantId);

      if (error) throw error;

      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['current-tenant-context'] });

      toast({
        title: 'Configurações salvas!',
        description: 'As alterações foram aplicadas com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize os dados e aparência da sua empresa
        </p>
      </div>

      {/* Dados da Empresa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>
              Informações básicas exibidas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome_empresa">Razão Social</Label>
                <Input
                  id="nome_empresa"
                  value={tenant?.nome_empresa || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Entre em contato para alterar a razão social
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input
                  id="nome_fantasia"
                  value={formData.nome_fantasia}
                  onChange={(e) => handleChange('nome_fantasia', e.target.value)}
                  placeholder="Nome exibido no sistema"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={tenant?.cnpj || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_contato" className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email de Contato
                </Label>
                <Input
                  id="email_contato"
                  type="email"
                  value={formData.email_contato}
                  onChange={(e) => handleChange('email_contato', e.target.value)}
                  placeholder="contato@suaempresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dominio" className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Domínio Customizado
                </Label>
                <Input
                  id="dominio"
                  value={formData.dominio_customizado}
                  onChange={(e) => handleChange('dominio_customizado', e.target.value)}
                  placeholder="app.suaempresa.com"
                />
                <p className="text-xs text-muted-foreground">
                  Configure o DNS antes de usar um domínio próprio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personalização Visual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Personalização Visual
            </CardTitle>
            <CardDescription>
              Cores da interface do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cor_primaria">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="cor_primaria"
                    value={formData.cor_primaria}
                    onChange={(e) => handleChange('cor_primaria', e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.cor_primaria}
                    onChange={(e) => handleChange('cor_primaria', e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor_secundaria">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="cor_secundaria"
                    value={formData.cor_secundaria}
                    onChange={(e) => handleChange('cor_secundaria', e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.cor_secundaria}
                    onChange={(e) => handleChange('cor_secundaria', e.target.value)}
                    placeholder="#1e40af"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <Separator className="my-4" />
            <div>
              <Label className="mb-3 block">Prévia das Cores</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="h-12 w-24 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: formData.cor_primaria }}
                >
                  Primária
                </div>
                <div 
                  className="h-12 w-24 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: formData.cor_secundaria }}
                >
                  Secundária
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Botão Salvar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-end"
      >
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
