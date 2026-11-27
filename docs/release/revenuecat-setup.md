# Cobrança real do Pro — RevenueCat + Google Play Billing

O código está pronto (app + servidor). Falta configurar as contas, o que só o dono pode fazer.
Enquanto a chave pública do RevenueCat não estiver no build, o app segue com a **compra de
demonstração** (Pro sem cobrança) — nada quebra.

## Como funciona

```
App (Android) ──compra──> Google Play ──> RevenueCat ──webhook──> Supabase: revenuecat-webhook ─┐
   │                                                                                           ├─> users.plan = pro/free
   └── logo após comprar/restaurar ──────────────> Supabase: sync-subscription (confere na API) ┘
```

- O app identifica o comprador no RevenueCat pelo **id do usuário no Supabase**.
- Só o servidor muda o plano (o app nunca consegue se dar Pro).
- Cancelar mantém o Pro até o fim do período pago; a expiração volta para Free.
- Preço exibido = o da Google Play, na moeda da conta da pessoa.

Já publicado no Supabase `fishingdex`: funções `revenuecat-webhook` e `sync-subscription`,
tabela `subscriptions` atualizada e o segredo do webhook.

## Passo a passo (uma vez)

### 1. Google Play Console
1. App criado e **um AAB enviado ao Teste interno** (a Play só libera criar assinaturas depois
   que um build com a permissão de cobrança é enviado — o nosso já tem).
2. **Perfil de pagamentos** ativo (Configuração › Perfil de pagamentos) para poder vender.
3. **Monetizar › Produtos › Assinaturas › Criar assinatura**
   - ID do produto: `fishingdex_pro` · Nome: `fishingdex Pro`
   - Plano base `monthly`: renovação automática, 1 mês, **R$ 19,90** (Brasil) e **US$ 6,99**
     (demais países — a Play converte os outros).
   - Plano base `yearly`: renovação automática, 1 ano, **R$ 149** e **US$ 49,99**.
   - Ativar os dois planos.
4. **Teste de licença** (Configuração › Teste de licença): adicione seu Gmail. Compras dessa
   conta não são cobradas.

### 2. Conta de serviço (Play → RevenueCat)
Siga o guia do RevenueCat "Google Play Store service credentials": criar a conta de serviço no
Google Cloud, dar acesso em Play Console › Usuários e permissões (ver dados financeiros e
gerenciar pedidos/assinaturas) e baixar o JSON. Pode levar até 36 h para valer.

### 3. RevenueCat (conta grátis em revenuecat.com)
1. Projeto `fishingdex` › **Add app › Google Play**, pacote `com.schulzeedi.fishingdex`, envie
   o JSON da conta de serviço.
2. **Products**: importe `fishingdex_pro:monthly` e `fishingdex_pro:yearly`.
3. **Entitlements**: crie `pro` e anexe os dois produtos (o nome tem que ser exatamente `pro`).
4. **Offerings**: a oferta `default` (marcada como atual) com os pacotes **Monthly** →
   `fishingdex_pro:monthly` e **Annual** → `fishingdex_pro:yearly`.
5. **Integrations › Webhooks › Add**:
   - URL: `https://mfikwhzvkwdthfraghad.supabase.co/functions/v1/revenuecat-webhook`
   - Authorization header: o valor da linha `REVENUECAT_WEBHOOK_AUTH_HEADER` em
     `secrets/revenuecat.env` (arquivo só no seu PC, fora do git).
   - "Send test event" deve responder 200.

### 4. Chaves
- **Chave pública do SDK Android** (`goog_...`, em Project settings › API keys): é pública, vai
  no app. Coloque em `eas.json` (perfis `preview` e `production`) como
  `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` — ou me mande que eu coloco.
- **Chave secreta** (`sk_...`): **não mande no chat nem coloque no repositório**. Rode você:
  ```
  npx supabase secrets set REVENUECAT_SECRET_KEY=sk_...
  ```

### 5. Gerar o build e testar
1. `npm run build:aab` → enviar ao Teste interno.
2. No celular/emulador com a conta de teste de licença, instalar **pelo link do teste interno
   da Play** (APK baixado direto não serve para cobrança: a Play exige o app assinado por ela).
3. Assinar Pro → a tela de compra da Play abre → confirmar → o app vira Pro.
4. Conferir: `node --env-file=.env --env-file=secrets/revenuecat.env scripts/e2e/billing-smoke.mjs`.

### 6. Desligar a compra de demonstração no servidor
Quando a compra real estiver funcionando, desligue o atalho de demo (senão alguém poderia
chamar a função de demo direto pela API):
```sql
update public.app_settings set value = 'false' where key = 'demo_purchases';
```
(é só me avisar que eu aplico.)

## Custos
- RevenueCat: grátis até US$ 2,5 mil de receita mensal rastreada (depois, 1%).
- Google Play: 15% sobre assinaturas.
