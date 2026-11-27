// Gera o SQL do catálogo de espécies a partir de src/entities/fish-species/model/species.data.ts
// (fonte única). Escreve o seed local e, com --supabase <arquivo>, uma migration idempotente.
// Uso: node scripts/db/gen-species-sql.mjs [--supabase supabase/migrations/<versão>_species.sql]
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('src/entities/fish-species/model/species.data.ts', 'utf8');
const blocks = [...src.matchAll(/\{\s*id: '([^']+)',([\s\S]*?)\n {2}\}/g)];
const get = (b, k) => (b.match(new RegExp(`${k}: ([^\n]+),`)) || [])[1];
const q = (s) => `'${s.replace(/^'|'$/g, '').replace(/\'/g, "'").replace(/'/g, "''")}'`;
const rows = blocks.map(([, id, body]) => {
  const regions = get(body, 'regions').replace(/[[\]' ]/g, '');
  return `  (${q(id)},${q(get(body, 'namePt'))},${q(get(body, 'nameEs'))},${q(get(body, 'nameEn'))},${q(get(body, 'scientificName'))},${q(get(body, 'habitat'))},${q(get(body, 'rarity'))},'{${regions}}',${get(body, 'maxPlausibleSizeCm')},${get(body, 'maxPlausibleWeightKg') ?? 'NULL'})`;
});
const cols = 'id, name_pt, name_es, name_en, scientific_name, habitat, rarity, regions, max_plausible_size_cm, max_plausible_weight_kg';

writeFileSync(
  'src/shared/db/seed/species.sql',
  `-- Seed regionalizado de espécies (D-11/D-14). Curadoria completa depois.
-- Gerado por scripts/db/gen-species-sql.mjs a partir de species.data.ts (mesma ordem = Nº da Dex).
INSERT INTO fish_species (${cols}) VALUES
${rows.join(',\n')}
ON CONFLICT (id) DO NOTHING;
`,
);

const i = process.argv.indexOf('--supabase');
if (i > -1) {
  writeFileSync(
    process.argv[i + 1],
    `-- Catálogo de espécies (${rows.length}) — gerado por scripts/db/gen-species-sql.mjs a partir de
-- species.data.ts. Idempotente: insere as novas e atualiza nomes/tetos das existentes.
INSERT INTO public.fish_species (${cols}) VALUES
${rows.join(',\n')}
ON CONFLICT (id) DO UPDATE SET
  name_pt = excluded.name_pt, name_es = excluded.name_es, name_en = excluded.name_en,
  scientific_name = excluded.scientific_name, habitat = excluded.habitat, rarity = excluded.rarity,
  regions = excluded.regions, max_plausible_size_cm = excluded.max_plausible_size_cm,
  max_plausible_weight_kg = excluded.max_plausible_weight_kg;
`,
  );
}
console.log(`${rows.length} espécies`);
