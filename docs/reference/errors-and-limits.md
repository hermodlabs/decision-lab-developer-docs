# Errors, outcomes, and limits

The SDK separates source/binding errors, worker execution outcomes, mathematical decision statuses, and complete-report delivery. Handle each at its own level.

## Validation receipts and thrown errors

Public `validate` methods return a receipt:

```ts
interface ValidationReceipt {
  valid: boolean;
  complete?: boolean;
  issues: Array<{
    message: string;
    code?: string;
    path?: string;
    file?: string;
    line?: number;
  }>;
}
```

Creation, opening, packing, binding, and run-request failures normally throw `DecisionLabError` with `code`, `stage`, and `issues`; the first issue's `path`, `file`, or `line` is also exposed when available. Inspect codes, not human-readable message wording. Direct advanced pattern APIs can also throw their declared model-validation errors.

```js
import { DecisionLabError } from '@decision-lab/sdk';

try {
  const run = await lab.run({ app, case: snapshot });
  // Inspect run.execution and report qualifications before using findings.
} catch (error) {
  if (error instanceof DecisionLabError) {
    console.error(error.code, error.stage, error.issues);
  } else {
    throw error;
  }
}
```

Useful public-service error categories include:

| Codes / category | Response |
| --- | --- |
| `SOURCE_SYNTAX_ERROR`, `SOURCE_FORMAT_ERROR` | Correct unsupported syntax, duplicate properties, envelope, or source size. |
| `UNSUPPORTED_PATTERN`, `TEMPLATE_CONTRACT_MISMATCH` | Use a supported installed pattern and its unchanged reasoning contract. |
| `TEMPLATE_PATTERN_MISMATCH`, `TEMPLATE_REQUIREMENT_MISSING` | Match the canonical model to the template and populate authored presence requirements. |
| `INVALID_MODULE`, `INVALID_CASE_VALUES` | Review structured validation issues; module authoring and case-value validation are separate. |
| `FROZEN_MODULE_EDIT`, `CASE_APP_MISMATCH` | Supply case inputs for the correct frozen release or author a new app release. |
| `ARTIFACT_INTEGRITY_MISMATCH`, `SOURCE_MODEL_MISMATCH` | Restore the matching original artifact/source or create a new valid artifact through the services. |
| `EXECUTOR_REQUIRED` | Inject the Node or browser executor before `run`/`assess`. |
| `EXECUTION_INPUT_INVALID`, `INVALID_EXECUTION_OPTIONS` | Supply bounded portable data and supported executor options. |
| `COMPARISON_INVALID`, `COMPARISON_INCOMPATIBLE_APP` | Correct the prior input, history, or exact release/module binding. |
| `COMPARISON_INCOMPATIBLE_EVALUATOR` | Use a compatible archived run or explicitly recompute its input. |
| `REPORT_IDENTITY_MISMATCH`, `REPORT_INVALID` | Keep model, assessment, provenance, and report references together. |
| `REPORT_OUTPUT_LIMIT`, `ARTIFACT_SIZE_LIMIT` | Narrow the case/views/context or use an adequate supported serialization ceiling. A successful partial report is not returned. |

This is a handling guide, not an exhaustive registry of every advanced namespace diagnostic.

## Execution outcomes

Executors resolve typed outcomes after the worker has stopped:

| `status` | Result |
| --- | --- |
| `completed` | Evaluation finished; mathematical assessment may still be invalid, inconsistent, or underdetermined. |
| `resource-limited` | A declared computation bound was reached; retains honest partial/diagnostic assessment and a structured error. |
| `cancelled` | Stopped by cancellation; no invented assessment. |
| `timed-out` | Deadline reached; no invented assessment. |
| `failed` | Worker/protocol/operational failure; structured error. |

`lab.run` turns stopped execution into fully materialized unavailable report families. It rejects report output-limit failures. Low-level executor setup errors, malformed requests, and identity mismatches can throw before an outcome is available.

Use `AbortController.signal`, `task.cancel(reason)`, or `executor.close()` for cancellation. The default deadline is **30,000 ms**, including worker startup. Run jobs include report projection within that worker deadline. Closing an executor cancels active work and waits for workers to stop.

## Mathematical statuses

Evidence query statuses are:

- `established`: a nonempty admitted basis and completed check establish the answer; `false` can be established.
- `underdetermined`: admitted interpretations give different answers; disagreement can already be decisive before exhaustive enumeration completes.
- `inconsistent`: the completed check finds no admitted interpretation.
- `incomplete`: the unfinished check does not establish the answer.
- `invalid`: input/model issues prevent the calculation.
- `not-assessed`: the requested capability is unsupported, including probability in the evidence pattern.

The overall evidence assessment uses `invalid`, `incomplete`, or `complete`; inspect individual queries and coverage rather than treating `complete` as “all answers are yes.”

Learning assessments use `invalid`, `inconsistent`, or `complete`. A completed calculation may conclude that no action/study is feasible or that multiple choices tie. Accepted facts with no compatible positive-probability state do not support a recommendation. Recommendations remain conditional on the supplied distributions, payoffs, objective, and constraints.

## Transport and source bounds

| Boundary | Installed bound |
| --- | --- |
| Canonical model/case source | 200,000 characters. |
| Restricted YAML / ordinary definition parsing | Depth 64 and a 100,000-node data budget. |
| Ordinary portable authoring / assessment-job transport | 8 MiB UTF-8, 200,000 nodes, depth 64. |
| Complete report-job transport and report artifacts | 50,000,000 UTF-8 bytes, 3,000,000 nodes, depth 96. |
| `sources.parseArtifact` / `renderJSON` default | 8 MiB; explicit `maxBytes` can raise it to at most 50,000,000. Large bounds apply to JSON artifacts; they do not raise the canonical model/case or YAML source ceiling. |
| Comparison history | At most 64 retained revisions. |

These boundaries apply together; the first applicable limit can reject a request. Pattern-specific validators can be stricter. The evidence module/model portable validator has a 150,000-node/depth-64 bound; learning has a 100,000-node/depth-32 bound.

Only finite acyclic JSON data is accepted. Reject or convert `NaN`, infinity, BigInt, functions, class instances, accessors/getters, circular references, sparse/custom-property arrays, symbols, and unsafe property names before passing data. Parse input through the SDK when source-location diagnostics matter.

## Installed evidence computation bounds

| Item | Maximum |
| --- | ---: |
| Relations | 64 |
| Columns per relation | 16 |
| Rules | 128 |
| Queries | 64 |
| Submitted rows | 20,000 |
| Candidate interpretations | 100,000 |
| Rule rounds | 1,000 |
| Facts | 100,000 |
| Counted operations | 10,000,000 |

`case.evaluation` may lower `maxCandidates`, `maxRuleRounds`, `maxFacts`, or `maxOperations`; it cannot raise them. The module language has additional local array/identifier bounds enforced by its validators. Inspect exported `evidence.EVIDENCE_LIMITS` and the template contract for installed values.

Complete evidence reports additionally bound question/explanation contexts to **100,000**, table cells to **400,000**, and connection projections to **2,048**. Complete materialization fails explicitly if all retained contexts cannot fit.

## Installed learning computation bounds

| Item | Maximum |
| --- | ---: |
| States | 64 |
| Actions | 32 |
| Studies | 16 |
| Reports per study | 16 |
| Attributes | 32 |
| Sensitivity scenarios | 32 |
| Reference records | 10,000 |
| Counted operations | 2,000,000 |

Inspect `learning.LEARNING_LIMITS` for installed values. Probability normalization tolerance is **1e-9**. Complete learning reports bound table cells to **400,000** and projected chart rows to **100,000**, in addition to the overall artifact ceiling. Configured views and their bindings have their own validated limits.

## CLI diagnostics and exit codes

```json
{
  "error": {
    "code": "CLI_ARGUMENT_ERROR",
    "stage": "cli",
    "message": "Missing required option --app.",
    "path": "--app"
  }
}
```

Diagnostics use stderr. Output artifacts use stdout or `--output`. Exit codes are `0` for delivered/completed requests, `2` for argument/validation/binding errors, `3` for stopped/resource-limited execution, and `4` for operational/delivery failures. Semantically invalid case values can produce a delivered diagnostic run with exit `0`; inspect its assessment and report notices.

An existing output path produces `OUTPUT_EXISTS`. Use `--force` only for replaceable drafts/cases/calculation output; immutable template/app packages require a new path. `CLI_IO_ERROR` identifies read/write failures. The CLI writes files atomically and does not publish partial output on a delivery failure. See the [command reference](cli-commands.md).
