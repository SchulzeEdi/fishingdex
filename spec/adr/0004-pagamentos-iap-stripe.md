# ADR-0004: Pagamentos — IAP (RevenueCat) para Pro + Stripe para listagem

- **Status:** aceito
- **Data:** 2026-09-20

## Contexto
A assinatura **Pescador Pro** é conteúdo digital consumido no app mobile → Apple e Google **exigem in-app purchase** (não deixam cobrar assinatura digital por Stripe direto; risco de rejeição na loja). Já a **listagem de pesqueiro** é um serviço B2B, fora dessa regra na maioria dos casos.

## Opções consideradas
1. **Stripe para tudo** — simples, mas **viola as regras das lojas** para a assinatura Pro.
2. **IAP nativo puro** — atende as lojas, mas gerir recibos/estados dos 2 stores é trabalhoso.
3. **RevenueCat (IAP) para Pro + Stripe para listagem** — RevenueCat abstrai Apple/Google e unifica o estado da assinatura; Stripe cobre o B2B.

## Decisão
**RevenueCat** (sobre IAP Apple/Google) para a assinatura **Pro**; **Stripe** para a **listagem de pesqueiro** (USD e BRL, com Pix no BR). Webhooks idempotentes atualizam `subscriptions`.

## Consequências
- Positivas: conformidade com as lojas; um painel de assinatura (RevenueCat); Stripe onde é permitido.
- Negativas: dois provedores; Apple/Google retêm 15–30% da assinatura Pro.
- Reavaliar se: as lojas mudarem as regras (ex.: links externos de pagamento).
