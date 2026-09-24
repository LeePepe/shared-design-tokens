# Plan
1. Capture upstream published 2.1.8 metadata, CSS, provider declaration and MIT license. Select traceable baseline values.
2. TDD tracer: source resolver API then implementation. Add strict validation and contrast tests in subsequent red/green slices.
3. Deterministic outputs and fail-closed JS/CSS/TS consumer API; packed consumer fixture.
4. Pure Swift API and parity tests; build and test on host only.
5. Determinism/drift/negative gates, CI and consumer/upgrade docs. Save execution evidence outside the repo and stop before commits.

Design: Node standard library; JSON Schema plus runtime validator enforcing semantic DAG constraints. Generated ESM and declaration/TypeScript data, scoped CSS and Swift, resolved JSON. No service, runtime framework, online requirement or auth hook.
