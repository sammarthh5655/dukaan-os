# VERIFY-11 — Cash closing, attribution and cumulative integration

Verdict: **passed after separate repairs, self-verified**. Build `314dc01e78c15d4b07b83ea33c5a8d86de49fd11`; build/report remote confirmed at `ad5d08a2063dab71dd6a89f014dfaa34ebb28254`; final application runtime **`5275d14ec89de37f5bd78c10da360dd5ff5b24eb`**. Date: 12 September 2026.

## Findings and evidence

Imported cash entries could change source actors or omit/mismatch command metadata. Validation now binds actor, store, time, kind and correction links to the record. Closing amendments must be chronological. An empty closing input previously converted to zero; the UI now requires an explicit count, and both storage-mode browser journeys prove the empty field leaves the shift open. Empty cash categories normalize to zero.

**95 module tests and 85 browser groups passed** on this application runtime. The supplementary draft/transfer/count cash test changes tests only. Browser groups: cash 8, baseline 12, drafts 8, customer ledger 6, returns 6, suppliers 6, stock 6, stores 8, repository 9, migration 16. All browser runs used disposable Edge 152.0.4191.66 profiles and synthetic books. Public build `f13245838233b00ab8f5`; plan and whitespace checks passed. Diff, schema, source attribution and public assets reviewed. An initial supplier test used a nonexistent helper name; corrected it to the actual settlement API before the passing run.

## Every prior build

| Pair | Evidence and expected/actual result |
| --- | --- |
| 01-11 | Signed paise sum yields 380 expected, 375 counted and -5 variance; later shift yields 305. Quantity and monetary regressions remain exact. |
| 02-11 | Failed cash sale, manual entry and close restore the entire prior book and membership. Closed-ID and expense-ID retries do not duplicate cash. Delayed/rejected save UI gates rerun. |
| 03-11 | Both repository modes run the closing journey; cash records and closed membership equal journal replay. Native abort/concurrent writer/reopen cases rerun. |
| 04-11 | Encrypted fresh-profile recovery preserves two shifts, nine cash movements, count amendment and 305 expected; migration interruption and old-reader fence gates rerun. |
| 05-11 | A saved draft checkout/retry creates one cash entry and 600 expected from float 500. Receipt text survives subsequent counts/transfers; full draft pixel/recovery/browser tests rerun. |
| 06-11 | The midnight fixture collects 50 of customer debt without duplicating the bill; existing advance/linked collection/correction statement and recovery suites rerun. |
| 07-11 | **Carry-forward closed:** after formal close at 380 expected and 375 counted, the later 100 refund belongs only to the new shift. Byte comparison proves the earlier session is unchanged. Count amendment also preserves that original session. |
| 08-11 | Cash purchase/payment reduce the till; full supplier return and 120 cash refund restore a 500 opening to 500. Excess refund rejects without changing either book. Supplier UI/statement/replay tests rerun. |
| 09-11 | A physical stock count after a cash sale changes stock while expected cash stays 600; adjustment disposal/quarantine/reversal/import recovery suites rerun. |
| 10-11 | Transfer/receipt move no cash. Main and branch shifts remain 600 and 120 after a branch sale. A second store without an open shift rejects a cash sale atomically but allows UPI. Cashiers cannot post manual entries or close shifts. Store assignment/PIN/receipt/recovery browser suites rerun. |

All prior 45 pairs are reopened and re-established by the cumulative suites because the save hook and optional schema participate in their persistence path. There are now **55 passed pairs and 410 future planned pairs**; this does not certify unbuilt features.

## Limits and outcome

Failed final checks: **None**. Independent review: **None**. General sales-day filters remain browser-local until BUILD-12's reconciliation; cash business dates already use store timezone. Historical baseline entries remain disclosed rather than reconstructed. Device/printer/native-language and real-data cutover gates remain outstanding. No money, goods, supplier contact, production deployment or upstream merge occurred. The Sprint 1–10 PR branch stays unchanged. BUILD-12 is the next eligible local workflow.
