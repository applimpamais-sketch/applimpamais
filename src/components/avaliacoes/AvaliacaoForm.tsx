import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import DOMPurify from "dompurify";

const avaliacaoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  cidade: z.string().min(2, "Cidade é obrigatória").max(50),
  bairro: z.string().min(2, "Bairro é obrigatório").max(50),
  servico: z.string().min(1, "Selecione um serviço"),
  rating: z.number().min(1, "Selecione uma nota").max(5),
  comentario: z.string().min(20, "Comentário deve ter pelo menos 20 caracteres").max(500),
});

const servicos = [
  "Limpeza de Sofá",
  "Limpeza de Colchão",
  "Limpeza de Poltrona",
  "Limpeza de Cadeiras",
  "Limpeza de Cama Box",
  "Impermeabilização de Sofá",
  "Limpeza + Impermeabilização",
  "Aluguel de Máquina",
];

const StarRatingInput = ({ 
  value, 
  onChange 
}: { 
  value: number; 
  onChange: (rating: number) => void;
}) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              star <= (hover || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30 hover:text-yellow-400/50"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export const AvaliacaoForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cidade: "",
    bairro: "",
    servico: "",
    rating: 0,
    comentario: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        nome: DOMPurify.sanitize(formData.nome.trim()),
        cidade: DOMPurify.sanitize(formData.cidade.trim()),
        bairro: DOMPurify.sanitize(formData.bairro.trim()),
        servico: formData.servico,
        rating: formData.rating,
        comentario: DOMPurify.sanitize(formData.comentario.trim()),
      };

      // Validate
      const validated = avaliacaoSchema.parse(sanitizedData);

      // Insert into database
      const { error } = await supabase
        .from("avaliacoes_clientes")
        .insert({
          nome: validated.nome,
          cidade: validated.cidade,
          bairro: validated.bairro,
          servico: validated.servico,
          rating: validated.rating,
          comentario: validated.comentario,
          status: "pendente",
        });

      if (error) throw error;

      toast({
        title: "Avaliação enviada com sucesso!",
        description: "Obrigado pelo seu feedback! Sua avaliação será publicada após revisão.",
      });

      // Reset form
      setFormData({
        nome: "",
        cidade: "",
        bairro: "",
        servico: "",
        rating: 0,
        comentario: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro na validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao enviar",
          description: "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Deixe sua Avaliação
            </h2>
            <p className="text-muted-foreground">
              Compartilhe sua experiência com nossos serviços e ajude outros clientes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nome completo *
              </label>
              <Input
                placeholder="Seu nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                maxLength={100}
                required
              />
            </div>

            {/* Cidade e Bairro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Cidade *
                </label>
                <Input
                  placeholder="Ex: Belo Horizonte"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  maxLength={50}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Bairro *
                </label>
                <Input
                  placeholder="Ex: Savassi"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  maxLength={50}
                  required
                />
              </div>
            </div>

            {/* Serviço */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Serviço contratado *
              </label>
              <Select
                value={formData.servico}
                onValueChange={(value) => setFormData({ ...formData, servico: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((servico) => (
                    <SelectItem key={servico} value={servico}>
                      {servico}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Sua nota *
              </label>
              <StarRatingInput
                value={formData.rating}
                onChange={(rating) => setFormData({ ...formData, rating })}
              />
              {formData.rating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {formData.rating === 5 && "Excelente!"}
                  {formData.rating === 4 && "Muito bom!"}
                  {formData.rating === 3 && "Bom"}
                  {formData.rating === 2 && "Regular"}
                  {formData.rating === 1 && "Ruim"}
                </p>
              )}
            </div>

            {/* Comentário */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Seu comentário *
              </label>
              <Textarea
                placeholder="Conte-nos sobre sua experiência com o serviço..."
                value={formData.comentario}
                onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                rows={4}
                maxLength={500}
                required
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.comentario.length}/500 caracteres
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold"
              disabled={isSubmitting || formData.rating === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Avaliação
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Sua avaliação será revisada antes de ser publicada.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};
