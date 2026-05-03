import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Monitor, 
  Smartphone, 
  Undo2, 
  Redo2, 
  Eye, 
  Save,
  PanelLeft,
  PanelRight,
  Loader2,
  Check
} from 'lucide-react';
import { useEditorState } from './hooks/useEditorState';
import { useAutoSave } from './hooks/useAutoSave';

interface EditorToolbarProps {
  landingPageId: string;
  landingPageName: string;
  showOutline: boolean;
  showProperties: boolean;
  onToggleOutline: () => void;
  onToggleProperties: () => void;
}

export function EditorToolbar({
  landingPageId,
  landingPageName,
  showOutline,
  showProperties,
  onToggleOutline,
  onToggleProperties,
}: EditorToolbarProps) {
  const navigate = useNavigate();
  const { 
    previewMode, 
    setPreviewMode, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    isDirty,
    isSaving,
  } = useEditorState();
  
  const { saveNow } = useAutoSave({ enabled: false });

  const handlePreview = () => {
    window.open(`/lp/${landingPageId}`, '_blank');
  };

  return (
    <div className="h-14 border-b bg-card flex items-center px-4 gap-4">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/admin/iarc/landing-pages')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-sm truncate max-w-[200px]">
            {landingPageName}
          </h1>
          {isDirty && (
            <Badge variant="outline" className="text-xs">
              Não salvo
            </Badge>
          )}
          {isSaving && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Salvando...
            </Badge>
          )}
        </div>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Panel toggles */}
      <div className="flex items-center gap-1">
        <Button 
          variant={showOutline ? "secondary" : "ghost"} 
          size="icon-sm"
          onClick={onToggleOutline}
          title="Toggle Outline Panel"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant={showProperties ? "secondary" : "ghost"} 
          size="icon-sm"
          onClick={onToggleProperties}
          title="Toggle Properties Panel"
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon-sm"
          onClick={undo}
          disabled={!canUndo}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon-sm"
          onClick={redo}
          disabled={!canRedo}
          title="Refazer (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Preview Mode Toggle */}
      <ToggleGroup 
        type="single" 
        value={previewMode} 
        onValueChange={(v) => v && setPreviewMode(v as 'desktop' | 'mobile')}
      >
        <ToggleGroupItem value="desktop" size="sm" title="Desktop">
          <Monitor className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="mobile" size="sm" title="Mobile">
          <Smartphone className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePreview}
        >
          <Eye className="h-4 w-4 mr-2" />
          Visualizar
        </Button>
        <Button 
          size="sm"
          onClick={saveNow}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : isDirty ? (
            <Save className="h-4 w-4 mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Salvando...' : isDirty ? 'Salvar' : 'Salvo'}
        </Button>
      </div>
    </div>
  );
}
