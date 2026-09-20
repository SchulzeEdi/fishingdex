# Pipeline (GitHub Actions) + Scanner de Segurança (SonarQube/SonarCloud)

Cobre os itens 4 (pipeline) e 5 (scanner de segurança) da rubrica. Ver ADR-0006.
O workflow está em `.github/workflows/ci.yml` e a config do scanner em `sonar-project.properties`.

## O que o pipeline faz
1. **gates** — typecheck, lint (inclui fronteiras FSD), testes com cobertura, build, e os checks do harness (`validate-state`, `check-docs`).
2. **security** — `npm audit` + **scan do SonarQube/SonarCloud** e o **Quality Gate** (reprova o PR se a qualidade/segurança falhar).
3. **deploy** — publica na Vercel no push para `main` (só depois de gates + security passarem).

> Enquanto o app Expo não existir (sem `package.json`), o CI fica vermelho — é esperado. Ele passa a valer quando o projeto for criado (fase de implementação) com os scripts npm `typecheck`, `lint`, `test:coverage`, `build`.

## Opção A — SonarCloud (recomendado, sem servidor)
1. Acesse **https://sonarcloud.io** e entre com sua conta do GitHub.
2. **+ → Analyze new project** → escolha o repositório `SchulzeEdi/fishingdex`.
3. Anote a **Organization key** e a **Project key** que o SonarCloud criar e ajuste, se preciso, no `sonar-project.properties` (hoje: `organization=schulzeedi`, `projectKey=SchulzeEdi_fishingdex`).
4. Em **My Account → Security**, gere um **token**.
5. No GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - `SONAR_TOKEN` = o token gerado.
6. Em **SonarCloud → Project → Administration → Analysis Method**, **desligue** a "Automatic Analysis" (vamos analisar pelo CI).
7. Pronto — o job `security` roda o scan e o Quality Gate a cada PR/push.

## Opção B — SonarQube self-hosted (se o professor exigir)
1. Suba um SonarQube (Docker): `docker run -d -p 9000:9000 sonarqube:lts-community` (ou no seu servidor).
2. Crie o projeto e um token no SonarQube.
3. No GitHub, crie:
   - secret `SONAR_TOKEN` = token do seu SonarQube;
   - **variable** `SONAR_HOST_URL` = a URL do seu SonarQube (ex.: `http://SEU_IP:9000`).
4. O mesmo workflow funciona — a `sonarqube-scan-action` usa `SONAR_HOST_URL`.

## Deploy Vercel — pendência conhecida
O job `deploy` roda na `main` mas está **não-bloqueante** (`continue-on-error`) enquanto o
token/escopo não está 100%. O erro observado foi `vercel pull → "Could not retrieve Project
Settings"`, típico de **token sem escopo do time** (o projeto está sob o time
`schulzeedis-projects`). Correção:
1. Gerar um token em https://vercel.com/account/tokens com **escopo do time** `schulzeedis-projects`
   (ou "Full Account"), e atualizar o secret `VERCEL_TOKEN`.
2. Confirmar `VERCEL_ORG_ID` = `team_...` (o ID do time) e `VERCEL_PROJECT_ID` = `prj_...`.
3. Quando o deploy passar, remover o `continue-on-error: true` do job `deploy`.

## Secrets/variáveis usados pelo workflow
| Nome | Tipo | Para quê |
|---|---|---|
| `SONAR_TOKEN` | secret | autenticar o scanner |
| `SONAR_HOST_URL` | variable | só self-hosted (SonarCloud é o default) |
| `VERCEL_TOKEN` | secret | deploy na Vercel |
| `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | secret | identificar o projeto na Vercel |

## O que preciso de você
- Criar a conta/projeto no SonarCloud (ou subir o SonarQube) e adicionar o **`SONAR_TOKEN`** nos secrets do repo.
- (Para o deploy) criar o projeto na Vercel e adicionar `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
Me avisa quando tiver feito, ou se quiser que eu ajuste o workflow (ex.: remover o job de deploy por enquanto e deixar só gates + Sonar).
