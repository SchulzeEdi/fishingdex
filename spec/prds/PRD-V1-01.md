# PRD-V1-01: fishingdex — MVP (diário de pesca + ranking + marketplace de pesqueiros)

- **Status:** aprovado
- **Autor:** Ederson  · **Data:** 2026-09-19
- **Origem:** spec/opportunity.md

## 1. Problema
Pescadores amadores e esportivos registram capturas de forma solta e perdida (fotos no rolo, posts avulsos em WhatsApp/Instagram) e esquecem o que funcionou — onde pegaram, com qual isca/vara/carretilha/linha, tamanho e peso. Falta um lugar único pra guardar esse histórico, competir por "maior peixe" e descobrir onde pescar. Do outro lado, donos de pesqueiro/lagoa não têm uma vitrine dedicada pra serem encontrados. O fishingdex resolve os dois lados: diário + rede social de pesca com ranking, catálogo de espécies (doce/salgada) e um marketplace de pesqueiros. Público primário: pescador esportivo ("Rafael" no BR, "Mike" no exterior). Secundário: dono de pesqueiro ("Seu Jorge").

## 2. Escopo
**In-scope (V1):**
- Contas e perfil público (e-mail+senha, Google, Apple), com nome e foto.
- **Registro de captura:** foto (obrigatória), espécie (obrigatória, escolha manual em lista), data (obrigatória); tamanho, peso, local (mapa) e setup (isca/vara/carretilha/linha) opcionais. Local marcável como privado (não exibido no mapa dos outros).
- **Catálogo de espécies** água doce/salgada (populado por curadoria posterior do time).
- **Ranking** por tamanho, com foto obrigatória; recortes: global, por espécie, por período (mês/ano/sempre) e por país.
- **Social:** feed pra ver capturas dos outros + seguir + curtir (sem comentários).
- **Marketplace de pesqueiro (B2B):** dono cadastra pesqueiro (nome, localização no mapa, espécies disponíveis, fotos, contato); pescador encontra e fala por **WhatsApp** (contato externo).
- **Monetização (desde a V1):** assinatura Pescador Pro (USD e BRL) + listagem paga de pesqueiro (USD e BRL).
- **i18n:** pt, es, en.
- App React Native + Expo publicado nas lojas (iOS + Android); backend/API em Vercel + Postgres gerenciado.

**Out-of-scope (explicitamente fora da V1):**
- IA de identificação de espécie por foto (fica pra depois — na V1 a escolha é manual).
- Agendamento/reserva de pesqueiro dentro do app (contato só por WhatsApp).
- Modo offline / sincronização (app é online; foto tirada pelo celular, cadastro quando houver internet).
- Comentários no feed.
- Notificações push, integração com Instagram, clima/marés, exportação de dados.

## 3. Usuarios e jornadas
- **Rafael / Mike (pescador):** instala o app → cria conta → registra uma captura (foto + espécie + tamanho + setup) → aparece no ranking → segue outros e curte capturas → assina Pro pra ver tudo/histórico.
- **Seu Jorge (dono de pesqueiro):** cria conta → cadastra o pesqueiro no mapa com fotos/espécies/contato → assina a listagem → recebe contatos de pescadores por WhatsApp.

## 4. Requisitos
**Funcionais:**
- RF-1 Cadastro/login com e-mail+senha, Google e Apple; perfil público (nome, foto).
- RF-2 Registrar captura com foto+espécie+data obrigatórios e tamanho/peso/local/setup opcionais; local privado oculto no mapa alheio.
- RF-3 Catálogo de espécies (doce/salgada) consultável na escolha da espécie.
- RF-4 Ranking por tamanho (foto obrigatória) nos recortes global/espécie/período/país.
- RF-5 Feed social: ver capturas, seguir usuários, curtir (sem comentar).
- RF-6 Marketplace: dono cadastra pesqueiro (nome, mapa, espécies, fotos, contato); pescador visualiza e abre WhatsApp.
- RF-7 Planos: Free (postar até 3 capturas/mês, sem ver ranking/feed e sem ser visto) e Pro (feed, ranking, seguir/curtir, histórico ilimitado, estatísticas, mapa detalhado).
- RF-8 Cobrança de assinatura Pro e de listagem de pesqueiro, em USD e BRL.
- RF-9 App em pt/es/en, com troca de idioma.

**Nao-funcionais:** (performance, seguranca, i18n USD/BRL, acessibilidade)
- RNF-1 Registrar uma captura (foto+espécie+salvar) em ≤ 60 s.
- RNF-2 p95 de carregamento de feed/ranking ≤ 2 s.
- RNF-3 Cobrança ponta a ponta funcionando nos dois mercados (USD e BRL).
- RNF-4 Segurança: inputs validados (Zod), secrets fora do código, deps sem CVE crítico; escopo de visibilidade respeitado (privado não vaza; lagoa privada não expõe localização exata).
- RNF-5 Acessibilidade nativa (labels, contraste AA) e 3 idiomas (pt/es/en).
- RNF-6 Cobertura de testes do domínio ≥ 80% (constitution).
- RNF-7 Arquitetura Feature-Sliced Design com lint de fronteiras (constitution).

## 5. Decisoes (D-N)
| ID | Decisao | Opcao escolhida | Motivo |
|----|---------|------------------|--------|
| D-1 | Plataforma/entrega | React Native + Expo, app nas lojas iOS/Android; backend em Vercel/Supabase | Requisito de "baixar na loja" com experiência nativa; mantém TS+FSD num só codebase (ver CHG-001) |
| D-2 | Identificação de espécie | Manual (lista) na V1; IA depois | Reduz risco técnico do MVP; IA é o recurso mais arriscado |
| D-3 | Idiomas | pt, es, en desde a V1 | Mercados Brasil, Argentina e internacional |
| D-4 | Escopo V1 | Amplo (registro+catálogo+ranking/social+marketplace), entrega faseada | Visão do produto do fundador; faseamento mitiga tamanho do MVP |
| D-5 | Autenticação | E-mail+senha, Google e Apple | Cobrir preferências dos dois mercados e exigência da Apple |
| D-6 | Ranking | Critério = tamanho, foto obrigatória; recortes global/espécie/período/país | Comprovação por foto; recortes cobrem os 3 mercados |
| D-7 | Social | Seguir + curtir, sem comentários | Efeito de rede sem custo de moderação de comentários |
| D-8 | Marketplace | Só contato via WhatsApp; sem agendamento interno na V1 | Corta escopo grande de reserva; valida demanda antes |
| D-9 | Paywall | Free = 3 capturas/mês isolado (não vê nem é visto); Pro = tudo. Listagem de pesqueiro paga desde a V1 | Monetizar cedo (constitution: cobrança desde o MVP) |
| D-10 | Offline | Online-only na V1 | Simplicidade; sync fica pra depois |
| D-11 | Catálogo de espécies | Curadoria posterior do time (varredura) | Dados confiáveis sem depender de cadastro do usuário |

## 6. Criterios de sucesso (com numero)
| Metrica | Alvo |
|---|---|
| App aprovado e publicado nas 2 lojas (App Store + Play Store) | sim |
| Tempo pra registrar uma captura (foto+espécie+salvar) | ≤ 60 s |
| p95 de carregamento do feed/ranking | ≤ 2 s |
| Cobrança funcionando ponta a ponta | USD **e** BRL |
| Idiomas disponíveis | pt, es, en |
| Cobertura de testes do domínio | ≥ 80% |

## 7. Riscos e mitigacoes
| Risco | Impacto | Mitigacao |
|---|---|---|
| Paywall Free muito fechado (não vê ranking/feed) trava efeito de rede e aquisição | Alto | Monitorar conversão/retenção; ter plano B de afrouxar o Free (deixar ver, limitar postar) se crescimento travar |
| MVP amplo (4 pilares) para dev solo | Alto | Entrega faseada por sprint (registro → ranking/social → marketplace); cortar/adiar dentro da V1 se preciso |
| Conhecimento de domínio/comunidade do fundador ainda em formação | Médio | Validar com pescadores reais desde o MVP; entrar em grupos/pesqueiros cedo |
| Revisão das lojas (Apple/Google) atrasa lançamento; custos (Apple US$99/ano, Play US$25) | Médio | Preparar builds cedo via EAS; seguir guidelines; orçar as contas de desenvolvedor |
| Curadoria do catálogo de espécies (internacional) é trabalhosa | Médio | Começar pelas espécies mais comuns por mercado; expandir depois |
| Marketplace vazio no início (poucos pesqueiros) reduz valor | Médio | Semear cadastros manualmente numa região piloto antes de divulgar |

---
**Gate:** problema + escopo (in/out) + criterios (com numero) + riscos preenchidos; decisoes-chave como D-N com motivo. ✅
