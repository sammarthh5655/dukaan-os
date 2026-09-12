# BUILD-13 — Hindi and accessible core navigation

Status: **passed**. Track: Shop floor.
Sizing target: 1–2 focused engineering days; split this card before exceeding 3. This is a slice budget, not a promised date.

## Why

The primary counter should work without essential English labels or pointer-only controls.

## Entry conditions

- [VERIFY-00](VERIFY-00.md) establishes the current baseline.
- Required predecessor gates: [VERIFY-12](VERIFY-12.md).
- Decision records: [D05](../DECISIONS.md).
- Use a verified integration tree. Missing decisions/hardware block only work that depends on them; reordering requires the seam reassessment in [VERIFICATION](../VERIFICATION.md).

## Build scope

Complete shell, login, lock, catalogue and checkout messages in English/Hindi; associate labels; provide modal focus handling, keyboard navigation, announcements and large-touch controls.

Author-requested account work: clearly label the existing device-local sign-up/login, preserve anonymous offline use, and test the actual sign-up form (not just an API-created fixture), confirmation/duplicate-name errors, existing-shop retention and subsequent sign-in/out. See [authentication integration scope](../AUTH-INTEGRATION.md). Online provider identity is BUILD-19.

Likely touch points (current files or proposed modules, not an instruction to create all of them blindly): `js/i18n.js`; `js/app.js`; `js/ui.js`; `js/pos.js`; `css/app.css`.

Out of scope: New languages and translating the entire money/report workflow in this slice.

## Acceptance contract

Complete sign-in, lookup, sale, error correction and lock using keyboard/screen-reader checks; Hindi text, large text and narrow screens remain usable.

Commit success must remain durable, permissions must be checked at the action boundary, and all affected existing bug/security regressions must remain passing. Builder tests should use independently derived expected results.

## Compatibility and recovery

No framework rewrite; add a visible-string/locale inventory and check missing keys. Native-speaker acceptance is recorded separately from automated checks.

## Integration handoff

Domain surfaces: ui, locale, identity, receipts. Default next gate: [VERIFY-13](VERIFY-13.md).

The default gate assesses this build against **all 12 earlier numbered builds**, plus the pre-plan baseline. This list is not limited to directly shared files. See all rows whose later build is `BUILD-13` in [the seam matrix](../SEAM-MATRIX.md). Later builds will add this feature to their own verification. Shared-contract changes also reopen affected older-to-older rows.

## Required pushed report

Create `docs/sprints/reports/BUILD-13.md` using the [build report template](../templates/BUILD-REPORT.md). Record what changed and why, actual tests and code hash, data/schema effects, deviations, failed or missing evidence, affected seams, recovery limitations and remote push verification. Mark **built-unverified** until VERIFY-13 passes. Follow [delivery rules](../DELIVERY.md); no merge or deployment is implied.
