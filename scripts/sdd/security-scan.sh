#!/usr/bin/env bash
# Scan de seguranca: segredos hardcoded (fatal) + deps com CVE (npm audit).
# Segredo encontrado => sai !=0 (nunca pode ir pro repo). CVE critico => sai !=0.
set -uo pipefail
fail=0

echo "» scan de segredos"
SECRET_RX='AKIA[0-9A-Z]{16}|-----BEGIN (RSA|EC|OPENSSH)? ?PRIVATE KEY-----|sk_live_[0-9a-zA-Z]{12,}|(api[_-]?key|secret[_-]?key|access[_-]?token|password)[[:space:]]*[:=][[:space:]]*["][^"]{8,}["]'
if grep -rnIE "$SECRET_RX" . \
     --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next \
     --exclude-dir=dist --exclude-dir=build --exclude-dir=out --exclude='*.lock' 2>/dev/null; then
  echo "  ✗ possivel segredo hardcoded (acima). Mova para o secrets manager."; fail=1
else
  echo "  ✓ nenhum segredo obvio"
fi

if command -v gitleaks >/dev/null 2>&1; then
  echo "» gitleaks"; gitleaks detect --no-banner --redact || { echo "  ✗ gitleaks achou segredo"; fail=1; }
fi

if [ -f package.json ]; then
  echo "» npm audit (informativo high; falha em critical)"
  npm audit --audit-level=high || echo "  ⚠ deps com CVE high (revisar)"
  npm audit --audit-level=critical >/dev/null 2>&1 || { echo "  ✗ deps com CVE CRITICO"; fail=1; }
fi

[ "$fail" -eq 0 ] && echo "SECURITY OK ✓" || echo "SECURITY: achados ✗"
exit $fail
