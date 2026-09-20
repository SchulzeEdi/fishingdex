# Arquitetura do projeto — Feature-Sliced Design (FSD)

> **Este documento é a fonte da verdade da arquitetura do `fishingdex` e SOBRESCREVE o
> default "Modular Monolith" do harness SDD** (`reference/architecture-patterns.md` e
> `reference/scaffolds/modules/module-structure.md`). Onde o harness disser
> `src/modules/ + src/shared/ + src/app/`, vale o que está aqui.

O `fishingdex` é organizado **inteiro em Feature-Sliced Design**: o código é fatiado por
domínio/feature (vertical), não por camada técnica (horizontal). Nada de `components/`,
`services/`, `hooks/` globais como organização primária.

---

## 1. Camadas (layers)

Da mais alta (mais específica do app) para a mais baixa (mais reutilizável):

| Camada      | Papel                                                                                   |
|-------------|-----------------------------------------------------------------------------------------|
| `app`       | Inicialização: providers, estilos globais, config de router, wrappers globais.          |
| `pages`     | Composição de telas inteiras a partir de widgets/features/entities.                     |
| `widgets`   | Blocos de UI compostos e autossuficientes (ex.: header, card-de-peixe com ações).       |
| `features`  | Uma ação do usuário que entrega valor (ex.: `catch-fish`, `filter-dex`, `auth-login`).  |
| `entities`  | Entidades de negócio e suas regras (ex.: `fish`, `user`, `catch`, `tenant`).            |
| `shared`    | Reutilizável e SEM regra de negócio: UI kit, db client, config, libs, tipos base.       |

> **Nomes de FSD com Expo Router:** a camada FSD `pages` tem papel de composição de telas.
> Para não confundir com o roteamento por arquivos do Expo, chamamos essa camada de
> `views/`. A pasta `app/` do Expo Router é reservada ao roteamento (ver seção 5).

## 2. Slices (fatias)

Dentro de cada camada (menos `app` e `shared`), o código é dividido em **slices por
domínio**. Ex.: `entities/fish`, `features/catch-fish`, `widgets/dex-grid`.

- Uma slice é dona do seu pedaço do produto.
- **Slices na mesma camada NÃO importam uma da outra diretamente** (baixo acoplamento). Se
  precisam se relacionar, a composição sobe uma camada (ex.: um `widget` combina duas
  `features`).

## 3. Segmentos (segments)

Dentro de cada slice, o código é dividido por propósito técnico:

```
features/catch-fish/
├── ui/         # componentes React da feature
├── model/      # estado, stores, lógica de domínio, tipos da slice
├── api/        # chamadas de servidor / server actions / route handlers desta slice
├── lib/        # helpers internos da slice
├── config/     # constantes, flags
└── index.ts    # API PÚBLICA da slice (o único ponto de import externo)
```

Nem toda slice usa todos os segmentos. `index.ts` é obrigatório: expõe só o que é público.

## 4. Regra de import (a lei do FSD)

1. **Só se importa de camadas ESTRITAMENTE ABAIXO.** `features` pode usar `entities` e
   `shared`; `entities` só usa `shared`; `shared` não importa ninguém acima.
2. **Só se importa pela API pública da slice** (`index.ts`). Nunca `import` de um arquivo
   interno de outra slice (`features/x/model/foo.ts` a partir de fora é proibido).
3. `app` e `shared` não têm slices; são acessíveis conforme a regra de camadas.

> Enforce com `eslint` (`@feature-sliced/eslint-config` ou `eslint-plugin-boundaries`).
> Violação de fronteira = lint quebrado = gate reprovado.

## 5. Encaixe no stack do projeto (React Native + Expo + backend)

Ver **CHG-001**: a UI é um app **React Native + Expo** (Expo Router); o **backend/API** é
um serviço separado (Vercel + Postgres gerenciado). Há, portanto, dois deploys, mas a
organização FSD vale para os dois (o backend também é fatiado por slice).

**App (Expo):**
- **Roteamento (Expo Router):** a pasta `app/` do Expo fica **fina** e serve só de
  roteamento — cada rota (`app/(tabs)/dex.tsx`, etc.) apenas monta uma slice de `views/`
  (a camada FSD de composição de telas).
- **Inicialização FSD** (providers, tema, i18n, config de navegação) vive em
  `src/app-init/`, consumida pelo layout raiz do Expo Router (`app/_layout.tsx`).
- **UI:** componentes React Native nos segmentos `ui/` das slices. UI kit compartilhado
  (botões, inputs, tokens) em `shared/ui/`.
- **Acesso a dados:** o segmento `api/` de cada slice fala com o backend via um client
  tipado em `shared/api/` (fetch/react-query). Nada de SQL no app.

**Backend/API (Vercel):**
- Endpoints agrupados por slice de domínio (`features/catch-fish/api/`,
  `entities/fish/api/`), não numa pasta `api/` técnica global.
- **Banco:** db client, migrations e schema base em `shared/db/`. Cada entidade declara
  seu schema/repos no segmento `model/`+`api/` da slice `entities/<x>`.
- **Escopo/privacidade:** o repositório aplica o escopo do dono (dados públicos vs
  privados; lagoa privada não expõe localização exata). Teste de isolamento por entidade.

### Layout de pastas resultante

**App (repo/pasta do Expo):**
```
app/                # SÓ Expo Router — telas finas que montam views/ (+ _layout.tsx)
src/
├── app-init/       # camada FSD "app": providers, tema, i18n, navegação
├── views/          # camada FSD "pages": composição de telas
├── widgets/        # blocos compostos (RN)
├── features/       # ações do usuário (ui/model/api/lib/config + index.ts por slice)
├── entities/       # entidades de negócio (fish, catch, user, angling-spot)
└── shared/         # ui kit RN, api client, config, libs, i18n, tipos base
```

**Backend/API (Vercel):**
```
src/
├── features/       # endpoints por caso de uso (api/model/lib + index.ts)
├── entities/       # schema + repos por entidade
└── shared/         # db client, config, validação (Zod), tipos base
```

## 6. Como cada fase do harness aplica FSD

- **Constitution (Fase 1):** registrar "Arquitetura: Feature-Sliced Design" como regra
  inegociável, citando este doc. Lint de fronteiras é gate.
- **Architect (Fase 4):** `spec/architecture.md` descreve as slices por camada e o mapa de
  dependências, não módulos. ADR "Adotar FSD em vez de Modular Monolith" registrado.
- **Tasks (Fase 6) / Implement:** a ordem "Banco → Backend → Frontend" acontece DENTRO da
  slice — `shared/db` + `entities/*/model` → `features/*/api` → `features/*/ui` + `views`.
  Uma fatia vertical do harness = uma slice FSD.
- **Review:** além dos gates padrão, reprovar import que viole a regra de camadas/slices.

## 7. Referências

- Feature-Sliced Design oficial: https://feature-sliced.design
