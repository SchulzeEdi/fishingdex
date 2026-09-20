#!/usr/bin/env node
// Gera o bloco AUTO do STATUS.md a partir de spec/state.json + varredura de spec/.
// state.json e a VERDADE DA MAQUINA; o bloco AUTO do STATUS e derivado (nao editar a mao).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
if (!existsSync("spec/state.json")) { console.error("✗ spec/state.json nao encontrado"); process.exit(1); }
const s = JSON.parse(readFileSync("spec/state.json", "utf8"));
const lb = s.logbook || {};
const openBugs = (s.bugs || []).filter(b => (b.status || b.state) !== "resolvido").length;
const next = s.currentPhase === "loop" ? "rode sdd-sprint / sdd-implement"
          : s.currentPhase === "done" ? "MVP fechado"
          : `rode sdd-${s.currentPhase}`;

const block = [
  "<!-- AUTO:START — gerado por scripts/render-status.mjs; nao editar a mao -->",
  `**Fase atual:** ${s.currentPhase} · **Proximo:** ${next}`,
  `**Profile:** billing=${s.profile?.billing} · cloud=${s.profile?.cloud} · markets=${(s.profile?.markets || []).join("/")}`,
  "",
  "| Indicador | Valor |",
  "|-----------|-------|",
  `| PRDs | ${(s.prds || []).length} |`,
  `| Sprints | ${(s.sprints || []).length} |`,
  `| Bugs em aberto | ${openBugs} |`,
  `| Deploys | ${(s.deploys || []).length} |`,
  `| Load tests | ${(s.loadtests || []).length} |`,
  `| Emendas (CHG) | ${(s.changes || []).length} |`,
  `| Logbook — interacoes | ${lb.interactions || 0} |`,
  `| Logbook — custo USD | ${lb.costUsd || 0} |`,
  `| Logbook — tempo (min) | ${lb.timeMin || 0} |`,
  "<!-- AUTO:END -->",
].join("\n");

const path = "spec/STATUS.md";
let md = existsSync(path) ? readFileSync(path, "utf8") : "# STATUS\n\n<!-- AUTO:START -->\n<!-- AUTO:END -->\n";
if (/<!-- AUTO:START[\s\S]*?<!-- AUTO:END -->/.test(md)) {
  md = md.replace(/<!-- AUTO:START[\s\S]*?<!-- AUTO:END -->/, block);
} else {
  md = md.replace(/^(#[^\n]*\n)/, `$1\n${block}\n`);
}
writeFileSync(path, md);
console.log("✓ STATUS.md: bloco AUTO regenerado a partir do state.json");
