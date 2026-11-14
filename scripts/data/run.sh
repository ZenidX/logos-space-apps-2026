#!/usr/bin/env bash
# AI-assisted (Claude), reviewed by team Logos
# Rebuilds src/data/sites.json from the public input datasets. See scripts/data/README.md for inputs and versions.
# Usage: LOGOS_IN=/path/to/inputs npm run data
set -euo pipefail
: "${LOGOS_IN:?Set LOGOS_IN to the folder with the input datasets (see scripts/data/README.md)}"
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/../.." && pwd)"
export LOGOS_WORK="${LOGOS_WORK:-$ROOT/.data-work}"; mkdir -p "$LOGOS_WORK"
PY="${PYTHON:-python3}"
"$PY" -I "$HERE/01_regrid_sand.py"
"$PY" -I "$HERE/02_missions.py" "$LOGOS_WORK/missions.json"
"$PY" -I "$HERE/03_names.py"
"$PY" -I "$HERE/04_access.py" "$LOGOS_WORK/sites_list.json" "$LOGOS_IN" > "$LOGOS_WORK/access.json"
"$PY" -I "$HERE/05_build.py" "$LOGOS_WORK/sites.json"
LOGOS_SITES="$LOGOS_WORK/sites.json" "$PY" -I "$HERE/test_index.py"
"$PY" -I "$HERE/06_terrain.py" "$LOGOS_WORK/sites.json" "$ROOT/public/heightmaps" "$ROOT/src/data/terrain-index.json"
"$PY" -I "$HERE/07_details.py" "$LOGOS_WORK/sites.json" "$ROOT/src/data/site-details.json"
cp "$LOGOS_WORK/sites.json" "$ROOT/src/data/sites.json"
echo "src/data/sites.json rebuilt"
