#!/usr/bin/env bash
# Inject intro market secrets from 1Password into .env.local (gitignored).
# Never prints secret values.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.local"

# Override with FRED_API_KEY_OP_REF if your item path differs.
OP_REF="${FRED_API_KEY_OP_REF:-op://Private/FRED_API_KEY/credential}"

if ! command -v op >/dev/null 2>&1; then
  echo "1Password CLI (op) not found. Install it, then re-run." >&2
  exit 1
fi

if ! op account list >/dev/null 2>&1; then
  echo "1Password CLI is not connected to the desktop app." >&2
  echo "Open 1Password → Settings → Developer → Integrate with 1Password CLI, then retry." >&2
  exit 1
fi

VALUE="$(op read "$OP_REF" 2>/dev/null || true)"
if [[ -z "${VALUE}" ]]; then
  echo "Could not read ${OP_REF}." >&2
  echo "Set FRED_API_KEY_OP_REF to your item path, e.g. op://Vault/Item/credential" >&2
  exit 1
fi

touch "$ENV_FILE"
if grep -q '^FRED_API_KEY=' "$ENV_FILE" 2>/dev/null; then
  # Replace existing line without echoing the secret.
  tmp="$(mktemp)"
  awk -v val="$VALUE" '
    BEGIN { done=0 }
    /^FRED_API_KEY=/ { print "FRED_API_KEY=" val; done=1; next }
    { print }
    END { if (!done) print "FRED_API_KEY=" val }
  ' "$ENV_FILE" > "$tmp"
  mv "$tmp" "$ENV_FILE"
else
  printf '\n# Injected from 1Password (%s) for intro market yields\nFRED_API_KEY=%s\n' "$OP_REF" "$VALUE" >> "$ENV_FILE"
fi

echo "Wrote FRED_API_KEY to .env.local from 1Password (${OP_REF}). Restart next dev to pick it up."
echo "Also add FRED_API_KEY in the Vercel project env for production."
