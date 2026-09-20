# ADR-0006: CI/CD — GitHub Actions + SonarCloud + Vercel/EAS

- **Status:** aceito
- **Data:** 2026-09-20

## Contexto
A rubrica exige pipeline e um **scanner de segurança no deploy** (ex.: SonarQube). Já usamos GitHub e Vercel. Precisa rodar os gates da constitution (tsc, lint, testes, build) + segurança.

## Opções consideradas
1. **GitHub Actions + SonarCloud (SonarQube gerenciado)** — sem servidor pra manter; integra com PR; free em repo público.
2. **SonarQube self-hosted** — controle total, mas precisa hospedar um servidor (mais ops).
3. Só `npm audit`/scan de segredos — insuficiente pro pedido explícito de SonarQube.

## Decisão
Pipeline no **GitHub Actions**: job de **gates** (typecheck, lint, test, build, validate-state, check-docs) + job de **segurança** (`npm audit` + **SonarCloud** com Quality Gate) + **deploy Vercel** (preview no PR, prod no merge da main). App mobile via **EAS**. SonarQube self-hosted fica como alternativa equivalente se o professor exigir.

## Consequências
- Positivas: cobre os itens 4 e 5 da rubrica; scanner bloqueia merge se o Quality Gate falhar.
- Negativas: SonarCloud é externo (precisa conta/organização + `SONAR_TOKEN`); em repo privado o free é limitado.
- Reavaliar se: exigirem SonarQube self-hosted (trocar o passo Sonar por um servidor próprio, mesmo workflow).
