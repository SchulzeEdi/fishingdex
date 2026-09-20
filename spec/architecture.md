# 04 — Architecture: fishingdex

> O COMO técnico. **Desvia do default do harness** (modular monolith + AWS + multi-tenant):
> aqui é **app Expo + backend Vercel + Supabase**, organizado em **Feature-Sliced Design**,
> e **B2C (não multi-tenant)**. Ver ADRs 0001–0006.

## Visão de componentes
```
┌────────────────────────────┐        ┌─────────────────────────────┐
│  App mobile (Expo / RN)     │  HTTPS │  Backend/API (Vercel)       │
│  Expo Router + FSD          │ ─────► │  Route Handlers (FSD slices)│
│  shared/api (react-query)   │        │  Zod nas bordas             │
└──────────┬─────────────────┘        └───────────┬─────────────────┘
           │ IAP (RevenueCat)                       │ Drizzle
           ▼                                        ▼
   App Store / Play (Pro)              ┌─────────────────────────────┐
                                       │ Supabase                    │
   Stripe (listagem pesqueiro)        │  Postgres + Auth + Storage  │
           ▲                           │  RLS por dono               │
           └───────────────────────────┴─────────────────────────────┘
```
- **App:** React Native/Expo, Expo Router (roteamento fino), UI em FSD (`views/widgets/features/entities/shared`).
- **Backend:** Route Handlers no Vercel, também em FSD (endpoints por slice de domínio), validação Zod, ORM Drizzle.
- **Dados:** Supabase (Postgres gerenciado + Auth + Storage de fotos). RLS por dono.
- **Pagamentos:** IAP (Apple/Google via RevenueCat) para a assinatura Pro; Stripe para a listagem B2B de pesqueiro (ADR-0004).

## Domínio (fronteiras FSD — não módulos)
Slices por entidade/feature, não `modules/`:
- `entities/`: `user`, `fish-species`, `catch`, `dex`, `fishery`, `subscription`.
- `features/`: `auth`, `register-catch`, `feed`, `like-follow`, `ranking`, `dex-collection`, `fishery-listing`, `subscribe-pro`.
- `shared/`: `db` (Drizzle client + schema base), `api` (client tipado / react-query no app), `ui` (design system), `config`, `i18n`, `validation` (Zod).

## Modelo de dados
| Entidade | Campos-chave | Relações | Dono/escopo |
|---|---|---|---|
| `users` | id, name, avatar_url, country, plan(free/pro) | 1-N catches, follows | próprio |
| `fish_species` | id, name_pt/es/en, scientific, habitat, rarity, **regions[]**, **max_plausible_size_cm**, **max_plausible_weight_kg** | 1-N catches | público (curado, regionalizado) |
| `catches` | id, **user_id**, **species_id**, photo_url, size_cm, weight_kg, caught_at, **geom (PostGIS Point)**, is_private, bait, rod, reel, line | N-1 user, N-1 species | dono (user_id) + visibilidade |
| `reports` | id, reporter_id, catch_id, reason, created_at | N-1 catch | moderação da comunidade |
| `dex_unlocks` | id, **user_id**, **species_id**, first_catch_id, unlocked_at | única por (user, species) | dono |
| `follows` | follower_id, followee_id | grafo social | próprio |
| `likes` | user_id, catch_id | N-N | próprio |
| `fisheries` | id, **owner_id**, name, **geom (PostGIS Point)**, species[], photos[], whatsapp, description, listing_active | N-1 owner | dono |
| `subscriptions` | id, user_id, plan, provider(iap/stripe), status, current_period_end | 1-1 user | dono |

- **Índices:** `catches(user_id)`, `catches(species_id)`, `catches(size_cm desc)` p/ ranking, `catches(caught_at)`; `dex_unlocks(user_id, species_id)` único; `follows(follower_id)`, `likes(catch_id)`; **índice GiST (PostGIS)** em `fisheries.geom` e `catches.geom` p/ queries de raio.
- **PostGIS (ADR-0007):** extensão ligada no dia 1. Locais como `geometry(Point,4326)`; "pesqueiros num raio de X km" via `ST_DWithin`, ordenação por `ST_Distance`. Evita full-scan e cálculo de distância na aplicação.
- **Anti "mentira de pescador" (D-13):** cada espécie tem `max_plausible_size_cm`/`max_plausible_weight_kg`; o registro valida contra esses tetos (`features/register-catch` → `isPlausibleCatch`) antes de entrar no ranking. Defesa complementar: **denúncia da comunidade** (`reports`) — captura muito denunciada é ocultada/revisada.
- **Catálogo regionalizado (D-14):** `fish_species.regions[]` filtra o seed por mercado (BR/AR/US) — o usuário não rola 800 nomes; `entities/fish-species` expõe `speciesForRegion`.
- **Dex:** desbloqueio = existir linha em `dex_unlocks` para (user, species); criada na 1ª captura daquela espécie (trigger/transação no `register-catch`). Progresso = count(dex_unlocks) / count(fish_species por habitat).
- **Multi-tenancy:** **não se aplica** — produto B2C, sem `tenant_id`. Isolamento é **por dono (`user_id`/`owner_id`) + visibilidade** (público/privado; Free não vê social). Defesa em profundidade via **RLS do Supabase** por `auth.uid()` (ADR-0005).

## Contratos de API (principais)
- `POST /catches` (auth) — cria captura; retorna captura + `dexUnlocked?: species`.
- `GET /feed?cursor=` (auth, Pro) — feed paginado de quem sigo + destaques.
- `GET /ranking?scope=global|species|period|country&...` (auth, Pro) — ranking por tamanho.
- `GET /dex` (auth) — grade de espécies com flag unlocked; `GET /species/:id`.
- `POST /follows`, `DELETE /follows/:id`, `POST /likes`, `DELETE /likes/:id` (auth, Pro).
- `GET /fisheries?lat=&lng=&radiusKm=` (PostGIS `ST_DWithin`), `GET /fisheries/:id`; `POST/PUT /fisheries` (dono).
- `POST /catches/:id/reports` (auth) — denunciar captura (moderação da comunidade).
- `POST /subscriptions/webhook` — RevenueCat (Pro) e Stripe (listagem). Idempotente.
Auth: JWT do Supabase Auth no header; Zod valida todo payload.

## Infra / ambientes (profile.cloud = none → Vercel + Supabase, ver ADR-0001)
- **Backend/API:** Vercel (preview por PR + produção).
- **Banco/Auth/Storage:** Supabase (projeto prod + branch/preview).
- **App:** EAS build — canal `preview` (TestFlight / Play Internal) + `production` (lojas).
- **Ambientes:** local (Supabase local ou Docker Postgres + API `vercel dev`) → preview (Vercel + Supabase branch) → produção. Config por env vars; segredos no Vercel/EAS, nunca no repo.
- **CI/CD:** GitHub Actions (gates + **SonarCloud** como scanner de segurança) → deploy Vercel; EAS para o app (ADR-0006).

## Escala — "o que quebra com 10x usuários?"
- **Conexões de banco** (serverless no Vercel abre muitas): usar o **connection pooler do Supabase (Supavisor/pgBouncer)** em modo transaction. Gargalo #1.
- **Fotos** (upload/serve pesado): Supabase Storage + CDN; comprimir no app antes do upload; limitar resolução.
- **Ranking**: evitar `ORDER BY size_cm` full-scan a cada request — índice + paginação; se crescer, **denormalizar** recorde por (user, espécie, período) numa tabela de ranking materializada.
- **Feed**: paginação por cursor; fan-out on read com índices em `follows`/`catches`.
- **Custo de IA:** N/A na V1 (identificação é manual — D-2). Quando entrar, cache + rate limit.

## ADRs relacionados
- ADR-0001 — Hospedagem: Vercel + Supabase (não AWS)
- ADR-0002 — ORM: Drizzle
- ADR-0003 — Auth: Supabase Auth (e-mail + Google + Apple)
- ADR-0004 — Pagamentos: IAP (RevenueCat) para Pro + Stripe para listagem
- ADR-0005 — B2C sem multi-tenant; isolamento por dono + RLS
- ADR-0006 — CI/CD: GitHub Actions + SonarCloud + Vercel/EAS
- ADR-0007 — PostGIS para dados espaciais (pesqueiros/locais por raio)

---
**Gate:**
- [x] Cada decisão não-trivial tem ADR (0001–0006)
- [x] Responde "o que quebra com 10x?" (pooler de conexões, fotos/CDN, ranking materializado)
- [x] Infra + ambientes definidos via mesma config (Vercel+Supabase; 3 ambientes) — AWS não se aplica (ADR-0001)
- [x] Modelo de dados com isolamento definido (por dono + RLS; não multi-tenant, ADR-0005)
