import ServiceItemCard from '@/components/ui/service-item-card';
import { ServiceItem } from '@/data/services';

interface ServiceGridProps {
  title: string;
  items: ServiceItem[];
  onItemClick: (item: ServiceItem) => void;
}

const ServiceGrid = ({ title, items, onItemClick }: ServiceGridProps) => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 mb-8 sm:mb-12">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground text-center sm:text-left px-2 sm:px-0">
        {title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 px-2 sm:px-0">
        {items.map((item) => (
          <ServiceItemCard
            key={item.id}
            icon={item.icon}
            name={item.name}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </section>
  );
};

export default ServiceGrid;