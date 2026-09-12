# Simulated 58 mm receipts

Open a saved sale or return and choose **58 mm receipt preview**. Preview creates no business record. Download HTML keeps a self-contained, script-free offline copy; Print explicitly opens the existing browser print dialog. The original PNG, text and general print choices remain available.

The layout proposes 58 mm paper, 48 mm content, 5 mm side margins and 200 mm simulated pages. Set the real driver's paper width and 100% scale manually, disable browser headers/footers, and qualify actual margins before shop use. This is a simulation, not supported-printer certification. Long words wrap; item sections, totals and QR blocks request unbroken page placement. A single block taller than a page must be split by the browser rather than discarded. Installed system fonts shape Hindi; native review and another device's font output remain unverified.

The new renderer reads original sale/return prices, tax allocations, units, customer name and receipt profile. Current shop settings do not rewrite a reprint. Legacy records without a profile are explicitly labelled and use a neutral Shop heading. Return notes show the recorded return value and do not claim that a refund has been paid. Existing ordinary printing now also uses the saved shop profile.

Payment QR appears only on a positive original credit sale, with a reminder to confirm the current balance. It is omitted for paid sales, voids and returns. No payment service is called. Payload amount is the original bill amount; later collections are deliberately not represented as a changed historical document. The symbol uses ECC M and a four-module quiet zone. Size is at least 32 mm and expands to keep at least four proposed 203 dpi dots per module, up to 48 mm. Excessive details produce an explicit omission message and printed UPI ID. Historical PNG output is unchanged.

## Reproducing simulated evidence

Run `node --test tests/*.test.cjs` and `node scripts/build-public.cjs`. The Playwright browser test `tests/browser-thermal-receipts.cjs` needs Playwright, Sharp and the independent **jsQR 1.4.0** test decoder. They are test tools, not application dependencies. Set `JSQR_PATH` to the decoder's installation path if it is outside the module search path. Set `BROWSER_CHANNEL=msedge` as appropriate. Optional `RECEIPT_OUTPUT` writes two synthetic PDF/HTML/PNG fixtures; it never reads a live book. Do not use real customer data for these fixtures.

The short fixture totals 19.99 + 10.01 + 1.00 GST + 1.80 GST = **32.80**. Returning the first line records **20.99**. The long fixture repeats the pair twenty times: subtotal **600**, GST **56**, total **656**. All forty ROW identifiers must occur exactly once in extracted PDF text, with no horizontal overflow or dropped item sections. Decode the rendered symbol independently and compare the entire payload, not only whether it looks like a QR.

References: [MDN printing and page rules](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing), [DENSO WAVE four-module quiet zone](https://www.qrcode.com/en/howto/code.html), [jsQR independent decoder](https://github.com/cozmo/jsQR). These guide simulation; physical scan/disconnect/reconnect/driver acceptance belongs to Sprint 17.
