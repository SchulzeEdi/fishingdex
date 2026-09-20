# ADR-0007: PostGIS para dados espaciais

- **Status:** aceito
- **Data:** 2026-09-20

## Contexto
O marketplace precisa de "pesqueiros num raio de X km" e visualização em mapa; capturas públicas têm localização. Calcular distância na aplicação (haversine sobre lat/lng) ou com `WHERE` por bounding box não escala e degrada o banco com o volume.

## Opções consideradas
1. **lat/lng + cálculo na aplicação / bounding box** — simples, mas lento e impreciso; full-scan.
2. **PostGIS (extensão do Postgres)** — tipos `geometry`, índice GiST, `ST_DWithin`/`ST_Distance` no banco. Supabase suporta nativamente.

## Decisão
Ligar **PostGIS no dia 1**. Locais como `geometry(Point,4326)` em `fisheries.geom` e `catches.geom`, com índice **GiST**. Queries de raio via `ST_DWithin` e ordenação por `ST_Distance`.

## Consequências
- Positivas: queries geoespaciais rápidas e corretas; mapa performático.
- Negativas: migração inicial habilita a extensão; um pouco mais de conhecimento de PostGIS.
- Reavaliar se: nunca — é o padrão para geo em Postgres.
