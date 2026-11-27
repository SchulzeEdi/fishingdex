# Ficha da loja (Google Play) — textos

Pronto para colar no Play Console › Presença na loja › Ficha principal. Idioma padrão:
**português (Brasil)**; adicionar traduções **es-419** e **en-US**.

Limites da Play: título ≤ 30 caracteres · descrição curta ≤ 80 · descrição completa ≤ 4000.

## pt-BR

**Título:** fishingdex: diário de pesca

**Descrição curta:** Registre capturas, colecione espécies e dispute o ranking do maior peixe.

**Descrição completa:**

O fishingdex é a Pokédex do pescador esportivo.

Registre cada captura com foto, espécie e tamanho e monte o seu diário de pesca. Cada espécie
nova que você pega é desbloqueada na sua Coleção — com número, raridade e progresso. As que
faltam aparecem como silhueta misteriosa, esperando a próxima pescaria.

• Diário de capturas: foto, espécie, tamanho, peso, isca e local
• Coleção de espécies (Dex) de água doce e salgada, com o catálogo da sua região
• Raridade: comum, incomum, rara e lendária
• Ranking do maior peixe por mês, ano ou de todos os tempos, por país
• Feed das capturas da comunidade
• Local privado: ninguém vê onde foi a pescaria
• Anti "mentira de pescador": tamanhos acima do plausível para a espécie não passam
• Em português, espanhol e inglês, com tema claro e escuro

Plano Free: 3 capturas por mês. Plano Pro: capturas ilimitadas, feed e ranking.

## es-419

**Título:** fishingdex: diario de pesca

**Descripción breve:** Registra capturas, colecciona especies y pelea el ranking del pez más grande.

**Descripción completa:**

fishingdex es la Pokédex del pescador deportivo.

Registra cada captura con foto, especie y tamaño y arma tu diario de pesca. Cada especie nueva
que pescas se desbloquea en tu Colección, con número, rareza y progreso. Las que faltan
aparecen como silueta misteriosa, esperando la próxima salida.

• Diario de capturas: foto, especie, tamaño, peso, señuelo y lugar
• Colección de especies (Dex) de agua dulce y salada, con el catálogo de tu región
• Rareza: común, poco común, rara y legendaria
• Ranking del pez más grande por mes, año o de siempre, por país
• Feed con las capturas de la comunidad
• Lugar privado: nadie ve dónde fue la pesca
• Sin "mentiras de pescador": tamaños por encima de lo plausible para la especie no pasan
• En español, portugués e inglés, con tema claro y oscuro

Plan Free: 3 capturas por mes. Plan Pro: capturas ilimitadas, feed y ranking.

## en-US

**Title:** fishingdex: fishing log

**Short description:** Log catches, collect species and compete for the biggest fish ranking.

**Full description:**

fishingdex is the Pokédex for sport anglers.

Log every catch with a photo, species and size to build your fishing log. Every new species
you land unlocks in your Collection — with a number, rarity and progress. The ones you're
missing show up as a mystery silhouette, waiting for your next trip.

• Catch log: photo, species, size, weight, lure and spot
• Species collection (Dex) for freshwater and saltwater, using your region's catalog
• Rarity: common, uncommon, rare and legendary
• Biggest-fish ranking by month, year or all time, by country
• Community catch feed
• Private spot: no one sees where you fished
• No "fish tales": sizes above what's plausible for the species are rejected
• In English, Portuguese and Spanish, with light and dark themes

Free plan: 3 catches per month. Pro plan: unlimited catches, feed and ranking.

## Classificação e categoria

- **Categoria:** Esportes (alternativa: Estilo de vida)
- **Tags sugeridas:** pesca, pesca esportiva, diário
- **Público-alvo:** 18+ (evita os requisitos da política "Famílias")
- **Anúncios:** não contém anúncios
- **Classificação de conteúdo (IARC):** sem violência, sem conteúdo sexual, sem apostas;
  **há interação entre usuários** (fotos e curtidas visíveis a outros) e conteúdo gerado pelo
  usuário → marcar no questionário. Esperado "Livre" com aviso de interação.

## Segurança dos dados (Data safety) — versão online (Supabase)

| Pergunta | Resposta |
|---|---|
| O app coleta ou compartilha dados do usuário? | **Coleta: sim. Compartilha com terceiros: não** (o Supabase é operador, não conta como compartilhamento) |
| Dados criptografados em trânsito? | **Sim** (HTTPS) |
| O usuário pode pedir exclusão? | **Sim** — no app (Perfil › Excluir conta) e por e-mail |
| URL de exclusão de conta (exigida pela Play) | https://github.com/SchulzeEdi/fishingdex/blob/main/docs/legal/privacy-policy.md#5-seus-direitos-e-exclusão-da-conta |
| Política de privacidade | https://github.com/SchulzeEdi/fishingdex/blob/main/docs/legal/privacy-policy.md |

Tipos de dados a marcar (todos **coletados**, **obrigatórios** salvo indicação, finalidade
**Funcionalidade do app** + **Gerenciamento da conta**):

| Categoria da Play | Item | Observação |
|---|---|---|
| Informações pessoais | Nome | Exibido no perfil/feed/ranking |
| Informações pessoais | Endereço de e-mail | Login |
| Fotos e vídeos | Fotos | Opcional (foto da captura) |
| Atividade no app | Outro conteúdo gerado pelo usuário | Capturas, curtidas |
| Local | Local aproximado | **Não** — o local da captura é texto livre digitado (não usamos GPS) |

## Recursos gráficos

| Recurso | Arquivo | Exigência da Play |
|---|---|---|
| Ícone | `docs/release/store-assets/play-icon-512.png` | 512×512 PNG |
| Arte de destaque | `docs/release/store-assets/feature-graphic-{pt-BR,es,en}.png` | 1024×500 PNG/JPG |
| Capturas de tela | tirar no aparelho com o APK instalado | 2 a 8, proporção entre 9:16 e 16:9 |

Sugestão de capturas de tela (nesta ordem): Dex com uma espécie "Nova" · momento "Nova
espécie desbloqueada!" · Ranking com pódio · Feed · Registrar captura · Perfil.
