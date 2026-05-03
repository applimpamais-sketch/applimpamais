import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  ChevronRight, 
  ChevronDown,
  GripVertical,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  LayoutGrid,
} from 'lucide-react';
import { LPSection, LPElement, SectionType, ElementType } from '@/types/lp-document';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { SortableElementItem } from './SortableElementItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useEditorState } from '../hooks/useEditorState';

const sectionTypeLabels: Record<SectionType, string> = {
  'hero': 'Hero',
  'problem': 'Problema',
  'solution': 'Solução',
  'benefits': 'Benefícios',
  'testimonials': 'Depoimentos',
  'target-audience': 'Para Quem',
  'pricing': 'Preços',
  'bio': 'Bio',
  'faq': 'FAQ',
  'cta-final': 'CTA Final',
  'footer': 'Footer',
  'marquee': 'Marquee',
  'custom': 'Custom',
};

interface SortableSectionItemProps {
  section: LPSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

export function SortableSectionItem({
  section,
  isSelected,
  onSelect,
  onToggleVisibility,
  onDuplicate,
  onRemove,
}: SortableSectionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedId, setSelection, reorderElements, findColumn } = useEditorState();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Flatten all elements from all columns in all rows with their column info
  const allElements: { element: LPElement; columnId: string }[] = [];
  section.rows.forEach(row => {
    row.columns.forEach(col => {
      col.elements.forEach(element => {
        allElements.push({ element, columnId: col.id });
      });
    });
  });

  // Sensors for nested elements DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleElementDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find which column both elements belong to
      const activeItem = allElements.find(e => e.element.id === active.id);
      const overItem = allElements.find(e => e.element.id === over.id);
      
      if (activeItem && overItem && activeItem.columnId === overItem.columnId) {
        // Same column - reorder within column
        const column = findColumn(activeItem.columnId);
        if (column) {
          const oldIndex = column.column.elements.findIndex(e => e.id === active.id);
          const newIndex = column.column.elements.findIndex(e => e.id === over.id);
          reorderElements(activeItem.columnId, oldIndex, newIndex);
        }
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'opacity-50')}>
      <ContextMenu>
        <ContextMenuTrigger>
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer group transition-colors',
                isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                !section.visible && 'opacity-50'
              )}
              onClick={onSelect}
            >
              <div 
                {...attributes} 
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              
              <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
              
              <span className="flex-1 text-xs font-medium truncate">
                {section.name || sectionTypeLabels[section.type] || section.type}
              </span>

              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility();
                }}
              >
                {section.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
            </div>

            <CollapsibleContent>
              <div className="ml-6 border-l pl-2 space-y-0.5 mt-0.5">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleElementDragEnd}
                >
                  <SortableContext
                    items={allElements.map(e => e.element.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {allElements.map(({ element }) => (
                      <SortableElementItem
                        key={element.id}
                        element={element}
                        isSelected={selectedId === element.id}
                        onSelect={() => setSelection(element.id, 'element')}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </ContextMenuItem>
          <ContextMenuItem onClick={onToggleVisibility}>
            {section.visible ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Ocultar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Mostrar
              </>
            )}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onRemove} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Remover
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
