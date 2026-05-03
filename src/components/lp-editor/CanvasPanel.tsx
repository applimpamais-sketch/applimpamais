import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditorState } from './hooks/useEditorState';
import { LandingRenderer } from './LandingRenderer';
import { cn } from '@/lib/utils';

export function CanvasPanel() {
  const { document, previewMode, selectedId, setSelection } = useEditorState();

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Canvas Header */}
      <div className="h-10 border-b bg-card flex items-center justify-center">
        <span className="text-xs text-muted-foreground">
          {previewMode === 'mobile' ? '390px' : 'Desktop'}
        </span>
      </div>

      {/* Canvas Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 min-h-full flex justify-center">
          <div
            className={cn(
              'bg-background shadow-lg transition-all duration-300',
              previewMode === 'mobile' 
                ? 'w-[390px] rounded-[2rem] border-[8px] border-zinc-800' 
                : 'w-full max-w-[1440px]'
            )}
            style={previewMode === 'mobile' ? { minHeight: '844px' } : undefined}
          >
            <div className={cn(
              previewMode === 'mobile' && 'rounded-[1.5rem] overflow-hidden'
            )}>
              <LandingRenderer
                document={document}
                mode="edit"
                selectedId={selectedId}
                onSelect={(id, type) => setSelection(id, type)}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
