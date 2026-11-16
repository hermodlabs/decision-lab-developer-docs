# Decision Lab SDK

Use `@decision-lab/sdk` to author templates and apps, bind case inputs to frozen
rules, and obtain complete reports in a Node or browser application.

Documented version: **0.1.0**. Requires **Node 22.12.0+** for Node execution.
The package is ESM, includes TypeScript declarations, and has no external runtime
dependencies. Registry commands below apply after this version is published.

## Install

In your application:

```sh
npm install @decision-lab/sdk@0.1.0
```

Before registry publication, install a supplied candidate archive with
`npm install /path/to/decision-lab-sdk-0.1.0.tgz`. To exercise this repository's
paired SDK/CLI examples, install both candidate archives together as described
in the [main README](README.md). Archive paths refer to files you supply; no
package tarballs are included in this documentation repository.

| Entry point | Purpose |
| --- | --- |
| `@decision-lab/sdk` | Portable source handling, authoring, case binding, validation and report services. |
| `@decision-lab/sdk/node` | Worker-thread executor for Node. |
| `@decision-lab/sdk/browser` | Module-worker executor for browser builds. |

Import through these public names. Private package files are outside the
supported API. Importing a public entry or creating an idle executor starts no
worker.

## Run the marble evidence example

From the root of this documentation repository:

```sh
npm install
node examples/marble-evidence/sdk.mjs
```

The script loads the included app package and case, calculates every report, and
writes `.output/marble-evidence/sdk.run.json`. Run
`node examples/marble-learning/sdk.mjs` for the learning-value equivalent.

## Integrate the same workflow

Save the following as `quickstart.mjs` at this repository's root, then run
`node quickstart.mjs`. All input files are included in the examples.

```js
import fs from 'node:fs/promises';
import { createDecisionLab } from '@decision-lab/sdk';
import { createNodeExecutor } from '@decision-lab/sdk/node';

const executor = createNodeExecutor();
const lab = createDecisionLab({ executor });
try {
  const appSource = await fs.readFile(
    new URL('./examples/marble-evidence/app.json', import.meta.url), 'utf8');
  const caseSource = await fs.readFile(
    new URL('./examples/marble-evidence/case.yaml', import.meta.url), 'utf8');
  const app = lab.apps.open(lab.sources.parseArtifact(appSource));
  const snapshot = lab.cases.create({
    app,
    inputs: lab.sources.parseCase(caseSource),
    source: caseSource,
  });
  const receipt = lab.cases.validate({ app, case: snapshot });
  if (!receipt.valid) throw new Error(JSON.stringify(receipt.issues));

  const run = await lab.run({
    app,
    case: snapshot,
    runId: 'my-marble-review',
    createdAt: '2026-11-15T00:00:00.000Z',
    execution: { timeoutMs: 15000 },
    reportOptions: { scope: 'all', locale: 'en-US' },
  });
  if (!lab.runs.validate(run).valid) throw new Error('Invalid run artifact');
  console.log('Execution:', run.execution.status);
  console.log('Assessment complete:', run.report.completeness.assessmentComplete);
  console.log('Report views:', Object.keys(run.report.views));

  const output = new URL('./.output/quickstart/', import.meta.url);
  await fs.mkdir(output, { recursive: true });
  await fs.writeFile(new URL('sdk.run.json', output),
    lab.sources.renderJSON(run, { maxBytes: 50000000 }));
} finally {
  await executor.close();
}
```

`apps.open` verifies the package. `cases.create` binds inputs to its rules and
release. `cases.validate` checks the supplied case. `run` returns a
`decision-lab-run/1` bundle containing the evaluated input, execution identity,
assessment and complete `decision-lab-report/1` document.

The example deliberately requires valid inputs before running. An application
may instead run a bound case with invalid business values to obtain explicit
admission diagnostics. Syntax errors and frozen rule changes still fail before
execution. See [errors and outcomes](docs/reference/errors-and-limits.md).

## Author a template and app

`createDecisionLab()` without an executor supports source handling, authoring
and validation. Inject an executor when calling `assess` or `run`.

```js
import { createDecisionLab } from '@decision-lab/sdk';

const lab = createDecisionLab();
const definition = lab.templates.create({
  templateId: 'review-finite-evidence',
  version: '1.0.0',
  pattern: 'evidence-review/1',
  title: 'Review finite evidence',
  authoring: { guidance: 'Provide reviewed rules and starting case inputs.' },
});
const template = lab.templates.pack(definition);
```

Pass a complete canonical module and starting case to `apps.create({ template,
appId, release, model, source })`, then validate and pack the definition.
The [template guide](docs/guides/create-a-template.md),
[app guide](docs/guides/create-an-app.md) and each example's `author.mjs` show the
complete process. Packing returns an artifact; the caller owns file delivery,
installation and persistence.

## Edit inputs and compare runs

For each edit, parse the new case, create a new bound snapshot, and call `run`.
The published module remains fixed. Pass `context: { priorRun }` to compare
retained output, or `context: { priorRun, comparisonMode: 'recompute-prior' }`
to explicitly recalculate its input with the installed evaluator. A prior case
snapshot can be supplied as `context: { priorInput }` for recomputation.

Comparisons remain bound to a compatible app release. Archived output requires
compatible evaluator identity; recomputation is labeled as a new calculation.
See [running and comparing cases](docs/guides/run-and-compare-cases.md).

## Browser use and rendering

Inject `createBrowserExecutor()` from `@decision-lab/sdk/browser` instead of the
Node executor. The package includes its worker files. Use an HTTP origin and a
module-worker-aware build tool; the qualified Vite integration needs no copied
worker or source alias. See [browser integration](docs/guides/browser-integration.md).

Render from `run.report`. It contains prepared views, typed cells, datasets,
selection contexts, labels and navigation actions. Your client owns layout and
selection state. The [rendering guide](docs/guides/render-reports.md) shows how to
start with report JSON alone. The SDK provides report data, not UI components.

## Errors, cancellation and storage

- Creation, packing and binding errors expose `DecisionLabError.code`, `stage`
  and `issues`; source locations are included when known.
- Validators return `{ valid, issues }`. Parsing source alone does not establish
  that the model or case is valid.
- Pass an `AbortSignal` as `execution.signal` to cancel work. A timeout or
  cancellation has explicit unavailable output and no invented assessment.
- Use `sources.renderJSON` and `sources.parseArtifact` for SDK artifacts. They
  preserve signed zero and enforce the documented bounds.
- The caller owns persistence and closes the executor in `finally`.

See the [API reference](docs/reference/sdk-api.md),
[report contract](docs/reference/report-output.md),
[limits](docs/reference/errors-and-limits.md), and [compatibility guide](docs/reference/artifacts-and-versions.md).
