# Review marble evidence

Nine marbles belong to three bags. Exactly one is heavier. Three submitted observations of the same weighing disagree: left, right, left. Under a global allowance of at most one incorrect report, which bag must contain the heavy marble? Does the record identify the exact marble?

The model is deliberately finite. It considers each possible heavy identity, derives what each weighing would report, and retains the possibilities consistent with the supplied error allowance. Logical compatibility does not supply probabilities or permission to act.

From the documentation repository's root, after installing dependencies:

```sh
node examples/marble-evidence/sdk.mjs
sh examples/marble-evidence/cli.sh
```

Read the complete results at:

- `.output/marble-evidence/sdk.run.json`
- `.output/marble-evidence/cli.run.json`

Both contain `decision-lab-run/1`, including the assessment, provenance, complete report views and datasets, selector contexts, explanation relationships, and input tables. Use `run.report` to render reports. The small [expected summary](expected/summary.json) is a verification aid only.

With the supplied inputs, the **red bag is established**. The **exact marble remains underdetermined**: `r1`, `r2`, and `r3` all remain possible. A completed calculation can therefore contain both an established answer and an open answer to a finer question.

## Change the case

Edit [case.yaml](case.yaml), then rerun either quickstart. Case workers can supply the declared basis and observations, choose the published query IDs, and change `parameters.maxIncorrectReports` within its declared bounds. For example, setting it to `0` makes the contradictory observations inconsistent under this model. The reports then describe that inconsistency.

The identities and schemas of relations, rules, constraints, questions, and presentation bindings belong to the module author and are frozen in [app.json](app.json). Editing the module in [model.yaml](model.yaml) requires creating and reviewing a new app package; changing that file alone does not change what the quickstarts run.

## Recreate the app

These commands demonstrate the authoring workflow through either public interface:

```sh
node examples/marble-evidence/author.mjs
sh examples/marble-evidence/author.sh
```

The SDK writes a template definition and package, an app definition and package, and default case inputs to `.output/marble-evidence/authoring/sdk/`. The CLI writes the equivalent artifacts, validation receipts to stdout, and a complete run to `.output/marble-evidence/authoring/cli/`.

CLI packages are immutable and require new output paths. To repeat CLI authoring, supply a fresh **absolute** directory as the first argument:

```sh
sh examples/marble-evidence/author.sh /absolute/path/to/new-evidence-example
```

`node examples/verify.mjs` automatically selects fresh directories and verifies that SDK and CLI recreate the shipped app package exactly. Authoring uses the installed evidence-review pattern; declaring a template does not introduce an arbitrary evaluator.

See [create a template](../../docs/guides/create-a-template.md), [create an app](../../docs/guides/create-an-app.md), and [run and compare cases](../../docs/guides/run-and-compare-cases.md).
