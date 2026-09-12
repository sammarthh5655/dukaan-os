# BUILD-16 — Simulated 58 mm receipts

Status: **built-unverified**. Implementation `d612e386508f4cec304ad2c2791a9de253e47ab4`, final builder runtime **`23a01e7ed657e892318a450218f89ed047e0140b`**; predecessor verification `cd93fea113807aa5c6daf83108cf91df1f2b5aad`. Date: 12 September 2026.

## What changed and why

Added an explicit 58 mm preview to saved sales and returns, with script-free HTML download and browser printing. Proposed printable content is 48 mm with 5 mm side margins on 58 x 200 mm simulated pages. Long English and Hindi names wrap instead of being truncated; item sections, totals and QR remain together across page breaks when they fit. Exact saved prices, discounts, taxes, units and shop profile drive the output. No schema or business-record writes. The existing print fallback now uses the original saved shop profile, fixing a historical-reprint defect. PNG/text fallback remains available.

Credit-sale QR uses the original amount, a four-module quiet zone and at least four simulated 203 dpi dots per module. Paid sales, voids and returns have no payment QR in this format. Oversized payloads show an explicit omission message and UPI ID. Return value is clearly separate from proof of refund. Full dimensions, contracts, sources and reproduction steps are in [THERMAL-RECEIPTS](../THERMAL-RECEIPTS.md).

## Builder evidence

- **119 module tests passed**; **8 new browser groups passed** on both repositories in disposable Edge 152.0.4191.66 profiles.
- Real preview, download and explicit print invocation leave the complete book unchanged. Synthetic mixed-tax total: 19.99 + 10.01 + 1.00 + 1.80 = **32.80**. Return of the first line: **20.99**.
- Independent jsQR 1.4.0 decoding of the 203 dpi screenshot matches the complete original UPI payload, including amount 32.80. No payment service is contacted. The decoder is isolated test tooling, not a runtime dependency.
- Synthetic PDF inspection: short receipt one page; forty mixed Hindi/English long lines across seven pages, every ROW identifier exactly once, total **656.00**. All eight pages were rendered with Poppler and visually inspected; no clipping or missing item sections was found. DOM geometry fits 48 mm. This is simulated output.
- Public build `a93414d27add65f18a44`, plan and whitespace checks passed. Builder checks caught missing Hindi Print registration, excessive QR payload throwing rather than showing the fallback, and the old print profile defect; all fixed. One PDF text-display command hit Windows console encoding; assertions had passed and were rerun successfully with UTF-8.

## Handoff and limits

VERIFY-16 must separately exercise lock/store/void changes while previewing, hostile text, PDF-raster QR decode, persistence/recovery, and all 15 new seam pairs. This builder is the implementer; no independent human reviewer, native-speaker or physical-printer review occurred. Font metrics and driver margins need real-device qualification. No printer was purchased or connected, no money sent, no deployment or upstream merge. Existing business backups remain necessary before any code rewind.
