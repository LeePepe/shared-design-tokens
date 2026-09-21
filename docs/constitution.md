# Constitution
1. `tokens/colors.json` is the only editable color authority; schema and provenance are versioned. Generated files must be reproducible, never hand-tuned.
2. Basalt remains the Web theme/provider authority. We pin an audited subset of upstream values, not a second same-named theme. Our CSS is exclusively `--lp-…` under explicit selectors.
3. Separate foundation, brand, status and product semantics. Stable semantic IDs are not palette positions. Brand/theme/sorting/filtering must not change series identities. Color alone is not a status label, and green does not universally mean good.
4. Swift data target must never import UIKit, AppKit or SwiftUI. No business data, screens, services or native UI components here.
5. Unknown IDs, missing modes, invalid colors/references and generation drift fail closed. Preserve contrast for declared opaque text/surface pairs in both modes.
6. No credentials, deployment, auth edits, or business-repository edits. Third-party attribution travels with derived values. Do not publish this private pre-release package to a package registry or issue a package/App release without separate authorization. Normal reviewed branch/PR/CI delivery to this private repository is permitted.
