# Decision Lab CLI

Use `@decision-lab/cli` to author templates, pack apps, validate cases and produce
complete report JSON from the terminal. Its executable is `decision-lab`.

Documented version: **0.1.0**, using SDK **0.1.0**. Requires **Node 22.12.0+**.
Registry commands apply after these versions are published.

## Install and check

In a project:

```sh
npm install @decision-lab/cli@0.1.0
npm exec --offline -- decision-lab --version
npm exec --offline -- decision-lab --help
```

For prepublication review, install both supplied candidate archives together:
`npm install /path/to/decision-lab-sdk-0.1.0.tgz
/path/to/decision-lab-cli-0.1.0.tgz`. They are supplied separately from this
documentation repository. This ensures the CLI uses the candidate SDK rather
than looking for a previously published registry version.

The CLI declares the SDK as a production dependency. You do not need the
Decision Lab UI or an implementation checkout. `--offline` on `npm exec` keeps
execution local after installation; the initial installation needs access to
the packages or a populated npm cache.

Alternatively, install globally with `npm install --global
@decision-lab/cli@0.1.0` and use `decision-lab` directly.

## Run the marble evidence example

From the root of this documentation repository:

```sh
npm install
sh examples/marble-evidence/cli.sh
```

The script writes `.output/marble-evidence/cli.run.json`. The learning equivalent
is `sh examples/marble-learning/cli.sh`.

The following is the same basic installed-package operation. Run it from the
repository root:

```sh
mkdir -p .output/quickstart
npm exec --offline -- decision-lab run \
  --app examples/marble-evidence/app.json \
  --case examples/marble-evidence/case.yaml \
  --reports all \
  --locale en-US \
  --timeout-ms 15000 \
  --max-output-bytes 50000000 \
  --run-id my-marble-review \
  --created-at 2026-11-15T00:00:00.000Z \
  --output .output/quickstart/cli.run.json
```

The output is a complete `decision-lab-run/1` bundle with the evaluated inputs,
execution provenance, assessment and every prepared report context. Render its
`report` field without the evaluator or original app package.

Files refuse overwrite by default. To repeat the quickstart, add `--force` to
replace that calculation output or choose a new path. Immutable template/app
packages always require a new output path.

## Authoring commands

The installed workflow is:

```text
template init → template validate → template pack
app init      → app validate      → app pack
case init     → case validate     → run
```

`app init` consumes a packed template and a complete canonical YAML model.
`case init` copies the app's starting inputs. Case edits cannot replace the
published module's rules or presentation bindings.

Each example includes an `author.sh` script that performs this complete
workflow. See [create a template](docs/guides/create-a-template.md) and
[create an app](docs/guides/create-an-app.md) for step-by-step commands.

Use `app open` to verify an app package. Use `assess` for an assessment-only
artifact when you do not need report views. `run --reports all` provides complete
report output; `all` is the only supported report scope.

## Change inputs and compare

Copy an example's `case.yaml`, edit its allowed inputs, and rerun against the
same app package. For example, change the evidence error bound or the learning
study fee without changing the app's module.

```sh
npm exec --offline -- decision-lab run \
  --app examples/marble-evidence/app.json \
  --case edited.case.yaml \
  --prior-run .output/quickstart/cli.run.json \
  --output edited.run.json
```

This compares the new result with retained output. Add `--recompute-prior` to
explicitly evaluate the prior bundle's embedded input using the installed
evaluator, or use `--prior-input earlier.case.yaml` instead of `--prior-run`.
Cross-release comparisons remain rejected. See the
[comparison guide](docs/guides/run-and-compare-cases.md) for context and history.

## Output and exit codes

Omit `--output` or use `--output -` for machine-readable stdout. Diagnostics use
JSON on stderr. Definitions and initialized cases are YAML; packages, validation
receipts, assessments and runs are JSON. Full run JSON uses compact,
signed-zero-preserving serialization.

| Exit | Meaning |
| --- | --- |
| `0` | The requested artifact was delivered. Its business assessment may still report invalid values, an open question, inconsistency or no feasible action. |
| `2` | Invalid arguments, syntax, validation, declarations or binding. |
| `3` | Execution was cancelled, timed out or resource-limited. A run can still contain complete diagnostic report views. |
| `4` | Operational or delivery failure, including the output-size limit. |

File delivery is atomic. A delivery failure does not publish a partial output
file. SIGINT and SIGTERM cancel execution. A fixed run ID, timestamp, locale and
comparison context support repeatable SDK/CLI output comparisons.

## Embed the CLI runner

Node programs can call the CLI without terminating their process:

```js
import { runCLI } from '@decision-lab/cli';

const code = await runCLI(['--version'], {
  stdout: process.stdout,
  stderr: process.stderr,
});
console.log('Exit code:', code);
```

`runCLI(args, { stdout, stderr, signal })` returns `0`, `2`, `3` or `4` and does
not call `process.exit`. Use the SDK for direct application integration.

See [all commands](docs/reference/cli-commands.md),
[YAML reference](docs/reference/canonical-yaml.md),
[report output](docs/reference/report-output.md), and
[errors and limits](docs/reference/errors-and-limits.md).
