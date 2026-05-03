import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EditorLayout } from '@/components/lp-editor/EditorLayout';
import { useEditorState } from '@/components/lp-editor/hooks/useEditorState';
import { useAutoSave } from '@/components/lp-editor/hooks/useAutoSave';
import { LandingPageDocument } from '@/types/lp-document';
import { importFromLegacy } from '@/components/lp-editor/utils/importCatiaJson';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function LandingPageEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { document, setDocument, setLandingPageId } = useEditorState();

  // Fetch landing page data
  const { data: landingPage, isLoading, error } = useQuery({
    queryKey: ['landing-page-editor', id],
    queryFn: async () => {
      if (!id) throw new Error('ID não fornecido');
      
      const { data, error } = await supabase
        .from('iarc_landing_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Initialize document from DB
  useEffect(() => {
    if (landingPage && id) {
      setLandingPageId(id);
      
      // Check if config has the new document format
      const config = landingPage.config as any;
      
      if (config?.sections) {
        // New format - use directly
        setDocument(config as LandingPageDocument);
      } else {
        // Legacy format - import data using converter
        const convertedDoc = importFromLegacy({
          id: landingPage.id,
          nome: landingPage.nome,
          template_tipo: landingPage.template_tipo,
          config: landingPage.config as Record<string, unknown> | null,
          copy_gerada: landingPage.copy_gerada as Record<string, unknown> | null,
        });
        setDocument(convertedDoc);
      }
    }
  }, [landingPage, id, setDocument, setLandingPageId]);

  // Auto-save hook
  useAutoSave({ enabled: true });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando editor...</p>
        </div>
      </div>
    );
  }

  if (error || !landingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Erro ao carregar landing page</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Landing page não encontrada'}
          </p>
          <Button onClick={() => navigate('/admin/iarc/landing-pages')}>
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <EditorLayout 
      landingPageId={id || ''} 
      landingPageName={landingPage.nome}
    />
  );
}
