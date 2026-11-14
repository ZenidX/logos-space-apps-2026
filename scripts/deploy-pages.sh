#!/usr/bin/env bash
# Publica la web estática en GitHub Pages (rama gh-pages).
# Uso: bash scripts/deploy-pages.sh
set -euo pipefail
cd "$(dirname "$0")/.."
MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/logos-space-apps-2026 npx next build
touch out/.nojekyll
REMOTE=$(git remote get-url origin)
TMP=$(mktemp -d)
cp -r out/. "$TMP"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="$(git -C "$OLDPWD" config user.name)" -c user.email="$(git -C "$OLDPWD" config user.email)" \
  commit -q -m "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -q -f "$REMOTE" gh-pages
echo "Publicado: https://zenidx.github.io/logos-space-apps-2026/"
