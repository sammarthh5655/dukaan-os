# BUILD-15 — Quantity units and safer noisy-shop voice

Status: **passed**. Track: Shop floor.
Sizing target: 1–2 focused engineering days; split this card before exceeding 3. This is a slice budget, not a promised date.

## Why

Recognizing a number is insufficient if grams, kilos and pack sizes are conflated.

## Entry conditions

- [VERIFY-00](VERIFY-00.md) establishes the current baseline.
- Required predecessor gates: [VERIFY-14](VERIFY-14.md).
- Decision records: [D02](../DECISIONS.md), [D05](../DECISIONS.md).
- Use a verified integration tree. Missing decisions/hardware block only work that depends on them; reordering requires the seam reassessment in [VERIFICATION](../VERIFICATION.md).

## Build scope

Add explicit item units/pack metadata, deterministic conversion and alias editing; create a consent-aware evaluation corpus and parser metrics; expose ambiguity/unknown quantities for confirmation.

Likely touch points (current files or proposed modules, not an instruction to create all of them blindly): `js/voice.js`; `js/pos.js`; `js/inventory.js`; `locale fixtures`.

Out of scope: A custom speech model or a promise of offline browser recognition.

## Acceptance contract

Examples with 250 g versus 0.25 kg, piece-only products, code-switching, homophones and background noise never silently bill a wrong item or unit; late callbacks after lock are inert.

Commit success must remain durable, permissions must be checked at the action boundary, and all affected existing bug/security regressions must remain passing. Builder tests should use independently derived expected results.

## Compatibility and recovery

Typed fixtures can ship first; actual recorded-audio and target-phone evidence is a separate required gate before an accuracy claim.

## Integration handoff

Domain surfaces: ui, locale, inventory, money, identity. Default next gate: [VERIFY-15](VERIFY-15.md).

The default gate assesses this build against **all 14 earlier numbered builds**, plus the pre-plan baseline. This list is not limited to directly shared files. See all rows whose later build is `BUILD-15` in [the seam matrix](../SEAM-MATRIX.md). Later builds will add this feature to their own verification. Shared-contract changes also reopen affected older-to-older rows.

## Required pushed report

Create `docs/sprints/reports/BUILD-15.md` using the [build report template](../templates/BUILD-REPORT.md). Record what changed and why, actual tests and code hash, data/schema effects, deviations, failed or missing evidence, affected seams, recovery limitations and remote push verification. Mark **built-unverified** until VERIFY-15 passes. Follow [delivery rules](../DELIVERY.md); no merge or deployment is implied.
