# 05 — Monetization: fishingdex

> Como o dinheiro entra nos dois mercados. Checkout USD e BRL não são opcionais.

> Aviso: padrões técnicos/operacionais abaixo não substituem orientação de um contador (Brasil) e de especialista para estrutura no exterior. Regras fiscais variam por volume e situação.

## Tiers de preço
| Tier | USD | BRL | Limites/recursos |
|---|---|---|---|
| Free | $0 | R$0 | Registrar até **3 capturas/mês**, isolado: não vê feed/ranking e não é visto (D-9). Dex própria visível. |
| Pescador Pro | **$6,99/mês** (ou $49,99/ano) | **R$19,90/mês** (ou R$149/ano) | Capturas ilimitadas, feed, ranking, seguir/curtir, histórico, estatísticas, mapa detalhado, Dex completa. |
| Listagem Pesqueiro (B2B) | **$29/mês** | **R$79/mês** | Dono cadastra o pesqueiro no marketplace/mapa e recebe contatos (WhatsApp). |

## Gateways por mercado
- **Assinatura Pro (app mobile):** **IAP via RevenueCat** (Apple App Store + Google Play) — regra das lojas exige in-app purchase para conteúdo digital consumido no app (ADR-0004). RevenueCat unifica o estado da assinatura entre as duas lojas.
- **Listagem de Pesqueiro (B2B):** **Stripe** — cobrança de serviço B2B, não sujeita à regra de IAP. USD via Stripe global; **BRL com Pix + cartão** via Stripe Brasil. Pix obrigatório no mercado BRL.

## Camada de billing (código)
- Interface `PaymentProvider` (em `shared/billing` / `entities/subscription`) com métodos: `createCheckout`, `handleWebhook`, `getSubscription`, `cancel`.
- Implementações: `RevenueCatProvider` (assinatura Pro, IAP) e `StripeProvider` (listagem B2B; USD e BRL/Pix).
- Seleção por **tipo de produto** (Pro → RevenueCat; Listagem → Stripe) e por **locale/moeda** do cliente (USD vs BRL) dentro do Stripe.

## Fluxo de checkout
1. **Pro:** usuário toca "Assinar Pro" → paywall (RevenueCat SDK) apresenta a oferta da loja → compra na App Store/Play → **webhook do RevenueCat** confirma → `subscriptions` ativa → recursos Pro liberados no app.
2. **Listagem (dono):** dono toca "Ativar listagem" → checkout Stripe (USD ou BRL/Pix conforme locale) → **webhook Stripe** `checkout.session.completed`/`invoice.paid` → `fisheries.listing_active = true`.

## Webhooks e modelo de assinatura
- **RevenueCat:** eventos `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`, `BILLING_ISSUE`.
- **Stripe:** `checkout.session.completed`, `customer.subscription.updated`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.
- Handlers **idempotentes** (dedup por event id). Endpoint: `POST /subscriptions/webhook` (roteia por provider).
- Tabela `subscriptions` (ver architecture.md): `id, user_id, plan, provider(iap/stripe), status, current_period_end`. B2C, sem `tenant_id` (ADR-0005).

## Fiscal / operacional
- **Brasil:** começar como MEI → migrar para ME (Simples Nacional) conforme cresce; emissão de NF; confirmar CNAE/tributação de SaaS/app com contador. Assinatura via loja: a loja recolhe e repassa (Apple/Google retêm 15–30%).
- **Exterior (USD):** avaliar LLC + conta (Mercury/Wise) para receber Stripe/RevenueCat; ou Merchant of Record. Validar com especialista.

---
**Gate:**
- [x] Tiers em USD e BRL
- [x] Um gateway por mercado escolhido (RevenueCat/IAP p/ Pro; Stripe USD + Stripe BR/Pix p/ listagem)
- [x] Camada de billing abstrata especificada (`PaymentProvider`)
