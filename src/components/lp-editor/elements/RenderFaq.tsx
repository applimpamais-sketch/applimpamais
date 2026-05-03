import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ElementProps } from '@/types/lp-document';
import { ChevronDown } from 'lucide-react';

interface RenderFaqProps {
  props: ElementProps;
}

export function RenderFaq({ props }: RenderFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = props.faqItems || [];

  return (
    <div className="space-y-3 w-full max-w-3xl mx-auto">
      {items.map((item, index) => (
        <div
          key={index}
          className="lp-card rounded-lg overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 flex items-center justify-between text-left lp-text hover:lp-surface-hover transition-colors"
          >
            <span className="font-medium">{item.q}</span>
            <ChevronDown 
              className={cn(
                'w-5 h-5 transition-transform lp-text-muted',
                openIndex === index && 'rotate-180',
              )} 
            />
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-200',
              openIndex === index ? 'max-h-96' : 'max-h-0',
            )}
          >
            <p className="px-6 pb-4 lp-text-muted">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
