import { useState } from 'react';
import { Calculator, TrendingUp, Clock, ShoppingCart } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SavingsCalculator() {
  const [servicosmes, setServicosMes] = useState(30);
  const [precoMedio, setPrecoMedio] = useState(200);
  const [carrinhosPerdidos, setCarrinhosPerdidos] = useState(40);

  // Cálculos
  const faturamentoAtual = servicosmes * precoMedio;
  const carrinhosRecuperados = Math.round((servicosmes * (carrinhosPerdidos / 100)) * 0.3);
  const receitaRecuperada = carrinhosRecuperados * precoMedio;
  const horasEconomizadas = Math.round(servicosmes * 0.1); // 6 min por serviço

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-black to-gray-950 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[200px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-green-400/30 text-green-400">
            <Calculator className="w-4 h-4 mr-2" />
            Calculadora de Economia
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-white">Quanto Você Pode </span>
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Economizar?
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Ajuste os valores abaixo e veja o impacto no seu negócio
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Sliders */}
          <div className="space-y-8">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <CardContent className="p-0 space-y-8">
                {/* Serviços por mês */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-medium">Serviços por mês</label>
                    <span className="text-2xl font-bold text-primary">{servicosmes}</span>
                  </div>
                  <Slider
                    value={[servicosmes]}
                    onValueChange={([v]) => setServicosMes(v)}
                    min={10}
                    max={200}
                    step={5}
                    className="py-2"
                  />
                </div>

                {/* Preço médio */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-medium">Preço médio do serviço</label>
                    <span className="text-2xl font-bold text-primary">R$ {precoMedio}</span>
                  </div>
                  <Slider
                    value={[precoMedio]}
                    onValueChange={([v]) => setPrecoMedio(v)}
                    min={100}
                    max={500}
                    step={10}
                    className="py-2"
                  />
                </div>

                {/* Carrinhos perdidos */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-medium">% de orçamentos perdidos</label>
                    <span className="text-2xl font-bold text-red-400">{carrinhosPerdidos}%</span>
                  </div>
                  <Slider
                    value={[carrinhosPerdidos]}
                    onValueChange={([v]) => setCarrinhosPerdidos(v)}
                    min={10}
                    max={70}
                    step={5}
                    className="py-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Receita Recuperada */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Recuperando 30% dos carrinhos</p>
                    <p className="text-3xl font-bold text-green-400">
                      + R$ {receitaRecuperada.toLocaleString('pt-BR')}/mês
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {carrinhosRecuperados} serviços extras por mês
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tempo Economizado */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-6">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Automatizando agendamentos</p>
                    <p className="text-3xl font-bold text-blue-400">
                      - {horasEconomizadas}h/mês
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Tempo que você pode usar para crescer
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Aumento potencial no faturamento</p>
                    <p className="text-3xl font-bold text-purple-400">
                      + {Math.round((receitaRecuperada / faturamentoAtual) * 100)}%
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      De R$ {faturamentoAtual.toLocaleString('pt-BR')} para R$ {(faturamentoAtual + receitaRecuperada).toLocaleString('pt-BR')}/mês
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
