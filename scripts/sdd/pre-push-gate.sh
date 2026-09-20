#!/usr/bin/env bash
# Hook PreToolUse(Bash): so age em 'git push'. Bloqueia (exit 2) se os gates locais falharem.
input=$(cat)
echo "$input" | grep -q "git push" || exit 0
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if ! bash "$DIR/check-gates.sh" >&2; then
  echo "BLOQUEADO: gates locais vermelhos — conserte antes do push (regra da constitution)." >&2
  exit 2
fi
exit 0
