# Releases and supported versions

## Documented pair

| SDK | CLI | SDK/CLI Node minimum | Artifact families |
| --- | --- | --- | --- |
| 0.1.0 | 0.1.0 | 22.12.0 | Template, app, case, assessment, run and report version 1 |

These docs were prepared against local release candidates. They do not announce
registry publication. Once these versions are published, the pinned installation
commands in the quickstarts can resolve them from npm. Before publication, the
same examples can run in a disposable copy installed with both candidate
archives as described in the [main README](../README.md).

The package release qualification covers Node 22.12.0 and 24.16.0. Browser SDK
integration was qualified with Vite 8.3.0, Playwright 1.62.1 and Chromium
157.0.8103.78. The complete Decision Lab UI has a separate Node minimum of
22.19.0 because of its own dependencies; that UI requirement does not apply to
ordinary SDK/CLI consumers. This does not claim validation on every browser,
operating system or build tool.

## Documentation checks

Both runnable examples and their SDK/CLI authoring workflows pass with installed
candidate packages outside the implementation repository on Node 22.12.0 and
24.16.0. Verification compares complete run/report artifacts, reproduces the
included app packages, validates their contracts and checks the expected findings.
The copyable SDK and CLI quickstarts also produce identical complete bundles.

The browser guide's Vite build executes the packaged module worker in Chromium.
The report-only HTML table inspector renders all 34 generic tables delivered by
the marble evidence example without SDK, model or evaluator imports. All local
Markdown links are checked by the included `npm run check:docs` tool.

## Independent versions

The SDK, CLI, installed pattern/evaluator, template, module, app release and
artifact schema have different identities. A module's `version` is not its npm
package version. See [artifacts and versions](../docs/reference/artifacts-and-versions.md)
before upgrading or comparing retained results.

Use the [SDK changelog](sdk-changelog.md), [CLI changelog](cli-changelog.md) and
[upgrade guide](upgrading.md). After publication, preserve this documentation with
a tag identifying the tested SDK/CLI pair.
