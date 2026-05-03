import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { SpotlightPosition } from '@/types/onboarding';

interface TourOverlayProps {
  targetSelector: string;
  padding?: number;
  children?: React.ReactNode;
  onElementNotFound?: () => void;
}

export default function TourOverlay({ targetSelector, padding = 8, children, onElementNotFound }: TourOverlayProps) {
  const [spotlight, setSpotlight] = useState<SpotlightPosition | null>(null);
  const [elementNotFound, setElementNotFound] = useState(false);
  const attemptsRef = useRef(0);
  const maxAttempts = 10;

  useEffect(() => {
    attemptsRef.current = 0;
    setElementNotFound(false);
    setSpotlight(null);

    const updateSpotlight = (element: Element) => {
      const rect = element.getBoundingClientRect();
      setSpotlight({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2),
      });

      // Scroll para o elemento se não estiver visível
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const tryFindElement = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        updateSpotlight(element);
      } else if (attemptsRef.current < maxAttempts) {
        attemptsRef.current++;
        setTimeout(tryFindElement, 200);
      } else {
        // Não encontrou após 10 tentativas (2s), pular para próximo passo
        console.warn(`[Tour] Elemento não encontrado após ${maxAttempts} tentativas: ${targetSelector}`);
        setElementNotFound(true);
        onElementNotFound?.();
      }
    };

    // Pequeno delay para garantir que o DOM está pronto
    const timeoutId = setTimeout(tryFindElement, 100);
    
    // Atualizar em resize/scroll
    const handleResize = () => {
      const element = document.querySelector(targetSelector);
      if (element) {
        updateSpotlight(element);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [targetSelector, padding, onElementNotFound]);

  // Se elemento não foi encontrado e callback já foi chamado, não renderizar nada
  if (elementNotFound) {
    return null;
  }

  if (!spotlight) {
    return (
      <div className="fixed inset-0 z-[9998] bg-black/70 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin h-8 w-8 border-4 border-white/30 border-t-white rounded-full mx-auto mb-3"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Criar clip-path para o spotlight
  const clipPath = `
    polygon(
      0% 0%, 
      0% 100%, 
      ${spotlight.left}px 100%, 
      ${spotlight.left}px ${spotlight.top}px, 
      ${spotlight.left + spotlight.width}px ${spotlight.top}px, 
      ${spotlight.left + spotlight.width}px ${spotlight.top + spotlight.height}px, 
      ${spotlight.left}px ${spotlight.top + spotlight.height}px, 
      ${spotlight.left}px 100%, 
      100% 100%, 
      100% 0%
    )
  `;

  return (
    <>
      {/* Overlay escuro com recorte */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] pointer-events-auto"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          clipPath,
        }}
      />

      {/* Borda luminosa ao redor do spotlight */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[9999] pointer-events-none rounded-lg"
        style={{
          top: spotlight.top,
          left: spotlight.left,
          width: spotlight.width,
          height: spotlight.height,
          boxShadow: '0 0 0 4px hsl(var(--primary)), 0 0 30px 10px hsl(var(--primary) / 0.3)',
        }}
      />

      {children}
    </>
  );
}
