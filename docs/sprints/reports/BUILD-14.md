# BUILD-14 — Hindi financial forms and keyboard recovery

Status: **built-unverified**. Runtime `42e4bd8a564459e2e244c4830e5da37ddbacff92`; predecessor pushed verification `6e653de8f63965c707e8699c2bdb9534df28bbe2`. Date: 12 September 2026.

## What changed and why

Added explicit English/Hindi translations for advances, customer/supplier corrections, returns/refunds, stock counts, cash shifts, reconciliation and encrypted recovery. Source-literal translation preserves user-provided names even when they equal English UI words, such as a customer called Balance and an item called Cash. Machine IDs, selected values and accounting formulas remain unchanged. Added a typed amount field beside the touch keypad, with explicit decimal validation. Cancelled/lost-capture gestures no longer open payment/reminder flows, and stale gesture contexts are ignored.

The inventory, data boundaries, export behavior and untranslated exceptions have named owners in [MONEY-LANGUAGE](../MONEY-LANGUAGE.md). No new book schema. UI CSV headers may follow the chosen language while recorded IDs/kinds, numeric values and column order remain unchanged; complete statement exports retain the existing schema. Frozen receipts and historical notes remain original.

## Builder checks

- **108 module tests passed**, including dictionary references and preservation of input IDs/option values.
- **8 new browser groups passed** on both legacy and IndexedDB storage in disposable Edge 152.0.4191.66 profiles. Real Hindi forms cover a 50 advance, one sale returned/refunded, signed supplier correction -20, stock count, rejected blank close, closing count, encrypted export and fresh restore with a wrong-password rejection first.
- Expected/actual final shop: stock 11, net sales 0, customer debt 150, supplier debt 100, expected cash 550, counted cash 548, variance -2 and zero recorded reconciliation differences. No real payment, purchase or email occurred.
- Public build `224763ed38691009ca54`, plan and whitespace checks passed. Visually inspected the Hindi reconciliation screen; user names Cash, Balance and Supplier remain unchanged.
- The initial browser helper confused two successive password prompts while the earlier one animated out. It now tracks the specific original input; the final run passed. No application checks were waived.

## Verification handoff and limits

VERIFY-14 must independently review this pushed checkpoint as a separate work phase, test typed invalid/valid amounts, lock/cancel every pending form, and reopen all shared UI seams while checking each of the 13 new pairs. Builder verification is self-verification; no independent reviewer or native-speaker review has occurred. Actual assistive-technology/device acceptance and some legacy diagnostics remain explicitly experimental under D05. No deployment or upstream merge. Code rewind requires preserving current backups; it is not a rollback of business records.
