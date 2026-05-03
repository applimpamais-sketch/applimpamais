import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LPTheme, getTheme } from '@/styles/lp-themes';

interface Testimonial {
  imageUrl: string;
  alt?: string;
}

interface LP12DTestimonialsProps {
  title?: string;
  testimonials?: Testimonial[];
  autoplaySpeed?: number;
  theme?: LPTheme;
}

const LP12DTestimonials = ({
  title = "Veja o que elas estão dizendo",
  testimonials = [
    { imageUrl: "https://catiaregiely.com.br/wp-content/uploads/2024/10/1.png", alt: "Depoimento 1" },
    { imageUrl: "https://catiaregiely.com.br/wp-content/uploads/2024/10/2.png", alt: "Depoimento 2" },
    { imageUrl: "https://catiaregiely.com.br/wp-content/uploads/2024/10/3.png", alt: "Depoimento 3" },
    { imageUrl: "https://catiaregiely.com.br/wp-content/uploads/2024/10/4.png", alt: "Depoimento 4" }
  ],
  autoplaySpeed = 5000,
  theme = 'midnight'
}: LP12DTestimonialsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const t = getTheme(theme);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, autoplaySpeed);
    return () => clearInterval(timer);
  }, [testimonials.length, autoplaySpeed]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 2; i++) {
      const index = (currentIndex + i) % testimonials.length;
      result.push({ ...testimonials[index], index });
    }
    return result;
  };

  return (
    <section id="Depoimentos" className={`relative py-16 md:py-24 overflow-hidden`}>
      {/* Background */}
      <div className={`absolute inset-0 ${t.bgPrimary}`} />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12"
        >
          <span className={`bg-gradient-to-r ${t.gradientHeadline} bg-clip-text text-transparent`}>
            {title}
          </span>
        </motion.h2>

        <div className="relative max-w-5xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronRight size={24} />
          </button>

          {/* Carousel */}
          <div className="overflow-hidden">
            <div className="flex gap-4 md:gap-8 justify-center">
              {getVisibleTestimonials().map((testimonial, idx) => (
                <motion.div
                  key={`${testimonial.index}-${idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-xs md:max-w-sm flex-shrink-0"
                >
                  <div className={`${t.bgCard} backdrop-blur-lg rounded-2xl p-2 border border-white/10`}>
                    <img
                      src={testimonial.imageUrl}
                      alt={testimonial.alt || `Depoimento ${testimonial.index + 1}`}
                      className="w-full h-auto rounded-xl"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? `bg-gradient-to-r ${t.gradientPrimary} w-8`
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LP12DTestimonials;
