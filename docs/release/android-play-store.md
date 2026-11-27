# Android: APK, AAB e publicação na Google Play

Guia do T-11 (EAS build + submissão), parte Android. Stack: Expo SDK 58 (RN 0.88) — gera
**targetSdk 36 (Android 16)**, o mínimo que a Play exige para app novo desde 31/08/2026.

## Visão geral

| Artefato | Para quê | Comando |
|---|---|---|
| **APK** | Instalar direto no celular (teste, banca, colegas) | `npm run build:apk` |
| **AAB** (app bundle) | Único formato aceito para publicar na Play | `npm run build:aab` |
| Envio à Play | Sobe o AAB para a faixa de teste interno | `npm run submit:android` |

Os builds rodam no **EAS Build** (nuvem da Expo, plano gratuito com fila). Não precisa de
Android Studio nem SDK local. A chave de assinatura (keystore) é gerada e guardada pelo EAS
no primeiro build — **não perca o acesso à conta Expo**: é ela que guarda a chave de upload.

## 1. Uma vez só: conta Expo e projeto EAS

> ✅ Feito em 2026-11-27: projeto **`@ederson.schulze/fishingdex`**
> (https://expo.dev/accounts/ederson.schulze/projects/fishingdex), `projectId` no `app.json`,
> keystore Android gerado e guardado no EAS. Passos abaixo ficam para referência.

```bash
npx eas-cli@latest login          # conta grátis em https://expo.dev/signup
npx eas-cli@latest init           # cria o projeto e grava extra.eas.projectId no app.json
```

Alternativa sem login interativo (CI): crie um token em expo.dev › Account settings › Access
tokens e exporte `EXPO_TOKEN` no ambiente.

## 2. Gerar o APK (teste no celular)

```bash
npm run build:apk
```

Ao terminar, o EAS mostra um link/QR code do `.apk`. No celular: abrir o link, baixar e
permitir "instalar apps desconhecidos" para o navegador. Perfil `preview` em `eas.json`.

## 3. Gerar o AAB (loja)

```bash
npm run build:aab
```

Perfil `production`: `app-bundle`, `autoIncrement` do `versionCode` (versões controladas no
EAS — `appVersionSource: remote`). A `version` visível ("1.0.0") fica no `app.json`.

## 4. Google Play Console

1. **Conta de desenvolvedor:** https://play.google.com/console — taxa única de US$ 25 e
   verificação de identidade.
2. **Criar app:** nome "fishingdex", idioma padrão pt-BR, app (não jogo), gratuito.
3. **Assinatura:** aceitar o *Play App Signing* (padrão). O AAB do EAS vai assinado com a chave
   de upload; o Google re-assina para distribuição.
4. **Ficha da loja:** textos, ícone e arte prontos em [`store-listing.md`](./store-listing.md)
   e `docs/release/store-assets/`. Capturas de tela: tirar no celular com o APK.
5. **Política de privacidade:** URL pública
   `https://github.com/SchulzeEdi/fishingdex/blob/main/docs/legal/privacy-policy.md`
   (o repositório é público; vale depois do merge na `main`).
6. **Conteúdo do app:** classificação (IARC), público-alvo (18+), anúncios (não), segurança dos
   dados (respostas em `store-listing.md`), acesso ao app (sem login nesta versão).
7. **Primeiro envio:** o primeiro AAB precisa ser enviado **pelo Console** (Testes › Teste
   interno › Criar versão › enviar o `.aab` baixado do EAS). Depois disso,
   `npm run submit:android` funciona com a chave de conta de serviço.
8. **Conta pessoal nova:** a Play exige **teste fechado com pelo menos 12 testadores por 14
   dias seguidos** antes de liberar a produção. Planeje: teste interno → teste fechado (12+
   e-mails) → solicitar acesso à produção.

### Envio automático (opcional)

1. Play Console › Configuração › Acesso à API: criar conta de serviço no Google Cloud com
   permissão de "Lançamentos".
2. Baixar a chave JSON para `secrets/google-play-service-account.json` (pasta no `.gitignore`).
3. `npm run submit:android` → sobe para a faixa **internal** como rascunho.

## 5. Antes da produção (pendências que a revisão da Play vai pegar)

| Pendência | Por quê | Onde |
|---|---|---|
| **Cobrança real do Pro** | Assinatura digital tem que usar o Google Play Billing. Hoje "Assinar Pro" é demonstração (ativa no aparelho, sem cobrar). Em produção pública isso não pode ir assim. | DT-05 · `features/subscribe-pro/model/demo-purchase.ts` → RevenueCat (ADR-0004) |
| **Feed/ranking reais** | Hoje mostram exemplos locais da comunidade + as suas capturas. | DT-04 · `entities/catch/model/sample-community.data.ts` → API |
| **Conta e servidor** | Perfil local; com login a política de privacidade e o Data safety mudam. | DT-03 (Supabase Auth + RLS) |

Para **teste interno e teste fechado** a versão atual serve como está (é o objetivo da fase).

## 6. Conferência local (sem EAS)

```bash
npm run lint && npm run typecheck && npm test
npx expo export --platform android     # valida o bundle Hermes do Android
npx expo start                          # abrir no Expo Go (SDK 58) ou web
```

## Configuração relevante

- `app.json` › `android.package`: `com.schulzeedi.fishingdex` (**definitivo** depois do 1º envio).
- `android.adaptiveIcon`: frente/monocromático em `assets/images/`, fundo `#0e4d5c`.
- `android.blockedPermissions`: remove microfone e acesso amplo a mídia — a escolha de foto usa o
  seletor do sistema (exigência da política de fotos e vídeos da Play). Fica só a câmera.
- Splash: `expo-splash-screen` com a marca sobre `primary` (claro) / `background` (escuro).
- Ícones/arte: fonte em `assets/brand/*.svg`; regenerar com `npm run brand:assets`.
