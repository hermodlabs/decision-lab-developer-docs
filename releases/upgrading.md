# Upgrading

## Inspect the change

Read the separate [SDK](sdk-changelog.md) and [CLI](cli-changelog.md) changelogs
and the [compatibility reference](../docs/reference/artifacts-and-versions.md).
Record the package versions, evaluator identity/build, app release and artifact
schemas associated with the outputs you retain.

Pin the desired SDK/CLI pair in your application and install it deliberately.
Run your canonical inputs and report-rendering checks with that pair before
adopting it. Public examples in this repository can provide an initial smoke
check, but your own domain rules and cases also need review.

## Preserve original artifacts

Keep original template/app packages, cases and retained run output. Installing
a package does not rewrite those files or migrate application storage.
Use the SDK's artifact parsing and serialization functions when handling bound
artifacts so signed zero and execution identity are retained.

App packages freeze module rules and presentation. A rule change requires a new
app release or app identity, then a separately bound case. Changing an npm
dependency alone is not a new authored app release.

## Compare intentionally

Archived output is a retained calculation under its recorded evaluator. Default
archive comparison requires compatible evaluator identity/build. To evaluate the
old input under the installed evaluator, request `comparisonMode:
'recompute-prior'` in the SDK or `--recompute-prior` in the CLI. This does not
rewrite the archive or relabel a current calculation as historical.

Cross-release rule comparison is outside this API. Unsupported formats and
patterns require an explicit supported migration or new authored package; do not
edit hashes or version strings to bypass validation.

## Update your renderer

Validate the new report artifact and supported component kinds. Preserve
availability reasons, notices, typed values, selection contexts and navigation.
If your renderer does not support a component, report that limitation explicitly.
See [report output](../docs/reference/report-output.md) and
[rendering](../docs/guides/render-reports.md).
