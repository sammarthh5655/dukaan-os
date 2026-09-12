# VERIFY-14 — Hindi money/recovery and cumulative integration

Verdict: **automated integration gate passed, self-verified**. Native-language and assistive-technology acceptance remains experimental under D05. Build/runtime `42e4bd8a564459e2e244c4830e5da37ddbacff92`; pushed build/report `fe63b849fb0dbbdc770bb086984317c936a0dae0`; final test checkpoint **`819b7724a915a90c0bd82bb9558f8d23d461142c`** has the same application code. Date: 12 September 2026.

## Separate verification

Reviewed the pushed literal-translation boundaries, enum values, assets, keyboard input, gesture cancellation and recovery guards. No additional runtime repair was needed. Separate browser tests reject typed `1e2`, then commit exactly 12.50, changing customer balance 200 -> 187.50 and expected cash 1200 -> 1212.50. Cancelled pointer gestures open no action. Locking each of return, refund, advance, supplier correction, purchase return, stock count, closing and expense forms revokes retained submit callbacks and preserves the whole book. Locking pending backup authorization/password entry produces no download. Both storage modes pass.

**108 module tests and 127 browser groups passed.** The 111 earlier groups were rerun against the final application code; Sprint 14 adds 8 Hindi money/recovery groups and 8 separate adverse groups. Edge 152.0.4191.66, synthetic books and disposable profiles only. Public build `224763ed38691009ca54`, plan and whitespace checks pass. The final application runtime is unchanged from the built checkpoint; the test checkpoint adds evidence only.

## Every new pair

| Pair | Expected and actual evidence |
| --- | --- |
| 01–14 | Static-label translation never touches numeric formulas. Hindi builder journey finishes stock 11, sales 0, customer 150, supplier 100, expected cash 550, counted 548, variance -2 and zero recorded differences. |
| 02–14 | Delayed save/rejected collection/duplicate-submit baseline rerun. Typed malformed amount makes no movement; 12.50 commits once. Eight stale modal submit handlers cannot write after lock. |
| 03–14 | Every new UI journey runs against both repositories; IndexedDB concurrency, quota, atomicity and replay tests pass. |
| 04–14 | Actual Hindi export/download and fresh file restore reject a wrong password before successful recovery. Existing migration/fence/interruption/replay tests pass. Locking backup preparation prevents export. |
| 05–14 | Draft recovery/retry, quantity correction, account/store isolation and frozen receipt pixels/text all pass. Return UI preserves the original sale receipt. |
| 06–14 | Hindi advance 50 reduces customer debt 200 -> 150; separate typed collection 12.50 reduces 200 -> 187.50. Full ledger CSV and restoration tests pass. A customer literally named Balance stays unchanged. |
| 07–14 | Missing Hindi return reason rejects; one returned item and cash refund reverse one 100 sale. Existing tax/batch/partial-return/quarantine/recovery cases pass. |
| 08–14 | Purchase 120 plus signed correction -20 yields supplier debt 100 without creating cash. Supplier return/payment/credit-note/refund histories and recovery tests pass. |
| 09–14 | Count reduces one actual batch unit; stock ends at 11. Enum values retain their machine codes; adjustment/disposal/reversal/CSV/replay cases pass. |
| 10–14 | Assigned-store/PIN/transfer and immutable branch-receipt cases pass. Context changes cannot revive an old gesture or submitted financial form. |
| 11–14 | Blank Hindi closing count rejects. Expected 550, count 548 and shortage -2 remain distinct through encrypted restore. Later-refund/fixed-close/count-correction suite passes. |
| 12–14 | Hindi reconciliation explains source facts and shows matching rebuilt/current balances. Seven statement exports and combined shop-day cases pass; names and original notes remain original. |
| 13–14 | Real signup, Hindi login/logout, nested focus, doubled registration text and revoked-callback suites pass with the new dictionary. Labels/input values remain separate; native review is still not claimed. |

All previous 78 pairs were reopened for shared UI/locale effects and re-established by the cumulative suites. The matrix now records **91 passed automated integration pairs and 374 future planned pairs**.

## Qualifications and recovery

The [language contract](../MONEY-LANGUAGE.md) records owners of untranslated legacy diagnostics/prose, original exports/notes and pending native-language/device/AT review. Some UI CSV headers follow the selected language; stable record codes, column order and numbers remain unchanged. No universal Hindi coverage, screen-reader conformance or real-device certification is claimed. Frozen historical artifacts are not retroactively translated.

Failed final automated checks: **None**. Independent review: **None**. No real money, supplier contact, paid resources, deployment or upstream merge. The Sprint 1–10 PR branch remains pinned. Preserve backups before a code rewind: Git does not reverse business records. Next dependent build: Sprint 15 quantity units and safer voice interpretation.
