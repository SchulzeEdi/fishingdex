# SegmentedControl

Alternância entre 2–4 visões da mesma lista: água doce / salgada na Dex, período no ranking.

- Trilho `surface-muted`, opção ativa em `primary` com `primary-foreground`.
- Cada opção pode levar ícone de 18px e um contador tabular (`fd-seg-count`) — substitui os emojis 🐟/🌊 atuais.
- Use `role="tablist"`/`tab` e `aria-selected`. Mais de 4 opções: use `fd-chip-filter`.
