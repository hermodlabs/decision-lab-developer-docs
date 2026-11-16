# Complete report output

`lab.run(...)` and `decision-lab run --reports all` return the same versioned output contract. The complete report is intended to support a custom interface, static export, or document generator **without calling an evaluator or opening an app package while rendering**.

The SDK supplies semantic data and prepared text. Your application supplies rendering, navigation state, accessible interaction, and visual layout. It does not ship a ready-made React component library or an HTML/PDF report command.

## RunBundle

```ts
interface RunBundle {
  format: 'decision-lab-run/1';
  identity: RunIdentity;
  input: EvaluatedInput;
  execution: {
    protocolVersion: 1;
    jobId: string;
    inputHash: string;
    jobHash: string;
    status: 'completed' | 'resource-limited' | 'cancelled' | 'timed-out' | 'failed';
    error?: { code: string; message: string };
  };
  assessment: EvidenceAssessment | LearningAssessment | null;
  report: ReportDocument;
}
```

`input` retains exactly what was evaluated, including model, case inputs, source, and identities. `assessment` is the mathematical result. `report` is the complete renderer contract; a renderer should not derive new findings from the assessment or reapply module rules.

`execution.inputHash` identifies the evaluation input. `jobHash` identifies the complete worker request, including report/context options. A report bundle can retain `assessment: null` when execution stopped. Its report explicitly explains unavailability.

## ReportDocument

| Field | Consumer responsibility |
| --- | --- |
| `format` | Require the supported `decision-lab-report/1` contract. |
| `identity`, `evaluatedInput`, `provenance` | Retain app/template/module/evaluator/input versions and source provenance. |
| `completeness` | Distinguish delivered report completeness from completed reasoning. |
| `notices` | Display invalid, incomplete, stale, stopped, and other qualifications. |
| `navigation` | Build navigation from the supplied hierarchy and literal target view IDs. |
| `selection` | Populate supported selector identities and defaults. |
| `views` | Render each selected view's title, question, description, and ordered blocks. |
| `datasets` | Resolve referenced typed tables, matrices, conflicts, and visual projections. |
| `contextIndexes` | Resolve the prepared data for a selected question/explanation/study/scenario. |

```js
const receipt = lab.runs.validate(run);
if (!receipt.valid) throw new Error(receipt.issues.map(x => x.message).join('\n'));

const report = run.report;
const firstLeaf = nodes => {
  for (const node of nodes) {
    if (node.targetViewId) return node;
    const child = firstLeaf(node.children ?? []);
    if (child) return child;
  }
};
const firstView = report.views[firstLeaf(report.navigation)?.targetViewId];
```

Validation verifies the output contract and references. Treat it as structural/integrity validation, not evidence that human assumptions are true. A renderer can consume an already-validated saved report without importing the SDK at all.

## Completeness and unavailable findings

Successful delivery declares:

```json
{
  "materialized": true,
  "allRequestedViews": true,
  "allRetainedContexts": true,
  "truncated": false,
  "assessmentComplete": true
}
```

`assessmentComplete` can be **false** while the other fields remain true. A cancelled or timed-out run has fully delivered explanatory report families but no invented assessment. Invalid cases can retain exact submitted input and checks without numerical findings.

“All retained contexts” means every interpretation or study/scenario context retained in the assessment is included. It does not transform an interrupted finite search into coverage of every possible interpretation. Preserve coverage notices and availability reasons.

The SDK rejects output that exceeds complete-delivery bounds with `REPORT_OUTPUT_LIMIT`; it does not silently truncate rows and declare success. A renderer may paginate or virtualize a complete dataset locally.

## View blocks

Each `report.views[id]` has `id`, `title`, optional `question`/`description`, and ordered `blocks`.

| Block `kind` | Resolve / render |
| --- | --- |
| `text` | Render prepared `text` as text. |
| `json` | Render `label` and prepared `text`, usually in an expandable reference view. |
| `table` | Resolve `datasets[datasetId]` and render its columns and typed cells. |
| `matrix` | Render the prepared questions-by-explanations matrix. |
| `conflicts` | Render prepared ruled-out possibilities and qualifications. |
| `question-interpretation-context` | Resolve `contextIndexes[contextIndexId]` by selected question and explanation. |
| `interpretation-table` | Resolve the selected explanation and block `tableId`; respect block `columns`/`collapsed`. |
| `connection-context` | Resolve the configured block `viewId`, selected explanation, and selected item. |
| `interpretation-reference` | Resolve the selected explanation's prepared reference. |
| `payoff-bars` | Resolve its prepared learning projection; retain table/bar choices and the acting-now reference. |
| `timeline` | Resolve its prepared learning projection; retain table/timeline choices and timing qualifications. |

Use the declared kind and references. Do not infer an app's domain or renderer from a title, app ID, or collection name. If a consumer does not support a declared component, show that limitation instead of silently hiding the data.

## Typed tables

```json
{
  "id": "example:table",
  "kind": "table",
  "label": "Example result",
  "columns": [{"id": "answer", "label": "Answer"}],
  "rows": [{
    "cells": {
      "answer": {
        "kind": "boolean",
        "raw": false,
        "display": "No",
        "available": true
      }
    }
  }]
}
```

For each row, iterate the declared columns and read `row.cells[column.id]`. Render `display`; use `raw` for appropriate numeric plotting, exports, or sorting. `false`, `0`, `[]`, and an empty string can be values. Do not use truthiness as an availability check.

Cells include `available`, and unavailable cells include a `reason`. Optional `description` supplies explanatory copy. Preserve missing/unavailable values rather than converting them to zero. These are prepared data fields, not HTML strings; render text safely in your framework.

## Navigation actions and synchronized selection

A clickable cell or projection row can contain a literal action:

```json
{
  "targetViewId": "explanations:remaining:some-group",
  "selection": {
    "selectedQueryId": "containing-bag",
    "selectedInterpretationId": "some-interpretation"
  }
}
```

The identifiers above are illustrative; apply actual returned actions. Merge `action.selection` into shared view state and navigate to `targetViewId` when supplied. An action without a target updates selection only. Do not regenerate a target string from a business label.

```js
function applyAction(state, action) {
  return {
    ...state,
    ...action.selection,
    ...(action.targetViewId ? { viewId: action.targetViewId } : {}),
  };
}
```

Keep a single selection state across tabs so redundant selectors stay synchronized. Representation choice (table/diagram/bar/timeline) is also a view preference, not a new calculation.

## Context indexes

Each index has an explicit `keys` array and `entries`. Entries identify a context and usually a `datasetId`, a `targetViewId`, prepared context, or a list of supporting tables. Resolve with the index's keys, not row position.

```js
function findContext(report, indexId, selection) {
  const index = report.contextIndexes[indexId];
  return index?.entries.find(entry =>
    index.keys.every(key => entry[key] === selection[key])
  );
}
```

This helper expects the **index's field names**. Evidence UI state uses `selectedQueryId`/`selectedInterpretationId`; translate them to `queryId`/`interpretationId` when looking up that index. The report's `selection.contextKeys` declares these state bindings.

### Evidence contexts

| Index | Keys |
| --- | --- |
| `questionInterpretations` | `queryId`, `interpretationId` |
| `interpretationTables` | `interpretationId`, `tableId` |
| `connectionSelections` | `viewId`, `interpretationId`, `selectedItemId` |
| `interpretationReferences` | `interpretationId` |

Use `selection.queryIds`, `selection.interpretationIds`, and `selection.defaultInterpretationByQuery` for valid identities/default explanations. Labels and prepared findings are in `datasets.evidence.queries` and `datasets.evidence.interpretations`; `datasets.evidence` is prepared semantic UI data, not a generic table dataset.

`questionInterpretations` includes an overall finding and the answer in the selected explanation, plus a typed context table. These have different meanings. An underdetermined overall question can have a definite answer in each selected explanation; do not present that local answer as established across all explanations.

The overview matrix contains grouped question rows, explanation columns, overall status, and prepared cells/actions. It is already resolved; no comparison of raw model answers is needed in the renderer.

### Learning contexts

| Index | Keys / role |
| --- | --- |
| `studyResponses` | `studyId`: target response view and all supporting response tables. |
| `configuredViews` | `viewId`: economic or temporal projection dataset. |
| `scenarioResults` | `scenarioId`: sensitivity comparison and target view. |
| `scenarioStudyResponses` | `scenarioId`, `studyId`: the selected scenario's report-to-action response. |

Selector identities are in `selection.studyIds`, `basisGroupIds`, and `scenarioIds`. Prepared labels, comparison summaries, response tables, basis groups, and configured views are in `datasets.learning`. The explicit target views and indexes avoid rebuilding response logic or choosing an action in the renderer.

## Connection diagrams and tables

Datasets with `kind: 'connections'` contain a prepared `projection` with:

- `status`, `issues`, and `qualification`;
- labeled `nodes`, directed `edges` using `from`/`to`, and prepared `paths`;
- `details`, `legend`, and case-target data;
- `layout`, allowed `representations`, and `defaultRepresentation`;
- optional item `selector`, and `scope` identifying the selected interpretation and coverage.

Draw the supplied connections and labels. Use layout only to position them; do not derive additional routes or relationships from input tables. A diagram describes the selected explanation's relationships, not every possible explanation at once. The table/diagram toggle displays the same prepared context. Unavailable projections retain their reason and must not fall back to a previous explanation's graph.

## Payoff bars

`kind: 'payoff-bars'` wraps a learning projection. Its `chart` declares label/value fields; `rows` provide numeric values and prepared display labels. The optional `reference` has `role: 'acting-now'`, a value, field, label, and display text for the benchmark. Use the returned measure and reference; a fee or incremental-value view is not automatically the same axis as a net-value view.

Preserve negative values, ties, unavailable alternatives, and recommendation flags. Do not rank unavailable/null values as zeros. `datasets.learning.configuredViews` retains the matching `tableDatasetId` for representation switching.

## Timelines / Gantt-style views

`kind: 'timeline'` wraps a projection with chart start/end/label bindings, relative `time` units/origin, prepared rows, milestones, display values, and allowed representations. Table and timeline use the same assumptions and row context.

Read `authority` and `qualification`:

- `evaluated-prospective` describes calculated study completion and declared action availability. It does not establish a resource-feasible operating schedule or actual completion.
- `reference-only` describes supplied milestones from records. These do not establish authorization, execution, or action availability.

Preserve milestone roles, deadlines, unavailable-action reasons, and sensitivity context. Do not infer calendar dates from relative times without a separately reviewed application binding.

## Saving and reloading

```js
const text = lab.sources.renderJSON(run, { maxBytes: 50000000 });
// Save text using your storage layer.
const restored = lab.sources.parseArtifact(text, { maxBytes: 50000000 });
const check = lab.runs.validate(restored);
```

Use the SDK serializer for identity-sensitive artifacts, including negative zero. Reuse returned display text to preserve the selected locale. Re-running with another locale generates a new report projection; displaying a saved report does not require recalculating it. See [artifacts and versions](artifacts-and-versions.md) for archive and comparison compatibility.
