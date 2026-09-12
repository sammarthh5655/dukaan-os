# BUILD-14 — Hindi and accessibility for money and recovery

Status: **passed**. Track: Shop floor.
Sizing target: 1–2 focused engineering days; split this card before exceeding 3. This is a slice budget, not a promised date.

## Why

Secondary workflows carry the highest-risk errors and must be equally understandable.

## Entry conditions

- [VERIFY-00](VERIFY-00.md) establishes the current baseline.
- Required predecessor gates: [VERIFY-13](VERIFY-13.md).
- Decision records: [D05](../DECISIONS.md).
- Use a verified integration tree. Missing decisions/hardware block only work that depends on them; reordering requires the seam reassessment in [VERIFICATION](../VERIFICATION.md).

## Build scope

Localize new ledger, return, stock, cash, report and encrypted recovery flows; add accessible equivalents for swipe actions, error summaries and confirmation dialogs.

Likely touch points (current files or proposed modules, not an instruction to create all of them blindly): `js/i18n.js`; `js/ledger.js`; `js/settings.js`; `js/insights.js`; `js/ui.js`.

Out of scope: Regional language rollout and claiming machine translation is native review.

## Acceptance contract

Complete a return, advance, supplier correction, shift close and backup restore in Hindi with keyboard-only alternatives; lock cancels every pending flow.

Commit success must remain durable, permissions must be checked at the action boundary, and all affected existing bug/security regressions must remain passing. Builder tests should use independently derived expected results.

## Compatibility and recovery

Preserve financial meaning across translations; maintain tested key parity and untranslated-string exceptions with owners.

## Integration handoff

Domain surfaces: ui, locale, money, inventory, recovery, reports. Default next gate: [VERIFY-14](VERIFY-14.md).

The default gate assesses this build against **all 13 earlier numbered builds**, plus the pre-plan baseline. This list is not limited to directly shared files. See all rows whose later build is `BUILD-14` in [the seam matrix](../SEAM-MATRIX.md). Later builds will add this feature to their own verification. Shared-contract changes also reopen affected older-to-older rows.

## Required pushed report

Create `docs/sprints/reports/BUILD-14.md` using the [build report template](../templates/BUILD-REPORT.md). Record what changed and why, actual tests and code hash, data/schema effects, deviations, failed or missing evidence, affected seams, recovery limitations and remote push verification. Mark **built-unverified** until VERIFY-14 passes. Follow [delivery rules](../DELIVERY.md); no merge or deployment is implied.
