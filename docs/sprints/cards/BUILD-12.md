# BUILD-12 — Statements and reconciliation reports

Status: **passed**. Track: Local workflows.
Sizing target: 1–2 focused engineering days; split this card before exceeding 3. This is a slice budget, not a promised date.

## Why

New workflows are incomplete until their effects can be explained and exported.

## Entry conditions

- [VERIFY-00](VERIFY-00.md) establishes the current baseline.
- Required predecessor gates: [VERIFY-11](VERIFY-11.md).
- Decision records: [D02](../DECISIONS.md).
- Use a verified integration tree. Missing decisions/hardware block only work that depends on them; reordering requires the seam reassessment in [VERIFICATION](../VERIFICATION.md).

## Build scope

Produce full customer/supplier/stock/cash statements and return-aware tax/profit reports from journal projections; provide an independent reconciliation view and complete exports.

Likely touch points (current files or proposed modules, not an instruction to create all of them blindly): `js/insights.js`; `js/ledger.js`; `js/ui.js`; `reports`.

Out of scope: Tax-compliance certification and an AI service.

## Acceptance contract

All phase fixtures reconcile across journal, UI, CSV and receipts; rebuild projections from checkpoints plus new movements; test date boundaries and legacy caveats.

Commit success must remain durable, permissions must be checked at the action boundary, and all affected existing bug/security regressions must remain passing. Builder tests should use independently derived expected results.

## Compatibility and recovery

Do not mark an unexplained difference as rounding noise; quantify and trace every discrepancy. This sprint ends with a cumulative shop-day verification.

## Integration handoff

Domain surfaces: money, inventory, persistence, reports, receipts, locale. Default next gate: [VERIFY-12](VERIFY-12.md).

The default gate assesses this build against **all 11 earlier numbered builds**, plus the pre-plan baseline. This list is not limited to directly shared files. See all rows whose later build is `BUILD-12` in [the seam matrix](../SEAM-MATRIX.md). Later builds will add this feature to their own verification. Shared-contract changes also reopen affected older-to-older rows.

This is also a cumulative milestone: run all applicable higher-order shop journeys, not only this feature's tests.

## Required pushed report

Create `docs/sprints/reports/BUILD-12.md` using the [build report template](../templates/BUILD-REPORT.md). Record what changed and why, actual tests and code hash, data/schema effects, deviations, failed or missing evidence, affected seams, recovery limitations and remote push verification. Mark **built-unverified** until VERIFY-12 passes. Follow [delivery rules](../DELIVERY.md); no merge or deployment is implied.
