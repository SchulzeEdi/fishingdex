# CatchCard

Card de captura do feed: autor, foto 4:3, espécie + tamanho, setup, curtir.

- O consumidor fornece: avatar/nome/país do autor, tempo e local (ou nada se privado), foto, espécie, tamanho em cm, chips de setup, contagem de curtidas e se o usuário já curtiu.
- A foto vai de borda a borda (sem padding), para dar escala ao peixe; `fd-photo-tag` marca destaque de ranking sobre a foto.
- Tamanho em Sora tabular no mesmo nível do nome da espécie. Curtir usa `heart` → `heart-fill` em `danger`.
- Local privado: chip com `lock`, e nunca mostrar o lugar.
