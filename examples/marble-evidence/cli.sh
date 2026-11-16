#!/bin/sh
set -eu

# Resolve paths from the script, so this works from any working directory.
example_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
docs_dir=$(CDPATH= cd -- "$example_dir/../.." && pwd)
output_dir="$docs_dir/.output/marble-evidence"
mkdir -p "$output_dir"
cd "$docs_dir"

npm exec --offline -- decision-lab run \
  --app "$example_dir/app.json" --case "$example_dir/case.yaml" \
  --reports all --locale en-US --timeout-ms 30000 \
  --max-output-bytes 50000000 \
  --run-id documentation-marble-evidence --created-at 2026-11-15T00:00:00.000Z \
  --output "$output_dir/cli.run.json" --force
