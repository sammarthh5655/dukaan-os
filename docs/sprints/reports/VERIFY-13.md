# VERIFY-13 — Local signup and core accessibility verification

Verdict: **automated integration gate passed after separate repairs, self-verified**. Native-language, actual screen-reader and whole-app large-text acceptance remain **experimental/open under D05**. This verdict is not accessibility certification.

Build implementation `9a6a8664617f514711bcc1287731ed28d35eeac3`; pushed build/report `2fe8c497efcd9e9120df539ff5f8139196a10631`; final tested runtime **`bb7bee0087bf23166329d4d37e5f61dccc15012c`**. Date: 12 September 2026.

## Findings and repairs

Review of the pushed implementation found that closing a nested dialog did not explicitly restore its parent's focus, an old dialog error could remain after a successful retry, and a failed optional language-preference write could report failure after the real settings save succeeded. The separate repair commit restores appropriate parent/opener focus, removes stale errors before retry and treats the logged-out language preference as optional. Context revocation still prevents protected callbacks or focus restoration into a locked shell.

Builder-stage findings are preserved in BUILD-13: deferred redraw and autofocus could steal keyboard focus; duplicated toast/dialog failures produced two announcements. The cumulative run confirms those fixes together with the later repairs. The verification harness initially awaited an intentionally unanswered prompt and therefore could not reach its next interaction; that test harness mistake was interrupted and corrected. It was not counted as a pass.

## Final evidence

**106 module tests and 111 browser groups passed** on the final runtime. Browser groups: baseline 12, drafts 8, customer ledger 6, returns 6, suppliers 6, stock adjustments 6, store transfers 8, cash shifts 8, statements 8, IndexedDB 9, migration 16, core account/accessibility 12 and separate adverse accessibility 6. Edge 152.0.4191.66; disposable profiles and synthetic data. Public build `4bc5cdf63cbf30eb54f1`; plan and whitespace checks passed.

Actual UI registration retains an existing ten-unit shop in both repositories; mismatch and duplicate-name attempts do not create another account. Hindi wrong-password correction, keyboard product lookup, increment/decrement, one 100-price sale, logout, subsequent login and PIN failure/correction retain nine units and exactly one bill. Frozen receipt text/pixels remain unchanged in the cumulative draft tests.

Separate browser cases verify nested parent/opener focus, a single focused error, clean retry and inert revoked callbacks. A 360-pixel Hindi registration form remains operable with doubled label/input/button text; its browser accessibility tree contains the field labels. Visually inspected that doubled-text registration dialog. Browser semantics are not an actual NVDA, VoiceOver or TalkBack run.

## All twelve new seams

| Pair | Concrete evidence |
| --- | --- |
| 01–13 | Locale token/reference checks and Hindi shop-day preserve numeric results: sales 210, tax 10 and profit 80. Product/account IDs do not depend on translated labels. |
| 02–13 | Focus survives awaited draft saves and redraws. Delayed sale, duplicate click and rejected collection regressions pass. Optional preference failure leaves a successfully saved Hindi setting successful. |
| 03–13 | Actual signup, sale, restart and access tests pass using both legacy storage and IndexedDB; native journal concurrency/atomicity/replay suites pass. |
| 04–13 | Signup moves the existing shop into its account in both storage modes. Interrupted migration, fences, stale source, archive quota and fresh encrypted recovery suites pass without data loss. |
| 05–13 | Keyboard quantity correction and charge produce one durable bill; stored draft/retry and staff/store isolation suites pass. Locale changes preserve frozen receipt text and image pixels. |
| 06–13 | Hindi shop-day customer opening 200 + credit sale 105 - collection 50 = 255. Complete customer CSV and authorization tests pass through the shared dialog changes. |
| 07–13 | Hindi partial return/refund leaves the original sale unchanged; return allocation, quarantine, cash settlement and recovery browser cases pass. |
| 08–13 | Hindi purchase 600 - payment 200 - supplier return 120 = supplier balance 280. Supplier correction/refund, full export and restored-history suites pass. |
| 09–13 | Hindi counted loss produces four source units after the remaining transactions; stock journal remains unchanged by locale switches. Disposal/reversal/CSV/replay suites pass. |
| 10–13 | Hindi transfer delivers one unit to the branch and leaves four at source. Staff PIN/store-assignment tests still deny unassigned access; nested modal and context-revocation tests pass. |
| 11–13 | Hindi float 500 + cash movement -75 = expected 425, physical count 420, variance -5. Earlier close/later-refund/count-amendment cases survive the shared modal repairs. |
| 12–13 | Combined Hindi shop-day reconciles sales, tax, customer/supplier balances, stock and cash with zero recorded differences. Switching back to English changes no business history. Seven statement exports and recovery tests pass. |

The prior 66 pairs were reopened for shared UI/save/focus effects and re-established by the cumulative suite. There are now **78 passed automated integration pairs and 387 future planned pairs**. Domain calculations, authorization and persisted schema definitions were not weakened to accommodate translation or accessibility changes.

## Remaining acceptance and recovery

Native-speaker review, real screen-reader/device testing and comprehensive large-text/zoom checks remain open, as explicitly permitted to remain experimental by D05. Some diagnostics and secondary money/report/recovery strings are still English; their broader localization is Sprint 14. The locale inventory proves coverage of referenced entries, not universal translation of every source string. Future release/pilot reports must retain these qualifications.

Provider-backed email signup, verification, reset and cross-device identity remain Sprint 19 using Postgres/Supabase. No cloud account/service or real mail has been created. The local account notice accurately describes browser-only storage and absent online recovery.

Failed final automated checks: **None**. Independent reviewer: **None**. No payment, supplier order, paid resource, production deployment or upstream merge. Keep current backups before Git rewinds; code history does not reverse business transactions, and earlier data fences remain in force. The Sprint 1–10 PR branch remains unchanged.
