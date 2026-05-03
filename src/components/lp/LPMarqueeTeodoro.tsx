import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LPMarqueeTeodoroProps {
  texto?: string;
  theme?: LPTheme;
}

const LPMarqueeTeodoro = ({
  texto = 'Teodoro Bernardes',
  theme = 'midnight',
}: LPMarqueeTeodoroProps) => {
  const t = getTheme(theme);
  
  // Repetir o texto muitas vezes para criar o efeito infinito
  const repetitions = 50;
  const marqueeText = Array(repetitions).fill(`${texto}  -  `).join('');

  return (
    <section className="bg-[#EDEDED] py-4 overflow-hidden">
      <div className="relative whitespace-nowrap">
        <div 
          className="inline-block animate-marquee-teodoro"
          style={{
            animationDuration: '95s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          }}
        >
          <span className="text-black text-base md:text-lg font-normal tracking-normal">
            {marqueeText}
          </span>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee-teodoro {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee-teodoro {
          animation: marquee-teodoro 95s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default LPMarqueeTeodoro;
