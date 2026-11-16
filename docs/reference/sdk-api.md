# SDK API reference

Applies to `@decision-lab/sdk` **0.1.0**. The package is ESM; Node integrations require **Node 22.12.0 or later**. Start with [SDK usage](../../SDK.md) for a runnable workflow.

## Public entry points

```js
import { createDecisionLab, DecisionLabError, SDK_VERSION } from '@decision-lab/sdk';
import { createNodeExecutor } from '@decision-lab/sdk/node';
// In a browser application instead:
// import { createBrowserExecutor } from '@decision-lab/sdk/browser';
```

Import through these three entry points. Private `dist` paths are not supported API. The main entry point also exports the `evidence`, `learning`, `syntax`, `hashing`, and `currentApps` namespaces and public TypeScript types. The package's declarations describe the full advanced surface; this reference covers the authoring and execution services used to build applications.

## Create a client

```ts
createDecisionLab(options?: { executor?: Executor }): DecisionLab
createNodeExecutor(): Executor
createBrowserExecutor(): Executor
```

The client has `sources`, `templates`, `apps`, `cases`, `reports`, and `runs` services, plus asynchronous `assess` and `run` methods. Creating a client or an idle executor does not start a worker. Authoring and validation require no executor. `assess` and `run` require an injected executor.

The SDK does not read files, persist data, install packages, or manage a marketplace. Supply objects or source text, and save returned artifacts in your application.

```js
const executor = createNodeExecutor();
const lab = createDecisionLab({ executor });
try {
  // Author, open, bind, and run through lab.
} finally {
  await executor.close();
}
```

## Source service

```ts
lab.sources.parseModel(text: string, options?: SourceOptions): CanonicalModelSource
lab.sources.parseCase(text: string, options?: SourceOptions): JSONObject | CanonicalModelSource
lab.sources.parseArtifact(text: string, options?: SourceOptions): JSONValue
lab.sources.renderJSON(value: unknown, options?: { space?: number; maxBytes?: number }): string

interface SourceOptions {
  file?: string;
  startLine?: number;
  maxBytes?: number;
}
```

`parseModel` requires the canonical `{ format, module, case }` envelope and a supported pattern identifier. `parseCase` accepts a case-only object or canonical model. Both decode the restricted YAML subset or JSON and check source format; they do **not** establish semantic validity. Invalid field values may be retained for later diagnostics.

`parseArtifact` decodes package, snapshot, and output source without verifying its declared artifact type or integrity. Follow it with the appropriate `open` or `validate` operation. `file` and `startLine` improve source locations in diagnostics.

`renderJSON` defaults to compact JSON and an 8 MiB artifact bound. `space` is an integer from 0 through 10; `maxBytes` can be raised to 50,000,000. It preserves negative zero. Use it instead of `JSON.stringify` when storing bound artifacts because normal JSON serialization converts `-0` to `0` and can change execution identity. See [bounds](errors-and-limits.md).

## Template service

```ts
lab.templates.create(options: TemplateOptions): TemplateDefinition
lab.templates.validate(definition: unknown): ValidationReceipt
lab.templates.pack(definition: unknown, metadata?: { createdAt?: string }): TemplatePackage
lab.templates.open(value: unknown): TemplatePackage

interface TemplateOptions {
  templateId: string;
  version: string; // Semantic version, for example "1.0.0".
  pattern: 'evidence-review/1' | 'assess-value-of-learning/1';
  title: string;
  description?: string;
  authoring?: {
    requiredModuleFields?: string[];
    guidance?: string;
  };
}
```

`create` returns an editable definition containing the installed reasoning contract. `pack` validates and freezes it into a versioned, hashed package. `open` validates an existing package and verifies its hash. These methods accept parsed data; `open`, `validate`, and `pack` also decode supplied source text.

`requiredModuleFields` adds presence requirements for known module paths, such as `assumptions` or `presentation.reports.comparison`. Required fields must be populated. Authors cannot add executable validators, replace the installed evaluator, require arbitrary unknown paths, or turn this descriptor into a custom JSON Schema. Inspect `definition.contract.schema.moduleFields` for permitted restriction paths.

```js
const template = lab.templates.pack(lab.templates.create({
  templateId: 'review-bounded-evidence',
  version: '1.0.0',
  pattern: 'evidence-review/1',
  title: 'Review bounded evidence',
  authoring: {
    requiredModuleFields: ['assumptions'],
    guidance: 'State the reviewed assumptions and the scope of the answer.',
  },
}));
```

The embedded `contract` is an **installed-validator descriptor**, not a full standalone JSON Schema. Its `structuralSlots`, `caseInputs`, capabilities, and limits explain ownership and supported authoring choices. Complete report support is provided by `run` and `reports`; the descriptor's historical report-responsibility wording is not the renderer contract.

## App service

```ts
lab.apps.create(options: {
  template: TemplatePackage;
  appId: string;
  release: number; // Positive safe integer.
  model: unknown;
  source?: string;
}): AppDefinition

lab.apps.validate(definition: unknown): ValidationReceipt
lab.apps.pack(definition: unknown, metadata?: {
  createdAt?: string;
  name?: string;
  description?: string;
  originWorkspaceId?: string | null;
}): AppPackage
lab.apps.open(value: unknown): AppPackage
```

The canonical model must match the template's pattern and pass structural module validation and template restrictions. `create` can retain invalid default case values in an editable definition. `validate` and `pack` also check publication admission and reject invalid defaults. After publication, case workers may bind invalid edited values for explicit diagnostic assessment.

If supplied, `source` must encode exactly the supplied model. Otherwise the SDK generates identified canonical source. Publication metadata describes the app without changing its rules.

```js
import { readFile } from 'node:fs/promises';

const source = await readFile('model.yaml', 'utf8');
const definition = lab.apps.create({
  template,
  appId: 'review-marble-evidence',
  release: 1,
  model: lab.sources.parseModel(source),
  source,
});
const app = lab.apps.pack(definition, { name: 'Review marble evidence' });
```

`open` verifies new app envelopes and compatible existing schema-5 app payloads/schema-1 wrappers. It returns a verified immutable envelope and preserves legacy payload identity; this does not silently migrate an old app's rules.

## Case service

```ts
lab.cases.create(options: { app: unknown; inputs?: unknown; source?: string }): CaseSnapshot
lab.cases.validate(options: { app: unknown; case: unknown }): ValidationReceipt
```

Omitting `inputs` copies the app's default case. Otherwise supply case-only inputs, a complete canonical model whose module is unchanged, or an existing `decision-lab-case/1` snapshot for the same exact app package and release.

```js
const inputs = lab.sources.parseCase(caseSource, { file: 'case.yaml' });
const snapshot = lab.cases.create({ app, inputs, source: caseSource });
const receipt = lab.cases.validate({ app, case: snapshot });
```

Snapshots retain a frozen module, case-only inputs, exact input source, app/release binding, and hashes. A snapshot that already contains source cannot also receive a separate `source` option. Case changes cannot alter module rules, presentation, vocabulary, app binding, or pattern. Change those through a new app release.

`create` can retain semantically invalid case values so a report can explain them. `validate` checks those values and returns an unsuccessful receipt. Binding or integrity failures remain errors.

## Run complete reports

```ts
lab.run(options: RunOptions): Promise<RunBundle>
```

Choose one input form:

```js
const run = await lab.run({
  app,
  case: snapshot,
  runId: 'marble-review-001',
  createdAt: '2026-11-15T00:00:00Z',
  execution: { timeoutMs: 15000 },
  reportOptions: { scope: 'all', locale: 'en-US', maxOutputBytes: 50000000 },
});
```

```js
// Unbound authoring or validated view preview:
const preview = await lab.run({ model, source, viewDefinitions });
```

The preview form has no app/package binding. Do not combine `model`, `source`, or `viewDefinitions` with `app` and `case`. Both forms support:

```ts
interface CommonRunOptions {
  runId?: string;
  createdAt?: string;
  execution?: { timeoutMs?: number; signal?: ExecutionAbortSignal };
  reportOptions?: { scope?: 'all'; locale?: string; maxOutputBytes?: number };
  context?: {
    priorRun?: unknown;
    priorInput?: unknown;
    comparisonMode?: 'recompute-prior';
    history?: unknown;
    currentDraft?: {
      sourceHash: string;
      inputHash?: string;
      diagnostics: Array<{ message: string; code?: string; path?: string }>;
    };
  };
}
```

`scope: 'all'` is the only report scope. The result contains every retained selector context, not just a currently selected screen. Consume `run.report` to build views; see the [report output contract](report-output.md).

Execution outcome and decision status are different. A resolved run can contain invalid inputs, an underdetermined answer, or cancelled reasoning. Inspect `run.execution`, `run.assessment`, `run.report.notices`, and report availability. Output-size failure rejects rather than returning a successful truncated bundle.

## Comparison context

```js
const changed = await lab.run({ app, case: changedSnapshot, context: { priorRun: run } });
const recalculated = await lab.run({
  app, case: changedSnapshot,
  context: { priorRun: run, comparisonMode: 'recompute-prior' },
});
```

- `priorRun` compares retained assessment output. It must pass run validation and match the app/release/module binding and installed evaluator identity/build.
- `priorInput` recomputes an earlier input with the installed evaluator. For a bound app run, case-only inputs and matching snapshots are accepted through the normal case-binding operation.
- `comparisonMode: 'recompute-prior'` uses a prior run's input rather than treating its archived conclusions as current evaluator output. It requires `priorRun`.
- Supply one prior source, not both. The supplied archive is never rewritten.
- `history` supplies up to 64 retained revisions. Use an array or `{ revisions: [...] }`; each release-bound entry needs `id`, `createdAt`, `modelHash`, `moduleHash`, and the same `binding` as the case snapshot. An explicit `{ scope: 'module', revisions: [...] }` can identify module-scoped historical metadata whose release binding is unavailable. Optional retained `modelSnapshot` and source identity fields must agree with their hashes. Metadata alone does not establish earlier findings.
- `currentDraft` identifies a draft that has not produced an accepted calculation. It marks the retained report as a previous calculation; it does not substitute that draft for evaluated input.

## Assessment-only operation

```ts
lab.assess(options: {
  app: unknown;
  case: unknown;
  execution?: { timeoutMs?: number; signal?: ExecutionAbortSignal };
  runId?: string;
  createdAt?: string;
}): Promise<AssessmentArtifact>
```

This emits `decision-lab-assessment/1`: input, identity, execution, and a pattern assessment or `null`. It is not a complete report document. Use `run` when reports are required.

## Report and run validation

```ts
lab.reports.create(options: CreateReportOptions): DeepReadonly<ReportDocument>
lab.reports.validate(value: unknown): ValidationReceipt
lab.runs.validate(value: unknown): ValidationReceipt
```

`reports.create` synchronously materializes reports from a compatible `model` and `assessment`. Optional fields are `identity`, `evaluatedInput`, `source`, `context`, `viewDefinitions`, and `reportOptions`. This is for callers who already hold an assessment and its exact provenance. Prefer `run` to keep evaluation and report generation in one worker job. It is not a React renderer.

Validation checks declared schemas, identities, reference closure, and supported report content. It does not prove that a source, assumption, or human-authored rule is true.

## Executor interface

```ts
const task = executor.execute({ pattern: model.format, model }, {
  jobId: 'optional-job-id',
  timeoutMs: 30000,
  signal: abortController.signal,
});
const started = await task.started;
const outcome = await task.result;
task.cancel('User cancelled');
await executor.close();
```

`started` resolves `true` after a correlated worker acknowledgment before evaluation, or `false` if stopped beforehand. `result` resolves after the worker stops. `close` cancels active jobs and waits for their workers. A direct assessment job returns the original pattern assessment, not a full report. The overload for report jobs is primarily used by `lab.run`.

Options accept an optional `inputHash`, which must equal the executor's canonical job hash. Do not confuse a complete report job's hash with a case's evaluation input hash. Unsupported options or malformed nonportable input are rejected before a worker starts.

## Advanced namespaces

| Namespace | Public responsibility |
| --- | --- |
| `evidence` | Finite-relational model/case validation, source conversion, synchronous assessment, assessment comparison, presentation helpers, and connection projections. |
| `learning` | Learning model/case validation, explicit probability parsing, source conversion, synchronous assessment, basis grouping, and economic/timing projections. |
| `syntax` | `parseDefinitionJSON`, `parseDefinitionYAML`, and `renderDefinitionYAML`; decoding does not admit a model. |
| `hashing` | `definitionHash(source)` hashes exact UTF-8 text; `canonicalHash(value)` supplies the existing sorted-JSON identity. These do not verify a package or bind a case. |
| `currentApps` | Compatibility preparation/verification of existing frozen app payloads. It performs no persistence or installation. |

For synchronous assessment use `evidence.evaluateEvidenceModel(model)` or `learning.evaluateLearningModel(model)` deliberately: they run on the calling thread. Use a worker adapter for responsive interfaces, deadlines, and hard cancellation. The [canonical model reference](canonical-yaml.md) defines the two installed patterns.
