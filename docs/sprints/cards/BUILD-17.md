# BUILD-17 — One tested printer transport

Status: **blocked**. Track: Shop floor.
Sizing target: 1–2 focused engineering days; split this card before exceeding 3. This is a slice budget, not a promised date.

## Why

A single proven hardware path is more useful than untested universal support.

## Entry conditions

- [VERIFY-00](VERIFY-00.md) establishes the current baseline.
- Required predecessor gates: [VERIFY-16](VERIFY-16.md).
- Decision records: [D06](../DECISIONS.md).
- Use a verified integration tree. Missing decisions/hardware block only work that depends on them; reordering requires the seam reassessment in [VERIFICATION](../VERIFICATION.md).

## Build scope

Implement the selected browser/USB/Bluetooth/companion transport for one named printer/device combination; capability detection, permission denial, cancellation and safe reprint; document encoding/raster strategy.

Likely touch points (current files or proposed modules, not an instruction to create all of them blindly): `printer adapter`; `js/ui.js`; `release permissions`.

Out of scope: Generic Bluetooth compatibility and broad hardware claims.

## Acceptance contract

Physical 58 mm print and scan on named hardware; disconnect mid-job; reconnect and explicitly reprint without generating a new sale or automatic duplicate print.

Commit success must remain durable, permissions must be checked at the action boundary, and all affected existing bug/security regressions must remain passing. Builder tests should use independently derived expected results.

## Compatibility and recovery

If hardware is unavailable, push code/report as blocked and keep support disabled; a screenshot or mock cannot close VERIFY-17.

## Integration handoff

Domain surfaces: receipts, ui, locale, identity, release. Default next gate: [VERIFY-17](VERIFY-17.md).

The default gate assesses this build against **all 16 earlier numbered builds**, plus the pre-plan baseline. This list is not limited to directly shared files. See all rows whose later build is `BUILD-17` in [the seam matrix](../SEAM-MATRIX.md). Later builds will add this feature to their own verification. Shared-contract changes also reopen affected older-to-older rows.

## Required pushed report

Create `docs/sprints/reports/BUILD-17.md` using the [build report template](../templates/BUILD-REPORT.md). Record what changed and why, actual tests and code hash, data/schema effects, deviations, failed or missing evidence, affected seams, recovery limitations and remote push verification. Mark **built-unverified** until VERIFY-17 passes. Follow [delivery rules](../DELIVERY.md); no merge or deployment is implied.
