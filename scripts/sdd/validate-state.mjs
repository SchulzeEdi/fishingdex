#!/usr/bin/env node
// Valida spec/state.json: chaves obrigatorias, fases, arrays e consistencia de gates.
import { readFileSync, existsSync } from "node:fs";
const p = "spec/state.json";
if (!existsSync(p)) { console.error("✗ spec/state.json nao encontrado (rode na raiz do projeto)"); process.exit(1); }
let s; try { s = JSON.parse(readFileSync(p, "utf8")); }
catch (e) { console.error("✗ state.json invalido:", e.message); process.exit(1); }

const errs = [];
const need = ["project","currentPhase","git","profile","phases","sprints","prds","bugs","deploys","loadtests","changes","logbook","experiments"];
for (const k of need) if (!(k in s)) errs.push(`falta chave: ${k}`);

const phases = ["opportunity","constitution","prd","design","architect","monetize","tasks"];
for (const ph of phases) {
  const x = s.phases?.[ph];
  if (!x) { errs.push(`falta fase: ${ph}`); continue; }
  if (!["pending","completed"].includes(x.status)) errs.push(`${ph}.status invalido: ${x.status}`);
  if (typeof x.gatePassed !== "boolean") errs.push(`${ph}.gatePassed deve ser boolean`);
  if (x.gatePassed && x.status !== "completed") errs.push(`${ph}: gatePassed=true mas status!=completed`);
}
for (const a of ["sprints","prds","bugs","deploys","loadtests","changes","experiments"])
  if (a in s && !Array.isArray(s[a])) errs.push(`${a} deve ser array`);

const valid = [...phases, "loop", "done"];
if (s.currentPhase && !valid.includes(s.currentPhase)) errs.push(`currentPhase invalido: ${s.currentPhase}`);

if (errs.length) { console.error("✗ state.json com problemas:"); errs.forEach(e => console.error("  - " + e)); process.exit(1); }
console.log("✓ state.json valido e consistente");
