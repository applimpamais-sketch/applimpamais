import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { OutlinePanel } from './OutlinePanel';
import { CanvasPanel } from './CanvasPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { EditorToolbar } from './EditorToolbar';
import { useEditorState } from './hooks/useEditorState';

interface EditorLayoutProps {
  landingPageId: string;
  landingPageName: string;
}

export function EditorLayout({ landingPageId, landingPageName }: EditorLayoutProps) {
  const { previewMode } = useEditorState();
  const [showOutline, setShowOutline] = useState(true);
  const [showProperties, setShowProperties] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <EditorToolbar 
        landingPageId={landingPageId}
        landingPageName={landingPageName}
        showOutline={showOutline}
        showProperties={showProperties}
        onToggleOutline={() => setShowOutline(!showOutline)}
        onToggleProperties={() => setShowProperties(!showProperties)}
      />

      {/* 3-Panel Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Outline */}
          {showOutline && (
            <>
              <ResizablePanel 
                defaultSize={20} 
                minSize={15} 
                maxSize={30}
                className="bg-card border-r"
              >
                <OutlinePanel />
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Center Panel - Canvas */}
          <ResizablePanel defaultSize={showOutline && showProperties ? 55 : 70}>
            <CanvasPanel />
          </ResizablePanel>

          {/* Right Panel - Properties */}
          {showProperties && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel 
                defaultSize={25} 
                minSize={20} 
                maxSize={35}
                className="bg-card border-l"
              >
                <PropertiesPanel />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
