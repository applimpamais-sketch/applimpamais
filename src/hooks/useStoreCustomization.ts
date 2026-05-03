import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenantContext } from '@/hooks/useTenantContext';
import { toast } from 'sonner';

export interface StoreCustomization {
  logoUrl: string | null;
  corPrimaria: string;
  corSecundaria: string;
}

export function useStoreCustomization() {
  const { tenant, tenantId } = useTenantContext();
  const queryClient = useQueryClient();
  
  // Estado local das customizações
  const [customization, setCustomization] = useState<StoreCustomization>({
    logoUrl: null,
    corPrimaria: '#3b82f6',
    corSecundaria: '#1e40af',
  });
  
  // Estado original para detectar mudanças
  const [originalCustomization, setOriginalCustomization] = useState<StoreCustomization | null>(null);
  
  // Flag de alterações pendentes
  const [hasChanges, setHasChanges] = useState(false);
  
  // Carregar dados do tenant quando disponível
  useEffect(() => {
    if (tenant) {
      const initial: StoreCustomization = {
        logoUrl: tenant.logo_url || null,
        corPrimaria: tenant.cores_personalizadas?.primaria || '#3b82f6',
        corSecundaria: tenant.cores_personalizadas?.secundaria || '#1e40af',
      };
      setCustomization(initial);
      setOriginalCustomization(initial);
      setHasChanges(false);
    }
  }, [tenant]);
  
  // Detectar mudanças
  useEffect(() => {
    if (!originalCustomization) return;
    
    const changed = 
      customization.logoUrl !== originalCustomization.logoUrl ||
      customization.corPrimaria !== originalCustomization.corPrimaria ||
      customization.corSecundaria !== originalCustomization.corSecundaria;
    
    setHasChanges(changed);
  }, [customization, originalCustomization]);
  
  // Atualizar cor primária
  const setCorPrimaria = useCallback((cor: string) => {
    setCustomization(prev => ({ ...prev, corPrimaria: cor }));
  }, []);
  
  // Atualizar cor secundária
  const setCorSecundaria = useCallback((cor: string) => {
    setCustomization(prev => ({ ...prev, corSecundaria: cor }));
  }, []);
  
  // Upload de logo
  const uploadLogo = useCallback(async (file: File): Promise<string | null> => {
    if (!tenantId) {
      toast.error('Tenant não encontrado');
      return null;
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenantId}/logo.${fileExt}`;
      
      // Remover logo antigo se existir
      await supabase.storage
        .from('tenant-logos')
        .remove([`${tenantId}/logo.png`, `${tenantId}/logo.jpg`, `${tenantId}/logo.jpeg`, `${tenantId}/logo.webp`, `${tenantId}/logo.svg`]);
      
      // Upload do novo logo
      const { error: uploadError } = await supabase.storage
        .from('tenant-logos')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) {
        console.error('[useStoreCustomization] Erro ao fazer upload:', uploadError);
        toast.error('Erro ao fazer upload do logo');
        return null;
      }
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('tenant-logos')
        .getPublicUrl(fileName);
      
      // Atualizar estado local
      setCustomization(prev => ({ ...prev, logoUrl: publicUrl }));
      
      return publicUrl;
    } catch (error) {
      console.error('[useStoreCustomization] Erro no upload:', error);
      toast.error('Erro ao fazer upload do logo');
      return null;
    }
  }, [tenantId]);
  
  // Remover logo
  const removeLogo = useCallback(() => {
    setCustomization(prev => ({ ...prev, logoUrl: null }));
  }, []);
  
  // Mutation para salvar alterações
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!tenantId) throw new Error('Tenant não encontrado');
      
      const { error } = await supabase
        .from('saas_tenants')
        .update({
          logo_url: customization.logoUrl,
          cores_personalizadas: {
            primaria: customization.corPrimaria,
            secundaria: customization.corSecundaria,
          },
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', tenantId);
      
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      // Atualizar estado original
      setOriginalCustomization({ ...customization });
      setHasChanges(false);
      
      // Invalidar cache do tenant
      queryClient.invalidateQueries({ queryKey: ['current-tenant-context'] });
      
      toast.success('Loja publicada com sucesso!');
    },
    onError: (error) => {
      console.error('[useStoreCustomization] Erro ao salvar:', error);
      toast.error('Erro ao salvar alterações');
    },
  });
  
  // Publicar alterações
  const publish = useCallback(() => {
    saveMutation.mutate();
  }, [saveMutation]);
  
  // Descartar alterações
  const discardChanges = useCallback(() => {
    if (originalCustomization) {
      setCustomization(originalCustomization);
      setHasChanges(false);
    }
  }, [originalCustomization]);
  
  // Obter URL da loja
  const getStoreUrl = useCallback(() => {
    if (tenant?.dominio_customizado) {
      return `https://${tenant.dominio_customizado}`;
    }
    // URL padrão usando o domínio de produção
    return 'https://rclimpamais.com.br';
  }, [tenant]);
  
  return {
    customization,
    hasChanges,
    isPublishing: saveMutation.isPending,
    setCorPrimaria,
    setCorSecundaria,
    uploadLogo,
    removeLogo,
    publish,
    discardChanges,
    getStoreUrl,
  };
}
