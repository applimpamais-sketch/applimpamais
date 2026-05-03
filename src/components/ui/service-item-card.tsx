import { Card } from '@/components/ui/card';
import * as Icons from 'lucide-react';

interface ServiceItemCardProps {
  icon: string;
  name: string;
  onClick: () => void;
}

const ServiceItemCard = ({ icon, name, onClick }: ServiceItemCardProps) => {
  const IconComponent = (Icons as any)[icon] || Icons.Square;
  
  return (
    <Card 
      className="card-interactive group relative overflow-hidden p-3 sm:p-4 lg:p-5 flex flex-row items-center justify-start gap-3 sm:gap-4 h-16 sm:h-18 lg:h-20 w-full"
      onClick={onClick}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icon with circular styling */}
      <div className="relative z-10 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 group-hover:from-primary/20 group-hover:to-blue-500/20 transition-all duration-300 group-hover:scale-110 flex-shrink-0">
        <IconComponent 
          size={18} 
          className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary group-hover:text-primary-hover transition-all duration-300" 
          strokeWidth={1.5} 
        />
      </div>
      
      {/* Text aligned left */}
      <span className="relative z-10 text-xs sm:text-sm lg:text-base font-medium text-left text-foreground group-hover:text-primary transition-all duration-300 leading-tight line-clamp-1 flex-1">
        {name}
      </span>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
};

export default ServiceItemCard;