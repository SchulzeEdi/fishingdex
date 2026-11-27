// Testa as migrations do Supabase + regras + RLS num Postgres/PostGIS descartável (Docker),
// com um shim de auth/storage. Uso: npm run db:test:supabase
import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';

const name = 'fishingdex-supa-test';
const sh = (args, input) => execFileSync('docker', args, { input, stdio: input ? ['pipe', 'pipe', 'inherit'] : 'pipe' }).toString();

try { sh(['rm', '-f', name]); } catch { /* não existia */ }
sh(['run', '-d', '--name', name, '-e', 'POSTGRES_PASSWORD=test', '-e', 'POSTGRES_DB=fd', 'postgis/postgis:16-3.4']);
// A imagem postgis reinicia o Postgres depois do init: espera o "init complete" e o servidor final.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 120; i++) {
  const logs = spawnSync('docker', ['logs', name], { encoding: 'utf8' });
  const done = /PostgreSQL init process complete/.test(`${logs.stdout}${logs.stderr}`);
  if (done) {
    try { sh(['exec', name, 'pg_isready', '-U', 'postgres', '-d', 'fd']); break; } catch { /* ainda subindo */ }
  }
  await sleep(1000);
}

const files = [
  'supabase/tests/00_supabase_shim.sql',
  ...readdirSync('supabase/migrations').filter((f) => f.endsWith('.sql')).sort().map((f) => `supabase/migrations/${f}`),
  'supabase/tests/01_rules_and_rls.sql',
];
try {
  for (const f of files) {
    console.log('==', f);
    sh(['exec', '-i', name, 'psql', '-U', 'postgres', '-d', 'fd', '-v', 'ON_ERROR_STOP=1', '-q'], readFileSync(f));
  }
  console.log('OK: migrations, regras e RLS do Supabase');
} finally {
  sh(['rm', '-f', name]);
}
