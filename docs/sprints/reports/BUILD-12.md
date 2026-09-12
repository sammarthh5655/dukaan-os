# BUILD-12 — Statements and reconciliation reports

Status: **built-unverified at build checkpoint**. Runtime `27528740c8f783a246306c22f7b4ef52fd3f1e4e`; predecessor verified runtime/report `3cb82080ed9679137fe3b937713b315a24e7e1b6`; subsequent authorized auth-plan update remote `80e04e5c63b37104e5fa0506d5e7a844089f1002`. Date: 12 September 2026.

## Changes and reasons

Added seven complete CSV statements and a reconciliation screen deriving balances, stock, cash and tax from recorded entries. Explicit stock-history activation checkpoints existing quantities, then journals committed quantity/unit/archive changes with actor and source references. Replay validates continuity and compares current projections; restore does not manufacture movements. Sales/tax/cash filters use store business dates. Dated voids and returns are separate correction events; cumulative return-cost rounding prevents fractional cost duplication. Archived accounts and incomplete legacy history remain visible. [Policy and limitations](../STATEMENTS-AND-RECONCILIATION.md).

## Actual builder evidence

- **98 module tests passed.** The combined shop day produces net sales 210, tax 10, cost 120, gross profit 80, customer balance 255, supplier balance 280, four source units and one branch unit, expected cash 425 and -5 closing variance. All ten received units reconcile across current stock, net sales, supplier return and counted loss. A next-day credit void leaves the first day's sales at 210 and reports -105 on the next day.
- **Six browser groups passed** in disposable Edge 152.0.4191.66 profiles: actual history activation and statement screens, seven downloaded CSVs, restart, both storage modes, migration/replay and encrypted fresh-profile recovery. The initial fixture let the scheduled morning brief obstruct the report; it now marks the synthetic brief seen and waits for the boot overlay. The final run passes without forced clicks.
- Visually inspected the desktop reconciliation screen: date controls, explanatory totals, account/stock comparisons and exports are readable. No mobile or printer claim.
- Public build `95c72e8808645a353822`; plan and whitespace checks passed.

## Scope and next gate

Historical stock movements before activation are unavailable; the checkpoint is explicit. This is a physical-quantity journal, not a fabricated legacy batch ledger. Customer/supplier statements reuse existing disclosed opening checkpoints. The legacy sales overview still uses its browser-local/restated convention; the new statement view uses business/correction dates. Gross profit excludes operating expenses. Internal agreement is not a physical or independent accounting audit.

Failed final builder checks: **None**. Independent review: **None**. No real-data migration activation, cloud registration, payment, deployment or upstream merge. Auth integration was separately added to future sprint acceptance at the user's request. VERIFY-12 must check malformed histories, dated/report discrepancies, complete exports, permissions and all 11 new pairs, reopen the prior 55 pairs and complete the cumulative local-shop gate.
