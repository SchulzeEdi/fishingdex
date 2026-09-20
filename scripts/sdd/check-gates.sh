#!/usr/bin/env bash
# Roda os quality gates locais na raiz do projeto. Sai !=0 se algum falhar.
# Usado por sdd-implement/sdd-review e pelo hook pre-push.
set -uo pipefail
[ -f package.json ] || { echo "sem package.json — rode na raiz do projeto"; exit 1; }
fail=0
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
has() { node -e "process.exit(((require('./package.json').scripts||{})['$1'])?0:1)" 2>/dev/null; }
run() { echo "» $1"; if eval "$2"; then echo "  ✓ ok"; else echo "  ✗ FALHOU: $1"; fail=1; fi; }

if has typecheck; then run "typecheck" "npm run -s typecheck"; else run "tsc --noEmit" "npx -y tsc --noEmit"; fi
has lint  && run "lint"  "npm run -s lint"
has test  && run "test"  "npm run -s test"
has build && run "build" "npm run -s build"

echo "» security"
if bash "$DIR/security-scan.sh"; then echo "  ✓ security ok"; else echo "  ✗ FALHOU: security"; fail=1; fi

if [ "$fail" -eq 0 ]; then echo "GATES VERDES ✓"; else echo "GATES VERMELHOS ✗"; fi
exit $fail
