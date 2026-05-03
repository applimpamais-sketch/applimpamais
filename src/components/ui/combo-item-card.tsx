import { Card } from '@/components/ui/card';
import * as Icons from 'lucide-react';

interface ComboItemCardProps {
  icon: string;
  name: string;
  description: string;
  onClick: () => void;
}

const ComboItemCard = ({ icon, name, description, onClick }: ComboItemCardProps) => {
  const IconComponent = (Icons as any)[icon] || Icons.Package;
  
  return (
    <Card 
      className="p-5 sm:p-6 flex flex-col gap-4 cursor-pointer bg-card border border-border rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 hover:border-accent/50 hover:bg-accent/5 group hover:scale-[1.02] active:scale-[0.98] min-h-[140px] sm:min-h-[160px]"
      onClick={onClick}
    >
      <div className="text-accent group-hover:text-accent/80 transition-colors duration-300 flex justify-center">
        <IconComponent size={28} className="sm:w-8 sm:h-8" strokeWidth={1.5} />
      </div>
      <div className="flex-1 flex flex-col justify-center text-center space-y-2">
        <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-accent transition-colors duration-300 leading-tight">
          {name}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
};

export default ComboItemCard;