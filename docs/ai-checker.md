# Producer contract checker scope

The producer-local checker in `scripts/check-ai-contract.mjs` checks artifact
integrity and documentation linkage. Its schema is `ai/registry.schema.json`.
It is not the future shared-ci policy resolver, an Owner-approval validator,
a compatibility theorem, or evidence of remote required checks.

## Supported inputs

Registry, package manifest and token source must have JSON object roots. Null,
arrays and primitive values fail with `AI_JSON_SHAPE`; malformed JSON fails
with `AI_JSON`. The caller supplies the exact expected package name/version;
there is no latest, network resolver or fallback.

Direct CLI invocation resolves symlinked entry paths before checking; imports
remain side-effect free. The symlink CLI regression test covers both passing
and failing exits, including the macOS temporary-directory layout.

The npm manifest must use a nonempty subpath `exports` map containing `.`.
Entries are explicit `./` file targets or nonempty condition maps using
`types`, `import` and `default`, whose values are explicit file targets.
Arrays, patterns, nested conditions and other export forms are outside this
package's supported checker scope and fail with `AI_EXPORT_SHAPE` or
`AI_EXPORT_UNREGISTERED`. Every target must have a registry surface entry.

Documentation navigation uses inline Markdown links with relative targets,
optionally with a simple heading fragment. Paths must be portable and remain
inside the inspected artifact after symlink resolution; absolute paths and
file URIs fail with `AI_DOC_LINK`, even when they currently point inside it.
HTTP(S) citations are not fetched or certified. Reference-style links
(full, collapsed, or defined shortcut references) deliberately fail with
`AI_DOC_SYNTAX`; rewrite them as inline links. Code spans/fences are examples,
not reference-link navigation. This is a bounded Markdown checker, not a
general renderer or HTML-link validator.

Backslash-escaped inline backtick delimiter syntax is deliberately unsupported
outside fenced code and fails closed with `AI_DOC_SYNTAX`, even when link targets
exist. Conservatively, any backslash immediately followed by a backtick outside
a fence is rejected before inline code stripping (including inside inline code
examples). Use plain prose or place that syntax in a fenced example. Ordinary
inline code spans, fenced examples and plain inline navigation remain supported;
this checker does not implement general Markdown escape parsing.

API fingerprints conservatively cover entire referenced artifacts, while a
bounded lexical declaration inventory checks named JavaScript/TypeScript/Swift
symbols. Fingerprints detect signature and data changes, including changes that
may not be breaking. Independent review and compiled consumer fixtures decide
compatibility; updating a fingerprint alone does not establish approval.
