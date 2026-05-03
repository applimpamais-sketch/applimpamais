import { Marquee } from '@/components/ui/marquee';

const PromoMarquee = () => {
  const gifUrl = "https://limpezadeestofadosbh.com.br/wp-content/uploads/2024/05/banner-gif-LIMPEZA-DE-SOFA.gif";
  
  // Array com 10 GIFs para repetir
  const gifs = Array(10).fill(gifUrl);
  
  return (
    <div className="py-2 overflow-hidden">
      <Marquee 
        className="[--duration:25s] [--gap:1rem]" 
        repeat={3}
        pauseOnHover={true}
      >
        <div className="flex items-center gap-4">
          {gifs.map((gif, index) => (
            <img 
              key={index}
              src={gif} 
              alt="Limpeza de Sofá" 
              className="h-12 md:h-16 object-contain rounded"
            />
          ))}
        </div>
      </Marquee>
    </div>
  );
};

export default PromoMarquee;
