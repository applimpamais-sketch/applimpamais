import ComboItemCard from '@/components/ui/combo-item-card';
import { ComboItem } from '@/data/services';

interface ComboGridProps {
  title: string;
  items: ComboItem[];
  onItemClick: (item: ComboItem) => void;
}

const ComboGrid = ({ title, items, onItemClick }: ComboGridProps) => {
  return (
    <div className="mb-8 sm:mb-12 space-y-6">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground px-2">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
        {items.map((item) => (
          <ComboItemCard
            key={item.id}
            icon={item.icon}
            name={item.name}
            description={item.description}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default ComboGrid;