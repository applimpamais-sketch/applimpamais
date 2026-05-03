import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ComboItem } from '@/data/services';
import { Package, Sparkles, Shield, Flower } from 'lucide-react';

interface ComboCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  combo: ComboItem | null;
  onConfirm: (comboDetails: {
    originalCombo: ComboItem;
    extraServices: string[];
  }) => void;
}

const ComboCustomizationModal = ({ 
  isOpen, 
  onClose, 
  combo,
  onConfirm 
}: ComboCustomizationModalProps) => {
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const extraServices = [
    {
      id: 'impermeabilizacao',
      name: 'Impermeabilização',
      description: 'Proteção blindada contra líquidos e manchas. Mais segurança e tranquilidade no dia a dia.',
      icon: Shield
    },
    {
      id: 'perfume',
      name: 'Perfume para Estofados',
      description: 'Deixe sua sala ainda mais aconchegante com uma fragrância especial que perfuma o ambiente.',
      icon: Flower
    },
    {
      id: 'protetor',
      name: 'Protetor de Tecidos (Spray)',
      description: 'Camada extra de proteção que prolonga a limpeza e mantém o estofado impecável por muito mais tempo.',
      icon: Sparkles
    }
  ];

  const handleExtraToggle = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedExtras(prev => [...prev, serviceId]);
    } else {
      setSelectedExtras(prev => prev.filter(id => id !== serviceId));
    }
  };

  const handleConfirm = () => {
    if (!combo) return;
    
    onConfirm({
      originalCombo: combo,
      extraServices: selectedExtras
    });
    
    handleClose();
  };

  const handleClose = () => {
    setSelectedExtras([]);
    onClose();
  };

  if (!combo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            {combo.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Descrição do Combo */}
          <div className="bg-orange-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700 mb-2">Você está selecionando:</p>
            <h3 className="text-base sm:text-lg font-semibold text-orange-800 mb-2 sm:mb-3">{combo.name}</h3>
            <div className="flex items-start gap-2 mb-3 sm:mb-4">
              <span className="text-green-600 font-bold text-sm sm:text-base">✔️</span>
              <p className="text-xs sm:text-sm text-gray-700">Seu combo já inclui a limpeza profunda dos estofados.</p>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 font-medium">
              Agora, você pode potencializar os resultados adicionando serviços extras:
            </p>
          </div>

          {/* Serviços Extras */}
          <div className="space-y-3 sm:space-y-4">
            {extraServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  className="flex items-start space-x-2 sm:space-x-3 p-3 sm:p-4 border rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={service.id}
                    checked={selectedExtras.includes(service.id)}
                    onCheckedChange={(checked) => handleExtraToggle(service.id, !!checked)}
                    className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6"
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={service.id}
                      className="flex items-center gap-2 text-sm sm:text-base font-semibold leading-none cursor-pointer mb-1 sm:mb-2"
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                      <span className="truncate">{service.name}</span>
                    </label>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo */}
          {selectedExtras.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                Serviços extras selecionados:
              </h4>
              <div className="space-y-1">
                {selectedExtras.map(extraId => {
                  const service = extraServices.find(s => s.id === extraId);
                  return (
                    <div key={extraId} className="text-sm text-blue-700">
                      • {service?.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
        
        {/* Fixed buttons */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t bg-background">
          <Button variant="outline" onClick={handleClose} className="flex-1 sm:flex-none h-11 sm:h-10 text-sm sm:text-base order-2 sm:order-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-orange-600 hover:bg-orange-700 text-white flex-1 sm:flex-none h-11 sm:h-10 text-sm sm:text-base order-1 sm:order-2"
          >
            Adicionar ao Carrinho
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComboCustomizationModal;