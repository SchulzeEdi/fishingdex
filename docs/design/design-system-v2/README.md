fishingdex é a Pokédex do pescador esportivo: diário de capturas, coleção de espécies desbloqueáveis, ranking do maior peixe. Direção visual **Águas Profundas** — confiável, outdoor, premium. Sereno como a água; a energia (laranja) aparece só onde há competição. **A foto do peixe é a estrela**: tudo ao redor é discreto.

App mobile React Native + Expo, portrait, temas `light` (padrão) e `dark`, em pt / es / en.

## Princípios

1. **A foto manda.** Cards e fichas dão a maior área à foto (4:3 no feed, 1:1 na Dex). Texto e controles ficam em neutros (`text`, `text-muted`, `surface`).
2. **Laranja é prêmio.** `highlight` só no ranking e no botão "Assinar Pro". Se um laranja aparece em outro lugar, está errado.
3. **Colecionar dá vontade de voltar.** A Dex sempre mostra número (`Nº 012`), raridade e progresso; o bloqueado é um mistério (silhueta + `???`), não um erro.
4. **Bloqueado é estado nativo.** Para o plano Free, feed e ranking aparecem desfocados atrás do `Paywall` — nunca uma tela vazia com um botão solto.

## Conteúdo e voz

- Fale como pescador para pescador: direto, sem jargão técnico, em "você". "Registre a primeira captura", não "Adicione um novo registro".
- Frases curtas, sentence case: "Assinar Pro", "Tentar de novo", "Ver ficha". Sem ponto de exclamação, exceto na celebração de desbloqueio ("Nova espécie desbloqueada!").
- Medidas sempre com espaço e unidade: `62 cm`, `3,4 kg` (vírgula decimal em pt/es; ponto em en).
- Todo texto cabe nos 3 idiomas: reserve +30% de largura para es/en.
- **Sem emoji na interface.** Emoji renderiza diferente em cada sistema (bandeiras viram "BR" no Windows, peixe muda de cor no Android) e não aceita a cor do tema. Use os ícones de `assets/Icons` e o selo `fd-flag` para país.

## Cor

- Fundo de tela `background`; cards, sheets, inputs e tab bar em `surface`; áreas de foto ausente, chips e células bloqueadas em `surface-muted`.
- Texto em `text`; metadado em `text-muted`. Ambos passam AA em `background`, `surface` e `surface-muted` nos dois temas.
- Ação principal em `primary` com `primary-foreground`. No máximo **um** botão primário por tela.
- `highlight` só como **fundo** (com `highlight-foreground`): CTA de assinatura e bloco do 1º lugar. Para laranja em texto (tamanho no ranking) use `highlight-ink` — `highlight` como texto no tema claro dá 2,4:1.
- `accent` (água) em preenchimentos, halos e ícones grandes; como texto pequeno use `accent-ink`.
- Contorno de controle (input, botão secundário, filtro) em `border-strong` (≥3:1). `border` é só divisória decorativa.
- Raridade: `rarity-common`, `rarity-uncommon`, `rarity-rare`, `rarity-legendary` — sempre com pips (1 a 4) e o nome, nunca só a cor.
- Status (`success`, `warning`, `danger`) sempre com ícone + texto. Branco sobre `success`/`warning` só em texto ≥18px bold.
- `whatsapp` exclusivamente no botão "Falar no WhatsApp" do pesqueiro.

## Tipografia

- Duas famílias, carregadas no Expo com `@expo-google-fonts/sora` e `@expo-google-fonts/inter`: **Sora** (`display`) para títulos, números e botões; **Inter** (`body`) para todo o resto. Sem elas carregadas o app cai na fonte do sistema e perde a identidade.
- Um `title` por tela (Feed, Ranking, Coleção, Perfil), com subtítulo em `label` + `text-muted`.
- Números que se comparam (tamanho, posição, contagem da Dex) usam tabular figures: `fontVariant: ['tabular-nums']` / `.fd-num`.
- `display` (48px) só para o número herói: recorde, % da Dex, momento de desbloqueio.

## Espaço, raio, sombra, layout

- Base 4: margem lateral da tela `space-lg`; gap entre cards e células `space-md`; entre seções `space-xl`.
- Raio: cards e células da Dex `radius-lg`; botões, inputs e foto interna `radius-md`; chips `radius-sm`; avatar, selos, segmented e FAB `radius-full`; topo de sheet `radius-xl`.
- Prefira `border` a sombra em cards de lista. Sombra só no que flutua: `shadow-md` na tab bar, `shadow-lg` no FAB, sheet e toast.
- Alvos de toque ≥ `touch-min`; botões e inputs com altura `control-height`.
- No web e tablet a coluna tem no máximo `content-max` (480px), centralizada. Nunca estique cards até a largura da janela.
- Dex em grade de 3 colunas no celular (2 só com fonte ampliada).

## Iconografia

- Conjunto próprio em `assets/Icons`: traço 1,75 em grade 24px, cantos e pontas arredondados. Tamanhos 24 (tab bar, ações), 18 (dentro de botão), 14 (dentro de chip).
- Os SVGs têm tinta `#0b1f24` (o `text` do tema claro). No app, renderize com `react-native-svg` trocando o `stroke` pela cor do tema; nos previews deste sistema a classe `fd-icon fd-i-<nome>` herda a cor do texto.
- Tab bar: `feed` (Feed), `trophy` (Ranking), `plus` no FAB (Registrar), `fish` (Dex), `user` (Perfil). Ícone ativo em `primary`.
- `fish-silhouette` é a forma da célula bloqueada da Dex e do placeholder de foto — não é ícone de ação.
- Sem logo ainda: escreva **fishingdex** em Sora 700, minúsculo.

## Estados

Todo interativo tem `default`, `pressed` (escurece 8% — RN não tem hover), foco (anel 2px `primary`, afastado 2px; ≥3:1 em todo fundo), `disabled` (`neutral-300` / `neutral-600`) e `loading` (spinner no lugar do rótulo, largura preservada).

Toda tela tem: carregando (`Skeleton` com o layout real, nunca spinner em tela cheia), vazio (`EmptyState` com ação), erro (`EmptyState` de sem conexão + "Tentar de novo") e, para Free, bloqueado (`Paywall`).

## Free × Pro na interface

- Free: selo `fd-badge-free`, contador de capturas (`fd-quota`, 3 por mês), feed e ranking atrás do `Paywall`.
- Pro: selo `fd-badge-pro` com estrela; nada bloqueado.
- O CTA é sempre "Assinar Pro" em `fd-btn-pro`, com preço logo abaixo e "Restaurar compra" (obrigatório nas lojas).

## Movimento

150–250ms, ease-out. Toque: opacidade/escala 0,98. Curtir: o coração preenche com um pulso. Desbloqueio de espécie: a silhueta revela a foto. Respeite "reduzir movimento" do sistema.
