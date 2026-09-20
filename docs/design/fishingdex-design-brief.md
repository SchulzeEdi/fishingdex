# fishingdex — Brief de Design (para desenvolver o design do app)

> Documento autossuficiente para um designer / IA de design produzir o visual do app.
> Fonte: `spec/design-system.md`, `spec/design-tokens.json` e `spec/prds/PRD-V1-01.md`.
> **Plataforma:** app **mobile React Native + Expo** (iOS + Android), **portrait**, mobile-first.
> **Idiomas:** pt / es / en (textos devem caber nos 3 — o alemão do espanhol/inglês costuma ser +20% mais longo).

---

## 1. O que é o fishingdex
Diário + rede social de pesca esportiva com **coleção de espécies (estilo Pokédex)**, **ranking de maior peixe** e um **marketplace de pesqueiros**. O pescador registra suas capturas (foto, espécie, tamanho, setup usado), **desbloqueia espécies** conforme pesca, compete no ranking, segue outros pescadores e descobre onde pescar. Donos de pesqueiro anunciam seus locais. Tom geral: **outdoor, confiável, premium** — sério como um app pago, sereno como a água, com um ponto de energia (laranja) só na competição.

### Mecânica-âncora: a "Dex" (coleção de espécies)
O nome vem de "pokédex de peixes". As espécies ficam organizadas por **água doce / água salgada** e começam **bloqueadas (silhueta/cadeado)**. Quando o pescador **registra a primeira captura de uma espécie, aquela espécie é desbloqueada** — a silhueta vira a foto/ficha completa. Há **barra de progresso** ("42 de 180 capturadas"), e a Dex é uma tela/aba própria. Isso cria colecionismo e retorno recorrente. (Feature de produto nova — a formalizar no PRD como decisão; ver seção 5-G.)

### Público (personas)
- **Pescador esportivo** (primário): 25–50 anos, fim de semana, já posta capturas em WhatsApp/Instagram, gosta de competir. BR + Argentina + internacional.
- **Dono de pesqueiro** (secundário / B2B): quer ser encontrado e receber contatos de pescadores.

### Modelo de negócio (afeta a UI)
- **Free:** pode postar até **3 capturas/mês**, porém **isolado** — não vê ranking, não vê o feed de ninguém e ninguém o vê. (Tudo social/competitivo aparece **bloqueado** com CTA de assinar.)
- **Pro (assinatura):** tudo liberado — feed, ranking, seguir/curtir, histórico ilimitado, estatísticas, mapa detalhado. Preço US$ 6,99/mês (US$ 49,99/ano) · R$ 19,90/mês (R$ 149/ano).
- **Listagem de pesqueiro (dono):** assinatura B2B US$ 29 / R$ 79 por mês.

---

## 2. Padrão visual do sistema (design system)

### Identidade: "Águas Profundas"
Confiável · outdoor · premium. Azul-petróleo profundo como marca; água/ciano como destaque; **laranja reservado** só ao ranking (maior peixe) e ao CTA de assinar. Modo escuro completo (uso de madrugada/barco à noite e para valorizar a foto do peixe).

### Paleta — tema CLARO (padrão)
| Papel | Hex |
|---|---|
| background | `#F7F5F0` |
| surface (cards) | `#FFFFFF` |
| surface-muted | `#EFEDE6` |
| border | `#E2DFD6` |
| text | `#0B1F24` |
| text-muted | `#5A564C` |
| **primary** (ação/marca) | `#0E4D5C` · texto sobre: `#FFFFFF` |
| **accent** (água/tags) | `#21C0A8` · texto sobre: `#06231E` |
| **highlight** (ranking/CTA assinar) | `#FF7A1A` · texto sobre: `#221200` |
| success / warning / danger | `#16A34A` / `#D97706` / `#DC2626` (texto branco) |

### Paleta — tema ESCURO
| Papel | Hex |
|---|---|
| background | `#071519` |
| surface | `#0E2229` |
| surface-muted | `#13303A` |
| border | `#1E3D47` |
| text / text-muted | `#EAF2F1` / `#9DB3B3` |
| primary | `#2FA6BC` · texto sobre: `#04222A` |
| accent | `#21C0A8` |
| highlight | `#FF8A33` · texto sobre: `#1A0E00` |
| success / warning / danger | `#22C55E` / `#F59E0B` / `#F87171` |

**Regras de cor:** laranja sempre como **fundo com texto escuro** (nunca laranja em texto pequeno sobre claro). Accent só em elementos grandes/ícones. Verde WhatsApp (`#25D366`) é exceção permitida só no botão de contato do pesqueiro.

### Tipografia
- **Títulos / números do ranking:** **Sora** (600–700). Números do ranking com *tabular figures*.
- **Corpo:** **Inter** (400–500).
- **Escala (pt):** xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 · 3xl 30 · 4xl 36 · 5xl 48.

### Espaçamento, raios, sombras
- Espaçamento (base 4): 2 · 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.
- Raios: sm 8 · md 12 · lg 16 · xl 24 · full. Cards/fotos usam lg/xl (moderno, amigável).
- Sombras: sutis, só em elementos flutuantes (card, sheet, FAB, tab bar).

### Estados obrigatórios (todo componente/tela)
`default` · `pressed` (RN não tem hover) · `foco/acessível` · `desabilitado` · `carregando (skeleton)` · `erro` · `vazio`.

---

## 3. Componentes-base (inventário)
Para cada um, entregar variantes + todos os estados acima.
- **Botão:** primário · secundário (contorno) · ghost · destrutivo · **CTA assinar** (laranja) · WhatsApp (verde). Altura 48, raio md.
- **Input / textarea:** label sempre visível, foco (borda primary + halo accent), erro (borda danger + mensagem).
- **Picker de espécie:** campo que abre busca + lista com filtro água doce/salgada.
- **Chips/Tags:** setup (isca/vara/carretilha/linha), espécie, doce/salgada.
- **Card de captura:** foto 4:3, espécie + tamanho, chips de setup, autor (avatar+nome), botão curtir, selo 🔒 privado.
- **Linha de ranking:** posição (número grande tabular), avatar, nome, espécie, tamanho em destaque (laranja), miniatura; top 3 com realce (medalha/cor).
- **Card de pesqueiro:** foto, nome, distância/local, chips de espécies, botão "Falar no WhatsApp".
- **Tab bar inferior** com FAB central de "Registrar".
- **Bottom sheet / Modal** (registrar, filtros, paywall).
- **Toast/Alert** (sucesso/erro/aviso).
- **Avatar, Stat (número + label), Segmented control, Switch, Skeletons, Empty state, Error state, Paywall (conteúdo borrado + CTA).**

---

## 4. Navegação
**Tab bar inferior (5):** `Feed` · `Ranking` · **`＋ Registrar` (FAB central destacado)** · `Dex` (coleção) · `Perfil`. O `Mapa/Pesqueiros` fica como entrada destacada dentro do Feed/Perfil (ou tab alternável) — a Dex ganha lugar de tab por ser a mecânica-âncora.
Fora das tabs: onboarding/auth, fluxo de registrar captura (stack modal), detalhes, ficha de espécie, configurações e paywall.

---

## 5. TODAS as telas (inventário completo do MVP)

### A. Onboarding & Autenticação
1. **Splash** — logo fishingdex, fundo teal, carrega o app.
2. **Seleção de idioma** — pt/es/en (também acessível em Configurações). Detecta idioma do device por padrão.
3. **Onboarding (3 slides)** — proposta de valor: "Registre suas capturas" · "Dispute o ranking do maior peixe" · "Descubra onde pescar". CTA "Começar".
4. **Criar conta** — e-mail+senha, botão Google, botão Apple. Link para termos/privacidade.
5. **Entrar (login)** — e-mail+senha + Google + Apple + "Esqueci a senha".
6. **Recuperar senha** — e-mail → confirmação.

### B. Feed (home)
7. **Feed** — lista de cards de captura (de quem você segue + destaques). Curtir. Pull-to-refresh. Estados: vazio ("siga pescadores ou registre a primeira captura"), carregando (skeletons), erro (sem conexão — app é online).
   - **Free:** feed inteiro **bloqueado** (blur + CTA "Assinar Pro").
8. **Detalhe da captura** — foto grande, espécie, tamanho/peso, data, setup completo (isca/vara/carretilha/linha), local no mapa (se público; se privado, mostra "local privado"), autor (toca → perfil), curtidas.
9. **Perfil de outro pescador** — avatar, nome, país (bandeira), stats (nº capturas, maior peixe, posição no ranking), grade de capturas, botão Seguir/Seguindo.

### C. Registrar captura (fluxo em passos — stack modal)
10. **Passo 1 — Foto** — tirar foto (câmera) ou escolher da galeria; preview + recortar.
11. **Passo 2 — Espécie** — picker com busca e filtro água doce/salgada (catálogo curado).
12. **Passo 3 — Detalhes** — tamanho (obrigatório p/ ranking) e peso (opcionais no geral); data (default hoje); local no mapa com **toggle "local privado"**; setup: isca, vara, carretilha, linha (opcionais).
13. **Sucesso** — "Captura registrada!" + se entrou no ranking, celebração; CTAs "Ver no feed" / "Nova captura".
    - **Free:** contador "X de 3 capturas do mês"; ao esgotar → paywall.

### D. Ranking
14. **Ranking** — top 3 em destaque + lista de linhas. Filtros no topo: **global / por espécie / por período (mês, ano, sempre) / por país**. Critério = tamanho (foto obrigatória comprova).
    - **Free:** ranking **bloqueado** (blur + CTA "Assinar Pro").
15. **Filtros do ranking** (bottom sheet) — seletor de espécie, período, país.

### E. Mapa & Pesqueiros (marketplace)
16. **Mapa** — pins de pesqueiros e de spots públicos de captura. Toque no pin → mini-card.
17. **Lista de pesqueiros** — cards com foto, nome, distância, espécies. Busca/filtro por espécie/estado.
18. **Detalhe do pesqueiro** — galeria, nome, localização no mapa, espécies disponíveis, descrição, **botão "Falar no WhatsApp"** (abre o WhatsApp por fora — sem agendamento interno na V1).
19. **[Dono] Cadastrar/editar pesqueiro** — nome, localização (mapa), espécies, fotos, contato (WhatsApp), descrição.
20. **[Dono] Assinatura da listagem** — plano B2B, preço USD/BRL, checkout, status da listagem (ativa/inativa).

### F. Perfil & Conta
21. **Meu perfil** — avatar, nome, país, stats, minhas capturas (grade), botão editar, atalho para assinatura.
22. **Editar perfil** — foto, nome, país/idioma.
23. **Configurações** — idioma, tema (claro/escuro/sistema), conta, sair, termos/privacidade, versão.
24. **Assinatura / Planos (Paywall principal)** — comparativo **Free × Pro**, preços mensais/anuais em **USD e BRL**, botão "Assinar Pro" (laranja). Restaurar compra (obrigatório nas lojas).
25. **Gerenciar assinatura** — plano atual, renovação, cancelar.

### G. Coleção / Dex (espécies desbloqueáveis) — mecânica-âncora
26. **Dex (coleção)** — grade de espécies separada em **água doce / água salgada** (segmented no topo), com **barra de progresso** ("42 de 180 capturadas"). Cada célula:
    - **Bloqueada:** silhueta escura + cadeado + nome oculto ("???") — espécie ainda não capturada.
    - **Desbloqueada:** foto real + nome; toque abre a ficha.
    Busca e filtros (só desbloqueadas / faltando / por raridade). Header pode celebrar streak/porcentagem.
26b. **Ficha da espécie** — foto grande, nome (pt/es/en + científico), habitat (doce/salgada), raridade, e — se desbloqueada — **sua melhor captura** dessa espécie (tamanho recorde, data do desbloqueio) e atalho "ver minhas capturas desta espécie". Se bloqueada: dica de onde/como pescar.
26c. **Momento de desbloqueio** — ao registrar a 1ª captura de uma espécie nova, tela/overlay de celebração: "Nova espécie desbloqueada! 🎉 Tucunaré-açu" com a arte revelando (silhueta → foto), som/animação, e progresso da Dex atualizado. (Liga com a tela 13 · Sucesso.)

> **Nota de escopo:** a Dex é feature de produto (não só design). Ao retomar o harness, formalizar como decisão no PRD (ex.: D-12 "Coleção de espécies desbloqueáveis / Pokédex") via `sdd-amend`. Definir também: fonte da lista mestra de espécies por região (curadoria), critério de raridade, e se coleção fica no Free ou no Pro.

### H. Telas de sistema / legais
27. **Paywall (modal reutilizável)** — conteúdo borrado + valor do Pro + CTA. Disparado em feed/ranking/limite de captura para Free.
28. **Erro / Sem conexão** — app é online; mensagem clara + "Tentar de novo".
29. **Termos de Uso** e **Política de Privacidade** — exigidos pelas lojas.

---

## 6. Comportamento Free × Pro (resumo p/ o design)
| Área | Free | Pro |
|---|---|---|
| Registrar captura | até 3/mês | ilimitado |
| Ver feed dos outros | ❌ bloqueado (blur + CTA) | ✅ |
| Ranking | ❌ bloqueado | ✅ |
| Seguir / curtir / ser visto | ❌ | ✅ |
| Estatísticas / histórico | limitado | completo |
| Mapa detalhado | limitado | completo |

Desenhar o **estado bloqueado** (paywall) como parte nativa dessas telas, não como erro.

---

## 7. Acessibilidade & i18n (obrigatório)
- Contraste mínimo **AA**; não depender só de cor (ícone + texto em erros/estados).
- Alvos de toque ≥ 44×44 pt; `accessibilityLabel` em tudo que é interativo.
- Suporte a fonte ampliada do sistema sem quebrar layout.
- Textos em **pt/es/en** — prever espaço extra; nada de texto embutido em imagem.
- Bandeiras/país no ranking e perfil (3 mercados).

## 8. O que entregar (pedido ao designer/IA de design)
1. **Style guide** aplicando os tokens acima (cores, tipografia, espaçamento, componentes com estados) nos 2 temas.
2. **Telas de alta fidelidade** de todas as telas listadas na seção 5, em **light e dark** (ao menos das principais: Feed, Detalhe da captura, os 3 passos de Registrar, **Dex/coleção + ficha de espécie + momento de desbloqueio**, Ranking, Detalhe do pesqueiro, Perfil, Paywall).
3. **Estados** de cada tela: vazio, carregando (skeleton), erro e — quando aplicável — **bloqueado (Free/paywall)**.
4. Protótipo navegável seguindo a tab bar da seção 4.
5. Formato: mobile portrait (ex.: 390×844). Entregar como telas independentes e um fluxo conectado.

> Regra de ouro: **laranja só em ranking e "Assinar Pro"**. Tudo mais respira teal/água + neutros areia. Foto do peixe é a estrela — deixe as fotos grandes e o resto discreto.
