# VERIFY-15 — Quantity precision and cumulative integration

Verdict: **automated integration gate passed, self-verified**. Pushed build/report `79a4a154805f627306a075aa6628767a54f94328`; repaired runtime **`8d9036afc4742ee2e650a82039cc935ef33794da`**. Date: 12 September 2026. Recorded audio and target-phone accuracy remain unverified; this is the typed-fixture gate permitted by the card.

## Separate findings and repairs

New adverse tests reproduced three missing validation boundaries: a positive sub-precision phrase could round to zero; null/false unit metadata was treated as absent; frozen receipt definitions were not validated on restore. Repairs reject these cases and fractional pack contents expressed in pieces. Receipt snapshots are validated independently of the current SKU. The ordinary cart editor also applies whole-unit rules.

Review identified that voice preflight ignored quantities already in the cart. It now rejects a request above combined available stock before any partial addition. Separate browser checks prove that 9.75 kg already in a cart plus a reviewed 500 g request leaves the draft and book unchanged, a changed price invalidates review, and lock revokes a retained submit handler. Both repositories pass. Incompatible second transfer lines already used staged copies; a new two-line test confirms the first source, target list and log remain unchanged. Compatible two-pack dispatch/receipt preserves the 250 g pack definition and leaves zero in transit.

## Evidence

**116 module tests and 139 browser groups passed**, including all 127 earlier browser groups, six unit builder groups and six separate adverse groups. The typed corpus has 24 exact acceptance/rejection cases; it does not measure a recognizer or background-noise accuracy. Public build `c916acbeed01385b55b8`, plan and whitespace checks pass. Edge 152.0.4191.66; synthetic books, isolated local servers and disposable profiles only.

| Pair | Expected and actual evidence |
| --- | --- |
| 01–15 | 250 g -> 0.25 kg; at 100/kg the sale is 25 and stock 10 -> 9.75. Positive quantities below supported precision reject; pieces and packs stay whole. Paise/tax/rounding suites pass. |
| 02–15 | Rejected fractional checkout does not advance bill number; stale/over-stock voice review changes no draft or book. Cumulative delayed-save, duplicate-submit, rollback and lock suites pass. |
| 03–15 | Unit UI and adverse journeys pass both repositories; existing native transaction, concurrency, quota and journal replay checks pass. |
| 04–15 | Unit marker, metadata and frozen line survive migration/replay and encrypted fresh restore. Malformed snapshot metadata rejects before restore. Earlier interruption/fence/recovery suites pass. |
| 05–15 | Unit label survives draft and receipt reload. Existing cart stock is included in voice review. Older frozen receipt pixels/text and draft isolation/retry cases pass. |
| 06–15 | Customer collection, advance, correction, credit checkout and restored ledger projection remain reconciled. Quantity validation occurs before checkout changes money. |
| 07–15 | Original line quantities remain the return source; cumulative partial return, tax, quarantine, refund, duplicate and recovery tests pass. New receipt metadata does not rewrite earlier documents. |
| 08–15 | Purchase batches and supplier adjustments/returns keep quantities in the selling unit. Supplier UI, statement, payment, reversal and recovery suite passes. |
| 09–15 | Stock validation covers explicit item/batch quantities. Existing count, quarantine, disposal, reversal and encrypted recovery journeys pass with the added book validator. |
| 10–15 | Two-line incompatible transfer leaves the entire book unchanged; compatible packs retain content size through receipt. Store assignments, denied access, replay and historical branch receipts pass. |
| 11–15 | Checkout/return cash movement remains derived from money totals. Full shift opening, expense, close, variance, correction, fixed-close and recovery suite passes. |
| 12–15 | Reconciliation and all statement exports retain their source units and numeric values; combined shop-day and encrypted restore suites pass. |
| 13–15 | Real local signup/login, labels, keyboard dialogs, focus restoration and late speech/lock callback rejection pass. No target-phone or native-speaker claim is made. |
| 14–15 | Hindi financial/recovery journey and typed keypad reject/accept checks pass. Hindi quantity digits and words are included in the synthetic corpus; original user names and machine option values remain unchanged. |

All 91 earlier pairs were reopened for shared quantity, receipt, draft and book-validation contracts and checked by the cumulative suites. The matrix records **105 passed automated integration pairs and 360 future planned pairs**.

## Limits and recovery

Failed final automated checks: **None**. Independent reviewer: **None**. Real recorded-audio, noisy-shop, native-language, assistive-technology, phone and printer acceptance remain unverified. No money was sent or spent, and no production deployment or upstream merge occurred. Existing SKU definitions cannot be changed in place. Preserve backups and use a compatible reader: a Git rewind cannot downgrade the new book marker. Next dependent build is simulated 58 mm receipt layouts; physical transport is Sprint 17.
