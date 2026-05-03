import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trackAddToCart, trackInitiateCheckout, trackPurchase } from '@/utils/facebookPixel';
import { toast } from 'sonner';

export default function PixelDebugger() {
  const testAddToCart = () => {
    trackAddToCart({
      id: 'test-sofa-3-lugares',
      name: 'Sofá 3 Lugares - TESTE',
      price: 150,
      quantity: 1
    });
    toast.success('✅ AddToCart enviado! Verifique o console e a tabela pixel_events');
  };

  const testInitiateCheckout = () => {
    trackInitiateCheckout([
      { id: 'test-1', name: 'Sofá 3 Lugares - TESTE', quantity: 1, price: 150 }
    ], 150);
    toast.success('✅ InitiateCheckout enviado! Verifique o console e a tabela pixel_events');
  };

  const testPurchase = () => {
    trackPurchase('TEST-' + Date.now(), 150, [
      { id: 'test-1', name: 'Sofá 3 Lugares - TESTE', quantity: 1 }
    ]);
    toast.success('✅ Purchase enviado! Verifique o console e a tabela pixel_events');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🧪 Testes de Facebook Pixel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button onClick={testAddToCart} className="w-full" variant="outline">
          🛒 Testar AddToCart
        </Button>
        <Button onClick={testInitiateCheckout} className="w-full" variant="outline">
          🛍️ Testar InitiateCheckout
        </Button>
        <Button onClick={testPurchase} className="w-full" variant="outline">
          💰 Testar Purchase
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Após clicar nos botões, verifique:
          <br />• Console do navegador (F12) para logs
          <br />• Tabela pixel_events no backend
          <br />• Facebook Events Manager (se configurado)
        </p>
      </CardContent>
    </Card>
  );
}
