import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { LPTheme, themes, themesList } from '@/styles/lp-themes';

interface ThemeSelectorProps {
  value: LPTheme;
  onChange: (theme: LPTheme) => void;
}

export const ThemeSelector = ({ value, onChange }: ThemeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Palette className="h-4 w-4" />
        <span className="text-sm">Escolha o estilo visual da sua landing page</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {themesList.map((theme) => {
          const isSelected = value === theme.id;
          const themeColors = themes[theme.id];
          
          return (
            <motion.button
              key={theme.id}
              onClick={() => onChange(theme.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${isSelected 
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50 bg-card'
                }
              `}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              
              {/* Theme Preview */}
              <div className="mb-3">
                {/* Color swatches */}
                <div className="flex gap-1 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.gradientPrimary}`} />
                  <div className={`w-8 h-8 rounded-lg ${themeColors.bgPrimary} border ${themeColors.border}`} />
                </div>
                
                {/* Mini preview card */}
                <div className={`${themeColors.bgPrimary} rounded-lg p-2 ${themeColors.border} border`}>
                  <div className={`h-2 w-12 rounded bg-gradient-to-r ${theme.gradientPrimary} mb-1`} />
                  <div className={`h-1.5 w-8 rounded ${themeColors.bgSection}`} />
                </div>
              </div>
              
              {/* Theme info */}
              <div>
                <h4 className="font-medium text-sm text-foreground">
                  {theme.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {theme.idealFor}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {/* Theme description */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{themes[value].name}:</span>{' '}
          {themes[value].description}. Ideal para {themes[value].idealFor.toLowerCase()}.
        </p>
      </div>
    </div>
  );
};
