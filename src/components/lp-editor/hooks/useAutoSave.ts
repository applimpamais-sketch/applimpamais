import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEditorState } from './useEditorState';
import type { LandingPageDocument } from '@/types/lp-document';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave(options: UseAutoSaveOptions = {}) {
  const { debounceMs = 800, enabled = true } = options;
  
  const { 
    document, 
    landingPageId, 
    isDirty, 
    setIsSaving, 
    markClean 
  } = useEditorState();
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  const saveDocument = useCallback(async (doc: LandingPageDocument) => {
    if (!landingPageId) return;

    const docString = JSON.stringify(doc);
    if (docString === lastSavedRef.current) return;

    setIsSaving(true);

    try {
      // 1. Update main document
      const { error: updateError } = await supabase
        .from('iarc_landing_pages')
        .update({
          config: doc as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', landingPageId);

      if (updateError) throw updateError;

      // 2. Create revision (table may not exist yet)
      try {
        await (supabase as any)
          .from('iarc_landing_page_revisions')
          .insert({
            landing_page_id: landingPageId,
            config: doc as any,
          });
      } catch (revisionError) {
        console.warn('Revision table not available:', revisionError);
      }

      lastSavedRef.current = docString;
      markClean();
    } catch (error) {
      console.error('AutoSave failed:', error);
      toast.error('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }, [landingPageId, setIsSaving, markClean]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!enabled || !isDirty || !landingPageId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDocument(document);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [document, isDirty, enabled, debounceMs, landingPageId, saveDocument]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveDocument(document);
  }, [document, saveDocument]);

  return { saveNow };
}
