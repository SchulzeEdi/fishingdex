# 03 — Design System: fishingdex

> Fonte de verdade de UX/UI. Toda UI (React Native) consulta este arquivo + `design-tokens.json`.
> Direcao aprovada: **Aguas Profundas** · Temas: **claro (padrao) + escuro**.

## Identidade
- **Personalidade/tom:** confiavel · outdoor · premium. Sereno como a agua, sério como um app pago — com um ponto de energia (laranja) reservado à emoção da competição (maior peixe).
- **Justificativa:** o ICP (pescador esportivo que já paga por apps tipo Fishbrain) responde a algo que pareça robusto e de qualidade, não um app de template. O teal profundo evoca água/profundidade e transmite confiança; o laranja aparece só onde importa competir (ranking, CTA de assinar), criando hierarquia emocional. Modo escuro atende o uso real (madrugada, barco à noite) e valoriza a foto do peixe.
- **Referencias visuais:** Fishbrain (categoria), Strava (competição/ranking com identidade forte), apps outdoor premium (paleta natural + tipografia confiante).

## Paleta de cores
Marca: **primary `#0E4D5C`** (teal profundo), **accent `#21C0A8`** (água/ciano), **highlight `#FF7A1A`** (laranja — reservado a ranking/CTA). Neutros quentes (areia) `neutral-50..900`. Status: success `#16A34A`, warning `#D97706`, danger `#DC2626`. Ver `design-tokens.json` para os valores por tema (light/dark).

| Token (semantico) | Light | Dark | Uso |
|---|---|---|---|
| background | #F7F5F0 | #071519 | fundo da tela |
| surface | #FFFFFF | #0E2229 | cards, sheets |
| border | #E2DFD6 | #1E3D47 | divisórias, contorno de input |
| text / text-muted | #0B1F24 / #5A564C | #EAF2F1 / #9DB3B3 | texto principal / secundário |
| primary (+fg) | #0E4D5C / #FFF | #2FA6BC / #04222A | ação principal, marca |
| accent (+fg) | #21C0A8 / #06231E | #21C0A8 / #04221D | destaque secundário, tags água |
| highlight (+fg) | #FF7A1A / #221200 | #FF8A33 / #1A0E00 | ranking (maior peixe), CTA de assinatura |

**Justificativa da paleta / contraste:** texto ink `#0B1F24` sobre `#F7F5F0` ≈ 15:1 (AAA). Branco sobre primary `#0E4D5C` ≈ 8.2:1 (AAA). No dark, `#EAF2F1` sobre `#071519` ≈ 15:1. O **laranja é usado como fundo com texto escuro** (`highlight-foreground`), nunca laranja sobre branco em textos pequenos (contraste insuficiente). Accent (`#21C0A8`) só em elementos grandes/ícones, não em texto pequeno sobre claro.

## Tipografia
- **Display/headings:** **Sora** — geométrica, confiante e moderna sem ser fria; ótima em números grandes do ranking (usar *tabular figures* para alinhar tamanhos/pesos).
- **Corpo:** **Inter** — altíssima legibilidade em telas pequenas e em 3 idiomas (pt/es/en), incluindo acentuação.
- Carregamento no Expo via `@expo-google-fonts/sora` e `@expo-google-fonts/inter`.
- **Escala:** xs 12 / sm 14 / base 16 / lg 18 / xl 20 / 2xl 24 / 3xl 30 / 4xl 36 / **5xl 48** (número do ranking / peso do peixe em destaque).
- **Pesos:** regular 400 / medium 500 / semibold 600 / bold 700. Headings em Sora 600–700; corpo Inter 400–500.

## Espacamento, raios e sombras
- **Espacamento:** 2, 4, 8, 12, 16, 24, 32, 48, 64 (base 4).
- **Raios:** sm 8 / md 12 / lg 16 / xl 24 / full 9999. Cards e imagens de captura usam lg/xl (visual moderno, amigável).
- **Sombras:** sm / md / lg (ver tokens; no Android mapear para `elevation`). Usar com parcimônia — sombra só em surfaces flutuantes (card, sheet, FAB).

## Componentes (especificacao + estados)
Estados obrigatórios em cada interativo: **default, pressed (RN não tem hover), foco/acessibilidade, desabilitado, carregando, erro**.

- **Botao** (altura 48, raio md, padding-x 16, label Sora 600):
  - *primário:* fundo primary, texto primary-foreground. Pressed: escurece 8%. Disabled: neutral-300/neutral-500. Loading: spinner + label esmaecido, botão não clicável.
  - *secundário:* contorno border, texto text, fundo surface.
  - *ghost:* sem fundo/contorno, texto primary.
  - *destrutivo:* fundo danger, texto branco.
  - *CTA de assinatura:* fundo highlight, texto highlight-foreground (uso exclusivo do paywall/rank).
- **Input / textarea / picker de espécie** (altura 48, raio md, borda border):
  - foco: borda primary + halo accent 2px. erro: borda danger + mensagem danger abaixo (sm). disabled: fundo surface-muted. Com label sempre visível e placeholder de apoio.
- **Card de captura:** foto (raio lg, aspect 4:3), espécie + tamanho (Sora), chips de setup (isca/vara), autor (avatar + nome), botão curtir. Selo "🔒 privado" quando local privado.
- **Linha de ranking:** posição (número Sora 4xl/5xl, tabular), avatar, nome, espécie, **tamanho em destaque** (highlight), miniatura da foto. Top 3 com realce.
- **Card de pesqueiro (marketplace):** foto, nome, distância/local no mapa, chips de espécies, botão **"Falar no WhatsApp"** (verde WhatsApp como exceção pontual à paleta, permitido por convenção de marca externa).
- **Navegacao:** tab bar inferior (Feed, Ranking, Registrar [FAB central destacado], Mapa/Pesqueiros, Perfil). Ícone ativo em primary.
- **Modal / bottom sheet:** para registrar captura e paywall. Sheet com raio xl no topo.
- **Toast/Alert:** sucesso/erro/aviso usando status tokens; texto on-status.
- **Estados de tela obrigatorios:**
  - *vazio:* ilustração + frase + CTA (ex.: "Nenhuma captura ainda — registre a primeira 🎣").
  - *carregando:* skeletons (cards/linhas), nunca spinner solto em tela cheia quando há layout previsível.
  - *erro:* mensagem clara + botão "Tentar de novo".
  - *paywall (Free):* estado bloqueado com blur no conteúdo + CTA highlight "Assinar Pro".

## Micro-interacoes
- Transições 150–250ms, easing suave. Feedback de toque (opacity/scale 0.98) em botões e cards. "Curtir" com micro-animação. Skeleton shimmer no carregamento. Confete discreto ao entrar no top do ranking.

## Acessibilidade
- [x] Contraste mínimo AA (validado nas combinações principais acima).
- [x] `accessibilityLabel`/`accessibilityRole` em todos os interativos (RN).
- [x] Alvos de toque ≥ 44×44 pt.
- [x] Labels/mensagens de erro em formulários; não depender só de cor (ícone + texto).
- [x] Suporte a fonte ampliada do sistema (Dynamic Type) sem quebrar layout.

## Onde isto vive
- Tokens -> `spec/design-tokens.json` -> tema **NativeWind** (Tailwind p/ React Native) + um `theme.ts` em `src/shared/ui/`.
- Componentes -> UI kit próprio em React Native, em `src/shared/ui/` (FSD, camada shared).
- Catálogo visual navegável -> Storybook (`.storybook/`) com React Native / RN Web.

---
**Gate:**
- [x] Paleta + tipografia definidas e justificadas
- [x] Botoes e inputs com todos os estados (incl. erro/vazio/carregando)
- [x] Tokens consistentes com `design-tokens.json`
- [x] Acessibilidade verificada (contraste AA)
