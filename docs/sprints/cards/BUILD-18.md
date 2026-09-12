# BUILD-18 — Local pilot and recovery release kit

Status: **blocked**. Track: Shop floor.
Sizing target: 1–2 focused engineering days; split this card before exceeding 3. This is a slice budget, not a promised date.

## Why

A trustworthy local release needs real operating evidence before cloud complexity.

## Entry conditions

- [VERIFY-00](VERIFY-00.md) establishes the current baseline.
- Required predecessor gates: [VERIFY-17](VERIFY-17.md).
- Decision records: [D01](../DECISIONS.md), [D05](../DECISIONS.md), [D06](../DECISIONS.md), [D07](../DECISIONS.md).
- Use a verified integration tree. Missing decisions/hardware block only work that depends on them; reordering requires the seam reassessment in [VERIFICATION](../VERIFICATION.md).

## Build scope

Add privacy-minimal pilot scripts, error/performance capture without customer payloads, versioned release checklist and recovery drills; fix one bounded class of pilot-blocking defects per slice.

Likely touch points (current files or proposed modules, not an instruction to create all of them blindly): `docs/pilot`; `release tooling`; `browser smoke fixtures`.

Out of scope: Deploying to a shop or collecting participant data without the agreed pilot scope.

## Acceptance contract

Named phone/browser completes a parallel-record shop day, cold offline start, installed-PWA upgrade, encrypted restore and recovery from interrupted writes; compare every money/stock movement.

Commit success must remain durable, permissions must be checked at the action boundary, and all affected existing bug/security regressions must remain passing. Builder tests should use independently derived expected results.

## Compatibility and recovery

Code completion and field acceptance are separate statuses; missing device/printer/participant evidence keeps the pilot release blocked.

## Integration handoff

Domain surfaces: money, inventory, identity, persistence, recovery, release, ui, receipts, locale. Default next gate: [VERIFY-18](VERIFY-18.md).

The default gate assesses this build against **all 17 earlier numbered builds**, plus the pre-plan baseline. This list is not limited to directly shared files. See all rows whose later build is `BUILD-18` in [the seam matrix](../SEAM-MATRIX.md). Later builds will add this feature to their own verification. Shared-contract changes also reopen affected older-to-older rows.

This is also a cumulative milestone: run all applicable higher-order shop journeys, not only this feature's tests.

## Required pushed report

Create `docs/sprints/reports/BUILD-18.md` using the [build report template](../templates/BUILD-REPORT.md). Record what changed and why, actual tests and code hash, data/schema effects, deviations, failed or missing evidence, affected seams, recovery limitations and remote push verification. Mark **built-unverified** until VERIFY-18 passes. Follow [delivery rules](../DELIVERY.md); no merge or deployment is implied.
