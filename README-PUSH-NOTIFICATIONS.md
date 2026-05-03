# 📱 Push Notifications - Instruções de Configuração

## ✅ O que foi implementado

Sistema completo de Push Notifications com:
- ✅ Tabela `push_subscriptions` no banco de dados
- ✅ Service Worker customizado (`public/sw-push.js`)
- ✅ Componente `PushNotificationManager` atualizado
- ✅ Edge Function `send-push-notification`
- ✅ Trigger automático no banco quando agendamento é concluído
- ✅ Secrets VAPID configurados na Lovable Cloud

## 🔧 Configuração Final Necessária

### 1. Adicionar VAPID Public Key ao arquivo .env

**CRÍTICO**: Adicione manualmente a seguinte linha ao arquivo `.env`:

```bash
VITE_VAPID_PUBLIC_KEY="sua_public_key_aqui"
```

**Onde encontrar a public key:**
1. Vá em Settings → Secrets na Lovable
2. Copie o valor de `VAPID_PUBLIC_KEY`
3. Adicione ao `.env` como mostrado acima

### 2. Implementar Web Push Completo (Produção)

A edge function atual está com uma implementação simplificada. Para **produção real**, você precisará:

#### Opção A: Usar biblioteca npm (Recomendado)

Crie um `deno.json` na pasta `supabase/functions/send-push-notification/`:

```json
{
  "imports": {
    "web-push": "npm:web-push@3.6.7"
  }
}
```

E atualize o `index.ts` para usar a biblioteca completa com VAPID JWT e criptografia.

#### Opção B: Implementar manualmente

Você precisará implementar:
1. **Criptografia AES-GCM** do payload
2. **Geração de JWT VAPID** para autenticação
3. **Requisição HTTP POST** para o endpoint do push service

Referência: [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8291)

## 📱 Como Testar

### 1. Instalação do PWA
- Abra o app como admin
- Instale o PWA no smartphone (Android ou iOS 16.4+)
- Aceite a permissão de notificações quando solicitado

### 2. Verificar Subscription
- Abra o DevTools → Console
- Veja se aparece: `✅ Nova subscription criada`
- Verifique na tabela `push_subscriptions` se há um registro

### 3. Testar Notificação
- Feche completamente o PWA
- No sistema admin, mude o status de um agendamento para `concluido`
- Aguarde alguns segundos
- ✅ A notificação deve aparecer na barra de notificações do smartphone

### 4. Clicar na Notificação
- Clique na notificação
- ✅ O PWA deve abrir na página `/admin/agendamentos`

## 🔍 Troubleshooting

### Notificações não aparecem?

1. **Verificar permissão:**
   - Android: Configurações → Apps → RC Admin → Notificações → Ativado
   - iOS: Ajustes → Notificações → RC Admin → Permitir Notificações

2. **Verificar subscription:**
   ```sql
   SELECT * FROM push_subscriptions WHERE ativo = true;
   ```

3. **Verificar logs da edge function:**
   - Lovable Cloud → Functions → send-push-notification → Logs

4. **Testar manualmente:**
   - Chame a edge function diretamente:
   ```bash
   curl -X POST https://seu-projeto.supabase.co/functions/v1/send-push-notification \
     -H "Content-Type: application/json" \
     -d '{"agendamento_id": "uuid-do-agendamento"}'
   ```

### iOS não funciona?

- iOS requer versão **16.4 ou superior**
- PWA deve estar **instalado na tela inicial**
- Notificações devem estar **ativadas nas configurações**

### Android funciona mas notificação não abre o app?

- Verifique se o service worker está registrado:
  ```javascript
  navigator.serviceWorker.getRegistration().then(reg => console.log(reg));
  ```

## 🚀 Próximos Passos

1. ✅ Adicionar `VITE_VAPID_PUBLIC_KEY` ao `.env`
2. ⚠️ Implementar Web Push completo para produção
3. 🎨 Personalizar visual das notificações (ícone, sons, vibração)
4. 📊 Adicionar métricas de entrega
5. 🔔 Adicionar mais tipos de notificações (pagamentos, problemas, etc.)

## 📚 Referências

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Keys](https://datatracker.ietf.org/doc/html/rfc8292)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [iOS PWA Support](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)

---

**Status:** 🟡 Funcional para desenvolvimento. Requer implementação completa para produção.
