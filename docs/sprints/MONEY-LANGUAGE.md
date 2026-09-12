# Money and recovery language contract

Sprint 14 translates explicit source literals for customer advances/corrections, supplier corrections and returns, sale returns/refunds, stock adjustment, cash shifts, reconciliation and encrypted backup/recovery. `js/money-language.js` provides the English/Hindi inventory and uses the existing locale selection. The helper accepts only static source strings, never completed HTML or customer/item names. Field IDs, option values, transaction kinds, amounts and account namespaces remain unchanged.

The typed amount field supplements the existing touch keypad. It rejects malformed numbers and more than two decimal places rather than silently accepting a prefix. Payment, reminder, advance and correction buttons remain keyboard alternatives to gestures. Cancelled/lost-capture swipes no longer open actions; stale swipe contexts are rejected. Existing lock/context cancellation applies to every financial dialog.

CSV headers produced by translated view code follow the selected language; machine record kinds, IDs, numeric values, ISO dates and column order remain unchanged. The complete statement exporter retains its existing English schema. Frozen sales receipts, return/credit-note downloads and recorded notes are preserved rather than retroactively translated.

## Explicit exceptions and owners

| Exception | Owner / completion path |
| --- | --- |
| Native Hindi wording, screen-reader pronunciation and financial terminology approval | Sammarth or a nominated native-speaking shop reviewer; D05 pilot acceptance. Automated checks do not count as native review. |
| Device-specific keyboard, Android/PWA, TalkBack/NVDA and comprehensive large-text acceptance | Pilot/accessibility reviewer, Sprint 18; current desktop browser evidence only. |
| Historical/free-text notes, user-provided names, unit codes, record IDs, timezone IDs and downloaded original documents | Data integrity policy; intentionally preserved. Sprint 15 supplies explicit unit display/conversion. |
| Internal validation/provenance diagnostics and some legacy report/dashboard prose, including rare legacy tax-reconstruction exceptions | Maintaining developer; retain exact diagnostic meaning until explicit translations are reviewed. Common form/recovery errors and current-balance/stock-history warnings are translated. |
| Online provider recovery | Sprint 19; current backup-password recovery is impossible and the Hindi warning says so. |

The inventory is coverage of the new money/recovery slice, not a claim that every source string throughout the app has been translated. No translation changes a financial formula, grants permissions, sends money or sends a reminder automatically. Existing native-language and accessibility qualifications remain experimental until the named reviews are recorded.
