#!/bin/sh
set -eu

example_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
docs_dir=$(CDPATH= cd -- "$example_dir/../.." && pwd)
default_output_dir="$docs_dir/.output/marble-evidence/authoring/cli"
output_dir=${1:-"$default_output_dir"}
# Immutable packages cannot be overwritten. Supply a fresh directory to repeat.
if [ -e "$output_dir/template.json" ] || [ -e "$output_dir/app.json" ]; then
  echo "Use a fresh output directory: $output_dir already contains an immutable package." >&2
  exit 1
fi
mkdir -p "$output_dir"
cd "$docs_dir"

npm exec --offline -- decision-lab template init \
  --pattern evidence-review/1 --id documentation-evidence-review \
  --version 1.0.0 --title "Review finite evidence" \
  --output "$output_dir/template.yaml"
npm exec --offline -- decision-lab template validate "$output_dir/template.yaml"
npm exec --offline -- decision-lab template pack "$output_dir/template.yaml" \
  --created-at 2026-11-15T00:00:00.000Z --output "$output_dir/template.json"
npm exec --offline -- decision-lab app init \
  --template "$output_dir/template.json" --model "$example_dir/model.yaml" \
  --app-id documentation-marble-evidence --release 1 --output "$output_dir/app.yaml"
npm exec --offline -- decision-lab app validate "$output_dir/app.yaml"
npm exec --offline -- decision-lab app pack "$output_dir/app.yaml" \
  --created-at 2026-11-15T00:00:00.000Z --output "$output_dir/app.json"
npm exec --offline -- decision-lab app open "$output_dir/app.json" --output "$output_dir/opened.app.json"
npm exec --offline -- decision-lab case init \
  --app "$output_dir/app.json" --output "$output_dir/case.yaml"
npm exec --offline -- decision-lab case validate \
  --app "$output_dir/app.json" --case "$output_dir/case.yaml"
npm exec --offline -- decision-lab run \
  --app "$output_dir/app.json" --case "$output_dir/case.yaml" \
  --reports all --locale en-US --run-id documentation-marble-evidence \
  --created-at 2026-11-15T00:00:00.000Z --output "$output_dir/run.json"
