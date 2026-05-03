import { LPTheme, getTheme } from '@/styles/lp-themes';

interface LP12DMarqueeProps {
  text?: string;
  speed?: number;
  theme?: LPTheme;
}

const LP12DMarquee = ({
  text = "Desafio 12D",
  speed = 30,
  theme = 'midnight'
}: LP12DMarqueeProps) => {
  const t = getTheme(theme);
  
  // Create repeated text for seamless loop
  const repeatedText = Array(10).fill(text).join(' • ');

  return (
    <section className={`relative py-6 md:py-8 overflow-hidden bg-gradient-to-r ${t.gradientPrimary}`}>
      <style>
        {`
          @keyframes marquee-scroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee-scroll ${speed}s linear infinite;
          }
        `}
      </style>
      <div className="flex whitespace-nowrap">
        <div className="flex items-center gap-8 animate-marquee">
          <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-black">
            {repeatedText}
          </span>
          <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-black">
            {repeatedText}
          </span>
        </div>
      </div>
    </section>
  );
};

export default LP12DMarquee;
