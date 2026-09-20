# fishingdex

## Arquitetura — OVERRIDE do harness SDD (obrigatório)

**Stack (ver CHG-001):** app em **React Native + Expo** (Expo Router) publicado nas lojas;
backend/API separado em **Vercel + Postgres gerenciado** (Supabase/Neon). App trilíngue
(pt/es/en) desde a V1.

Este projeto usa **Feature-Sliced Design (FSD)** em TODO o código (app e backend). Isto
**sobrescreve** o default "Modular Monolith" do harness SDD (`sdd-architect` /
`reference/architecture-patterns.md` / `scaffolds/modules/module-structure.md`).

**Regra para qualquer skill do harness (constitution, architect, tasks, implement, review)
e para qualquer código gerado:** onde o harness mandaria criar `src/modules/ + src/shared/
+ src/app/` (modular monolith), use FSD. Consulte sempre `docs/architecture/feature-sliced-design.md`
como fonte da verdade antes de decidir estrutura de pastas ou onde um arquivo mora.

Resumo do contrato (detalhe completo no doc acima):

- **Camadas** (alta→baixa): `app-init` → `views` → `widgets` → `features` → `entities` → `shared`.
  (A pasta `app/` do Expo Router é reservada ao roteamento e fica fina.)
- **Slices por domínio** dentro de cada camada; slices da mesma camada não se importam.
- **Segmentos** por slice: `ui/ model/ api/ lib/ config/` + `index.ts` (API pública).
- **Import só de camadas abaixo e só via `index.ts`** da slice. Violação de fronteira =
  lint quebrado = gate reprovado (ESLint boundaries).
- **Uma fatia vertical do harness = uma slice FSD.** A ordem Banco→Backend→Frontend
  acontece dentro da slice.

Multi-tenancy, RLS, testes de isolamento, ADRs e demais gates do harness continuam valendo.
