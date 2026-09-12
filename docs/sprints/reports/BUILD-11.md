# BUILD-11 — Cash shifts, expenses and closing

Status: **built-unverified at build checkpoint**. Runtime `314dc01e78c15d4b07b83ea33c5a8d86de49fd11`; predecessor verified remote `61bdab1bfbcb656a0b43e94f5358b78c27d512bb`. Date: 12 September 2026.

## Changes and reasons

Owners can open a till with a physical float, record cash expenses/withdrawals, close with counted cash and variance, reverse a manual movement in a later shift, and append a closing-count correction. Existing cash source records are attributed in the same durable save, so sale/payment success cannot precede cash attribution. First activation checkpoints historical sources; subsequent cash activity in each store requires an open shift there. Store timezone and posting-date rules make midnight and late entries explicit. Details and complete CSV exports retain original and reported counts. [Cash policy](../CASH-SHIFTS.md).

## Actual builder evidence

- **91 module tests passed.** Independently summed fixture: 500 opening + 100 sale + 50 collection - 80 purchase - 20 supplier payment - 100 refund - 30 expense - 40 withdrawal = 380 expected. Count 375 gives -5 variance. Later opening 375 - refund 100 + expense reversal 30 = 305 while the earlier original close remains unchanged. Cash/UPI separation, exact retries, failed saves, count amendments and encrypted restore pass.
- **Six browser groups passed** on disposable Edge 152.0.4191.66 profiles, covering actual opening/expense/withdrawal/closing/correction screens across midnight, CSV, reload, both storage modes, migration/replay and encrypted fresh-profile restore.
- Visually inspected the desktop cash dashboard: opening floats, expected/count/variance, dates and actions are readable. Phone and physical cash counts were not tested.
- Public release `626066d9f10c4bc81660`; build, plan structure and whitespace checks passed.

## Limits and next gate

Cash business dates use the store timezone; existing general sales report filters still use browser-local days pending BUILD-12's unified reconciliation. Count correction changes the reported count only, never an already-open later float. New optional cash collections fence older strict clients. Encrypted checkpoints preserve records; Git rewind is not a data rollback. Local history is not tamper-proof storage.

Failed final builder checks: **None**. Independent review: **None**. No real payments, purchases, deployment, merge or real-data migration activation. VERIFY-11 must validate source/membership imports and permissions, close SEAM-07-11's deferred later-refund requirement, assess ten new pairs and reopen the prior 45 affected pairs. The Sprint 1–10 PR branch remains pinned separately.
