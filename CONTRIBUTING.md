# Maintaining the documentation

This repository documents the installed SDK and CLI and contains consumer
examples. Changes to the engine or UI implementation are maintained separately.

## Reader paths

- Keep [SDK.md](SDK.md) and [CLI.md](CLI.md) short enough to reach a first report.
- Put shared explanations in `docs/guides/` and exact contracts in
  `docs/reference/`.
- Use the same marble cases in both clients. Explain domain meaning as well as
  the data format.
- Every linked local input must be included in this repository. Avoid links to
  implementation files, private repository guides or developer workstation paths.
- Document actual supported behavior. A validator descriptor is not a complete
  JSON Schema; report data is not a shipped React component library.

## Check changes

From the repository root, after installing the public packages:

```sh
npm install
npm run check:docs
npm run verify
```

The first check validates local Markdown links. Verification runs the public SDK
and CLI examples and their authoring workflows, compares complete artifacts, and
checks the documented semantic summaries. Generated files belong in `.output/`.

Example shell scripts target a POSIX shell. On Windows, use a compatible shell
or follow the equivalent CLI commands directly. Public Node example programs use
Node APIs and platform-independent paths.

## Release documentation

Record which SDK/CLI pair is tested in [releases/README.md](releases/README.md)
and keep the example dependency pins deliberate. Update the separate changelogs
when either package changes. Preserve published documentation with release tags;
the compatibility reference describes evaluator, app and artifact versions
separately from npm versions.

API-reference updates can be derived from the public declaration files shipped
with the SDK. CLI-reference updates can be checked against command `--help`.
Publish only those public contracts and approved examples; generated reference
must not add links to private implementation files.

Keep the npm package READMEs self-contained with installation, one working
example and a link to the corresponding public guide. Update documentation
licensing and example reuse terms only when the rights holder has authorized
those terms.
