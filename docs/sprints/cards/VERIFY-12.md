# VERIFY-12 — Verify statements and reconciliation reports

Status: **passed**. Build under review: [BUILD-12](BUILD-12.md).
This is a separate verification sprint, not a renamed builder checklist.

## Entry and exact scope

Read the pushed BUILD-12 code/report and its predecessor evidence. Pin the actual code commit and application tree; identify whether the reviewer is independent or the implementer. Do not infer a pass from CI or from this planning card.

Feature acceptance to demonstrate:

All phase fixtures reconcile across journal, UI, CSV and receipts; rebuild projections from checkpoints plus new movements; test date boundaries and legacy caveats.

## Verification work

1. Review the final diff, schema changes, migrations, untracked/generated/configuration files and feature flags against the card.
2. Run relevant existing regressions and targeted negative/failure cases. Current baseline commands are `npm test`, `npm run build` and `npm run plan:check`; add/document real-browser or backend commands where this build requires them.
3. Test the changed feature through normal UI/API entry points and at the authorization/transaction boundary. Include restart, cancellation, duplicate submission, malformed input and applicable migration cases.
4. Check **every prior build**: [BUILD-01](BUILD-01.md), [BUILD-02](BUILD-02.md), [BUILD-03](BUILD-03.md), [BUILD-04](BUILD-04.md), [BUILD-05](BUILD-05.md), [BUILD-06](BUILD-06.md), [BUILD-07](BUILD-07.md), [BUILD-08](BUILD-08.md), [BUILD-09](BUILD-09.md), [BUILD-10](BUILD-10.md), [BUILD-11](BUILD-11.md).
5. For each due row in [seams.json](../seams.json), execute or substantiate the named recipe against the two actual features. Record expected/actual results, fixture and exact code hash; N/A needs a specific reviewed rationale plus shared-platform evidence.
6. Reopen affected older-to-older seams if this build changes their shared data/contracts. Run affected [higher-order journeys](../VERIFICATION.md), including valid and invalid operation orders.
7. Inspect recovery: Do not mark an unexplained difference as rounding noise; quantify and trace every discrepancy. This sprint ends with a cumulative shop-day verification.

## Cumulative milestone gate

Run J01–J05 and J07 with all completed local money/stock workflows, plus the existing release/backup guards. Independently reconcile one full synthetic shop day across bills, returns, purchases, adjustments, transfers, cash and statements. No unexplained discrepancy may pass.

## Gate result and push

Use **passed**, **failed** or **blocked**, and state independent versus self-verification. Money/stock discrepancies, lost/duplicate operations, cross-shop access and unrecoverable migration prevent a pass. A test that could not run is not a successful result.

Push `docs/sprints/reports/VERIFY-12.md` from the [verification template](../templates/VERIFY-REPORT.md), updated seam evidence/statuses, and any separately identified repair commits. Verify the remote SHA. Record all deviations and incomplete evidence, or “None”. No downstream dependent feature is promoted until this gate passes on the repaired code. [Delivery protocol](../DELIVERY.md).
