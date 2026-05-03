#!/bin/bash
# 🧪 TESTE DE CHECKOUT - RC Limpa Mais
# Script para testar endpoint create-public-agendamento via curl

SUPABASE_URL="https://yyrnshankehiqvkndrwk.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5cm5zaGFua2VoaXF2a25kcndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MzcxNTgsImV4cCI6MjA3ODExMzE1OH0.QsEdE5OsdSsD6cpuPyJy_K98bBDDzybyEN3CEr_eo-M"
ORIGIN="https://rclimpamais.com.br"

echo "🧪 Testando fluxo de checkout..."
echo "================================"
echo ""

# Teste 1: OPTIONS (preflight)
echo "📍 Teste 1: Preflight CORS (OPTIONS)"
echo "-----------------------------------"
curl -X OPTIONS "${SUPABASE_URL}/functions/v1/create-public-agendamento" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization, content-type" \
  -v 2>&1 | grep -E "(HTTP|Access-Control|< )"

echo ""
echo ""

# Teste 2: POST com dados válidos (telefone e CEP SEM formatação)
echo "📍 Teste 2: POST com dados válidos"
echo "-----------------------------------"
curl -X POST "${SUPABASE_URL}/functions/v1/create-public-agendamento" \
  -H "Origin: ${ORIGIN}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${ANON_KEY}" \
  -d '{
    "nome_cliente": "Jessefer Sousa",
    "telefone": "31994678382",
    "endereco": "Rua Teste 123, Complemento A",
    "bairro": "Centro",
    "cidade": "Belo Horizonte - MG",
    "cep": "30840570",
    "data_agendamento": "2025-12-01",
    "horario": "14:00 - 16:00",
    "itens_carrinho": [
      {
        "id": 1,
        "name": "Sofá Retrátil",
        "details": "2.0 a 3.0m",
        "price": 184,
        "quantity": 1
      }
    ],
    "valor_total": 184,
    "valor_desconto": 0,
    "valor_frete": 0
  }' \
  -v 2>&1 | tee /tmp/checkout_test_result.json

echo ""
echo ""

# Teste 3: POST com dados INVÁLIDOS (telefone formatado - deve falhar)
echo "📍 Teste 3: POST com dados INVÁLIDOS (telefone formatado)"
echo "--------------------------------------------------------"
curl -X POST "${SUPABASE_URL}/functions/v1/create-public-agendamento" \
  -H "Origin: ${ORIGIN}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${ANON_KEY}" \
  -d '{
    "nome_cliente": "Teste Erro",
    "telefone": "(31) 99467-8382",
    "endereco": "Rua Teste 123",
    "bairro": "Centro",
    "cidade": "Belo Horizonte - MG",
    "cep": "30840-570",
    "data_agendamento": "2025-12-01",
    "itens_carrinho": [],
    "valor_total": 100
  }' \
  -v 2>&1 | jq .

echo ""
echo "================================"
echo "✅ Testes concluídos!"
echo ""
echo "📊 Checklist de validação:"
echo "  [ ] Preflight retorna 204 com header Access-Control-Allow-Origin"
echo "  [ ] POST com dados válidos retorna 200 com request_id e agendamento"
echo "  [ ] POST com dados inválidos retorna 400 com missing_fields e hint"
echo "  [ ] order_code está presente na resposta"
echo ""
