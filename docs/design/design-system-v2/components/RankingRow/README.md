# RankingRow

Ranking do maior peixe: pódio dos 3 primeiros + linhas a partir do 4º.

- Pódio: bloco do 1º em `highlight` com número `highlight-foreground`; 2º e 3º em `surface-muted`. Tamanhos em Sora tabular.
- Linha: posição, miniatura da foto (`fd-thumb`), nome + `fd-flag`, espécie, tamanho em `highlight-ink` (não `highlight`: 2,4:1 no claro).
- A posição do usuário fica fixa no fim da lista com `is-me` (contorno `primary`).
- O consumidor fornece a lista já ordenada e o id do usuário atual.
