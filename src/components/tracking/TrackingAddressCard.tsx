import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface TrackingAddressCardProps {
  endereco: string;
  bairro?: string | null;
  cidade?: string | null;
}

export default function TrackingAddressCard({
  endereco,
  bairro,
  cidade,
}: TrackingAddressCardProps) {
  const locationParts = [bairro, cidade].filter(Boolean).join(', ');

  return (
    <motion.div
      className="flex items-start gap-3 p-4 bg-card rounded-xl shadow-sm border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-2 bg-primary/10 rounded-full">
        <MapPin className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{endereco}</p>
        {locationParts && (
          <p className="text-sm text-muted-foreground truncate">{locationParts}</p>
        )}
      </div>
    </motion.div>
  );
}
