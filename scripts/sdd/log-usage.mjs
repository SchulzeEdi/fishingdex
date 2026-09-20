#!/usr/bin/env node
// Registra uma interacao no logbook (CSV) e atualiza o agregado em spec/state.json.
// Avisa se o custo acumulado passar do orcamento (profile.budgetUsd > 0).
// Uso:
//   node log-usage.mjs --phase architect --method SDD --model opus-4 \
//        --in 1200 --out 800 --cost 0.05 --time 4 --iter 1 --note "ADR do ORM"
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";

const a = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) a[argv[i].slice(2)] = argv[i + 1];

const now = new Date().toISOString().slice(0, 16);
const row = {
  date: a.date || now, phase: a.phase || "-", method: a.method || "SDD", model: a.model || "-",
  tin: +(a.in || 0), tout: +(a.out || 0), cost: +(a.cost || 0), time: +(a.time || 0),
  iter: +(a.iter || 1), result: a.result || "aceito", note: a.note || "",
};

const dir = "spec/logbook";
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
const csv = `${dir}/logbook.csv`;
if (!existsSync(csv)) writeFileSync(csv, "data_hora,fase_task,metodo,modelo,tokens_in,tokens_out,custo_usd,tempo_min,iteracoes,resultado,observacoes\n");
appendFileSync(csv, [row.date, row.phase, row.method, row.model, row.tin, row.tout, row.cost, row.time, row.iter, row.result, JSON.stringify(row.note)].join(",") + "\n");

let budgetMsg = "";
const sp = "spec/state.json";
if (existsSync(sp)) {
  const s = JSON.parse(readFileSync(sp, "utf8"));
  const lb = s.logbook || (s.logbook = { interactions: 0, tokensIn: 0, tokensOut: 0, costUsd: 0, timeMin: 0 });
  lb.interactions += 1; lb.tokensIn += row.tin; lb.tokensOut += row.tout;
  lb.costUsd = +(lb.costUsd + row.cost).toFixed(4); lb.timeMin += row.time;
  writeFileSync(sp, JSON.stringify(s, null, 2) + "\n");

  const budget = +(s.profile?.budgetUsd || 0);
  if (budget > 0) {
    const pct = Math.round((lb.costUsd / budget) * 100);
    if (lb.costUsd > budget) budgetMsg = `\n⚠ ORCAMENTO ESTOURADO: $${lb.costUsd} de $${budget} (${pct}%).`;
    else if (pct >= 80) budgetMsg = `\n⚠ orcamento em ${pct}%: $${lb.costUsd} de $${budget}.`;
  }
}
console.log(`✓ logbook +1 (in=${row.tin} out=${row.tout} custo=$${row.cost} tempo=${row.time}min). Rode render-status.mjs para atualizar o STATUS.${budgetMsg}`);
