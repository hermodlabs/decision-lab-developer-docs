# Support

Use this documentation repository's issue tracker for reproducible SDK/CLI
problems and documentation corrections. The implementation repository is private;
you do not need its source to report a public API problem.

## Include a reproducible case

Provide:

1. SDK and CLI versions (`npm exec --offline -- decision-lab --version`), Node
   version (`node --version`), operating system, and browser/build tool if relevant.
2. The smallest app configuration and case input that demonstrate the problem,
   with permission to share those records publicly.
3. The exact public API call or CLI command, expected behavior, observed behavior,
   exit code and structured diagnostic codes.
4. For existing app packages, the app ID, release, pattern and relevant artifact
   schema versions. For history issues, identify whether the prior calculation
   was archived or explicitly recomputed.

Remove credentials, personal information and confidential business records from
public examples. Use synthetic inputs where necessary. Do not post a full private
run bundle merely to report a UI problem: bundles retain evaluated inputs.

## First checks

- Confirm Node is at least 22.12.0 and imports use ESM.
- Run [the included examples](examples/README.md) using their documented versions.
- Check the [CLI reference](docs/reference/cli-commands.md) and
  [error/limit reference](docs/reference/errors-and-limits.md).
- Verify the case belongs to the app's unchanged module and release.
- Distinguish calculation completion, report delivery and the business finding.
  An open answer or invalid business input can be an intended result.
- For browser workers, use an HTTP origin and the documented
  [browser integration](docs/guides/browser-integration.md).

Issues are requests for investigation, not a promise of a particular support
response time. This repository does not designate a private security-reporting
channel; use a separately established private contact for sensitive reports.
