# Decision Lab developer documentation

Build applications that ask what evidence establishes and whether another study
is worth buying. The SDK and CLI share the same authoring contracts, evaluators,
case binding and complete report output.

| Start here | What you can do |
| --- | --- |
| [JavaScript / TypeScript SDK](SDK.md) | Integrate authoring, execution and reports into your own Node or browser application. |
| [Command-line interface](CLI.md) | Create app packages and calculate complete reports from files or shell scripts. |
| [Runnable examples](examples/README.md) | Run the same marble cases through both clients and compare their outputs. |

## Supported release

These documents target `@decision-lab/sdk` **0.1.0** and `@decision-lab/cli`
**0.1.0**, using ESM and Node **22.12.0 or newer**. The examples are checked
against those release candidates. Registry installation commands apply once
those versions have been published; this documentation does not announce npm
availability. See [release and compatibility information](releases/README.md).

The implementation repository is private. This repository contains developer
documentation, public input configurations, and consumer examples. Installed npm
packages include executable JavaScript and public type declarations.

## Two workflows

**Run an existing app:** open its package, supply case inputs, and calculate a
run. The package fixes the module's rules and meaning. Case inputs supply the
permitted facts and assumptions for this calculation.

**Author an app:** choose an installed reasoning pattern, create a template,
provide a canonical module and starting case, validate them, then pack an app.
Packing creates an immutable portable artifact; the SDK does not upload it to a
registry or install it into Decision Lab.

```text
Installed pattern → Template → App package → Case → Run → Report views
```

## Guides

- [Concepts and division of labor](docs/concepts.md)
- [Create a template](docs/guides/create-a-template.md)
- [Create an app](docs/guides/create-an-app.md)
- [Run and compare cases](docs/guides/run-and-compare-cases.md)
- [Render reports from JSON](docs/guides/render-reports.md)
- [Use the SDK in a browser](docs/guides/browser-integration.md)

## Reasoning patterns

| Pattern | Question | Example |
| --- | --- | --- |
| [Evidence review](docs/patterns/evidence-review.md) (`evidence-review/1`) | Does a fixed record establish the requested answer across every permitted explanation? | Does the weighing record establish the bag containing the heavy marble? |
| [Learning value](docs/patterns/learning-value.md) (`assess-value-of-learning/1`) | Does a study and complete response policy improve expected value over choosing now? | Is another marble comparison worth its fee before the choice expires? |

Templates configure supported authoring choices within these installed patterns.
They do not install new evaluators or arbitrary executable rules.

## Reference

- [SDK API](docs/reference/sdk-api.md)
- [CLI commands](docs/reference/cli-commands.md)
- [Canonical YAML](docs/reference/canonical-yaml.md)
- [Report output contract](docs/reference/report-output.md)
- [Artifacts and versions](docs/reference/artifacts-and-versions.md)
- [Errors, outcomes and limits](docs/reference/errors-and-limits.md)

The SDK returns a complete run with an assessment and prepared report document.
Client renderers use `run.report`, its datasets, selection contexts and navigation
actions. The SDK supplies no React component library. A fully delivered report
can describe an open question, invalid inputs or unfinished evaluation; successful
file delivery does not establish a business conclusion.

## Run this repository's examples

After the documented npm versions are available:

```sh
npm install
npm run example:evidence:sdk
npm run example:evidence:cli
npm run example:learning:sdk
npm run example:learning:cli
npm run verify
```

These commands run from the repository root. They install only the public npm
packages, require no implementation checkout, and write generated files beneath
`.output/`. The two package versions are pinned in [package.json](package.json).
If you have candidate archives before registry publication, install both together
instead: `npm install /path/to/decision-lab-sdk-0.1.0.tgz /path/to/decision-lab-cli-0.1.0.tgz`.
Use a disposable copy for that check because npm records local archive locations
in its package manifest and lockfile.

## Releases, help and terms

- [SDK changes](releases/sdk-changelog.md)
- [CLI changes](releases/cli-changelog.md)
- [Upgrading](releases/upgrading.md)
- [Support](SUPPORT.md)
- [Documentation maintenance](CONTRIBUTING.md)
- [Documentation and example terms](LICENSE)

Package usage is governed by the LICENSE and NOTICE included with each npm
package. The existing licensing status is UNLICENSED; no new usage or
redistribution permission is granted by this documentation.
