import { Button } from '@/components/ui/button';

interface CategoryToggleProps {
  activeCategory: 'home' | 'rental';
  onCategoryChange: (category: 'home' | 'rental') => void;
}

const CategoryToggle = ({ activeCategory, onCategoryChange }: CategoryToggleProps) => {
  return (
    <div className="relative flex bg-gradient-to-r from-muted to-gray-100 dark:from-muted dark:to-gray-800 rounded-2xl p-1 mb-6 sm:mb-8 max-w-md mx-auto shadow-premium border border-border/20">
      {/* Sliding indicator */}
      <div 
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r rounded-xl transition-all duration-500 ease-out shadow-md ${
          activeCategory === 'home' 
            ? 'left-1 from-primary to-blue-600' 
            : 'left-[calc(50%+2px)] from-green-500 to-green-600'
        }`}
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onCategoryChange('home')}
        className={`relative z-10 flex-1 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 border-0 min-w-[120px] sm:min-w-[140px] ${
          activeCategory === 'home'
            ? 'text-white shadow-none hover:bg-transparent'
            : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
        }`}
      >
        Para Casa
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onCategoryChange('rental')}
        className={`relative z-10 flex-1 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 border-0 min-w-[120px] sm:min-w-[140px] ${
          activeCategory === 'rental'
            ? 'text-white shadow-none hover:bg-transparent'
            : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
        }`}
      >
        Para Economizar
      </Button>
    </div>
  );
};

export default CategoryToggle;