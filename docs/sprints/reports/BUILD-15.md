# BUILD-15 — Selling units and reviewed voice quantities

Status: **built-unverified**. Runtime `7402b39d3e74e322816922e8eb9a9690d2b06655`; predecessor verification `de8670193a4c4fb0ea0301e23f57ff5ac22343d1`. Date: 12 September 2026.

## What changed and why

New inventory items can declare pieces, packs with contents, kilograms, grams, litres or millilitres. Prices and stock use that selling unit. Saved definitions cannot change; existing records retain their historical interpretation. A versioned book marker fences older readers, and new receipts freeze their unit definition. See [quantity and voice contract](../QUANTITY-AND-VOICE.md).

Voice review converts compatible measurements, including 250 g to 0.25 kg and 500 g to two 250 g packs. It rejects fractional packs/pieces, incompatible measurements, missing quantities with measured units and conflicting recognition alternatives. Review shows the original phrase and converted quantity before adding it. Devanagari digits and compact measurements are supported. No microphone recording or real purchase was made.

## Builder checks

- **111 module tests passed**, including 24 synthetic typed corpus cases with exact accepted item/quantity results and rejection of every forbidden case.
- **6 new browser groups passed** in disposable Edge profiles across both repositories: actual item editor, simulated recognition through the real review and checkout UI, immutable unit controls, reload, repository migration/replay and encrypted fresh restore.
- Independently expected result: selling 250 g of a 100-per-kg item leaves 9.75 kg and a bill of 25. Receipt retains kg after reload and restore. Conflicting 250 g/2 kg alternatives create no draft.
- Public build `d47d54e03b72a8f12a5f`, plan and whitespace checks passed; inspected the generated receipt. An initial test caught premature bill-counter mutation on rejected fractional pieces; validation now precedes it.

## Verification handoff and limits

VERIFY-15 must test precision boundaries, transfer compatibility, existing carts and malformed snapshot metadata before reopening all 14 new pairs and shared older contracts. No independent reviewer or recorded-audio accuracy measurement has occurred. Existing items cannot be retrofitted in place; create a new SKU. Native review, physical printer support and real recognition accuracy remain unverified. Git rewind does not downgrade business data; preserve a current encrypted backup and use a compatible reader. No deployment, upstream merge or paid service provisioning.
