import { cn } from '@/lib/utils';
import type { ElementProps } from '@/types/lp-document';
import { Check } from 'lucide-react';

interface RenderPricingProps {
  props: ElementProps;
}

export function RenderPricing({ props }: RenderPricingProps) {
  const features = props.features || [];

  return (
    <div className="lp-card rounded-2xl p-8 text-center max-w-md mx-auto">
      {props.originalPrice && (
        <p className="text-lg lp-text-muted line-through mb-1">
          {props.originalPrice}
        </p>
      )}
      <p className="text-4xl font-bold lp-gradient-text mb-2">
        {props.price || 'R$ 0'}
      </p>
      {features.length > 0 && (
        <ul className="space-y-2 mt-6 text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-5 h-5 lp-accent flex-shrink-0" />
              <span className="lp-text-muted">{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
