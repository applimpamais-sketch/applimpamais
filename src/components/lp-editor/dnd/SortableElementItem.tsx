import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical,
  Type,
  Image,
  MousePointer2,
  List,
  HelpCircle,
  Quote,
  CreditCard,
  User,
  Minus,
  Video,
  Award
} from 'lucide-react';
import { LPElement, ElementType } from '@/types/lp-document';
import { cn } from '@/lib/utils';

const elementTypeIcons: Record<ElementType, React.ReactNode> = {
  'heading': <Type className="h-3.5 w-3.5" />,
  'text': <Type className="h-3.5 w-3.5" />,
  'image': <Image className="h-3.5 w-3.5" />,
  'button': <MousePointer2 className="h-3.5 w-3.5" />,
  'list': <List className="h-3.5 w-3.5" />,
  'faq-accordion': <HelpCircle className="h-3.5 w-3.5" />,
  'testimonial-card': <Quote className="h-3.5 w-3.5" />,
  'pricing-card': <CreditCard className="h-3.5 w-3.5" />,
  'bio-card': <User className="h-3.5 w-3.5" />,
  'icon': <Award className="h-3.5 w-3.5" />,
  'spacer': <Minus className="h-3.5 w-3.5" />,
  'divider': <Minus className="h-3.5 w-3.5" />,
  'video': <Video className="h-3.5 w-3.5" />,
  'countdown': <Award className="h-3.5 w-3.5" />,
  'badge': <Award className="h-3.5 w-3.5" />,
};

function getElementLabel(element: LPElement): string {
  switch (element.type) {
    case 'heading':
      return element.props.text?.slice(0, 25) || 'Heading';
    case 'text':
      return element.props.content?.slice(0, 25) || 'Text';
    case 'button':
      return element.props.label || 'Button';
    case 'image':
      return element.props.alt || 'Image';
    case 'list':
      return `List (${element.props.items?.length || 0} items)`;
    case 'faq-accordion':
      return `FAQ (${element.props.faqItems?.length || 0})`;
    case 'testimonial-card':
      return element.props.testimonial?.name || 'Testimonial';
    case 'pricing-card':
      return element.props.price || 'Pricing';
    case 'bio-card':
      return element.props.name || 'Bio';
    case 'spacer':
      return `Spacer (${element.props.height || 'md'})`;
    case 'badge':
      return element.props.badgeText || 'Badge';
    default:
      return element.type;
  }
}

interface SortableElementItemProps {
  element: LPElement;
  isSelected: boolean;
  onSelect: () => void;
}

export function SortableElementItem({
  element,
  isSelected,
  onSelect,
}: SortableElementItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer text-xs transition-colors group',
        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
        !element.visible && 'opacity-50',
        isDragging && 'opacity-50 bg-muted'
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      {elementTypeIcons[element.type]}
      <span className="truncate flex-1">{getElementLabel(element)}</span>
    </div>
  );
}
