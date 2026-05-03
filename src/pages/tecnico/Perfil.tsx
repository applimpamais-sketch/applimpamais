import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import PageHeader from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TecnicoPerfil() {
  const { profile, isLoading, updateProfile, uploadAvatar, isUpdating } = useProfile();
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone: '',
    telefone_whatsapp: '',
    data_nascimento: '',
    endereco: '',
    cidade: '',
    estado: '',
    bio: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        nome_completo: profile.nome_completo || '',
        telefone: profile.telefone || '',
        telefone_whatsapp: profile.telefone_whatsapp || '',
        data_nascimento: profile.data_nascimento || '',
        endereco: profile.endereco || '',
        cidade: profile.cidade || '',
        estado: profile.estado || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 2MB.');
        return;
      }
      uploadAvatar(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais"
        showHelpButton={false}
      />

      {/* Foto de Perfil */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Foto de Perfil</CardTitle>
          <CardDescription className="text-sm">
            Toque na imagem para alterar (JPG, PNG - máx 2MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-xl sm:text-2xl bg-primary/10 text-primary">
                  {profile?.nome_completo?.substring(0, 2).toUpperCase() || 'TC'}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors touch-target"
              >
                <Camera className="h-4 w-4" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isUpdating}
              />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">
                {profile?.nome_completo || 'Técnico'}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {profile?.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="nome_completo" className="text-sm font-medium">
                  Nome Completo
                </Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  value={profile?.email}
                  disabled
                  className="h-11 bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm font-medium">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  placeholder="(31) 98765-4321"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone_whatsapp" className="text-sm font-medium">
                  WhatsApp
                </Label>
                <Input
                  id="telefone_whatsapp"
                  placeholder="(31) 98765-4321"
                  value={formData.telefone_whatsapp}
                  onChange={(e) => handleInputChange('telefone_whatsapp', e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_nascimento" className="text-sm font-medium">
                  Data de Nascimento
                </Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label htmlFor="endereco" className="text-sm font-medium">
                  Endereço
                </Label>
                <Input
                  id="endereco"
                  placeholder="Rua, número, complemento"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  className="h-11"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-sm font-medium">
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm font-medium">
                    Estado
                  </Label>
                  <Input
                    id="estado"
                    placeholder="MG"
                    maxLength={2}
                    value={formData.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())}
                    className="h-11"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium">
                  Sobre mim
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Conte um pouco sobre você..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isUpdating}
              className="w-full sm:w-auto h-12 px-8 text-base"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Segurança</CardTitle>
          <CardDescription className="text-sm">
            Gerencie suas configurações de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Senha</p>
              <p className="text-sm text-muted-foreground">
                Altere sua senha de acesso
              </p>
            </div>
            <Button variant="outline" asChild className="h-11 w-full sm:w-auto">
              <a href="/change-password">Alterar Senha</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
