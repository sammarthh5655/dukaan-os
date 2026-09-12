# BUILD-11 — Cash shifts, expenses and closing

Status: **passed**. Track: Local workflows.
Sizing target: 1–2 focused engineering days; split this card before exceeding 3. This is a slice budget, not a promised date.

## Why

Daily reconciliation needs explicit opening cash and non-sale movements.

## Entry conditions

- [VERIFY-00](VERIFY-00.md) establishes the current baseline.
- Required predecessor gates: [VERIFY-10](VERIFY-10.md).
- Decision records: [D02](../DECISIONS.md).
- Use a verified integration tree. Missing decisions/hardware block only work that depends on them; reordering requires the seam reassessment in [VERIFICATION](../VERIFICATION.md).

## Build scope

Add opening float, cash collection/refund/purchase effects, reason-coded expenses and owner withdrawals; close a shift with counted cash and a recorded variance; corrections remain linked.

Likely touch points (current files or proposed modules, not an instruction to create all of them blindly): `js/insights.js`; `js/core.js`; `js/ledger.js`; `repository`.

Out of scope: Bank reconciliation, payroll and silently reopening signed-off shifts.

## Acceptance contract

Open, sell cash/UPI, collect debt, pay supplier, refund, withdraw and close across midnight; expected cash matches an independent movement sum.

Commit success must remain durable, permissions must be checked at the action boundary, and all affected existing bug/security regressions must remain passing. Builder tests should use independently derived expected results.

## Compatibility and recovery

Define store timezone and late-entry policy; reopen/correct via an auditable operation rather than rewriting a closed shift.

## Integration handoff

Domain surfaces: money, identity, persistence, reports. Default next gate: [VERIFY-11](VERIFY-11.md).

The default gate assesses this build against **all 10 earlier numbered builds**, plus the pre-plan baseline. This list is not limited to directly shared files. See all rows whose later build is `BUILD-11` in [the seam matrix](../SEAM-MATRIX.md). Later builds will add this feature to their own verification. Shared-contract changes also reopen affected older-to-older rows.

## Required pushed report

Create `docs/sprints/reports/BUILD-11.md` using the [build report template](../templates/BUILD-REPORT.md). Record what changed and why, actual tests and code hash, data/schema effects, deviations, failed or missing evidence, affected seams, recovery limitations and remote push verification. Mark **built-unverified** until VERIFY-11 passes. Follow [delivery rules](../DELIVERY.md); no merge or deployment is implied.
