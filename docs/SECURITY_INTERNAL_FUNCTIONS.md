# Internal Functions Security Setup

This project now protects critical automation functions with internal auth checks.

## Required env var

Set this secret in Supabase Edge Functions secrets:

```bash
INTERNAL_FUNCTION_SECRET=<strong-random-secret>
```

## Accepted auth methods

Protected functions allow requests only when one of these is present:

1. `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`
2. `x-internal-function-secret: <INTERNAL_FUNCTION_SECRET>`
3. `x-cron-secret: <INTERNAL_FUNCTION_SECRET>`

## Protected functions

- `send-push-notification`
- `send-scheduled-reminders`
- `process-abandoned-carts`
- `send-tecnico-notification`
- `send-rota-diaria`
- `process-avaliacao-queue`
- `iniciar-avaliacao-pos-venda`

## Scheduler recommendation

For scheduled jobs, send header:

```http
x-cron-secret: <INTERNAL_FUNCTION_SECRET>
```

This avoids exposing privileged automations to public, unauthenticated requests.

## WhatsApp webhook hardening (optional but recommended)

Set:

```bash
WHATSAPP_WEBHOOK_SECRET=<strong-random-secret>
```

Then configure your webhook provider to send either:

- header `x-webhook-secret: <WHATSAPP_WEBHOOK_SECRET>`
- or query param `?secret=<WHATSAPP_WEBHOOK_SECRET>`
