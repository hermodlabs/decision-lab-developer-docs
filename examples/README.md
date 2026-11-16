# Runnable examples

These examples use the public npm packages. They need no Decision Lab implementation checkout, private imports, application storage, or marketplace connection.

| Example | Question | Installed pattern |
| --- | --- | --- |
| [Marble evidence](marble-evidence/README.md) | Does the recorded evidence establish the containing bag or exact marble? | `evidence-review/1` |
| [Marble learning](marble-learning/README.md) | Is another comparison worth buying before choosing a marble? | `assess-value-of-learning/1` |

Use Node **22.12.0 or later**. From this documentation repository's root, install its pinned dependencies and run:

```sh
npm install
node examples/marble-evidence/sdk.mjs
sh examples/marble-evidence/cli.sh
node examples/marble-learning/sdk.mjs
sh examples/marble-learning/cli.sh
```

The initial examples target `@decision-lab/sdk@0.1.0` and `@decision-lab/cli@0.1.0`. Registry installation requires those versions to be published. For prepublication review, install both supplied candidate tarballs together instead; see the repository's [SDK](../SDK.md) and [CLI](../CLI.md) instructions.

Each example includes:

| File | Purpose |
| --- | --- |
| `model.yaml` | Complete canonical model: frozen module declarations and starting case inputs. |
| `app.json` | An immutable app package built from that model and a versioned template. |
| `case.yaml` | Editable case inputs, without the frozen module. |
| `sdk.mjs` / `cli.sh` | Run the packaged app and save a complete RunBundle. |
| `author.mjs` / `author.sh` | Recreate a template and app from the canonical model. |
| `expected/summary.json` | Small verification summary; it does **not** replace the full report artifact. |

Generated runs are written under `.output/<example>/`. SDK and CLI quickstarts fix the same run ID, timestamp, locale, app package, and exact case source so their complete JSON results can be compared. These teaching timestamps identify reproducible examples; use appropriate identifiers and timestamps for your own runs. Calculation outputs may be overwritten when rerunning the quickstarts; shipped inputs and packages remain unchanged.

To check both examples, authoring workflows, artifact validation, expected findings, and complete SDK/CLI equality:

```sh
node examples/verify.mjs
```

Verification writes fresh authoring packages below `.output/` on each run. It reads the full artifacts and uses the SDK's `runs.validate` and `reports.validate`, rather than comparing only the summaries. `shared.mjs`, `author.mjs`, and `verify.mjs` are small consumer programs used by these examples, not part of the SDK's implementation.

The two cases are independent. The learning example takes its reviewed three-state basis as an explicit premise; it does not automatically import evidence conclusions or infer probabilities from the evidence example.
