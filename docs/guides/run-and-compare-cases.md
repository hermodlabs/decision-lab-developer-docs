# Run and compare cases

The same app release can assess successive case inputs. Retain the earlier run
when you want to compare archived calculations, or retain earlier inputs when
you want an explicit recomputation.

Install the packages through [SDK.md](../../SDK.md) or [CLI.md](../../CLI.md).
Run these examples from the documentation repository's root. They use the
prepackaged `examples/marble-evidence/app.json` and `case.yaml`.

## SDK: calculate and compare

Save this as `compare-cases.mjs`:

```js
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createDecisionLab } from '@decision-lab/sdk';
import { createNodeExecutor } from '@decision-lab/sdk/node';

const executor = createNodeExecutor();
const lab = createDecisionLab({ executor });
try {
  const app = lab.apps.open(await readFile(
    'examples/marble-evidence/app.json', 'utf8'));
  const source = await readFile('examples/marble-evidence/case.yaml', 'utf8');
  const initialCase = lab.cases.create({
    app, inputs: lab.sources.parseCase(source), source,
  });
  const initialRun = await lab.run({
    app, case: initialCase,
    runId: 'tutorial-before', createdAt: '2026-11-15T00:00:00.000Z',
    execution: { timeoutMs: 15000 },
    reportOptions: { scope: 'all', locale: 'en-US' },
  });

  const changedInputs = structuredClone(initialCase.inputs);
  changedInputs.parameters.maxIncorrectReports = 0;
  const changedCase = lab.cases.create({ app, inputs: changedInputs });
  const changedRun = await lab.run({
    app, case: changedCase,
    runId: 'tutorial-after', createdAt: '2026-11-15T00:01:00.000Z',
    context: { priorRun: initialRun },
    execution: { timeoutMs: 15000 },
    reportOptions: { scope: 'all', locale: 'en-US' },
  });
  if (!lab.runs.validate(changedRun).valid) throw new Error('Invalid run artifact.');

  await mkdir('.output/comparisons/sdk', { recursive: true });
  for (const [name, value] of Object.entries({
    'before.run.json': initialRun,
    'changed.case.json': changedCase,
    'after.run.json': changedRun,
  })) {
    await writeFile(`.output/comparisons/sdk/${name}`,
      lab.sources.renderJSON(value, { maxBytes: 50000000 }), { flag: 'wx' });
  }
  console.log(changedRun.execution.status);
  console.log(changedRun.report.navigation);
} finally {
  await executor.close();
}
```

```sh
node compare-cases.mjs
```

The baseline record permits one incorrect report: its compatible explanations
agree on the red bag while leaving the exact marble open. Reducing the allowance
to zero makes the contradictory reports incompatible with every permitted
explanation. That is a calculated finding about the supplied assumptions, rather
than a runtime error or proof of which report is wrong.

Always inspect the execution state and the prepared report. A delivered artifact
can honestly describe invalid case values, an inconsistent record or incomplete
execution. `lab.runs.validate` checks the artifact contract and provenance
consistency; it does not authenticate the truth of submitted business facts.

## CLI: calculate, edit and compare

```sh
mkdir -p .output/comparisons/cli
npm exec --offline -- decision-lab run \
  --app examples/marble-evidence/app.json \
  --case examples/marble-evidence/case.yaml \
  --reports all --locale en-US --timeout-ms 15000 \
  --run-id tutorial-before --created-at 2026-11-15T00:00:00.000Z \
  --output .output/comparisons/cli/before.run.json
cp examples/marble-evidence/case.yaml .output/comparisons/cli/changed.case.yaml
```

In `changed.case.yaml`, change the case parameter `maxIncorrectReports` from `1`
to `0`. Then run:

```sh
npm exec --offline -- decision-lab case validate \
  --app examples/marble-evidence/app.json \
  --case .output/comparisons/cli/changed.case.yaml
npm exec --offline -- decision-lab run \
  --app examples/marble-evidence/app.json \
  --case .output/comparisons/cli/changed.case.yaml \
  --prior-run .output/comparisons/cli/before.run.json \
  --run-id tutorial-after --created-at 2026-11-15T00:01:00.000Z \
  --output .output/comparisons/cli/after.run.json
```

Outputs refuse overwrite. For another tutorial run, choose another output
directory. `--force` can replace calculation output when that is intentional;
it cannot replace immutable template or app packages.

## Archived output versus recomputation

| Intent | SDK `context` | CLI options |
| --- | --- | --- |
| Compare a retained calculation | `{ priorRun: previousRun }` | `--prior-run previous.run.json` |
| Recalculate the archive's embedded input | `{ priorRun: previousRun, comparisonMode: 'recompute-prior' }` | `--prior-run previous.run.json --recompute-prior` |
| Recalculate retained inputs | `{ priorInput: previousCase }` | `--prior-input previous.case.yaml` |

Only one prior source can be supplied. Archived comparison requires the same
app/release/package/module and compatible evaluator identity/build. Explicit
recomputation uses the installed evaluator and is labeled as recomputed; it
leaves the archive untouched. Cross-release rule comparison is outside this
workflow, including when recomputation is requested.

Optional revision history describes recorded inputs and identities. It does not
create prior conclusions without a prior run or prior input. See
[artifacts and versions](../reference/artifacts-and-versions.md) for the history
record contract.

Use `lab.sources.renderJSON` and `parseArtifact` when retaining SDK artifacts:
they preserve signed zero. Large run files need an explicit `maxBytes` allowance
up to `50000000` when parsed, rather than the smaller default artifact bound.

Next: [render the reports](render-reports.md) using only the resulting JSON.
