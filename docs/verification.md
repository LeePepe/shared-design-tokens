# Color candidate verification

Historical candidate.0 evidence follows; it is not a candidate.1 test receipt. The candidate.1 contract harnesses retain exact artifact/revision receipts outside the repository. See [executable checks](../ai/EXAMPLES.md).

## Local execution and independent reviews

The orchestrator reran the complete suite against the final code candidate after both repair rounds:

| Command | Actual result |
|---|---|
| `npm test` | 36 tests passed, 0 failed, 0 skipped |
| `npm run generate:check` | 6 generated outputs matched |
| `npm run test:consumer` | strict TypeScript compilation and emitted consumer execution passed |
| `npm run test:pack` | actual 18-file tarball installed in an isolated consumer; public exports and runtime consumption passed |
| packed CSS browser parity | Chrome 153.0.8010.53: 32 tokens, 1824 computed RGBA/scope rows passed |
| `swift build` / `swift test` | macOS host build passed; 4 XCTest cases, 0 failures |
| `git diff --check` | passed for the tracked diff; this alone does not validate untracked files |

Independent content reviews closed S1 (real CSS parsing/cascade), S2 (invalid explicit theme inheritance) and Q1 (RGBA member-order determinism). The unchanged files were bound by SHA-256 manifests and delta reviews. Functional Spec, Quality and cross-boundary review passed for the code. This is independent content review evidence, not a fabricated GitHub approval.

The initial AGENTS write was blocked. The Owner subsequently gave explicit authorization and the protected write succeeded. Only the agent index and related documentation were then changed; code and generated colors remain identical to the reviewed candidate. The final documentation delta is reviewed before publication of the PR.

## Boundaries

- Local results do not prove hosted CI success. Read the actual PR checks for its exact head SHA.
- CI configuration does not configure server-required checks or branch protection. No ruleset/bypass change is included.
- No package registry release, App release or business-project migration was performed.
- Swift platform declarations are not device, iOS/watchOS or older macOS execution evidence. The verification route is package-only; no xcodebuild or simulator was used.
- Browser checks concern CSS data parsing/values, not a UI visual review.
- The root context documents one leaf but has no machine frontmatter/resolver enforcement. This limitation is intentional and disclosed, not a successful layered audit.
- Basalt provenance is a fixed-version CDN file subset plus MIT attribution. The npm metadata E404 and lack of complete upstream tarball/React runtime verification remain documented in [upstream](upstream.md).

Raw local command logs and independent review reports are retained with the orchestrator's task evidence. CI must reproduce the repository-owned commands; consumers must pin a reviewed commit rather than this document's prose.
