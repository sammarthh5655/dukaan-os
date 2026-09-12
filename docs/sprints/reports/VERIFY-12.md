# VERIFY-12 — Complete statements and cumulative shop-day reconciliation

Verdict: **passed after separate repairs, self-verified**. Build `27528740c8f783a246306c22f7b4ef52fd3f1e4e`; build/report remote `e08bac39eefac29a39dc5570b1e41144bebd3dca`; final application runtime **`9b46e78aa0d277ae72a3417d6f4165d299110c6f`**. Date: 12 September 2026.

## Findings and final evidence

The first reconciliation implementation compared rate-tax totals but could miss a one-paise invoice/line disagreement or changed stock unit. It now reports invoice, per-invoice tax, stock unit/archive status and cash-source discrepancies, including them in CSV. Empty date fields no longer silently select today. The old overview is explicitly labelled with its browser-local/restated convention. The statement screen separately shows physical cash-count variances so agreement between recorded projections does not hide a shortage.

**102 module tests and 93 distinct browser test groups passed** on the final application runtime. A supplementary test-only change proves local account creation/migration, a saved draft, retry and Hindi settings preserve statement IDs and stock history. Browser groups: statements 8, cash 8, baseline 12, drafts 8, customer ledger 6, returns 6, suppliers 6, stock adjustments 6, store transfers 8, repository 9, migration 16. Edge 152.0.4191.66, disposable profiles and synthetic books only. The statement suite was additionally repeated to capture its final screen under a unique screenshot path after other suites overwrote a shared path; repeat runs are not counted as new groups. Build `ca7d3fa4532c9a37d1cd`, plan and whitespace checks passed.

## Every prior build

| Pair | Concrete evidence |
| --- | --- |
| 01-12 | Shop-day sales/tax/cost/profit are 210/10/120/80. Three fractional-cost returns reverse exactly the original cost, and one-paise invoice differences are explicitly reported. |
| 02-12 | Stock history and source mutations share the awaited save; failed restock restores the entire prior snapshot. Delayed sale/collection/caller gates rerun. Read-only exports leave the book unchanged. |
| 03-12 | Both repository modes produce the same seven exports and shop-day results. Native journal replay equals persisted projections; stock checkpoint replay separately yields four main-store units. |
| 04-12 | Encrypted fresh-profile restoration reproduces stock 4, gross profit 80 and cash movement -75. Restoring an earlier checkpoint in the same book does not invent a bridging stock movement. Migration interruption, fence and account-transition suites rerun. |
| 05-12 | Saved fractional cart survives local login migration; one checkout/retry yields one stock entry, 8.75 remaining units and sales 125. Receipt text and IDs survive a Hindi setting change and login disable. Full draft/browser receipt suites rerun. |
| 06-12 | Customer opening 200 + credit sale 105 - collection 50 = 255. Next-day void yields 150 without rewriting the previous day's sale statement. All 75 synthetic accounts, including an archived account, are exported; formula-like names are escaped. |
| 07-12 | Partial return contributes -105 sales, -5 tax and -60 cost; its original receipt remains unchanged. Cash refund is separate. Later dated void contributes -105 on its own day; malformed/duplicate return suites rerun. |
| 08-12 | Purchase 600 - initial payment 200 - supplier return 120 = supplier debt 280. Complete supplier CSV, reciprocal corrections, refunds and recovery suites rerun. |
| 09-12 | One counted loss changes physical stock and its history without changing cash/profit. Malformed before-state, revision, source, repeated event and current stock reject validation. Existing disposal/quarantine/reversal/CSV suites rerun. |
| 10-12 | Ten received units reconcile to four main + one branch + two net sold + two supplier-returned + one counted loss. Partial receipt and recall leave zero in transit; wrong-store and staff/PIN browser checks rerun. |
| 11-12 | Float 500 + net cash -75 = expected 425, count 420 and -5 variance, visible separately from record agreement. A 23-hour New York DST day includes exactly its two cash sales (200). Closed-shift/later-refund and count-amendment suites rerun. |

All prior 55 pairs were reopened for the save/schema/report changes and re-established by the cumulative suites. The matrix now has **66 passed pairs and 399 future planned pairs**.

## Cumulative milestone and limitations

J01–J05 are covered by the combined shop-day, draft, return, supplier, transfer, legacy checkpoint and fresh-recovery journeys; J07 lock/stale-context protections and existing public-asset/release/backup guards rerun. No unexplained recorded discrepancy passes. Cash shortages remain quantified physical-count differences, not a reason to alter the journal. Physical stock, tax compliance and native-speaker acceptance are not independently certified.

Historical movements before stock activation are unavailable and disclosed. Account/stock exports are complete available histories, while date filters apply to sales/tax/cash. The local login test is API sign-up plus existing browser login coverage; actual registration-form accessibility belongs to the newly expanded Sprint 13 criteria. Provider-backed sign-up/recovery belongs to Sprint 19. No cloud sync or real-data migration activation is implied.

Failed final checks: **None**. Independent review: **None**. No real payments, purchases, email delivery, deployment or upstream merge. The Sprint 1–10 PR remains separately pinned. BUILD-13 is the next local UI/accessibility slice.
