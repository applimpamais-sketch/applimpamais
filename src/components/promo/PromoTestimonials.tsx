import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Maria Clara',
    location: 'Buritis, BH',
    rating: 5,
    text: 'Meu sofá estava manchado há meses. Ficou impecável! Recomendo demais.',
  },
  {
    name: 'Roberto Alves',
    location: 'Pampulha, BH',
    rating: 5,
    text: 'Atendimento pontual e profissional. Preço justo pelo serviço entregue.',
  },
  {
    name: 'Juliana Santos',
    location: 'Contagem',
    rating: 5,
    text: 'Tinha receio de contratar, mas superou expectativas. Sofá como novo!',
  },
];

const PromoTestimonials = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            O que nossos <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">clientes</span> dizem
          </h2>
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
            <span className="text-white ml-2 font-semibold">4.9</span>
            <span className="text-gray-400">• 500+ avaliações</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-gray-800 hover:border-blue-500/30 transition-all duration-300"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-500/20" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
              
              <div>
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoTestimonials;
