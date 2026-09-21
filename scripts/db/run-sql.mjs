// Runner de SQL simples: aplica todos os arquivos .sql de um diretório (ordem alfabética),
// ou um arquivo específico. Usa DATABASE_URL. Sem dependência de TS.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';

const target = process.argv[2];
if (!target) {
  console.error('uso: node scripts/db/run-sql.mjs <arquivo.sql | diretório>');
  process.exit(1);
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL não definida (ver .env.example)');
  process.exit(1);
}

function filesOf(path) {
  if (statSync(path).isDirectory()) {
    return readdirSync(path)
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .map((f) => join(path, f));
  }
  return [path];
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  for (const file of filesOf(target)) {
    const sql = readFileSync(file, 'utf8');
    process.stdout.write(`» aplicando ${file}\n`);
    await client.query(sql);
  }
  console.log('✓ SQL aplicado');
} catch (e) {
  console.error('✗ erro ao aplicar SQL:', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
