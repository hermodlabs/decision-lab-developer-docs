# CLI changelog

## 0.1.0 — documented release candidate

Initial documented `decision-lab` executable:

- Template initialization, validation and immutable packing.
- App creation from a template and canonical model, validation, packing and
  package verification.
- Case initialization and validation against frozen app rules.
- Assessment-only `assess` and complete `run --reports all` for both patterns.
- JSON output/diagnostics, documented exit codes, explicit history comparison,
  cancellation, timeouts and atomic file delivery.
- Public `runCLI` embedding API that returns an exit code without terminating
  the host process.

Declares SDK `^0.1.0` as its production dependency. The examples pin both SDK
and CLI 0.1.0 to reproduce the documented pair. Requires Node 22.12.0+.
Package publication status is described in [release information](README.md).
