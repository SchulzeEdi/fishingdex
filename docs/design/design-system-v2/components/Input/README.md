# Input

Campo de formulário com label sempre visível.

- Altura `control-height`, borda `border-strong`, fundo `surface`. Pode ter ícone à esquerda (busca) e unidade à direita (`cm`, `kg`).
- Foco: borda `primary` + halo `accent`. Erro: borda `danger` + mensagem com ícone `alert` (nunca só a cor). Desabilitado: `surface-muted`.
- O consumidor fornece label, valor, unidade, ajuda e mensagem de erro (ex.: tamanho acima de `maxPlausibleSizeCm`).
