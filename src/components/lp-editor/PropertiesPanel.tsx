import { ScrollArea } from '@/components/ui/scroll-area';
import { useEditorState } from './hooks/useEditorState';
import { SectionProperties } from './properties/SectionProperties';
import { ElementProperties } from './properties/ElementProperties';
import { GlobalProperties } from './properties/GlobalProperties';
import { MousePointer2 } from 'lucide-react';

export function PropertiesPanel() {
  const { selectedId, selectedType, document } = useEditorState();

  // Find selected item
  let selectedSection = null;
  let selectedElement = null;

  if (selectedId && selectedType === 'section') {
    selectedSection = document.sections.find(s => s.id === selectedId);
  } else if (selectedId && selectedType === 'element') {
    for (const section of document.sections) {
      for (const row of section.rows) {
        for (const col of row.columns) {
          const element = col.elements.find(e => e.id === selectedId);
          if (element) {
            selectedElement = element;
            break;
          }
        }
        if (selectedElement) break;
      }
      if (selectedElement) break;
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm">Propriedades</h2>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {!selectedId ? (
            <div className="text-center py-12 text-muted-foreground">
              <MousePointer2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Selecione um elemento para editar</p>
              <p className="text-xs mt-1">ou edite as propriedades globais abaixo</p>
              <div className="mt-6">
                <GlobalProperties />
              </div>
            </div>
          ) : selectedSection ? (
            <SectionProperties section={selectedSection} />
          ) : selectedElement ? (
            <ElementProperties element={selectedElement} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Elemento não encontrado</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
