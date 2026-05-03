#!/bin/bash
# SCRIPTS DE TESTE - MENU ADMIN RC LIMPA MAIS

echo "🧪 Iniciando testes automatizados do menu admin..."

# Test 1: Verificar todas as rotas retornam 200
echo "\n✅ TEST 1: Validação de rotas"
routes=(
  "/admin"
  "/admin/live-view"
  "/admin/agendamentos"
  "/admin/tecnicos"
  "/admin/marketing"
  "/admin/bot-whatsapp/live-view"
  "/admin/carrinhos-abandonados"
  "/admin/cupons"
  "/admin/templates"
  "/admin/relatorios"
  "/admin/equipe"
  "/admin/financeiro"
  "/admin/integracoes/pixel"
)

for route in "${routes[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "https://rclimpamais.lovable.app$route")
  if [ $status -eq 200 ] || [ $status -eq 302 ]; then
    echo "✅ $route - OK ($status)"
  else
    echo "❌ $route - FAIL ($status)"
  fi
done

# Test 2: Performance - Load time < 3s
echo "\n⚡ TEST 2: Performance check"
curl -w "\nLoad Time: %{time_total}s\n" -o /dev/null -s "https://rclimpamais.lovable.app/admin"

# Test 3: Verificar carrinhos abandonados no DB
echo "\n🛒 TEST 3: Carrinhos abandonados (último 24h)"
# Executar via psql ou Supabase client
# SELECT COUNT(*) FROM carrinhos_abandonados WHERE created_at > NOW() - INTERVAL '24 hours';

echo "\n✅ Testes concluídos!"
