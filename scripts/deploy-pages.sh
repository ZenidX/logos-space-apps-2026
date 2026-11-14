#!/usr/bin/env bash
# Publica la web estática en GitHub Pages (rama gh-pages): https://zenidx.github.io/logos-space-apps-2026/
# Construye en una copia aparte (git worktree) del último commit, para no tocar la carpeta
# de `npm run dev`. Ojo: publica lo commiteado, no los cambios sin commit.
# Uso: npm run deploy
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=$(pwd)
REMOTE=$(git remote get-url origin)
NAME=$(git config user.name); EMAIL=$(git config user.email)
BUILD=$(mktemp -d)
git worktree add -q --detach "$BUILD" HEAD
trap 'git -C "$ROOT" worktree remove --force "$BUILD" >/dev/null 2>&1 || true' EXIT
cd "$BUILD"
npm ci --no-audit --no-fund --silent
MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/logos-space-apps-2026 npx next build
touch out/.nojekyll
cd out
git init -q -b gh-pages
git add -A
git -c user.name="$NAME" -c user.email="$EMAIL" commit -q -m "Deploy $(git -C "$ROOT" rev-parse --short HEAD) $(date -u +%Y-%m-%dT%H:%MZ)"
git push -q -f "$REMOTE" gh-pages
echo "Publicado: https://zenidx.github.io/logos-space-apps-2026/"
