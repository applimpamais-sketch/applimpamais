import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface CountdownTimerProps {
  hours?: number;
  minutes?: number;
  seconds?: number;
  className?: string;
  theme?: LPTheme;
  onComplete?: () => void;
}

const CountdownTimer = ({ 
  hours = 23, 
  minutes = 59, 
  seconds = 59,
  className = '',
  theme = 'midnight',
  onComplete 
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    hours,
    minutes,
    seconds,
  });
  
  const t = getTheme(theme);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          clearInterval(timer);
          onComplete?.();
          return prev;
        }

        let newSeconds = prev.seconds - 1;
        let newMinutes = prev.minutes;
        let newHours = prev.hours;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }

        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }

        return {
          hours: Math.max(0, newHours),
          minutes: Math.max(0, newMinutes),
          seconds: Math.max(0, newSeconds),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 1.1, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${t.bgCard} ${t.border} border rounded-lg w-14 h-14 md:w-16 md:h-16 flex items-center justify-center`}
      >
        <span className={`text-2xl md:text-3xl font-bold ${t.textPrimary} tabular-nums`}>
          {String(value).padStart(2, '0')}
        </span>
      </motion.div>
      <span className={`text-xs ${t.textMuted} mt-1 uppercase tracking-wider`}>{label}</span>
    </div>
  );

  return (
    <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
      <TimeBlock value={timeLeft.hours} label="Horas" />
      <span className={`text-2xl md:text-3xl font-bold ${t.accent} pb-5`}>:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <span className={`text-2xl md:text-3xl font-bold ${t.accent} pb-5`}>:</span>
      <TimeBlock value={timeLeft.seconds} label="Seg" />
    </div>
  );
};

export default CountdownTimer;
