# Button

Botão de ação com altura `control-height`, raio `radius-md` e rótulo em Sora 600.

- **Variantes:** `fd-btn-primary` (uma por tela), `fd-btn-secondary` (contorno `border-strong`), `fd-btn-ghost` (ação de baixa ênfase), `fd-btn-danger` (excluir), `fd-btn-pro` (só "Assinar Pro"), `fd-btn-whatsapp` (só contato de pesqueiro).
- **Estados:** pressed (`is-pressed` / `:active`, escurece 8%), `disabled`, `is-loading` (spinner, mantém a largura), foco com anel `primary`.
- O consumidor fornece o rótulo (verbo primeiro, sentence case) e, opcional, um ícone de 18px antes dele. `fd-btn-block` ocupa a largura do container.
- Não use `fd-btn-pro` para outra ação: o laranja é reservado.
