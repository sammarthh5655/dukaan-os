# VERIFY-16 — Narrow receipts and cumulative integration

Verdict: **automated simulated-layout gate passed, self-verified**. Pushed build/report `5b2e33507c51659ff9a4d036c3864e663a6f7665`; test checkpoint **`7184d449efd612731aa479f528545306acecc741`**, same application code as builder `23a01e7ed657e892318a450218f89ed047e0140b`. Date: 12 September 2026. Physical printer support is not certified.

## Separate verification

Reviewed snapshot boundaries, HTML escaping, script-disabled iframe, explicit output buttons, QR sizing and public asset/cache inclusion. Hostile shop/item text is printed literally, not executed. Voiding a sale while its preview is open rejects both print and download; a reopened preview is visibly cancelled with no QR. Lock destroys the preview and revokes retained callbacks. Cross-store preview is denied. Migration/replay and encrypted fresh restore reproduce identical frozen void output. No runtime repair was needed during this separate phase.

**119 module tests, 155 browser groups and 4 additional PDF checks passed.** All 139 prior browser groups were rerun; Sprint 16 contributes eight builder and eight adverse groups. Public build `a93414d27add65f18a44`, plan and whitespace checks pass. Edge 152.0.4191.66; both repositories, disposable profiles and synthetic books.

PDF checks use an independent jsQR 1.4.0 decoder against Poppler's 203 dpi raster of every page. Both complete payment amounts match: 32.80 and 656.00; exactly one QR appears per document. PDF dimensions measure within 0.3 mm of 58 x 200 mm. Forty long-fixture row identifiers occur exactly once. All eight rendered sample pages were visually inspected for clipping, Hindi glyphs, wrapping and page transitions. Short fixture is one page; long fixture seven. No paper was printed and no payment was sent.

Two test-helper corrections were required: waiting for the normal 240 ms modal close animation, and performing real owner PIN re-verification before migration after lock. The PDF text reader uses its Node-compatible legacy build. These were tooling fixes, not waived application checks.

| Pair | Expected and actual evidence |
| --- | --- |
| 01–16 | Frozen 19.99 + 10.01 plus 1.00/1.80 tax prints 32.80; long fixture prints subtotal 600, tax 56 and total 656. Paise/tax regressions pass. |
| 02–16 | Real preview/download/print leave the whole book unchanged. Cancellation and retained callbacks after lock cannot emit output. Existing delayed-write/duplicate-submit failures pass. |
| 03–16 | Both storage modes produce the same geometry, values and decoded QR. Native atomicity/concurrency/quota suites pass; receipt replay projection equals persisted state. |
| 04–16 | Narrow frozen void output survives migration and encrypted fresh restore exactly. Missing/malformed/fenced/interrupted migration suites pass. |
| 05–16 | Reprinting uses frozen shop/name/unit/price facts after current settings change. Old PNG/text and draft/retry tests pass. Legacy ordinary print now uses the original profile. |
| 06–16 | Credit receipt labels original amount due and asks the operator to confirm current balance. Ledger collection/advance/correction/restore tests pass; no printing action changes debt. |
| 07–16 | Returning first line produces a 20.99 note without payment QR or proof-of-refund language. Partial-return/refund/tax/quarantine suites pass. Cancellation prevents stale paid/credit output. |
| 08–16 | Supplier purchases, corrections, returns and payments reconcile after UI changes. New receipt output reads no supplier balances and writes no stock or cash facts. |
| 09–16 | Stock count/quarantine/disposal/reversal suites pass. Printing does not invoke stock actions; the entire book comparison includes stock and adjustment history. |
| 10–16 | Foreign-store receipt access rejects. Frozen branch profile, assignments, partial-transfer/recall, replay and restore suites pass. Current shop settings cannot rewrite historical output. |
| 11–16 | Cash shifts, closing/variance/correction/fixed-close suites pass. Reprinting never creates another sale or cash movement. |
| 12–16 | Printed totals and tax groups match frozen sale facts used by statements; cumulative reconciliation and seven-export journeys pass. Return note distinguishes return value from refund settlement. |
| 13–16 | Preview dialog is keyboard operable and revoked on lock. Actual signup/login/focus/narrow-form suites pass. Hindi glyphs render in the measured samples; no native/AT certification is inferred. |
| 14–16 | Hindi Print/preview/download controls are registered. Financial/recovery translation and typed-amount suites pass. Saved names, historical notes and numeric values remain original. |
| 15–16 | New unit labels appear beside exact quantities; unit-aware sale/restore and conservative voice tests pass. Measured quantity metadata remains frozen and validated. |

All 105 earlier pairs were reopened for shared receipt/UI/cache effects and re-established by the cumulative suites. Matrix: **120 passed automated integration pairs; 345 future planned pairs**.

## Limits and next gate

Failed final automated checks: **None**. Independent reviewer: **None**. No physical printer, driver, disconnect/reconnect, real phone, native review, installed-PWA field acceptance or deployment was exercised. Browser/driver scale and fonts still need qualification on the named device. No purchase, upstream merge or service provisioning. Preserve current encrypted backups before code rewind. Sprint 17 cannot pass without real hardware; independent release-kit preparation may proceed only with its field acceptance still blocked.
