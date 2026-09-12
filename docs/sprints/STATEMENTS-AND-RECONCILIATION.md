# Statements, stock history and reconciliation

Reports → Statements provides complete customer, supplier, stock, cash, sales, tax and reconciliation CSV exports. Screen previews are limited to the first 50 accounts/items; exports are not truncated. Archived accounts remain in their historical exports. Reading a statement does not create entries or change records.

## Dates and accounting meaning

Sales, tax and cash use inclusive business-date filters in the store's recorded timezone (Asia/Kolkata until set by cash shifts). Account and stock exports contain their entire available history; the screen explains this distinction. Stored timestamps and canonical IDs are exported separately from display text. Date selection uses timezone conversion rather than assuming every calendar day is 24 hours.

Sales statements retain each original invoice as a positive event and add dated void/return corrections on their actual dates. Later voids do not rewrite an earlier day's statement. Bills without a trustworthy void date are explicitly excluded with a caveat. Legacy invoices without verified line tax allocations retain their recorded aggregate values but are flagged as incompletely reconstructable; their missing rate detail is quantified.

Gross profit means net sales minus net tax minus recorded cost of goods sold. It excludes operating expenses and owner withdrawals, which appear in cash movements. Invoice cost is rounded to paise; costs for successive partial returns allocate the difference between cumulative rounded returned costs, so repeated small returns cannot create extra cost through rounding. Cash period net excludes opening float. Shift reconciliation separately shows physical float, expected till, original/reported closing counts and variance.

The pre-existing sales overview retains its legacy browser-local date/restatement convention. The new Statements screen is the explicit business-date and correction-date view; its dated totals must not be compared to a different legacy window as if the boundaries were identical.

## Stock checkpoint and replay

The owner explicitly starts stock history from current recorded quantities. This creates a checkpoint for every store and subsequently records each committed quantity, unit or archive-state change atomically with its source action. Movements include actor, revision, source references when present, and before/after state. Catalogue/restock changes without an older standalone document remain labelled as such. Merely opening a report does not manufacture earlier history.

Replay checks continuity from the checkpoint through every change and compares the resulting per-item state against the stored stock projection. Transfers record both affected stores when they change. Unit changes remain visible in before/after columns; unlike units are never summed. This journal tracks physical quantities; earlier batch-cost/quarantine evidence remains in original purchases, sales, returns and adjustments. It is not a reconstruction of every historical batch event.

Restore validates the incoming checkpoint/history and replaces the book without inventing new stock movements between the old and restored snapshot. Failure rolls back both source records and history. Checkpoints travel through encrypted backup and optional IndexedDB replay. New stockBook data is rejected by older strict readers; Git rollback does not restore old-format business records.

## Independent calculations and limits

The reconciliation view derives customer/supplier balances from their entries, stock from checkpoint changes, cash from source movements and closing membership, and rate tax from invoice/return lines. It shows exact projection differences and disclosed legacy exceptions. A zero difference proves internal agreement of recorded data, not physical stock accuracy, tax certification or independent external audit. A person controlling local browser storage can rewrite records; this is not a tamper-proof server journal.

Reference shop day: ten purchased units → two net sold + two returned to supplier + one counted loss + four at main store + one at branch. Net sales 210, tax 10, cost 120 and gross profit 80. Customer balance 255; supplier balance 280. Opening cash 500 plus net cash movements -75 gives expected 425; counted 420 gives -5 variance. A next-day credit-sale void is reported on that later day while the original day's statement remains 210.
