# BUILD-16 — 58 mm receipt layouts

Status: **passed**. Track: Shop floor.
Sizing target: 1–2 focused engineering days; split this card before exceeding 3. This is a slice budget, not a promised date.

## Why

A readable screen receipt is not proof that a narrow printed receipt is usable.

## Entry conditions

- [VERIFY-00](VERIFY-00.md) establishes the current baseline.
- Required predecessor gates: [VERIFY-15](VERIFY-15.md).
- Decision records: [D06](../DECISIONS.md).
- Use a verified integration tree. Missing decisions/hardware block only work that depends on them; reordering requires the seam reassessment in [VERIFICATION](../VERIFICATION.md).

## Build scope

Add measured 58 mm layouts and preview/export fixtures for paise, long names, Hindi glyphs, mixed tax, returns and QR; historical reprints use immutable snapshots.

Likely touch points (current files or proposed modules, not an instruction to create all of them blindly): `js/ui.js`; `css/app.css`; `receipts`; `QR fixtures`.

Out of scope: Claiming a physical printer is supported or adding transport before choosing hardware.

## Acceptance contract

Rendered width fits printable area; totals match statements; independent QR decode works at proposed sizes; wrapping and page breaks retain all lines.

Commit success must remain durable, permissions must be checked at the action boundary, and all affected existing bug/security regressions must remain passing. Builder tests should use independently derived expected results.

## Compatibility and recovery

Keep existing print/export fallback; publish dimensions and rendered samples, with simulated output clearly labelled.

## Integration handoff

Domain surfaces: receipts, locale, money, inventory, ui. Default next gate: [VERIFY-16](VERIFY-16.md).

The default gate assesses this build against **all 15 earlier numbered builds**, plus the pre-plan baseline. This list is not limited to directly shared files. See all rows whose later build is `BUILD-16` in [the seam matrix](../SEAM-MATRIX.md). Later builds will add this feature to their own verification. Shared-contract changes also reopen affected older-to-older rows.

## Required pushed report

Create `docs/sprints/reports/BUILD-16.md` using the [build report template](../templates/BUILD-REPORT.md). Record what changed and why, actual tests and code hash, data/schema effects, deviations, failed or missing evidence, affected seams, recovery limitations and remote push verification. Mark **built-unverified** until VERIFY-16 passes. Follow [delivery rules](../DELIVERY.md); no merge or deployment is implied.
