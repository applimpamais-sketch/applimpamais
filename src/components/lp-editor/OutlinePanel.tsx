import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useEditorState } from './hooks/useEditorState';
import { AddSectionModal } from './AddSectionModal';
import { SortableSectionItem } from './dnd/SortableSectionItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export function OutlinePanel() {
  const { 
    document, 
    selectedId, 
    setSelection,
    toggleSectionVisibility,
    duplicateSection,
    removeSection,
    reorderSections
  } = useEditorState();
  
  const [showAddSection, setShowAddSection] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (over && active.id !== over.id) {
      const oldIndex = document.sections.findIndex(s => s.id === active.id);
      const newIndex = document.sections.findIndex(s => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSections(oldIndex, newIndex);
      }
    }
  };

  const sectionIds = document.sections.map(s => s.id);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-semibold text-sm">Estrutura</h2>
        <Button 
          variant="ghost" 
          size="icon-sm"
          onClick={() => setShowAddSection(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tree with DnD */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sectionIds}
              strategy={verticalListSortingStrategy}
            >
              {document.sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  section={section}
                  isSelected={selectedId === section.id}
                  onSelect={() => setSelection(section.id, 'section')}
                  onToggleVisibility={() => toggleSectionVisibility(section.id)}
                  onDuplicate={() => duplicateSection(section.id)}
                  onRemove={() => removeSection(section.id)}
                />
              ))}
            </SortableContext>
            
            {/* Drag Overlay for visual feedback */}
            <DragOverlay>
              {activeId ? (
                <div className="bg-background border rounded-md shadow-lg px-3 py-2 text-xs font-medium opacity-80">
                  {document.sections.find(s => s.id === activeId)?.name || 'Seção'}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {document.sections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>Nenhuma seção</p>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => setShowAddSection(true)}
              >
                Adicionar primeira seção
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Add Section Modal */}
      <AddSectionModal 
        open={showAddSection} 
        onOpenChange={setShowAddSection} 
      />
    </div>
  );
}
