#!/usr/bin/env node
// Heuristica de drift: artefatos que nao aparecem no STATUS, sprint sem retro, ADR fora do indice.
import { readFileSync, existsSync, readdirSync } from "node:fs";
if (!existsSync("spec/STATUS.md")) { console.error("✗ spec/STATUS.md nao encontrado"); process.exit(1); }
const status = readFileSync("spec/STATUS.md", "utf8").toUpperCase();
const ls = (d) => existsSync(d) ? readdirSync(d).filter(f => f.endsWith(".md") && !/template/i.test(f)) : [];
const inStatus = (id) => id && status.includes(id.toUpperCase());
const warns = [];

for (const f of ls("spec/adr")) { const id = (f.match(/\d{3,4}/) || [])[0]; if (id && !status.includes(id)) warns.push(`ADR ${f} fora do indice do STATUS`); }
const all = ls("spec/sprints");
const sprints = all.filter(f => /^SPRINT/i.test(f));
const retros = all.filter(f => /^RETRO/i.test(f));
for (const sp of sprints) { const n = (sp.match(/\d{3}/) || [])[0]; if (n && !retros.some(r => r.includes(n))) warns.push(`SPRINT ${sp} sem RETRO`); }
for (const [dir, rx] of [["spec/bugs",/BUG-?\d+/i],["spec/deploys",/DEPLOY-?\d+/i],["spec/loadtests",/LOAD-?\d+/i],["spec/changes",/CHG-?\d+/i]])
  for (const f of ls(dir)) { const id = (f.match(rx) || [])[0]; if (id && !inStatus(id)) warns.push(`${f} nao aparece no STATUS`); }

if (warns.length) { console.error("⚠ drift de documentacao:"); warns.forEach(w => console.error("  - " + w)); process.exit(1); }
console.log("✓ documentacao sem drift detectado");
