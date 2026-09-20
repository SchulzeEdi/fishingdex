# 00 — Opportunity: fishingdex

> Fase 0 do SDD. Decidir se a ideia vale o esforco ANTES de construir.

## Problema / dor
Pescadores amadores e esportivos registram suas capturas hoje de forma solta e perdida — fotos no rolo da câmera, posts avulsos em grupos de WhatsApp e Instagram — e acabam esquecendo o que funcionou: onde pegaram o peixe, com qual isca, vara, carretilha e linha, tamanho e peso. Não existe um histórico organizado nem um lugar único pra comparar resultados, competir por "maior peixe" e descobrir onde pescar. Do outro lado, donos de pesqueiro/lagoa não têm uma vitrine dedicada pra serem encontrados por quem quer pescar. O fishingdex resolve isso sendo um diário + rede social de pesca: registra a captura (com identificação automática da espécie por foto), guarda o setup que funcionou, tem ranking de maior peixe, separa espécies de água doce/salgada e conecta pescadores a pesqueiros.

## ICP — Ideal Customer Profile (por mercado)
**Cliente USD (exterior)**
- Quem e (cargo, contexto, tamanho): "Mike", 30–50 anos, bass/sport angler nos EUA, pesca nos fins de semana e em torneios locais, já usa e paga por apps do tipo (Fishbrain Pro). Valoriza estatística, ranking e histórico.
- Onde encontra esse cliente: comunidades de bass fishing, YouTube de pesca, torneios locais, lojas de artigos de pesca, apps concorrentes.
- Disposicao a pagar: alta — mercado já educado a pagar assinatura (~US$ 7–10/mês é preço corrente).

**Cliente BRL (Brasil)**
- Quem e: "Rafael", 25–45 anos, pescador esportivo de fim de semana, frequenta pesqueiros pagos, posta capturas em grupos de WhatsApp e no Instagram. Público **secundário**: "Seu Jorge", dono de pesqueiro/lagoa que quer ser encontrado e receber contatos.
- Onde encontra: grupos de WhatsApp/Telegram de pesca, comunidades no Facebook, feiras de pesca, canais de YouTube, lojas de pesca.
- Disposicao a pagar: média — mercado ainda não consolidado; disposto a pagar pouco por algo claramente melhor que "postar no grupo".

## Sinais de demanda
- Concorrentes diretos/indiretos: **Fishbrain** (exterior, milhões de usuários, assinatura Pro ~US$ 9,99/mês / US$ 74,99/ano), **FishAngler**, **ANGLR**. No Brasil: mercado fragmentado, sem player consolidado — a dor hoje é resolvida de forma solta em grupos de WhatsApp, Facebook e Instagram.
- Comunidades, buscas, evidencias de dor: pescadores hoje espalhados em WhatsApp, comunidades, feiras de pesca, YouTube — "tudo quanto é lugar", sem casa própria.
- Por que pagariam (em vez de usar planilha/gratuito): (1) **identificação automática da espécie por foto**; (2) **ranking sério** de maior peixe; (3) **histórico organizado** do que funcionou (isca/vara/carretilha/linha) por peixe e por local.

## Modelo de receita
- Tipo: ( ) Assinatura  ( ) Por uso  ( ) One-time  (X) Hibrido — freemium (assinatura de pescador) + listagem paga B2B de pesqueiro
- **Preco USD**: US$ 6,99/mês ou US$ 49,99/ano (Pescador Pro) · US$ 29/mês (listagem de pesqueiro)
- **Preco BRL**: R$ 19,90/mês ou R$ 149/ano (Pescador Pro) · R$ 79/mês (listagem de pesqueiro)
- Quantos clientes para chegar a R$/US$ ____ de MRR: **meta ~1.000 pescadores Pro pagantes ≈ R$ 20 mil/mês** de MRR (fora a receita de listagens de pesqueiro).

### Camadas do produto
- **Pescador — Free:** registrar capturas, ver ranking, catálogo de espécies (doce/salgada). Gancho de crescimento.
- **Pescador — Pro (assinatura):** identificação por foto ilimitada, estatísticas/histórico avançado, mapa detalhado dos locais, badges no ranking.
- **Dono de pesqueiro — B2B:** listagem paga no marketplace, aparecer pra quem procura onde pescar e receber contatos.

## Por que agora / por que voce
- Timing: identificação de espécie por foto ficou barata e boa com IA moderna (viabiliza o recurso-âncora); e no Brasil ninguém consolidou esse público, que hoje vive espalhado no WhatsApp/Facebook. Janela aberta no mercado BRL, com modelo já validado no mercado USD.
- Vantagem injusta (skill, acesso, distribuicao): **desenvolvimento** — o fundador domina construção de software (consegue tocar o produto sozinho, ciclo rápido). **Ressalva honesta:** está começando a pescar agora, então o conhecimento de domínio e o acesso à comunidade ainda estão sendo construídos — mitigar entrando cedo em grupos/pesqueiros e validando com pescadores reais antes de escalar.

## Veredito
- (X) Vale a pena seguir   ( ) Refinar   ( ) Descartar
- Justificativa: dor real e recorrente, modelo de receita já validado no exterior (Fishbrain), mercado BRL aberto sem líder, recurso-âncora (IA de identificação) viável e barato hoje, e fundador com capacidade de execução técnica. Principal risco a monitorar: conhecimento de domínio/distribuição do fundador — endereçável com validação junto à comunidade desde o MVP.

---
**Gate (preencher para avancar):**
- [x] Cliente pagante hipotetico NOMEADO — "Rafael" (BRL), "Mike" (USD), "Seu Jorge" (pesqueiro)
- [x] Preco definido em USD e em BRL — Pro US$ 6,99 / R$ 19,90 mês; listagem US$ 29 / R$ 79 mês
- [x] Modelo de receita explicito — híbrido freemium + listagem B2B
