# Root context
Scope: repository. Canonical roles: source, validator, generator, consumer-test.

Single formal leaf for this small first package: [colors](colors-context.md).
Its scope is `tokens/**`, `scripts/**`, `tests/**` (including explicitly pathed Swift tests), `dist/**`, `Sources/**`, `.github/**`, `package.json`, `package-lock.json`, `Package.swift`.
Support exclusions: `AGENTS.md`, `README.md`, `docs/**`, `specs/**`, `THIRD_PARTY_NOTICES.md`, `.gitignore` (documentation/metadata); `.build/**`, `node_modules/**`, `.swiftpm/**`, `*.tgz` (local artifacts).
This is a documented single-leaf route, not an installed recursive resolver. Recursive resolver, hooks, layer anti-corruption tests and online required-check rulesets are deferred. Do not report unmapped/overlap zero as machine-verified or CI as required.

The Owner explicitly authorized the thin root AGENTS.md and the protected write subsequently succeeded. The index links this context and the existing constitution/specs; it does not claim installation of the deferred machine resolver or online policy.
