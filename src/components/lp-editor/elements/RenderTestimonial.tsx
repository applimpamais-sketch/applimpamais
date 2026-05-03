import { cn } from '@/lib/utils';
import type { ElementProps } from '@/types/lp-document';
import { Quote } from 'lucide-react';

interface RenderTestimonialProps {
  props: ElementProps;
}

export function RenderTestimonial({ props }: RenderTestimonialProps) {
  const testimonial = props.testimonial;
  
  if (!testimonial) {
    return (
      <div className="lp-card rounded-xl p-6 lp-text-muted">
        Depoimento não configurado
      </div>
    );
  }

  return (
    <div className="lp-card rounded-xl p-6">
      <Quote className="w-8 h-8 lp-accent mb-4 opacity-50" />
      <p className="lp-text-muted mb-4 italic">"{testimonial.text}"</p>
      <div className="flex items-center gap-3">
        {testimonial.avatar && (
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <p className="lp-text font-medium">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-sm lp-text-muted">{testimonial.role}</p>
          )}
        </div>
      </div>
    </div>
  );
}
