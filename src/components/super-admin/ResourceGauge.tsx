import { cn } from '@/lib/utils';

interface ResourceGaugeProps {
  label: string;
  value: number;
  max: number;
  percent: number;
  unit?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export function ResourceGauge({
  label,
  value,
  max,
  percent,
  unit = '',
  warningThreshold = 70,
  criticalThreshold = 90,
}: ResourceGaugeProps) {
  const getStatusColor = () => {
    if (percent >= criticalThreshold) return 'text-destructive';
    if (percent >= warningThreshold) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getProgressColor = () => {
    if (percent >= criticalThreshold) return 'bg-destructive';
    if (percent >= warningThreshold) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // Calculate stroke dasharray for circular progress
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border">
      <div className="relative w-36 h-36">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            className={cn('transition-all duration-500', getProgressColor())}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-3xl font-bold', getStatusColor())}>
            {percent}%
          </span>
        </div>
      </div>
      
      <h3 className="mt-4 font-semibold text-foreground">{label}</h3>
      <p className="text-sm text-muted-foreground">
        {value.toLocaleString('pt-BR')}{unit} / {max.toLocaleString('pt-BR')}{unit}
      </p>
    </div>
  );
}
