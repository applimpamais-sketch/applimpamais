import type { ElementProps } from '@/types/lp-document';

interface RenderBioProps {
  props: ElementProps;
}

export function RenderBio({ props }: RenderBioProps) {
  return (
    <div className="space-y-3">
      {props.name && (
        <h3 className="text-2xl font-bold lp-gradient-text">{props.name}</h3>
      )}
      {props.role && (
        <p className="lp-accent font-medium">{props.role}</p>
      )}
      {props.description && (
        <p className="lp-text-muted leading-relaxed">{props.description}</p>
      )}
    </div>
  );
}
