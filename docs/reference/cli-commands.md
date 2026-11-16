# CLI command reference

Applies to `@decision-lab/cli` **0.1.0**, using `@decision-lab/sdk` **0.1.0**. Requires Node **22.12.0 or later**. See [CLI usage](../../CLI.md) for the complete first-run example.

The registered executable is `decision-lab`. In an npm project with a local installation, invoke it as `npm exec --offline -- decision-lab ...`.

```sh
decision-lab --help
decision-lab --version
decision-lab run --help
```

`--version` prints both CLI and resolved SDK versions. Each command supports `--help` or `-h`; `template`, `app`, and `case` also provide grouped help.

## Common output behavior

- `--output FILE` writes an artifact to a file. Omit it, or use `--output -`, for stdout.
- Definitions and initialized case inputs are YAML. Packages, receipts, assessments, and complete runs are JSON.
- Errors are JSON diagnostics on stderr. Do not infer a successful business result from an empty stderr stream.
- Output files are written atomically. Parent directories must already exist.
- Existing files are refused unless a replaceable output is given `--force`. Template/app packages and `app open` output remain immutable even with `--force`; choose a new output path.
- `--created-at` requires an ISO timestamp with seconds and a timezone. `--run-id` supplies a stable ordinary identifier. These control provenance, not the underlying decision inputs.

Options accept `--name VALUE` or `--name=VALUE`. Most options cannot be repeated. `--require-module-field` is repeatable. Boolean flags `--force` and `--recompute-prior` do not take values.

## Templates

```text
decision-lab template init --pattern PATTERN --id ID --version VERSION --title TITLE
  [--description TEXT] [--guidance TEXT] [--require-module-field PATH ...]
  [--output FILE] [--force]

decision-lab template validate DEFINITION.yaml [--output FILE] [--force]

decision-lab template pack DEFINITION.yaml [--created-at ISO_TIMESTAMP] [--output FILE]
```

`PATTERN` is `evidence-review/1` or `assess-value-of-learning/1`. `VERSION` is a semantic version such as `1.0.0`. `init` emits an editable definition with the installed contract. Required module paths add presence restrictions for known fields; they cannot replace the evaluator or supply arbitrary code.

`validate` emits `{ valid, issues }` and returns exit `2` for an invalid definition. `pack` verifies the definition and emits a content-hashed immutable template package.

## Apps

```text
decision-lab app init --template TEMPLATE.json --model MODEL.yaml
  --app-id ID --release INTEGER [--output FILE] [--force]

decision-lab app validate DEFINITION.yaml [--output FILE] [--force]

decision-lab app pack DEFINITION.yaml [--created-at ISO_TIMESTAMP] [--output FILE]

decision-lab app open PACKAGE.json [--output FILE]
```

`init` requires a packed template and canonical `{ format, module, case }` model. `--release` is a positive safe integer. The app definition retains exact supplied model source. Module validation and template restrictions apply before the app can be packed.

`open` verifies a new app package or compatible older frozen payload and emits its normalized SDK envelope. It does not install an app, alter stored data, or upgrade rules.

## Cases

```text
decision-lab case init --app APP.json [--output FILE] [--force]

decision-lab case validate --app APP.json --case CASE.yaml [--output FILE] [--force]
```

`init` copies the app's default **case-only inputs** into YAML. Edit those inputs for a new situation. `validate` verifies binding and case values against the published module and emits a validation receipt.

Case input can be case-only YAML/JSON, a full canonical model with an identical module, or a matching `decision-lab-case/1` snapshot. Changing published rules, vocabulary, presentation, or module identities requires a new app release.

## Assess without full reports

```text
decision-lab assess --app APP.json --case CASE.yaml
  [--timeout-ms INTEGER] [--run-id ID] [--created-at ISO_TIMESTAMP]
  [--output FILE] [--force]
```

Emits `decision-lab-assessment/1` with input, identity, execution outcome, and pattern assessment. It does not contain the renderer contract. Use `run` for complete reports.

## Run with every report

```text
decision-lab run --app APP.json --case CASE.yaml
  [--reports all] [--locale LOCALE] [--max-output-bytes INTEGER]
  [--prior-run RUN.json | --prior-input CASE.yaml] [--recompute-prior]
  [--history HISTORY.json] [--timeout-ms INTEGER] [--run-id ID]
  [--created-at ISO_TIMESTAMP] [--output FILE] [--force]
```

| Option | Meaning |
| --- | --- |
| `--reports all` | Default and only supported scope. Every retained report/selector context is included. |
| `--locale en-US` | Default locale for prepared display values. Use a locale supported by the runtime's internationalization implementation. |
| `--max-output-bytes N` | Positive safe integer, at most 50,000,000. Sets the complete output ceiling. |
| `--timeout-ms N` | Positive safe integer deadline in milliseconds; default 30,000, including worker startup and report projection. |
| `--prior-run FILE` | Use compatible archived RunBundle output for before/after comparison. |
| `--prior-input FILE` | Recompute an earlier compatible case input with the installed evaluator. Mutually exclusive with `--prior-run`. |
| `--recompute-prior` | With `--prior-run`, recompute its embedded input instead of comparing archived evaluator output. |
| `--history FILE` | Include validated retained revision metadata. It does not invent historical findings. |

Complete runs are compact JSON to retain their byte budget. A framing newline follows the JSON artifact and is outside its artifact budget. Materialization or serialization limits fail without delivering a partial output file.

```sh
decision-lab run --app marbles.app.json --case marbles.case.yaml \
  --reports all --locale en-US --timeout-ms 15000 \
  --run-id marble-review-001 --created-at 2026-11-15T00:00:00Z \
  --output marbles.run.json
```

The output has `format: decision-lab-run/1`. Build views from its `report` property; no evaluator or app package is needed for rendering. See [report output](report-output.md).

## Comparisons and history

```sh
decision-lab run --app marbles.app.json --case changed.case.yaml \
  --prior-run marbles.run.json --output changed.run.json

decision-lab run --app marbles.app.json --case changed.case.yaml \
  --prior-run marbles.run.json --recompute-prior --output recomputed.run.json

decision-lab run --app marbles.app.json --case changed.case.yaml \
  --prior-input earlier.case.yaml --output earlier-input-comparison.run.json
```

An archive must match the app, release, package, module, and supported evaluator identity/build. An incompatible evaluator archive can be compared only through explicit input recomputation. Cross-release comparisons are rejected. Archives are never rewritten by these operations.

History can be an array or `{ "revisions": [...] }`. Each release-bound entry needs `id`, `createdAt`, `modelHash`, `moduleHash`, and the exact app/release `binding` from the associated snapshot. At most 64 entries are accepted. Optional model/source snapshots must match their hashes. Explicit `{ "scope": "module", "revisions": [...] }` identifies older metadata whose release binding is unavailable. This is qualified as module-scoped metadata, not release-bound evidence of earlier conclusions.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Requested artifact delivered with completed execution, or a successful authoring operation. A diagnostic assessment for semantically invalid case values can still return `0`. |
| `2` | Invalid arguments, syntax, validation, binding, integrity, or comparison context. Validation commands may emit an unsuccessful receipt on stdout. |
| `3` | Cancelled, timed-out, or resource-limited execution. A complete diagnostic run artifact can still be delivered. |
| `4` | Operational, worker failure, I/O, or artifact-delivery failure. |

Always inspect artifact content. Exit `0` does not mean that a claim is established or that an action is recommended. SIGINT/SIGTERM request worker cancellation. See [errors and limits](errors-and-limits.md) for response handling.

## Programmatic command runner

```js
import { runCLI, CLI_VERSION, SDK_VERSION } from '@decision-lab/cli';

const code = await runCLI(['run', '--app', 'app.json', '--case', 'case.yaml'], {
  stdout: { write(text) { /* capture artifact text */ } },
  stderr: { write(text) { /* capture JSON diagnostics */ } },
  signal: abortController.signal,
});
```

`runCLI` returns the documented numeric exit code and does not call `process.exit`. Its argument is an array of strings. Streams only need a `write(text)` method. For in-memory authoring or assessment without file-oriented command semantics, prefer the [SDK](sdk-api.md).
