# Codex Integration Instructions

Integrate the API Intelligence Layer described in `docs/API_INTELLIGENCE_LAYER.md` into the CURRENT application incrementally.

## Non-negotiable constraints
- Preserve all existing working behavior.
- First inspect the real stack, directory structure, runtime, deployment model, existing API clients, MCP/tool integrations, environment configuration and tests.
- Reuse existing abstractions when they are good enough; do not create parallel systems unnecessarily.
- Do not mass-import the Public APIs catalogs.
- Treat catalogs only as discovery sources. Verify every provider against official documentation before production use.
- Keep all third-party credentials server-side.
- Prefer frontend -> backend/API gateway -> external provider.
- Implement CORS with explicit environment-specific origin allowlists; do not use a global wildcard as a shortcut.
- Do not refactor unrelated features.

## Implementation order
1. Produce a short architecture map of the current project and identify the least invasive integration points.
2. Add typed interfaces/models for Capability Registry and API Registry.
3. Add a server-side provider/gateway abstraction with timeout and normalized errors.
4. Add routing policy with deterministic fallback hooks.
5. Add secure environment/secret references without committing secrets.
6. Add CORS configuration and OPTIONS/preflight handling appropriate to the existing framework.
7. Add observability with credential/payload redaction.
8. Register only providers needed by current project use cases.
9. Add tests for success, timeout, provider failure, malformed response, fallback and disallowed CORS origin.
10. Run existing tests/lint/typecheck/build and fix only regressions introduced by this work.

## Before enabling any discovered API
Validate official docs, HTTPS, authentication, ToS/licensing, data handling, rate limits, cost, uptime expectations and whether browser CORS is actually supported.

## Deliverable
At completion, report:
- files changed;
- architecture decisions;
- APIs actually enabled (not merely discovered);
- environment variables required;
- security/CORS decisions;
- tests/build results;
- deferred improvements.
